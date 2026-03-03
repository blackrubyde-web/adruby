import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Share2,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '../contexts/AuthContext';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { supabase } from '../lib/supabaseClient';
import { DashboardShell } from './layout/DashboardShell';
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
    <DashboardShell hideHero>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil</h1>
          <p className="text-sm text-muted-foreground">Deine Kontoinformationen und Kampagnen-Übersicht</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            Teilen
          </Button>
          <Button size="sm" onClick={handleEditProfile} className="gap-1.5 text-xs">
            <Pencil className="w-3.5 h-3.5" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {overviewError && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          {overviewError}
        </div>
      )}

      {/* ── User Info ──────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-bold overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profilbild" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground mb-1 truncate">
              {profile?.full_name || profile?.email || '—'}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3" />
                {profile?.email || user?.email || '—'}
              </span>
              {profileSettings.company && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" />
                  {profileSettings.company}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {profileSettings.timezone || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Kampagnen', value: isStatsLoading ? '—' : totalCampaigns.toString() },
          { label: 'Ads erstellt', value: isStatsLoading ? '—' : adsCreated.toString() },
          { label: 'Ø ROAS', value: isStatsLoading ? '—' : `${avgRoas.toFixed(2)}x` },
          { label: 'Gesamtausgaben', value: isStatsLoading ? '—' : `€${(totalSpend / 1000).toFixed(1)}K` },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-foreground tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Performance ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Impressionen</div>
          <div className="text-xl font-bold text-foreground tabular-nums">
            {analyticsLoading ? '—' : (analyticsData?.summary?.impressions ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Klicks</div>
          <div className="text-xl font-bold text-foreground tabular-nums">
            {analyticsLoading ? '—' : (analyticsData?.summary?.clicks ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Top Campaigns ──────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Top Kampagnen</h3>
        </div>
        <div className="divide-y divide-border/50">
          {campaignsLoading ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">Laden…</div>
          ) : topCampaigns.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">Noch keine Kampagnen vorhanden.</div>
          ) : (
            topCampaigns.map((campaign) => (
              <div key={campaign.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ROAS {campaign.roas.toFixed(2)}x · €{campaign.spend.toFixed(0)} Ausgaben · €{campaign.revenue.toFixed(0)} Umsatz
                  </div>
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${campaign.status === 'ACTIVE' ? 'text-green-600 bg-green-500/10' : 'text-muted-foreground bg-muted'
                  }`}>
                  {campaign.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
