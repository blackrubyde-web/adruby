import React, { useState } from 'react';
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatTimestamp } from '../utils/dateUtils';

interface SeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  type?: 'line' | 'area';
}

interface LineChartAnimatedProps {
  data: any[];
  xKey?: string;
  series: SeriesConfig[];
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

export const LineChartAnimated: React.FC<LineChartAnimatedProps> = ({
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
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
          <XAxis
            dataKey={xKey}
            tickFormatter={(value) => formatTimestamp(value, timezone, 'dd.MM')}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals domain={['dataMin', 'dataMax']} />
          <Tooltip content={<CustomTooltip timezone={timezone} />} />
          <Legend onClick={handleLegendClick} />
          <Brush dataKey={xKey} height={24} stroke="rgba(244,63,94,0.6)" />
          {series.map((s) =>
            hiddenKeys.has(s.dataKey) ? null : s.type === 'area' ? (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
            ) : (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive
              />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartAnimated;
