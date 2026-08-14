import type { Cell, SheetData } from "write-excel-file/browser";
import type { LoanInput, ScheduleRow } from "./loan";

type ExportLoanWorkbookInput = {
  bankName: string;
  input: LoanInput;
  schedule: ScheduleRow[];
};

const DARK = "#10483e";
const ACCENT = "#c5df6f";
const LIGHT = "#eff5f2";
const ZEBRA = "#f2f5f3";
const BORDER = "#d9e2de";
const MONEY_FORMAT = '#,##0 "₫"';

function excelDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateStamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value: number): Cell {
  return { value, type: Number, format: MONEY_FORMAT, align: "right" };
}

function date(value: Date, withTime = false): Cell {
  return { value, type: Date, format: withTime ? "dd/mm/yyyy hh:mm" : "dd/mm/yyyy" };
}

function label(value: string): Cell {
  return { value, fontWeight: "bold", textColor: "#42605d", backgroundColor: LIGHT, borderColor: BORDER, bottomBorderStyle: "hair", wrap: true };
}

function header(value: string): Cell {
  return { value, fontWeight: "bold", textColor: DARK, backgroundColor: ACCENT, borderColor: "#9fbf54", borderStyle: "thin", align: "center", alignVertical: "center", wrap: true, height: 30 };
}

function title(value: string, columnSpan: number): Cell {
  return { value, columnSpan, fontWeight: "bold", fontSize: 17, textColor: "#ffffff", backgroundColor: DARK, align: "center", alignVertical: "center", height: 34 };
}

function stripedRow(cells: Cell[], rowIndex: number): Cell[] {
  const backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : ZEBRA;
  return cells.map((cell) => ({ ...cell, backgroundColor, borderColor: BORDER, bottomBorderStyle: "hair" }));
}

function repaymentLabel(method: LoanInput["repaymentMethod"]) {
  return method === "annuity" ? "Trả góp đều (Annuity)" : "Gốc cố định, lãi giảm dần";
}

