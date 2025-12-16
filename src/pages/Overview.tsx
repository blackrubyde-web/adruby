import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Column } from 'react-table';
import { Loader2, Download, Sparkles, Activity, Clock3, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import LineChartAnimated from '../components/LineChartAnimated';
import BarChartAnimated from '../components/BarChartAnimated';
import DonutChart from '../components/DonutChart';
import DataTable from '../components/DataTable';
import { DateRangeValue, CampaignRow } from '../api/types';
import { buildPresetRange } from '../utils/dateUtils';
import { exportNodeToPng } from '../utils/export';
import { useMockApi } from '../hooks/useMockApi';
import { useAuth } from '../contexts/AuthContext';
import DateRangePicker from '../components/DateRangePicker';

const OverviewPage: React.FC = () => {
  const [range, setRange] = useState<DateRangeValue>(() => buildPresetRange('30d', 'Europe/Berlin'));
  const { data, loading, error, refresh } = useMockApi(range);
  const { user, isAuthReady, loading: authLoading, isSubscribed, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  const lineRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = 'Overview Dashboard';
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthReady) return;
    if (!user) {
      navigate('/ad-ruby-registration');
      return;
    }
    const hasActiveSub = typeof isSubscribed === 'function' ? isSubscribed() : true;
    if (!hasActiveSub) {
      navigate('/payment-verification');
    }
  }, [authLoading, isAuthReady, user, isSubscribed, subscriptionStatus, navigate]);

  const campaignColumns: Column<CampaignRow>[] = useMemo(
    () => [
      { Header: 'Kampagne', accessor: 'name' },
      {
        Header: 'Spend (€)',
        accessor: 'spend',
        Cell: ({ value }) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
      },
      {
        Header: 'Revenue (€)',
        accessor: 'revenue',
        Cell: ({ value }) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
      },
      {
        Header: 'CTR (%)',
        accessor: 'ctr',
        Cell: ({ value }) => `${value.toFixed(2)}%`
      },
      {
        Header: 'Conversions',
        accessor: 'conversions',
        Cell: ({ value }) => value.toLocaleString('de-DE')
      }
    ],
    []
  );

  const campaignSummary = useMemo(() => {
    if (!data?.topCampaigns?.length) return undefined;
    const totals = data.topCampaigns.reduce(
      (acc, row) => {
        acc.spend += row.spend;
        acc.revenue += row.revenue;
        acc.conversions += row.conversions;
        return acc;
      },
      { spend: 0, revenue: 0, conversions: 0 }
    );
    return {
      label: 'Summe',
      totals: {
        spend: totals.spend,
        revenue: totals.revenue,
        conversions: totals.conversions
      },
      description: 'Summenzeile aktualisiert sich automatisch basierend auf Filtern.'
    };
  }, [data?.topCampaigns]);

  const kpis = data?.kpis;
  const timeSeries = data?.timeSeries ?? [];
  const sessionsByDevice = data?.sessionsByDevice ?? [];

  const handleExportLine = () => exportNodeToPng(lineRef.current, 'timeseries.png');
  const handleExportBar = () => exportNodeToPng(barRef.current, 'conversions.png');

  const highlightStats = [
    { label: 'Realtime Health', value: '99.9%', icon: <Sparkles size={14} />, tone: 'emerald' },
    { label: 'Avg. Response', value: '142ms', icon: <Clock3 size={14} />, tone: 'sky' },
    {
      label: 'Spend / Conv.',
      value: data?.topCampaigns?.[0]?.spend
        ? `${(data.topCampaigns[0].spend / (data.topCampaigns[0].conversions || 1)).toFixed(1)} €`
        : '–',
      icon: <Activity size={14} />,
      tone: 'violet'
    },
    { label: 'Lift vs. last week', value: kpis ? `${kpis.ctr.delta.toFixed(2)}% CTR` : '–', icon: <Flame size={14} />, tone: 'rose' }
  ];
  const toneClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-100',
    sky: 'bg-sky-500/20 text-sky-100',
    violet: 'bg-violet-500/20 text-violet-100',
    rose: 'bg-rose-500/20 text-rose-100'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <Header
          title="Dashboard Overview"
          subtitle="Interaktive Analytics mit Live-Updates (Mock)"
          credits="1.240"
          onSearch={() => undefined}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Letzte 7 Tage', preset: '7d' as const },
                { label: 'Letzte 30 Tage', preset: '30d' as const },
                { label: 'Letzte 90 Tage', preset: '90d' as const }
              ].map((p) => (
                <button
                  key={p.preset}
                  type="button"
                  onClick={() => setRange(buildPresetRange(p.preset, range.timezone))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    range.preset === p.preset
                      ? 'border-rose-500 bg-rose-500 text-white shadow-[0_10px_30px_-20px_rgba(244,63,94,0.7)]'
                      : 'border-white/10 bg-white/5 text-white hover:border-rose-400/70'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRange({ ...range, preset: 'custom' })}
                className={`rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  range.preset === 'custom'
                    ? 'border-rose-500 bg-rose-500 text-white shadow-[0_10px_30px_-20px_rgba(244,63,94,0.7)]'
                    : 'border-white/10 bg-white/5 text-white hover:border-rose-400/70'
                }`}
              >
                Benutzerdefiniert
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Neu laden
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="col-span-1 md:col-span-2">
                <DateRangePicker value={range} onChange={setRange} />
              </div>
            </div>
          </div>
        </Header>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.85)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-10 top-6 h-32 w-32 rounded-full bg-rose-500/15 blur-3xl" />
            <div className="absolute right-6 bottom-6 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>
          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlightStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow-inner"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/70">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[stat.tone] || 'bg-white/10 text-white'}`}
                >
                  {stat.icon}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Click-Through-Rate"
            value={kpis ? `${kpis.ctr.value.toFixed(2)}%` : '–'}
            delta={kpis?.ctr.delta ?? 0}
            helpText="Live-Updates via Mock WebSocket."
          />
          <MetricCard
            label="Conversion Rate"
            value={kpis ? `${kpis.conversion_rate.value.toFixed(2)}%` : '–'}
            delta={kpis?.conversion_rate.delta ?? 0}
            helpText="Beobachte Filter-Aenderungen."
          />
          <MetricCard
            label="ROAS"
            value={kpis ? `${kpis.roas.value.toFixed(2)}x` : '–'}
            delta={kpis?.roas.delta ?? 0}
            helpText="Return on Ad Spend."
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Performance (CTR & ROAS)</h2>
              <button
                type="button"
                onClick={handleExportLine}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Download size={14} /> PNG
              </button>
            </div>
            <div ref={lineRef}>
              <LineChartAnimated
                data={timeSeries}
                timezone={range.timezone}
                series={[
                  { dataKey: 'ctr', name: 'CTR %', color: '#f43f5e', type: 'line' },
                  { dataKey: 'roas', name: 'ROAS', color: '#6366f1', type: 'area' }
                ]}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Sessions nach Device</h2>
            </div>
            <DonutChart
              data={sessionsByDevice.map((d) => ({ name: d.device, value: d.sessions }))}
              title="Device Breakdown"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Conversions & Impressions</h2>
              <button
                type="button"
                onClick={handleExportBar}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Download size={14} /> PNG
              </button>
            </div>
            <div ref={barRef}>
              <BarChartAnimated
                data={timeSeries}
                timezone={range.timezone}
                series={[
                  { dataKey: 'conversions', name: 'Conversions', color: '#22c55e' },
                  { dataKey: 'impressions', name: 'Impressions', color: '#0ea5e9' }
                ]}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Kampagnen (Top)</h2>
            </div>
            <DataTable
              data={data?.topCampaigns ?? []}
              columns={campaignColumns}
              summary={campaignSummary}
              title="Top Kampagnen"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Laedt Mock-Daten...
          </div>
        )}
        {error && <div className="text-sm text-rose-500">Fehler beim Laden: {error.message}</div>}
      </div>
    </DashboardLayout>
  );
};

export default OverviewPage;
