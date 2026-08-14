"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateSchedule,
  type LoanInput,
  type Prepayment,
  type ProjectInstallment,
  validateLoanInput,
} from "@/lib/loan";
import { exportLoanWorkbook } from "@/lib/exportExcel";
import { formatCompactCurrency, formatCurrency, formatDate, moneyInput, parseMoney } from "@/lib/format";

type IconName = "arrow" | "bank" | "calendar" | "chevron" | "download" | "info" | "plus" | "printer" | "trash" | "wallet";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bank: <><path d="m3 10 9-6 9 6" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" /></>,
    calendar: <><path d="M6 2v3M18 2v3M3 8h18" /><rect x="3" y="4" width="18" height="18" rx="2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    printer: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="7" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12v3" /><path d="M15 12h5M15 12v4h5" /></>,
  };
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function MoneyField({ id, value, onChange, describedBy, hideSuffix = false }: { id: string; value: number; onChange: (value: number) => void; describedBy?: string; hideSuffix?: boolean }) {
  return (
    <div className="money-field">
      <input id={id} name={id} autoComplete="off" inputMode="numeric" value={moneyInput(value)} onChange={(event) => onChange(parseMoney(event.target.value))} aria-describedby={describedBy} />
      {!hideSuffix && <span>₫</span>}
    </div>
  );
}

function NumberField({ id, name, value, onChange, min, max, step, suffix, disabled = false }: { id?: string; name: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; suffix?: string; disabled?: boolean }) {
  const [draft, setDraft] = useState(String(value));
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setDraft(String(value));
  }, [value]);

  const commit = () => {
    editing.current = false;
    const parsed = draft.trim() === "" ? 0 : Number(draft);
    const safeValue = Number.isFinite(parsed)
      ? Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, parsed))
      : value;
    setDraft(String(safeValue));
    onChange(safeValue);
  };

  return <div className={`suffix-field${disabled ? " is-disabled" : ""}`}><input id={id} name={name} autoComplete="off" type="number" min={min} max={max} step={step} value={draft} disabled={disabled} onFocus={() => { editing.current = true; }} onChange={(event) => { const nextDraft = event.target.value; setDraft(nextDraft); if (nextDraft !== "" && Number.isFinite(Number(nextDraft))) onChange(Number(nextDraft)); }} onBlur={commit} />{suffix && <span>{suffix}</span>}</div>;
}

const initialInstallments: ProjectInstallment[] = [
  { id: "dot-1", name: "Ký HĐMB", dueDate: "2026-09-15", amountMode: "percentage", percentage: 25, amount: 750_000_000, ownCapitalAmount: 750_000_000, bankCapitalAmount: 0, disbursementDate: "" },
  { id: "dot-2", name: "Đợt 2", dueDate: "2026-12-15", amountMode: "percentage", percentage: 45, amount: 1_350_000_000, ownCapitalAmount: 0, bankCapitalAmount: 1_350_000_000, disbursementDate: "2026-12-12" },
  { id: "dot-3", name: "Đợt 3", dueDate: "2027-03-15", amountMode: "percentage", percentage: 25, amount: 750_000_000, ownCapitalAmount: 300_000_000, bankCapitalAmount: 450_000_000, disbursementDate: "2027-03-12" },
  { id: "dot-4", name: "Đợt 4", dueDate: "2027-06-15", amountMode: "percentage", percentage: 5, amount: 150_000_000, ownCapitalAmount: 150_000_000, bankCapitalAmount: 0, disbursementDate: "" },
];

const initialInput: LoanInput = {
  projectValue: 3_000_000_000,
  facilityAmount: 1_800_000_000,
  installments: initialInstallments,
  termMonths: 120,
  paymentDay: 15,
  repaymentMethod: "equal_principal",
  principalGraceMonths: 0,
  payPrincipalFirstPeriod: false,
  promotionalRate: 7.5,
  promotionalMonths: 12,
  postPromotionalRate: 10.5,
  prepaymentPenaltyRate: 1,
  prepaymentEffect: "reduce_payment",
  prepayments: [],
};

