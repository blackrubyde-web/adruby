import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Brain, TrendingUp, Users, BarChart3, Zap, Check } from 'lucide-react';

interface AnalysisStep {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
  duration: number;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 1,
    title: 'Wettbewerber-Analyse',
    icon: BarChart3,
    description: 'Scanne 1.234 ähnliche Kampagnen...',
    duration: 1000,
  },
  {
    id: 2,
    title: 'Zielgruppen-Insights',
    icon: Users,
    description: 'Analysiere Demografie & Interessen...',
    duration: 1200,
  },
  {
    id: 3,
    title: 'Performance-Prognose',
    icon: TrendingUp,
    description: 'Berechne erwartete Metriken...',
    duration: 1100,
  },
  {
    id: 4,
    title: 'KI-Optimierung',
    icon: Brain,
    description: 'Optimiere Targeting & Budget...',
    duration: 1300,
  },
  {
    id: 5,
    title: 'Finale Auswertung',
    icon: Zap,
    description: 'Erstelle Insights-Report...',
    duration: 400,
  },
];

interface MarketAnalysisLoaderProps {
  progress?: number;
}

export function MarketAnalysisLoader({ progress: externalProgress }: MarketAnalysisLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [internalProgress, setInternalProgress] = useState(0);
  const progress = typeof externalProgress === 'number' ? externalProgress : internalProgress;

  useEffect(() => {
    if (typeof externalProgress === 'number') {
      const idx = Math.min(
        analysisSteps.length - 1,
        Math.floor((externalProgress / 100) * analysisSteps.length)
      );
      setCurrentStepIndex(idx);
      return;
    }

    let currentTime = 0;
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);

    const interval = setInterval(() => {
      currentTime += 50;
      const newProgress = Math.min((currentTime / totalDuration) * 100, 100);
      setInternalProgress(newProgress);

      let accumulatedDuration = 0;
      for (let i = 0; i < analysisSteps.length; i++) {
        accumulatedDuration += analysisSteps[i].duration;
        if (currentTime < accumulatedDuration) {
          setCurrentStepIndex(i);
          break;
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [externalProgress]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-card border-border p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-12 h-12 text-primary-foreground animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
          </div>
          <h2 className="text-foreground mb-2">KI-Marktanalyse läuft</h2>
          <p className="text-muted-foreground">
            Analysiere über 2,5 Millionen Datenpunkte für optimale Performance...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="text-foreground font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Analysis Steps */}
        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 border-2 border-primary'
                    : isCompleted
                    ? 'bg-foreground/5 border-2 border-foreground'
                    : 'bg-muted border-2 border-border'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-primary animate-pulse'
                      : isCompleted
                      ? 'bg-foreground'
                      : 'bg-border'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-background" />
                  ) : (
                    <step.icon className={`w-6 h-6 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className={`text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? step.description : isCompleted ? 'Abgeschlossen' : 'Ausstehend'}
                  </div>
                </div>
                {isActive && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-muted rounded-lg p-4 text-center border border-border">
            <div className="text-2xl text-foreground font-bold">2.5M</div>
            <div className="text-xs text-muted-foreground">Datenpunkte</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center border border-border">
            <div className="text-2xl text-foreground font-bold">1,234</div>
            <div className="text-xs text-muted-foreground">Kampagnen</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center border border-border">
            <div className="text-2xl text-foreground font-bold">94%</div>
            <div className="text-xs text-muted-foreground">Genauigkeit</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
