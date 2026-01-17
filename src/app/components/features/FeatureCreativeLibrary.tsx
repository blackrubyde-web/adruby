import { GlobalNav } from '../landing/GlobalNav';
import { Footer } from '../Footer';
import { Image, FolderOpen, Search, Download, Tags, Grid3X3, CheckCircle, ArrowRight } from 'lucide-react';

interface FeatureCreativeLibraryProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureCreativeLibrary({ onNavigate, onSignIn, onGetStarted }: FeatureCreativeLibraryProps) {
    const features = [
        { icon: FolderOpen, title: 'Intelligente Organisation', desc: 'Automatische Kategorisierung deiner Creatives.' },
        { icon: Search, title: 'Sofortige Suche', desc: 'Finde jedes Creative in Sekunden.' },
        { icon: Tags, title: 'Smart Tags', desc: 'KI-generierte Tags für bessere Auffindbarkeit.' },
        { icon: Grid3X3, title: 'Übersichtliche Galerie', desc: 'Alle Creatives auf einen Blick.' },
        { icon: Download, title: 'Bulk Export', desc: 'Exportiere mehrere Creatives gleichzeitig.' },
        { icon: Image, title: 'Format-Varianten', desc: 'Ein Creative, alle Formate.' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <GlobalNav currentPage="feature-creative-library" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-6">
                        <Image className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-500">Creative Library</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Deine Creatives,
                        <span className="block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">perfekt organisiert</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Speichere, organisiere und finde alle deine Ad Creatives an einem Ort.
                        Nie wieder Zeit mit Suchen verschwenden.
                    </p>

                    <button onClick={onGetStarted} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all">
                        Jetzt kostenlos testen <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-12">Alles was du brauchst</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="p-6 bg-card rounded-2xl border border-border/50 hover:border-blue-500/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">Starte mit deiner Creative Library</h2>
                    <button onClick={onGetStarted} className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
                        Kostenlos starten
                    </button>
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
                        {['Unbegrenzter Speicher', 'KI-Organisation', 'Team-Sharing'].map((item) => (
                            <div key={item} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{item}</div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
