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
  payPrincipalFirstPeriod: boolean;
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

export function paginateScheduleByYear(schedule: ScheduleRow[], monthsPerPage = 12): ScheduleRow[][] {
  if (schedule.length === 0 || monthsPerPage <= 0) return [];

  return schedule.reduce<ScheduleRow[][]>((pages, row) => {
    const pageIndex = row.period <= 0 ? 0 : Math.floor((row.period - 1) / monthsPerPage);
    if (!pages[pageIndex]) pages[pageIndex] = [];
    pages[pageIndex].push(row);
    return pages;
  }, []);
}

type TimelineEvent = {
  date: string;
  kind: "disbursement" | "prepayment" | "rate_change";
  amount?: number;
  trancheId?: string;
};

type LoanTranche = {
  id: string;
  disbursementDate: string;
  balance: number;
  lockedEqualPrincipal: number;
  lockedAnnuityPayment: number;
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
    .map((item) => ({ id: item.id, date: item.disbursementDate, amount: item.bankCapitalAmount }));

  if (!disbursements.length || input.termMonths <= 0) return [];

  const startDate = disbursements.map((item) => item.date).sort()[0];
  const firstDue = firstDueDate(startDate, input.paymentDay);
  const hasInitialInterestOnlyPeriod = daysBetween(startDate, firstDue) < 30 && !input.payPrincipalFirstPeriod;
  const contractualRows = input.termMonths + (hasInitialInterestOnlyPeriod ? 1 : 0);
  const maximumRows = contractualRows + 600;
  const promotionEnd = addMonths(startDate, input.promotionalMonths);
  const events: TimelineEvent[] = [
    ...disbursements.map((item): TimelineEvent => ({ date: item.date, amount: item.amount, trancheId: item.id, kind: "disbursement" })),
    ...input.prepayments
      .filter((item) => item.amount > 0 && item.date >= startDate)
      .map((item): TimelineEvent => ({ date: item.date, amount: item.amount, kind: "prepayment" })),
  ];

  if (input.promotionalMonths > 0) events.push({ date: promotionEnd, kind: "rate_change" });
  events.sort((a, b) => a.date.localeCompare(b.date));

  const rows: ScheduleRow[] = [];
  const tranches: LoanTranche[] = [];
  let balance = 0;
  let displayedBalance = 0;
  let previousDue = startDate;
  let eventIndex = 0;

  for (
    let rowIndex = 0;
    rowIndex < maximumRows && (balance > 0.5 || eventIndex < events.length);
    rowIndex += 1
  ) {
    const period = rowIndex + (hasInitialInterestOnlyPeriod ? 0 : 1);
    const dueDate = addMonths(firstDue, rowIndex);
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
    const trancheInterest = new Map<string, number>();

    const accrueInterest = (from: string, to: string) => {
      const days = daysBetween(from, to);
      if (days <= 0 || balance <= 0) return;
      const annualRate = rateAt(from, startDate, input);
      let segmentInterest = 0;
      for (const tranche of tranches) {
        if (tranche.balance <= 0) continue;
        const value = tranche.balance * (annualRate / 100) * (days / 365);
        segmentInterest += value;
        trancheInterest.set(tranche.id, (trancheInterest.get(tranche.id) ?? 0) + value);
      }
      interest += segmentInterest;
      segments.push({ from, to, days, balance, annualRate, interest: segmentInterest });
    };

    const addDisbursement = (event: TimelineEvent) => {
      const amount = event.amount ?? 0;
      if (amount <= 0) return;
      tranches.push({
        id: event.trancheId ?? `tranche-${tranches.length + 1}`,
        disbursementDate: event.date,
        balance: amount,
        lockedEqualPrincipal: 0,
        lockedAnnuityPayment: 0,
      });
      balance += amount;
      disbursed += amount;
    };

    const applyPrepayment = (requestedAmount: number) => {
      let remaining = Math.min(balance, requestedAmount);
      const paid = remaining;
      // The UI does not select a target drawdown, so extra principal is applied
      // to the oldest outstanding drawdown first.
      for (const tranche of tranches) {
        if (remaining <= 0) break;
        const tranchePaid = Math.min(tranche.balance, remaining);
        tranche.balance -= tranchePaid;
        balance -= tranchePaid;
        remaining -= tranchePaid;
        if (tranchePaid > 0 && input.prepaymentEffect === "reduce_payment") {
          tranche.lockedEqualPrincipal = 0;
          tranche.lockedAnnuityPayment = 0;
        }
      }
      return paid;
    };

    for (const event of periodEvents) {
      accrueInterest(cursor, event.date);

      if (event.kind === "disbursement") {
        addDisbursement(event);
      } else if (event.kind === "prepayment") {
        const paid = applyPrepayment(event.amount ?? 0);
        prepayment += paid;
        prepaymentPenalty += paid * (input.prepaymentPenaltyRate / 100);
      } else if (event.kind === "rate_change") {
        for (const tranche of tranches) tranche.lockedAnnuityPayment = 0;
      }
      cursor = event.date;
    }

    accrueInterest(cursor, dueDate);

    for (const event of dueEvents.filter((item) => item.kind === "disbursement")) {
      addDisbursement(event);
    }

    const graceFinished = period > input.principalGraceMonths;
    const remainingPeriods = Math.max(1, input.termMonths - period + 1);
    let principal = 0;

    if (graceFinished && balance > 0) {
      for (const tranche of tranches) {
        const isInitialDrawdownAtFirstDue = input.payPrincipalFirstPeriod
          && tranche.disbursementDate === startDate
          && dueDate === firstDue;
        if (
          tranche.balance <= 0
          || (daysBetween(tranche.disbursementDate, dueDate) < 30 && !isInitialDrawdownAtFirstDue)
        ) continue;
        let tranchePrincipal = 0;
        if (input.repaymentMethod === "annuity") {
          if (!tranche.lockedAnnuityPayment) {
            tranche.lockedAnnuityPayment = annuityPayment(tranche.balance, rateAt(dueDate, startDate, input), remainingPeriods);
          }
          tranchePrincipal = Math.min(
            tranche.balance,
            Math.max(0, tranche.lockedAnnuityPayment - (trancheInterest.get(tranche.id) ?? 0)),
          );
        } else {
          if (!tranche.lockedEqualPrincipal) {
            tranche.lockedEqualPrincipal = tranche.balance / remainingPeriods;
          }
          tranchePrincipal = Math.min(tranche.balance, tranche.lockedEqualPrincipal);
        }
        tranche.balance -= tranchePrincipal;
        balance -= tranchePrincipal;
        principal += tranchePrincipal;
      }
    }

    for (const event of dueEvents.filter((item) => item.kind === "prepayment")) {
      const paid = applyPrepayment(event.amount ?? 0);
      prepayment += paid;
      prepaymentPenalty += paid * (input.prepaymentPenaltyRate / 100);
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
