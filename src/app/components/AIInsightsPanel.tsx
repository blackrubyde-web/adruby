import { Sparkles, TrendingUp, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}

export function AIInsightsPanel() {
  const [insights] = useState<Insight[]>([
    {
      type: 'success',
      title: 'Peak Performance Detected',
      description: 'Your Saturday campaigns are performing 42% better. Consider increasing weekend budget.',
      action: 'Optimize Schedule'
    },
    {
      type: 'warning',
      title: 'CTR Decline Alert',
      description: 'Age 45+ audience showing 15% CTR decrease. Creative refresh may be needed.',
      action: 'Update Creatives'
    },
    {
      type: 'info',
      title: 'Budget Opportunity',
      description: 'Campaign #7305 has 30% budget remaining with 2 days left. Consider reallocation.',
      action: 'Redistribute Budget'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />;
      case 'info':
        return <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20';
      case 'warning':
        return 'border-yellow-500/20';
      case 'info':
        return 'border-blue-500/20';
      default:
        return 'border-border';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-bold text-foreground">AI Insights</h3>
          <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Smart recommendations for your campaigns</p>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl bg-card border-2 ${getBorder(insight.type)} transition-all hover:border-opacity-80 hover:shadow-lg`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                  {insight.title}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 leading-relaxed">
                  {insight.description}
                </p>

                {/* Action Button - Mobile Optimized */}
                {insight.action && (
                  <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-xs md:text-sm font-medium hover:scale-105">
                    {insight.action}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}