export const safe = (v, fallback = '—') => (v === null || v === undefined ? fallback : v);

export const fmtCompact = (v, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  const num = Number(v);
  if (Number.isNaN(num)) return fallback;
  return new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
};

export const fmtCurrencyEUR = (v, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  const num = Number(v);
  if (Number.isNaN(num)) return fallback;
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
};

export const fmtPct = (v, fallback = '—') => {
  if (v === null || v === undefined) return fallback;
  const num = Number(v);
  if (Number.isNaN(num)) return fallback;
  return `${num.toFixed(2)}%`;
};
