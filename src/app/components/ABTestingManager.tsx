import { useState } from 'react';
import { Plus, Play, Pause, Trophy, Users, Target, BarChart3, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'draft' | 'paused';
  startDate: string;
  endDate?: string;
  variants: {
    id: string;
    name: string;
    type: 'control' | 'variant';
    trafficSplit: number;
    metrics: {
      impressions: number;
      clicks: number;
      ctr: number;
      conversions: number;
      cvr: number;
      cost: number;
      roas: number;
    };
  }[];
  testingVariable: 'headline' | 'image' | 'cta' | 'audience' | 'copy';
  confidence: number;
  winner?: string;
  budget: number;
  spent: number;
}

export function ABTestingManager() {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Headline Optimization Test',
      status: 'running',
      startDate: '2024-12-15',
      variants: [
        {
          id: 'a',
          name: 'Control - Original Headline',
          type: 'control',
          trafficSplit: 50,
          metrics: {
            impressions: 45200,
            clicks: 1580,
            ctr: 3.5,
            conversions: 142,
            cvr: 8.99,
            cost: 892,
            roas: 5.8
          }
        },
        {
          id: 'b',
          name: 'Variant B - Emotional Headline',
          type: 'variant',
          trafficSplit: 50,
          metrics: {
            impressions: 44800,
            clicks: 2240,
            ctr: 5.0,
            conversions: 201,
            cvr: 8.97,
            cost: 895,
            roas: 8.2
          }
        }
      ],
      testingVariable: 'headline',
      confidence: 94,
      winner: 'b',
      budget: 2000,
      spent: 1787
    },
    {
      id: '2',
      name: 'CTA Button Color Test',
      status: 'running',
      startDate: '2024-12-14',
      variants: [
        {
          id: 'a',
          name: 'Red Button',
          type: 'control',
          trafficSplit: 33,
          metrics: {
            impressions: 23400,
            clicks: 890,
            ctr: 3.8,
            conversions: 67,
            cvr: 7.53,
            cost: 456,
            roas: 4.2
          }
        },
        {
          id: 'b',
          name: 'Green Button',
          type: 'variant',
          trafficSplit: 33,
          metrics: {
            impressions: 23100,
            clicks: 1020,
            ctr: 4.4,
            conversions: 89,
            cvr: 8.73,
            cost: 445,
            roas: 5.6
          }
        },
        {
          id: 'c',
          name: 'Blue Button',
          type: 'variant',
          trafficSplit: 34,
          metrics: {
            impressions: 23600,
            clicks: 945,
            ctr: 4.0,
            conversions: 78,
            cvr: 8.25,
            cost: 452,
            roas: 4.9
          }
        }
      ],
      testingVariable: 'cta',
      confidence: 78,
      budget: 1500,
      spent: 1353
    },
    {
      id: '3',
      name: 'Audience Targeting Test',
      status: 'completed',
      startDate: '2024-12-01',
      endDate: '2024-12-10',
      variants: [
        {
          id: 'a',
          name: 'Broad Audience',
          type: 'control',
          trafficSplit: 50,
          metrics: {
            impressions: 125000,
            clicks: 3750,
            ctr: 3.0,
            conversions: 285,
            cvr: 7.6,
            cost: 2340,
            roas: 4.5
          }
        },
        {
          id: 'b',
          name: 'Lookalike Audience',
          type: 'variant',
          trafficSplit: 50,
          metrics: {
            impressions: 89000,
            clicks: 4450,
            ctr: 5.0,
            conversions: 401,
            cvr: 9.01,
            cost: 2280,
            roas: 7.8
          }
        }
      ],
      testingVariable: 'audience',
      confidence: 99,
      winner: 'b',
      budget: 5000,
      spent: 4620
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);

  const handlePauseTest = (id: string) => {
    setTests(prev => prev.map(test =>
      test.id === id ? { ...test, status: 'paused' as const } : test
    ));
    toast.success('Test paused');
  };

  const handleResumeTest = (id: string) => {
    setTests(prev => prev.map(test =>
      test.id === id ? { ...test, status: 'running' as const } : test
    ));
    toast.success('Test resumed');
  };

  const handleDeclareWinner = (testId: string, variantId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId ? { ...test, winner: variantId, status: 'completed' as const } : test
    ));
    toast.success('🏆 Winner declared and test completed!');
  };

  const stats = {
    totalTests: tests.length,
    running: tests.filter(t => t.status === 'running').length,
    completed: tests.filter(t => t.status === 'completed').length,
    avgConfidence: (tests.reduce((sum, t) => sum + t.confidence, 0) / tests.length).toFixed(0)
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      case 'paused': return 'bg-orange-500/20 text-orange-500';
      case 'draft': return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getVariableIcon = (variable: ABTest['testingVariable']) => {
    switch (variable) {
      case 'headline': return BarChart3;
      case 'image': return Target;
      case 'cta': return Zap;
      case 'audience': return Users;
      case 'copy': return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">A/B Testing Manager</h2>
          <p className="text-muted-foreground">
            Create and manage split tests to optimize ad performance
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.totalTests}</div>
          <div className="text-sm text-muted-foreground">Total Tests</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.running}</div>
          <div className="text-sm text-muted-foreground">Running</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.avgConfidence}%</div>
          <div className="text-sm text-muted-foreground">Avg. Confidence</div>
        </div>
      </div>

      {/* Create Test Form */}
      {isCreating && (
        <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-foreground mb-4">Create New A/B Test</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Coming soon: Interactive A/B test creation wizard
          </p>
          <Button onClick={() => setIsCreating(false)} variant="outline">
            Close
          </Button>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => {
          const VariableIcon = getVariableIcon(test.testingVariable);
          const budgetProgress = (test.spent / test.budget) * 100;
          return (
            <div
              key={test.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{test.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status.toUpperCase()}
                    </span>
                    {test.winner && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Winner Declared
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <VariableIcon className="w-4 h-4" />
                      <span>Testing: {test.testingVariable}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Started: {test.startDate}</span>
                    </div>
                    {test.endDate && (
                      <span>Ended: {test.endDate}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {test.status === 'running' && (
                    <Button
                      onClick={() => handlePauseTest(test.id)}
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {test.status === 'paused' && (
                    <Button
                      onClick={() => handleResumeTest(test.id)}
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>

              {/* Budget & Confidence */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Budget Progress</span>
                    <span className="text-foreground font-medium">
                      €{test.spent.toLocaleString()} / €{test.budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Statistical Confidence</span>
                    <span className={`font-bold ${test.confidence >= 95 ? 'text-green-500' : test.confidence >= 80 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {test.confidence}%
                    </span>
                  </div>
                  <Progress value={test.confidence} className="h-2" />
                </div>
              </div>

              {/* Variants Comparison */}
              <div className="grid gap-3">
                {test.variants.map((variant, index) => {
                  const isWinner = variant.id === test.winner;
                  const controlVariant = test.variants.find(v => v.type === 'control');
                  const ctrLift = controlVariant && variant.type === 'variant'
                    ? ((variant.metrics.ctr - controlVariant.metrics.ctr) / controlVariant.metrics.ctr * 100).toFixed(1)
                    : null;
                  const roasLift = controlVariant && variant.type === 'variant'
                    ? ((variant.metrics.roas - controlVariant.metrics.roas) / controlVariant.metrics.roas * 100).toFixed(1)
                    : null;

                  return (
                    <div
                      key={variant.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isWinner
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            variant.type === 'control'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-purple-500/20 text-purple-500'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{variant.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {variant.trafficSplit}% traffic • {variant.type === 'control' ? 'Control' : 'Variant'}
                            </p>
                          </div>
                        </div>

                        {isWinner && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-500">WINNER</span>
                          </div>
                        )}

                        {!test.winner && test.status === 'running' && variant.type === 'variant' && (
                          <Button
                            onClick={() => handleDeclareWinner(test.id, variant.id)}
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white text-xs"
                          >
                            <Trophy className="w-3 h-3 mr-1" />
                            Declare Winner
                          </Button>
                        )}
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-7 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Impressions</div>
                          <div className="font-bold text-foreground">
                            {(variant.metrics.impressions / 1000).toFixed(1)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                          <div className="font-bold text-foreground">
                            {variant.metrics.clicks.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">CTR</div>
                          <div className="font-bold text-foreground flex items-center gap-1">
                            {variant.metrics.ctr}%
                            {ctrLift && (
                              <span className={`text-xs ${parseFloat(ctrLift) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({parseFloat(ctrLift) > 0 ? '+' : ''}{ctrLift}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Conversions</div>
                          <div className="font-bold text-foreground">
                            {variant.metrics.conversions}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">CVR</div>
                          <div className="font-bold text-foreground">
                            {variant.metrics.cvr}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Cost</div>
                          <div className="font-bold text-foreground">
                            €{variant.metrics.cost}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">ROAS</div>
                          <div className="font-bold text-green-500 flex items-center gap-1">
                            {variant.metrics.roas}x
                            {roasLift && (
                              <span className={`text-xs ${parseFloat(roasLift) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({parseFloat(roasLift) > 0 ? '+' : ''}{roasLift}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation */}
              {test.confidence >= 95 && !test.winner && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-500">High Confidence - Ready to declare winner</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Statistical confidence is above 95%. You can safely declare a winner.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {test.confidence < 80 && test.status === 'running' && (
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-500">More data needed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continue running the test to reach statistical significance (95% confidence).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No A/B tests yet</p>
          <p className="text-sm text-muted-foreground">Create your first test to optimize ad performance</p>
        </div>
      )}
    </div>
  );
}
