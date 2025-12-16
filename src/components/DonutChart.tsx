import React, { useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutDatum {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: DonutDatum[];
  colors?: string[];
  height?: number;
  title?: string;
}

const defaultColors = ['#f43f5e', '#6366f1', '#22c55e', '#f59e0b', '#0ea5e9'];

export const DonutChart: React.FC<DonutChartProps> = ({ data, colors = defaultColors, height = 280, title }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={4}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={colors[index % colors.length]}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => value.toLocaleString()}
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
