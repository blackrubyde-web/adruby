import { useState, useRef } from 'react';
import {
  Target,
  BarChart3,
  Users,
  Share2,
  Palette,
  Layers,
  MousePointer2,
  Brain,
  Zap,
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { PageContainer } from './design-system';
import { StudioPreview } from './features/previews/StudioPreview';
import { CanvasPreview } from './features/previews/CanvasPreview';
import { AnalyticsPreview } from './features/previews/AnalyticsPreview';
import { MobileStickyCTA } from './landing/MobileStickyCTA';

interface FeaturesPageProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function FeaturesPage({ onNavigate, onSignIn, onGetStarted }: FeaturesPageProps) {
  const [activeTab, setActiveTab] = useState<'studio' | 'canvas' | 'analytics'>('studio');
  const heroRef = useRef<HTMLElement>(null);

  const tabs = [
    { id: 'studio', label: 'Creative Studio', icon: Palette, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'canvas', label: 'Campaign Canvas', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3, color: 'text-green-500', bg: 'bg-green-500/10' },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative">
      <GlobalNav currentPage="features" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-rose-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slower"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              Das mächtigste <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600">
                Ad-Studio der Welt.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Vom ersten Prompt zur perfekten Kampagne in Sekunden. AdRuby vereint generative AI, präzises Targeting und automatische Skalierung in einer Plattform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(200,0,0,0.3)] flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-white" />
                7 Tage kostenlos testen
              </button>
              <button className="px-8 py-4 bg-card/50 backdrop-blur border border-border text-foreground rounded-2xl font-bold text-lg hover:bg-card/80 transition-all">
                Live Demo ansehen
              </button>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-20 relative z-10">
        <PageContainer>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center gap-3 border ${isActive
                    ? 'bg-card border-rose-500/50 shadow-xl scale-105'
                    : 'bg-card/30 border-transparent hover:bg-card/50 text-muted-foreground'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? tab.bg : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                  </div>
                  <span className={isActive ? 'text-foreground' : ''}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview Container */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent rounded-3xl blur-3xl -z-10"></div>

            {/* Transition Groups */}
            <div className="relative min-h-[600px] transition-all duration-500">
              {activeTab === 'studio' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold mb-3">Creative Studio</h3>
                    <p className="text-muted-foreground">Der erste Editor, der mitdenkt. Generiere Bilder, Texte und komplette Layouts mit einem Klick.</p>
                  </div>
                  <StudioPreview />
                </div>
              )}
              {activeTab === 'canvas' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold mb-3">Campaign Canvas</h3>
                    <p className="text-muted-foreground">Visualisiere deine Strategie. Verbinde Zielgruppen, Ads und Budgets per Drag-and-Drop.</p>
                  </div>
                  <CanvasPreview />
                </div>
              )}
              {activeTab === 'analytics' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold mb-3">AI Analytics</h3>
                    <p className="text-muted-foreground">Verstehe nicht nur was passiert, sondern warum. KI-basierte Vorhersagen für maximalen ROAS.</p>
                  </div>
                  <AnalyticsPreview />
                </div>
              )}
            </div>

          </div>
        </PageContainer>
      </section>

      {/* Feature Grid Details */}
      <section className="py-24 bg-card/30 border-t border-white/5">
        <PageContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Features im Detail</h2>
            <p className="text-muted-foreground">Alles was du brauchst in einer Suite.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-rose-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-900/20 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Generation Engine</h3>
              <p className="text-muted-foreground leading-relaxed">
                Erstelle tausende Variationen deiner Ads. Die AI lernt, welche Farben, Hooks und Bilder am besten für deine Brand funktionieren.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Präzises Targeting</h3>
              <p className="text-muted-foreground leading-relaxed">
                Finde deine idealen Kunden automatisch. Unsere Algorithmen analysieren Kaufverhalten und Interessen in Echtzeit.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">1-Click Publish</h3>
              <p className="text-muted-foreground leading-relaxed">
                Veröffentliche Kampagnen direkt auf Meta, TikTok und Google. Kein manuelles Hochladen, keine CSV-Export-Hölle mehr.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Arbeite live mit deinem Team zusammen. Kommentiere Entwürfe, teile Previews und verwalte Zugriffsrechte zentral.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-orange-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto-Optimierung</h3>
              <p className="text-muted-foreground leading-relaxed">
                Setze Regeln für deine Kampagnen. AdRuby stoppt schlechte Ads automatisch und skaliert die Gewinner für dich.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/50 border border-white/5 hover:border-pink-500/30 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-900/20 group-hover:scale-110 transition-transform">
                <MousePointer2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drag & Drop Builder</h3>
              <p className="text-muted-foreground leading-relaxed">
                Der intuitivste Editor am Markt. Baue professionelle Ads ohne Design-Vorkenntnisse, unterstützt von smarten Templates.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-900/5 to-transparent"></div>
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl font-black mb-8">Bereit für das nächste Level?</h2>
            <button
              onClick={onGetStarted}
              className="px-12 py-5 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-xl hover:shadow-[0_0_50px_rgba(200,0,0,0.4)] hover:scale-105 transition-all shadow-2xl"
            >
              Jetzt AdRuby testen
            </button>
            <p className="mt-6 text-muted-foreground">Keine Kreditkarte erforderlich. 7 Tage kostenlos.</p>
          </div>
        </PageContainer>
      </section>

    </div>
  );
}
