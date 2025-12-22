// ============================================================================
// CENTRAL ANALYTICS DATA CONTRACT
// One fetch, all widgets powered by this
// ============================================================================

export type Granularity = "hour" | "day";

export type TimeseriesPoint = {
  ts: string;               // ISO timestamp
  impressions?: number;
  clicks?: number;
  spend?: number;
  revenue?: number;
  conversions?: number;
  ctr?: number;             // 0..1 or percentage
  cpa?: number;
  roas?: number;
  aiScore?: number;         // 0..100
};

export type AnalyticsData = {
  range: "7d" | "30d" | "90d" | "custom";
  compare: boolean;
  granularity: Granularity;
  warning?: string;

  // 1) KPIs for Stat Widgets
  summary: {
    impressions: number;
    clicks: number;
    spend: number;
    revenue: number;
    conversions: number;
    ctr: number;            // as percentage 0..100
    roas: number;
    cpa?: number;

    // Compare deltas (optional) - as decimal (0.12 = +12%)
    deltas?: Partial<Record<keyof Omit<AnalyticsData["summary"], "deltas">, number>>;
  };

  // 2) Timeseries for Charts / Bars / Activity
  timeseries: {
    current: TimeseriesPoint[];
    previous?: TimeseriesPoint[];
  };

  // 3) Tables/Lists
  campaigns?: Array<{
    id: string;
    name: string;
    status: "active" | "paused" | "ended";
    spend: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversions: number;
    budget?: number;
    budgetUsed?: number;
  }>;

  // 4) Breakdowns (Audience/Funnel/Heatmap)
  breakdowns?: {
    audience?: {
      byAge: Array<{ age: string; male: number; female: number }>;
      byGender: { male: number; female: number; other: number };
    };
    funnel?: Array<{
      stage: string;
      count: number;
      percentage: number;
    }>;
    heatmap?: Array<{
      day: number;      // 0 = Monday, 6 = Sunday
      hour: number;     // 0..23
      value: number;    // performance metric
    }>;
  };

  // 5) AI Insights
  ai?: {
    insights: Array<{
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      summary: string;
    }>;
    strategy?: Array<{
      id: string;
      title: string;
      reason: string;
      action: string;
    }>;
    forecast?: {
      predictions: Array<{
        ts: string;
        revenue: number;
        spend: number;
        confidence: number;  // 0..1
      }>;
    };
  };

  // 6) Performance Score
  performance?: {
    score: number;          // 0..100
    quality: number;        // 0..100
    relevance: number;      // 0..100
    engagement: number;     // 0..100
  };

  // 7) Budget Tracker
  budget?: {
    total: number;
    spent: number;
    remaining: number;
    dailyAverage: number;
    projectedEnd: string;   // ISO date
  };
};

// Helper type for formatting
export type SummaryKey = keyof Omit<AnalyticsData["summary"], "deltas">;
