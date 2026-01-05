import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Brain, Lock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { PageContainer, SectionHeader, FeatureCard, PrimaryButton } from '../design-system';

interface TryItLiveSectionProps {
  onGetStarted: () => void;
}

const GENERATION_STEPS = [
  'Analyzing your offer...',
  'Identifying target audience...',
  'Crafting high-converting hooks...',
  'Finalizing ad creative...',
];

export function TryItLiveSection({ onGetStarted }: TryItLiveSectionProps) {
  const [livePrompt, setLivePrompt] = useState('');
  const [livePlatform, setLivePlatform] = useState('Facebook Ads');
  const [liveGoal, setLiveGoal] = useState('Sales');
  const [isLiveGenerating, setIsLiveGenerating] = useState(false);
  const [showLiveOutput, setShowLiveOutput] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLiveGenerating) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= GENERATION_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setCurrentStepIndex(0);
    }
  }, [isLiveGenerating]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const handleLiveGenerate = () => {
    if (!livePrompt.trim()) return;

    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    setIsLiveGenerating(true);
    setShowLiveOutput(false);

    // Total duration ~3.2s
    timeoutIdRef.current = setTimeout(() => {
      setIsLiveGenerating(false);
      setShowLiveOutput(true);
      timeoutIdRef.current = null;
    }, 3200);
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-black pl-8 pr-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/70 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Demo
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Probier's <span className="text-[#FF1F1F]">live</span> aus.
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Beschreibe dein Angebot und sieh zu, wie AdRuby in Sekunden eine High-Converting Ad generiert.
          </p>
        </div>

        <div className="relative group">
          {/* Glowing Border Gradient */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF1F1F] via-purple-600 to-blue-600 rounded-3xl opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-500" />

          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">

            {/* Input Overlay */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3 block">Dein Angebot</label>
                <textarea
                  value={livePrompt}
                  onChange={(e) => setLivePrompt(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF1F1F]/50 focus:bg-white/10 transition-all min-h-[120px] resize-none text-lg"
                  placeholder="z.B. Online Fitness Coaching für vielbeschäftigte Väter. 20 Minuten Workouts ohne Equipment."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3 block">Plattform</label>
                  <select
                    value={livePlatform}
                    onChange={(e) => setLivePlatform(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF1F1F]/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option className="bg-black">Facebook Ads</option>
                    <option className="bg-black">Instagram Ads</option>
                    <option className="bg-black">LinkedIn Ads</option>
                    <option className="bg-black">TikTok Ads</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3 block">Ziel</label>
                  <select
                    value={liveGoal}
                    onChange={(e) => setLiveGoal(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF1F1F]/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option className="bg-black">Sales (Conversions)</option>
                    <option className="bg-black">Leads</option>
                    <option className="bg-black">Traffic</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              {!showLiveOutput ? (
                <button
                  onClick={handleLiveGenerate}
                  disabled={!livePrompt.trim() || isLiveGenerating}
                  className="w-full py-4 mt-4 bg-[#FF1F1F] text-white rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,31,31,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn"
                >
                  {isLiveGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analysiere Angebot...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-white/20 group-hover/btn:animate-pulse" />
                      Jetzt Ad generieren
                    </>
                  )}
                </button>
              ) : (
                <div className="animate-in fade-in zoom-in duration-500 pt-4 text-center">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ad generiert!</h3>
                    <p className="text-green-400 mb-0">Deine Ad ist bereit im Dashboard.</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1 text-white">Unlock 50+ Variations</h4>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Create an account to generate visual creatives, see performance predictions, and export directly to Ads Manager.
                      </p>
                    </div>

                    <PrimaryButton onClick={onGetStarted} className="w-full sm:w-auto px-8 mx-auto shadow-xl shadow-primary/20 bg-[#FF1F1F] hover:bg-[#D41919] text-white">
                      Start 7-Day Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </PrimaryButton>

                    <button
                      onClick={() => {
                        setShowLiveOutput(false);
                        setLivePrompt('');
                      }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors block mx-auto mt-4"
                    >
                      Try another example
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              {isLiveGenerating && (
                <div className="pt-6 space-y-4">
                  {GENERATION_STEPS.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 transition-all duration-300 ${isPending ? 'opacity-20' : 'opacity-100'}`}
                      >
                        <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center border transition-colors
                            ${isCompleted ? 'bg-[#FF1F1F] border-[#FF1F1F] text-white' : ''}
                            ${isActive ? 'border-[#FF1F1F] text-[#FF1F1F] animate-pulse' : ''}
                            ${isPending ? 'border-white/20 text-white/20' : ''}
                          `}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
