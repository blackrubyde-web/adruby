import { Search, Filter, MoreVertical, Play, Pause, Copy, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { PageShell, HeroHeader, Card, Chip } from './layout';

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale 2024',
      status: 'active',
      budget: 5000,
      spent: 3247,
      impressions: 1847234,
      clicks: 45892,
      ctr: 2.49,
      conversions: 892,
      roas: 6.8,
      cpc: 0.71,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      trend: 'up'
    },
    {
      id: 2,
      name: 'Brand Awareness Q3',
      status: 'active',
      budget: 8000,
      spent: 6234,
      impressions: 2934567,
      clicks: 67234,
      ctr: 2.29,
      conversions: 1234,
      roas: 5.2,
      cpc: 0.93,
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      trend: 'up'
    },
    {
      id: 3,
      name: 'Product Launch - New Collection',
      status: 'active',
      budget: 12000,
      spent: 2847,
      impressions: 987432,
      clicks: 34567,
      ctr: 3.5,
      conversions: 567,
      roas: 8.9,
      cpc: 0.82,
      startDate: '2024-08-15',
      endDate: '2024-10-15',
      trend: 'up'
    },
    {
      id: 4,
      name: 'Retargeting - Cart Abandoners',
      status: 'active',
      budget: 3000,
      spent: 2876,
      impressions: 456789,
      clicks: 23456,
      ctr: 5.14,
      conversions: 789,
      roas: 12.4,
      cpc: 0.12,
      startDate: '2024-07-20',
      endDate: 'Ongoing',
      trend: 'up'
    },
    {
      id: 5,
      name: 'Holiday Promo Test',
      status: 'paused',
      budget: 2000,
      spent: 847,
      impressions: 234567,
      clicks: 4567,
      ctr: 1.95,
      conversions: 89,
      roas: 3.2,
      cpc: 0.19,
      startDate: '2024-08-01',
      endDate: '2024-08-10',
      trend: 'down'
    },
    {
      id: 6,
      name: 'Spring Campaign 2024',
      status: 'completed',
      budget: 6000,
      spent: 6000,
      impressions: 1567890,
      clicks: 38945,
      ctr: 2.48,
      conversions: 645,
      roas: 5.7,
      cpc: 0.15,
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      trend: 'up'
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    totalSpend: campaigns.reduce((sum, c) => sum + c.spent, 0)
  };

  return (
    <PageShell>
      <HeroHeader
        title="Campaigns"
        subtitle="Manage and optimize your advertising campaigns"
        chips={
          <>
            <Chip>{stats.total} Total</Chip>
            <Chip>🟢 {stats.active} Active</Chip>
            <Chip>⏸️ {stats.paused} Paused</Chip>
          </>
        }
        actions={
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
            Create Campaign
          </button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Campaigns</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.paused}</div>
          <div className="text-sm text-muted-foreground">Paused</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl text-foreground font-bold mb-1">€{(stats.totalSpend / 1000).toFixed(1)}K</div>
          <div className="text-sm text-muted-foreground">Total Spend</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/5">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Campaign</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Budget</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Spent</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Impressions</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Clicks</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">CTR</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">ROAS</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr 
                  key={campaign.id}
                  className="border-b border-border/20 hover:bg-muted/5 transition-colors group"
                >
                  <td className="p-4">
                    <div>
                      <div className="text-foreground font-medium mb-1">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.startDate} - {campaign.endDate}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                        campaign.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : campaign.status === 'paused'
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-foreground">
                    ${campaign.budget.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-foreground">${campaign.spent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {((campaign.spent / campaign.budget) * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="p-4 text-right text-foreground">
                    {(campaign.impressions / 1000000).toFixed(2)}M
                  </td>
                  <td className="p-4 text-right text-foreground">
                    {(campaign.clicks / 1000).toFixed(1)}K
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-foreground">{campaign.ctr.toFixed(2)}%</span>
                      {campaign.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-foreground font-semibold">{campaign.roas}x</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {campaign.status === 'active' ? (
                        <button 
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button 
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Resume"
                        >
                          <Play className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </button>
                      ) : null}
                      <button 
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                      <button 
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                      <button 
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="More"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
