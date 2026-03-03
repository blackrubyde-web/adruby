import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Zap,

  ListChecks,
  Wand2,
  ArrowRight,

} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SelectField } from './ui/select-field';
import { DashboardShell } from './layout/DashboardShell';
import { useOverview } from '../hooks/useOverview';
import { useAuthState } from '../contexts/AuthContext';

import { MetricCardSkeleton, ChartSkeleton } from '../lib/skeletons';
import { formatCurrency, formatCompact, formatDeltaRaw as formatDelta } from '../utils/formatters';

// Extracted overview widgets
import { KpiCardGrid, type KpiItem } from './overview/KpiCardGrid';
import { GettingStartedChecklist, type ChecklistStep } from './overview/GettingStartedChecklist';
import { GoalsPanel } from './overview/GoalsPanel';

const LazySpendRevenueChart = lazy(() =>
  import('./SpendRevenueChart').then((mod) => ({ default: mod.SpendRevenueChart }))
);
const LazyRoasMiniChart = lazy(() =>
  import('./RoasMiniChart').then((mod) => ({ default: mod.RoasMiniChart }))
);

interface OverviewPageProps {
  onNavigate: (page: string, query?: Record<string, string>) => void;
}

type DateFilter = 'today' | '7d' | '30d';
type ChannelFilter = 'meta' | 'google' | 'tiktok';

