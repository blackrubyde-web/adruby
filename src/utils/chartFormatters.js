const nfCompact = new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 });
const nfCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const nfPercent = new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 1 });

export const fmtCompact = (n) => (n == null ? '—' : nfCompact.format(n));
export const fmtCurrencyEUR = (n) => (n == null ? '—' : nfCurrency.format(n));
export const fmtPct = (n) => (n == null ? '—' : nfPercent.format(n / 100));

export const fmtAxis = (n, kind = 'compact') => {
  if (n == null || Number.isNaN(n)) return '—';
  if (kind === 'currency') return fmtCurrencyEUR(n);
  if (kind === 'percent') return fmtPct(n);
  return fmtCompact(n);
};
