import { useState } from 'react';
import {
  Sparkles,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  ArrowRight,
  ChevronDown,
  Brain,
  Eye,
  Zap,
  FileText,
  Share2,
  Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { PageContainer, Card, Chip } from './design-system';

interface FeaturesPageProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  icon: LucideIcon;
  availableIn?: string;
}

export function FeaturesPage({ onNavigate, onSignIn, onGetStarted }: FeaturesPageProps) {
  const [activeCategory, setActiveCategory] = useState('ai-creative');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const categories = [
    { id: 'ai-creative', label: 'AI Creative Generation', icon: Sparkles },
    { id: 'audience', label: 'Audience & Targeting', icon: Target },
    { id: 'analytics', label: 'Performance & Analytics', icon: BarChart3 },
    { id: 'optimization', label: 'Optimization & Scaling', icon: TrendingUp },
    { id: 'collaboration', label: 'Collaboration & Workflow', icon: Users },
    { id: 'integrations', label: 'Integrations & Export', icon: Share2 },
  ];

  const features: Record<string, Feature[]> = {
    'ai-creative': [
      {
        id: 'ai-ad-generation',
        name: 'AI Ad Generation',
        description: 'Generate headlines, primary text, and CTAs automatically. Creates multiple variations optimized for Meta Ads formats.',
        whyItMatters: 'Save 2-3 hours per campaign and test 10x more creatives.',
        icon: Brain,
        availableIn: 'All Plans',
      },
      {
        id: 'performance-prediction',
        name: 'Performance Prediction',
        description: 'AI predicts CTR, CPC, and conversion likelihood before you launch. Based on 10M+ historical ad data points.',
        whyItMatters: 'Launch only ads that will perform, reducing wasted spend by 40%.',
        icon: Eye,
        availableIn: 'Pro & Agency',
      },
      {
        id: 'smart-variations',
        name: 'Smart Variations',
        description: 'AI creates variations by testing different angles, pain points, and benefits automatically.',
        whyItMatters: 'Find winning creatives faster with data-driven testing.',
        icon: Zap,
        availableIn: 'All Plans',
      },
      {
        id: 'copy-optimization',
        name: 'Copy Optimization',
        description: 'AI suggests improvements to existing ad copy based on performance patterns and best practices.',
        whyItMatters: 'Improve underperforming ads without starting from scratch.',
        icon: FileText,
        availableIn: 'Pro & Agency',
      },
    ],
    'audience': [
      {
        id: 'audience-builder',
        name: 'AI Audience Builder',
        description: 'Generate targeting recommendations based on your product, industry, and goals.',
        whyItMatters: 'Reach the right people without manual research.',
        icon: Target,
        availableIn: 'Pro & Agency',
      },
      {
        id: 'lookalike-suggestions',
        name: 'Lookalike Suggestions',
        description: 'AI identifies best-performing audience segments and suggests lookalikes.',
        whyItMatters: 'Scale winning audiences predictably.',
        icon: Users,
        availableIn: 'Pro & Agency',
      },
    ],
    'analytics': [
      {
        id: 'real-time-tracking',
        name: 'Real-Time Performance Tracking',
        description: 'Monitor CTR, CPC, ROAS, and conversions in one dashboard. Updates every hour.',
        whyItMatters: 'React fast to performance changes.',
        icon: BarChart3,
        availableIn: 'All Plans',
      },
      {
        id: 'ai-insights',
        name: 'AI-Powered Insights',
        description: 'Get actionable recommendations on what to change, pause, or scale.',
        whyItMatters: 'Make decisions based on data, not guesses.',
        icon: Brain,
        availableIn: 'Pro & Agency',
      },
    ],
    'optimization': [
      {
        id: 'auto-optimization',
        name: 'Auto-Optimization',
        description: 'AI automatically adjusts budgets, pauses underperformers, and scales winners.',
        whyItMatters: 'Maximize ROAS without constant monitoring.',
        icon: TrendingUp,
        availableIn: 'Agency',
      },
      {
        id: 'ab-testing',
        name: 'A/B Testing Manager',
        description: 'Test creatives, audiences, and placements systematically with statistical significance tracking.',
        whyItMatters: 'Know what works with confidence.',
        icon: Zap,
        availableIn: 'Pro & Agency',
      },
    ],
    'collaboration': [
      {
        id: 'team-workspace',
        name: 'Team Workspace',
        description: 'Invite team members, assign roles, and collaborate on campaigns in real-time.',
        whyItMatters: 'Scale without chaos.',
        icon: Users,
        availableIn: 'Agency',
      },
      {
        id: 'approval-workflow',
        name: 'Approval Workflow',
        description: 'Client approval system for agencies. Share previews, collect feedback, and track changes.',
        whyItMatters: 'Professional client management.',
        icon: FileText,
        availableIn: 'Agency',
      },
    ],
    'integrations': [
      {
        id: 'meta-export',
        name: 'Export to Meta Ads',
        description: 'Push ads directly to Facebook Ads Manager with one click. No copy-pasting.',
        whyItMatters: 'Launch campaigns 10x faster.',
        icon: Download,
        availableIn: 'All Plans',
      },
      {
        id: 'api-access',
        name: 'API Access',
        description: 'Connect AdRuby to your tools via REST API. Automate creative workflows.',
        whyItMatters: 'Build custom integrations.',
        icon: Share2,
        availableIn: 'Agency',
      },
    ],
  };

  const toggleFeature = (featureId: string) => {
    setExpandedFeature(expandedFeature === featureId ? null : featureId);
  };

  return (
    <div className="min-h-screen w-full bg-background landing-page">
      <GlobalNav currentPage="features" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

      {/* Hero Header */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <PageContainer>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-hero mb-4">All Features</h1>
            <p className="text-body-large text-muted-foreground mb-6">
              Everything you need to build, test, and scale ads with AI.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Chip icon={<Sparkles className="w-3 h-3" />}>AI-powered</Chip>
              <Chip icon={<Zap className="w-3 h-3" />}>Fast workflows</Chip>
              <Chip icon={<BarChart3 className="w-3 h-3" />}>Performance-driven</Chip>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Features Content */}
      <section className="py-16 sm:py-20">
        <PageContainer>
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left: Category Navigation */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setExpandedFeature(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                        activeCategory === category.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Feature Details */}
            <div className="space-y-4">
              {features[activeCategory]?.map((feature) => {
                const Icon = feature.icon;
                const isExpanded = expandedFeature === feature.id;

                return (
                  <Card key={feature.id} className="overflow-hidden">
                    {/* Feature Header (Always Visible) */}
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className="w-full text-left p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-lg">{feature.name}</h3>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        {feature.availableIn && (
                          <span className="text-xs font-semibold text-primary">{feature.availableIn}</span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4 animate-in">
                        <div className="pl-14">
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>

                          {/* Why It Matters */}
                          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                              Why it matters
                            </p>
                            <p className="text-sm font-medium text-green-900">{feature.whyItMatters}</p>
                          </div>

                          {/* Optional: Visual Mock Placeholder */}
                          <div className="mt-4 p-8 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <Icon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p className="text-xs">Feature visualization</p>
                            </div>
                          </div>

                          {/* Try Feature Button */}
                          <button
                            onClick={onGetStarted}
                            className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                          >
                            Try this feature
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <PageContainer>
          <Card className="text-center max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <h2 className="text-section-title mb-4">Ready to see it in action?</h2>
            <p className="text-body-large text-muted-foreground mb-6">
              Start your 7-day free trial. No credit card required.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-xl"
            >
              Start free trial
            </button>
          </Card>
        </PageContainer>
      </section>

      <style>{`
        .animate-in {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
