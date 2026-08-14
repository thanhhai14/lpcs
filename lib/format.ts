export const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const compactCurrency = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number) {
  return currency.format(Math.round(Number.isFinite(value) ? value : 0));
}

export function formatCompactCurrency(value: number) {
  return `${compactCurrency.format(Math.round(Number.isFinite(value) ? value : 0))} ₫`;
}

export function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function parseMoney(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function moneyInput(value: number) {
  return value ? new Intl.NumberFormat("vi-VN").format(value) : "";
}