function ChartPlaceholder() {
  return <ChartSkeleton />;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('meta');
  useAuthState();

  // Fetch data with hook
  const { data, loading, error } = useOverview(dateFilter, channelFilter);

  // Checklist State
  const [checklistSteps, setChecklistSteps] = useState<ChecklistStep[]>([
    {
      id: 'connect-meta',
      title: 'Meta Ads Konto verbinden',
      description: 'Verknüpfe dein Facebook Business Konto um Kampagnen zu importieren',
      completed: false,
      actionLabel: 'Verbinden',
      onAction: () => { onNavigate('settings', { tab: 'integrations' }); },
    },
    {
      id: 'create-campaign',
      title: 'Erste Kampagne erstellen',
      description: 'Starte eine Kampagne um Ergebnisse zu erzielen',
      completed: false,
      actionLabel: 'Erstellen',
      onAction: () => { onNavigate('studio'); },
    },
    {
      id: 'generate-creatives',
      title: 'KI Ad Creatives generieren',
      description: 'Nutze KI für hochperformante Ad-Varianten',
      completed: false,
      actionLabel: 'Generieren',
      onAction: () => { onNavigate('studio'); },
    },
    {
      id: 'enable-optimization',
      title: 'KI-Optimierung aktivieren',
      description: 'Lass KI deine Kampagnen automatisch optimieren',
      completed: false,
      actionLabel: 'Aktivieren',
      onAction: () => { onNavigate('aianalysis'); },
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

  const metaStep = data?.onboarding?.steps?.find((step) => step.id === 'connect-meta');
  const metaConnected = Boolean(metaStep?.completed);
  const warning = data?.warning || null;
  const warningMessage = useMemo(() => {
    if (!warning) return null;
    if (warning === 'meta_not_connected') return 'Meta ist noch nicht verbunden. Verbinde dein Konto, um Live-Daten und Scores zu sehen.';
    if (warning === 'meta_no_data') return 'Keine Meta-Daten gefunden. Bitte Sync starten, sobald Meta verbunden ist.';
    if (warning === 'meta_insights_daily_missing') return 'Meta-Datenbank-Tabellen fehlen. Bitte Migration ausführen (meta_insights_daily).';
    return 'Daten sind aktuell unvollständig. Bitte später erneut versuchen.';
  }, [warning]);
  const warningToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!warningMessage) { warningToastRef.current = null; return; }
    if (warningToastRef.current === warningMessage) return;
    toast.info(warningMessage);
    warningToastRef.current = warningMessage;
  }, [warningMessage]);

  // KPI Data
  const kpis: KpiItem[] = [
    {
      label: 'Ausgaben gesamt',
      value: formatCurrency(data?.kpis.spend ?? 0),
      change: formatDelta(data?.kpis.spendChangePct),
      isPositive: (data?.kpis.spendChangePct ?? 0) <= 0,
      comparison: `vs. letzte ${dateFilter === 'today' ? 'Tag' : dateFilter}`,
      icon: <DollarSign className="w-5 h-5" />,
      accentColor: '#3b82f6',
    },
    {
      label: 'Umsatz gesamt',
      value: formatCurrency(data?.kpis.revenue ?? 0),
      change: formatDelta(data?.kpis.revenueChangePct),
      isPositive: (data?.kpis.revenueChangePct ?? 0) >= 0,
      comparison: `vs. letzte ${dateFilter === 'today' ? 'Tag' : dateFilter}`,
      icon: <TrendingUp className="w-5 h-5" />,
      accentColor: '#10b981',
    },
    {
      label: 'Ø ROAS',
      value: `${(data?.kpis.roas ?? 0).toFixed(2)}x`,
      change: formatDelta(data?.kpis.roasChangePct, '%'),
      isPositive: (data?.kpis.roasChangePct ?? 0) >= 0,
      comparison: `vs. letzte ${dateFilter === 'today' ? 'Tag' : dateFilter}`,
      icon: <Target className="w-5 h-5" />,
      accentColor: '#8b5cf6',
    },
    {
      label: 'Aktive Kampagnen',
      value: formatCompact(data?.kpis.activeCampaigns ?? 0),
      change: data?.kpis.activeCampaigns ? `+${data.kpis.activeCampaigns}` : '—',
      isPositive: true,
      comparison: `vs. letzte ${dateFilter === 'today' ? 'Tag' : dateFilter}`,
      icon: <Zap className="w-5 h-5" />,
      accentColor: '#f59e0b',
    },
  ];

  const topCampaign = data?.topCampaign ?? { name: 'Noch keine Kampagnen', roas: 0, spend: 0, revenue: 0 };
  const bestCreative = data?.bestCreative ?? { name: 'Verbinde Meta um Creatives zu generieren', aiScore: 0, ctr: 0, conversions: 0 };

  const actions = [
    {
      id: 'meta-connect',
      title: metaConnected ? 'Meta verbunden' : 'Meta Ads verbinden',
      description: metaConnected
        ? 'Dein Konto ist verknüpft. Synchronisiere jetzt aktuelle Performance-Daten.'
        : 'Schalte Live-Kampagnenmetriken und ROAS-Tracking in Minuten frei.',
      priority: metaConnected ? 'low' : 'high',
      cta: metaConnected ? 'Jetzt synchronisieren' : 'Verbinden',
      icon: <Zap className="w-5 h-5 text-primary" />,
      onClick: () => onNavigate('settings', { tab: 'integrations' }),
    },
    {
      id: 'creative-run',
      title: 'Neue Creatives generieren',
      description: 'Starte 3 frische Ad-Varianten gegen Creative Fatigue.',
      priority: 'medium',
      cta: 'Builder öffnen',
      icon: <Wand2 className="w-5 h-5 text-primary" />,
      onClick: () => onNavigate('studio'),
    },
    {
      id: 'campaign-review',
      title: 'Top Kampagnen prüfen',
      description: 'Finde Gewinner und skaliere Budgets mit Vertrauen.',
      priority: 'medium',
      cta: 'Kampagnen ansehen',
      icon: <Target className="w-5 h-5 text-primary" />,
      onClick: () => onNavigate('campaigns'),
    },
  ];

  return (
    <DashboardShell
      title="Übersicht"
      subtitle="Das passiert gerade mit deinen Kampagnen"
      headerChips={
        <div className="flex flex-wrap gap-2">
          <Badge variant={metaConnected ? "secondary" : "default"} className="px-3 py-1">
            {metaConnected ? 'Meta verbunden' : 'Meta nicht verbunden'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">Zeitraum: {dateFilter}</Badge>
          <Badge variant="outline" className="px-3 py-1">Kanal: {channelFilter}</Badge>
        </div>
      }
      hideHero
    >
      {/* Filters */}
      <div className="flex items-center gap-3">
        <SelectField
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="text-sm py-2 px-3 rounded-lg"
          wrapperClassName="min-w-[140px]"
        >
          <option value="today">Heute</option>
          <option value="7d">Letzte 7 Tage</option>
          <option value="30d">Letzte 30 Tage</option>
        </SelectField>
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
      {loading ? <KpiSkeleton /> : <KpiCardGrid kpis={kpis} />}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Charts + Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ChartPlaceholder />}>
            <LazySpendRevenueChart
              points={data?.timeseries ?? []}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>
          <GettingStartedChecklist steps={checklistSteps} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <Suspense fallback={<ChartPlaceholder />}>
            <LazyRoasMiniChart
              points={(data?.timeseries ?? []).map(p => ({ ts: p.ts, roas: p.roas }))}
              range={dateFilter}
              loading={loading}
              error={error}
              metaConnected={metaConnected}
            />
          </Suspense>



          {/* Action Center */}
          <Card variant="glass">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Nächste Schritte</CardTitle>
                  <CardDescription>Deine wichtigsten Aufgaben</CardDescription>
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

          <GoalsPanel kpis={{ roas: data?.kpis.roas ?? 0, spend: data?.kpis.spend ?? 0, revenue: data?.kpis.revenue ?? 0 }} />
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Top Campaign */}
        <Card variant="glass" className="hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-h5 text-foreground">Top Kampagne</h3>
                <p className="text-body-sm text-muted-foreground">Höchster ROAS (24h)</p>
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
                  <div className="text-xs text-muted-foreground mb-1">Ausgaben</div>
                  <div className="text-lg font-bold">€{(topCampaign.spend / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Umsatz</div>
                  <div className="text-lg font-bold">€{(topCampaign.revenue / 1000).toFixed(1)}K</div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 group"
                onClick={() => onNavigate('campaigns')}
              >
                Kampagne ansehen <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Best Creative */}
        <Card variant="glass" className="hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-h5 text-foreground">Bestes Creative</h3>
                <p className="text-body-sm text-muted-foreground">Höchster AI Score</p>
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
                Analytics ansehen <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
