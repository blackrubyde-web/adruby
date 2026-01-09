import { Clock, TrendingDown, BarChart, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';

export function PainPointsSection() {
    const painPoints = [
        {
            icon: Clock,
            problem: 'Stundenlange manuelle Ad-Erstellung kostet dich Zeit & Geld',
            problemColor: 'text-red-500',
            solution: '10+ hochwertige Ad-Varianten in unter 5 Minuten generieren',
            solutionColor: 'text-green-500',
            iconGradient: 'from-red-500 to-rose-600',
        },
        {
            icon: TrendingDown,
            problem: 'Geringe Performance mit Trial & Error Methoden',
            problemColor: 'text-red-500',
            solution: 'KI-Vorhersage zeigt dir die best-performenden Ads vor dem Launch',
            solutionColor: 'text-green-500',
            iconGradient: 'from-orange-500 to-red-500',
        },
        {
            icon: BarChart,
            problem: 'Keine datenbasierten Insights für Optimierung',
            problemColor: 'text-red-500',
            solution: 'Echtzeit-Analytics und automatische Performance-Empfehlungen',
            solutionColor: 'text-green-500',
            iconGradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: DollarSign,
            problem: 'Teure Designer & Agenturen für jeden Test',
            problemColor: 'text-red-500',
            solution: 'Unbegrenzte Creatives für einen festen monatlichen Preis',
            solutionColor: 'text-green-500',
            iconGradient: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
            {/* Subtle Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,31,31,0.05),transparent_50%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 sm:mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Schluss mit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1F1F] to-rose-600">diesen Problemen</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        AdRuby löst die größten Herausforderungen im Performance Marketing
                    </p>
                </div>

                {/* Pain Points Grid */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {painPoints.map((point, index) => (
                        <div
                            key={index}
                            className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${point.iconGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <point.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>

                            {/* Problem */}
                            <div className="mb-6">
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Problem</p>
                                </div>
                                <p className={`text-lg font-bold ${point.problemColor} leading-snug`}>
                                    {point.problem}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center justify-center mb-6">
                                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-2 transition-transform duration-300" />
                            </div>

                            {/* Solution */}
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Unsere Lösung</p>
                                </div>
                                <p className={`text-base font-semibold ${point.solutionColor} leading-snug`}>
                                    {point.solution}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <p className="text-lg text-muted-foreground mb-6">
                        Bereit, diese Probleme zu lösen?
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(200,0,0,0.4)] transition-all transform hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                        Jetzt 7 Tage kostenlos testen
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
