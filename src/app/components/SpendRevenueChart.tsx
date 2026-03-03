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
import { Card, CardContent } from './ui/card';

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
  metaConnected?: boolean;
}

export function SpendRevenueChart({
  points,
  range,
  loading,
  error,
  metaConnected = false,
}: SpendRevenueChartProps) {
  // Loading State
  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-[340px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Ausgaben vs. Umsatz
              </h3>
              <p className="text-sm text-muted-foreground">Aktualisiert mit deinem Zeitraum</p>
            </div>
          </div>
          <div className="h-[340px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Fehler: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!points || points.length === 0) {
    const title = metaConnected ? 'Noch keine Kampagnen' : 'Keine Daten verfügbar';
    const subtitle = metaConnected
      ? 'Starte deine erste Kampagne für Charts.'
      : 'Verbinde Meta um Charts zu sehen';
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Ausgaben vs. Umsatz
              </h3>
              <p className="text-sm text-muted-foreground">Aktualisiert mit deinem Zeitraum</p>
            </div>
          </div>
          <div className="h-[340px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Ausgaben vs. Umsatz
            </h3>
            <p className="text-sm text-muted-foreground">
              Aktualisiert mit deinem Zeitraum
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-xs text-muted-foreground">Umsatz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              <span className="text-xs text-muted-foreground">Ausgaben</span>
            </div>
          </div>
        </div>

        <div className="h-[340px]">
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
                    String(name) === 'revenue' ? 'Umsatz' : 'Ausgaben',
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
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  );
}