export async function exportLoanWorkbook({ bankName, input, schedule }: ExportLoanWorkbookInput) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const generatedAt = new Date();
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPrepayment = schedule.reduce((sum, row) => sum + row.prepayment, 0);
  const totalPenalty = schedule.reduce((sum, row) => sum + row.prepaymentPenalty, 0);
  const totalCashflow = schedule.reduce((sum, row) => sum + row.totalCashflow, 0);
  const bankTotal = input.installments.reduce((sum, item) => sum + item.bankCapitalAmount, 0);
  const ownCapitalTotal = input.installments.reduce((sum, item) => sum + item.ownCapitalAmount, 0);
  const installmentTotal = input.installments.reduce((sum, item) => sum + item.amount, 0);
  const payments = schedule.map((row) => row.scheduledPayment);
  const interests = schedule.map((row) => row.interest);
  const maxPayment = payments.length ? Math.max(...payments) : 0;
  const averagePayment = payments.length ? Math.round(payments.reduce((sum, value) => sum + value, 0) / payments.length) : 0;
  const minPayment = payments.length ? Math.min(...payments) : 0;
  const maxInterest = interests.length ? Math.max(...interests) : 0;
  const averageInterest = interests.length ? Math.round(totalInterest / interests.length) : 0;
  const minInterest = interests.length ? Math.min(...interests) : 0;

  const overview: SheetData = [
    [title("LPCS — TỔNG QUAN KHOẢN VAY", 4), null, null, null],
    [label("Ngày lập báo cáo"), date(generatedAt, true), label("Ngân hàng"), bankName.trim() || "Chưa nhập"],
    [label("Giá trị dự án"), money(input.projectValue), label("Hạn mức vay"), money(input.facilityAmount)],
    [label("Vốn ngân hàng đã phân bổ"), money(bankTotal), label("Thời hạn vay"), `${input.termMonths} tháng`],
    [label("Phương thức trả nợ"), repaymentLabel(input.repaymentMethod), label("Ngày trả nợ"), `Ngày ${input.paymentDay} hàng tháng`],
    [label("Xử lý kỳ đầu"), input.payPrincipalFirstPeriod ? "Trả gốc và lãi (Kỳ 01)" : "Chỉ trả lãi nếu chưa đủ 30 ngày (Kỳ 00)", label("Ân hạn gốc"), `${input.principalGraceMonths} tháng`],
    [label("Phí trả trước"), { value: input.prepaymentPenaltyRate / 100, type: Number, format: "0.0%" }, label("Quy ước tính lãi"), "Actual/365"],
    [label("Lãi suất ưu đãi"), { value: input.promotionalRate / 100, type: Number, format: "0.0%" }, label("Thời gian ưu đãi"), `${input.promotionalMonths} tháng`],
    [label("Lãi sau ưu đãi (dự kiến)"), { value: input.postPromotionalRate / 100, type: Number, format: "0.0%" }, null, null],
    [label("Tổng lãi dự kiến"), money(totalInterest), label("Tổng gốc trả trước"), money(totalPrepayment)],
    [label("Tổng phí trả trước"), money(totalPenalty), label("Tổng dòng tiền trả ngân hàng"), money(totalCashflow)],
    [label("Trả nợ cao nhất trong kỳ"), money(maxPayment), label("Tiền lãi cao nhất trong kỳ"), money(maxInterest)],
    [label("Trả nợ trung bình hàng tháng"), money(averagePayment), label("Tiền lãi trung bình hàng tháng"), money(averageInterest)],
    [label("Trả nợ thấp nhất trong kỳ"), money(minPayment), label("Tiền lãi thấp nhất trong kỳ"), money(minInterest)],
    [{ value: "Các chỉ số trả nợ trên là gốc + lãi định kỳ, không gồm trả trước và phí.", columnSpan: 4, fontStyle: "italic", textColor: "#6d817d", fontSize: 9 }, null, null, null],
    [null, null, null, null],
    [{ ...title("KẾ HOẠCH GIẢI NGÂN", 4), fontSize: 11, align: "left", height: 25 }, null, null, null],
    [header("Đợt thanh toán"), header("Ngày thanh toán CĐT"), header("Ngân hàng giải ngân"), header("Ngày giải ngân")],
    ...input.installments.filter((item) => item.bankCapitalAmount > 0).map((item) => [
      item.name,
      item.dueDate ? date(excelDate(item.dueDate)) : "",
      money(item.bankCapitalAmount),
      item.disbursementDate ? date(excelDate(item.disbursementDate)) : "",
    ] as Cell[]),
    [null, null, null, null],
    [{ value: "Kết quả mang tính tham khảo. Số liệu thực tế phụ thuộc ngày hạch toán, quy tắc làm tròn và điều khoản của ngân hàng.", columnSpan: 4, fontStyle: "italic", textColor: "#6d817d", fontSize: 9, wrap: true }, null, null, null],
  ];

  const scheduleHeaders = ["Kỳ", "Ngày đến hạn", "Số ngày", "Dư nợ đầu kỳ", "Giải ngân trong kỳ", "Gốc định kỳ", "Lãi", "Gốc + lãi", "Trả trước", "Phí trả trước", "Tổng thực trả", "Dư nợ cuối kỳ"];
  const installmentHeaders = ["Đợt thanh toán", "Ngày thanh toán CĐT", "Giá trị đợt", "Vốn tự có", "Vốn ngân hàng", "Ngày giải ngân"];
  const installmentData: SheetData = [
    [title("LPCS — TIẾN ĐỘ THANH TOÁN DỰ ÁN", 6), ...Array<Cell | null>(5).fill(null)],
    installmentHeaders.map(header),
    ...input.installments.map((item, index) => stripedRow([
      { value: item.name || "Chưa đặt tên" },
      item.dueDate ? date(excelDate(item.dueDate)) : { value: "Chưa nhập" },
      money(item.amount),
      money(item.ownCapitalAmount),
      money(item.bankCapitalAmount),
      item.bankCapitalAmount > 0 && item.disbursementDate ? date(excelDate(item.disbursementDate)) : { value: "—" },
    ], index)),
    [
      { value: "TỔNG", columnSpan: 2, fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK }, null,
      { ...money(installmentTotal), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(ownCapitalTotal), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(bankTotal), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { value: "", backgroundColor: DARK },
    ],
  ];
  const scheduleData: SheetData = [
    [title("LPCS — LỊCH TRẢ NỢ DỰ KIẾN", 12), ...Array<Cell | null>(11).fill(null)],
    scheduleHeaders.map(header),
    ...schedule.map((item, index) => stripedRow([
      { value: item.period, type: Number }, date(excelDate(item.dueDate)), { value: item.days, type: Number }, money(item.openingBalance), money(item.disbursed),
      money(item.principal), money(item.interest), money(item.scheduledPayment), money(item.prepayment),
      money(item.prepaymentPenalty), money(item.totalCashflow), money(item.closingBalance),
    ], index)),
    [
      { value: "TỔNG", columnSpan: 3, fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK }, null, null, null, null,
      { ...money(schedule.reduce((sum, row) => sum + row.principal, 0)), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(totalInterest), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(schedule.reduce((sum, row) => sum + row.scheduledPayment, 0)), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(totalPrepayment), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(totalPenalty), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { ...money(totalCashflow), fontWeight: "bold", textColor: "#ffffff", backgroundColor: DARK },
      { value: "", backgroundColor: DARK },
    ],
  ];

  await writeExcelFile([
    {
      data: overview,
      sheet: "Tổng quan",
      columns: [{ width: 29 }, { width: 24 }, { width: 29 }, { width: 24 }],
      showGridLines: false,
      zoomScale: 0.9,
    },
    {
      data: installmentData,
      sheet: "Tiến độ dự án",
      columns: [28, 20, 20, 20, 20, 18].map((width) => ({ width })),
      stickyRowsCount: 2,
      showGridLines: false,
      orientation: "landscape",
      zoomScale: 0.9,
    },
    {
      data: scheduleData,
      sheet: "Lịch trả nợ",
      columns: [8, 14, 10, 19, 19, 18, 17, 18, 17, 16, 19, 19].map((width) => ({ width })),
      stickyRowsCount: 2,
      showGridLines: false,
      orientation: "landscape",
      zoomScale: 0.8,
    },
  ], { fontFamily: "Calibri", fontSize: 10 }).toFile(`lpcs_lich-tra-no_${localDateStamp(generatedAt)}.xlsx`);
}
