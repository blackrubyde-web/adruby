import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useState } from 'react';

interface AdMetricsCardProps {
  title: string;
  value: string;
  subValue: string;
  percentage: number;
  isPositive: boolean;
  icon: React.ReactNode;
  color?: string;
  tooltip?: string;
}

export function AdMetricsCard({ title, value, subValue, percentage, isPositive, icon, tooltip }: AdMetricsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative bg-card border border-border rounded-lg p-5 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon - Reduced Opacity */}
          <div className="text-muted-foreground/40 flex-shrink-0">
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="text-sm text-muted-foreground mb-2">{title}</div>
            
            {/* Value - Visual Anchor */}
            <div className="text-3xl font-bold text-foreground mb-2">
              {value}
            </div>
            
            {/* Sub Value */}
            <div className="text-xs text-muted-foreground/70">{subValue}</div>
          </div>
        </div>

        {/* Right: Trend + Info */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Trend Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPositive 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {isPositive ? '+' : ''}{percentage}%
            </span>
          </div>
          
          {/* Info Icon with Tooltip */}
          {tooltip && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-1 hover:bg-muted/50 rounded transition-colors"
              >
                <Info className="w-4 h-4 text-muted-foreground/50" />
              </button>
              
              {showTooltip && (
                <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-card border border-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs text-muted-foreground leading-relaxed">{tooltip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
