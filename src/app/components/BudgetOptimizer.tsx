import { useState } from 'react';
import { TrendingUp, TrendingDown, Zap, ArrowRight, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface BudgetRecommendation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedBudget: number;
  change: number;
  changeType: 'increase' | 'decrease';
  reason: string;
  potentialROAS: number;
  currentROAS: number;
  impact: 'high' | 'medium' | 'low';
}

export function BudgetOptimizer() {
  const [recommendations, _setRecommendations] = useState<BudgetRecommendation[]>([
    {
      campaignId: '1',
      campaignName: 'Summer Sale Campaign',
      currentBudget: 500,
      recommendedBudget: 750,
      change: 50,
      changeType: 'increase',
      reason: 'High ROAS with low saturation - scale opportunity',
      potentialROAS: 8.2,
      currentROAS: 6.5,
      impact: 'high'
    },
    {
      campaignId: '2',
      campaignName: 'Brand Awareness Q4',
      currentBudget: 1000,
      recommendedBudget: 650,
      change: -35,
      changeType: 'decrease',
      reason: 'Declining CTR and high CPC - reduce spend',
      potentialROAS: 2.8,
      currentROAS: 2.1,
      impact: 'high'
    },
    {
      campaignId: '3',
      campaignName: 'Product Launch',
      currentBudget: 300,
      recommendedBudget: 450,
      change: 50,
      changeType: 'increase',
      reason: 'Strong conversion rate - expand reach',
      potentialROAS: 5.5,
      currentROAS: 4.8,
      impact: 'medium'
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const totalCurrentBudget = recommendations.reduce((sum, rec) => sum + rec.currentBudget, 0);
  const totalRecommendedBudget = recommendations.reduce((sum, rec) => sum + rec.recommendedBudget, 0);
  const totalSavings = totalCurrentBudget - totalRecommendedBudget;
  const avgCurrentROAS = recommendations.reduce((sum, rec) => sum + rec.currentROAS, 0) / recommendations.length;
  const avgPotentialROAS = recommendations.reduce((sum, rec) => sum + rec.potentialROAS, 0) / recommendations.length;

  const handleApplyAll = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      toast.success('🎉 Budget optimization applied to all campaigns!');
    }, 2000);
  };

  const handleApplySingle = (rec: BudgetRecommendation) => {
    toast.success(`✅ Budget updated for "${rec.campaignName}"`);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">AI Budget Optimizer</h3>
            <p className="text-sm text-muted-foreground">Real-time budget recommendations</p>
          </div>
        </div>
        <Button
          onClick={handleApplyAll}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90"
        >
          {isOptimizing ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Apply All
            </>
          )}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Potential Savings</span>
            {totalSavings > 0 ? (
              <TrendingDown className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-foreground">
            {totalSavings > 0 ? '-' : '+'}€{Math.abs(totalSavings).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalSavings > 0 ? 'Saved per day' : 'Investment per day'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg ROAS Boost</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            +{((avgPotentialROAS - avgCurrentROAS) / avgCurrentROAS * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {avgCurrentROAS.toFixed(1)}x → {avgPotentialROAS.toFixed(1)}x
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Campaigns</span>
            <AlertCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{recommendations.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Need optimization</div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Recommendations</h4>
          <span className="text-xs text-muted-foreground">Updated 5 min ago</span>
        </div>

        {recommendations.map((rec) => (
          <div
            key={rec.campaignId}
            className={`border rounded-xl p-4 transition-all hover:shadow-md ${
              rec.impact === 'high'
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            {/* Campaign Name & Impact Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-semibold text-foreground">{rec.campaignName}</h5>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rec.impact === 'high'
                        ? 'bg-red-500/20 text-red-500'
                        : rec.impact === 'medium'
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}
                  >
                    {rec.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            </div>

            {/* Budget Change Visual */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Current</span>
                  <span className="font-medium text-foreground">€{rec.currentBudget}/day</span>
                </div>
                <Progress value={50} className="h-2 mb-1" />
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight
                  className={`w-5 h-5 ${
                    rec.changeType === 'increase' ? 'text-green-500' : 'text-orange-500'
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    rec.changeType === 'increase' ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {rec.changeType === 'increase' ? '+' : ''}
                  {rec.change}%
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Recommended</span>
                  <span className="font-medium text-foreground">€{rec.recommendedBudget}/day</span>
                </div>
                <Progress value={75} className="h-2 mb-1" />
              </div>
            </div>

            {/* ROAS Impact */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Current ROAS: </span>
                  <span className="font-bold text-foreground">{rec.currentROAS}x</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Potential ROAS: </span>
                  <span className="font-bold text-green-500">{rec.potentialROAS}x</span>
                </div>
              </div>

              <Button
                onClick={() => handleApplySingle(rec)}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground">
            AI analyzes performance every 15 minutes and suggests budget adjustments based on
            real-time ROAS, CTR, and market conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
