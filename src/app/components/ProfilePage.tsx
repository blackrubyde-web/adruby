import { useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  TrendingUp,
  Target,
  Zap,
  DollarSign,
  Eye,
  MousePointerClick,
  BarChart3,
  Clock,
  CheckCircle2,
  Star,
  Trophy,
  Flame,
} from 'lucide-react';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');

  // User Profile Data
  const userProfile = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    company: 'My Company GmbH',
    role: 'Marketing Manager',
    location: 'Berlin, Germany',
    joinedDate: 'January 2024',
    avatar: 'MM',
    campaigns: 12,
    adsCreated: 25,
    avgRoas: 4.8,
    totalSpent: 45200,
  };

  // User Stats
  const stats = [
    { label: 'Active Campaigns', value: '12', icon: <Zap className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/20' },
    { label: 'Total Spend', value: '€45.2K', icon: <DollarSign className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-500/20' },
    { label: 'Total Revenue', value: '€218K', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { label: 'Avg. ROAS', value: '4.8x', icon: <Target className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  ];

  // Recent Activity
  const recentActivity = [
    { action: 'Created campaign', detail: 'Summer Sale 2024', time: '2 hours ago', icon: <Zap className="w-4 h-4" /> },
    { action: 'Updated budget', detail: 'Black Friday campaign', time: '5 hours ago', icon: <DollarSign className="w-4 h-4" /> },
    { action: 'Generated report', detail: 'Q1 Performance Report', time: '1 day ago', icon: <BarChart3 className="w-4 h-4" /> },
    { action: 'Paused campaign', detail: 'Winter Collection', time: '2 days ago', icon: <Clock className="w-4 h-4" /> },
    { action: 'Connected Facebook', detail: 'Ad Account linked', time: '5 days ago', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  // Achievements
  const achievements = [
    {
      id: 1,
      title: 'First Campaign',
      description: 'Created your first campaign',
      icon: <Star className="w-6 h-6" />,
      unlocked: true,
      date: 'Jan 15, 2024',
      color: 'from-yellow-500/20',
      iconColor: 'text-yellow-500',
    },
    {
      id: 2,
      title: 'High Performer',
      description: 'Achieved 5x ROAS on a campaign',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: true,
      date: 'Jan 28, 2024',
      color: 'from-purple-500/20',
      iconColor: 'text-purple-500',
    },
    {
      id: 3,
      title: 'On Fire!',
      description: '7 day streak of active campaigns',
      icon: <Flame className="w-6 h-6" />,
      unlocked: true,
      date: 'Feb 5, 2024',
      color: 'from-orange-500/20',
      iconColor: 'text-orange-500',
    },
    {
      id: 4,
      title: 'Big Spender',
      description: 'Spent over €50K on ads',
      icon: <DollarSign className="w-6 h-6" />,
      unlocked: false,
      date: null,
      color: 'from-muted/20',
      iconColor: 'text-muted-foreground',
    },
    {
      id: 5,
      title: 'Campaign Master',
      description: 'Managed 50+ campaigns',
      icon: <Award className="w-6 h-6" />,
      unlocked: false,
      date: null,
      color: 'from-muted/20',
      iconColor: 'text-muted-foreground',
    },
    {
      id: 6,
      title: 'ROI Legend',
      description: 'Achieved 10x ROAS',
      icon: <Target className="w-6 h-6" />,
      unlocked: false,
      date: null,
      color: 'from-muted/20',
      iconColor: 'text-muted-foreground',
    },
  ];

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
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-all flex items-center gap-2">
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 flex items-center gap-2">
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{userProfile.campaigns}</div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{userProfile.adsCreated}</div>
            <div className="text-sm text-muted-foreground">Ads Created</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{userProfile.avgRoas}x</div>
            <div className="text-sm text-muted-foreground">Average ROAS</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">€{(userProfile.totalSpent / 1000).toFixed(1)}K</div>
            <div className="text-sm text-muted-foreground">Total Spend</div>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl">
            {userProfile.avatar}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{userProfile.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">{userProfile.role} at {userProfile.company}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{userProfile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {userProfile.joinedDate}</span>
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
                    <div className="text-3xl font-bold text-foreground mb-2">12.4M</div>
                    <div className="text-sm text-green-500 font-semibold">↑ 24% from last month</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <MousePointerClick className="w-6 h-6 text-green-400" />
                      <h4 className="font-semibold text-foreground">Total Clicks</h4>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">342K</div>
                    <div className="text-sm text-green-500 font-semibold">↑ 18% from last month</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Top Performing Campaigns</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Summer Sale 2024', roas: '6.2x', spend: '€4.2K', revenue: '€26.1K', status: 'Active' },
                    { name: 'Black Friday Promo', roas: '5.8x', spend: '€8.1K', revenue: '€47K', status: 'Active' },
                    { name: 'Product Launch', roas: '4.5x', spend: '€3.2K', revenue: '€14.4K', status: 'Active' },
                  ].map((campaign, i) => (
                    <div
                      key={i}
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
                            <span>ROAS: <span className="font-semibold text-foreground">{campaign.roas}</span></span>
                            <span>•</span>
                            <span>Spend: <span className="font-semibold text-foreground">{campaign.spend}</span></span>
                            <span>•</span>
                            <span>Revenue: <span className="font-semibold text-foreground">{campaign.revenue}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">{activity.detail}</div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  You've unlocked {achievements.filter(a => a.unlocked).length} of {achievements.length} achievements
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-6 bg-gradient-to-br ${achievement.color} to-transparent border ${
                      achievement.unlocked ? 'border-border/30' : 'border-border/20'
                    } rounded-2xl ${achievement.unlocked ? 'hover:scale-105' : 'opacity-60'} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 bg-background/50 rounded-2xl ${achievement.iconColor}`}>
                        {achievement.icon}
                      </div>
                      {achievement.unlocked && (
                        <div className="p-2 bg-green-500/20 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-foreground mb-2">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <div className="text-xs text-muted-foreground">Unlocked on {achievement.date}</div>
                    )}
                    {!achievement.unlocked && (
                      <div className="text-xs text-muted-foreground font-semibold">🔒 Locked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
