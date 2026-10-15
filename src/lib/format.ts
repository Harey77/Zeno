const inrFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹10,00,000 style Indian grouping. */
export function inr(n: number, decimals = 0) {
  if (!Number.isFinite(n)) return "₹—";
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  const body = decimals
    ? new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(abs)
    : inrFmt.format(Math.round(abs));
  return `${sign}₹${body}`;
}

/** ₹1.2L / ₹3.4Cr for tight spaces like chart axes. */
export function inrShort(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e7) return `${sign}₹${+(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${+(abs / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `${sign}₹${+(abs / 1e3).toFixed(1)}k`;
  return `${sign}₹${Math.round(abs)}`;
}

export const pct = (n: number, d = 1) => `${+n.toFixed(d)}%`;

export function duration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m || !y) parts.push(`${m} mo`);
  return parts.join(" ");
}
