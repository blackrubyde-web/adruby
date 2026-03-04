import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Brain, Zap } from 'lucide-react';

interface MarketAnalysisLoaderProps {
  progress?: number;
  message?: string;
}

const loadingMessages = [
  'Daten werden verarbeitet…',
  'KI-Modell analysiert deine Eingaben…',
  'Optimierungen werden berechnet…',
  'Ergebnisse werden zusammengestellt…',
];

export function MarketAnalysisLoader({ progress: externalProgress, message }: MarketAnalysisLoaderProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const progress = typeof externalProgress === 'number' ? externalProgress : internalProgress;

  // Animate internal progress if no external progress is provided
  useEffect(() => {
    if (typeof externalProgress === 'number') return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        // Slow down as we approach 90% — never hit 100% on fake progress
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 2 : prev < 60 ? 1.5 : prev < 80 ? 0.8 : 0.3;
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [externalProgress]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-card border-border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Animated Brain Icon */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">KI-Analyse läuft</h2>
          <p className="text-sm text-muted-foreground min-h-[1.25rem] transition-all duration-300">
            {message || loadingMessages[messageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="text-foreground font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Subtle hint */}
        <p className="text-xs text-muted-foreground text-center">
          Das kann einige Sekunden dauern
        </p>
      </Card>
    </div>
  );
}
