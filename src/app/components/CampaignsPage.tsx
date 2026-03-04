import { Search, ExternalLink, Play, Pause, Copy, Trash2, TrendingUp, TrendingDown, Plus, ArrowUpDown, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardShell } from './layout/DashboardShell';
import { Button } from './ui/button';
import { useMetaCampaigns, type MetaCampaign } from '../hooks/useMetaCampaigns';
import { useMetaConnection } from '../hooks/useMetaConnection';
import type { MetaApplyAction } from '../lib/api/meta';
import { applyMetaAction } from '../lib/api/meta';
import { formatCurrency, formatCompact } from '../utils/formatters';
import '../../styles/analysis-campaign.css';

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';
type SortKey = 'name' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'roas' | 'conversions';

const STATUS_DE: Record<string, string> = {
  active: 'Aktiv',
  paused: 'Pausiert',
  completed: 'Abgeschlossen',
  deleted: 'Gelöscht',
};

// Helper functions
const formatPct = (num: number) =>
  new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 2 }).format(num);

const normalizeStatus = (status: string) => status.toLowerCase();

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { campaigns, loading, error, refresh } = useMetaCampaigns();
  const { connection } = useMetaConnection();
  const [actionState, setActionState] = useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortAsc, setSortAsc] = useState(false);
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
    const filtered = campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || normalizeStatus(c.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return filtered.sort((a, b) => {
      const aVal = sortKey === 'name' ? a.name.toLowerCase() : Number(a[sortKey] || 0);
      const bVal = sortKey === 'name' ? b.name.toLowerCase() : Number(b[sortKey] || 0);
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [campaigns, searchQuery, statusFilter, sortKey, sortAsc]);

  const handleAction = useCallback(async (campaign: MetaCampaign, action: MetaApplyAction) => {
    const id = campaign.id;
    // Confirmation for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(`Kampagne "${campaign.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`);
      if (!confirmed) return;
    }
    setActionState(prev => ({ ...prev, [`${id}-${action}`]: true }));
    try {
      const res = await applyMetaAction({ campaignId: id, action });
      if (!res?.ok) {
        throw new Error('Meta action failed');
      }
      toast.success(`Kampagne ${action === 'pause' ? 'pausiert' : action === 'resume' ? 'fortgesetzt' : action === 'duplicate' ? 'dupliziert' : 'gelöscht'}`);
      refresh();
    } catch (err) {
      toast.error(`Kampagne konnte nicht ${action === 'delete' ? 'gelöscht' : 'aktualisiert'} werden`);
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

  const handleSort = (key: SortKey) => {
    setSortAsc(sortKey === key ? !sortAsc : key === 'name');
    setSortKey(key);
  };

  return (
    <DashboardShell hideHero>
      {/* ── Editorial Page Header ──────────────────────── */}
      <div className="page-header-editorial">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Kampagnen</h1>
            <p className="page-subtitle">Verwalte und optimiere deine Meta Ads Kampagnen</p>
          </div>
          <button onClick={handleCreateCampaign} className="ai-analysis-btn">
            <Plus className="w-4 h-4" />
            Neue Kampagne
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kampagnen suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="filter-chip-bar">
          {([
            { value: 'all', label: 'Alle' },
            { value: 'active', label: 'Aktiv' },
            { value: 'paused', label: 'Pausiert' },
            { value: 'completed', label: 'Abgeschlossen' },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`filter-chip ${statusFilter === f.value ? 'filter-chip-active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="sync-progress-bar" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="sync-progress-bar">
          <p className="text-sm text-muted-foreground">Lade Kampagnen…</p>
          <div className="sync-progress-track">
            <div className="sync-progress-fill" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-state-card-icon">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="empty-state-card-title">Noch keine Kampagnen</p>
          <p className="empty-state-card-text">Erstelle eine Kampagne und pushe sie direkt zu Meta.</p>
          <button onClick={handleCreateCampaign} className="ai-analysis-btn">
            Neue Kampagne erstellen
          </button>
        </div>
      )}

      {/* Campaigns Table (Desktop) */}
      <div className="hidden md:block card-obsidian overflow-hidden">
        <div className="overflow-x-auto">
          <table className="analysis-table">
            <thead>
              <tr>
                <th className="text-left" onClick={() => handleSort('name')}>
                  Kampagne {sortKey === 'name' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-left">Status</th>
                <th className="text-right" onClick={() => handleSort('spend')}>
                  Ausgaben {sortKey === 'spend' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right" onClick={() => handleSort('impressions')}>
                  Impressionen {sortKey === 'impressions' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right" onClick={() => handleSort('clicks')}>
                  Klicks {sortKey === 'clicks' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right" onClick={() => handleSort('ctr')}>
                  CTR {sortKey === 'ctr' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right" onClick={() => handleSort('roas')}>
                  ROAS {sortKey === 'roas' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right" onClick={() => handleSort('conversions')}>
                  Conversions {sortKey === 'conversions' && <ArrowUpDown className="w-3 h-3 inline ml-1" />}
                </th>
                <th className="text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign, i) => {
                const normalizedStatus = normalizeStatus(campaign.status);
                return (
                  <tr
                    key={campaign.id}
                    className="stagger-reveal"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td>
                      <div>
                        <div className="text-foreground font-medium mb-0.5">{campaign.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono opacity-60">
                          {campaign.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`rec-badge ${normalizedStatus === 'active' ? 'rec-badge-duplicate' :
                        normalizedStatus === 'paused' ? 'rec-badge-decrease' : ''
                        }`}>
                        {normalizedStatus === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {STATUS_DE[normalizedStatus] || normalizedStatus}
                      </span>
                    </td>
                    <td className="metric-cell metric-cell-accent">
                      {formatCurrency(campaign.spend)}
                    </td>
                    <td className="metric-cell metric-cell-muted">
                      {formatCompact(campaign.impressions)}
                    </td>
                    <td className="metric-cell metric-cell-muted">
                      {formatCompact(campaign.clicks)}
                    </td>
                    <td className="metric-cell">
                      {formatPct(campaign.ctr)}
                    </td>
                    <td className="metric-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-bold ${campaign.roas >= 2.5 ? 'metric-cell-positive' : ''}`}>{campaign.roas}x</span>
                        {campaign.roas >= 1 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="metric-cell">
                      {formatCompact(campaign.conversions)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {normalizedStatus === 'active' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-orange-500"
                            onClick={() => handleAction(campaign, 'pause')}
                            disabled={isBusy(campaign.id, 'pause')}
                            title="Pausieren"
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
                            title="Fortsetzen"
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
                          title="Duplizieren"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleAction(campaign, 'delete')}
                          disabled={isBusy(campaign.id, 'delete')}
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openMetaCampaign(campaign.id)}
                          title="In Meta öffnen"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaigns Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {filteredCampaigns.map((campaign, i) => {
          const normalizedStatus = normalizeStatus(campaign.status);
          return (
            <div
              key={campaign.id}
              className="campaign-row stagger-reveal"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-foreground font-semibold truncate">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{campaign.id}</div>
                </div>
                <span className={`rec-badge ${normalizedStatus === 'active' ? 'rec-badge-duplicate' :
                  normalizedStatus === 'paused' ? 'rec-badge-decrease' : ''
                  }`}>
                  {STATUS_DE[normalizedStatus] || normalizedStatus}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="insight-card" style={{ padding: '0.75rem' }}>
                  <div className="insight-card-label" style={{ marginBottom: '0.25rem' }}>Ausgaben</div>
                  <div className="text-foreground font-semibold">{formatCurrency(campaign.spend)}</div>
                </div>
                <div className="insight-card" style={{ padding: '0.75rem' }}>
                  <div className="insight-card-label" style={{ marginBottom: '0.25rem' }}>Impressionen</div>
                  <div className="text-foreground font-semibold">{formatCompact(campaign.impressions)}</div>
                </div>
                <div className="insight-card" style={{ padding: '0.75rem' }}>
                  <div className="insight-card-label" style={{ marginBottom: '0.25rem' }}>CTR</div>
                  <div className="text-foreground font-semibold">{formatPct(campaign.ctr)}</div>
                </div>
                <div className="insight-card" style={{ padding: '0.75rem' }}>
                  <div className="insight-card-label" style={{ marginBottom: '0.25rem' }}>ROAS</div>
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
                    title="Fortsetzen"
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
                  title="Duplizieren"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-destructive"
                  onClick={() => handleAction(campaign, 'delete')}
                  disabled={isBusy(campaign.id, 'delete')}
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => openMetaCampaign(campaign.id)}
                  title="In Meta öffnen"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
