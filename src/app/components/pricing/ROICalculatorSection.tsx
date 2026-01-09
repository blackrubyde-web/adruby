import { useState } from 'react';
import { TrendingUp, Clock, DollarSign } from 'lucide-react';

export function ROICalculatorSection() {
    const [adSpend, setAdSpend] = useState(5000);
    const [currentROAS, setCurrentROAS] = useState(2.5);

    // Calculations
    const currentRevenue = adSpend * currentROAS;
    const currentCostPerAd = 250; // Average agency cost
    const adsPerMonth = Math.floor(adSpend / currentCostPerAd);

    // With AdRuby
    const adRubyROASBoost = 1.4; // 40% improvement
    const newROAS = currentROAS * adRubyROASBoost;
    const newRevenue = adSpend * newROAS;
    const revenueDiff = newRevenue - currentRevenue;

    const adrubyAdsPerMonth = adsPerMonth * 10; // 10x more ads
    const timeCurrently = adsPerMonth * 2.5; // 2.5 hours per ad
    const timeWithAdRuby = adrubyAdsPerMonth * 0.08; // 5 min per ad
    const timeSaved = timeCurrently - timeWithAdRuby;

    return (
        <section className="py-24 sm:py-32 relative z-10 bg-gradient-to-b from-black via-[#0A0A0A] to-black">
            <div className="landing-container">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Berechne dein <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">ROI</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
                        Finde heraus, wie viel Zeit & Geld du mit AdRuby sparst
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
                    {/* Input Side */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <h3 className="text-2xl font-bold text-white mb-8">Deine aktuellen Zahlen</h3>

                        {/* Ad Spend Input */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-white/80 mb-3">
                                Monatliches Ad Budget
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">€</span>
                                <input
                                    type="number"
                                    value={adSpend}
                                    onChange={(e) => setAdSpend(Number(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-4 text-white text-lg font-semibold focus:outline-none focus:border-rose-500/50 transition-colors"
                                    min="0"
                                    step="100"
                                />
                            </div>
                            <input
                                type="range"
                                value={adSpend}
                                onChange={(e) => setAdSpend(Number(e.target.value))}
                                min="0"
                                max="50000"
                                step="100"
                                className="w-full mt-4 accent-rose-500"
                            />
                        </div>

                        {/* Current ROAS Input */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-white/80 mb-3">
                                Aktueller ROAS
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={currentROAS}
                                    onChange={(e) => setCurrentROAS(Number(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-4 text-white text-lg font-semibold focus:outline-none focus:border-rose-500/50 transition-colors"
                                    min="0"
                                    step="0.1"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">x</span>
                            </div>
                            <input
                                type="range"
                                value={currentROAS}
                                onChange={(e) => setCurrentROAS(Number(e.target.value))}
                                min="0"
                                max="10"
                                step="0.1"
                                className="w-full mt-4 accent-rose-500"
                            />
                        </div>

                        {/* Current Stats */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Aktueller Umsatz</div>
                                <div className="text-xl font-bold text-white">€{currentRevenue.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Ads pro Monat</div>
                                <div className="text-xl font-bold text-white">{adsPerMonth}</div>
                            </div>
                        </div>
                    </div>

                    {/* Results Side */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(34,197,94,0.2)]">
                        <h3 className="text-2xl font-bold text-white mb-8">Mit AdRuby</h3>

                        {/* Main Result Cards */}
                        <div className="space-y-6 mb-8">
                            {/* Revenue Increase */}
                            <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <TrendingUp className="w-8 h-8 text-green-400" />
                                    <div className="text-right">
                                        <div className="text-sm text-green-400 mb-1">Umsatzsteigerung</div>
                                        <div className="text-4xl font-black text-green-400">
                                            +€{revenueDiff.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-white/40 mt-1">pro Monat</div>
                                    </div>
                                </div>
                                <div className="text-white/60 text-sm">
                                    Neuer ROAS: <span className="text-green-400 font-semibold">{newROAS.toFixed(1)}x</span> (statt {currentROAS}x)
                                </div>
                            </div>

                            {/* Time Saved */}
                            <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <Clock className="w-8 h-8 text-blue-400" />
                                    <div className="text-right">
                                        <div className="text-sm text-blue-400 mb-1">Zeit gespart</div>
                                        <div className="text-4xl font-black text-blue-400">
                                            {Math.round(timeSaved)}h
                                        </div>
                                        <div className="text-xs text-white/40 mt-1">pro Monat</div>
                                    </div>
                                </div>
                                <div className="text-white/60 text-sm">
                                    {adrubyAdsPerMonth} Ads erstellen (statt {adsPerMonth})
                                </div>
                            </div>

                            {/* Cost Savings */}
                            <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <DollarSign className="w-8 h-8 text-purple-400" />
                                    <div className="text-right">
                                        <div className="text-sm text-purple-400 mb-1">Kostenersparnis</div>
                                        <div className="text-4xl font-black text-purple-400">
                                            ~90%
                                        </div>
                                        <div className="text-xs text-white/40 mt-1">vs. Agenturen</div>
                                    </div>
                                </div>
                                <div className="text-white/60 text-sm">
                                    €{currentCostPerAd}/Ad → €0.02/Ad
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-600/20 hover:scale-[1.02]">
                            Jetzt kostenlos starten →
                        </button>
                        <p className="text-center text-xs text-white/40 mt-4">
                            Keine Kreditkarte erforderlich
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-xs text-white/40 max-w-2xl mx-auto mt-12">
                    *Berechnungen basieren auf Durchschnittswerten unserer Kunden. Individuelle Ergebnisse können variieren.
                </p>
            </div>
        </section>
    );
}
