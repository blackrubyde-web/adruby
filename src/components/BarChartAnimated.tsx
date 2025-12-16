import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatTimestamp } from '../utils/dateUtils';

interface BarSeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
}

interface BarChartAnimatedProps {
  data: any[];
  xKey?: string;
  series: BarSeriesConfig[];
  timezone?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label, timezone }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-foreground">{formatTimestamp(label, timezone || 'UTC', 'dd.MM HH:mm')}</p>
      <div className="mt-1 space-y-1">
        {payload.map((item: any) => (
          <div key={item.dataKey} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}:</span>
            <span className="text-foreground font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarChartAnimated: React.FC<BarChartAnimatedProps> = ({
  data,
  xKey = 'timestamp',
  series,
  timezone = 'UTC',
  height = 320
}) => {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const handleLegendClick = (o: any) => {
    const key = o.dataKey;
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis
            dataKey={xKey}
            tickFormatter={(value) => formatTimestamp(value, timezone, 'dd.MM')}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip timezone={timezone} />} />
          <Legend onClick={handleLegendClick} />
          <Brush dataKey={xKey} height={24} stroke="rgba(59,130,246,0.6)" />
          {series.map((s) =>
            hiddenKeys.has(s.dataKey) ? null : (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                stackId={s.stackId}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                isAnimationActive
              />
            )
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartAnimated;
