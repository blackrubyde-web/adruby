import { ArrowRight, Link2, RefreshCw, Upload, Shield, Zap, BarChart3, CheckCircle, Play, Facebook } from 'lucide-react';
import { GlobalNav } from '../landing/GlobalNav';
import { MobileStickyCTA } from '../landing/MobileStickyCTA';

interface MetaIntegrationFeaturePageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onNavigateHome: () => void;
}

export function MetaIntegrationFeaturePage({ onGetStarted, onLogin, onNavigateHome }: MetaIntegrationFeaturePageProps) {
    const steps = [
        {
            step: '1',
            title: 'Verbinden',
            desc: 'Ein Klick auf "Connect with Facebook" – fertig.',
            icon: Link2,
        },
        {
            step: '2',
            title: 'Synchronisieren',
            desc: 'Kampagnen, Adsets und Ads werden automatisch importiert.',
            icon: RefreshCw,
        },
        {
            step: '3',
            title: 'Erstellen & Publizieren',
            desc: 'Neue Ads direkt in den Ads Manager pushen.',
            icon: Upload,
        },
    ];

    const features = [
        {
            icon: Zap,
            title: '1-Click Sync',
            desc: 'Alle Kampagnendaten in Sekunden synchronisiert.',
        },
        {
            icon: Upload,
            title: 'Direkter Export',
            desc: 'Creatives direkt in Meta Ads Manager hochladen.',
        },
        {
            icon: BarChart3,
            title: 'Live Metriken',
            desc: 'Echtzeit Performance-Daten aus deinem Ad Account.',
        },
        {
            icon: Shield,
            title: 'Nur Lesezugriff',
            desc: 'Wir ändern nichts ohne deine explizite Erlaubnis.',
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
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/20 to-transparent blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 mb-6">
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                        <span className="text-sm font-semibold text-[#1877F2]">Integration Feature</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        Meta Ads Integration
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
                        Nahtlose Verbindung zu <span className="text-white font-semibold">Facebook & Instagram Ads</span>.
                        Importiere, analysiere und publiziere – alles aus einer Oberfläche.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-[#1877F2] text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(24,119,242,0.5)] transition-all flex items-center gap-3"
                        >
                            <Facebook className="w-5 h-5" />
                            Mit Facebook verbinden
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group px-8 py-4 bg-white/5 border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                            <Play className="w-5 h-5" />
                            Demo ansehen
                        </button>
                    </div>
                </div>
            </section>

            {/* 3-Step Process */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-black mb-4">
                            In 3 Schritten verbunden
                        </h2>
                        <p className="text-lg text-white/50">
                            Setup in unter 60 Sekunden
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#1877F2] to-blue-700 flex items-center justify-center shadow-xl">
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-xs font-bold text-[#1877F2] mb-2">SCHRITT {step.step}</div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-white/50">{step.desc}</p>

                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                                        <ArrowRight className="w-6 h-6 text-white/20" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Was du bekommst
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1877F2] to-blue-700 flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                                    <p className="text-sm text-white/50">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-zinc-900 to-black">
                <div className="max-w-4xl mx-auto text-center">
                    <Shield className="w-16 h-16 text-[#1877F2] mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-black mb-4">
                        Sicherheit hat Priorität
                    </h2>
                    <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
                        Wir verwenden OAuth 2.0 und speichern niemals dein Facebook-Passwort.
                        Du behältst jederzeit die volle Kontrolle.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {['OAuth 2.0 verschlüsselt', 'Nur Lesezugriff', 'Jederzeit widerrufbar', 'DSGVO-konform'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/60">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-black">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-black mb-6">
                        Verbinde jetzt deinen Meta Account
                    </h2>
                    <p className="text-lg text-white/60 mb-8">
                        Kostenlos starten – keine Kreditkarte erforderlich.
                    </p>

                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-[#1877F2] text-white rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(24,119,242,0.5)] transition-all flex items-center gap-3 mx-auto"
                    >
                        <Facebook className="w-6 h-6" />
                        Mit Facebook starten →
                    </button>
                </div>
            </section>
        </div>
    );
}
