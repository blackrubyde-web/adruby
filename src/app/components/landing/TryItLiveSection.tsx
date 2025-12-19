import { useState } from 'react';
import { ArrowRight, Brain, Lock } from 'lucide-react';
import { PageContainer, SectionHeader, FeatureCard, PrimaryButton } from '../design-system';

interface TryItLiveSectionProps {
  onGetStarted: () => void;
}

export function TryItLiveSection({ onGetStarted }: TryItLiveSectionProps) {
  const [livePrompt, setLivePrompt] = useState('');
  const [livePlatform, setLivePlatform] = useState('Facebook Ads');
  const [liveGoal, setLiveGoal] = useState('Sales');
  const [isLiveGenerating, setIsLiveGenerating] = useState(false);
  const [showLiveOutput, setShowLiveOutput] = useState(false);

  const handleLiveGenerate = () => {
    if (!livePrompt.trim()) return;
    setIsLiveGenerating(true);
    setShowLiveOutput(false);

    setTimeout(() => {
      setIsLiveGenerating(false);
      setShowLiveOutput(true);
    }, 2500);
  };

  return (
    <section className="py-20 sm:py-24 landing-page">
      <PageContainer>
        <SectionHeader title="Try AdRuby live" subtitle="Describe your offer and see what AI creates" />

        <div className="max-w-2xl mx-auto">
          <FeatureCard className="p-8">
            <h3 className="text-lg font-semibold mb-2">Generate your first ad</h3>
            <p className="text-sm text-muted-foreground mb-6">
              See how AI transforms your product description into high-performing ad copy
            </p>

            {/* Input */}
            <input
              value={livePrompt}
              onChange={(e) => setLivePrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
              placeholder="e.g., Online fitness coaching for busy professionals"
            />

            {/* Dropdowns */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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

            {/* Generate Button */}
            <button
              onClick={handleLiveGenerate}
              disabled={!livePrompt.trim() || isLiveGenerating}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isLiveGenerating ? 'Generating...' : 'Generate ad with AI'}
            </button>

            {/* Loading State */}
            {isLiveGenerating && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary animate-pulse" />
                  <p className="text-sm font-medium">AI is analyzing your offer...</p>
                </div>
              </div>
            )}

            {/* Output Preview */}
            {showLiveOutput && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-background border border-border/60 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">Headline</p>
                  <p className="font-semibold">Get Fit in 12 Weeks — No Gym Required</p>
                </div>
                <div className="p-4 bg-background border border-border/60 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">Primary Text</p>
                  <p className="text-sm text-muted-foreground">
                    Busy schedule? Our AI-powered coaching fits your life. Get personalized workouts and see results
                    fast.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border/60 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">Call to Action</p>
                  <button className="w-full py-2 bg-primary text-white rounded-lg font-medium">
                    Start Your Free Trial
                  </button>
                </div>

                {/* Lock Message */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Create an account to generate full ads</p>
                    <p className="text-xs text-muted-foreground">
                      Unlock unlimited variations, performance predictions, and export to Meta Ads
                    </p>
                  </div>
                </div>

                <PrimaryButton onClick={onGetStarted} className="w-full">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PrimaryButton>
              </div>
            )}
          </FeatureCard>
        </div>
      </PageContainer>

      <style>{`
        .animate-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(0.5rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
