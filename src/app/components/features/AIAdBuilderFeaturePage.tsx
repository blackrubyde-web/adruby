import { ArrowRight, Zap, Sparkles, Brain, Target, Eye, LineChart, Rocket, CheckCircle, Play } from 'lucide-react';
import { GlobalNav } from '../landing/GlobalNav';
import { MobileStickyCTA } from '../landing/MobileStickyCTA';

interface AIAdBuilderFeaturePageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onNavigateHome: () => void;
}

export function AIAdBuilderFeaturePage({ onGetStarted, onLogin, onNavigateHome }: AIAdBuilderFeaturePageProps) {
    const pipelineSteps = [
        { id: 1, title: 'Strategie', desc: 'Deep-Dive in dein Business, Zielgruppe und Wettbewerb', icon: Target, color: 'from-blue-500 to-cyan-500' },
        { id: 2, title: 'Brand Tokens', desc: 'Extraktion deiner einzigartigen Brand DNA', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
        { id: 3, title: 'Hook Psychologie', desc: 'Trigger-Worte und emotionale Anker finden', icon: Brain, color: 'from-purple-500 to-pink-500' },
        { id: 4, title: 'Bild-Cutout', desc: 'Automatische Produktfreistellung mit WASM', icon: Eye, color: 'from-pink-500 to-rose-500' },
        { id: 5, title: 'Szene Komposition', desc: 'KI generiert perfekte Hintergründe', icon: Zap, color: 'from-yellow-500 to-orange-500' },
        { id: 6, title: 'Stil-Varianten', desc: 'Mehrere Designs für A/B Testing', icon: Rocket, color: 'from-green-500 to-emerald-500' },
        { id: 7, title: 'ROAS Prognose', desc: 'Vorhersage der Performance vor Launch', icon: LineChart, color: 'from-teal-500 to-cyan-500' },
        { id: 8, title: 'Export & Publish', desc: 'Direkt in Meta Ads Manager pushen', icon: ArrowRight, color: 'from-[#FF1F1F] to-rose-600' },
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
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#FF1F1F]/20 to-transparent blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF1F1F]/10 border border-[#FF1F1F]/20 mb-6">
                        <Sparkles className="w-4 h-4 text-[#FF1F1F]" />
                        <span className="text-sm font-semibold text-[#FF1F1F]">KI-Power Feature</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        AI Ad Builder
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
                        Von der Idee zur fertigen Ad in <span className="text-white font-semibold">unter 2 Minuten</span>.
                        Unsere 8-Schritte KI-Pipeline analysiert, generiert und optimiert.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-gradient-to-r from-[#FF1F1F] to-rose-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,31,31,0.5)] transition-all flex items-center gap-3"
                        >
                            <Rocket className="w-5 h-5" />
                            Jetzt kostenlos testen
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group px-8 py-4 bg-white/5 border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                            <Play className="w-5 h-5" />
                            Demo ansehen
                        </button>
                    </div>
                </div>
            </section>

            {/* 8-Step Pipeline */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-black mb-4">
                            Die 8-Schritte <span className="text-[#FF1F1F]">KI-Pipeline</span>
                        </h2>
                        <p className="text-lg text-white/50">
                            Jeder Schritt ist für maximale Performance optimiert
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pipelineSteps.map((step) => (
                            <div
                                key={step.id}
                                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">
                                    Schritt {step.id}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-white/50">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-6 bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Warum AdRuby AI?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: '10x Schneller',
                                desc: 'Was früher Stunden dauerte, erledigt die KI in unter 2 Minuten.',
                                stat: '2 min',
                            },
                            {
                                title: 'Höhere Performance',
                                desc: 'KI-optimierte Ads performen im Schnitt 3.2x besser.',
                                stat: '3.2x',
                            },
                            {
                                title: 'Unbegrenzte Varianten',
                                desc: 'Teste mehr Hypothesen mit automatisch generierten Varianten.',
                                stat: '∞',
                            },
                        ].map((benefit, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl font-black text-[#FF1F1F] mb-4">{benefit.stat}</div>
                                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                                <p className="text-white/50">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-t from-black to-zinc-900">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-black mb-6">
                        Bereit für bessere Ads?
                    </h2>
                    <p className="text-lg text-white/60 mb-8">
                        Starte jetzt mit 7 Tagen kostenlosem Zugang. Keine Kreditkarte erforderlich.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                        {['7 Tage kostenlos', 'Keine Kreditkarte', 'Jederzeit kündbar'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/60">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-gradient-to-r from-[#FF1F1F] to-rose-600 text-white rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(255,31,31,0.5)] transition-all"
                    >
                        Kostenlos starten →
                    </button>
                </div>
            </section>
        </div>
    );
}
