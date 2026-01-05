```javascript
import { useState, useRef } from 'react';
import {
  Zap,
  Layout,
  BarChart,
  Grid,
  CheckCircle,
  Megaphone,
  Box,
  Palette,
  Image as ImageIcon // Alias to avoid conflict if any, though not strictly needed
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const tabs = [
    { id: 'studio', label: 'Creative Studio', icon: Palette, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'canvas', label: 'Campaign Canvas', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3, color: 'text-green-500', bg: 'bg-green-500/10' },
  ] as const;

  // Spotlight Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", x + "px");
    target.style.setProperty("--mouse-y", y + "px");
  };

  return (
    <div className="landing-theme-root min-h-screen bg-black font-sans text-foreground overflow-x-hidden selection:bg-rose-500/30">
      <GlobalNav
        currentPage="features"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* Background Ambience (Aurora) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-rose-600/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slower mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-32 pb-20 sm:pt-48 sm:pb-32">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in zoom-in duration-1000 delay-200">
              <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500/20 animate-pulse" />
              <span className="text-sm font-medium text-white/80">Next Gen Creative Suite</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
              Das mächtigste <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 animate-gradient-x">
                Ad-Studio der Welt.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Vom ersten Prompt zur perfekten Kampagne in Sekunden. AdRuby vereint generative AI, präzises Targeting und automatische Skalierung.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Kostenlos starten
                </span>
              </button>

              <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:border-white/20">
                Live Demo ansehen
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-24 relative z-10">
        <div className="landing-container">

          {/* Tabs */}
          <div className="flex justify-center mb-16 overflow-x-auto pb-4 sm:pb-0 no-scrollbar">
            <div className="flex p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px - 6 sm: px - 8 py - 3 rounded - full font - bold text - sm sm: text - base transition - all duration - 500 flex items - center gap - 2 ${
  isActive ? 'text-black shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'text-white/60 hover:text-white'
} `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white rounded-full layout-id-active-tab" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w - 4 h - 4 ${ isActive ? 'text-black' : 'text-current' } `} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-[600px] transition-all duration-500">
            {/* Studio Tab - Bento Grid */}
            {activeTab === 'studio' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

                {/* Main Preview Feature */}
                <div
                  className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-white/20"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-20" />

                  <div className="relative z-10 h-full flex flex-col justify-end p-8">
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <Palette className="w-3 h-3" /> Core Engine
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Infinite Creative Studio</h3>
                    <p className="text-white/60 max-w-lg">
                      Der erste Editor, der mitdenkt. Generiere tausende Variationen, bearbeite Ebenen per Drag & Drop und nutze AI für Texte, Bilder und Layouts.
                    </p>
                  </div>

                  {/* Live Component Preview */}
                  <div className="absolute inset-0 z-0">
                    <div className="scale-[0.8] origin-top-left w-[125%] h-[125%] -mt-10 -ml-10 opacity-60 grayscale-[30%] group-hover:grayscale-0 group-hover:scale-[0.85] transition-all duration-700">
                      <StudioPreview />
                    </div>
                  </div>
                </div>

                {/* Secondary Feature Cards */}
                <div
                  className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-white/20 transition-all"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">AI Brain</h4>
                  <p className="text-white/60 leading-relaxed">
                    Analysiert deine Brand-Voice und generiert Copy, die wirklich konvertiert. Kein "ChatGPT-Deutsch", sondern verkaufspsychologisch optimiert.
                  </p>
                </div>

                <div
                  className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-white/20 transition-all"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">Auto-Resize</h4>
                  <p className="text-white/60 leading-relaxed">
                    Ein Klick für alle Formate. 9:16 für Reels, 1:1 für Feed, 4:5 für Story. Alles perfekt angepasst und smart beschnitten.
                  </p>
                </div>

                <div
                  className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-white/20"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="grid md:grid-cols-2 h-full">
                    <div className="p-8 flex flex-col justify-center">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3">Smart Assets</h4>
                      <p className="text-white/60 leading-relaxed mb-6">
                        Lade deine Produktbilder hoch. AdRuby entfernt Hintergründe, verbessert die Qualität und platziert sie in high-performer Szenen.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded bg-white/10 text-xs text-white/80 border border-white/10">Background Removal</span>
                        <span className="px-3 py-1 rounded bg-white/10 text-xs text-white/80 border border-white/10">Upscaling</span>
                      </div>
                    </div>
                    <div className="relative min-h-[300px] md:min-h-auto bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center p-8">
                      {/* Abstract Visual Representation */}
                      <div className="relative w-full max-w-[200px] aspect-square">
                        <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-pulse-slow" />
                        <div className="relative z-10 w-full h-full border border-white/20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center">
                          <span className="text-4xl">👟</span>
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg border border-white/20 animate-bounce">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Canvas Tab */}
            {activeTab === 'canvas' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div
                  className="md:col-span-12 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl min-h-[500px] transition-all hover:border-white/20"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                  <div className="relative z-20 h-full flex flex-col justify-end p-10">
                    <h3 className="text-3xl font-bold text-white mb-4">Strategic Campaign Canvas</h3>
                    <p className="text-white/60 max-w-2xl text-lg">
                      Plane deine komplette Funnel-Strategie visuell. Verbinde Creatives, Zielgruppen und Budgets per Drag & Drop zu einer kohärenten Kampagne.
                    </p>
                  </div>

                  <div className="absolute inset-0 z-0 opacity-80 group-hover:scale-[1.02] transition-transform duration-700">
                    <CanvasPreview />
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div
                  className="md:col-span-7 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-white/20 transition-all"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider">
                    <BarChart3 className="w-3 h-3" /> Predictive AI
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Wisse was funktioniert,<br />bevor du Geld ausgibst.</h3>
                  <p className="text-white/60 mb-8 leading-relaxed">
                    Unsere AI analysiert deine Creatives auf Basis von Millionen erfolgreicher Ads. Du bekommst einen Score von 0-100 und konkrete Verbesserungsvorschläge.
                  </p>
                  <div className="w-full h-[200px] rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="text-5xl font-black text-white/90 z-10">9.4/10</div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                  </div>
                </div>

                <div
                  className="md:col-span-5 group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-white/20"
                  onMouseMove={handleMouseMove}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute inset-0 z-0">
                    <div className="scale-[0.8] origin-top-right w-[140%] h-[140%] -mr-20 -mt-10 opacity-70">
                      <AnalyticsPreview />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <div className="relative z-20 h-full flex flex-col justify-end p-8">
                    <h4 className="text-xl font-bold text-white mb-2">Real-Time Insights</h4>
                    <p className="text-white/60 text-sm">Live-Daten aus deinem Meta Ad Account, visualisiert für schnelle Entscheidungen.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-32 relative z-10 text-center">
        <div className="landing-container">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter">
            Bereit für den <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Unfair Advantage?</span>
          </h2>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)]"
          >
            Jetzt kostenlos starten
          </button>
        </div>
      </section>

    </div>
  );
}
