import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface LeaderboardEntry {
    rank: number;
    name: string;
    tier: 'starter' | 'pro' | 'elite';
    referralCount: number;
    totalEarnings: number;
    isCurrentUser?: boolean;
}

const TIER_CONFIG = {
    starter: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
    pro: { color: 'text-violet-500', bg: 'bg-violet-500/10' },
    elite: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

export function AffiliateLeaderboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const demoLeaderboard: LeaderboardEntry[] = [
                { rank: 1, name: 'Alex K.', tier: 'elite', referralCount: 47, totalEarnings: 4250 },
                { rank: 2, name: 'Maria S.', tier: 'elite', referralCount: 38, totalEarnings: 3120 },
                { rank: 3, name: 'Thomas B.', tier: 'elite', referralCount: 31, totalEarnings: 2890 },
                { rank: 4, name: 'Julia M.', tier: 'pro', referralCount: 18, totalEarnings: 1560 },
                { rank: 5, name: 'Sebastian L.', tier: 'pro', referralCount: 15, totalEarnings: 1340 },
                { rank: 6, name: 'Laura W.', tier: 'pro', referralCount: 12, totalEarnings: 980 },
                { rank: 7, name: 'Du', tier: 'starter', referralCount: 4, totalEarnings: 120, isCurrentUser: true },
                { rank: 8, name: 'Felix R.', tier: 'starter', referralCount: 3, totalEarnings: 90 },
                { rank: 9, name: 'Nina H.', tier: 'starter', referralCount: 2, totalEarnings: 60 },
                { rank: 10, name: 'Chris P.', tier: 'starter', referralCount: 1, totalEarnings: 30 },
            ];
            setLeaderboard(demoLeaderboard);
            setIsLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Top Partner
                    </h3>
                    <p className="text-sm text-muted-foreground">Die erfolgreichsten AdRuby Partner diesen Monat</p>
                </div>
                <Button
                    variant={isOptedIn ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsOptedIn(!isOptedIn)}
                    className="gap-2"
                >
                    {isOptedIn ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isOptedIn ? 'Sichtbar' : 'Unsichtbar'}
                </Button>
            </div>

            {/* Opt-in Notice */}
            {!isOptedIn && (
                <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                    <p className="text-sm text-muted-foreground">
                        <strong>Deine Position ist versteckt.</strong> Klicke auf "Sichtbar", um im Leaderboard zu erscheinen und andere Partner zu motivieren!
                    </p>
                </Card>
            )}

            {/* Leaderboard */}
            <div className="space-y-2">
                {leaderboard.map((entry) => (
                    <Card
                        key={entry.rank}
                        className={cn(
                            "p-4 transition-all",
                            entry.isCurrentUser && "ring-2 ring-primary bg-primary/5",
                            entry.rank <= 3 && "bg-gradient-to-r from-amber-500/5 to-transparent"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Name & Tier */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-semibold", entry.isCurrentUser && "text-primary")}>
                                        {entry.name}
                                    </span>
                                    <Badge className={cn("text-[10px] capitalize", TIER_CONFIG[entry.tier].bg, TIER_CONFIG[entry.tier].color)}>
                                        {entry.tier}
                                    </Badge>
                                    {entry.isCurrentUser && (
                                        <Badge className="text-[10px] bg-primary/10 text-primary border-0">Du</Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {entry.referralCount} Referrals
                                </div>
                            </div>

                            {/* Earnings */}
                            <div className="text-right">
                                <div className="font-bold text-emerald-500">€{entry.totalEarnings.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">verdient</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Motivation */}
            <Card className="p-6 text-center bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                <h4 className="font-bold text-lg mb-1">Werde Top Partner!</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Erreiche Platz 1 und gewinne exklusive Boni + Features.
                </p>
                <div className="flex justify-center gap-4 text-sm">
                    <div className="text-center">
                        <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <span className="text-muted-foreground">+€500 Bonus</span>
                    </div>
                    <div className="text-center">
                        <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <span className="text-muted-foreground">Featured Partner</span>
                    </div>
                    <div className="text-center">
                        <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <span className="text-muted-foreground">Early Access</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
