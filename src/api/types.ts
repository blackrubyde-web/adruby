export type KPIKey = 'ctr' | 'conversion_rate' | 'roas';

export interface KPIValue {
  value: number;
  delta: number;
}

export interface KPIGroup {
  ctr: KPIValue;
  conversion_rate: KPIValue;
  roas: KPIValue;
}

export interface TimeSeriesPoint {
  timestamp: string;
  ctr: number;
  conversions: number;
  roas: number;
  impressions: number;
  cost: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  ctr: number;
  conversions: number;
}

export interface DeviceSessions {
  device: string;
  sessions: number;
}

export interface OverviewResponse {
  kpis: KPIGroup;
  timeSeries: TimeSeriesPoint[];
  topCampaigns: CampaignRow[];
  sessionsByDevice: DeviceSessions[];
}

export interface OverviewFilters {
  start: string;
  end: string;
  timezone: string;
}

export interface DateRangeValue {
  start: Date;
  end: Date;
  preset: '7d' | '30d' | '90d' | 'custom';
  timezone: string;
}

export interface DataTableSummary<T extends object> {
  label: string;
  totals: Partial<Record<keyof T, number | string>>;
  description?: string;
}

export interface WebSocketEvent {
  type: 'updateTimeseries' | 'metricsUpdate' | 'tableUpdate';
  payload: any;
}
