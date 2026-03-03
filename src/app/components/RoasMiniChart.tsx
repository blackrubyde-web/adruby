import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent } from './ui/card';

function formatX(ts: string, range: 'today' | '7d' | '30d') {
  const d = new Date(ts);
  if (range === 'today')
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface RoasMiniChartProps {
  points: { ts: string; roas: number }[];
  range: 'today' | '7d' | '30d';
  loading?: boolean;
  error?: string | null;
  metaConnected?: boolean;
}

export function RoasMiniChart({
  points,
  range,
  loading,
  error,
  metaConnected = false,
}: RoasMiniChartProps) {
  // Loading State
  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-36 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-48 bg-muted animate-pulse rounded" />
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
                ROAS Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Schnellüberblick über deine Rendite
              </p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Fehler: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!points || points.length === 0) {
    const title = metaConnected ? 'Noch keine Kampagnen' : 'Keine Daten';
    const subtitle = metaConnected ? 'Starte deine erste Kampagne für ROAS.' : 'Verbinde Meta';
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                ROAS Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                Schnellüberblick über deine Rendite
              </p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average ROAS for the badge
  const avgRoas =
    points.reduce((sum, p) => sum + p.roas, 0) / points.length || 0;

  return (
    <Card variant="glass" className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              ROAS Trend
            </h3>
            <p className="text-sm text-muted-foreground">
              Schnellüberblick über deine Rendite
            </p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/15 font-medium whitespace-nowrap">
            Ø {avgRoas.toFixed(1)}x
          </span>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="ts"
                tickFormatter={(v) => formatX(v, range)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                style={{ fontSize: '11px' }}
                minTickGap={30}
              />
              <Tooltip
                formatter={(value: ValueType) => {
                  const normalized = Array.isArray(value) ? value[0] : value;
                  return [`${Number(normalized ?? 0).toFixed(2)}x`, 'ROAS'];
                }}
                labelFormatter={(label) => formatX(label, range)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="roas"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
