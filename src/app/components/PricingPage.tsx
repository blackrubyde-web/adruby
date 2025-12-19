import { useState } from 'react';
import { Check, Sparkles, Zap, HelpCircle, Brain, BarChart3, Download, ChevronDown } from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { PageContainer, Card, Chip, Badge } from './design-system';

interface PricingPageProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function PricingPage({ onNavigate, onSignIn, onGetStarted }: PricingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '€0',
      period: 'forever',
      description: 'For solo founders testing the waters',
      credits: '100 credits/month',
      features: [
        'AI ad generation (basic)',
        'Up to 10 ad variations',
        'Performance tracking',
        'Export to Meta Ads',
      ],
      cta: 'Start free',
      isPrimary: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '€29.99',
      period: 'month',
      description: 'For marketers scaling campaigns',
      credits: '1,000 credits/month',
      badge: 'Most popular',
      features: [
        'Everything in Starter',
        'Unlimited ad variations',
        'AI performance predictions',
        'Advanced analytics',
        'A/B testing manager',
        'Audience insights',
        'Priority support',
      ],
      cta: 'Start 7-day free trial',
      isPrimary: true,
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '€99',
      period: 'month',
      description: 'For agencies managing multiple clients',
      credits: '5,000 credits/month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Client approval workflow',
        'Auto-optimization',
        'White-label reports',
        'API access',
        'Dedicated account manager',
      ],
      cta: 'Start 7-day free trial',
      isPrimary: false,
    },
  ];

  const creditExamples = [
    { action: 'Generate 1 ad', credits: 10, icon: Brain },
    { action: 'Performance prediction', credits: 5, icon: BarChart3 },
    { action: 'Create variation', credits: 8, icon: Sparkles },
    { action: 'Export to Meta', credits: 2, icon: Download },
  ];

  const faqs = [
    {
      question: 'What happens after the trial?',
      answer: 'Your trial converts to the free Starter plan automatically. No credit card required during trial.',
    },
    {
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'Yes. Upgrade or downgrade with one click. Changes take effect immediately, and we prorate billing.',
    },
    {
      question: 'What if I run out of credits?',
      answer: 'You can purchase additional credit packs or upgrade your plan. Unused credits roll over to next month (Pro & Agency only).',
    },
    {
      question: 'Do you offer agency billing?',
      answer: 'Yes. Agency plans include consolidated billing, team seats, and client sub-accounts. Contact us for custom pricing.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and wire transfers for Agency plans.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background landing-page">
      <GlobalNav currentPage="pricing" onNavigate={onNavigate} onSignIn={onSignIn} onGetStarted={onGetStarted} />

      {/* Hero Header */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <PageContainer>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-hero mb-4">Simple pricing. Powerful results.</h1>
            <p className="text-body-large text-muted-foreground mb-6">
              Start free. Upgrade when you're ready.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
            <Chip icon={<Sparkles className="w-3 h-3" />}>7-day free trial</Chip>
            <Chip icon={<Zap className="w-3 h-3" />}>No credit card</Chip>
            <Chip icon={<Check className="w-3 h-3" />}>Cancel anytime</Chip>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <PageContainer>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.isPrimary
                    ? 'border-2 border-primary shadow-xl scale-105 bg-gradient-to-br from-primary/5 to-purple-500/5'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" className="shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                    {plan.credits}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.isPrimary
                      ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-xl'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </button>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Credits Explanation */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <PageContainer>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-section-title mb-4">How credits work</h2>
              <p className="text-body-large text-muted-foreground">
                Credits are used for AI actions. Simple, transparent, no surprises.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditExamples.map((example, index) => {
                const Icon = example.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-xl transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-2">{example.action}</p>
                    <div className="text-2xl font-black text-primary">{example.credits}</div>
                    <p className="text-xs text-muted-foreground">credits</p>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-center">
                <span className="font-semibold">Example:</span> With 1,000 credits/month (Pro plan), you can generate{' '}
                <span className="font-bold text-primary">100 ads</span>, get{' '}
                <span className="font-bold text-primary">200 predictions</span>, and export everything to Meta Ads.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Lightweight Plan Comparison */}
      <section className="py-16 sm:py-20">
        <PageContainer>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-section-title text-center mb-12">What's different?</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-center pb-4 border-b border-border/60">Starter</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Basic AI generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>10 variations max</span>
                  </div>
                  <div className="text-muted-foreground">No predictions</div>
                  <div className="text-muted-foreground">No A/B testing</div>
                </div>
              </div>

              {/* Pro */}
              <div className="space-y-4 md:scale-105">
                <h3 className="font-bold text-lg text-center pb-4 border-b border-primary">Pro</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Advanced AI generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Unlimited variations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Performance predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>A/B testing manager</span>
                  </div>
                </div>
              </div>

              {/* Agency */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-center pb-4 border-b border-border/60">Agency</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Everything in Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Team collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Auto-optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>White-label reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <PageContainer>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-section-title text-center mb-12">Pricing FAQ</h2>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-semibold">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openFaqIndex === index && (
                    <div className="px-6 pb-6 animate-in">
                      <p className="text-sm text-muted-foreground pl-8 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20">
        <PageContainer>
          <Card className="text-center max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <h2 className="text-section-title mb-4">Start free. No pressure.</h2>
            <p className="text-body-large text-muted-foreground mb-6">
              Try AdRuby free for 7 days. No credit card required.
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
