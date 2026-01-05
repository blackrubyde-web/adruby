import { Search, MoreVertical, Play, Pause, Copy, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card, Chip } from './layout';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { applyMetaAction, type MetaApplyAction } from '../lib/api/meta';
import { useMetaConnection } from '../hooks/useMetaConnection';

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { campaigns, loading, error, refresh } = useMetaCampaigns();
  const { connected: metaConnected, connection } = useMetaConnection();
  const [campaignRows, setCampaignRows] = useState(campaigns);
  const [actionState, setActionState] = useState<Record<string, boolean>>({});


  {/* Stats Overview */ }
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

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
      <div className="text-2xl text-foreground font-bold mb-1">{formatCurrency(stats.totalSpend)}</div>
      <div className="text-sm text-muted-foreground">Total Spend</div>
    </Card>
  </div>

  {/* Filters and Search */ }
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search */}
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
        {(['all', 'active', 'paused', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === status
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </div>

  {
    error && (
      <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-500">
        {error}
      </Card>
    )
  }

  {
    loading && (
      <Card className="p-4 border border-border bg-card text-sm text-muted-foreground">
        Lade Kampagnen…
      </Card>
    )
  }

  {/* Campaigns Table */ }
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30 bg-muted/5">
            <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Campaign</th>
            <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Spend</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Impressions</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Clicks</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">CTR</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">ROAS</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Conversions</th>
            <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCampaigns.map((campaign) => {
            const normalizedStatus = normalizeStatus(campaign.status);
            return (
              <tr
                key={campaign.id}
                className="border-b border-border/20 hover:bg-muted/5 transition-colors group"
              >
                <td className="p-4">
                  <div>
                    <div className="text-foreground font-medium mb-1">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.id}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${normalizedStatus === 'active'
                      ? 'bg-green-500/20 text-green-500'
                      : normalizedStatus === 'paused'
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'bg-muted/50 text-muted-foreground'
                      }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {normalizedStatus}
                  </span>
                </td>
                <td className="p-4 text-right text-foreground">
                  {formatCurrency(campaign.spend)}
                </td>
                <td className="p-4 text-right text-foreground">
                  {formatCompact(campaign.impressions)}
                </td>
                <td className="p-4 text-right text-foreground">
                  {formatCompact(campaign.clicks)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-foreground">{formatPct(campaign.ctr)}</span>
                    {campaign.roas >= 1 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-foreground font-semibold">{campaign.roas}x</span>
                </td>
                <td className="p-4 text-right text-foreground">
                  {formatCompact(campaign.conversions)}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {normalizedStatus === 'active' ? (
                      <button
                        onClick={() => handleAction(campaign, 'pause')}
                        disabled={isBusy(campaign.id, 'pause')}
                        className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    ) : normalizedStatus === 'paused' ? (
                      <button
                        onClick={() => handleAction(campaign, 'resume')}
                        disabled={isBusy(campaign.id, 'resume')}
                        className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                        title="Resume"
                      >
                        <Play className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleAction(campaign, 'duplicate')}
                      disabled={isBusy(campaign.id, 'duplicate')}
                      className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                    <button
                      onClick={() => handleAction(campaign, 'delete')}
                      disabled={isBusy(campaign.id, 'delete')}
                      className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                    <button
                      onClick={() => openMetaCampaign(campaign.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="View in Meta"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
    </PageShell>
  );
}
