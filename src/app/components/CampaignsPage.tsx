import { Search, Filter, MoreVertical, Play, Pause, Copy, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
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

  useEffect(() => {
    setCampaignRows(campaigns);
  }, [campaigns]);

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(value),
    []
  );

  const formatCompact = useCallback(
    (value: number) =>
      new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(
        value
      ),
    []
  );

  const formatPct = useCallback((value: number) => {
    if (!Number.isFinite(value)) return '0%';
    const pct = value > 1 ? value : value * 100;
    return `${pct.toFixed(2)}%`;
  }, []);

  const normalizeStatus = useCallback((raw: string) => {
    const value = String(raw || '').toLowerCase();
    if (value.includes('pause')) return 'paused';
    if (value.includes('active')) return 'active';
    if (value.includes('archive') || value.includes('delete') || value.includes('complete')) {
      return 'completed';
    }
    return 'active';
  }, []);

  const isNumericId = useCallback((value: string) => /^\d+$/.test(value), []);

  const isBusy = useCallback(
    (campaignId: string, action: MetaApplyAction) => !!actionState[`${campaignId}:${action}`],
    [actionState]
  );

  const navigateToSettings = useCallback(() => {
    const nextUrl = '/settings?tab=integrations';
    window.history.pushState({}, document.title, nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const openMetaCampaign = useCallback(
    (campaignId?: string) => {
      if (!metaConnected) {
        toast.error('Meta ist nicht verbunden. Bitte in den Settings verbinden.');
        navigateToSettings();
        return;
      }

      const base = 'https://adsmanager.facebook.com/adsmanager/manage/campaigns';
      const params = new URLSearchParams();
      const accountId = connection?.ad_account_id?.replace(/^act_/, '');
      if (accountId) params.set('act', accountId);
      if (campaignId && isNumericId(campaignId)) {
        params.set('selected_campaign_ids', campaignId);
      }
      const url = params.toString() ? `${base}?${params.toString()}` : base;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [connection?.ad_account_id, isNumericId, metaConnected, navigateToSettings]
  );

  const openCampaignBuilder = useCallback(() => {
    const nextUrl = '/campaign-builder';
    window.history.pushState({}, document.title, nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const updateCampaignStatus = useCallback((campaignId: string, status: string) => {
    setCampaignRows((prev) =>
      prev.map((campaign) => (campaign.id === campaignId ? { ...campaign, status } : campaign))
    );
  }, []);

  const handleAction = useCallback(
    async (campaign: { id: string; name: string }, action: MetaApplyAction) => {
      if (!metaConnected) {
        toast.error('Meta ist nicht verbunden. Bitte in den Settings verbinden.');
        navigateToSettings();
        return;
      }

      if (!isNumericId(campaign.id)) {
        toast.error('Diese Kampagne ist nicht mit Meta verknüpft. Bitte Sync ausführen.');
        return;
      }

      const actionKey = `${campaign.id}:${action}`;
      if (isBusy(campaign.id, action)) return;

      if (action === 'delete' && !window.confirm(`Kampagne "${campaign.name}" wirklich löschen?`)) {
        return;
      }

      setActionState((prev) => ({ ...prev, [actionKey]: true }));
      try {
        const result = await applyMetaAction({ campaignId: campaign.id, action });
        if (action === 'pause') {
          updateCampaignStatus(campaign.id, 'PAUSED');
        } else if (action === 'resume') {
          updateCampaignStatus(campaign.id, 'ACTIVE');
        } else if (action === 'delete') {
          updateCampaignStatus(campaign.id, 'DELETED');
        }

        if (action === 'duplicate') {
          toast.success(
            result?.resultId
              ? `Kampagne dupliziert (ID ${result.resultId}). Bitte syncen.`
              : 'Kampagne dupliziert. Bitte syncen.'
          );
        } else if (action === 'increase' || action === 'decrease') {
          const detail =
            result?.previous && result?.next ? ` (${result.previous} → ${result.next})` : '';
          toast.success(`Budget angepasst${detail}`);
        } else if (action === 'delete') {
          toast.success('Kampagne gelöscht');
        } else if (action === 'resume') {
          toast.success('Kampagne aktiviert');
        } else if (action === 'pause') {
          toast.success('Kampagne pausiert');
        }
        await refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Aktion fehlgeschlagen';
        toast.error(message);
      } finally {
        setActionState((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [isBusy, isNumericId, metaConnected, navigateToSettings, refresh, updateCampaignStatus]
  );

  const filteredCampaigns = useMemo(
    () =>
      campaignRows.filter((campaign) => {
        const matchesSearch = campaign.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || normalizeStatus(campaign.status) === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [campaignRows, normalizeStatus, searchQuery, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: campaignRows.length,
      active: campaignRows.filter((c) => normalizeStatus(c.status) === 'active').length,
      paused: campaignRows.filter((c) => normalizeStatus(c.status) === 'paused').length,
      totalSpend: campaignRows.reduce((sum, c) => sum + (c.spend || 0), 0),
    }),
    [campaignRows, normalizeStatus]
  );

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
          <div className="flex items-center gap-2">
            <button
              onClick={openCampaignBuilder}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors font-medium"
            >
              Neue Kampagne
            </button>
            <button
              onClick={() => openMetaCampaign()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              Open Meta
            </button>
          </div>
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
          <div className="text-2xl text-foreground font-bold mb-1">{formatCurrency(stats.totalSpend)}</div>
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

      {error && (
        <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-500">
          {error}
        </Card>
      )}

      {loading && (
        <Card className="p-4 border border-border bg-card text-sm text-muted-foreground">
          Lade Kampagnen…
        </Card>
      )}

      {/* Campaigns Table */}
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
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                          normalizedStatus === 'active'
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
