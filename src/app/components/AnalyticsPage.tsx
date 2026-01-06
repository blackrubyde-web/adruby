import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DashboardCustomizer, DashboardSection } from './DashboardCustomizer';
import { ReorderableWidget } from './ReorderableWidget';
import { TimeRangeFilter } from './TimeRangeFilter';
import { Eye, MousePointerClick, DollarSign, TrendingUp, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { PageShell, HeroHeader, Card, Chip } from './layout';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

const LazyNotificationBanner = lazy(() =>
  import('./NotificationBanner').then((mod) => ({ default: mod.NotificationBanner }))
);
const LazyPerformanceScore = lazy(() =>
  import('./PerformanceScore').then((mod) => ({ default: mod.PerformanceScore }))
);
const LazyBudgetTracker = lazy(() =>
  import('./BudgetTracker').then((mod) => ({ default: mod.BudgetTracker }))
);
const LazyAIInsightsPanel = lazy(() =>
  import('./AIInsightsPanel').then((mod) => ({ default: mod.AIInsightsPanel }))
);
const LazyPerformanceChart = lazy(() =>
  import('./PerformanceChart').then((mod) => ({ default: mod.PerformanceChart }))
);
const LazyAudienceBreakdown = lazy(() =>
  import('./AudienceBreakdown').then((mod) => ({ default: mod.AudienceBreakdown }))
);
const LazyConversionFunnel = lazy(() =>
  import('./ConversionFunnel').then((mod) => ({ default: mod.ConversionFunnel }))
);
const LazyPerformanceHeatmap = lazy(() =>
  import('./PerformanceHeatmap').then((mod) => ({ default: mod.PerformanceHeatmap }))
);
const LazyPredictiveAnalytics = lazy(() =>
  import('./PredictiveAnalytics').then((mod) => ({ default: mod.PredictiveAnalytics }))
);
const LazyStrategyInsights = lazy(() =>
  import('./StrategyInsights').then((mod) => ({ default: mod.StrategyInsights }))
);
const LazyCampaignsTable = lazy(() =>
  import('./CampaignsTable').then((mod) => ({ default: mod.CampaignsTable }))
);
const LazyAdMetricsCard = lazy(() =>
  import('./AdMetricsCard').then((mod) => ({ default: mod.AdMetricsCard }))
);
const LazyAutomatedRulesManager = lazy(() =>
  import('./AutomatedRulesManager').then((mod) => ({ default: mod.AutomatedRulesManager }))
);
const LazyAppleGridDashboard = lazy(() =>
  import('./AppleGridDashboard').then((mod) => ({ default: mod.AppleGridDashboard }))
);

function WidgetPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-[220px] rounded-2xl border border-border/60 bg-muted/30 animate-pulse flex items-center justify-center">
      <span className="text-sm text-muted-foreground">{title}</span>
    </div>
  );
}

// Analytics Configuration - All widgets available by default
const ANALYTICS_SECTIONS: DashboardSection[] = [
  {
    id: 'metrics',
    name: 'Key Performance Metrics',
    description: 'Impressions, CTR, CPC, ROAS - Core KPIs',
    category: 'essential',
    isVisible: true
  },
  {
    id: 'performance-chart',
    name: 'Performance Chart',
    description: 'Multi-line chart showing trends over time',
    category: 'essential',
    isVisible: true
  },
  {
    id: 'ai-insights',
    name: 'AI-Powered Insights',
    description: 'Smart recommendations and anomaly detection',
    category: 'essential',
    isVisible: false
  },
  {
    id: 'audience-breakdown',
    name: 'Audience Demographics',
    description: 'Age and gender distribution of your audience',
    category: 'analytics',
    isVisible: false
  },
  {
    id: 'conversion-funnel',
    name: 'Conversion Funnel',
    description: 'Track user journey from impression to purchase',
    category: 'analytics',
    isVisible: false
  },
  {
    id: 'performance-heatmap',
    name: 'Performance Heatmap',
    description: 'Best times to run ads by day and hour',
    category: 'advanced',
    isVisible: false
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: '7-day forecast with AI-powered predictions',
    category: 'advanced',
    isVisible: false
  },
  {
    id: 'campaigns-table',
    name: 'Campaign Management Table',
    description: 'Manage all your campaigns in one place',
    category: 'essential',
    isVisible: true
  },
  {
    id: 'performance-score',
    name: 'Performance Score',
    description: 'Overall campaign health score (0-100)',
    category: 'essential',
    isVisible: false
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Track spending and remaining budget',
    category: 'essential',
    isVisible: false
  },
  {
    id: 'strategy-insights',
    name: 'Strategy Insights',
    description: 'Additional strategic recommendations',
    category: 'advanced',
    isVisible: false
  },
  {
    id: 'automations',
    name: 'Automation Rules',
    description: 'Auto-pause and scale rules that protect your budget',
    category: 'advanced',
    isVisible: false
  },
  {
    id: 'notifications',
    name: 'Alerts & Notifications',
    description: 'Critical alerts about budget and performance',
    category: 'essential',
    isVisible: false
  }
];

