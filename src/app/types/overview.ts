// Overview API Response Types

export type OverviewTimeseriesPoint = {
  ts: string; // ISO date/time
  spend: number;
  revenue: number;
  roas: number; // revenue/spend
};

export type OverviewResponse = {
  kpis: {
    spend: number;
    revenue: number;
    roas: number;
    activeCampaigns: number;
    spendChangePct?: number;
    revenueChangePct?: number;
    roasChangePct?: number;
  };
  timeseries: OverviewTimeseriesPoint[]; // already aggregated for range
  topCampaign: {
    id: string;
    name: string;
    roas: number;
    spend: number;
    revenue: number;
  };
  bestCreative: {
    id: string;
    name: string;
    aiScore: number;
    ctr: number;
    conversions: number;
  };
  onboarding: {
    completedSteps: number;
    totalSteps: number;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      actionLabel: string;
    }>;
  };
  warning?: string | null;
};
