import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

export function OverviewPreview() {
    return (
        <div className="w-full bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/10">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Übersicht</h3>
                <p className="text-white/60 text-sm sm:text-base">Hier siehst du, was heute mit deinen Kampagnen passiert</p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        Meta connected
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                        Range: 7d
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                        Channel: Meta
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {/* Total Spend */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-xs sm:text-sm font-medium">Gesamtausgaben</span>
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0 €</div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <TrendingDown className="w-3 h-3" />
                            <span>vs last 7d</span>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-xs sm:text-sm font-medium">Gesamtumsatz</span>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0 €</div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <TrendingDown className="w-3 h-3" />
                            <span>vs last 7d</span>
                        </div>
                    </div>

                    {/* Average ROAS */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-xs sm:text-sm font-medium">Durchschn. ROAS</span>
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0.00x</div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <TrendingDown className="w-3 h-3" />
                            <span>vs last 7d</span>
                        </div>
                    </div>

                    {/* Active Campaigns */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-xs sm:text-sm font-medium">Aktive Kampagnen</span>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">0</span>
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <TrendingDown className="w-3 h-3" />
                            <span>vs last 7d</span>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Spend vs Revenue Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Ausgaben vs Umsatz</h4>
                        <div className="flex items-center justify-center h-32 sm:h-40">
                            <div className="text-center">
                                <p className="text-white/40 text-sm mb-2">Keine Kampagnen vorhanden</p>
                                <p className="text-white/20 text-xs">Starte deine erste Kampagne, um Charts freizuschalten.</p>
                            </div>
                        </div>
                    </div>

                    {/* ROAS Trend Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">ROAS Trend</h4>
                        <div className="flex items-center justify-center h-32 sm:h-40">
                            <div className="text-center">
                                <p className="text-white/40 text-sm mb-2">Keine Kampagnen vorhanden</p>
                                <p className="text-white/20 text-xs">Starte deine erste Kampagne, um ROAS zu sehen.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
