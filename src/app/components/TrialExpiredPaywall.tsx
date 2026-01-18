import { memo } from 'react';
import { Crown, ArrowLeft, Clock, Sparkles, Lock, AlertTriangle } from 'lucide-react';

interface TrialExpiredPaywallProps {
    onUpgrade: () => void;
    onBackToLanding: () => void;
    userEmail?: string | null;
}

export const TrialExpiredPaywall = memo(function TrialExpiredPaywall({
    onUpgrade,
    onBackToLanding,
    userEmail,
}: TrialExpiredPaywallProps) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,31,31,0.15),transparent_60%)] blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(60,60,255,0.08),transparent_60%)] blur-[100px] animate-float-delayed" />
            </div>

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                {/* Lock Icon */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
                    <Lock className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="mt-6 text-center">
                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Trial abgelaufen</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Dein kostenloser Test ist vorbei
                    </h1>

                    <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                        Upgrade jetzt auf AdRuby Pro, um weiterhin KI-generierte Ads zu erstellen und dein Marketing zu skalieren.
                    </p>

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                        {[
                            { icon: Sparkles, text: 'Unlimitierte AI Creatives' },
                            { icon: Crown, text: 'Premium Templates' },
                            { icon: Clock, text: 'Priority Support' },
                            { icon: Lock, text: 'Voller Dashboard Zugang' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-[#FF1F1F]/20 flex items-center justify-center">
                                    <item.icon className="w-4 h-4 text-[#FF1F1F]" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Teaser */}
                    <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#FF1F1F]/10 to-rose-500/10 border border-[#FF1F1F]/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-4xl font-black text-white">€49</span>
                            <span className="text-white/60">/Monat</span>
                        </div>
                        <p className="text-white/40 text-sm">Jährlich nur €39/Monat · 7 Tage Geld-zurück-Garantie</p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={onUpgrade}
                            className="w-full py-4 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,31,31,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Crown className="w-5 h-5" />
                            Jetzt auf Pro upgraden
                        </button>

                        <button
                            onClick={onBackToLanding}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Zurück zur Startseite
                        </button>
                    </div>

                    {/* User Email */}
                    {userEmail && (
                        <p className="mt-6 text-white/30 text-xs">
                            Eingeloggt als {userEmail}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});
