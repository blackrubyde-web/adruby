import { GlobalNav } from '../landing/GlobalNav';
import { Footer } from '../Footer';
import { BarChart3, TrendingUp, PieChart, Clock, Bell, Download, CheckCircle, ArrowRight } from 'lucide-react';

interface FeatureAnalyticsProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAnalytics({ onNavigate, onSignIn, onGetStarted }: FeatureAnalyticsProps) {
    const features = [
        { icon: TrendingUp, title: 'Echtzeit-Tracking', desc: 'Sieh Performance-Daten in Echtzeit.' },
        { icon: PieChart, title: 'Detaillierte Aufschlüsselung', desc: 'Analysiere nach Kampagne, Zielgruppe, Creative.' },
        { icon: Clock, title: 'Historische Daten', desc: 'Vergleiche Performance über Zeiträume.' },
        { icon: Bell, title: 'Smart Alerts', desc: 'Werde benachrichtigt bei wichtigen Änderungen.' },
        { icon: Download, title: 'Custom Reports', desc: 'Erstelle und exportiere individuelle Berichte.' },
        { icon: BarChart3, title: 'KPI Dashboard', desc: 'Alle wichtigen Kennzahlen auf einen Blick.' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <GlobalNav currentPage="feature-analytics" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full mb-6">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">Analytics Dashboard</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Datengetriebene
                        <span className="block bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Entscheidungen treffen</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Verstehe was funktioniert und was nicht. Unser Analytics Dashboard
                        zeigt dir alle wichtigen Metriken auf einen Blick.
                    </p>

                    <button onClick={onGetStarted} className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all">
                        Jetzt kostenlos testen <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Alle Daten die du brauchst</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="p-6 bg-card rounded-2xl border border-border/50 hover:border-green-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-green-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Starte mit datengetriebenen Entscheidungen</h2>
                    <button onClick={onGetStarted} className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
                        Kostenlos starten
                    </button>
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
                        {['Meta Ads Integration', 'Automatische Reports', 'Trend-Erkennung'].map((item) => (
                            <div key={item} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{item}</div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
