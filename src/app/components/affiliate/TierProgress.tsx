import { useMemo } from 'react';
import { Trophy, Star, Crown, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface TierProgressProps {
    activeReferrals: number;
    totalEarnings: number;
}

const TIERS = [
    {
        id: 'starter',
        name: 'Starter',
        icon: Star,
        minReferrals: 0,
        commission: 30,
        color: 'from-slate-400 to-slate-500',
        bgColor: 'bg-slate-500/10',
        textColor: 'text-slate-400',
        benefits: ['30% Lifetime Commission', 'Marketing Materials', 'Dashboard Access']
    },
    {
        id: 'pro',
        name: 'Pro Partner',
        icon: Trophy,
        minReferrals: 5,
        commission: 35,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-500/10',
        textColor: 'text-violet-400',
        benefits: ['35% Lifetime Commission', 'Priority Support', 'Custom Promo Code', 'Quarterly Bonus']
    },
    {
        id: 'elite',
        name: 'Elite Partner',
        icon: Crown,
        minReferrals: 20,
        commission: 40,
        color: 'from-amber-400 to-yellow-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        benefits: ['40% Lifetime Commission', 'Dedicated Account Manager', 'Co-Branded Landing Page', 'Monthly Bonus', 'Early Feature Access']
    },
];

export function TierProgress({ activeReferrals, totalEarnings }: TierProgressProps) {
    const currentTier = useMemo(() => {
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (activeReferrals >= TIERS[i].minReferrals) {
                return TIERS[i];
            }
        }
        return TIERS[0];
    }, [activeReferrals]);

    const nextTier = useMemo(() => {
        const currentIndex = TIERS.findIndex(t => t.id === currentTier.id);
        return currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;
    }, [currentTier]);

    const progressToNextTier = useMemo(() => {
        if (!nextTier) return 100;
        const currentMin = currentTier.minReferrals;
        const nextMin = nextTier.minReferrals;
        const progress = ((activeReferrals - currentMin) / (nextMin - currentMin)) * 100;
        return Math.min(progress, 100);
    }, [activeReferrals, currentTier, nextTier]);

    const referralsToNext = nextTier ? nextTier.minReferrals - activeReferrals : 0;

    return (
        <Card className="p-6 overflow-hidden relative">
            {/* Background Glow */}
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20",
                `bg-gradient-to-r ${currentTier.color}`
            )} />

            <div className="relative z-10 space-y-6">
                {/* Current Tier Display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                            currentTier.color
                        )}>
                            <currentTier.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <Badge className={cn("mb-1", currentTier.bgColor, currentTier.textColor, "border-0")}>
                                AKTUELLER TIER
                            </Badge>
                            <h3 className="text-2xl font-black">{currentTier.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentTier.commission}% Commission</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-emerald-500">€{totalEarnings.toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">Gesamt verdient</div>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                {nextTier && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fortschritt zu {nextTier.name}</span>
                            <span className="font-bold">{activeReferrals} / {nextTier.minReferrals} Referrals</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", nextTier.color)}
                                style={{ width: `${progressToNextTier}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Noch <span className="font-bold text-foreground">{referralsToNext} Referrals</span> bis {nextTier.commission}% Commission
                            </span>
                        </div>
                    </div>
                )}

                {/* Tier Benefits Comparison */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                    {TIERS.map((tier) => {
                        const isActive = tier.id === currentTier.id;
                        const isLocked = tier.minReferrals > activeReferrals;
                        const TierIcon = tier.icon;

                        return (
                            <div
                                key={tier.id}
                                className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    isActive
                                        ? `border-2 ${tier.bgColor}`
                                        : isLocked
                                            ? "border-border opacity-50"
                                            : "border-border"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <TierIcon className={cn("w-4 h-4", tier.textColor)} />
                                    <span className="font-bold text-sm">{tier.name}</span>
                                </div>
                                <div className={cn("text-2xl font-black mb-2", tier.textColor)}>
                                    {tier.commission}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {tier.minReferrals === 0 ? 'Start' : `Ab ${tier.minReferrals} Referrals`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current Benefits */}
                <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Deine Benefits
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentTier.benefits.map((benefit, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                                {benefit}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function getTierInfo(activeReferrals: number) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (activeReferrals >= TIERS[i].minReferrals) {
            return TIERS[i];
        }
    }
    return TIERS[0];
}
