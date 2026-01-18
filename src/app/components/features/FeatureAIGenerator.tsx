import { GlobalNav } from '../landing/GlobalNav';
import { Footer } from '../Footer';
import { Sparkles, Wand2, Target, Zap, CheckCircle, ArrowRight, Bot, Palette, Languages } from 'lucide-react';

interface FeatureAIGeneratorProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAIGenerator({ onNavigate, onSignIn, onGetStarted }: FeatureAIGeneratorProps) {
    const capabilities = [
        {
            icon: Wand2,
            title: 'One-Click Generation',
            description: 'Erstelle komplette Anzeigen mit einem Klick basierend auf deinem Produkt.',
        },
        {
            icon: Target,
            title: 'Zielgruppen-Optimierung',
            description: 'KI analysiert deine Zielgruppe und erstellt passende Creatives.',
        },
        {
            icon: Palette,
            title: 'Marken-Konsistenz',
            description: 'Behalte deine Markenidentität in jeder generierten Anzeige.',
        },
        {
            icon: Languages,
            title: 'Multi-Language',
            description: 'Generiere Ads in Deutsch, Englisch und weiteren Sprachen.',
        },
        {
            icon: Bot,
            title: 'Smart Copy',
            description: 'KI-generierte Headlines, CTAs und Beschreibungen die konvertieren.',
        },
        {
            icon: Zap,
            title: 'Blitzschnell',
            description: 'Von der Idee zur fertigen Anzeige in unter 60 Sekunden.',
        },
    ];

    return (
        <div className="landing-theme-root min-h-screen bg-black text-white">
            <GlobalNav
                currentPage="feature-ai-generator"
                onNavigate={onNavigate}
                onSignIn={onSignIn}
                onGetStarted={onGetStarted}
            />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-purple-500">AI Ad Generator</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        High-Converting Ads
                        <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            mit KI-Power
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Lade dein Produktbild hoch, beschreibe dein Angebot – und unsere KI erstellt
                        professionelle Meta-Ads die verkaufen. Ohne Design-Skills nötig.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onGetStarted}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all"
                        >
                            Jetzt kostenlos testen
                            <ArrowRight className="inline-block ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section className="py-20 px-4 bg-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Was unser AI Generator kann</h2>
                    <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
                        Modernste KI-Technologie trifft auf Marketing-Expertise
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capabilities.map((cap, i) => {
                            const Icon = cap.icon;
                            return (
                                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{cap.title}</h3>
                                    <p className="text-white/60 text-sm">{cap.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-12">So einfach geht's</h2>

                    <div className="space-y-8">
                        {[
                            { step: 1, title: 'Produkt hochladen', desc: 'Lade dein Produktbild hoch oder gib eine URL ein.' },
                            { step: 2, title: 'Details beschreiben', desc: 'Beschreibe dein Produkt, Zielgruppe und Angebot.' },
                            { step: 3, title: 'KI generiert', desc: 'Unsere KI erstellt professionelle Ad Creatives.' },
                            { step: 4, title: 'Anpassen & Nutzen', desc: 'Bearbeite bei Bedarf und exportiere für Meta Ads.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                    <p className="text-white/60">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">
                        Bereit, deine Ads auf das nächste Level zu bringen?
                    </h2>
                    <p className="text-white/60 text-lg mb-8">
                        Starte jetzt mit 7 Tagen kostenlosem Zugang zu allen Features.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                    >
                        Kostenlos starten
                    </button>

                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60">
                        {['Keine Kreditkarte nötig', 'Jederzeit kündbar', '100+ Vorlagen'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
