'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useTheme } from './ThemeProvider';
import { useEffect, useMemo, useState } from 'react';
import type { TimeseriesPoint, Granularity, AnalyticsData } from '../types/analytics';

type Props = {
  current?: TimeseriesPoint[];
  previous?: TimeseriesPoint[] | null;
  compare?: boolean;
  granularity?: Granularity;
  range?: AnalyticsData['range'];
  loading?: boolean;
};

function formatCompactNumber(n: number) {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function formatCurrencyEUR(n: number) {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatLabel(ts: string, granularity: Granularity) {
  const d = new Date(ts);
  if (granularity === 'hour') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { weekday: 'short' }); // fits well for 7d
}

function safeAvg(values: number[]) {
  const v = values.filter((x) => Number.isFinite(x));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function safeSum(values: number[]) {
  const v = values.filter((x) => Number.isFinite(x));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0);
}

export function PerformanceChart({
  current = [],
  previous,
  compare = false,
  granularity = 'day',
  loading = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mobile detection (SSR-safe)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Merge current + previous into a single recharts dataset by index.
  // (Assumption: backend returns same bucket counts for current/previous)
  const chartData = useMemo(() => {
    const len = current?.length ?? 0;
    const prev = previous ?? [];

    return Array.from({ length: len }, (_, i) => {
      const c = current[i] ?? {};
      const p = prev[i] ?? {};
      return {
        ts: c.ts ?? p.ts ?? '',
        label: c.ts ? formatLabel(c.ts, granularity) : '',
        // left axis metric
        impressions: c.impressions ?? null,
        impressions_prev: p.impressions ?? null,
        // right axis metric
        roas: c.roas ?? null,
        roas_prev: p.roas ?? null,
      };
    });
  }, [current, previous, granularity]);

  // Top tiles: Total Impressions (sum) + Total Spend (sum) based on current series
  const tiles = useMemo(() => {
    const impressionsSum = safeSum((current ?? []).map((p) => p.impressions ?? NaN));
    const ctrAvg = safeAvg((current ?? []).map((p) => p.ctr ?? NaN)); // ctr as 0..100
    const spendSum = safeSum((current ?? []).map((p) => p.spend ?? NaN));
    const revenueSum = safeSum((current ?? []).map((p) => p.revenue ?? NaN));

    return {
      impressionsSum,
      ctrAvg,
      spendSum,
      revenueSum,
    };
  }, [current]);

  const gridStroke = isDark ? '#2a2a2a' : '#e5e5e5';
  const axisStroke = isDark ? '#999999' : '#666666';

  return (
    <div className="p-4 sm:p-6 w-full max-w-full overflow-hidden">
      <div className="mb-4 sm:mb-6 min-w-0">
        <h3 className="font-semibold tracking-tight text-foreground mb-1 truncate">
          Performance Trend
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">
          {loading ? 'Loading…' : 'Time range adapts to your filters'}
        </p>
      </div>

      {/* Quick tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 sm:p-5 bg-muted/30 border border-border rounded-xl w-full min-w-0 overflow-hidden">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Impressions</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums truncate">
            {loading ? '…' : tiles.impressionsSum == null ? '—' : formatCompactNumber(tiles.impressionsSum)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">from selected range</div>
        </div>

        <div className="p-4 sm:p-5 bg-muted/30 border border-border rounded-xl w-full min-w-0 overflow-hidden">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Spend</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums truncate">
            {loading ? '…' : tiles.spendSum == null ? '—' : formatCurrencyEUR(tiles.spendSum)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">from selected range</div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
          <LineChart
            data={chartData}
            margin={{ left: isMobile ? -20 : 0, right: isMobile ? 0 : 10, top: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />

            <XAxis
              dataKey="label"
              stroke={axisStroke}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={16}
            />

            {!isMobile && (
              <YAxis
                yAxisId="left"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                width={40}
                tickFormatter={(v) => formatCompactNumber(Number(v))}
              />
            )}

            {!isMobile && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                width={40}
                tickFormatter={(v) => `${Number(v).toFixed(1)}x`}
              />
            )}

            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.ts ? new Date(payload[0].payload.ts).toLocaleString() : ''
              }
              formatter={(value: ValueType, name: NameType) => {
                const normalized = Array.isArray(value) ? value[0] : value;
                if (normalized == null) return ['—', String(name)];
                if (String(name).includes('roas')) return [`${Number(normalized).toFixed(2)}x`, String(name)];
                if (String(name).includes('impressions')) return [formatCompactNumber(Number(normalized)), String(name)];
                return [String(normalized), String(name)];
              }}
              contentStyle={{
                backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />

            <Legend wrapperStyle={{ fontSize: '11px' }} />

            {/* Current */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="impressions"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Impressions"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roas"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="ROAS"
            />

            {/* Previous (Compare) */}
            {compare && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions_prev"
                  stroke="#93c5fd"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 6"
                  name="Impressions (prev)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roas_prev"
                  stroke="#86efac"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 6"
                  name="ROAS (prev)"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
