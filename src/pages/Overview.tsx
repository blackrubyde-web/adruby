import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Column } from 'react-table';
import { Loader2, Download } from 'lucide-react';
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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header
          title="Dashboard Overview"
          subtitle="Interaktive Analytics mit Live-Updates (Mock)"
          credits="1.240"
          onSearch={() => undefined}
        >
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker value={range} onChange={setRange} />
            <button
              type="button"
              onClick={refresh}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Neu laden
            </button>
          </div>
        </Header>

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
            helpText="Beobachte Filter-Änderungen."
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
            <DataTable<CampaignRow>
              data={data?.topCampaigns ?? []}
              columns={campaignColumns}
              summary={campaignSummary}
              title="Top Kampagnen"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Lädt Mock-Daten...
          </div>
        )}
        {error && <div className="text-sm text-rose-500">Fehler beim Laden: {error.message}</div>}
      </div>
    </DashboardLayout>
  );
};

export default OverviewPage;
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
