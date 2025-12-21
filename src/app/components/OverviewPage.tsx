import { lazy, Suspense, useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronDown,
  ShieldCheck,
  ListChecks,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOverview } from '../hooks/useOverview';
import { PageShell, HeroHeader, Card, Chip } from './layout';

const LazySpendRevenueChart = lazy(() =>
  import('./SpendRevenueChart').then((mod) => ({ default: mod.SpendRevenueChart }))
);
const LazyRoasMiniChart = lazy(() =>
  import('./RoasMiniChart').then((mod) => ({ default: mod.RoasMiniChart }))
);

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
  onAction: () => void;
}

interface OverviewPageProps {
  onNavigate: (page: string, query?: Record<string, string>) => void;
}

type DateFilter = 'today' | '7d' | '30d';
type ChannelFilter = 'meta' | 'google' | 'tiktok';

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="h-[280px] rounded-2xl border border-border/60 bg-muted/30 animate-pulse flex items-center justify-center">
      <span className="text-sm text-muted-foreground">{title}</span>
    </div>
  );
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('meta');
  
  // Fetch data with hook
  const { data, loading, error } = useOverview(dateFilter, channelFilter);
  
  // Checklist State - will be synced with API data when available
  const [checklistSteps, setChecklistSteps] = useState<ChecklistStep[]>([
    {
      id: 'connect-meta',
      title: 'Connect Meta Ads account',
      description: 'Link your Facebook Business account to import campaigns',
      completed: false,
      actionLabel: 'Connect',
      onAction: () => {
        onNavigate('settings', { tab: 'integrations' });
      },
    },
    {
      id: 'create-campaign',
      title: 'Create your first campaign',
      description: 'Launch a campaign to start getting results',
      completed: false,
      actionLabel: 'Create',
      onAction: () => {
        onNavigate('adbuilder');
      },
    },
    {
      id: 'generate-creatives',
      title: 'Generate AI ad creatives',
      description: 'Use AI to create high-performing ad variations',
      completed: false,
      actionLabel: 'Generate',
      onAction: () => {
        onNavigate('adbuilder');
      },
    },
    {
      id: 'enable-optimization',
      title: 'Enable AI optimization rules',
      description: 'Let AI automatically optimize your campaigns',
      completed: false,
      actionLabel: 'Enable',
      onAction: () => {
        onNavigate('strategies');
      },
    },
  ]);

  useEffect(() => {
    if (!data?.onboarding?.steps?.length) return;
    setChecklistSteps(prev =>
      prev.map(step => {
        const remote = data.onboarding.steps.find((s) => s.id === step.id);
        return remote ? { ...step, completed: remote.completed } : step;
      })
    );
  }, [data?.onboarding?.steps]);

  const completedSteps = checklistSteps.filter(s => s.completed).length;
  const totalSteps = checklistSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const formatDelta = (value?: number | null, suffix = '%') => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}${suffix}`;
  };

  // KPI Data
  const kpis = [
    {
      label: 'Total Spend',
      value: formatCurrency(data?.kpis.spend ?? 0),
      change: formatDelta(data?.kpis.spendChangePct),
      isPositive: (data?.kpis.spendChangePct ?? 0) <= 0,
      comparison: `vs last ${dateFilter}`,
      icon: <DollarSign className="w-5 h-5 text-primary" />,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(data?.kpis.revenue ?? 0),
      change: formatDelta(data?.kpis.revenueChangePct),
      isPositive: (data?.kpis.revenueChangePct ?? 0) >= 0,
      comparison: `vs last ${dateFilter}`,
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
    },
    {
      label: 'Average ROAS',
      value: `${(data?.kpis.roas ?? 0).toFixed(2)}x`,
      change: formatDelta(data?.kpis.roasChangePct, '%'),
      isPositive: (data?.kpis.roasChangePct ?? 0) >= 0,
      comparison: `vs last ${dateFilter}`,
      icon: <Target className="w-5 h-5 text-primary" />,
    },
    {
      label: 'Active Campaigns',
      value: formatCompact(data?.kpis.activeCampaigns ?? 0),
      change: data?.kpis.activeCampaigns ? `+${data.kpis.activeCampaigns}` : '—',
      isPositive: true,
      comparison: `vs last ${dateFilter}`,
      icon: <Zap className="w-5 h-5 text-primary" />,
    },
  ];

  const topCampaign = data?.topCampaign ?? {
    name: 'No campaigns yet',
    roas: 0,
    spend: 0,
    revenue: 0,
  };

  const bestCreative = data?.bestCreative ?? {
    name: 'Connect Meta to generate creatives',
    aiScore: 0,
    ctr: 0,
    conversions: 0,
  };

  const metaStep = data?.onboarding?.steps?.find((step) => step.id === 'connect-meta');
  const metaConnected = Boolean(metaStep?.completed);

  const actions = [
    {
      id: 'meta-connect',
      title: metaConnected ? 'Meta connected' : 'Connect Meta Ads',
      description: metaConnected
        ? 'Your account is linked. Sync fresh performance data now.'
        : 'Unlock live campaign metrics and ROAS tracking in minutes.',
      priority: metaConnected ? 'low' : 'high',
      cta: metaConnected ? 'Sync now' : 'Connect',
      icon: <Zap className="w-5 h-5 text-primary" />,
      onClick: () =>
        metaConnected
          ? onNavigate('settings', { tab: 'integrations' })
          : onNavigate('settings', { tab: 'integrations' }),
    },
    {
      id: 'creative-run',
      title: 'Generate new creatives',
      description: 'Launch 3 fresh ad variations to fight creative fatigue.',
      priority: 'medium',
      cta: 'Open builder',
      icon: <Wand2 className="w-5 h-5 text-primary" />,
      onClick: () => onNavigate('adbuilder'),
    },
    {
      id: 'campaign-review',
      title: 'Review top campaigns',
      description: 'Spot winners and scale budgets with confidence.',
      priority: 'medium',
      cta: 'View campaigns',
      icon: <Target className="w-5 h-5 text-primary" />,
      onClick: () => onNavigate('campaigns'),
    },
  ];

  const roasTarget = 3.5;
  const spendCap = 6000;
  const revenueGoal = 18000;

  const spendProgress = Math.min(100, ((data?.kpis.spend ?? 0) / spendCap) * 100);
  const revenueProgress = Math.min(100, ((data?.kpis.revenue ?? 0) / revenueGoal) * 100);
  const roasProgress = Math.min(100, ((data?.kpis.roas ?? 0) / roasTarget) * 100);

  return (
    <PageShell>
      <HeroHeader
        title="Overview"
        subtitle="Here's what's happening with your campaigns today"
        chips={
          <div className="flex flex-wrap gap-2">
            <Chip>{metaConnected ? 'Meta connected' : 'Meta not connected'}</Chip>
            <Chip>Range: {dateFilter}</Chip>
            <Chip>Channel: {channelFilter}</Chip>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="appearance-none pl-3 pr-8 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Channel Filter */}
        <div className="relative">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
            className="appearance-none pl-3 pr-8 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
            <option value="tiktok">TikTok Ads</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-5 hover:-translate-y-0.5 transition-all duration-300">
            {/* Accent Line */}
            <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl bg-primary/40" />
            
            {/* Content */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">{kpi.label}</div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      kpi.isPositive ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {kpi.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {kpi.change}
                  </span>
                  <span className="text-muted-foreground">{kpi.comparison}</span>
                </div>
              </div>

              {/* Icon Badge */}
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                {kpi.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section - Shopify Style (KPIs → Charts → Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {/* Spend vs Revenue - 2/3 width */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartPlaceholder title="Loading spend vs revenue" />}>
            <LazySpendRevenueChart
              points={data?.timeseries ?? []}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>
        </div>
        
        {/* ROAS Trend - 1/3 width */}
        <div className="lg:col-span-1">
          <Suspense fallback={<ChartPlaceholder title="Loading ROAS trend" />}>
            <LazyRoasMiniChart
              points={(data?.timeseries ?? []).map(p => ({ ts: p.ts, roas: p.roas }))}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>
        </div>
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">
                Action Center
              </h3>
              <p className="text-sm text-muted-foreground">
                Focused next steps to improve results
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            {actions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          item.priority === 'high'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : item.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={item.onClick}
                  className="w-full sm:w-auto px-3 py-2 bg-muted hover:bg-muted/80 border border-border text-xs font-semibold rounded-lg transition-all"
                >
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">
                Goals & Guardrails
              </h3>
              <p className="text-sm text-muted-foreground">
                Stay within budget and hit your ROAS target
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">ROAS target</span>
                <span className="font-semibold text-foreground">
                  {(data?.kpis.roas ?? 0).toFixed(2)}x / {roasTarget.toFixed(1)}x
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${roasProgress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Spend cap</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(data?.kpis.spend ?? 0)} / {formatCurrency(spendCap)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${spendProgress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Revenue goal</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(data?.kpis.revenue ?? 0)} / {formatCurrency(revenueGoal)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${revenueProgress}%` }} />
              </div>
            </div>

            <button
              onClick={() => toast.info('Goal settings coming soon')}
              className="w-full px-3 py-2 bg-background hover:bg-muted border border-border text-xs font-semibold rounded-lg transition-all"
            >
              Edit goals
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started Card (Shopify-style) */}
      <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_0_rgba(255,255,255,0.6),0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-300 p-6 sm:p-8 mb-6 sm:mb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">
              Getting Started
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlock the full power in 5 minutes
            </p>
          </div>
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {completedSteps}/{totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary/80 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Checklist Steps - 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                step.completed
                  ? 'bg-muted/30 border-border/50'
                  : 'bg-background border-border hover:border-border/80'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5 shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold tracking-tight mb-0.5 ${
                    step.completed
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {step.description}
                </div>
                
                {/* Action Button */}
                {!step.completed && (
                  <button
                    onClick={step.onAction}
                    className="w-full px-3 py-1.5 bg-background hover:bg-muted border border-border text-foreground text-xs font-medium rounded-lg transition-all active:scale-[0.98]"
                  >
                    {step.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightweight Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Top Performing Campaign */}
        <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_0_rgba(255,255,255,0.6),0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">
                Top Performing Campaign Today
              </h3>
              <p className="text-sm text-muted-foreground">
                Highest ROAS in the last 24 hours
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-lg font-semibold tracking-tight text-foreground mb-2">
                {topCampaign.name}
              </div>
              
              {/* Visual Element: ROAS Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                  Top performer
                </span>
                <span className="text-xs text-muted-foreground">High confidence</span>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-muted-foreground">
                  ROAS:{' '}
                  <span className="font-semibold tracking-tight text-foreground">
                    {topCampaign.roas}x
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Spend:{' '}
                  <span className="font-mono text-foreground">
                    €{(topCampaign.spend / 1000).toFixed(1)}K
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Revenue:{' '}
                  <span className="font-mono text-foreground">
                    €{(topCampaign.revenue / 1000).toFixed(1)}K
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('campaigns')}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all campaigns
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Best Creative (AI Score) */}
        <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_0_rgba(255,255,255,0.6),0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">
                Best Creative (AI Score)
              </h3>
              <p className="text-sm text-muted-foreground">
                Highest AI performance score
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-lg font-semibold tracking-tight text-foreground mb-2">
                {bestCreative.name}
              </div>
              
              {/* Visual Element: AI Badge + Progress */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/15 font-medium">
                  AI insight
                </span>
                <span className="text-xs text-muted-foreground">High confidence</span>
              </div>

              {/* AI Score Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Performance Score</span>
                  <span className="font-semibold tracking-tight text-primary">{bestCreative.aiScore}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${bestCreative.aiScore}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-muted-foreground">
                  CTR:{' '}
                  <span className="font-mono text-foreground">
                    {bestCreative.ctr}%
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Conv:{' '}
                  <span className="font-mono text-foreground">
                    {bestCreative.conversions}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View analytics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
