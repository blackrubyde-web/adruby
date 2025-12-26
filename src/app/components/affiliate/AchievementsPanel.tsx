import { useState, useEffect } from 'react';
import { Trophy, Lock, Loader2, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface Achievement {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    requirement_type: string;
    requirement_value: number;
    unlocked: boolean;
    unlocked_at?: string;
    progress?: number;
}

export function AchievementsPanel() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ earnings: 0, referrals: 0, conversions: 0 });

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user stats for progress calculation
            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('affiliate_balance, affiliate_lifetime_earnings')
                .eq('id', user.id)
                .single();

            const totalEarnings = (profileData?.affiliate_balance || 0) + (profileData?.affiliate_lifetime_earnings || 0);

            // Count referrals
            const { count: referralsCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('referred_by_affiliate_id', user.id);

            // Count conversions
            const { count: conversionsCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('referred_by_affiliate_id', user.id)
                .eq('payment_verified', true);

            setStats({
                earnings: totalEarnings,
                referrals: referralsCount || 0,
                conversions: conversionsCount || 0
            });

            // Load all achievements
            const { data: allAchievements, error: achievementsError } = await supabase
                .from('achievements')
                .select('*')
                .order('requirement_value', { ascending: true });

            if (achievementsError) throw achievementsError;

            // Load user's unlocked achievements
            const { data: unlockedData, error: unlockedError } = await supabase
                .from('user_achievements')
                .select('achievement_id, unlocked_at')
                .eq('user_id', user.id);

            if (unlockedError) throw unlockedError;

            const unlockedMap = new Map(unlockedData?.map(u => [u.achievement_id, u.unlocked_at]) || []);

            // Combine and calculate progress
            const enrichedAchievements = (allAchievements || []).map(ach => {
                const unlocked = unlockedMap.has(ach.id);
                let progress = 0;

                if (!unlocked) {
                    switch (ach.requirement_type) {
                        case 'earnings':
                            progress = Math.min(100, (totalEarnings / ach.requirement_value) * 100);
                            break;
                        case 'referrals':
                            progress = Math.min(100, ((referralsCount || 0) / ach.requirement_value) * 100);
                            break;
                        case 'conversions':
                            progress = Math.min(100, ((conversionsCount || 0) / ach.requirement_value) * 100);
                            break;
                    }
                }

                return {
                    ...ach,
                    unlocked,
                    unlocked_at: unlockedMap.get(ach.id),
                    progress: unlocked ? 100 : progress
                };
            });

            setAchievements(enrichedAchievements);
        } catch (err) {
            console.error('Failed to load achievements:', err);
            toast.error('Failed to load achievements');
        } finally {
            setIsLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return 'from-amber-700 to-amber-900';
            case 'silver': return 'from-gray-400 to-gray-600';
            case 'gold': return 'from-yellow-400 to-yellow-600';
            case 'platinum': return 'from-purple-400 to-purple-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const shareAchievement = (achievement: Achievement) => {
        const text = `🏆 Ich habe das "${achievement.name}" Achievement bei AdRuby freigeschaltet! ${achievement.description}`;
        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Achievement text copied!');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        Achievements
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {unlockedCount} von {achievements.length} freigeschaltet
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                    style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                />
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`relative bg-card border rounded-xl p-5 transition-all ${achievement.unlocked
                                ? 'border-primary shadow-lg shadow-primary/20'
                                : 'border-border opacity-60'
                            }`}
                    >
                        {/* Tier Badge */}
                        <div className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center`}>
                            {achievement.unlocked ? (
                                <Trophy className="w-4 h-4 text-white" />
                            ) : (
                                <Lock className="w-4 h-4 text-white" />
                            )}
                        </div>

                        {/* Icon */}
                        <div className="text-4xl mb-3">{achievement.icon}</div>

                        {/* Content */}
                        <h3 className="font-semibold mb-1">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

                        {/* Progress */}
                        {!achievement.unlocked && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{Math.round(achievement.progress || 0)}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${achievement.progress || 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Unlocked Date & Share */}
                        {achievement.unlocked && achievement.unlocked_at && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    {new Date(achievement.unlocked_at).toLocaleDateString('de-DE')}
                                </p>
                                <button
                                    onClick={() => shareAchievement(achievement)}
                                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