const STORAGE_KEY = "ke-hoach-vay:inputs:v1";
const numericLoanFields = ["projectValue", "facilityAmount", "termMonths", "paymentDay", "principalGraceMonths", "promotionalRate", "promotionalMonths", "postPromotionalRate", "prepaymentPenaltyRate"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStoredInstallment(value: unknown): value is ProjectInstallment {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.dueDate === "string"
    && typeof value.disbursementDate === "string"
    && Number.isFinite(value.amount)
    && Number.isFinite(value.ownCapitalAmount)
    && Number.isFinite(value.bankCapitalAmount)
    && (value.amountMode === undefined || value.amountMode === "amount" || value.amountMode === "percentage")
    && (value.percentage === undefined || Number.isFinite(value.percentage));
}

function isStoredPrepayment(value: unknown): value is Prepayment {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.date === "string"
    && Number.isFinite(value.amount);
}

function parseStoredState(raw: string): { input: LoanInput; bankName: string } | null {
  try {
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored) || stored.version !== 1 || typeof stored.bankName !== "string" || !isRecord(stored.input)) return null;
    const candidate = stored.input;
    if (!numericLoanFields.every((key) => Number.isFinite(candidate[key]))) return null;
    if (candidate.repaymentMethod !== "equal_principal" && candidate.repaymentMethod !== "annuity") return null;
    if (candidate.prepaymentEffect !== "reduce_payment" && candidate.prepaymentEffect !== "reduce_term") return null;
    if (!Array.isArray(candidate.installments) || candidate.installments.length === 0 || !candidate.installments.every(isStoredInstallment)) return null;
    if (!Array.isArray(candidate.prepayments) || !candidate.prepayments.every(isStoredPrepayment)) return null;
    const payPrincipalFirstPeriod = candidate.payPrincipalFirstPeriod === true;
    return {
      input: {
        ...(candidate as unknown as LoanInput),
        payPrincipalFirstPeriod,
        principalGraceMonths: payPrincipalFirstPeriod ? 0 : Number(candidate.principalGraceMonths),
      },
      bankName: stored.bankName,
    };
  } catch {
    return null;
  }
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resizeInstallment(item: ProjectInstallment, amount: number): ProjectInstallment {
  const safeAmount = Math.max(0, Math.round(amount));
  const bankRatio = item.amount > 0 ? item.bankCapitalAmount / item.amount : 0;
  const bankCapitalAmount = Math.min(safeAmount, Math.round(safeAmount * bankRatio));
  return { ...item, amount: safeAmount, bankCapitalAmount, ownCapitalAmount: safeAmount - bankCapitalAmount };
}

