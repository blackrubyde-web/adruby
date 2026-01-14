import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  ShieldCheck,
  ListChecks,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOverview } from '../hooks/useOverview';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SelectField } from './ui/select-field';
import { useAuthActions, useAuthState } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ReferralServicesWidget } from './referral/ReferralServicesWidget';

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
    <div className="h-[280px] rounded-2xl border border-border/60 bg-muted/10 animate-pulse flex items-center justify-center">
      <span className="text-sm text-muted-foreground">{title}</span>
    </div>
  );
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('meta');
  const { user, profile } = useAuthState();
  const { refreshProfile } = useAuthActions();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);

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
        onNavigate('studio');
      },
    },
    {
      id: 'generate-creatives',
      title: 'Generate AI ad creatives',
      description: 'Use AI to create high-performing ad variations',
      completed: false,
      actionLabel: 'Generate',
      onAction: () => {
        onNavigate('studio');
      },
    },
    {
      id: 'enable-optimization',
      title: 'Enable AI optimization rules',
      description: 'Let AI automatically optimize your campaigns',
      completed: false,
      actionLabel: 'Enable',
      onAction: () => {
        onNavigate('aianalysis');
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

  const profileSettings = useMemo(() => {
    const raw = profile?.settings;
    if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
    return {};
  }, [profile?.settings]);

  const goalDefaults = useMemo(() => {
    const goals = profileSettings.goals as { roasTarget?: number; spendCap?: number; revenueGoal?: number } | undefined;
    return {
      roasTarget: goals?.roasTarget ?? 3.5,
      spendCap: goals?.spendCap ?? 6000,
      revenueGoal: goals?.revenueGoal ?? 18000,
    };
  }, [profileSettings]);

  const [goalDraft, setGoalDraft] = useState({
    roasTarget: goalDefaults.roasTarget.toString(),
    spendCap: goalDefaults.spendCap.toString(),
    revenueGoal: goalDefaults.revenueGoal.toString(),
  });

  useEffect(() => {
    setGoalDraft({
      roasTarget: goalDefaults.roasTarget.toString(),
      spendCap: goalDefaults.spendCap.toString(),
      revenueGoal: goalDefaults.revenueGoal.toString(),
    });
  }, [goalDefaults]);

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
  const warning = data?.warning || null;
  const warningMessage = useMemo(() => {
    if (!warning) return null;
    if (warning === 'meta_not_connected') {
      return 'Meta ist noch nicht verbunden. Verbinde dein Konto, um Live-Daten und Scores zu sehen.';
    }
    if (warning === 'meta_no_data') {
      return 'Keine Meta-Daten gefunden. Bitte Sync starten, sobald Meta verbunden ist.';
    }
    if (warning === 'meta_insights_daily_missing') {
      return 'Meta-Datenbank-Tabellen fehlen. Bitte Migration ausführen (meta_insights_daily).';
    }
    return 'Daten sind aktuell unvollständig. Bitte später erneut versuchen.';
  }, [warning]);
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
      onClick: () => onNavigate('studio'),
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

  const roasTarget = goalDefaults.roasTarget;
  const spendCap = goalDefaults.spendCap;
  const revenueGoal = goalDefaults.revenueGoal;

  const spendProgress = Math.min(100, ((data?.kpis.spend ?? 0) / spendCap) * 100);
  const revenueProgress = Math.min(100, ((data?.kpis.revenue ?? 0) / revenueGoal) * 100);
  const roasProgress = Math.min(100, ((data?.kpis.roas ?? 0) / roasTarget) * 100);

  const handleOpenGoals = () => {
    setGoalDraft({
      roasTarget: roasTarget.toString(),
      spendCap: spendCap.toString(),
      revenueGoal: revenueGoal.toString(),
    });
    setIsEditingGoals(true);
  };

  const handleSaveGoals = async () => {
    if (!user?.id) {
      toast.error('Bitte zuerst anmelden.');
      return;
    }
    const toNumber = (value: string, fallback: number) => {
      const parsed = Number(value.replace(',', '.'));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };
    const nextGoals = {
      roasTarget: toNumber(goalDraft.roasTarget, roasTarget),
      spendCap: toNumber(goalDraft.spendCap, spendCap),
      revenueGoal: toNumber(goalDraft.revenueGoal, revenueGoal),
    };

    setIsSavingGoals(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          settings: {
            ...profileSettings,
            goals: nextGoals,
          },
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setIsEditingGoals(false);
      toast.success('Ziele gespeichert');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ziele konnten nicht gespeichert werden.';
      toast.error(message);
    } finally {
      setIsSavingGoals(false);
    }
  };

  return (
    <DashboardShell
      title="Overview"
      subtitle="Here's what's happening with your campaigns today"
      headerChips={
        <div className="flex flex-wrap gap-2">
          <Badge variant={metaConnected ? "secondary" : "default"} className="px-3 py-1">
            {metaConnected ? 'Meta connected' : 'Meta not connected'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">Range: {dateFilter}</Badge>
          <Badge variant="outline" className="px-3 py-1">Channel: {channelFilter}</Badge>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <SelectField
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="text-sm py-2 px-3 rounded-lg"
          wrapperClassName="min-w-[140px]"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </SelectField>

        {/* Channel Filter */}
        <SelectField
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
          className="text-sm py-2 px-3 rounded-lg"
          wrapperClassName="min-w-[140px]"
        >
          <option value="meta">Meta Ads</option>
          <option value="google">Google Ads</option>
          <option value="tiktok">TikTok Ads</option>
        </SelectField>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi, index) => (
          <Card key={index} variant="glass" className="hover:-translate-y-0.5 transition-all duration-300">
            {/* Accent Line - replaced with simpler border-t highlight via class if needed, or keep the div */}
            <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-gradient-to-r from-primary/40 to-primary/10" />

            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-body-sm text-muted-foreground mb-2 font-medium">{kpi.label}</div>
                  <div className="text-h3 text-foreground mb-2">
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md ${kpi.isPositive
                        ? 'text-green-600 bg-green-500/10'
                        : 'text-muted-foreground bg-muted/50'
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

                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section - Shopify Style (KPIs → Charts → Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Spend vs Revenue - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ChartPlaceholder title="Loading spend vs revenue" />}>
            <LazySpendRevenueChart
              points={data?.timeseries ?? []}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>

          {/* Getting Started Card */}
          <Card variant="glass" className="group">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-h5 text-foreground mb-1">
                    Getting Started
                  </h2>
                  <p className="text-body-sm text-muted-foreground">
                    Unlock the full power in 5 minutes
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {completedSteps}/{totalSteps}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-primary to-rose-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Checklist Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${step.completed
                      ? 'bg-muted/30 border-border/50'
                      : 'bg-background/50 border-border hover:border-primary/30 hover:shadow-sm'
                      }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-sm mb-0.5 ${step.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                          }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {step.description}
                      </div>

                      {!step.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={step.onAction}
                          className="w-full h-8 text-xs"
                        >
                          {step.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: ROAS, Referral, Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Suspense fallback={<ChartPlaceholder title="Loading ROAS trend" />}>
            <LazyRoasMiniChart
              points={(data?.timeseries ?? []).map(p => ({ ts: p.ts, roas: p.roas }))}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>

          <ReferralServicesWidget />

          {/* Action Center */}
          <Card variant="glass">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Action Center</CardTitle>
                  <CardDescription>Focused next steps</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {actions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/50 p-4 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{item.title}</span>
                        <Badge
                          variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'default'}
                          className="text-[10px] h-5 px-1.5"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    className="w-full h-8 text-xs bg-muted/50 hover:bg-primary hover:text-primary-foreground"
                  >
                    {item.cta}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card variant="glass">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Goals</CardTitle>
                  <CardDescription>Budget & ROAS targets</CardDescription>
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ROAS */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">ROAS Target</span>
                  <span className="font-bold">{(data?.kpis.roas ?? 0).toFixed(2)}x / {roasTarget.toFixed(1)}x</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${roasProgress}%` }} />
                </div>
              </div>

              {/* Spend */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Spend Cap</span>
                  <span className="font-bold">{formatCurrency(data?.kpis.spend ?? 0)} / {formatCurrency(spendCap)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${spendProgress}%` }} />
                </div>
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Revenue Goal</span>
                  <span className="font-bold">{formatCurrency(data?.kpis.revenue ?? 0)} / {formatCurrency(revenueGoal)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${revenueProgress}%` }} />
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleOpenGoals}>
                Edit Goals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Top Campaign */}
        <Card variant="glass" className="hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-h5 text-foreground">Top Campaign</h3>
                <p className="text-body-sm text-muted-foreground">Highest ROAS (24h)</p>
              </div>
              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                Top Performer
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-xl font-bold text-foreground">{topCampaign.name}</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ROAS</div>
                  <div className="text-lg font-bold text-primary">{topCampaign.roas}x</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Spend</div>
                  <div className="text-lg font-bold">€{(topCampaign.spend / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                  <div className="text-lg font-bold">€{(topCampaign.revenue / 1000).toFixed(1)}K</div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 group"
                onClick={() => onNavigate('campaigns')}
              >
                View Campaign <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Best Creative */}
        <Card variant="glass" className="hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-h5 text-foreground">Best Creative</h3>
                <p className="text-body-sm text-muted-foreground">Highest AI Score</p>
              </div>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                AI Insight
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-xl font-bold text-foreground">{bestCreative.name}</div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Performance Score</span>
                  <span className="text-primary">{bestCreative.aiScore}/100</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${bestCreative.aiScore}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">CTR</div>
                  <div className="text-lg font-bold">{bestCreative.ctr}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Conversions</div>
                  <div className="text-lg font-bold">{bestCreative.conversions}</div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 group"
                onClick={() => onNavigate('analytics')}
              >
                View Analytics <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditingGoals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Edit goals</CardTitle>
                  <CardDescription>Update your targets for this workspace</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingGoals(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ROAS Target</label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={goalDraft.roasTarget}
                  onChange={(e) => setGoalDraft({ ...goalDraft, roasTarget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Spend Cap</label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={goalDraft.spendCap}
                  onChange={(e) => setGoalDraft({ ...goalDraft, spendCap: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Revenue Goal</label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={goalDraft.revenueGoal}
                  onChange={(e) => setGoalDraft({ ...goalDraft, revenueGoal: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditingGoals(false)}>Cancel</Button>
                <Button onClick={handleSaveGoals} disabled={isSavingGoals}>
                  {isSavingGoals ? 'Saving...' : 'Save Goals'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
