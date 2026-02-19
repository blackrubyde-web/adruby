import { motion } from 'motion/react';
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(230,57,70,0.05),transparent_50%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-16 sm:mb-20"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
                        Schluss mit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-600">diesen Problemen</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        AdRuby löst die größten Herausforderungen im Performance Marketing
                    </p>
                </motion.div>

                {/* Pain Points Grid — staggered */}
                <motion.div
                    className="grid md:grid-cols-2 gap-6 sm:gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                >
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 24 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
                            }}
                            className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${point.iconGradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
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

                            {/* Arrow — animates on hover */}
                            <div className="flex items-center justify-center mb-6">
                                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-2 group-hover:text-green-500 transition-all duration-300" />
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
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <p className="text-lg text-muted-foreground mb-6">
                        Bereit, diese Probleme zu lösen?
                    </p>
                    <motion.button
                        className="px-8 py-4 bg-gradient-to-r from-[#c01830] via-rose-600 to-red-600 text-white rounded-full font-bold text-lg inline-flex items-center gap-2 relative overflow-hidden"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(230,57,70,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
                        <span className="relative z-10 flex items-center gap-2">
                            Jetzt 7 Tage kostenlos testen
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
