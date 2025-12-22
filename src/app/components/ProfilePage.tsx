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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '../contexts/AuthContext';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { supabase } from '../lib/supabaseClient';
import type { PageType } from '../App';

type ProfilePageProps = {
  onNavigate?: (page: PageType, query?: Record<string, string | undefined | null>) => void;
};

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');
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
          setAdsError(err instanceof Error ? err.message : 'Failed to load ads');
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
  const totalRevenue = analyticsData?.summary?.revenue ?? 0;
  const avgRoas = analyticsData?.summary?.roas ?? 0;
  const totalCampaigns = campaigns.length;
  const isStatsLoading = analyticsLoading || campaignsLoading || adsLoading;
  const topCampaigns = campaigns.slice(0, 3);
  const formatDelta = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    const pct = Math.round(value * 1000) / 10;
    const dir = pct >= 0 ? '↑' : '↓';
    return `${dir} ${Math.abs(pct)}% vs last period`;
  };

  // User Stats
  const stats = [
    {
      label: 'Active Campaigns',
      value: isStatsLoading ? '…' : totalCampaigns.toString(),
      icon: <Zap className="w-5 h-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Total Spend',
      value: isStatsLoading ? '…' : `€${(totalSpend / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-500',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Total Revenue',
      value: isStatsLoading ? '…' : `€${(totalRevenue / 1000).toFixed(1)}K`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/20',
    },
    {
      label: 'Avg. ROAS',
      value: isStatsLoading ? '…' : `${avgRoas.toFixed(2)}x`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-orange-500',
      bg: 'bg-orange-500/20',
    },
  ];
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
    <div className="space-y-6">
      {/* Hero Card - EXACT Dashboard Pattern */}
      <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-muted-foreground">
              View and manage your profile information
            </p>
            {overviewError && (
              <p className="text-xs text-red-500 mt-2">
                {overviewError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <span className="text-sm font-medium">Share</span>
            </button>
            <button
              onClick={handleEditProfile}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 flex items-center gap-2"
            >
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">
              {isStatsLoading ? '—' : totalCampaigns}
            </div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">
              {isStatsLoading ? '—' : adsCreated}
            </div>
            <div className="text-sm text-muted-foreground">Ads Created</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">
              {isStatsLoading ? '—' : `${avgRoas.toFixed(2)}x`}
            </div>
            <div className="text-sm text-muted-foreground">Average ROAS</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">
              {isStatsLoading ? '—' : `€${(totalSpend / 1000).toFixed(1)}K`}
            </div>
            <div className="text-sm text-muted-foreground">Total Spend</div>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {profile?.full_name || profile?.email || '—'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile?.email || user?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">
                  {profile?.role || '—'}{profileSettings.company ? ` at ${profileSettings.company}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profileSettings.timezone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-6 hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>{stat.icon}</div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-border/30 bg-muted/20">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Recent Activity' },
              { id: 'achievements', label: 'Achievements' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Campaign Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="w-6 h-6 text-blue-400" />
                      <h4 className="font-semibold text-foreground">Total Impressions</h4>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {analyticsLoading ? '—' : (analyticsData?.summary?.impressions ?? 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-500 font-semibold">
                      {formatDelta(analyticsData?.summary?.deltas?.impressions)}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <MousePointerClick className="w-6 h-6 text-green-400" />
                      <h4 className="font-semibold text-foreground">Total Clicks</h4>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {analyticsLoading ? '—' : (analyticsData?.summary?.clicks ?? 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-500 font-semibold">
                      {formatDelta(analyticsData?.summary?.deltas?.clicks)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Top Performing Campaigns</h3>
                {campaignsLoading ? (
                  <div className="p-6 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
                    Loading campaigns…
                  </div>
                ) : topCampaigns.length === 0 ? (
                  <div className="p-6 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
                    No campaigns found yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                                {campaign.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>ROAS: <span className="font-semibold text-foreground">{campaign.roas.toFixed(2)}x</span></span>
                              <span>•</span>
                              <span>Spend: <span className="font-semibold text-foreground">€{campaign.spend.toFixed(0)}</span></span>
                              <span>•</span>
                              <span>Revenue: <span className="font-semibold text-foreground">€{campaign.revenue.toFixed(0)}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
              <div className="p-6 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
                Activity history will appear here once campaigns are running.
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Achievements will unlock once your account has more live performance data.
                </p>
              </div>

              <div className="p-6 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
                Keep running campaigns to unlock milestones here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
