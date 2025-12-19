import type { SummaryKey, TimeseriesPoint } from '../types/analytics';

/**
 * Map stat widget template IDs to summary keys
 */
export const STAT_TEMPLATE_TO_KEY: Record<string, SummaryKey> = {
  'stat-impressions': 'impressions',
  'stat-clicks': 'clicks',
  'stat-ctr': 'ctr',
  'stat-roas': 'roas',
  'stat-spend': 'spend',
  'stat-revenue': 'revenue',
  'stat-conversions': 'conversions',
  'stat-cpa': 'cpa',
};

/**
 * Map chart widget template IDs to timeseries metrics
 */
export const CHART_TEMPLATE_TO_METRICS: Record<
  string,
  Array<keyof TimeseriesPoint>
> = {
  'chart-performance': ['spend', 'revenue', 'roas'],
  'chart-bars': ['revenue'],
  'activity-weekly': ['clicks'],
};

/**
 * Get icon for stat widget
 */
export function getStatIcon(key: SummaryKey): string {
  switch (key) {
    case 'impressions':
      return 'Eye';
    case 'clicks':
      return 'MousePointerClick';
    case 'ctr':
      return 'Target';
    case 'roas':
      return 'DollarSign';
    case 'spend':
      return 'CreditCard';
    case 'revenue':
      return 'TrendingUp';
    case 'conversions':
      return 'ShoppingCart';
    case 'cpa':
      return 'DollarSign';
    default:
      return 'BarChart3';
  }
}

/**
 * Get label for stat widget
 */
export function getStatLabel(key: SummaryKey): string {
  switch (key) {
    case 'impressions':
      return 'Impressions';
    case 'clicks':
      return 'Clicks';
    case 'ctr':
      return 'Click Rate';
    case 'roas':
      return 'ROAS';
    case 'spend':
      return 'Spend';
    case 'revenue':
      return 'Revenue';
    case 'conversions':
      return 'Conversions';
    case 'cpa':
      return 'CPA';
    default:
      return String(key);
  }
}
