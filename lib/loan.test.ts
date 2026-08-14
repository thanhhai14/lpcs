import assert from "node:assert/strict";
import test from "node:test";
import { calculateSchedule, type LoanInput, validateLoanInput } from "./loan.ts";

function input(overrides: Partial<LoanInput> = {}): LoanInput {
  return {
    projectValue: 120_000_000,
    facilityAmount: 120_000_000,
    installments: [
      {
        id: "one",
        name: "Giải ngân",
        dueDate: "2026-01-01",
        amount: 120_000_000,
        ownCapitalAmount: 0,
        bankCapitalAmount: 120_000_000,
        disbursementDate: "2026-01-01",
      },
    ],
    termMonths: 12,
    paymentDay: 15,
    repaymentMethod: "equal_principal",
    principalGraceMonths: 0,
    payPrincipalFirstPeriod: false,
    promotionalRate: 12,
    promotionalMonths: 0,
    postPromotionalRate: 12,
    prepaymentPenaltyRate: 2,
    prepaymentEffect: "reduce_term",
    prepayments: [],
    ...overrides,
  };
}

test("giải ngân một lần trả đủ gốc và tính lãi theo ngày", () => {
  const rows = calculateSchedule(input());
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal + row.prepayment, 0);

  assert.equal(rows.length, 13);
  assert.equal(rows[0].period, 0);
  assert.equal(rows[1].period, 1);
  assert.equal(rows.at(-1)?.period, 12);
  assert.equal(totalPrincipal, 120_000_000);
  assert.equal(rows[0].days, 14);
  assert.equal(rows[0].interest, Math.round(120_000_000 * 0.12 * 14 / 365));
  assert.equal(rows.at(-1)?.closingBalance, 0);
});

test("tùy chọn trả gốc kỳ đầu bắt đầu lịch từ kỳ 1", () => {
  for (const repaymentMethod of ["equal_principal", "annuity"] as const) {
    const rows = calculateSchedule(input({ payPrincipalFirstPeriod: true, repaymentMethod }));
    const totalPrincipal = rows.reduce((sum, row) => sum + row.principal + row.prepayment, 0);

    assert.equal(rows.length, 12, repaymentMethod);
    assert.equal(rows[0].period, 1, repaymentMethod);
    assert.equal(rows[0].days, 14, repaymentMethod);
    assert.ok(rows[0].principal > 0, repaymentMethod);
    if (repaymentMethod === "equal_principal") assert.equal(rows[0].principal, 10_000_000);
    assert.equal(rows.at(-1)?.period, 12, repaymentMethod);
    assert.equal(totalPrincipal, 120_000_000, repaymentMethod);
    assert.equal(rows.at(-1)?.closingBalance, 0, repaymentMethod);
  }
});

