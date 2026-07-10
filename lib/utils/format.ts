export function formatCurrency(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function toPesewas(amount: number) {
  return Math.round(amount * 100);
}

export function generateReference(prefix = "MKT") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
