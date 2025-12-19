import { Lightbulb, TrendingUp, Target, AlertCircle } from 'lucide-react';
interface Insight {
  type: 'optimization' | 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: string;
}

const insights: Insight[] = [
  {
    type: 'success',
    title: 'High-Performing Audience Segment',
    description: 'Age 25-34 demographic is showing 42% higher engagement than other segments. Consider allocating more budget to this audience.',
    impact: 'Potential +$2,400 monthly revenue',
  },
  {
    type: 'optimization',
    title: 'Ad Creative Refresh Recommended',
    description: 'Your top-performing ad creative has been running for 18 days. Engagement typically drops after 21 days. Prepare new creative assets.',
    impact: 'Maintain current 4.8x ROAS',
  },
  {
    type: 'opportunity',
    title: 'Lookalike Audience Opportunity',
    description: 'Based on your converters, we identified a lookalike audience of 2.3M users with similar characteristics.',
    impact: 'Estimated reach: 2.3M users',
  },
  {
    type: 'warning',
    title: 'Budget Pacing Alert',
    description: 'Campaign #7305 is spending 23% faster than planned. Current pace will exhaust budget in 4 days instead of 7.',
    impact: 'Action required within 24h',
  },
];

export function StrategyInsights() {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />;
      case 'optimization':
        return <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-500" />;
      case 'opportunity':
        return <Target className="w-5 h-5 text-purple-600 dark:text-purple-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />;
    }
  };

  const getBorderColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20';
      case 'optimization':
        return 'border-blue-500/20';
      case 'opportunity':
        return 'border-purple-500/20';
      case 'warning':
        return 'border-yellow-500/20';
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">AI Strategy Insights</h3>
      <p className="text-sm text-muted-foreground mb-6">Powered by machine learning analysis</p>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 bg-card border ${getBorderColor(insight.type)} rounded-lg transition-colors hover:border-border/80`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground font-semibold mb-2 text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{insight.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{insight.impact}</span>
                  <button className="text-sm text-foreground hover:text-foreground/80 font-medium transition-colors whitespace-nowrap">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
