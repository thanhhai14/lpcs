export type RepaymentMethod = "equal_principal" | "annuity";
export type PrepaymentEffect = "reduce_payment" | "reduce_term";

export type ProjectInstallment = {
  id: string;
  name: string;
  dueDate: string;
  amountMode?: "amount" | "percentage";
  percentage?: number;
  amount: number;
  ownCapitalAmount: number;
  bankCapitalAmount: number;
  disbursementDate: string;
};

export type Prepayment = {
  id: string;
  date: string;
  amount: number;
};

export type LoanInput = {
  projectValue: number;
  facilityAmount: number;
  installments: ProjectInstallment[];
  termMonths: number;
  paymentDay: number;
  repaymentMethod: RepaymentMethod;
  principalGraceMonths: number;
  promotionalRate: number;
  promotionalMonths: number;
  postPromotionalRate: number;
  prepaymentPenaltyRate: number;
  prepaymentEffect: PrepaymentEffect;
  prepayments: Prepayment[];
};

export type InterestSegment = {
  from: string;
  to: string;
  days: number;
  balance: number;
  annualRate: number;
  interest: number;
};

export type ScheduleRow = {
  period: number;
  dueDate: string;
  days: number;
  openingBalance: number;
  disbursed: number;
  principal: number;
  interest: number;
  scheduledPayment: number;
  prepayment: number;
  prepaymentPenalty: number;
  totalCashflow: number;
  closingBalance: number;
  segments: InterestSegment[];
};

type TimelineEvent = {
  date: string;
  kind: "disbursement" | "prepayment" | "rate_change";
  amount?: number;
};

const DAY_MS = 86_400_000;

function utcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  return Math.max(0, Math.round((utcDate(to).getTime() - utcDate(from).getTime()) / DAY_MS));
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function dateAtPaymentDay(year: number, monthIndex: number, paymentDay: number) {
  return new Date(Date.UTC(year, monthIndex, Math.min(paymentDay, daysInMonth(year, monthIndex))));
}

function addMonths(value: string, months: number) {
  const date = utcDate(value);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  target.setUTCDate(Math.min(date.getUTCDate(), daysInMonth(target.getUTCFullYear(), target.getUTCMonth())));
  return isoDate(target);
}

function firstDueDate(startDate: string, paymentDay: number) {
  const start = utcDate(startDate);
  let due = dateAtPaymentDay(start.getUTCFullYear(), start.getUTCMonth(), paymentDay);
  if (due.getTime() <= start.getTime()) {
    due = dateAtPaymentDay(start.getUTCFullYear(), start.getUTCMonth() + 1, paymentDay);
  }
  return isoDate(due);
}

function rateAt(date: string, startDate: string, input: LoanInput) {
  const promotionalEnd = addMonths(startDate, input.promotionalMonths);
  return input.promotionalMonths > 0 && date < promotionalEnd
    ? input.promotionalRate
    : input.postPromotionalRate;
}

function annuityPayment(balance: number, annualRate: number, periods: number) {
  if (periods <= 0 || balance <= 0) return balance;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return balance / periods;
  return (balance * monthlyRate * (1 + monthlyRate) ** periods) / ((1 + monthlyRate) ** periods - 1);
}

