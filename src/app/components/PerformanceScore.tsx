import { TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScoreBreakdown {
  label: string;
  score: number;
  weight: number;
}

export function PerformanceScore() {
  const [animatedScore, setAnimatedScore] = useState(0);
  const targetScore = 87;

  const breakdown: ScoreBreakdown[] = [
    { label: 'CTR Performance', score: 92, weight: 25 },
    { label: 'ROAS Efficiency', score: 95, weight: 30 },
    { label: 'Budget Utilization', score: 78, weight: 20 },
    { label: 'Audience Engagement', score: 85, weight: 25 },
  ];

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-red-600 dark:text-red-500';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-muted-foreground/50" />
        <h3 className="text-lg font-bold text-foreground">Performance Score</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="transform -rotate-90" width="160" height="160">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-border"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={getScoreStroke(targetScore)}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${getScoreColor(targetScore)}`}>
                {animatedScore}
              </div>
              <div className="text-sm text-muted-foreground">/ 100</div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-500 font-medium">+5 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col justify-center space-y-4">
          {breakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold ${getScoreColor(item.score)}`}>
                  {item.score}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBg(item.score)} transition-all duration-1000 ease-out`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="p-4 bg-muted border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold text-green-600 dark:text-green-500">Excellent performance.</span>
            {' '}Your campaigns are outperforming industry benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
}
