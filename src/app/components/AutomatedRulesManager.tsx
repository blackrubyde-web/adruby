import { useState } from 'react';
import { Plus, Trash2, Power, PowerOff, Edit2, Bell, Zap, TrendingDown, TrendingUp, DollarSign, Clock, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface AutomatedRule {
  id: string;
  name: string;
  trigger: {
    metric: 'ctr' | 'cpc' | 'roas' | 'spend' | 'conversions';
    condition: 'greater_than' | 'less_than' | 'equals';
    value: number;
    timeframe: '1h' | '6h' | '24h' | '7d';
  };
  action: {
    type: 'pause_ad' | 'increase_budget' | 'decrease_budget' | 'notify' | 'switch_bidding';
    value?: number;
  };
  isActive: boolean;
  executionCount: number;
  lastTriggered?: string;
  createdAt: string;
}

const metricConfig = {
  ctr: { label: 'CTR', icon: TrendingUp, unit: '%', color: 'text-blue-500' },
  cpc: { label: 'CPC', icon: DollarSign, unit: '€', color: 'text-green-500' },
  roas: { label: 'ROAS', icon: TrendingUp, unit: 'x', color: 'text-purple-500' },
  spend: { label: 'Spend', icon: DollarSign, unit: '€', color: 'text-orange-500' },
  conversions: { label: 'Conversions', icon: Check, unit: '', color: 'text-green-500' }
};

const actionConfig = {
  pause_ad: { label: 'Pause Ad', icon: PowerOff, color: 'text-red-500' },
  increase_budget: { label: 'Increase Budget', icon: TrendingUp, color: 'text-green-500' },
  decrease_budget: { label: 'Decrease Budget', icon: TrendingDown, color: 'text-orange-500' },
  notify: { label: 'Send Notification', icon: Bell, color: 'text-blue-500' },
  switch_bidding: { label: 'Switch Bidding Strategy', icon: Zap, color: 'text-purple-500' }
};

export function AutomatedRulesManager() {
  const [rules, setRules] = useState<AutomatedRule[]>([
    {
      id: '1',
      name: 'Pause low-performing ads',
      trigger: {
        metric: 'ctr',
        condition: 'less_than',
        value: 1,
        timeframe: '24h'
      },
      action: {
        type: 'pause_ad'
      },
      isActive: true,
      executionCount: 12,
      lastTriggered: '2 hours ago',
      createdAt: '2024-12-10'
    },
    {
      id: '2',
      name: 'Scale high ROAS campaigns',
      trigger: {
        metric: 'roas',
        condition: 'greater_than',
        value: 10,
        timeframe: '24h'
      },
      action: {
        type: 'increase_budget',
        value: 20
      },
      isActive: true,
      executionCount: 5,
      lastTriggered: '5 hours ago',
      createdAt: '2024-12-12'
    },
    {
      id: '3',
      name: 'Alert on high CPC',
      trigger: {
        metric: 'cpc',
        condition: 'greater_than',
        value: 2,
        timeframe: '6h'
      },
      action: {
        type: 'notify'
      },
      isActive: false,
      executionCount: 0,
      createdAt: '2024-12-15'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomatedRule>>({
    name: '',
    trigger: {
      metric: 'ctr',
      condition: 'less_than',
      value: 1,
      timeframe: '24h'
    },
    action: {
      type: 'pause_ad'
    },
    isActive: true
  });

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
    const rule = rules.find(r => r.id === id);
    toast.success(`Rule "${rule?.name}" ${!rule?.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleDeleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(rule => rule.id !== id));
    toast.success(`Rule "${rule?.name}" deleted`);
  };

  const handleCreateRule = () => {
    if (!newRule.name) {
      toast.error('Please enter a rule name');
      return;
    }

    const rule: AutomatedRule = {
      id: Date.now().toString(),
      name: newRule.name,
      trigger: newRule.trigger as AutomatedRule['trigger'],
      action: newRule.action as AutomatedRule['action'],
      isActive: true,
      executionCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRules(prev => [rule, ...prev]);
    setIsCreating(false);
    setNewRule({
      name: '',
      trigger: {
        metric: 'ctr',
        condition: 'less_than',
        value: 1,
        timeframe: '24h'
      },
      action: {
        type: 'pause_ad'
      },
      isActive: true
    });
    toast.success('🎉 Automated rule created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Automated Rules</h2>
          <p className="text-muted-foreground">
            Set up automatic actions based on campaign performance metrics
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{rules.length}</div>
          <div className="text-sm text-muted-foreground">Total Rules</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">
            {rules.filter(r => r.isActive).length}
          </div>
          <div className="text-sm text-muted-foreground">Active Rules</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">
            {rules.reduce((sum, r) => sum + r.executionCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Executions</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">
            {rules.filter(r => r.executionCount > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Triggered Rules</div>
        </div>
      </div>

      {/* Create Rule Form */}
      {isCreating && (
        <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-foreground mb-4">Create New Rule</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-foreground mb-2">Rule Name</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pause low-performing ads"
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-foreground mb-2">Metric</Label>
                <select
                  value={newRule.trigger?.metric}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger!, metric: e.target.value as AutomatedRule['trigger']['metric'] }
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  {Object.entries(metricConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-foreground mb-2">Condition</Label>
                <select
                  value={newRule.trigger?.condition}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger!, condition: e.target.value as AutomatedRule['trigger']['condition'] }
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  <option value="greater_than">Greater than</option>
                  <option value="less_than">Less than</option>
                  <option value="equals">Equals</option>
                </select>
              </div>

              <div>
                <Label className="text-foreground mb-2">Value</Label>
                <Input
                  type="number"
                  value={newRule.trigger?.value}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger!, value: parseFloat(e.target.value) }
                  }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label className="text-foreground mb-2">Timeframe</Label>
                <select
                  value={newRule.trigger?.timeframe}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger!, timeframe: e.target.value as AutomatedRule['trigger']['timeframe'] }
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  <option value="1h">Last 1 hour</option>
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground mb-2">Action</Label>
                <select
                  value={newRule.action?.type}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    action: { ...prev.action!, type: e.target.value as AutomatedRule['action']['type'] }
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {(newRule.action?.type === 'increase_budget' || newRule.action?.type === 'decrease_budget') && (
                <div>
                  <Label className="text-foreground mb-2">Percentage (%)</Label>
                  <Input
                    type="number"
                    value={newRule.action?.value || 20}
                    onChange={(e) => setNewRule(prev => ({
                      ...prev,
                      action: { ...prev.action!, value: parseFloat(e.target.value) }
                    }))}
                    placeholder="20"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleCreateRule}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No automated rules yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first rule to automate campaign management
            </p>
          </div>
        ) : (
          rules.map((rule) => {
            const metricInfo = metricConfig[rule.trigger.metric];
            const actionInfo = actionConfig[rule.action.type];
            const MetricIcon = metricInfo.icon;
            const ActionIcon = actionInfo.icon;

            return (
              <div
                key={rule.id}
                className={`bg-card border rounded-xl p-5 transition-all hover:shadow-lg ${
                  rule.isActive ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Rule Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-foreground">{rule.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rule.isActive
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Trigger & Action */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <MetricIcon className={`w-4 h-4 ${metricInfo.color}`} />
                        <span className="text-foreground font-medium">
                          {metricInfo.label}
                        </span>
                        <span className="text-muted-foreground">
                          {rule.trigger.condition.replace('_', ' ')} {rule.trigger.value}
                          {metricInfo.unit}
                        </span>
                        <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                        <span className="text-muted-foreground text-xs">
                          {rule.trigger.timeframe}
                        </span>
                      </div>

                      <span className="text-muted-foreground">→</span>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <ActionIcon className={`w-4 h-4 ${actionInfo.color}`} />
                        <span className="text-foreground font-medium">
                          {actionInfo.label}
                        </span>
                        {rule.action.value && (
                          <span className="text-muted-foreground">
                            ({rule.action.value}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Executed {rule.executionCount} times</span>
                      </div>
                      {rule.lastTriggered && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last triggered: {rule.lastTriggered}</span>
                        </div>
                      )}
                      <div>Created: {rule.createdAt}</div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.isActive
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                      }`}
                    >
                      {rule.isActive ? (
                        <Power className="w-4 h-4" />
                      ) : (
                        <PowerOff className="w-4 h-4" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
