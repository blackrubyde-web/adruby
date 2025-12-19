import { useState } from 'react';
import { Building2, Plus, Users, TrendingUp, DollarSign, Check, AlertCircle, Settings, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface AdAccount {
  id: string;
  name: string;
  accountId: string;
  status: 'active' | 'inactive' | 'limited';
  currency: string;
  timezone: string;
  performance: {
    spend: number;
    revenue: number;
    roas: number;
    activeCampaigns: number;
  };
  lastSync: string;
  isPrimary: boolean;
}

export function MultiAccountManager() {
  const [accounts, setAccounts] = useState<AdAccount[]>([
    {
      id: '1',
      name: 'Main Business Account',
      accountId: 'act_1234567890',
      status: 'active',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      performance: {
        spend: 45600,
        revenue: 324800,
        roas: 7.1,
        activeCampaigns: 12
      },
      lastSync: '2 minutes ago',
      isPrimary: true
    },
    {
      id: '2',
      name: 'E-Commerce Store',
      accountId: 'act_9876543210',
      status: 'active',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      performance: {
        spend: 28900,
        revenue: 189500,
        roas: 6.6,
        activeCampaigns: 8
      },
      lastSync: '5 minutes ago',
      isPrimary: false
    },
    {
      id: '3',
      name: 'Client - FitnessPro GmbH',
      accountId: 'act_5555666677',
      status: 'active',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      performance: {
        spend: 18400,
        revenue: 156200,
        roas: 8.5,
        activeCampaigns: 5
      },
      lastSync: '1 hour ago',
      isPrimary: false
    },
    {
      id: '4',
      name: 'Test Account - Sandbox',
      accountId: 'act_9999888877',
      status: 'inactive',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      performance: {
        spend: 0,
        revenue: 0,
        roas: 0,
        activeCampaigns: 0
      },
      lastSync: '3 days ago',
      isPrimary: false
    }
  ]);

  const [selectedAccount, setSelectedAccount] = useState<string | null>(accounts[0].id);

  const handleSwitchAccount = (accountId: string) => {
    setSelectedAccount(accountId);
    const account = accounts.find(a => a.id === accountId);
    toast.success(`Switched to "${account?.name}"`);
  };

  const handleSetPrimary = (accountId: string) => {
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isPrimary: acc.id === accountId
    })));
    toast.success('Primary account updated');
  };

  const handleSyncAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    toast.success(`Syncing "${account?.name}"...`);
    
    setTimeout(() => {
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId ? { ...acc, lastSync: 'Just now' } : acc
      ));
      toast.success('Account synced successfully!');
    }, 2000);
  };

  const totalStats = accounts.reduce((acc, account) => ({
    spend: acc.spend + account.performance.spend,
    revenue: acc.revenue + account.performance.revenue,
    campaigns: acc.campaigns + account.performance.activeCampaigns
  }), { spend: 0, revenue: 0, campaigns: 0 });

  const avgROAS = totalStats.revenue / totalStats.spend;

  const getStatusColor = (status: AdAccount['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'inactive': return 'bg-gray-500/20 text-gray-500';
      case 'limited': return 'bg-orange-500/20 text-orange-500';
    }
  };

  const getStatusIcon = (status: AdAccount['status']) => {
    switch (status) {
      case 'active': return Check;
      case 'inactive': return AlertCircle;
      case 'limited': return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Multi-Account Management</h2>
          <p className="text-muted-foreground">
            Manage multiple Facebook Ad Accounts from one dashboard
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Connect Account
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Accounts</span>
          </div>
          <div className="text-2xl text-foreground font-bold">{accounts.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {accounts.filter(a => a.status === 'active').length} active
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Total Campaigns</span>
          </div>
          <div className="text-2xl text-foreground font-bold">{totalStats.campaigns}</div>
          <div className="text-xs text-muted-foreground mt-1">Across all accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Total Spend</span>
          </div>
          <div className="text-2xl text-foreground font-bold">€{(totalStats.spend / 1000).toFixed(1)}K</div>
          <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Avg. ROAS</span>
          </div>
          <div className="text-2xl text-foreground font-bold text-green-500">{avgROAS.toFixed(1)}x</div>
          <div className="text-xs text-muted-foreground mt-1">All accounts</div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Connected Accounts</h3>
        
        <div className="space-y-3">
          {accounts.map((account) => {
            const StatusIcon = getStatusIcon(account.status);
            const isSelected = selectedAccount === account.id;

            return (
              <div
                key={account.id}
                onClick={() => handleSwitchAccount(account.id)}
                className={`border-2 rounded-xl p-5 transition-all cursor-pointer hover:shadow-lg ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Left: Account Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-primary/20'
                    }`}>
                      <Building2 className={`w-7 h-7 ${
                        isSelected ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground text-lg">{account.name}</h4>
                        {account.isPrimary && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                            PRIMARY
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(account.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {account.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="font-mono">{account.accountId}</span>
                        <span>•</span>
                        <span>{account.currency}</span>
                        <span>•</span>
                        <span>{account.timezone}</span>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Spend</div>
                          <div className="font-bold text-foreground">
                            €{(account.performance.spend / 1000).toFixed(1)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                          <div className="font-bold text-foreground">
                            €{(account.performance.revenue / 1000).toFixed(1)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">ROAS</div>
                          <div className="font-bold text-green-500">
                            {account.performance.roas.toFixed(1)}x
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Campaigns</div>
                          <div className="font-bold text-foreground">
                            {account.performance.activeCampaigns}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {isSelected && (
                      <div className="px-3 py-1.5 bg-primary rounded-lg">
                        <span className="text-xs font-bold text-primary-foreground">ACTIVE</span>
                      </div>
                    )}
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncAccount(account.id);
                      }}
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted whitespace-nowrap"
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Sync
                    </Button>

                    {!account.isPrimary && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(account.id);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white whitespace-nowrap"
                      >
                        Set Primary
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Last synced: {account.lastSync}</span>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-primary font-medium">
                      <Check className="w-3 h-3" />
                      <span>Currently viewing this account</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-lg group text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <Users className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
            </div>
            <h4 className="font-bold text-foreground">Bulk Operations</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage campaigns across multiple accounts at once
          </p>
        </button>

        <button className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-lg group text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <BarChart3 className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
            </div>
            <h4 className="font-bold text-foreground">Unified Reporting</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            View combined performance across all accounts
          </p>
        </button>

        <button className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-lg group text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
              <Settings className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
            </div>
            <h4 className="font-bold text-foreground">Team Permissions</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Control access levels for team members
          </p>
        </button>
      </div>
    </div>
  );
}
