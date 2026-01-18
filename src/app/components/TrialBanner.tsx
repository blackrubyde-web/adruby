import { memo } from 'react';
import { Clock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface TrialBannerProps {
    trialEndsAt: string | null;
    onUpgrade: () => void;
    statusLabel: string;
    isPaid: boolean;
}

function formatDaysRemaining(trialEndsAt: string | null): { days: number; text: string } {
    if (!trialEndsAt) return { days: 0, text: 'Trial läuft ab' };

    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return { days: 0, text: 'Trial endet heute!' };
    if (diffDays === 1) return { days: 1, text: 'Noch 1 Tag übrig' };
    return { days: diffDays, text: `Noch ${diffDays} Tage übrig` };
}

export const TrialBanner = memo(function TrialBanner({
    trialEndsAt,
    onUpgrade,
    statusLabel,
    isPaid,
}: TrialBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    // Don't show if paid or dismissed
    if (isPaid || isDismissed) return null;

    // Only show for Trial users
    if (statusLabel !== 'Trial' && statusLabel !== 'Trial expired') return null;

    const { days, text } = formatDaysRemaining(trialEndsAt);
    const isUrgent = days <= 2;
    const isExpired = statusLabel === 'Trial expired';

    return (
        <div
            className={`w-full py-2.5 px-4 flex items-center justify-center gap-4 text-sm font-medium transition-all ${isExpired
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white'
                : isUrgent
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white'
                    : 'bg-gradient-to-r from-[#FF1F1F] via-rose-500 to-[#FF1F1F] text-white'
                }`}
        >
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                    {isExpired ? (
                        '⚠️ Dein Trial ist abgelaufen!'
                    ) : (
                        <>
                            <span className="hidden sm:inline">🚀 Du nutzt AdRuby Pro Trial – </span>
                            <span className="font-bold">{text}</span>
                        </>
                    )}
                </span>
            </div>

            <button
                onClick={onUpgrade}
                className={`px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${isExpired
                    ? 'bg-white text-red-600 hover:bg-white/90'
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30'
                    }`}
            >
                <Sparkles className="w-3.5 h-3.5" />
                {isExpired ? 'Jetzt upgraden' : 'Upgrade'}
            </button>

            {!isExpired && (
                <button
                    onClick={() => setIsDismissed(true)}
                    className="p-1 hover:bg-white/20 rounded transition-colors ml-2"
                    title="Schließen"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
});
