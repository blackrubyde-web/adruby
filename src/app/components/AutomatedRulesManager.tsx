import { Zap, Shield, TrendingUp, Power, Brain } from 'lucide-react';
import { AutopilotActivityFeed } from './dashboard/AutopilotActivityFeed';
import { Card } from './ui/card';

export function AutomatedRulesManager() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Autopilot Neural Engine
          </h2>
          <p className="text-muted-foreground">
            Real-time automated decisions executed by your Master Strategies.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-500">ENGINE ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <AutopilotActivityFeed />
        </div>

        {/* Logic Explainer / Legend */}
        <div className="space-y-4">
          <Card className="p-5 border-primary/20 bg-primary/5">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Active Logic Modules
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50">
                <Shield className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Soft Kill Protection</div>
                  <p className="text-[10px] text-muted-foreground">Pauses ads with high spend ({'>'}1.5x CPA) and 0 sales.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50">
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Surf Scaling</div>
                  <p className="text-[10px] text-muted-foreground">Aggressively scales budgets when ROAS {'>'} 1.3x Target.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50">
                <Power className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-foreground">Fatigue Throttle</div>
                  <p className="text-[10px] text-muted-foreground">Reduces budget if Frequency {'>'} 2.2 and CTR drops.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground">
              Rules are managed via your <strong>Master Strategies</strong>. To change thresholds, edit the specific Strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
