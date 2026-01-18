import { ArrowRight, Brain, TrendingUp, LineChart, BarChart3, Zap, Bell, Target, CheckCircle, Sparkles, Play, Bot } from 'lucide-react';
import { GlobalNav } from '../landing/GlobalNav';
import { MobileStickyCTA } from '../landing/MobileStickyCTA';

interface AnalyticsFeaturePageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onNavigateHome: () => void;
}

export function AnalyticsFeaturePage({ onGetStarted, onLogin, onNavigateHome }: AnalyticsFeaturePageProps) {
    const features = [
        {
            icon: Brain,
            title: 'KI-Analyse',
            desc: 'GPT-4 Vision analysiert jeden Creative und gibt Verbesserungsvorschläge.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: TrendingUp,
            title: 'Trend Detection',
            desc: 'Automatische Erkennung von Performance-Veränderungen.',
            color: 'from-emerald-500 to-green-500',
        },
        {
            icon: Zap,
            title: 'Autopilot Mode',
            desc: 'Automatische Optimierungen auf Basis von KI-Empfehlungen.',
            color: 'from-yellow-500 to-orange-500',
        },
        {
            icon: Bell,
            title: 'Smart Alerts',
            desc: 'Echtzeit-Benachrichtigungen bei wichtigen Änderungen.',
            color: 'from-red-500 to-rose-500',
        },
        {
            icon: BarChart3,
            title: 'Unified Dashboard',
            desc: 'Alle Metriken an einem Ort, klar visualisiert.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Target,
            title: 'Performance Scoring',
            desc: 'KI-Score für jeden Creative mit Benchmark-Vergleich.',
            color: 'from-indigo-500 to-blue-500',
        },
    ];

    return (
        <div className="landing-theme-root min-h-screen bg-black text-white">
            <GlobalNav
                currentPage="features"
                onNavigate={onNavigateHome}
                onSignIn={onLogin}
                onGetStarted={onGetStarted}
            />
            <MobileStickyCTA onGetStarted={onGetStarted} />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-emerald-500/20 to-transparent blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <Brain className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Intelligence Feature</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        AI Analytics & Autopilot
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
                        Dein <span className="text-white font-semibold">KI-Copilot</span> für datengetriebene Entscheidungen.
                        Analyse, Insights und automatische Optimierung in einem.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3"
                        >
                            <Bot className="w-5 h-5" />
                            Autopilot aktivieren
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group px-8 py-4 bg-white/5 border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                            <Play className="w-5 h-5" />
                            Demo ansehen
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-black mb-4">
                            KI-gestützte <span className="text-emerald-400">Insights</span>
                        </h2>
                        <p className="text-lg text-white/50">
                            Verstehe deine Performance auf einem neuen Level
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/50">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Autopilot Section */}
            <section className="py-20 px-6 bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-400">AUTOPILOT MODE</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">
                                Lass die KI für dich optimieren
                            </h2>
                            <p className="text-lg text-white/60 mb-6">
                                Autopilot analysiert deine Kampagnen in Echtzeit und führt automatisch Optimierungen durch –
                                basierend auf Machine Learning und deinen Zielen.
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Budget-Rebalancing zwischen Kampagnen',
                                    'Automatisches Pausieren von Underperformern',
                                    'Creative Rotation für maximale Frische',
                                    'Bid-Adjustments basierend auf Performance',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span className="text-white/80">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-semibold text-emerald-400">Autopilot Active</span>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white/60">Heute optimiert</span>
                                        <span className="text-lg font-bold text-white">12 Actions</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white/60">Gesparte Zeit</span>
                                        <span className="text-lg font-bold text-emerald-400">4.2 Stunden</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white/60">ROAS Improvement</span>
                                        <span className="text-lg font-bold text-emerald-400">+23%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-t from-black to-zinc-900">
                <div className="max-w-3xl mx-auto text-center">
                    <LineChart className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-black mb-6">
                        Datengetrieben zum Erfolg
                    </h2>
                    <p className="text-lg text-white/60 mb-8">
                        Aktiviere jetzt KI-Analytics und Autopilot für deine Kampagnen.
                    </p>

                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all"
                    >
                        Kostenlos starten →
                    </button>
                </div>
            </section>
        </div>
    );
}
