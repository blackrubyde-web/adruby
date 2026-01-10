import { useState, useEffect, useMemo, useRef } from 'react';
import { PartnerApplicationForm } from './affiliate/PartnerApplicationForm';
import {
  Copy,
  Link2,
  TrendingUp,
  Users,
  DollarSign,
  Check,
  Sparkles,
  Loader2,
  Lock,
  Wallet,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, Card, HeroHeader } from './layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAffiliate } from '../contexts/AffiliateContext';
import { supabase } from '../lib/supabaseClient';
import { AchievementsPanel } from './affiliate/AchievementsPanel';
import { AffiliateSuccessStories } from './affiliate/AffiliateSuccessStories';
import { User } from '@supabase/supabase-js';

// --- Imports for Marketing View ---
import { GlobalNav } from './landing/GlobalNav';
import { MobileStickyCTA } from './landing/MobileStickyCTA';

interface EarningsData {
  date: string;
  earnings: number;
}

interface AffiliatePageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  onGetStarted?: () => void;
}

export function AffiliatePage({ onNavigate = () => { }, onSignIn = () => { }, onGetStarted = () => { } }: AffiliatePageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Marketing View States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'achievements' | 'analytics'>('overview');

  // Dashboard States
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [chartData, setChartData] = useState<EarningsData[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Check Auth Status on Mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AffiliateMarketingView
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        heroRef={heroRef}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    );
  }

  return (
    <AffiliateDashboard
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      chartData={chartData}
      setChartData={setChartData}
      copiedItem={copiedItem}
      setCopiedItem={setCopiedItem}
    />
  );
}

// --- Sub-Components ---

interface AffiliateMarketingViewProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
  heroRef: React.RefObject<HTMLElement>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

function AffiliateMarketingView({ onNavigate, onSignIn, onGetStarted, heroRef, isMobileMenuOpen, setIsMobileMenuOpen }: AffiliateMarketingViewProps) {
  // Spotlight Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="landing-theme-root min-h-screen bg-black font-sans text-foreground overflow-x-hidden selection:bg-rose-500/30">
      <GlobalNav
        currentPage="affiliate"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute top-[10%] right-[10%] w-[60vw] h-[40vw] bg-rose-600/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <section ref={heroRef} className="relative z-10 pt-32 pb-20 sm:pt-48 sm:pb-32">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white/80">AdRuby Partner Program</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-8 text-white">
              Verdiene an <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">jedem Ad-Spend.</span>
            </h1>

            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Empfiehl das mächtigste Ad-Tool der Welt und erhalte 30% Lifetime-Provision.
              Deine Community spart Zeit, du baust passives Einkommen auf.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Partner werden
              </button>
              <button onClick={onSignIn} className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                Login für Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 relative z-10">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onMouseMove={handleMouseMove}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <DollarSign className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">30% Lifetime</h3>
              <p className="text-white/60">Solange dein Kunde bei uns bleibt, wirst du bezahlt. Monat für Monat.</p>
            </div>
            <div
              onMouseMove={handleMouseMove}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Sparkles className="w-24 h-24 rotate-12" />
              </div>
              <Rocket className="w-10 h-10 text-rose-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">High Conversion</h3>
              <p className="text-white/60">Unser "Unfair Advantage" Pitch konvertiert Traffic extrem gut. Weniger Arbeit, mehr Sales.</p>
            </div>
            <div
              onMouseMove={handleMouseMove}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Wallet className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Schnelle Payouts</h3>
              <p className="text-white/60">Auszahlung monatlich via PayPal oder Banküberweisung. Ab 50€ Mindestbetrag.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <AffiliateSuccessStories />

      {/* Partner Application Form Wrapper */}
      <section className="py-24 relative z-10">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              Starte deine <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Partner Journey</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Fülle das Formular aus. Wir melden uns innerhalb von 24h bei dir.
            </p>
          </div>
          <PartnerApplicationForm />
        </div>
      </section>

    </div >
  );
}

