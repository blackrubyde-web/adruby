import { AlertTriangle, Copy, TrendingUp, TrendingDown } from 'lucide-react';

export function AIAutopilotPreview() {
    return (
        <div className="w-full bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">KI-Analyse & Autopilot</h3>
                        <p className="text-white/60 text-sm sm:text-base">KI-gestützte Einblicke zur Analyse von 0 Kampagnen, 0 Ad-Sets und 0 Anzeigen</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Daten synchronisieren
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Bericht exportieren
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                            KI-Analyse starten
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                            Empfehlungen anwenden
                        </button>
                    </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        €0.0k Spend
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        €0.0k Revenue
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                        0.00x ROAS
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                        0 AI Insights
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                        <span>AUTOPILOT OFF</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
                {/* Autopilot Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg">AdRuby Autopilot</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">
                                        <span className="text-yellow-400 text-xs font-bold uppercase">HEALTH</span>
                                    </div>
                                    <p className="text-white/60 text-sm">⚠️ Keine Daten verfügbar. Verbinde Meta oder starte einen Sync.</p>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium">
                            ENABLE
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Kampagnen, Ad-Sets oder Ads durchsuchen..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/20"
                            readOnly
                        />
                        <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">Alle Status</button>
                        <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            KI Panel
                        </button>
                    </div>
                </div>

                {/* AI Recommendations Section */}
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            KI-Empfehlungen
                        </h4>
                        <span className="text-white/60 text-sm">Echtzeitanalyse</span>
                    </div>

                    <p className="text-white/40 text-sm mb-4">Aktualisiert vor 30 Sekunden</p>

                    {/* Recommendation Cards Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Kill Ads */}
                        <div className="bg-[#2D0F0F] border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <span className="text-white font-bold">Kill Ads</span>
                            </div>
                            <div className="text-4xl font-black text-red-500 mb-2">0</div>
                        </div>

                        {/* Duplicate */}
                        <div className="bg-[#0F2D1A] border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Copy className="w-5 h-5 text-green-500" />
                                <span className="text-white font-bold">Duplicate</span>
                            </div>
                            <div className="text-4xl font-black text-green-500 mb-2">0</div>
                        </div>

                        {/* Increase */}
                        <div className="bg-[#0F1A2D] border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <span className="text-white font-bold">Increase</span>
                            </div>
                            <div className="text-4xl font-black text-blue-500 mb-2">0</div>
                        </div>

                        {/* Decrease */}
                        <div className="bg-[#2D1A0F] border border-orange-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                                <span className="text-white font-bold">Decrease</span>
                            </div>
                            <div className="text-4xl font-black text-orange-500 mb-2">0</div>
                        </div>
                    </div>
                </div>

                {/* No Campaigns Message */}
                <div className="mt-6 text-center py-12">
                    <p className="text-white/60 text-sm">Keine Kampagnen gefunden. Verbinde Meta oder starte einen Sync.</p>
                </div>
            </div>
        </div>
    );
}
