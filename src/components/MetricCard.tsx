import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { KPIValue } from '../api/types';

interface MetricCardProps {
  label: string;
  value: string;
  delta: KPIValue['delta'];
  helpText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, delta, helpText }) => {
  const positive = delta >= 0;
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm transition hover:shadow-lg focus-within:ring-2 focus-within:ring-rose-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {positive ? '+' : ''}
          {delta.toFixed(2)}
        </div>
      </div>
      {helpText && <p className="mt-2 text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default MetricCard;
