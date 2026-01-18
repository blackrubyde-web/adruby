import { Search, MoreVertical, Play, Pause, Copy, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useMetaCampaigns, type MetaCampaign } from '../hooks/useMetaCampaigns';
import { useMetaConnection } from '../hooks/useMetaConnection';
import type { MetaApplyAction } from '../lib/api/meta';
import { applyMetaAction } from '../lib/api/meta';

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';

// Helper functions (mock implementations or moved from utils)
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatCompact = (num: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);

const formatPct = (num: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(num);

const normalizeStatus = (status: string) => status.toLowerCase();

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { campaigns, loading, error, refresh } = useMetaCampaigns();
  const { connection } = useMetaConnection();
  const [actionState, setActionState] = useState<Record<string, boolean>>({});
  const handleCreateCampaign = () => {
    window.history.pushState({}, document.title, '/campaign-builder');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Mock stats - replace with real calculations based on campaigns
  const stats = useMemo(() => {
    const active = campaigns.filter(c => normalizeStatus(c.status) === 'active').length;
    const paused = campaigns.filter(c => normalizeStatus(c.status) === 'paused').length;
    const totalSpend = campaigns.reduce((acc, curr) => acc + (curr.spend || 0), 0);
    return {
      total: campaigns.length,
      active,
      paused,
      totalSpend
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || normalizeStatus(c.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const handleAction = useCallback(async (campaign: MetaCampaign, action: MetaApplyAction) => {
    const id = campaign.id;
    setActionState(prev => ({ ...prev, [`${id}-${action}`]: true }));
    try {
      const res = await applyMetaAction({ campaignId: id, action });
      if (!res?.ok) {
        throw new Error('Meta action failed');
      }
      toast.success(`Campaign ${action} successful`);
      refresh();
    } catch (err) {
      toast.error(`Failed to ${action} campaign`);
    } finally {
      setActionState(prev => ({ ...prev, [`${id}-${action}`]: false }));
    }
  }, [refresh]);

  const isBusy = useCallback((id: string, action: MetaApplyAction) => {
    return !!actionState[`${id}-${action}`];
  }, [actionState]);

  const openMetaCampaign = (id: string) => {
    window.open(`https://business.facebook.com/adsmanager/manage/campaigns?act=${connection?.ad_account_id}&selection_ids=${id}`, '_blank');
  };

  return (
    <DashboardShell
      title="Campaigns"
      subtitle="Manage and optimize your Meta Ads campaigns."
      headerChips={
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="text-xs">{stats.total} Campaigns</Badge>
          <Badge variant="outline" className="text-xs text-green-600 border-green-600/30">{stats.active} Active</Badge>
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-600/30">{stats.paused} Paused</Badge>
          <Badge variant="outline" className="text-xs">{formatCurrency(stats.totalSpend)} Spend</Badge>
        </div>
      }
      headerActions={
        <Button onClick={handleCreateCampaign} className="gap-2">
          <Plus className="w-4 h-4" />
          Neue Kampagne
        </Button>
      }
    >

      {/* Filters and Search - Open Layout */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg w-full md:w-auto">
          {(['all', 'active', 'paused', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === status
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-500 mb-8" variant="flat">
          {error}
        </Card>
      )}

      {loading && (
        <Card className="p-4 border border-border bg-card text-sm text-muted-foreground mb-8" variant="flat">
          Lade Kampagnen…
        </Card>
      )}

      {!loading && campaigns.length === 0 && (
        <Card variant="glass" className="mb-8">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8">
            <div>
              <div className="text-lg font-semibold text-foreground mb-1">Noch keine Kampagnen</div>
              <div className="text-sm text-muted-foreground">Erstelle eine Kampagne und pushe sie direkt zu Meta.</div>
            </div>
            <Button onClick={handleCreateCampaign}>
              Neuen Kampagne erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table (Desktop) */}
      <div className="hidden md:block">
        <Card variant="glass" className="overflow-hidden" padding="none">
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
                          <div className="text-xs text-muted-foreground font-mono opacity-70">
                            {campaign.id}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            normalizedStatus === 'active' ? 'default' :
                              normalizedStatus === 'paused' ? 'secondary' : 'outline'
                          }
                          className={`
                          ${normalizedStatus === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' : ''}
                          ${normalizedStatus === 'paused' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20' : ''}
                        `}
                        >
                          {normalizedStatus === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />}
                          {normalizedStatus}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-foreground font-medium">
                        {formatCurrency(campaign.spend)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatCompact(campaign.impressions)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatCompact(campaign.clicks)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-foreground font-medium">{formatPct(campaign.ctr)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className={`font-bold ${campaign.roas >= 2.5 ? 'text-green-600' : 'text-foreground'}`}>{campaign.roas}x</span>
                          {campaign.roas >= 1 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right text-foreground">
                        {formatCompact(campaign.conversions)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {normalizedStatus === 'active' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-orange-500"
                              onClick={() => handleAction(campaign, 'pause')}
                              disabled={isBusy(campaign.id, 'pause')}
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : normalizedStatus === 'paused' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-green-500"
                              onClick={() => handleAction(campaign, 'resume')}
                              disabled={isBusy(campaign.id, 'resume')}
                              title="Resume"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleAction(campaign, 'duplicate')}
                            disabled={isBusy(campaign.id, 'duplicate')}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleAction(campaign, 'delete')}
                            disabled={isBusy(campaign.id, 'delete')}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <div className="w-px h-4 bg-border mx-1" />

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openMetaCampaign(campaign.id)}
                            title="View in Meta"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Campaigns Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {filteredCampaigns.map((campaign) => {
          const normalizedStatus = normalizeStatus(campaign.status);
          return (
            <Card key={campaign.id} variant="glass" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-foreground font-semibold truncate">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{campaign.id}</div>
                </div>
                <Badge
                  variant={
                    normalizedStatus === 'active' ? 'default' :
                      normalizedStatus === 'paused' ? 'secondary' : 'outline'
                  }
                  className={`
                    ${normalizedStatus === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                    ${normalizedStatus === 'paused' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : ''}
                  `}
                >
                  {normalizedStatus}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
                  <div className="text-muted-foreground">Spend</div>
                  <div className="text-foreground font-semibold">{formatCurrency(campaign.spend)}</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
                  <div className="text-muted-foreground">Impressions</div>
                  <div className="text-foreground font-semibold">{formatCompact(campaign.impressions)}</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
                  <div className="text-muted-foreground">CTR</div>
                  <div className="text-foreground font-semibold">{formatPct(campaign.ctr)}</div>
                </div>
                <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
                  <div className="text-muted-foreground">ROAS</div>
                  <div className="text-foreground font-semibold">{campaign.roas}x</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {normalizedStatus === 'active' ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleAction(campaign, 'pause')}
                    disabled={isBusy(campaign.id, 'pause')}
                    title="Pause"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                ) : normalizedStatus === 'paused' ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleAction(campaign, 'resume')}
                    disabled={isBusy(campaign.id, 'resume')}
                    title="Resume"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleAction(campaign, 'duplicate')}
                  disabled={isBusy(campaign.id, 'duplicate')}
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-destructive"
                  onClick={() => handleAction(campaign, 'delete')}
                  disabled={isBusy(campaign.id, 'delete')}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => openMetaCampaign(campaign.id)}
                  title="View in Meta"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
