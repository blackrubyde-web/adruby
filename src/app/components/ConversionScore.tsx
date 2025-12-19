import { Card } from './ui/card';
import { TrendingUp, Zap, Target } from 'lucide-react';

interface ConversionScoreProps {
  score: number;
}

export function ConversionScore({ score }: ConversionScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-primary';
    if (score >= 70) return 'text-foreground';
    if (score >= 50) return 'text-muted-foreground';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exzellent';
    if (score >= 70) return 'Gut';
    if (score >= 50) return 'Mittel';
    return 'Verbesserungswürdig';
  };

  const metrics = [
    { label: 'Emotion', value: 95 },
    { label: 'Klarheit', value: 88 },
    { label: 'Dringlichkeit', value: 92 },
  ];

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-foreground font-medium mb-6">Conversion-Score</h3>

      {/* Main Score Circle */}
      <div className="relative mb-8">
        <div className="w-40 h-40 mx-auto relative">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              className="text-border"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#10b981"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
              <div className="text-sm text-muted-foreground">von 100</div>
            </div>
          </div>
        </div>

        {/* Score Label */}
        <div className="text-center mt-4">
          <div className={`font-bold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
          <div className="text-sm text-muted-foreground">Conversion-Potential</div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-4">
        <h4 className="text-foreground text-sm font-medium mb-3">Score-Faktoren</h4>
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="text-foreground font-bold">{metric.value}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 rounded-full"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-6 space-y-2">
        <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary rounded-lg">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">Starke emotionale Ansprache erkannt</p>
        </div>
        <div className="flex items-start gap-2 p-3 bg-foreground/10 border border-foreground rounded-lg">
          <Zap className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">Klarer Call-to-Action vorhanden</p>
        </div>
        <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded-lg">
          <Target className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">Zielgruppe präzise adressiert</p>
        </div>
      </div>
    </Card>
  );
}