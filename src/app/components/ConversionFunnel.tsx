import { Eye, MousePointerClick, ShoppingCart, DollarSign } from 'lucide-react';

interface FunnelStage {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export function ConversionFunnel() {
  const stages: FunnelStage[] = [
    { label: 'Impressions', value: 4200000, icon: <Eye className="w-5 h-5" />, color: '#3b82f6' },
    { label: 'Clicks', value: 117600, icon: <MousePointerClick className="w-5 h-5" />, color: '#10b981' },
    { label: 'Add to Cart', value: 23520, icon: <ShoppingCart className="w-5 h-5" />, color: '#f59e0b' },
    { label: 'Purchases', value: 4704, icon: <DollarSign className="w-5 h-5" />, color: '#8b5cf6' },
  ];

  const maxValue = stages[0].value;

  const getDropoffRate = (index: number) => {
    if (index === 0) return null;
    const current = stages[index].value;
    const previous = stages[index - 1].value;
    const dropoff = ((previous - current) / previous * 100).toFixed(1);
    return dropoff;
  };

  const getConversionRate = (index: number) => {
    if (index === 0) return '100.0';
    const rate = (stages[index].value / stages[0].value * 100).toFixed(2);
    return rate;
  };

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border w-full max-w-full overflow-hidden">
      <div className="mb-6 min-w-0">
        <h2 className="text-foreground mb-1 truncate">Conversion Funnel</h2>
        <p className="text-sm text-muted-foreground break-words">Track your customer journey</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const dropoff = getDropoffRate(index);
          const conversionRate = getConversionRate(index);

          return (
            <div key={index} className="group">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2 min-w-0 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                  >
                    {stage.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">{stage.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{stage.value.toLocaleString()} users</div>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-foreground tabular-nums">{conversionRate}%</div>
                  {dropoff && (
                    <div className="text-xs text-red-500 tabular-nums">-{dropoff}%</div>
                  )}
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative">
                <div className="h-16 bg-border/30 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-1000 ease-out group-hover:brightness-110 relative overflow-hidden"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}cc 100%)`
                    }}
                  >
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Conversion Rate */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Overall Conversion Rate</div>
            <div className="text-2xl font-bold text-purple-500">
              {((stages[3].value / stages[0].value) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Industry Average</div>
            <div className="text-lg font-medium text-muted-foreground">0.08%</div>
          </div>
        </div>
      </div>
    </div>
  );
}