export function LoanCalculator() {
  const [input, setInput] = useState<LoanInput>(initialInput);
  const [bankName, setBankName] = useState("Ngân hàng dự kiến");
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(1);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const validation = useMemo(() => validateLoanInput(input), [input]);
  const schedule = useMemo(() => calculateSchedule(input), [input]);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(schedule.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleSchedule = schedule.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totals = useMemo(
    () => schedule.reduce((result, row) => ({ interest: result.interest + row.interest, penalty: result.penalty + row.prepaymentPenalty, cashflow: result.cashflow + row.totalCashflow }), { interest: 0, penalty: 0, cashflow: 0 }),
    [schedule],
  );
  const statistics = useMemo(() => {
    if (schedule.length === 0) return { maxPayment: 0, averagePayment: 0, minPayment: 0, maxInterest: 0, averageInterest: 0, minInterest: 0 };
    const payments = schedule.map((row) => row.scheduledPayment);
    const interests = schedule.map((row) => row.interest);
    return {
      maxPayment: Math.max(...payments),
      averagePayment: Math.round(payments.reduce((sum, value) => sum + value, 0) / payments.length),
      minPayment: Math.min(...payments),
      maxInterest: Math.max(...interests),
      averageInterest: Math.round(interests.reduce((sum, value) => sum + value, 0) / interests.length),
      minInterest: Math.min(...interests),
    };
  }, [schedule]);
  const reportReady = schedule.length > 0 && validation.errors.length === 0;
  const reportDate = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let stored: ReturnType<typeof parseStoredState> = null;
      try {
        stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY) ?? "");
      } catch {
        // Reading storage can be blocked by the browser's privacy settings.
      }
      if (stored) {
        setInput(stored.input);
        setBankName(stored.bankName);
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, input, bankName }));
      } catch {
        // Storage can be unavailable in private browsing or when its quota is full.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [bankName, input, storageReady]);

  const handleExportExcel = async () => {
    if (!reportReady || isExporting) return;
    setIsExporting(true);
    setExportError("");
    try {
      await exportLoanWorkbook({ bankName, input, schedule });
    } catch (error) {
      console.error(error);
      setExportError("Không thể tạo tệp Excel. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateInstallment = (id: string, patch: Partial<ProjectInstallment>) => {
    setInput((current) => ({ ...current, installments: current.installments.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  };

  const updateProjectValue = (projectValue: number) => {
    setInput((current) => ({
      ...current,
      projectValue,
      installments: current.installments.map((item) => item.amountMode === "percentage"
        ? resizeInstallment(item, projectValue * ((item.percentage ?? 0) / 100))
        : item),
    }));
  };

  const availableFacilityFor = (itemId: string) => {
    const usedByOtherInstallments = input.installments.reduce(
      (sum, item) => sum + (item.id === itemId ? 0 : item.bankCapitalAmount),
      0,
    );
    return Math.max(0, input.facilityAmount - usedByOtherInstallments);
  };

  const updateInstallmentAmount = (item: ProjectInstallment, amount: number) => {
    setInput((current) => ({
      ...current,
      installments: current.installments.map((candidate) => candidate.id === item.id ? resizeInstallment(candidate, amount) : candidate),
    }));
  };

  const updateInstallmentPercentage = (item: ProjectInstallment, percentage: number) => {
    const safePercentage = Math.min(100, Math.max(0, percentage));
    updateInstallment(item.id, {
      ...resizeInstallment(item, input.projectValue * (safePercentage / 100)),
      amountMode: "percentage",
      percentage: safePercentage,
    });
  };

  const setInstallmentAmountMode = (item: ProjectInstallment, amountMode: "amount" | "percentage") => {
    updateInstallment(item.id, {
      amountMode,
      percentage: amountMode === "percentage"
        ? Number(((item.amount / Math.max(1, input.projectValue)) * 100).toFixed(2))
        : item.percentage,
    });
  };

  const updateBankCapital = (item: ProjectInstallment, requestedAmount: number) => {
    const bankCapitalAmount = Math.min(item.amount, availableFacilityFor(item.id), Math.max(0, requestedAmount));
    updateInstallment(item.id, {
      bankCapitalAmount,
      ownCapitalAmount: item.amount - bankCapitalAmount,
      disbursementDate: bankCapitalAmount > 0 ? item.disbursementDate || item.dueDate : "",
    });
  };

  const setFundingMode = (item: ProjectInstallment, mode: "own" | "bank" | "mixed") => {
    if (mode === "own") updateInstallment(item.id, { ownCapitalAmount: item.amount, bankCapitalAmount: 0, disbursementDate: "" });
    if (mode === "bank") updateBankCapital(item, item.amount);
    if (mode === "mixed") updateBankCapital(item, Math.min(Math.round(item.amount / 2), availableFacilityFor(item.id)));
  };

  const addInstallment = () => {
    setInput((current) => ({ ...current, installments: [...current.installments, { id: nextId("dot"), name: `Đợt ${current.installments.length + 1}`, dueDate: "", amountMode: "amount", amount: 0, ownCapitalAmount: 0, bankCapitalAmount: 0, disbursementDate: "" }] }));
  };

  const addPrepayment = () => {
    setInput((current) => ({ ...current, prepayments: [...current.prepayments, { id: nextId("tra-truoc"), date: "", amount: 0 }] }));
  };

  const updatePrepayment = (id: string, patch: Partial<Prepayment>) => {
    setInput((current) => ({ ...current, prepayments: current.prepayments.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  };

  const removeInstallment = (item: ProjectInstallment) => {
    if (window.confirm(`Xóa “${item.name}” khỏi tiến độ thanh toán?`)) {
      setInput((current) => ({ ...current, installments: current.installments.filter((candidate) => candidate.id !== item.id) }));
    }
  };

  const removePrepayment = (item: Prepayment, index: number) => {
    if (window.confirm(`Xóa kế hoạch trả trước lần ${index + 1}?`)) {
      setInput((current) => ({ ...current, prepayments: current.prepayments.filter((candidate) => candidate.id !== item.id) }));
    }
  };

  return (
    <>
      <a className="skip-link" href="#calculator-main">Bỏ qua phần đầu, đến nội dung chính</a>
      <main id="calculator-main">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Kế hoạch vay — về đầu trang">
            <span className="brand-mark"><Icon name="bank" size={20} /></span>
            <span>Kế hoạch vay</span>
          </a>
          <div className="topbar-meta"><span className="status-dot" /> Tự động lưu dữ liệu trên thiết bị này</div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <span className="eyebrow">Ứng dụng lập kế hoạch vay</span>
            <h1>Tính toán từng đồng<br />trước khi đặt bút vay.</h1>
            <p>Kế hoạch vay giúp bạn xây dựng tiến độ thanh toán, phân bổ vốn tự có và vốn ngân hàng, đồng thời theo dõi chi tiết nghĩa vụ trả nợ theo từng tháng.</p>
          </div>
          <div className="hero-ledger" aria-label="Tóm tắt kế hoạch">
            <div><span>Giá trị dự án</span><strong>{formatCurrency(input.projectValue)}</strong></div>
            <div><span>Vốn ngân hàng / hạn mức</span><strong>{formatCompactCurrency(validation.bankTotal)} / {formatCompactCurrency(input.facilityAmount)}</strong></div>
            <div><span>Thời hạn dự kiến</span><strong>{input.termMonths} tháng</strong></div>
          </div>
        </section>

        <div className="workspace">
          <section className="panel setup-panel" aria-labelledby="project-title">
            <div className="section-heading">
              <div><span className="section-kicker">01 / Thông tin chung</span><h2 id="project-title">Thiết lập khoản vay</h2></div>
              <span className="section-icon"><Icon name="wallet" /></span>
            </div>
            <div className="form-grid">
              <label className="field"><span>Giá trị dự án</span><MoneyField id="project-value" value={input.projectValue} onChange={updateProjectValue} /><small>Tổng nghĩa vụ thanh toán với chủ đầu tư.</small></label>
              <label className="field"><span>Hạn mức ngân hàng cho vay</span><MoneyField id="facility-amount" value={input.facilityAmount} onChange={(facilityAmount) => setInput({ ...input, facilityAmount })} /><small>Còn có thể phân bổ {formatCurrency(validation.remainingFacility)}.</small></label>
              <label className="field"><span>Ngân hàng</span><input name="bank-name" autoComplete="off" placeholder="Ví dụ: Vietcombank…" value={bankName} onChange={(event) => setBankName(event.target.value)} /></label>
              <label className="field"><span>Thời hạn vay</span><NumberField name="loan-term" value={input.termMonths} min={1} max={480} onChange={(termMonths) => setInput({ ...input, termMonths })} suffix="tháng" /></label>
              <label className="field"><span>Ngày trả nợ hàng tháng</span><NumberField name="payment-day" value={input.paymentDay} min={1} max={31} onChange={(paymentDay) => setInput({ ...input, paymentDay: Math.min(31, Math.max(1, paymentDay)) })} suffix="hàng tháng" /></label>
              <label className="field"><span>Phương thức trả nợ</span><select name="repayment-method" autoComplete="off" value={input.repaymentMethod} onChange={(event) => setInput({ ...input, repaymentMethod: event.target.value as LoanInput["repaymentMethod"] })}><option value="equal_principal">Gốc cố định, lãi giảm dần</option><option value="annuity">Trả góp đều (Annuity)</option></select><small>Gốc cố định: phần gốc đều, tổng trả giảm dần.<br />Annuity: tổng trả gần đều.</small></label>
              <label className="field"><span>Ân hạn gốc</span><NumberField name="grace-months" value={input.principalGraceMonths} min={0} max={Math.max(0, input.termMonths - 1)} disabled={input.payPrincipalFirstPeriod} onChange={(principalGraceMonths) => setInput({ ...input, principalGraceMonths })} suffix="tháng" /></label>
              <label className="first-period-option field-wide">
                <input
                  name="pay-principal-first-period"
                  type="checkbox"
                  checked={input.payPrincipalFirstPeriod}
                  onChange={(event) => setInput({
                    ...input,
                    payPrincipalFirstPeriod: event.target.checked,
                    principalGraceMonths: event.target.checked ? 0 : input.principalGraceMonths,
                  })}
                />
                <span><strong>Trả gốc ngay kỳ đầu tiên</strong><small>Bật khi ngân hàng cho phép trả gốc dù kỳ đầu chưa đủ 30 ngày. Lịch sẽ bắt đầu từ Kỳ 01.</small></span>
              </label>
            </div>
          </section>

          <aside className="panel rate-panel" aria-labelledby="rate-title">
            <div className="section-heading compact"><div><span className="section-kicker">02 / Lãi suất</span><h2 id="rate-title">Điều kiện ngân hàng</h2></div></div>
            <div className="rate-grid">
              <label className="field"><span>Lãi suất ưu đãi</span><NumberField name="promotional-rate" value={input.promotionalRate} min={0} step={0.1} onChange={(promotionalRate) => setInput({ ...input, promotionalRate })} suffix="%/năm" /></label>
              <label className="field"><span>Thời gian ưu đãi</span><NumberField name="promotional-months" value={input.promotionalMonths} min={0} onChange={(promotionalMonths) => setInput({ ...input, promotionalMonths })} suffix="tháng" /></label>
              <label className="field"><span>Lãi sau ưu đãi</span><NumberField name="post-promotional-rate" value={input.postPromotionalRate} min={0} step={0.1} onChange={(postPromotionalRate) => setInput({ ...input, postPromotionalRate })} suffix="%/năm" /><small>Mức lãi dự kiến, có thể thay đổi theo chính sách ngân hàng.</small></label>
            </div>
            <div className="formula-note"><Icon name="info" size={16} /><span>Lãi tính trên dư nợ thực tế theo ngày (Actual/365). Mỗi khoản giải ngân bắt đầu trả gốc tại kỳ cách ngày giải ngân ít nhất 30 ngày, trừ lần giải ngân đầu khi bật tùy chọn trả gốc kỳ đầu.</span></div>
          </aside>
        </div>

        <section className="panel installments-panel" aria-labelledby="installment-title">
          <div className="section-heading">
            <div><span className="section-kicker">03 / Tiến độ dự án</span><h2 id="installment-title">Các đợt thanh toán cho chủ đầu tư</h2><p>Chọn nguồn vốn cho từng mốc. Chỉ phần ngân hàng giải ngân mới phát sinh lãi.</p></div>
          </div>

          <div className="funding-bar" aria-label="Cơ cấu nguồn vốn">
            <div className="funding-bar-track"><span className="own" style={{ width: `${validation.installmentTotal ? (validation.ownCapitalTotal / validation.installmentTotal) * 100 : 0}%` }} /><span className="bank" style={{ width: `${validation.installmentTotal ? (validation.bankTotal / validation.installmentTotal) * 100 : 0}%` }} /></div>
            <div className="funding-legend"><span><i className="legend-own" /> Vốn tự có <strong>{formatCompactCurrency(validation.ownCapitalTotal)}</strong></span><span><i className="legend-bank" /> Ngân hàng <strong>{formatCompactCurrency(validation.bankTotal)}</strong></span><span className="funding-total">Đã phân bổ {input.projectValue ? Math.round((validation.installmentTotal / input.projectValue) * 100) : 0}%</span></div>
          </div>

          <div className="installment-list">
            {input.installments.map((item, index) => {
              const isOwn = item.bankCapitalAmount === 0;
              const isBank = item.ownCapitalAmount === 0 && item.bankCapitalAmount > 0;
              const mode = isOwn ? "own" : isBank ? "bank" : "mixed";
              const amountMode = item.amountMode ?? "amount";
              const availableFacility = availableFacilityFor(item.id);
              const maxBankForInstallment = Math.min(item.amount, availableFacility);
              return (
                <article className="installment-card" key={item.id}>
                  <div className="installment-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
                  <div className="installment-content">
                    <div className="installment-topline">
                      <label className="field"><span>Tên đợt</span><input name={`installment-name-${item.id}`} autoComplete="off" value={item.name} onChange={(event) => updateInstallment(item.id, { name: event.target.value })} /></label>
                      <label className="field"><span>Ngày thanh toán CĐT</span><input name={`installment-date-${item.id}`} autoComplete="off" type="date" value={item.dueDate} onChange={(event) => updateInstallment(item.id, { dueDate: event.target.value })} /></label>
                      <div className="field installment-amount-field">
                        <label htmlFor={`amount-${item.id}`}>Giá trị đợt</label>
                        <div className="amount-entry">
                          {amountMode === "percentage"
                            ? <NumberField id={`amount-${item.id}`} name={`amount-${item.id}`} value={item.percentage ?? 0} min={0} max={100} step={0.1} onChange={(percentage) => updateInstallmentPercentage(item, percentage)} />
                            : <MoneyField id={`amount-${item.id}`} value={item.amount} onChange={(amount) => updateInstallmentAmount(item, amount)} hideSuffix />}
                          <div className="amount-mode-switch" role="group" aria-label={`Cách nhập giá trị ${item.name}`}>
                            <button type="button" className={amountMode === "percentage" ? "active" : ""} onClick={() => setInstallmentAmountMode(item, "percentage")}>%</button>
                            <button type="button" className={amountMode === "amount" ? "active" : ""} onClick={() => setInstallmentAmountMode(item, "amount")}>VNĐ</button>
                          </div>
                        </div>
                        <small>{amountMode === "percentage" ? `Tương đương ${formatCurrency(item.amount)}` : `Chiếm ${input.projectValue ? ((item.amount / input.projectValue) * 100).toFixed(1) : 0}% giá trị dự án`}</small>
                      </div>
                      <button className="icon-button danger" aria-label={`Xóa ${item.name}`} type="button" disabled={input.installments.length === 1} onClick={() => removeInstallment(item)}><Icon name="trash" size={17} /></button>
                    </div>
                    <div className="funding-mode" role="group" aria-label={`Nguồn vốn ${item.name}`}>
                      <button type="button" className={mode === "own" ? "active" : ""} onClick={() => setFundingMode(item, "own")}>Vốn tự có</button>
                      <button type="button" className={mode === "bank" ? "active" : ""} onClick={() => setFundingMode(item, "bank")}>Ngân hàng</button>
                      <button type="button" className={mode === "mixed" ? "active" : ""} onClick={() => setFundingMode(item, "mixed")}>Kết hợp</button>
                    </div>
                    {mode !== "own" && <div className="funding-details">
                      {mode === "mixed" && <div className="field"><span>Vốn tự có (tự tính)</span><output className="calculated-value">{formatCurrency(item.ownCapitalAmount)}</output><small>Tự tính sau khi nhập số tiền ngân hàng giải ngân.</small></div>}
                      <div className="field bank-allocation-field">
                        <label htmlFor={`bank-${item.id}`}>Ngân hàng giải ngân</label>
                        <MoneyField id={`bank-${item.id}`} value={item.bankCapitalAmount} onChange={(bankCapitalAmount) => updateBankCapital(item, bankCapitalAmount)} />
                        <div className="facility-helper"><span>Khả dụng cho đợt này: <strong>{formatCurrency(maxBankForInstallment)}</strong></span><button type="button" disabled={maxBankForInstallment <= 0 || item.bankCapitalAmount === maxBankForInstallment} onClick={() => updateBankCapital(item, maxBankForInstallment)}>Điền tối đa</button></div>
                      </div>
                      <label className="field"><span>Ngày dự kiến giải ngân</span><input name={`disbursement-date-${item.id}`} autoComplete="off" type="date" value={item.disbursementDate} onChange={(event) => updateInstallment(item.id, { disbursementDate: event.target.value })} /></label>
                    </div>}
                  </div>
                </article>
              );
            })}
            <button className="button secondary list-add-button" type="button" onClick={addInstallment}><Icon name="plus" size={16} /> Thêm đợt</button>
          </div>
          {validation.errors.length > 0 && <div className="validation-box" role="status"><Icon name="info" size={18} /><div>{validation.errors.map((error) => <p key={error}>{error}</p>)}</div></div>}
        </section>

        <section className="panel prepayment-panel" aria-labelledby="prepayment-title">
          <div className="section-heading">
            <div><span className="section-kicker">04 / Trả trước hạn</span><h2 id="prepayment-title">Kế hoạch trả thêm gốc</h2><p>Phí phạt được tính riêng và không làm giảm dư nợ.</p></div>
          </div>
          <div className="prepayment-layout">
            <div className="prepayment-items">
              {input.prepayments.length === 0 && <div className="empty-state">Chưa có kế hoạch trả trước. Bạn có thể thêm bất cứ lúc nào.</div>}
              {input.prepayments.map((item, index) => <div className="prepayment-row" key={item.id}>
                <span className="prepayment-number">{index + 1}</span>
                <label className="field"><span>Ngày dự kiến</span><input name={`prepayment-date-${item.id}`} autoComplete="off" type="date" value={item.date} onChange={(event) => updatePrepayment(item.id, { date: event.target.value })} /></label>
                <label className="field"><span>Số gốc trả thêm</span><MoneyField id={`prepay-${item.id}`} value={item.amount} onChange={(amount) => updatePrepayment(item.id, { amount })} /></label>
                <button className="icon-button danger" aria-label={`Xóa lần trả trước ${index + 1}`} type="button" onClick={() => removePrepayment(item, index)}><Icon name="trash" size={17} /></button>
              </div>)}
              <button className="button secondary list-add-button" type="button" onClick={addPrepayment}><Icon name="plus" size={16} /> Thêm lần trả trước</button>
            </div>
            <div className="prepayment-settings">
              <label className="field"><span>Phí phạt trả trước</span><NumberField name="prepayment-penalty-rate" value={input.prepaymentPenaltyRate} min={0} step={0.1} onChange={(prepaymentPenaltyRate) => setInput({ ...input, prepaymentPenaltyRate })} suffix="% số tiền" /></label>
              <fieldset><legend>Sau khi trả trước</legend><label><input type="radio" name="prepayment-effect" checked={input.prepaymentEffect === "reduce_term"} onChange={() => setInput({ ...input, prepaymentEffect: "reduce_term" })} /><span><strong>Rút ngắn kỳ hạn</strong><small>Giữ gần nguyên phần gốc định kỳ</small></span></label><label><input type="radio" name="prepayment-effect" checked={input.prepaymentEffect === "reduce_payment"} onChange={() => setInput({ ...input, prepaymentEffect: "reduce_payment" })} /><span><strong>Giảm khoản trả</strong><small>Giữ nguyên ngày đáo hạn</small></span></label></fieldset>
            </div>
          </div>
        </section>

        <section className="results-section" aria-labelledby="schedule-title">
          <div className="results-heading">
            <div><span className="section-kicker light">05 / Kết quả tính toán</span><h2 id="schedule-title">Lịch trả nợ dự kiến</h2><p>Cập nhật tức thì theo kế hoạch ở trên.</p></div>
            <div className="result-actions">
              <div className="result-stamp"><span>{schedule.length}</span> kỳ thanh toán</div>
              <div className="result-buttons">
                <button className="button result-action" type="button" disabled={!reportReady || isExporting} onClick={handleExportExcel}><Icon name="download" size={16} /> {isExporting ? "Đang tạo…" : "Xuất Excel"}</button>
                <button className="button result-action" type="button" disabled={!reportReady} onClick={() => window.print()}><Icon name="printer" size={16} /> In lịch trả nợ</button>
              </div>
              {exportError && <p className="export-error" role="alert">{exportError}</p>}
            </div>
          </div>
          <div className="summary-strip">
            <div><span>Tổng vốn vay</span><strong>{formatCurrency(validation.bankTotal)}</strong></div>
            <div><span>Tổng lãi dự kiến</span><strong>{formatCurrency(totals.interest)}</strong></div>
            <div><span>Phí trả trước</span><strong>{formatCurrency(totals.penalty)}</strong></div>
            <div className="summary-emphasis"><span>Tổng dòng tiền trả ngân hàng</span><strong>{formatCurrency(totals.cashflow)}</strong></div>
          </div>
          <div className="calculation-statistics" aria-label="Thống kê khoản trả hàng tháng">
            <div className="statistics-heading"><strong>Biên độ trả nợ hàng tháng</strong><span>Gốc + lãi định kỳ, không gồm trả trước và phí.</span></div>
            <div><span>Trả nợ cao nhất trong kỳ</span><strong>{formatCurrency(statistics.maxPayment)}</strong></div>
            <div><span>Trả nợ trung bình hàng tháng</span><strong>{formatCurrency(statistics.averagePayment)}</strong></div>
            <div><span>Trả nợ thấp nhất trong kỳ</span><strong>{formatCurrency(statistics.minPayment)}</strong></div>
            <div><span>Tiền lãi cao nhất trong kỳ</span><strong>{formatCurrency(statistics.maxInterest)}</strong></div>
            <div><span>Tiền lãi trung bình hàng tháng</span><strong>{formatCurrency(statistics.averageInterest)}</strong></div>
            <div><span>Tiền lãi thấp nhất trong kỳ</span><strong>{formatCurrency(statistics.minInterest)}</strong></div>
          </div>

          <div className="schedule-shell">
            {schedule.length === 0 ? <div className="schedule-empty"><Icon name="calendar" size={24} /><h3>Chưa thể tạo lịch trả nợ</h3><p>Hãy thêm ít nhất một đợt giải ngân ngân hàng có ngày dự kiến.</p></div> : <>
              <div className="table-scroll">
                <table className="schedule-table">
                  <thead><tr><th aria-label="Mở chi tiết" /><th>Ngày tháng</th><th>Kỳ</th><th className="numeric">Số ngày</th><th className="numeric">Dư nợ còn lại</th><th className="numeric">Gốc phải trả</th><th className="numeric">Lãi phải trả</th><th className="numeric">Gốc + lãi</th><th className="numeric">Trả trước</th><th className="numeric">Phí phạt</th><th className="numeric total-col">Tổng thực trả</th></tr></thead>
                  <tbody>{visibleSchedule.map((row) => <ScheduleTableRows key={row.period} row={row} expanded={expandedPeriod === row.period} onToggle={() => setExpandedPeriod(expandedPeriod === row.period ? null : row.period)} />)}</tbody>
                </table>
              </div>
              <div className="mobile-schedule">{visibleSchedule.map((row) => <ScheduleCard key={row.period} row={row} expanded={expandedPeriod === row.period} onToggle={() => setExpandedPeriod(expandedPeriod === row.period ? null : row.period)} />)}</div>
              {pageCount > 1 && <nav className="pagination" aria-label="Phân trang lịch trả nợ"><button type="button" disabled={currentPage === 1} onClick={() => setPage(Math.max(1, currentPage - 1))}>Trang trước</button><span>Trang {currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(Math.min(pageCount, currentPage + 1))}>Trang sau <Icon name="arrow" size={15} /></button></nav>}
            </>}
          </div>
          <p className="disclaimer"><Icon name="info" size={15} /> Kết quả mang tính tham khảo. Số liệu thực tế phụ thuộc quy tắc làm tròn, ngày hạch toán và điều khoản của ngân hàng.</p>
        </section>
        <PrintReport bankName={bankName} input={input} schedule={schedule} reportDate={reportDate} totals={totals} statistics={statistics} bankTotal={validation.bankTotal} />
      </main>
    </>
  );
}

type RowProps = { row: ReturnType<typeof calculateSchedule>[number]; expanded: boolean; onToggle: () => void };

function SegmentDetails({ row }: { row: RowProps["row"] }) {
  return <div className="segment-details"><div className="detail-metrics"><span>Dư nợ đầu kỳ <strong>{formatCurrency(row.openingBalance)}</strong></span><span>Giải ngân trong kỳ <strong>{formatCurrency(row.disbursed)}</strong></span><span>Dư nợ cuối kỳ <strong>{formatCurrency(row.closingBalance)}</strong></span></div>{row.segments.length > 0 && <div className="segments"><span className="segment-label">Chi tiết tính lãi</span>{row.segments.map((segment, index) => <div className="segment" key={`${segment.from}-${index}`}><span>{formatDate(segment.from)} <Icon name="arrow" size={13} /> {formatDate(segment.to)}</span><span>{segment.days} ngày × {segment.annualRate}%</span><span>{formatCurrency(segment.interest)}</span></div>)}</div>}</div>;
}

function ScheduleTableRows({ row, expanded, onToggle }: RowProps) {
  return <><tr className={expanded ? "expanded" : ""}><td><button className="expand-button" type="button" aria-expanded={expanded} aria-label={`Chi tiết kỳ ${row.period}`} onClick={onToggle}><Icon name="chevron" size={15} /></button></td><td className="date-cell">{formatDate(row.dueDate)}</td><td><span className="period-pill">{String(row.period).padStart(2, "0")}</span></td><td className="numeric muted-number">{row.days}</td><td className="numeric balance-cell">{formatCurrency(row.closingBalance)}</td><td className="numeric">{formatCurrency(row.principal)}</td><td className="numeric">{formatCurrency(row.interest)}</td><td className="numeric">{formatCurrency(row.scheduledPayment)}</td><td className="numeric prepay-cell">{row.prepayment ? formatCurrency(row.prepayment) : "—"}</td><td className="numeric penalty-cell">{row.prepaymentPenalty ? formatCurrency(row.prepaymentPenalty) : "—"}</td><td className="numeric total-col"><strong>{formatCurrency(row.totalCashflow)}</strong></td></tr>{expanded && <tr className="detail-row"><td colSpan={11}><SegmentDetails row={row} /></td></tr>}</>;
}

function ScheduleCard({ row, expanded, onToggle }: RowProps) {
  return <article className={`schedule-card ${expanded ? "expanded" : ""}`}><button className="schedule-card-main" type="button" onClick={onToggle} aria-expanded={expanded}><span className="period-pill">Kỳ {row.period}</span><span className="card-date">{formatDate(row.dueDate)} · {row.days} ngày</span><span className="card-total"><small>Tổng thực trả</small><strong>{formatCurrency(row.totalCashflow)}</strong></span><span className="card-chevron"><Icon name="chevron" size={16} /></span><span className="card-balance">Còn lại <strong>{formatCurrency(row.closingBalance)}</strong></span></button>{expanded && <div className="schedule-card-detail"><div className="card-grid"><span>Gốc<strong>{formatCurrency(row.principal)}</strong></span><span>Lãi<strong>{formatCurrency(row.interest)}</strong></span><span>Trả trước<strong>{row.prepayment ? formatCurrency(row.prepayment) : "—"}</strong></span><span>Phí phạt<strong>{row.prepaymentPenalty ? formatCurrency(row.prepaymentPenalty) : "—"}</strong></span></div><SegmentDetails row={row} /></div>}</article>;
}

type PrintReportProps = {
  bankName: string;
  input: LoanInput;
  schedule: ReturnType<typeof calculateSchedule>;
  reportDate: string;
  totals: { interest: number; penalty: number; cashflow: number };
  statistics: { maxPayment: number; averagePayment: number; minPayment: number; maxInterest: number; averageInterest: number; minInterest: number };
  bankTotal: number;
};

function PrintReport({ bankName, input, schedule, reportDate, totals, statistics, bankTotal }: PrintReportProps) {
  const repaymentMethod = input.repaymentMethod === "annuity" ? "Trả góp đều (Annuity)" : "Gốc cố định, lãi giảm dần";
  return <section className="print-report" aria-hidden="true">
    <header className="print-header"><div><span>KẾ HOẠCH VAY</span><h1>Lịch trả nợ dự kiến</h1></div><strong>{schedule.length} kỳ thanh toán</strong></header>
    <div className="print-meta">
      <span>Ngày lập<strong suppressHydrationWarning>{reportDate}</strong></span>
      <span>Ngân hàng<strong>{bankName.trim() || "Chưa nhập"}</strong></span>
      <span>Phương thức<strong>{repaymentMethod}</strong></span>
      <span>Thời hạn<strong>{input.termMonths} tháng</strong></span>
      <span>Lãi suất<strong>{input.promotionalRate}%/{input.promotionalMonths} tháng; sau đó dự kiến {input.postPromotionalRate}%</strong></span>
      <span>Quy ước tính lãi<strong>Actual/365 · {input.payPrincipalFirstPeriod ? "Kỳ đầu có trả gốc" : "Kỳ đầu theo quy tắc 30 ngày"}</strong></span>
    </div>
    <div className="print-summary">
      <span>Tổng vốn vay<strong>{formatCurrency(bankTotal)}</strong></span>
      <span>Tổng lãi dự kiến<strong>{formatCurrency(totals.interest)}</strong></span>
      <span>Phí trả trước<strong>{formatCurrency(totals.penalty)}</strong></span>
      <span>Tổng trả ngân hàng<strong>{formatCurrency(totals.cashflow)}</strong></span>
    </div>
    <div className="print-statistics">
      <span>Trả nợ cao nhất<strong>{formatCurrency(statistics.maxPayment)}</strong></span><span>Trả nợ trung bình<strong>{formatCurrency(statistics.averagePayment)}</strong></span><span>Trả nợ thấp nhất<strong>{formatCurrency(statistics.minPayment)}</strong></span>
      <span>Lãi cao nhất<strong>{formatCurrency(statistics.maxInterest)}</strong></span><span>Lãi trung bình<strong>{formatCurrency(statistics.averageInterest)}</strong></span><span>Lãi thấp nhất<strong>{formatCurrency(statistics.minInterest)}</strong></span>
    </div>
    <table className="print-table">
      <thead><tr><th>Kỳ</th><th>Ngày</th><th>Số ngày</th><th>Giải ngân</th><th>Gốc</th><th>Lãi</th><th>Trả trước</th><th>Phí</th><th>Tổng thực trả</th><th>Dư nợ cuối kỳ</th></tr></thead>
      <tbody>{schedule.map((row) => <tr key={row.period}><td>{row.period}</td><td>{formatDate(row.dueDate)}</td><td>{row.days}</td><td>{row.disbursed ? formatCurrency(row.disbursed) : "—"}</td><td>{formatCurrency(row.principal)}</td><td>{formatCurrency(row.interest)}</td><td>{row.prepayment ? formatCurrency(row.prepayment) : "—"}</td><td>{row.prepaymentPenalty ? formatCurrency(row.prepaymentPenalty) : "—"}</td><td><strong>{formatCurrency(row.totalCashflow)}</strong></td><td>{formatCurrency(row.closingBalance)}</td></tr>)}</tbody>
    </table>
    <footer className="print-footer">Kết quả mang tính tham khảo. Số liệu thực tế phụ thuộc ngày hạch toán, quy tắc làm tròn và điều khoản của ngân hàng.</footer>
  </section>;
}