interface AffiliateDashboardProps {
  user: User;
  activeTab: 'overview' | 'services' | 'achievements' | 'analytics';
  setActiveTab: (tab: 'overview' | 'services' | 'achievements' | 'analytics') => void;
  timeRange: '7d' | '30d' | 'all';
  setTimeRange: (range: '7d' | '30d' | 'all') => void;
  chartData: EarningsData[];
  setChartData: (data: EarningsData[]) => void;
  copiedItem: string | null;
  setCopiedItem: (item: string | null) => void;
}

function AffiliateDashboard({
  user,
  activeTab,
  setActiveTab,
  timeRange,
  setTimeRange,
  chartData,
  setChartData,
  copiedItem,
  setCopiedItem
}: AffiliateDashboardProps) {
  // Use hooks logic here, safe because user exists
  const {
    isAffiliate,
    isLoading,
    stats,
    affiliateCode,
    affiliateLink,
    applicationStatus,
  } = useAffiliate();

  // Load Earning Effect (restored from original)
  useEffect(() => {
    const loadEarnings = async () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const { fetchAffiliateEarnings } = await import('../lib/affiliateHelpers');
      const earnings = await fetchAffiliateEarnings(user.id, days);
      setChartData(earnings);
    };
    if (user) loadEarnings();
  }, [timeRange, user, setChartData]);

  const affiliateStats = useMemo(() => ({
    totalEarnings: stats?.total_earnings || 0,
    thisMonth: stats?.this_month_earnings || 0,
    activeReferrals: stats?.active_referrals || 0,
    pendingEarnings: stats?.pending_earnings || 0,
    totalReferrals: stats?.total_referrals || 0,
    trialReferrals: stats?.trial_referrals || 0,
  }), [stats]);

  const promoCode = (affiliateCode || 'PARTNER') + '10';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const overviewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold">€{affiliateStats.totalEarnings}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">This Month</span>
          </div>
          <div className="text-2xl font-bold">€{affiliateStats.thisMonth}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Active Referrals</span>
          </div>
          <div className="text-2xl font-bold">{affiliateStats.activeReferrals}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Wallet className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Pending Payout</span>
          </div>
          <div className="text-2xl font-bold">€{affiliateStats.pendingEarnings}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Earnings Overview</h3>
            <p className="text-sm text-muted-foreground">Track your affiliate performance over time</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAffiliate && !applicationStatus) {
    return (
      <PageShell>
        <HeroHeader title="Join Partner Program" subtitle="Apply to become an AdRuby affiliate" />
        <PartnerApplicationForm />
      </PageShell>
    )
  }

  if (applicationStatus && applicationStatus !== 'approved') {
    return (
      <PageShell>
        <HeroHeader title="Application Status" subtitle="We are reviewing your application" />
        <div className="max-w-xl mx-auto mt-20 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
          <p className="text-muted-foreground">
            Your partner application is currently being reviewed by our team.
            We typically process applications within 24-48 hours.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <HeroHeader title="Affiliate Dashboard" subtitle="Manage your referrals and earnings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Your Promo Code</div>
            <div className="font-mono font-bold text-lg">{promoCode}</div>
          </div>
          <button onClick={() => copyToClipboard(promoCode, 'code')} className="p-2 hover:bg-muted rounded-lg">
            {copiedItem === 'code' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Referral Link</div>
            <div className="font-mono font-bold text-lg truncate max-w-[200px]">{affiliateLink}</div>
          </div>
          <button onClick={() => copyToClipboard(affiliateLink || '', 'link')} className="p-2 hover:bg-muted rounded-lg">
            {copiedItem === 'link' ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
          </button>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border/50">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >Overview</button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'achievements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >Achievements</button>
      </div>

      {activeTab === 'overview' && overviewContent}
      {activeTab === 'achievements' && <AchievementsPanel />}
    </PageShell>
  );
}