export function calculateSchedule(input: LoanInput): ScheduleRow[] {
  const disbursements = input.installments
    .filter((item) => item.bankCapitalAmount > 0 && item.disbursementDate)
    .map((item) => ({ date: item.disbursementDate, amount: item.bankCapitalAmount }));

  if (!disbursements.length || input.termMonths <= 0) return [];

  const startDate = disbursements.map((item) => item.date).sort()[0];
  const firstDue = firstDueDate(startDate, input.paymentDay);
  const promotionEnd = addMonths(startDate, input.promotionalMonths);
  const events: TimelineEvent[] = [
    ...disbursements.map((item): TimelineEvent => ({ ...item, kind: "disbursement" })),
    ...input.prepayments
      .filter((item) => item.amount > 0 && item.date >= startDate)
      .map((item): TimelineEvent => ({ date: item.date, amount: item.amount, kind: "prepayment" })),
  ];

  if (input.promotionalMonths > 0) events.push({ date: promotionEnd, kind: "rate_change" });
  events.sort((a, b) => a.date.localeCompare(b.date));

  const rows: ScheduleRow[] = [];
  let balance = 0;
  let displayedBalance = 0;
  let previousDue = startDate;
  let lockedEqualPrincipal = 0;
  let lockedAnnuityPayment = 0;
  let eventIndex = 0;

  for (let period = 1; period <= input.termMonths && (balance > 0.5 || eventIndex < events.length); period += 1) {
    const dueDate = addMonths(firstDue, period - 1);
    const openingBalance = displayedBalance;
    const periodEvents: TimelineEvent[] = [];

    while (eventIndex < events.length && events[eventIndex].date < dueDate) {
      if (events[eventIndex].date >= previousDue) periodEvents.push(events[eventIndex]);
      eventIndex += 1;
    }

    const dueEvents: TimelineEvent[] = [];
    while (eventIndex < events.length && events[eventIndex].date === dueDate) {
      dueEvents.push(events[eventIndex]);
      eventIndex += 1;
    }

    let cursor = previousDue;
    let interest = 0;
    let disbursed = 0;
    let prepayment = 0;
    let prepaymentPenalty = 0;
    const segments: InterestSegment[] = [];

    for (const event of periodEvents) {
      const days = daysBetween(cursor, event.date);
      if (days > 0 && balance > 0) {
        const annualRate = rateAt(cursor, startDate, input);
        const segmentInterest = balance * (annualRate / 100) * (days / 365);
        interest += segmentInterest;
        segments.push({ from: cursor, to: event.date, days, balance, annualRate, interest: segmentInterest });
      }

      if (event.kind === "disbursement") {
        balance += event.amount ?? 0;
        disbursed += event.amount ?? 0;
        lockedEqualPrincipal = 0;
        lockedAnnuityPayment = 0;
      } else if (event.kind === "prepayment") {
        const paid = Math.min(balance, event.amount ?? 0);
        balance -= paid;
        prepayment += paid;
        prepaymentPenalty += paid * (input.prepaymentPenaltyRate / 100);
        if (input.prepaymentEffect === "reduce_payment") {
          lockedEqualPrincipal = 0;
          lockedAnnuityPayment = 0;
        }
      } else if (event.kind === "rate_change") {
        lockedAnnuityPayment = 0;
      }
      cursor = event.date;
    }

    const finalDays = daysBetween(cursor, dueDate);
    if (finalDays > 0 && balance > 0) {
      const annualRate = rateAt(cursor, startDate, input);
      const segmentInterest = balance * (annualRate / 100) * (finalDays / 365);
      interest += segmentInterest;
      segments.push({ from: cursor, to: dueDate, days: finalDays, balance, annualRate, interest: segmentInterest });
    }

    for (const event of dueEvents.filter((item) => item.kind === "disbursement")) {
      balance += event.amount ?? 0;
      disbursed += event.amount ?? 0;
      lockedEqualPrincipal = 0;
      lockedAnnuityPayment = 0;
    }

    const graceFinished = period > input.principalGraceMonths;
    const remainingPeriods = Math.max(1, input.termMonths - period + 1);
    let principal = 0;

    if (graceFinished && balance > 0) {
      if (input.repaymentMethod === "annuity") {
        if (!lockedAnnuityPayment || input.prepaymentEffect === "reduce_payment") {
          lockedAnnuityPayment = annuityPayment(balance, rateAt(dueDate, startDate, input), remainingPeriods);
        }
        principal = Math.min(balance, Math.max(0, lockedAnnuityPayment - interest));
      } else {
        if (!lockedEqualPrincipal || input.prepaymentEffect === "reduce_payment") {
          lockedEqualPrincipal = balance / remainingPeriods;
        }
        principal = Math.min(balance, lockedEqualPrincipal);
      }
    }

    balance -= principal;

    for (const event of dueEvents.filter((item) => item.kind === "prepayment")) {
      const paid = Math.min(balance, event.amount ?? 0);
      balance -= paid;
      prepayment += paid;
      prepaymentPenalty += paid * (input.prepaymentPenaltyRate / 100);
      if (input.prepaymentEffect === "reduce_payment") {
        lockedEqualPrincipal = 0;
        lockedAnnuityPayment = 0;
      }
    }

    let roundedPrincipal = Math.round(principal);
    const roundedInterest = Math.round(interest);
    const roundedPrepayment = Math.round(prepayment);
    const roundedPenalty = Math.round(prepaymentPenalty);
    const roundedDisbursed = Math.round(disbursed);

    // Keep the displayed ledger exact to the đồng. On a payoff row, absorb all
    // accumulated fractional rounding into the last principal installment.
    if (balance < 0.5) {
      roundedPrincipal = Math.max(0, openingBalance + roundedDisbursed - roundedPrepayment);
    }
    displayedBalance = Math.max(0, openingBalance + roundedDisbursed - roundedPrincipal - roundedPrepayment);

    rows.push({
      period,
      dueDate,
      days: daysBetween(previousDue, dueDate),
      openingBalance: Math.round(openingBalance),
      disbursed: roundedDisbursed,
      principal: roundedPrincipal,
      interest: roundedInterest,
      scheduledPayment: roundedPrincipal + roundedInterest,
      prepayment: roundedPrepayment,
      prepaymentPenalty: roundedPenalty,
      totalCashflow: roundedPrincipal + roundedInterest + roundedPrepayment + roundedPenalty,
      closingBalance: displayedBalance,
      segments,
    });

    previousDue = dueDate;
  }

  return rows;
}

export function validateLoanInput(input: LoanInput) {
  const installmentTotal = input.installments.reduce((sum, item) => sum + item.amount, 0);
  const bankTotal = input.installments.reduce((sum, item) => sum + item.bankCapitalAmount, 0);
  const fundingMismatch = input.installments.some(
    (item) => Math.abs(item.ownCapitalAmount + item.bankCapitalAmount - item.amount) > 1,
  );
  const errors: string[] = [];

  if (Math.abs(installmentTotal - input.projectValue) > 1) {
    errors.push("Tổng các đợt thanh toán chưa khớp giá trị dự án.");
  }
  if (fundingMismatch) errors.push("Nguồn vốn của một hoặc nhiều đợt chưa khớp số tiền phải thanh toán.");
  if (bankTotal <= 0) errors.push("Cần có ít nhất một đợt sử dụng vốn ngân hàng.");
  if (bankTotal > input.facilityAmount + 1) {
    errors.push("Tổng vốn ngân hàng đã vượt hạn mức vay dự kiến.");
  }

  return {
    errors,
    installmentTotal,
    bankTotal,
    ownCapitalTotal: installmentTotal - bankTotal,
    remainingFacility: Math.max(0, input.facilityAmount - bankTotal),
  };
}
