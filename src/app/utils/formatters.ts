import type { SummaryKey, AnalyticsData } from '../types/analytics';

/**
 * Format summary values consistently across all widgets
 */
export function formatSummaryValue(key: SummaryKey, value: number): string {
  switch (key) {
    case 'spend':
    case 'revenue':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(value);

    case 'ctr':
      return `${value.toFixed(2)}%`; // ctr is 0..100

    case 'roas':
      return `${value.toFixed(2)}x`;

    case 'clicks':
    case 'impressions':
    case 'conversions':
      return new Intl.NumberFormat('de-DE').format(value);

    case 'cpa':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(value);

    default:
      return String(value);
  }
}

/**
 * Format delta as percentage string
 */
export function formatDelta(delta?: number): string | null {
  if (delta == null) return null;
  const pct = Math.round(delta * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

/**
 * Check if delta is positive (good) for a given metric
 * Note: For CPA, negative is good (lower cost)
 */
export function isDeltaPositive(key: SummaryKey, delta?: number): boolean | null {
  if (delta == null) return null;
  // CPA: negative is good
  if (key === 'cpa') return delta < 0;
  // All others: positive is good
  return delta >= 0;
}

/**
 * Get summary value and delta for a key
 */
export function getSummary(data: AnalyticsData | null, key: SummaryKey) {
  const value = data?.summary?.[key];
  const delta = data?.summary?.deltas?.[key];
  return { value, delta };
}

/**
 * Format compact numbers (K, M)
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(Math.round(value));
}

/**
 * Format percentage (0..1 to 0..100%)
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
