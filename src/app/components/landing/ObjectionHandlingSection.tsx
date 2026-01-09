import { useState } from 'react';
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF1F1F]/3 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 sm:mb-20">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Noch <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1F1F] to-rose-600">Fragen?</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Wir beantworten die häufigsten Bedenken unserer Kunden
                    </p>
                </div>

                {/* Objections Accordion */}
                <div className="space-y-4">
                    {objections.map((objection, index) => (
                        <div
                            key={index}
                            className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index
                                    ? 'border-primary shadow-[0_8px_32px_rgba(255,31,31,0.15)]'
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
                                            ? 'from-[#FF1F1F] to-rose-600'
                                            : 'from-muted to-muted-foreground/20'
                                        } flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                                        <objection.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                                        {objection.question}
                                    </h3>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {/* Answer */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                                    <div className="pl-16">
                                        <p className="text-base text-muted-foreground leading-relaxed mb-4">
                                            {objection.answer}
                                        </p>

                                        {/* Stat Badge */}
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border rounded-lg">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {objection.stats.label}:
                                            </span>
                                            <span className={`text-lg font-bold ${objection.stats.color}`}>
                                                {objection.stats.value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 grid sm:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-card border border-border rounded-xl">
                        <div className="text-3xl font-black text-green-500 mb-2">30 Tage</div>
                        <p className="text-sm text-muted-foreground">Geld-zurück-Garantie</p>
                    </div>
                    <div className="text-center p-6 bg-card border border-border rounded-xl">
                        <div className="text-3xl font-black text-blue-500 mb-2">DSGVO</div>
                        <p className="text-sm text-muted-foreground">100% konform</p>
                    </div>
                    <div className="text-center p-6 bg-card border border-border rounded-xl">
                        <div className="text-3xl font-black text-purple-500 mb-2">24/7</div>
                        <p className="text-sm text-muted-foreground">Support verfügbar</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
