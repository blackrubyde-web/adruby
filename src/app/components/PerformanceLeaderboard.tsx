import { Trophy, TrendingUp, TrendingDown, Medal, Award, Zap, Target, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  campaignId: string;
  campaignName: string;
  metric: number;
  change: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

interface PerformanceLeaderboardProps {
  metricType?: 'roas' | 'ctr' | 'conversions' | 'revenue';
}

export function PerformanceLeaderboard({ metricType = 'roas' }: PerformanceLeaderboardProps) {
  type MetricType = NonNullable<PerformanceLeaderboardProps['metricType']>;
  const leaderboards: Record<MetricType, LeaderboardItem[]> = {
    roas: [
      { rank: 1, campaignId: '1', campaignName: 'Black Friday Flash Sale', metric: 11.3, change: 24.5, badge: 'gold' as const },
      { rank: 2, campaignId: '2', campaignName: 'Product Demo Video', metric: 8.4, change: 15.2, badge: 'silver' as const },
      { rank: 3, campaignId: '3', campaignName: 'New Collection Launch', metric: 7.1, change: -3.8, badge: 'bronze' as const },
      { rank: 4, campaignId: '4', campaignName: 'Summer Sale Campaign', metric: 6.5, change: 8.1 },
      { rank: 5, campaignId: '5', campaignName: 'Testimonial Video Ad', metric: 5.8, change: 12.3 },
    ],
    ctr: [
      { rank: 1, campaignId: '1', campaignName: 'Product Demo Video', metric: 6.5, change: 18.2, badge: 'gold' as const },
      { rank: 2, campaignId: '2', campaignName: 'Black Friday Flash Sale', metric: 5.77, change: 22.1, badge: 'silver' as const },
      { rank: 3, campaignId: '3', campaignName: 'Testimonial Video Ad', metric: 4.38, change: 5.4, badge: 'bronze' as const },
      { rank: 4, campaignId: '4', campaignName: 'New Collection Launch', metric: 4.0, change: -2.1 },
      { rank: 5, campaignId: '5', campaignName: 'Summer Sale Campaign', metric: 3.87, change: 9.8 },
    ],
    conversions: [
      { rank: 1, campaignId: '1', campaignName: 'Black Friday Flash Sale', metric: 892, change: 34.2, badge: 'gold' as const },
      { rank: 2, campaignId: '2', campaignName: 'Product Demo Video', metric: 425, change: 18.5, badge: 'silver' as const },
      { rank: 3, campaignId: '3', campaignName: 'Summer Sale Campaign', metric: 342, change: 12.7, badge: 'bronze' as const },
      { rank: 4, campaignId: '4', campaignName: 'New Collection Launch', metric: 267, change: -5.3 },
      { rank: 5, campaignId: '5', campaignName: 'Holiday Carousel Ads', metric: 189, change: 8.9 },
    ],
    revenue: [
      { rank: 1, campaignId: '1', campaignName: 'Black Friday Flash Sale', metric: 124500, change: 42.8, badge: 'gold' as const },
      { rank: 2, campaignId: '2', campaignName: 'Product Demo Video', metric: 89300, change: 28.3, badge: 'silver' as const },
      { rank: 3, campaignId: '3', campaignName: 'New Collection Launch', metric: 67200, change: 15.2, badge: 'bronze' as const },
      { rank: 4, campaignId: '4', campaignName: 'Summer Sale Campaign', metric: 45600, change: 9.4 },
      { rank: 5, campaignId: '5', campaignName: 'Holiday Carousel Ads', metric: 34200, change: -3.7 },
    ],
  };

  const data = leaderboards[metricType];

  const metricConfig: Record<MetricType, { label: string; icon: LucideIcon; suffix?: string; prefix?: string; color: string }> = {
    roas: { label: 'ROAS', icon: TrendingUp, suffix: 'x', color: 'text-green-500' },
    ctr: { label: 'CTR', icon: Target, suffix: '%', color: 'text-blue-500' },
    conversions: { label: 'Conversions', icon: Zap, suffix: '', color: 'text-purple-500' },
    revenue: { label: 'Revenue', icon: DollarSign, suffix: '', prefix: '€', color: 'text-orange-500' },
  };

  const config = metricConfig[metricType];
  const MetricIcon = config.icon;
  const prefix = config.prefix ?? '';
  const suffix = config.suffix ?? '';

  const getBadgeColor = (badge?: 'gold' | 'silver' | 'bronze') => {
    switch (badge) {
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'bronze': return 'from-orange-600 to-orange-700';
      default: return 'from-muted to-muted';
    }
  };

  const getBadgeIcon = (rank: number) => {
    switch (rank) {
      case 1: return Trophy;
      case 2: return Medal;
      case 3: return Award;
      default: return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getBadgeColor('gold')} rounded-xl flex items-center justify-center`}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Performance Leaderboard</h3>
            <p className="text-sm text-muted-foreground">Top campaigns by {config.label}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getBadgeColor('gold')} bg-opacity-20`}>
          <div className="flex items-center gap-1.5">
            <MetricIcon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {data.map((item) => {
          const BadgeIcon = getBadgeIcon(item.rank);
          
          return (
            <div
              key={item.campaignId}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${
                item.badge
                  ? `border-transparent bg-gradient-to-r ${getBadgeColor(item.badge)} p-[2px]`
                  : 'border-border bg-card'
              }`}
            >
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="relative">
                    {item.badge ? (
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getBadgeColor(item.badge)} flex items-center justify-center shadow-lg`}>
                        {BadgeIcon && <BadgeIcon className="w-6 h-6 text-white" />}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-xl font-bold text-muted-foreground">#{item.rank}</span>
                      </div>
                    )}
                    
                    {/* Badge overlay for top 3 */}
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs font-bold text-foreground">{item.rank}</span>
                      </div>
                    )}
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 truncate">
                      {item.campaignName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Rank #{item.rank}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {item.change > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={item.change > 0 ? 'text-green-500' : 'text-red-500'}>
                          {item.change > 0 ? '+' : ''}{item.change}% vs last period
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Value */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {prefix}{metricType === 'revenue' ? (item.metric / 1000).toFixed(1) + 'K' : item.metric.toLocaleString()}{suffix}
                    </div>
                    <div className="text-xs text-muted-foreground">{config.label}</div>
                  </div>

                  {/* Badge Label */}
                  {item.badge && (
                    <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getBadgeColor(item.badge)} text-white text-xs font-bold shadow-lg`}>
                      {item.badge.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Progress Bar for Top 3 */}
                {item.badge && (
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getBadgeColor(item.badge)} transition-all duration-1000`}
                      style={{ width: `${100 - (item.rank - 1) * 15}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Top Performer</div>
            <div className="font-bold text-foreground">{data[0].campaignName}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Best {config.label}</div>
            <div className={`font-bold ${config.color}`}>
              {prefix}{metricType === 'revenue' ? (data[0].metric / 1000).toFixed(1) + 'K' : data[0].metric}{suffix}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Growth</div>
            <div className="font-bold text-green-500">+{data[0].change}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
