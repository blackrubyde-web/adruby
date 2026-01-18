import { GlobalNav } from '../landing/GlobalNav';
import { Footer } from '../Footer';
import { Rocket, Target, Users, Palette, BarChart3, Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface FeatureCampaignBuilderProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureCampaignBuilder({ onNavigate, onSignIn, onGetStarted }: FeatureCampaignBuilderProps) {
    const features = [
        { icon: Target, title: 'Ziel-Auswahl', desc: 'Wähle dein Kampagnenziel und wir optimieren alles darauf.' },
        { icon: Users, title: 'Audience Builder', desc: 'Definiere deine Zielgruppe mit wenigen Klicks.' },
        { icon: Palette, title: 'Creative Integration', desc: 'Wähle aus deiner Library oder generiere neue.' },
        { icon: BarChart3, title: 'Budget-Optimierung', desc: 'Intelligente Budgetverteilung für maximalen ROI.' },
        { icon: Zap, title: 'Quick Launch', desc: 'Von der Idee zur Live-Kampagne in Minuten.' },
        { icon: Rocket, title: 'A/B Testing', desc: 'Teste verschiedene Varianten automatisch.' },
    ];

    return (
        <div className="landing-theme-root min-h-screen bg-black text-white">
            <GlobalNav currentPage="feature-campaign-builder" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full mb-6">
                        <Rocket className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-500">Campaign Builder</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Kampagnen erstellen
                        <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">war nie einfacher</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
                        Unser Schritt-für-Schritt Builder führt dich durch den gesamten Prozess.
                        Von der Zielauswahl bis zum Launch.
                    </p>

                    <button onClick={onGetStarted} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all">
                        Jetzt kostenlos testen <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 px-4 bg-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Der intelligente Weg zu erfolgreichen Kampagnen</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-white/60 text-sm">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Baue deine erste Kampagne heute</h2>
                    <button onClick={onGetStarted} className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
                        Kostenlos starten
                    </button>
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60">
                        {['Geführter Wizard', 'Best Practices integriert', 'Vorlagen inklusive'].map((item) => (
                            <div key={item} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{item}</div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
