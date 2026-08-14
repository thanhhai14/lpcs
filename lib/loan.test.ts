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

  assert.equal(rows.length, 12);
  assert.equal(totalPrincipal, 120_000_000);
  assert.equal(rows[0].days, 14);
  assert.equal(rows[0].interest, Math.round(120_000_000 * 0.12 * 14 / 365));
  assert.equal(rows.at(-1)?.closingBalance, 0);
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