test("tùy chọn kỳ đầu không bỏ quy tắc 30 ngày cho đợt giải ngân bổ sung", () => {
  const rows = calculateSchedule(input({
    payPrincipalFirstPeriod: true,
    installments: [
      { id: "old", name: "Đợt đầu", dueDate: "2026-01-01", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-01-01" },
      { id: "new", name: "Đợt bổ sung", dueDate: "2026-02-10", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-02-10" },
    ],
  }));

  assert.equal(rows[0].period, 1);
  assert.equal(rows[0].principal, 5_000_000);
  assert.equal(rows[1].principal, 5_000_000);
  assert.equal(rows[2].principal, 11_000_000);
  assert.equal(rows.reduce((sum, row) => sum + row.principal + row.prepayment, 0), 120_000_000);
});

test("đợt giải ngân sau chỉ phát sinh lãi từ ngày giải ngân", () => {
  const rows = calculateSchedule(input({
    installments: [
      { id: "one", name: "Đợt 1", dueDate: "2026-01-01", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-01-01" },
      { id: "two", name: "Đợt 2", dueDate: "2026-02-10", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-02-10" },
    ],
  }));

  assert.equal(rows[0].disbursed, 60_000_000);
  assert.equal(rows[1].disbursed, 60_000_000);
  assert.ok(rows[1].segments.some((segment) => segment.from === "2026-02-10"));
});

test("gốc cố định được tính từ số tiền thực tế đã giải ngân", () => {
  const actualDisbursement = 480_930_345;
  const rows = calculateSchedule(input({
    projectValue: 600_000_000,
    facilityAmount: 600_000_000,
    installments: [
      { id: "one", name: "Đợt 1", dueDate: "2026-01-01", amount: actualDisbursement, ownCapitalAmount: 0, bankCapitalAmount: actualDisbursement, disbursementDate: "2026-01-01" },
    ],
  }));

  assert.equal(rows[0].principal, 0);
  assert.equal(rows[1].principal, Math.round(actualDisbursement / 12));
  assert.notEqual(rows[1].principal, 50_000_000);
});

test("đợt giải ngân mới dưới 30 ngày chưa trả gốc nhưng đợt cũ vẫn trả", () => {
  const rows = calculateSchedule(input({
    installments: [
      { id: "old", name: "Đợt cũ", dueDate: "2026-01-01", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-01-01" },
      { id: "new", name: "Đợt mới", dueDate: "2026-02-10", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-02-10" },
    ],
  }));

  assert.equal(rows[0].principal, 0);
  assert.equal(rows[1].principal, Math.round(60_000_000 / 12));
  assert.equal(rows[2].principal, Math.round(60_000_000 / 12) + Math.round(60_000_000 / 11));
});

test("khoản giải ngân đủ đúng 30 ngày được bắt đầu trả gốc", () => {
  const rows = calculateSchedule(input({
    installments: [
      { id: "one", name: "Giải ngân", dueDate: "2026-01-16", amount: 120_000_000, ownCapitalAmount: 0, bankCapitalAmount: 120_000_000, disbursementDate: "2026-01-16" },
    ],
  }));

  assert.equal(rows[0].dueDate, "2026-02-15");
  assert.equal(rows[0].days, 30);
  assert.equal(rows[0].principal, 10_000_000);
});

test("annuity chỉ hoãn phần gốc của đợt giải ngân mới dưới 30 ngày", () => {
  const oldOnly = calculateSchedule(input({
    repaymentMethod: "annuity",
    projectValue: 60_000_000,
    facilityAmount: 60_000_000,
    installments: [
      { id: "old", name: "Đợt cũ", dueDate: "2026-01-01", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-01-01" },
    ],
  }));
  const withNewDrawdown = calculateSchedule(input({
    repaymentMethod: "annuity",
    installments: [
      { id: "old", name: "Đợt cũ", dueDate: "2026-01-01", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-01-01" },
      { id: "new", name: "Đợt mới", dueDate: "2026-02-10", amount: 60_000_000, ownCapitalAmount: 0, bankCapitalAmount: 60_000_000, disbursementDate: "2026-02-10" },
    ],
  }));

  assert.equal(withNewDrawdown[1].principal, oldOnly[1].principal);
  assert.ok(withNewDrawdown[1].interest > oldOnly[1].interest);
  assert.ok(withNewDrawdown[2].principal > oldOnly[2].principal);
});

test("annuity trả hết đúng phần vốn đã giải ngân", () => {
  const actualDisbursement = 480_930_345;
  const rows = calculateSchedule(input({
    projectValue: 600_000_000,
    facilityAmount: 600_000_000,
    repaymentMethod: "annuity",
    installments: [
      { id: "one", name: "Đợt 1", dueDate: "2026-01-01", amount: actualDisbursement, ownCapitalAmount: 0, bankCapitalAmount: actualDisbursement, disbursementDate: "2026-01-01" },
    ],
  }));
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);

  assert.equal(totalPrincipal, actualDisbursement);
  assert.equal(rows.at(-1)?.closingBalance, 0);
});

test("tổng gốc toàn lịch luôn bằng tổng nhiều đợt giải ngân", () => {
  const firstDrawdown = 50_123_456;
  const secondDrawdown = 70_654_321;
  const totalDisbursed = firstDrawdown + secondDrawdown;

  for (const repaymentMethod of ["equal_principal", "annuity"] as const) {
    const rows = calculateSchedule(input({
      projectValue: totalDisbursed,
      facilityAmount: totalDisbursed,
      repaymentMethod,
      installments: [
        { id: "one", name: "Đợt 1", dueDate: "2026-01-01", amount: firstDrawdown, ownCapitalAmount: 0, bankCapitalAmount: firstDrawdown, disbursementDate: "2026-01-01" },
        { id: "two", name: "Đợt 2", dueDate: "2026-02-10", amount: secondDrawdown, ownCapitalAmount: 0, bankCapitalAmount: secondDrawdown, disbursementDate: "2026-02-10" },
      ],
    }));
    const totalPrincipal = rows.reduce((sum, row) => sum + row.principal + row.prepayment, 0);

    assert.equal(totalPrincipal, totalDisbursed, repaymentMethod);
    assert.equal(rows.at(-1)?.closingBalance, 0, repaymentMethod);
  }
});

test("trả trước giảm dư nợ và phí không được trừ vào gốc", () => {
  const rows = calculateSchedule(input({
    prepayments: [{ id: "prepay", date: "2026-03-15", amount: 20_000_000 }],
  }));
  const march = rows.find((row) => row.dueDate === "2026-03-15");

  assert.ok(march);
  assert.equal(march.prepayment, 20_000_000);
  assert.equal(march.prepaymentPenalty, 400_000);
  assert.equal(march.totalCashflow, march.scheduledPayment + 20_000_000 + 400_000);
});

test("cảnh báo khi vốn ngân hàng vượt hạn mức", () => {
  const validation = validateLoanInput(input({ facilityAmount: 100_000_000 }));

  assert.equal(validation.remainingFacility, 0);
  assert.ok(validation.errors.includes("Tổng vốn ngân hàng đã vượt hạn mức vay dự kiến."));
});
