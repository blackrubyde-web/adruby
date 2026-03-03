import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  TrendingUp,
  Target,
  Zap,
  DollarSign,
  Eye,
  MousePointerClick,
  Share2,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '../contexts/AuthContext';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { supabase } from '../lib/supabaseClient';
import { DashboardShell } from './layout/DashboardShell';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { PageType } from '../App';

type ProfilePageProps = {
  onNavigate?: (page: PageType, query?: Record<string, string | undefined | null>) => void;
};

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile } = useAuthState();
  const { data: analyticsData, loading: analyticsLoading } = useAnalyticsData('30d', false, 'meta');
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useMetaCampaigns();
  const [adsCreated, setAdsCreated] = useState<number>(0);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsError, setAdsError] = useState<string | null>(null);

  const profileSettings = useMemo(() => {
    const raw = profile?.settings;
    if (raw && typeof raw === 'object') return raw as { company?: string; timezone?: string };
    return {};
  }, [profile?.settings]);

  useEffect(() => {
    let cancelled = false;
    const loadAdsCreated = async () => {
      if (!user?.id) {
        setAdsCreated(0);
        setAdsLoading(false);
        return;
      }
      setAdsLoading(true);
      setAdsError(null);
      try {
        const { count, error } = await supabase
          .from('generated_creatives')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (error) throw error;
        if (!cancelled) setAdsCreated(count || 0);
      } catch (err: unknown) {
        if (!cancelled) {
          setAdsError(err instanceof Error ? err.message : 'Fehler beim Laden');
          setAdsCreated(0);
        }
      } finally {
        if (!cancelled) setAdsLoading(false);
      }
    };
    loadAdsCreated();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const initials = useMemo(() => {
    const base = profile?.full_name || profile?.email || user?.email || 'U';
    const parts = base.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [profile?.email, profile?.full_name, user?.email]);

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return '—';
    const date = new Date(user.created_at);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }, [user?.created_at]);

  const totalSpend = analyticsData?.summary?.spend ?? 0;
  const avgRoas = analyticsData?.summary?.roas ?? 0;
  const totalCampaigns = campaigns.length;
  const isStatsLoading = analyticsLoading || campaignsLoading || adsLoading;
  const topCampaigns = campaigns.slice(0, 3);
  const overviewError = campaignsError || adsError;

  const formatDelta = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    const pct = Math.round(value * 1000) / 10;
    const dir = pct >= 0 ? '↑' : '↓';
    return `${dir} ${Math.abs(pct)}% vs. Vorperiode`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profil-Link kopiert');
    } catch {
      toast.error('Link konnte nicht kopiert werden.');
    }
  };

  const handleEditProfile = () => {
    if (onNavigate) {
      onNavigate('settings', { tab: 'account' });
      return;
    }
    const url = `/settings?tab=account`;
    window.history.pushState({}, document.title, url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <DashboardShell
      title="Profil"
      subtitle="Deine Kontoinformationen und Kampagnen-Übersicht"
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Teilen</span>
          </Button>
          <Button size="sm" onClick={handleEditProfile} className="gap-2">
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Profil bearbeiten</span>
          </Button>
        </div>
      }
    >
      {overviewError && (
        <Card variant="flat" className="p-4 border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
          {overviewError}
        </Card>
      )}

      {/* User Info Card */}
      <Card variant="glass">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-xl overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profilbild" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground mb-2 truncate">
                {profile?.full_name || profile?.email || '—'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{profile?.email || user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">
                    {profile?.role || '—'}{profileSettings.company ? ` bei ${profileSettings.company}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{profileSettings.timezone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Beigetreten {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid — 4 unique cards, no duplicates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Kampagnen', value: isStatsLoading ? '…' : totalCampaigns.toString(), icon: <Zap className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Ads erstellt', value: isStatsLoading ? '…' : adsCreated.toString(), icon: <DollarSign className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Ø ROAS', value: isStatsLoading ? '…' : `${avgRoas.toFixed(2)}x`, icon: <Target className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Gesamtausgaben', value: isStatsLoading ? '…' : `€${(totalSpend / 1000).toFixed(1)}K`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} variant="glass" className="hover:-translate-y-0.5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${stat.bg} rounded-xl ${stat.color}`}>{stat.icon}</div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Performance — single clean section, no tabs */}
      <Card variant="glass">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Kampagnen-Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-foreground text-sm">Impressionen</h4>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {analyticsLoading ? '—' : (analyticsData?.summary?.impressions ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-green-500 font-semibold">
                {formatDelta(analyticsData?.summary?.deltas?.impressions)}
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <MousePointerClick className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-foreground text-sm">Klicks</h4>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {analyticsLoading ? '—' : (analyticsData?.summary?.clicks ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-green-500 font-semibold">
                {formatDelta(analyticsData?.summary?.deltas?.clicks)}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-4">Top Kampagnen</h3>
          {campaignsLoading ? (
            <div className="p-5 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
              Lade Kampagnen…
            </div>
          ) : topCampaigns.length === 0 ? (
            <div className="p-5 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
              Noch keine Kampagnen vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {topCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h4 className="font-semibold text-foreground truncate">{campaign.name}</h4>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold shrink-0">
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>ROAS: <span className="font-semibold text-foreground">{campaign.roas.toFixed(2)}x</span></span>
                        <span>•</span>
                        <span>Ausgaben: <span className="font-semibold text-foreground">€{campaign.spend.toFixed(0)}</span></span>
                        <span>•</span>
                        <span>Umsatz: <span className="font-semibold text-foreground">€{campaign.revenue.toFixed(0)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
