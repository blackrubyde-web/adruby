import { GlobalNav } from '../landing/GlobalNav';
import { Footer } from '../Footer';
import { Brain, Lightbulb, Target, TrendingUp, MessageSquare, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

interface FeatureAIAnalysisProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAIAnalysis({ onNavigate, onSignIn, onGetStarted }: FeatureAIAnalysisProps) {
    const features = [
        { icon: Lightbulb, title: 'Actionable Insights', desc: 'KI erkennt Optimierungspotenziale automatisch.' },
        { icon: Target, title: 'Zielgruppen-Analyse', desc: 'Verstehe deine beste Audience.' },
        { icon: TrendingUp, title: 'Trend-Vorhersage', desc: 'Antizipiere Markttrends bevor sie passieren.' },
        { icon: MessageSquare, title: 'Copy Analyse', desc: 'Lerne welche Texte am besten konvertieren.' },
        { icon: Sparkles, title: 'Creative Scoring', desc: 'KI bewertet deine Creatives vor dem Launch.' },
        { icon: Brain, title: 'Wettbewerbs-Analyse', desc: 'Verstehe was deine Konkurrenz macht.' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <GlobalNav currentPage="feature-ai-analysis" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full mb-6">
                        <Brain className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-rose-500">AI Analysis</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        KI-gestützte Insights
                        <span className="block bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent">für bessere Ergebnisse</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Unsere KI analysiert deine Kampagnen und gibt dir konkrete
                        Empfehlungen zur Optimierung. Datenbasiert, nicht geraten.
                    </p>

                    <button onClick={onGetStarted} className="px-8 py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-rose-500/25 transition-all">
                        Jetzt kostenlos testen <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Intelligenz die Resultate liefert</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="p-6 bg-card rounded-2xl border border-border/50 hover:border-rose-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-gradient-to-br from-rose-500/10 to-red-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Nutze KI für deine Optimierung</h2>
                    <button onClick={onGetStarted} className="px-10 py-5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
                        Kostenlos starten
                    </button>
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
                        {['Automatische Analyse', 'Konkrete Empfehlungen', 'ROI Prognose'].map((item) => (
                            <div key={item} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{item}</div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