export function AnalyticsPage() {
  const [useGridLayout, setUseGridLayout] = useState(() => {
    const saved = localStorage.getItem('analyticsGridLayout');
    return saved ? JSON.parse(saved) : false;
  });

  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>(() => {
    const saved = localStorage.getItem('analyticsSections');
    return saved ? JSON.parse(saved) : ANALYTICS_SECTIONS;
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [isComparing, setIsComparing] = useState(false);

  const { data, loading } = useAnalyticsData(timeRange, isComparing, 'meta');

  const summary = data?.summary;
  const currentSeries = data?.timeseries.current ?? [];
  const warning = data?.warning;
  const warningMessage = warning
    ? warning === 'meta_insights_daily_missing'
      ? 'Meta-Datenbank-Tabellen fehlen. Bitte Migration ausführen (meta_insights_daily).'
      : 'Analytics-Daten sind noch nicht verfügbar. Bitte später erneut versuchen.'
    : null;
  const warningToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!warningMessage) {
      warningToastRef.current = null;
      return;
    }
    if (warningToastRef.current === warningMessage) return;
    toast.info(warningMessage);
    warningToastRef.current = warningMessage;
  }, [warningMessage]);


  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const formatDeltaPct = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return 0;
    return Math.round(value * 1000) / 10;
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
  const dailySpendAvg =
    currentSeries.length > 0 ? totalSpend / currentSeries.length : 0;

  const handleToggleGridLayout = () => {
    const newValue = !useGridLayout;
    setUseGridLayout(newValue);
    localStorage.setItem('analyticsGridLayout', JSON.stringify(newValue));
    toast.success(
      newValue ? 'Switched to Grid Layout' : 'Switched to List Layout',
      { duration: 2000 }
    );
  };

  const handleToggleSection = (id: string) => {
    const updated = dashboardSections.map(section =>
      section.id === id ? { ...section, isVisible: !section.isVisible } : section
    );
    setDashboardSections(updated);
    localStorage.setItem('analyticsSections', JSON.stringify(updated));

    const section = updated.find(s => s.id === id);
    toast.success(
      section?.isVisible ? `${section.name} activated` : `${section?.name} hidden`,
      { duration: 2000 }
    );
  };

  const handleResetToDefaults = () => {
    setDashboardSections(ANALYTICS_SECTIONS);
    localStorage.setItem('analyticsSections', JSON.stringify(ANALYTICS_SECTIONS));
    toast.success('Analytics reset to default settings', { duration: 2000 });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const visibleSections = dashboardSections.filter(s => s.isVisible);
    const newVisibleSections = [...visibleSections];

    [newVisibleSections[index], newVisibleSections[index - 1]] =
      [newVisibleSections[index - 1], newVisibleSections[index]];

    const hiddenSections = dashboardSections.filter(s => !s.isVisible);
    const updatedSections = [...newVisibleSections, ...hiddenSections];

    setDashboardSections(updatedSections);
    localStorage.setItem('analyticsSections', JSON.stringify(updatedSections));

    toast.success(`Moved ${visibleSections[index].name} up`, { duration: 1500 });
  };

  const handleMoveDown = (index: number) => {
    const visibleSections = dashboardSections.filter(s => s.isVisible);
    if (index === visibleSections.length - 1) return;

    const newVisibleSections = [...visibleSections];

    [newVisibleSections[index], newVisibleSections[index + 1]] =
      [newVisibleSections[index + 1], newVisibleSections[index]];

    const hiddenSections = dashboardSections.filter(s => !s.isVisible);
    const updatedSections = [...newVisibleSections, ...hiddenSections];

    setDashboardSections(updatedSections);
    localStorage.setItem('analyticsSections', JSON.stringify(updatedSections));

    toast.success(`Moved ${visibleSections[index].name} down`, { duration: 1500 });
  };

  const visibleSections = dashboardSections.filter(s => s.isVisible);

  // Render individual widget content based on section ID
  const renderPreview = (node: JSX.Element) => (
    <div className="relative">
      <div className="absolute right-3 top-3 rounded-full bg-amber-500/20 text-amber-600 text-xs px-2 py-1 border border-amber-500/30">
        Preview
      </div>
      {node}
    </div>
  );

  const renderWidgetContent = (sectionId: string) => {
    switch (sectionId) {
      case 'notifications':
        return (
          <Card className="hidden md:block overflow-hidden">
            <Suspense fallback={<WidgetPlaceholder title="Loading alerts..." />}>
              {renderPreview(<LazyNotificationBanner />)}
            </Suspense>
          </Card>
        );

      case 'performance-score':
        return (
          <Card className="hidden md:block p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading score..." />}>
              {renderPreview(<LazyPerformanceScore />)}
            </Suspense>
          </Card>
        );

      case 'budget-tracker':
        return (
          <Card className="hidden md:block p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading budget..." />}>
              {renderPreview(<LazyBudgetTracker />)}
            </Suspense>
          </Card>
        );

      case 'metrics':
        return (
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-1">Campaign Performance</h3>
                <p className="text-sm text-muted-foreground">Real-time analytics overview</p>
              </div>
              <div className="px-3 py-1.5 bg-muted border border-border rounded-lg w-fit">
                <span className="text-xs text-foreground font-medium whitespace-nowrap">
                  {loading ? '● Loading' : '● Live'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="p-5 md:p-6 rounded-lg bg-muted/30 border border-border">
                <div className="text-3xl md:text-4xl text-foreground mb-2 font-bold">
                  {formatCurrency(totalSpend)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">Total Ad Spend</div>
                <div className="text-xs text-muted-foreground">
                  Daily avg: {formatCurrency(dailySpendAvg)}
                </div>
              </div>
              <div className="p-5 md:p-6 rounded-lg bg-muted/30 border border-border">
                <div className="text-3xl md:text-4xl text-foreground mb-2 font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
                <div className="text-xs text-muted-foreground">
                  Return on investment: {(summary?.roas ?? 0).toFixed(2)}x
                </div>
              </div>
            </div>

            <Suspense fallback={<WidgetPlaceholder title="Loading metrics..." />}>
              <div className="grid grid-cols-1 gap-4">
                <LazyAdMetricsCard
                  title="Impressions"
                  value={formatCompact(totalImpressions)}
                  subValue={`Clicks: ${formatCompact(totalClicks)}`}
                  percentage={formatDeltaPct(summary?.deltas?.impressions)}
                  isPositive={(summary?.deltas?.impressions ?? 0) >= 0}
                  icon={<Eye className="w-5 h-5" />}
                  color="#3b82f6"
                  tooltip="Total number of times your ads were shown to users"
                />
                <LazyAdMetricsCard
                  title="Click-through rate"
                  value={`${(summary?.ctr ?? 0).toFixed(2)}%`}
                  subValue={`Impressions: ${formatCompact(totalImpressions)}`}
                  percentage={formatDeltaPct(summary?.deltas?.ctr)}
                  isPositive={(summary?.deltas?.ctr ?? 0) >= 0}
                  icon={<MousePointerClick className="w-5 h-5" />}
                  color="#10b981"
                  tooltip="Percentage of impressions that resulted in clicks"
                />
                <LazyAdMetricsCard
                  title="Cost per acquisition"
                  value={formatCurrency(averageCpa)}
                  subValue={`Conversions: ${formatCompact(totalConversions)}`}
                  percentage={formatDeltaPct(summary?.deltas?.cpa)}
                  isPositive={(summary?.deltas?.cpa ?? 0) <= 0}
                  icon={<DollarSign className="w-5 h-5" />}
                  color="#f59e0b"
                  tooltip="Average cost you pay for each conversion"
                />
                <LazyAdMetricsCard
                  title="Return on ad spend"
                  value={`${(summary?.roas ?? 0).toFixed(2)}x`}
                  subValue={`Revenue: ${formatCurrency(totalRevenue)}`}
                  percentage={formatDeltaPct(summary?.deltas?.roas)}
                  isPositive={(summary?.deltas?.roas ?? 0) >= 0}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="#8b5cf6"
                  tooltip="Revenue generated for every dollar spent on advertising"
                />
              </div>
            </Suspense>
          </Card>
        );

      case 'ai-insights':
        return (
          <Card className="overflow-hidden">
            <Suspense fallback={<WidgetPlaceholder title="Loading AI insights..." />}>
              {renderPreview(<LazyAIInsightsPanel />)}
            </Suspense>
          </Card>
        );

      case 'performance-chart':
        return (
          <Card className="overflow-hidden">
            <Suspense fallback={<WidgetPlaceholder title="Loading chart..." />}>
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
        );

      case 'audience-breakdown':
        return (
          <Card className="p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading audience..." />}>
              {renderPreview(<LazyAudienceBreakdown />)}
            </Suspense>
          </Card>
        );

      case 'conversion-funnel':
        return (
          <Card className="p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading funnel..." />}>
              {renderPreview(<LazyConversionFunnel />)}
            </Suspense>
          </Card>
        );

      case 'performance-heatmap':
        return (
          <Card className="p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading heatmap..." />}>
              {renderPreview(<LazyPerformanceHeatmap />)}
            </Suspense>
          </Card>
        );

      case 'predictive-analytics':
        return (
          <Card className="p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading forecast..." />}>
              {renderPreview(<LazyPredictiveAnalytics />)}
            </Suspense>
          </Card>
        );

      case 'strategy-insights':
        return (
          <Card>
            <Suspense fallback={<WidgetPlaceholder title="Loading strategies..." />}>
              {renderPreview(<LazyStrategyInsights />)}
            </Suspense>
          </Card>
        );

      case 'campaigns-table':
        return (
          <Card className="overflow-hidden">
            <Suspense fallback={<WidgetPlaceholder title="Loading campaigns..." />}>
              <LazyCampaignsTable campaigns={data?.campaigns ?? []} />
            </Suspense>
          </Card>
        );

      case 'automations':
        return (
          <Card className="p-6">
            <Suspense fallback={<WidgetPlaceholder title="Loading automations..." />}>
              {renderPreview(<LazyAutomatedRulesManager />)}
            </Suspense>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <PageShell>
      <HeroHeader
        title="Analytics"
        subtitle="Performance insights, trends, and campaign reporting."
        chips={
          <div className="flex flex-wrap gap-2">
            <Chip>{useGridLayout ? '📊 Grid' : '📋 List'}</Chip>
            <Chip>{timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}</Chip>
          </div>
        }
      />

      {/* ═══════════════════════════════════════════════════════════
          MOBILE-FIRST ANALYTICS CONTROLS
          Mobile: Compact time range selector
          Desktop: Full control panel
          ═══════════════════════════════════════════════════════════ */}

      {/* MOBILE CONTROLS - Simplified */}
      <Card className="block md:hidden p-4">
        {/* Compact Time Range & Compare Toggle */}
        <div className="flex items-center gap-2 w-full">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'custom')}
            className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${isComparing
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-foreground border-border'
              }`}
          >
            Compare
          </button>
        </div>
      </Card>

      {/* DESKTOP CONTROL PANEL */}
      <Card className="hidden md:block p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Customize Your Workspace</h3>
            <p className="text-sm text-muted-foreground">Add widgets, change layout, and configure data views</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleToggleGridLayout}
              variant={useGridLayout ? 'default' : 'outline'}
              className={useGridLayout ? 'bg-primary text-primary-foreground' : ''}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid Layout
            </Button>
            <DashboardCustomizer
              sections={dashboardSections}
              onToggleSection={handleToggleSection}
              onResetToDefaults={handleResetToDefaults}
            />
          </div>
        </div>

        <TimeRangeFilter
          onRangeChange={setTimeRange}
          onCompareToggle={setIsComparing}
        />
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          WIDGET STACK - MOBILE OPTIMIZED
          Mobile: Vertical stack, priority-based order
          Desktop: Grid or List layout
          ═══════════════════════════════════════════════════════════ */}

      {/* MOBILE WIDGET STACK - Vertical, No Grid */}
      <div className="block md:hidden space-y-4 w-full overflow-x-hidden">
        {visibleSections.map((section) => (
          <div key={section.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full overflow-x-hidden">
            {renderWidgetContent(section.id)}
          </div>
        ))}

        {/* Mobile Hint - Customize on Desktop */}
        <div className="p-4 bg-muted/50 border border-border rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            💡 Customize widgets and layout on desktop
          </p>
        </div>
      </div>

      {/* DESKTOP LAYOUT - Grid or List with Reorder */}
      <div className="hidden md:block">
        {useGridLayout ? (
          <Suspense fallback={<WidgetPlaceholder title="Loading grid..." />}>
            <LazyAppleGridDashboard />
          </Suspense>
        ) : (
          <div className="space-y-6">
            {visibleSections.map((section, index) => (
              <ReorderableWidget
                key={section.id}
                id={section.id}
                index={index}
                totalCount={visibleSections.length}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              >
                {renderWidgetContent(section.id)}
              </ReorderableWidget>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
