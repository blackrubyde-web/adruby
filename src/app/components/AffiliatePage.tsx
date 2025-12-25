import { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Link2,
  TrendingUp,
  Users,
  DollarSign,
  Repeat,
  Check,
  Edit3,
  Share2,
  Sparkles,
  Trophy,
  ExternalLink,
  Calendar,
  Award,
  MessageSquare,
  Loader2,
  Lock,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card, Chip } from './layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAffiliate, type AffiliateReferral } from '../contexts/AffiliateContext';
import { useAuthState } from '../contexts/AuthContext';

interface EarningsData {
  date: string;
  earnings: number;
}

export function AffiliatePage() {
  const { profile } = useAuthState();
  const {
    isAffiliate,
    isLoading,
    stats,
    referrals,
    payouts,
    affiliateCode,
    affiliateLink,
    requestPayout,
    refreshData
  } = useAffiliate();

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(affiliateCode || '');
  const [referralFilter, setReferralFilter] = useState<'all' | 'paid' | 'trial' | 'registered'>('all');
  const [chartData, setChartData] = useState<EarningsData[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<string>('paypal');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Update username when affiliateCode loads
  useEffect(() => {
    if (affiliateCode) setUsername(affiliateCode);
  }, [affiliateCode]);

  // Generate mock chart data based on stats
  useEffect(() => {
    const mockData: EarningsData[] = Array.from({ length: 30 }, (_, i) => ({
      date: String(i + 1).padStart(2, '0'),
      earnings: Math.floor(Math.random() * 30) + 10
    }));
    setChartData(mockData);
  }, [stats]);

  // Calculate stats from context
  const affiliateStats = useMemo(() => ({
    totalEarnings: stats?.total_earnings || 0,
    thisMonth: stats?.this_month_earnings || 0,
    activeReferrals: stats?.active_referrals || 0,
    pendingEarnings: stats?.pending_earnings || 0,
    totalReferrals: stats?.total_referrals || 0,
    trialReferrals: stats?.trial_referrals || 0,
  }), [stats]);

  const promoCode = (affiliateCode || 'PARTNER') + '10';

  const chartSummary = useMemo(() => ({
    bestDay: `€${Math.max(...chartData.map(d => d.earnings), 0)}`,
    avgDay: `€${Math.round(chartData.reduce((a, b) => a + b.earnings, 0) / (chartData.length || 1))}`,
    lastPayout: 'Coming soon',
  }), [chartData]);

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    if (referralFilter === 'all') return referrals;
    return referrals.filter(r => r.status === referralFilter);
  }, [referrals, referralFilter]);

  // Copy handler
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Username edit handler
  const handleUsernameEdit = () => {
    if (isEditingUsername) {
      toast.success('Username updated!');
    }
    setIsEditingUsername(!isEditingUsername);
  };

  // Share handler
  const handleShare = (platform: string) => {
    const shareText = `Join AdRuby with my link: ${affiliateLink}`;
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(affiliateLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  // Payout request handler
  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 20) {
      toast.error('Minimum payout is €20');
      return;
    }
    if (amount > affiliateStats.pendingEarnings) {
      toast.error('Insufficient balance');
      return;
    }
    setIsRequestingPayout(true);
    const result = await requestPayout(amount, payoutMethod);
    setIsRequestingPayout(false);
    if (result.success) {
      toast.success(`Auszahlung von €${amount} angefordert!`);
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutMethod('paypal');
    } else {
      toast.error(result.error || 'Failed to request payout');
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-600 dark:text-green-400',
      active: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      trial: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      registered: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] || styles.registered}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Not an affiliate - show locked state
  if (!isAffiliate) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-6 bg-muted rounded-full mb-6">
            <Lock className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Partner Program</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            Unser Partner-Programm ist nur für ausgewählte Influencer, Coaches und Community-Leader zugänglich.
          </p>
          <a
            href="mailto:partner@adruby.ai"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Jetzt bewerben
          </a>
        </div>
      </PageShell>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero Header */}
      <HeroHeader
        title="Partner Dashboard"
        subtitle="Verdiene €10/Monat pro zahlenden User"
        chips={
          <>
            <Chip variant="neutral" icon={<Trophy className="w-3 h-3" />}>
              Lifetime: €{affiliateStats.totalEarnings}
            </Chip>
            <Chip variant="neutral" icon={<Users className="w-3 h-3" />}>
              {affiliateStats.totalReferrals} Referrals
            </Chip>
            <Chip variant="neutral" icon={<Wallet className="w-3 h-3" />}>
              €{affiliateStats.pendingEarnings} pending
            </Chip>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-semibold">€{affiliateStats.totalEarnings}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Month</p>
              <p className="text-2xl font-semibold">€{affiliateStats.thisMonth}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Referrals</p>
              <p className="text-2xl font-semibold">{affiliateStats.activeReferrals}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payout</p>
              <p className="text-2xl font-semibold">€{affiliateStats.pendingEarnings}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Affiliate Link Card */}
      <Card className="relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-purple-400 to-blue-400" />

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dein Affiliate Link
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                €10/Monat pro User für 12 Monate
              </p>
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Auszahlung anfordern
            </button>
          </div>

          {/* Link & Code */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Invite Link
              </label>
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono truncate flex-1">{affiliateLink}</span>
                <button
                  onClick={() => handleCopy(affiliateLink, 'Link')}
                  className="p-1.5 rounded hover:bg-accent transition-colors flex-shrink-0"
                >
                  {copiedItem === 'Link' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Promo Code (+250 Credits)
              </label>
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                <Award className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono font-semibold flex-1">{promoCode}</span>
                <button
                  onClick={() => handleCopy(promoCode, 'Code')}
                  className="p-1.5 rounded hover:bg-accent transition-colors flex-shrink-0"
                >
                  {copiedItem === 'Code' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.open(affiliateLink, '_blank')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => handleCopy(`Join AdRuby: ${affiliateLink}`, 'Message')}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {copiedItem === 'Message' ? 'Copied!' : 'Copy Message'}
            </button>
          </div>
        </div>
      </Card>

      {/* Share Toolkit */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              Share Toolkit
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Teile auf Social Media</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handleShare('twitter')} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent">
              Share on X
            </button>
            <button onClick={() => handleShare('linkedin')} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent">
              LinkedIn
            </button>
            <button onClick={() => handleShare('whatsapp')} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent">
              WhatsApp
            </button>
          </div>
        </div>
      </Card>

      {/* Earnings Chart */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Earnings Over Time</h3>
              <p className="text-sm text-muted-foreground mt-1">Track your affiliate revenue</p>
            </div>

            <div className="flex items-center gap-1 p-1 border border-border rounded-lg bg-muted/30">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${timeRange === range
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 border border-border rounded-lg bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Best Day</p>
              <p className="font-semibold">{chartSummary.bestDay}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg/Day</p>
              <p className="font-semibold">{chartSummary.avgDay}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Payout</p>
              <p className="font-semibold text-sm">{chartSummary.lastPayout}</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C80000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C80000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`€${value}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="earnings" stroke="#C80000" strokeWidth={2} fill="url(#earningsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Referrals List */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Your Referrals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredReferrals.length} {referralFilter === 'all' ? 'total' : referralFilter} referrals
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'paid', 'trial', 'registered'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReferralFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${referralFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-accent'
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No referrals yet. Share your link to get started!
              </div>
            ) : (
              filteredReferrals.map((referral) => (
                <div key={referral.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {referral.user_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{referral.user_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground truncate">{referral.user_email || 'Hidden'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(referral.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {referral.status === 'paid' ? `€10/mo (${referral.months_paid}/12)` : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: €{referral.total_commission_earned}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { icon: Link2, text: 'Share your unique link or promo code' },
            { icon: Users, text: 'Friends sign up with +250 bonus credits' },
            { icon: DollarSign, text: 'Earn €10/month when they pay' },
            { icon: Repeat, text: 'Commission for 12 months per user' },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Payout History Card */}
      {payouts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Auszahlungs-Historie</h3>
          <div className="space-y-2">
            {payouts.slice(0, 5).map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${payout.status === 'completed' ? 'bg-green-500/10' :
                    payout.status === 'pending' ? 'bg-yellow-500/10' :
                      payout.status === 'processing' ? 'bg-blue-500/10' :
                        'bg-red-500/10'
                    }`}>
                    <Wallet className={`w-4 h-4 ${payout.status === 'completed' ? 'text-green-600' :
                      payout.status === 'pending' ? 'text-yellow-600' :
                        payout.status === 'processing' ? 'text-blue-600' :
                          'text-red-600'
                      }`} />
                  </div>
                  <div>
                    <p className="font-medium">€{payout.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.requested_at).toLocaleDateString('de-DE')} • {payout.payout_method}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${payout.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                  payout.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    payout.status === 'processing' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-red-500/10 text-red-600'
                  }`}>
                  {payout.status === 'completed' ? 'Ausgezahlt' :
                    payout.status === 'pending' ? 'Ausstehend' :
                      payout.status === 'processing' ? 'In Bearbeitung' :
                        'Fehlgeschlagen'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Auszahlung anfordern</h2>
                <p className="text-sm text-muted-foreground">Minimum: €20</p>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>

            {/* Available Balance */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl mb-6 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Verfügbares Guthaben</p>
              <p className="text-3xl font-bold text-green-600">€{affiliateStats.pendingEarnings}</p>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Betrag</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <input
                  type="number"
                  min="20"
                  max={affiliateStats.pendingEarnings}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="20.00"
                  className="w-full pl-8 pr-4 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min. €20 • Max. €{affiliateStats.pendingEarnings}
              </p>
            </div>

            {/* Payout Method Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Auszahlungsmethode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'paypal', label: 'PayPal', icon: '💳' },
                  { id: 'bank', label: 'Bank', icon: '🏦' },
                  { id: 'crypto', label: 'Crypto', icon: '₿' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPayoutMethod(method.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${payoutMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <span className="text-xl block mb-1">{method.icon}</span>
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={isRequestingPayout || parseFloat(payoutAmount) < 20 || parseFloat(payoutAmount) > affiliateStats.pendingEarnings}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                {isRequestingPayout ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Wird angefordert...</>
                ) : (
                  <><Wallet className="w-4 h-4" /> Auszahlen</>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
