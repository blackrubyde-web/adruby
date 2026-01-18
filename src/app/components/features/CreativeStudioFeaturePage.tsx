import { ArrowRight, Palette, Layers, Image, Wand2, Layout, Grid3X3, Download, CheckCircle, Sparkles, Play } from 'lucide-react';
import { GlobalNav } from '../landing/GlobalNav';
import { MobileStickyCTA } from '../landing/MobileStickyCTA';

interface CreativeStudioFeaturePageProps {
    onGetStarted: () => void;
    onLogin: () => void;
    onNavigateHome: () => void;
}

export function CreativeStudioFeaturePage({ onGetStarted, onLogin, onNavigateHome }: CreativeStudioFeaturePageProps) {
    const features = [
        {
            icon: Layers,
            title: '50+ Premium Templates',
            desc: 'Professionelle Vorlagen für jede Branche und jeden Anlass.',
        },
        {
            icon: Wand2,
            title: 'Drag & Drop Editor',
            desc: 'Intuitive Bearbeitung ohne Design-Kenntnisse.',
        },
        {
            icon: Image,
            title: 'Smart Background Removal',
            desc: 'Automatische Produktfreistellung in Sekunden.',
        },
        {
            icon: Palette,
            title: 'Brand Kit Integration',
            desc: 'Deine Farben, Fonts und Logos automatisch eingebunden.',
        },
        {
            icon: Layout,
            title: 'Multi-Format Export',
            desc: 'Ein Design, alle Formate: Story, Feed, Carousel.',
        },
        {
            icon: Grid3X3,
            title: 'Varianten Generator',
            desc: 'Automatisch mehrere Versionen für A/B Testing.',
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
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/20 to-transparent blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                        <Palette className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Design Feature</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        Creative Studio
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
                        Der All-in-One Editor für <span className="text-white font-semibold">High-Converting Creatives</span>.
                        Premium Templates, Smart Tools, perfekte Ergebnisse.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center gap-3"
                        >
                            <Sparkles className="w-5 h-5" />
                            Studio öffnen
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="group px-8 py-4 bg-white/5 border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                            <Play className="w-5 h-5" />
                            Tutorial ansehen
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-black mb-4">
                            Alles was du brauchst
                        </h2>
                        <p className="text-lg text-white/50">
                            Professionelle Tools für beeindruckende Creatives
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/50">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Template Preview */}
            <section className="py-20 px-6 bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Premium Template Library
                        </h2>
                        <p className="text-lg text-white/50">
                            Professionelle Vorlagen für jede Branche
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['E-Commerce', 'SaaS', 'Coaching', 'Local', 'Agency', 'Fashion', 'Food', 'Tech'].map((category, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-white/10 rounded-xl flex items-center justify-center hover:border-purple-500/50 transition-all cursor-pointer group"
                            >
                                <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Export Options */}
            <section className="py-20 px-6 bg-gradient-to-t from-black to-zinc-900">
                <div className="max-w-4xl mx-auto text-center">
                    <Download className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-black mb-4">
                        Export in alle Formate
                    </h2>
                    <p className="text-lg text-white/60 mb-8">
                        Ein Design, automatisch angepasst für alle Plattformen
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {['1080x1080 Feed', '1080x1920 Story', '1200x628 Link', '1080x1350 Portrait'].map((format, i) => (
                            <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">
                                {format}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                        {['PNG Export', 'JPG Export', 'Meta API Push'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/60">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all"
                    >
                        Jetzt ausprobieren →
                    </button>
                </div>
            </section>
        </div>
    );
}
