import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Users, Zap, Shield, TrendingUp } from 'lucide-react';

export function ObjectionHandlingSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const objections = [
        {
            icon: Sparkles,
            question: 'Kann die KI wirklich gute Ads erstellen?',
            answer: 'Absolut! Unsere KI wurde auf über 100.000 erfolgreichen Meta Ads trainiert. Im Durchschnitt performen KI-generierte Ads 34% besser als manuell erstellte Ads. Die KI analysiert deine Marke, Zielgruppe und Wettbewerber, um Ads zu erstellen, die nachweislich konvertieren.',
            stats: { label: 'Performance-Steigerung', value: '+34%', color: 'text-green-500' },
        },
        {
            icon: Zap,
            question: 'Ist das nicht zu kompliziert?',
            answer: 'Im Gegenteil – AdRuby ist einfacher als jedes andere Ad-Tool. Du beschreibst dein Produkt in 2-3 Sätzen, lädst ein Produktbild hoch, und unsere KI erledigt den Rest. Keine komplizierten Einstellungen, keine Design-Kenntnisse nötig. Die meisten Nutzer erstellen ihre erste Ad in unter 3 Minuten.',
            stats: { label: 'Durchschnittliche Zeit', value: '<3 Min', color: 'text-blue-500' },
        },
        {
            icon: Users,
            question: 'Was wenn die Ads nicht zu meiner Marke passen?',
            answer: 'Du hast volle Kontrolle! Definiere deine Brand Guidelines (Farben, Schriftarten, Tonalität) einmalig, und die KI hält sich strikt daran. Jede generierte Ad kann im Editor angepasst werden. Du kannst auch eigene Vorlagen hochladen, die die KI als Basis nutzt.',
            stats: { label: 'Brand Accuracy', value: '98%', color: 'text-purple-500' },
        },
        {
            icon: TrendingUp,
            question: 'Ist es das Geld wert?',
            answer: 'Definitiv! Unsere Kunden sparen durchschnittlich 25 Stunden pro Monat bei der Ad-Erstellung und steigern ihren ROAS um 3-5x. Wenn du aktuell eine Agentur oder Designer bezahlst, sparst du mit AdRuby bis zu 90% der Kosten. Plus: 7 Tage kostenlos testen, kein Risiko.',
            stats: { label: 'Durchschn. ROAS-Steigerung', value: '3-5x', color: 'text-green-500' },
        },
        {
            icon: Shield,
            question: 'Wie sicher sind meine Daten?',
            answer: 'Höchste Sicherheit garantiert! Wir sind DSGVO-konform, alle Daten werden in Europa gehostet und verschlüsselt gespeichert. Deine Creatives und Kampagnendaten gehören dir – wir nutzen sie niemals für Training oder andere Zwecke ohne deine explizite Zustimmung.',
            stats: { label: 'Sicherheitsstandard', value: 'DSGVO', color: 'text-blue-500' },
        },
    ];

    return (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E63946]/3 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-16 sm:mb-20"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
                        Noch <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-600">Fragen?</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Wir beantworten die häufigsten Bedenken unserer Kunden
                    </p>
                </motion.div>

                {/* Objections Accordion — Motion AnimatePresence */}
                <div className="space-y-4">
                    {objections.map((objection, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: index * 0.06, duration: 0.5 }}
                            className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index
                                ? 'border-primary/50 shadow-[0_8px_32px_rgba(230,57,70,0.12)]'
                                : 'border-border hover:border-border/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                                }`}
                        >
                            {/* Question */}
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${openIndex === index
                                        ? 'from-[#E63946] to-rose-600'
                                        : 'from-muted to-muted-foreground/20'
                                        } flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                                        <objection.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                                        {objection.question}
                                    </h3>
                                </div>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="flex-shrink-0"
                                >
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                </motion.div>
                            </button>

                            {/* Answer — AnimatePresence height animation */}
                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                                            <div className="pl-16">
                                                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                                                    {objection.answer}
                                                </p>

                                                {/* Stat Badge — slides in */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.15, duration: 0.4 }}
                                                    className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border rounded-lg"
                                                >
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {objection.stats.label}:
                                                    </span>
                                                    <span className={`text-lg font-bold ${objection.stats.color}`}>
                                                        {objection.stats.value}
                                                    </span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Indicators — staggered entrance */}
                <motion.div
                    className="mt-16 grid sm:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {[
                        { value: '30 Tage', label: 'Geld-zurück-Garantie', color: 'text-green-500' },
                        { value: 'DSGVO', label: '100% konform', color: 'text-blue-500' },
                        { value: '24/7', label: 'Support verfügbar', color: 'text-purple-500' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 16 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                            }}
                            className="text-center p-6 bg-card border border-border rounded-xl"
                        >
                            <div className={`text-3xl font-black ${item.color} mb-2 font-display`}>{item.value}</div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
