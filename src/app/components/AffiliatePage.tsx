import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card, Chip } from './layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'trial' | 'paid';
  plan: string;
  monthlyCommission: number;
  joinedAt: string;
  avatar?: string;
}

interface EarningsData {
  date: string;
  earnings: number;
}

export function AffiliatePage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('maxmustermann');
  const [referralFilter, setReferralFilter] = useState<'all' | 'paid' | 'trial' | 'active'>('all');

  // Mock Data
  const affiliateStats = {
    totalEarnings: 1284.5,
    thisMonth: 312,
    activeReferrals: 14,
    recurringRevenue: 128,
    trend: {
      total: '+18%',
      thisMonth: '+24%',
      referrals: '+3',
      recurring: '+12%',
    },
  };

  const affiliateLink = `https://adruby.ai/invite/${username}`;
  const promoCode = username.toUpperCase() + '10';

  const chartSummary = {
    bestDay: '€42',
    avgDay: '€18',
    lastPayout: 'Jan 1, 2024',
  };

  const earningsData: EarningsData[] = [
    { date: '01', earnings: 45 },
    { date: '02', earnings: 52 },
    { date: '03', earnings: 38 },
    { date: '04', earnings: 65 },
    { date: '05', earnings: 78 },
    { date: '06', earnings: 92 },
    { date: '07', earnings: 118 },
    { date: '08', earnings: 105 },
    { date: '09', earnings: 125 },
    { date: '10', earnings: 142 },
    { date: '11', earnings: 138 },
    { date: '12', earnings: 156 },
    { date: '13', earnings: 172 },
    { date: '14', earnings: 165 },
    { date: '15', earnings: 188 },
    { date: '16', earnings: 195 },
    { date: '17', earnings: 212 },
    { date: '18', earnings: 228 },
    { date: '19', earnings: 245 },
    { date: '20', earnings: 268 },
    { date: '21', earnings: 285 },
    { date: '22', earnings: 298 },
    { date: '23', earnings: 312 },
    { date: '24', earnings: 295 },
    { date: '25', earnings: 308 },
    { date: '26', earnings: 325 },
    { date: '27', earnings: 342 },
    { date: '28', earnings: 358 },
    { date: '29', earnings: 375 },
    { date: '30', earnings: 392 },
  ];

  const referrals: Referral[] = [
    {
      id: '1',
      name: 'Sarah Schmidt',
      email: 's***@example.com',
      status: 'paid',
      plan: 'Pro Plan',
      monthlyCommission: 29.7,
      joinedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Michael Weber',
      email: 'm***@example.com',
      status: 'active',
      plan: 'Business Plan',
      monthlyCommission: 49.5,
      joinedAt: '2024-01-12',
    },
    {
      id: '3',
      name: 'Lisa Müller',
      email: 'l***@example.com',
      status: 'trial',
      plan: 'Pro Plan (Trial)',
      monthlyCommission: 0,
      joinedAt: '2024-01-28',
    },
    {
      id: '4',
      name: 'Thomas Fischer',
      email: 't***@example.com',
      status: 'paid',
      plan: 'Pro Plan',
      monthlyCommission: 29.7,
      joinedAt: '2024-01-08',
    },
    {
      id: '5',
      name: 'Julia Becker',
      email: 'j***@example.com',
      status: 'active',
      plan: 'Business Plan',
      monthlyCommission: 49.5,
      joinedAt: '2024-01-20',
    },
  ];

  const commissionTier = {
    current: 'Silver',
    currentRate: '20%',
    nextTier: 'Gold',
    nextRate: '25%',
    referralsNeeded: 6,
    progress: 70, // 14 out of 20 referrals
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleUsernameEdit = () => {
    if (isEditingUsername) {
      toast.success('Username updated successfully!');
    }
    setIsEditingUsername(!isEditingUsername);
  };

  const handleShare = (platform: string) => {
    const shareText = `Join AdRuby AI Ads with my link and get 10% off: ${affiliateLink}`;
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(affiliateLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (referralFilter === 'all') return true;
    return ref.status === referralFilter;
  });

  const getStatusBadge = (status: Referral['status']) => {
    const styles = {
      paid: 'bg-green-500/10 text-green-600 dark:text-green-400',
      active: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      trial: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    };
    const labels = {
      paid: 'Paid',
      active: 'Active',
      trial: 'Trial',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <PageShell>
      {/* Hero Header */}
      <HeroHeader
        title="Affiliate Dashboard"
        subtitle="Share your link. Earn recurring revenue."
        chips={
          <>
            <Chip variant="neutral" icon={<Trophy className="w-3 h-3" />}>
              Lifetime: €{affiliateStats.totalEarnings}
            </Chip>
            <Chip variant="neutral" icon={<Users className="w-3 h-3" />}>
              {affiliateStats.activeReferrals} Active
            </Chip>
            <Chip variant="neutral" icon={<Repeat className="w-3 h-3" />}>
              €{affiliateStats.recurringRevenue}/mo
            </Chip>
          </>
        }
      />

      {/* Stats Row - Clean & Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-semibold">€{affiliateStats.totalEarnings}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {affiliateStats.trend.total} lifetime
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        {/* This Month */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Month</p>
              <p className="text-2xl font-semibold">€{affiliateStats.thisMonth}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {affiliateStats.trend.thisMonth} vs last month
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Active Referrals */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Referrals</p>
              <p className="text-2xl font-semibold">{affiliateStats.activeReferrals}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {affiliateStats.trend.referrals} new
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Recurring Revenue */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recurring / Month</p>
              <p className="text-2xl font-semibold">€{affiliateStats.recurringRevenue}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {affiliateStats.trend.recurring} growth
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Repeat className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Your Link & Promo - PRIMARY FEATURE CARD */}
      <Card className="relative overflow-hidden p-6">
        {/* Subtle accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-purple-400 to-blue-400" />
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Affiliate Link
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Share your unique link and earn 20% recurring commission
              </p>
            </div>
          </div>

          {/* Username Editor */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Affiliate Handle
            </label>
            <div className="flex items-center gap-2">
              {isEditingUsername ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="flex-1 px-3 py-2 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="yourusername"
                />
              ) : (
                <div className="flex-1 px-3 py-2 border border-border rounded-lg bg-muted/50">
                  <span className="font-mono">@{username}</span>
                </div>
              )}
              <button
                onClick={handleUsernameEdit}
                className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                {isEditingUsername ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Link & Code Display */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Affiliate Link */}
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
                  title="Copy link"
                >
                  {copiedItem === 'Link' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Promo Code (10% off)
              </label>
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                <Award className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono font-semibold flex-1">{promoCode}</span>
                <button
                  onClick={() => handleCopy(promoCode, 'Code')}
                  className="p-1.5 rounded hover:bg-accent transition-colors flex-shrink-0"
                  title="Copy code"
                >
                  {copiedItem === 'Code' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.open(affiliateLink, '_blank')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Landing Page
            </button>
            <button
              onClick={() => handleCopy(`Join AdRuby with my link: ${affiliateLink}`, 'Message')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {copiedItem === 'Message' ? 'Copied!' : 'Copy Share Message'}
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
            <p className="text-sm text-muted-foreground mt-1">
              Share directly on social platforms
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              Share on X
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              LinkedIn
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </Card>

      {/* Earnings Chart */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header with Time Range Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Earnings Over Time</h3>
              <p className="text-sm text-muted-foreground mt-1">Track your affiliate revenue</p>
            </div>

            {/* Segmented Control */}
            <div className="flex items-center gap-1 p-1 border border-border rounded-lg bg-muted/30">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Strip */}
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

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C80000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C80000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`€${value}`, 'Earnings']}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#C80000"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Referrals List */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header with Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Your Referrals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredReferrals.length} {referralFilter === 'all' ? 'total' : referralFilter} referrals
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'paid', 'trial', 'active'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReferralFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    referralFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Referrals List */}
          <div className="space-y-2">
            {filteredReferrals.map((referral) => (
              <div
                key={referral.id}
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {referral.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{referral.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{referral.email}</p>
                    </div>
                  </div>

                  {/* Status + Plan + Commission */}
                  <div className="hidden sm:flex items-center gap-4">
                    {getStatusBadge(referral.status)}
                    <div className="text-right">
                      <p className="text-sm font-medium">{referral.plan}</p>
                      <p className="text-xs text-muted-foreground">
                        {referral.status === 'trial' ? 'No commission yet' : `€${referral.monthlyCommission}/mo`}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: Status Only */}
                  <div className="sm:hidden">
                    {getStatusBadge(referral.status)}
                  </div>
                </div>

                {/* Mobile: Plan + Commission */}
                <div className="sm:hidden mt-3 pt-3 border-t border-border flex justify-between">
                  <p className="text-sm text-muted-foreground">{referral.plan}</p>
                  <p className="text-sm font-medium">
                    {referral.status === 'trial' ? 'Trial' : `€${referral.monthlyCommission}/mo`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* How It Works + Tier Info */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* How It Works */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <div className="space-y-3">
            {[
              { icon: Link2, text: 'Share your unique affiliate link' },
              { icon: Users, text: 'Friends sign up using your link' },
              { icon: DollarSign, text: 'Earn 20% recurring commission' },
              { icon: Repeat, text: 'Get paid every month they stay' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground pt-2">{step.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Commission Tier */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Commission Tier</h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-600">{commissionTier.current}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Current Rate</span>
                <span className="font-semibold">{commissionTier.currentRate}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-purple-500 rounded-full"
                  style={{ width: `${commissionTier.progress}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {commissionTier.referralsNeeded} more referrals to reach {commissionTier.nextTier} ({commissionTier.nextRate})
              </p>
            </div>

            <div className="p-3 border border-border rounded-lg bg-muted/30 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next payout: <span className="font-medium text-foreground">1st of next month</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
