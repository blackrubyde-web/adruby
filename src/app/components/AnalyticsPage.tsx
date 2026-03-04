import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Eye, MousePointerClick, DollarSign, TrendingUp, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { formatCurrency, formatCompact } from '../utils/formatters';
import { KpiCardGrid, type KpiItem } from './overview/KpiCardGrid';
import { MetricCardSkeleton, ChartSkeleton } from '../lib/skeletons';

const LazyPerformanceChart = lazy(() =>
  import('./PerformanceChart').then((mod) => ({ default: mod.PerformanceChart }))
);
const LazyCampaignsTable = lazy(() =>
  import('./CampaignsTable').then((mod) => ({ default: mod.CampaignsTable }))
);
const LazyBudgetTracker = lazy(() =>
  import('./BudgetTracker').then((mod) => ({ default: mod.BudgetTracker }))
);
const LazyAIInsightsPanel = lazy(() =>
  import('./AIInsightsPanel').then((mod) => ({ default: mod.AIInsightsPanel }))
);

type TimeRange = '7d' | '30d' | '90d';

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 Tage' },
  { value: '30d', label: '30 Tage' },
  { value: '90d', label: '90 Tage' },
];

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isComparing, setIsComparing] = useState(false);

  const { data, loading } = useAnalyticsData(timeRange, isComparing, 'meta');

  const summary = data?.summary;
  const warning = data?.warning;
  const warningMessage = warning
    ? warning === 'meta_insights_daily_missing'
      ? 'Meta-Datenbank-Tabellen fehlen. Bitte Migration ausführen.'
      : 'Analytics-Daten sind noch nicht verfügbar.'
    : null;
  const warningToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!warningMessage) { warningToastRef.current = null; return; }
    if (warningToastRef.current === warningMessage) return;
    toast.info(warningMessage);
    warningToastRef.current = warningMessage;
  }, [warningMessage]);

  const formatDeltaPct = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '0%';
    const pct = Math.round(value * 1000) / 10;
    return `${pct > 0 ? '+' : ''}${pct}%`;
  };

  const totalSpend = summary?.spend ?? 0;
  const totalRevenue = summary?.revenue ?? 0;
  const totalClicks = summary?.clicks ?? 0;
  const totalImpressions = summary?.impressions ?? 0;
  const totalConversions = summary?.conversions ?? 0;
  const averageCpa =
    summary?.cpa !== undefined && summary?.cpa !== null
      ? summary.cpa
      : totalConversions > 0
        ? totalSpend / totalConversions
        : 0;

  const comparisonLabel = timeRange === '7d' ? 'vs. Vorwoche' : timeRange === '30d' ? 'vs. Vormonat' : 'vs. Vorquartal';

  const kpis: KpiItem[] = [
    {
      label: 'Ausgaben',
      value: formatCurrency(totalSpend),
      change: formatDeltaPct(summary?.deltas?.spend),
      isPositive: (summary?.deltas?.spend ?? 0) <= 0,
      comparison: comparisonLabel,
      icon: <DollarSign className="w-5 h-5" />,
      accentColor: '#3b82f6',
    },
    {
      label: 'Umsatz',
      value: formatCurrency(totalRevenue),
      change: formatDeltaPct(summary?.deltas?.revenue),
      isPositive: (summary?.deltas?.revenue ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <TrendingUp className="w-5 h-5" />,
      accentColor: '#10b981',
    },
    {
      label: 'ROAS',
      value: `${(summary?.roas ?? 0).toFixed(2)}x`,
      change: formatDeltaPct(summary?.deltas?.roas),
      isPositive: (summary?.deltas?.roas ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <Target className="w-5 h-5" />,
      accentColor: '#8b5cf6',
    },
    {
      label: 'Impressionen',
      value: formatCompact(totalImpressions),
      change: formatDeltaPct(summary?.deltas?.impressions),
      isPositive: (summary?.deltas?.impressions ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <Eye className="w-5 h-5" />,
      accentColor: '#06b6d4',
    },
    {
      label: 'CTR',
      value: `${(summary?.ctr ?? 0).toFixed(2)}%`,
      change: formatDeltaPct(summary?.deltas?.ctr),
      isPositive: (summary?.deltas?.ctr ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <MousePointerClick className="w-5 h-5" />,
      accentColor: '#f59e0b',
    },
    {
      label: 'CPA',
      value: formatCurrency(averageCpa),
      change: formatDeltaPct(summary?.deltas?.cpa),
      isPositive: (summary?.deltas?.cpa ?? 0) <= 0,
      comparison: comparisonLabel,
      icon: <DollarSign className="w-5 h-5" />,
      accentColor: '#ef4444',
    },
  ];

  return (
    <DashboardShell hideHero>
      {/* ── Editorial Page Header ──────────────────────── */}
      <div className="page-header-editorial">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Detaillierte Einblicke in deine Ad Performance</p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${timeRange === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsComparing(!isComparing)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isComparing
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted/50 text-muted-foreground border-border/50 hover:text-foreground'
            }`}
        >
          Vergleichen
        </button>
        <Badge variant="secondary" className="px-2.5 py-1 text-xs">
          {loading ? '● Laden...' : '● Live'}
        </Badge>
      </div>

      {/* ── KPI Strip ─────────────────────────────────── */}
      {loading ? <KpiSkeleton /> : <KpiCardGrid kpis={kpis} columns="grid-cols-2 sm:grid-cols-3" />}

      {/* ── Performance Chart (Full-Width) ─────────────── */}
      <Card variant="glass" className="overflow-hidden" padding="none">
        <Suspense fallback={<ChartSkeleton />}>
          <LazyPerformanceChart
            current={data?.timeseries.current ?? []}
            previous={data?.timeseries.previous ?? []}
            compare={isComparing}
            granularity={data?.granularity ?? 'day'}
            range={timeRange}
            loading={loading}
          />
        </Suspense>
      </Card>

      {/* ── Campaign Table + Sidebar ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Campaigns Table — 2/3 */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="overflow-hidden" padding="none">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyCampaignsTable campaigns={data?.campaigns ?? []} />
            </Suspense>
          </Card>
        </div>

        {/* Sidebar — 1/3: AI Insights + Budget */}
        <div className="lg:col-span-1 space-y-4">
          <Card variant="glass" className="overflow-hidden" padding="none">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyAIInsightsPanel />
            </Suspense>
          </Card>

          <Card variant="glass" padding="default">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyBudgetTracker />
            </Suspense>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
