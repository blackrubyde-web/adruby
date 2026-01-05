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
    <section className="py-20 sm:py-24 landing-page">
      <PageContainer>
        <SectionHeader title="Try AdRuby live" subtitle="Describe your offer and see what AI creates" />

        <div className="max-w-2xl mx-auto">
          <FeatureCard className="p-8 relative overflow-hidden">
            {/* Background Gradient for Depth */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

            <h3 className="text-lg font-semibold mb-2">Generate your first ad</h3>
            <p className="text-sm text-muted-foreground mb-6">
              See how AI transforms your product description into high-performing ad copy
            </p>

            {/* Input */}
            <div className="space-y-4 mb-6">
              <textarea
                value={livePrompt}
                onChange={(e) => setLivePrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                placeholder="e.g., Online fitness coaching for busy professionals. We offer 15-minute home workouts and custom meal plans."
              />

              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={livePlatform}
                  onChange={(e) => setLivePlatform(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Facebook Ads</option>
                  <option>Instagram Ads</option>
                  <option>LinkedIn Ads</option>
                </select>
                <select
                  value={liveGoal}
                  onChange={(e) => setLiveGoal(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Sales</option>
                  <option>Leads</option>
                  <option>Traffic</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            {!showLiveOutput && (
              <button
                onClick={handleLiveGenerate}
                disabled={!livePrompt.trim() || isLiveGenerating}
                className="w-full py-3 bg-gradient-to-r from-primary to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLiveGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white/20" />
                    Generate ad with AI
                  </>
                )}
              </button>
            )}

            {/* Progress Visualization */}
            {isLiveGenerating && (
              <div className="mt-6 space-y-3">
                {GENERATION_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  const isPending = index > currentStepIndex;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 transition-all duration-300 ${isPending ? 'opacity-30' : 'opacity-100'
                        }`}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                        ${isActive ? 'border-primary text-primary animate-pulse' : ''}
                        ${isPending ? 'border-muted-foreground text-muted-foreground' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Output Preview */}
            {showLiveOutput && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 mt-6">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 blur-sm" />
                  <div className="relative bg-card border border-border/60 rounded-xl overflow-hidden">
                    {/* Fake Ad Preview Header */}
                    <div className="p-3 border-b border-border/40 bg-muted/30 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="ml-2 text-xs text-muted-foreground font-mono">Ad Preview ({livePlatform})</span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Headline</p>
                        <p className="font-bold text-lg leading-tight">Get Fit in 12 Weeks — No Gym Required ⚡️</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Primary Text</p>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          Busy schedule? 🕒 Our AI-powered coaching fits your life, not the other way around.
                          Get personalized 15-min workouts, custom meal plans, and see results fast.
                          <br /><br />
                          Join 10,000+ professionals hitting their goals from home.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">CTA Button</p>
                        <button className="w-full py-2.5 bg-[#0081FB] text-white rounded-md font-semibold text-sm">
                          Start Your Free Trial
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock Screen */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Unlock 50+ Variations</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Create an account to generate visual creatives, see performance predictions, and export directly to Ads Manager.
                    </p>
                  </div>

                  <PrimaryButton onClick={onGetStarted} className="w-full sm:w-auto px-8 mx-auto shadow-xl shadow-primary/20">
                    Start 7-Day Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </PrimaryButton>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    No payment due today. Cancel anytime.
                  </p>
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
          </FeatureCard>
        </div>
      </PageContainer>
    </section>
  );
}
