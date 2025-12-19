import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

function formatX(ts: string, range: 'today' | '7d' | '30d') {
  const d = new Date(ts);
  if (range === 'today')
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Currency(n: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

interface SpendRevenueChartProps {
  points: { ts: string; spend: number; revenue: number }[];
  range: 'today' | '7d' | '30d';
  loading?: boolean;
  error?: string | null;
}

export function SpendRevenueChart({
  points,
  range,
  loading,
  error,
}: SpendRevenueChartProps) {
  // Loading State
  if (loading) {
    return (
      <div className="rounded-2xl bg-card/70 border border-border/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-56 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-2xl bg-card/70 border border-border/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Spend vs Revenue
            </h3>
            <p className="text-sm text-muted-foreground">Updates with your time range</p>
          </div>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Failed: {error}</div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!points || points.length === 0) {
    return (
      <div className="rounded-2xl bg-card/70 border border-border/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Spend vs Revenue
            </h3>
            <p className="text-sm text-muted-foreground">Updates with your time range</p>
          </div>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              No data available
            </p>
            <p className="text-sm text-muted-foreground">
              Connect Meta account to see charts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_0_rgba(255,255,255,0.6),0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Spend vs Revenue
          </h3>
          <p className="text-sm text-muted-foreground">
            Updates with your time range
          </p>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) => formatX(v, range)}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value: ValueType, name: NameType) => {
                const normalized = Array.isArray(value) ? value[0] : value;
                return [
                  Currency(Number(normalized ?? 0)),
                  String(name) === 'revenue' ? 'Revenue' : 'Spend',
                ];
              }}
              labelFormatter={(label) => formatX(label, range)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.10}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
