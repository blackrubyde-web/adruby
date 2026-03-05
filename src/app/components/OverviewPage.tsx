import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  ListChecks,
  Wand2,
  ArrowRight,
  Trophy,
  Palette,
  Crown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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

function ChartPlaceholder() {
  return <ChartSkeleton />;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Heute' },
  { value: '7d', label: '7 Tage' },
  { value: '30d', label: '30 Tage' },
];


export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
  useAuthState();

  const { data, loading, error } = useOverview(dateFilter, 'meta');

  // Trial banner dismiss
  const [trialDismissed, setTrialDismissed] = useState(() => {
    try { return localStorage.getItem('adruby_trial_dismissed') === '1'; } catch { return false; }
  });

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
      onAction: () => { onNavigate('campaigns'); },
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
    // Only show each warning toast once per session
    const toastKey = `overview_toast_shown:${warningMessage}`;
    try { if (sessionStorage.getItem(toastKey)) return; } catch { /* ignore */ }
    toast.info(warningMessage);
    warningToastRef.current = warningMessage;
    try { sessionStorage.setItem(toastKey, '1'); } catch { /* ignore */ }
  }, [warningMessage]);

  // Extract sparkline data from timeseries
  const spendSparkline = useMemo(() => (data?.timeseries ?? []).map(p => p.spend), [data?.timeseries]);
  const revenueSparkline = useMemo(() => (data?.timeseries ?? []).map(p => p.revenue), [data?.timeseries]);
  const roasSparkline = useMemo(() => (data?.timeseries ?? []).map(p => p.roas), [data?.timeseries]);

  const comparisonLabel = dateFilter === 'today' ? 'vs. Vortag' : dateFilter === '7d' ? 'vs. Vorwoche' : 'vs. Vormonat';

  // KPI Data
  const kpis: KpiItem[] = [
    {
      label: 'Ausgaben gesamt',
      value: formatCurrency(data?.kpis.spend ?? 0),
      change: formatDelta(data?.kpis.spendChangePct),
      isPositive: (data?.kpis.spendChangePct ?? 0) <= 0,
      comparison: comparisonLabel,
      icon: <DollarSign className="w-5 h-5" />,
      accentColor: '#3b82f6',
      sparklineData: spendSparkline.length >= 2 ? spendSparkline : undefined,
    },
    {
      label: 'Umsatz gesamt',
      value: formatCurrency(data?.kpis.revenue ?? 0),
      change: formatDelta(data?.kpis.revenueChangePct),
      isPositive: (data?.kpis.revenueChangePct ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <TrendingUp className="w-5 h-5" />,
      accentColor: '#10b981',
      sparklineData: revenueSparkline.length >= 2 ? revenueSparkline : undefined,
    },
    {
      label: 'Ø ROAS',
      value: `${(data?.kpis.roas ?? 0).toFixed(2)}x`,
      change: formatDelta(data?.kpis.roasChangePct, '%'),
      isPositive: (data?.kpis.roasChangePct ?? 0) >= 0,
      comparison: comparisonLabel,
      icon: <Target className="w-5 h-5" />,
      accentColor: '#8b5cf6',
      sparklineData: roasSparkline.length >= 2 ? roasSparkline : undefined,
    },
    {
      label: 'Aktive Kampagnen',
      value: formatCompact(data?.kpis.activeCampaigns ?? 0),
      change: data?.kpis.activeCampaigns ? `+${data.kpis.activeCampaigns}` : '—',
      isPositive: true,
      comparison: comparisonLabel,
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
        ? 'Synchronisiere aktuelle Performance-Daten.'
        : 'Live-Kampagnenmetriken und ROAS-Tracking freischalten.',
      cta: metaConnected ? 'Synchronisieren' : 'Verbinden',
      icon: <Zap className="w-4 h-4 text-primary" />,
      onClick: () => onNavigate('settings', { tab: 'integrations' }),
    },
    {
      id: 'creative-run',
      title: 'Neue Creatives',
      description: '3 frische Ad-Varianten gegen Creative Fatigue.',
      cta: 'Builder öffnen',
      icon: <Wand2 className="w-4 h-4 text-primary" />,
      onClick: () => onNavigate('studio'),
    },
    {
      id: 'campaign-review',
      title: 'Kampagnen prüfen',
      description: 'Gewinner finden und Budgets skalieren.',
      cta: 'Ansehen',
      icon: <Target className="w-4 h-4 text-primary" />,
      onClick: () => onNavigate('campaigns'),
    },
  ];

  return (
    <DashboardShell hideHero>
      {/* ── Editorial Page Header ──────────────────────── */}
      <div className="page-header-editorial">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Deine Ad Performance auf einen Blick</p>
          </div>
        </div>
      </div>

      {/* ── Segmented Filter Bar ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Filter — Segmented Control */}
        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
          {DATE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${dateFilter === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Meta Status Pill */}
        <Badge variant={metaConnected ? 'secondary' : 'default'} className="px-2.5 py-1 text-xs">
          {metaConnected ? '● Meta verbunden' : '○ Meta nicht verbunden'}
        </Badge>
      </div>

      {/* ── Trial Upgrade Banner ─────────────────────────── */}
      {!trialDismissed && (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Crown className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Du bist im Testabo
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade für unbegrenzte AI-Generierungen, erweiterte Analytics und Priority-Support.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 gap-1.5 text-xs"
              onClick={() => onNavigate('settings', { tab: 'billing' })}
            >
              <Crown className="w-3.5 h-3.5" />
              Upgraden
            </Button>
            <button
              onClick={() => {
                setTrialDismissed(true);
                try { localStorage.setItem('adruby_trial_dismissed', '1'); } catch { /* */ }
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
              aria-label="Schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────── */}
      {loading ? <KpiSkeleton /> : <KpiCardGrid kpis={kpis} />}

      {/* ── Main Chart — FULL WIDTH ──────────────────────── */}
      <Suspense fallback={<ChartPlaceholder />}>
        <LazySpendRevenueChart
          points={data?.timeseries ?? []}
          range={dateFilter}
          loading={loading}
          error={error}
          metaConnected={metaConnected}
        />
      </Suspense>

      {/* ── Insights Row — 3 Columns ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ROAS Trend */}
        <Suspense fallback={<ChartPlaceholder />}>
          <LazyRoasMiniChart
            points={(data?.timeseries ?? []).map(p => ({ ts: p.ts, roas: p.roas }))}
            range={dateFilter}
            loading={loading}
            error={error}
            metaConnected={metaConnected}
          />
        </Suspense>

        {/* Top Kampagne */}
        <Card className="border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Top Kampagne</h3>
                <p className="text-[11px] text-muted-foreground">Höchster ROAS</p>
              </div>
            </div>
            <div className="text-base font-bold text-foreground mb-3 truncate">{topCampaign.name}</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">ROAS</div>
                <div className="text-base font-bold text-primary">{topCampaign.roas}x</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Ausgaben</div>
                <div className="text-base font-bold">€{(topCampaign.spend / 1000).toFixed(1)}K</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Umsatz</div>
                <div className="text-base font-bold">€{(topCampaign.revenue / 1000).toFixed(1)}K</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 text-xs group h-8"
              onClick={() => onNavigate('campaigns')}
            >
              Kampagne ansehen <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Bestes Creative */}
        <Card className="border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Bestes Creative</h3>
                <p className="text-[11px] text-muted-foreground">Höchster AI Score</p>
              </div>
            </div>
            <div className="text-base font-bold text-foreground mb-3 truncate">{bestCreative.name}</div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs font-medium">
                <span>Performance-Score</span>
                <span className="text-primary">{bestCreative.aiScore}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${bestCreative.aiScore}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">CTR</div>
                <div className="text-base font-bold">{bestCreative.ctr}%</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Konversionen</div>
                <div className="text-base font-bold">{bestCreative.conversions}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5 text-xs group h-8"
              onClick={() => onNavigate('analytics')}
            >
              Analytics ansehen <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row — Goals + Quick Actions ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals */}
        <GoalsPanel kpis={{ roas: data?.kpis.roas ?? 0, spend: data?.kpis.spend ?? 0, revenue: data?.kpis.revenue ?? 0 }} />

        {/* Quick Actions */}
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Nächste Schritte</CardTitle>
                <CardDescription>Deine wichtigsten Aufgaben</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {actions.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 hover:bg-background/80 transition-colors group cursor-pointer"
                onClick={item.onClick}
              >
                <div className="shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{item.title}</span>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Onboarding Checklist — AT THE BOTTOM ─────────── */}
      <GettingStartedChecklist steps={checklistSteps} />
    </DashboardShell>
  );
}
