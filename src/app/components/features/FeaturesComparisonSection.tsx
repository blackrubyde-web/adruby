import { Check, X } from 'lucide-react';

export function FeaturesComparisonSection() {
    const comparisons = [
        {
            feature: 'Zeit pro Ad',
            traditional: '2-4 Stunden',
            traditionalBad: true,
            adruby: '<5 Minuten',
            adrubyGood: true,
        },
        {
            feature: 'Kosten pro Ad',
            traditional: '€200-500',
            traditionalBad: true,
            adruby: '€0.02',
            adrubyGood: true,
        },
        {
            feature: 'Varianten',
            traditional: '1-3',
            traditionalBad: true,
            adruby: 'Unbegrenzt',
            adrubyGood: true,
        },
        {
            feature: 'Performance-Vorhersage',
            traditional: 'Bauchgefühl',
            traditionalBad: true,
            adruby: 'KI-gestützt',
            adrubyGood: true,
        },
        {
            feature: 'A/B Testing',
            traditional: 'Manuell',
            traditionalBad: true,
            adruby: 'Automatisch',
            adrubyGood: true,
        },
        {
            feature: 'Skalierung',
            traditional: 'Linear (mehr Designer)',
            traditionalBad: true,
            adruby: 'Exponentiell',
            adrubyGood: true,
        },
    ];

    return (
        <section className="py-24 sm:py-32 relative z-10">
            <div className="landing-container">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        AdRuby vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Traditionell</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
                        Sieh selbst, warum führende Brands auf AdRuby setzen
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="max-w-5xl mx-auto">
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 gap-4 p-6 sm:p-8 border-b border-white/10 bg-white/5">
                            <div className="text-sm font-medium text-white/60 uppercase tracking-wider">Feature</div>
                            <div className="text-center">
                                <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">Traditionell</div>
                                <div className="text-xs text-white/40">(Agenturen/Designer)</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">AdRuby</div>
                                <div className="text-xs text-rose-400">(KI-Platform)</div>
                            </div>
                        </div>

                        {/* Table Rows */}
                        {comparisons.map((item, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-3 gap-4 p-6 sm:p-8 ${index !== comparisons.length - 1 ? 'border-b border-white/5' : ''
                                    } hover:bg-white/5 transition-colors`}
                            >
                                {/* Feature Name */}
                                <div className="flex items-center">
                                    <span className="text-base font-semibold text-white">{item.feature}</span>
                                </div>

                                {/* Traditional */}
                                <div className="flex items-center justify-center gap-2">
                                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <span className="text-white/60 text-sm sm:text-base text-center">{item.traditional}</span>
                                </div>

                                {/* AdRuby */}
                                <div className="flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-green-400 font-semibold text-sm sm:text-base text-center">{item.adruby}</span>
                                </div>
                            </div>
                        ))}

                        {/* CTA Row */}
                        <div className="p-8 bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-t border-rose-500/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Bereit für den Wechsel?</h4>
                                    <p className="text-white/60 text-sm">Starte kostenlos und erlebe den Unterschied selbst</p>
                                </div>
                                <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl whitespace-nowrap">
                                    Jetzt starten →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
