import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Brain,
  LineChart,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Rocket,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Zap,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  PageContainer,
  SectionHeader,
  Card,
  StatCard,
  TestimonialCard,
  PricingCard,
  PrimaryButton,
  SecondaryButton,
  Tabs,
  tokens,
} from './design-system';
import { TryItLiveSection } from './landing/TryItLiveSection';
import { BeforeAfterSection } from './landing/BeforeAfterSection';
import { RealUseCasesSection } from './landing/RealUseCasesSection';
import { AITrustSection } from './landing/AITrustSection';
import { AffiliateCTASection } from './landing/AffiliateCTASection';
import { SEOContentSection } from './landing/SEOContentSection';
import { GlobalNav } from './landing/GlobalNav';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  // ============================================
  // AD GALLERY STATE
  // ============================================
  const [selectedIndustry, setSelectedIndustry] = useState('Coaching');

  const adExamples: Record<string, Array<{
    headline: string;
    primaryText: string;
    cta: string;
    image: string;
    ctr: string;
    roas: string;
    confidence: number;
  }>> = {
    'E-commerce': [
      {
        headline: 'Get 40% Off Premium Sneakers',
        primaryText: 'Limited time offer! Shop our collection of premium athletic sneakers. Free shipping on orders over $100.',
        cta: 'Shop Now',
        image: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY1OTU2ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '3.2%',
        roas: '5.8x',
        confidence: 92,
      },
      {
        headline: 'New Collection Just Dropped',
        primaryText: 'Discover the latest trends. Limited stock available. Join 50,000+ happy customers.',
        cta: 'Shop Collection',
        image: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY1OTU2ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '2.9%',
        roas: '4.2x',
        confidence: 88,
      },
    ],
    'Coaching': [
      {
        headline: 'Transform Your Body in 12 Weeks',
        primaryText: 'Join 10,000+ people who achieved their fitness goals with our proven coaching program. Get personalized workouts and nutrition plans.',
        cta: 'Start Free Trial',
        image: 'https://images.unsplash.com/photo-1727848562663-81fec613880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2hpbmclMjBhdGhsZXRlfGVufDF8fHx8MTc2NjAyMDEyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '4.1%',
        roas: '8.2x',
        confidence: 94,
      },
      {
        headline: 'Proven System. Real Results.',
        primaryText: 'Stop guessing. Start training smart. Our AI-powered coaching adapts to your progress.',
        cta: 'Join Now',
        image: 'https://images.unsplash.com/photo-1727848562663-81fec613880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2hpbmclMjBhdGhsZXRlfGVufDF8fHx8MTc2NjAyMDEyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '3.8%',
        roas: '7.1x',
        confidence: 91,
      },
    ],
    'SaaS': [
      {
        headline: 'Ship Products 10x Faster',
        primaryText: 'The only project management tool built for modern teams. Streamline your workflow and boost productivity today.',
        cta: 'Get Started Free',
        image: 'https://images.unsplash.com/photo-1640551497504-ec05b9e50b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGxhcHRvcHxlbnwxfHx8fDE3NjYwMjAxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '2.8%',
        roas: '6.5x',
        confidence: 89,
      },
      {
        headline: 'Your Team, Supercharged',
        primaryText: 'Collaborate in real-time. Track progress effortlessly. Deliver projects on time, every time.',
        cta: 'Try It Free',
        image: 'https://images.unsplash.com/photo-1640551497504-ec05b9e50b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGxhcHRvcHxlbnwxfHx8fDE3NjYwMjAxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '3.1%',
        roas: '5.9x',
        confidence: 87,
      },
    ],
    'Local': [
      {
        headline: 'Book Your Table Tonight',
        primaryText: 'Experience authentic Italian cuisine in the heart of downtown. Reserve now and get a complimentary appetizer!',
        cta: 'Reserve Now',
        image: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY1OTU2ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '5.3%',
        roas: '12.4x',
        confidence: 96,
      },
      {
        headline: '2-for-1 Happy Hour Special',
        primaryText: 'Join us Monday-Friday 4-7pm. Craft cocktails, local beers, and appetizers.',
        cta: 'View Menu',
        image: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY1OTU2ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
        ctr: '4.7%',
        roas: '9.8x',
        confidence: 93,
      },
    ],
  };

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const currentAds = adExamples[selectedIndustry];
  const currentAd = currentAds[currentAdIndex];

  // ============================================
  // FAQ STATE
  // ============================================
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the AI generate ads?',
      answer: 'AdRuby uses advanced AI models trained on millions of high-performing ads. Simply describe your offer, and our AI analyzes your audience, competitors, and market trends to generate multiple creative variations optimized for performance.',
    },
    {
      question: 'What platforms do you support?',
      answer: 'We currently support Facebook, Instagram, and LinkedIn ads. Export your creatives directly to Meta Ads Manager or download them for manual upload.',
    },
    {
      question: 'How many credits do I get?',
      answer: 'Our standard plan includes 1,000 credits per month. Each AI generation uses ~10 credits, so you can create approximately 100 ad variations. Need more? Purchase additional credits anytime.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! Cancel anytime from your account settings. No questions asked. Your subscription will remain active until the end of your billing period.',
    },
    {
      question: 'Do you offer agency plans?',
      answer: 'Yes! Contact our sales team for custom agency plans with unlimited seats, white-label options, and priority support.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background landing-page">
      {/* ============================================
          NAVIGATION
          ============================================ */}
      <GlobalNav
        currentPage="home"
        onNavigate={() => { }}
        onSignIn={onLogin}
        onGetStarted={onGetStarted}
      />

      {/* ============================================
          HERO - PRODUCT FIRST (AdCreative.ai STYLE)
          ============================================ */}
      <section className="relative pt-28 pb-20 sm:pb-32 overflow-hidden bg-gradient-to-b from-background to-muted/20">

        {/* Marketing Container - Centered */}
        <div className="max-w-4xl mx-auto px-6">
          {/* Countdown Banner */}
          <div className="mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-2xl shadow-lg">
              <span className="font-bold text-sm sm:text-base">
                EARLY BIRD — 50% OFF FIRST 3 MONTHS!
              </span>
            </div>
          </div>

          {/* Social Proof Badge */}
          <div className="mb-8 animate-fade-in-up delay-100">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-border/60 px-5 py-2.5 rounded-full shadow-sm">
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  SC
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  MR
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  ET
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  JK
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">
                Trusted by <span className="font-bold text-primary">2,500+</span> marketers worldwide
              </span>
            </div>
          </div>

          {/* Main Headline - Benefit Driven (Video Tip #1) */}
          <div className="text-center mb-6 animate-fade-in-up delay-200">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              <span className="text-foreground">Stop Wasting Ad Spend.</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 pb-2">
                Get High-ROAS Ads in Seconds.
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AdRuby doesn't just "make ads" — it analyzes what converts to generate winning hooks, copy, and designs that drive <span className="text-foreground font-semibold">3x higher ROAS</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 mb-12 animate-fade-in-up delay-300">
            <button
              onClick={onGetStarted}
              className="button-spring relative w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl flex flex-col items-center justify-center gap-0.5 group"
            >
              <div className="flex items-center gap-2">
                Start Generating For Free
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">No credit card required</span>
            </button>
            <button
              onClick={onLogin}
              className="button-spring w-full sm:w-auto px-10 py-4 bg-white border-2 border-border/60 text-foreground rounded-2xl font-semibold text-lg hover:bg-muted/50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Start Free With Google
            </button>
          </div>

          {/* Brand Logos Banner */}
          <div className="text-center animate-fade-in-up delay-400">
            <p className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wide">
              Trusted by leading brands worldwide
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-80">
              {/* Trust Signals */}
              <div className="text-xl font-bold font-mono">Shopify</div>
              <div className="text-xl font-bold font-serif italic">Vogue</div>
              <div className="text-xl font-bold tracking-widest">Forbes</div>
              <div className="text-xl font-bold font-sans">TechCrunch</div>
              <div className="text-xl font-bold uppercase tracking-wide">Inc.5000</div>
            </div>
          </div>

          {/* Dashboard Mockup - Main Hero Image */}
          <div className="mt-16 relative animate-fade-in-up delay-500 rounded-2xl overflow-hidden shadow-2xl border border-border/40 group">
            {/* Confetti Background Effect */}
            <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#C80000', '#9333ea', '#3b82f6', '#10b981'][i % 4],
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 bg-background/50 backdrop-blur-sm p-2 rounded-2xl">
              <img
                src="/images/mockups/dashboard.png"
                alt="AdRuby Dashboard Interface"
                className="w-full h-auto rounded-xl shadow-2xl transform transition-transform duration-700 group-hover:scale-[1.01]"
              />

              {/* Floating Element: Wizard Preview */}
              <div className="hidden lg:block absolute -right-12 -bottom-12 w-2/5 rounded-xl shadow-2xl border-4 border-background overflow-hidden transform rotate-[-3deg] group-hover:rotate-0 transition-all duration-500">
                <img src="/images/mockups/adwizard.png" alt="AI Ad Wizard" className="w-full h-auto" />
              </div>

              {/* Floating Element: Mobile Preview */}
              <div className="hidden lg:block absolute -left-8 bottom-12 w-1/5 rounded-[2rem] shadow-2xl border-4 border-background overflow-hidden transform rotate-[6deg] group-hover:rotate-0 transition-all duration-500">
                <img src="/images/mockups/mobile.png" alt="AdRuby Mobile App" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Line Separator */}
        <div className="gradient-line mt-20" />
      </section>

      {/* ============================================
          AI WORKFLOW PIPELINE (HORIZONTAL FLOW)
          ============================================ */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className={tokens.marketingContainer}>
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-section-title mb-4">How AdRuby's AI builds winning ads</h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Intelligent system that analyzes, creates, and optimizes
            </p>
          </div>

          {/* Horizontal Pipeline - Stacked on Mobile */}
          <div className="workflow-pipeline max-w-5xl mx-auto flex flex-col md:flex-row gap-4 relative">
            {/* Mobile Connecting Line (Vertical) */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:hidden -z-10 opacity-30"></div>
            {/* Step 1 */}
            <div className="workflow-step landing-card-hover">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-feature-title mb-2">Input</h3>
              <p className="text-sm text-muted-foreground">Describe your offer</p>
              {/* Mini UI Snippet */}
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
                "Fitness coaching..."
              </div>
            </div>

            <div className="workflow-connector" />

            {/* Step 2 */}
            <div className="workflow-step landing-card-hover">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-feature-title mb-2">Analyze</h3>
              <p className="text-sm text-muted-foreground">AI finds winning angles</p>
              {/* Mini UI Snippet */}
              <div className="mt-3 flex gap-1">
                <div className="h-1.5 flex-1 bg-purple-500/30 rounded" />
                <div className="h-1.5 flex-1 bg-purple-500/50 rounded" />
                <div className="h-1.5 flex-1 bg-purple-500 rounded" />
              </div>
            </div>

            <div className="workflow-connector" />

            {/* Step 3 */}
            <div className="workflow-step landing-card-hover">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-feature-title mb-2">Generate</h3>
              <p className="text-sm text-muted-foreground">Creates 10 variations</p>
              {/* Mini UI Snippet */}
              <div className="mt-3 space-y-1">
                <div className="h-2 bg-yellow-500/30 rounded w-full" />
                <div className="h-2 bg-yellow-500/30 rounded w-4/5" />
                <div className="h-2 bg-yellow-500/30 rounded w-3/4" />
              </div>
            </div>

            <div className="workflow-connector" />

            {/* Step 4 */}
            <div className="workflow-step landing-card-hover">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-feature-title mb-2">Predict</h3>
              <p className="text-sm text-muted-foreground">Scores CTR/ROAS</p>
              {/* Mini UI Snippet */}
              <div className="mt-3 text-xs font-semibold text-green-600">
                94% confidence ↑
              </div>
            </div>

            <div className="workflow-connector" />

            {/* Step 5 */}
            <div className="workflow-step landing-card-hover">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-feature-title mb-2">Launch</h3>
              <p className="text-sm text-muted-foreground">Export to Meta Ads</p>
              {/* Mini UI Snippet */}
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                <span>Meta</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          AD CREATIVE GALLERY - Hidden
          ============================================ */}
      <section className={tokens.sectionSpacing + " hidden"}>
        <div className={tokens.marketingContainer}>
          <SectionHeader
            title="AI-generated ad creatives"
            subtitle="Real ads created by AdRuby in seconds"
          />

          {/* Industry Tabs */}
          <div className="flex justify-center mb-12">
            <Tabs
              tabs={['E-commerce', 'Coaching', 'SaaS', 'Local']}
              activeTab={selectedIndustry}
              onTabChange={(tab) => {
                setSelectedIndustry(tab);
                setCurrentAdIndex(0);
              }}
            />
          </div>

          {/* Ad Preview - Desktop Only */}
          <div className="hidden md:block max-w-sm mx-auto relative">
            {/* Navigation Arrows */}
            {currentAds.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentAdIndex((prev) => (prev - 1 + currentAds.length) % currentAds.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-9 h-9 bg-card border border-border/60 rounded-full flex items-center justify-center hover:bg-muted transition-colors z-10 hidden lg:flex"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentAdIndex((prev) => (prev + 1) % currentAds.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-9 h-9 bg-card border border-border/60 rounded-full flex items-center justify-center hover:bg-muted transition-colors z-10 hidden lg:flex"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <div className={tokens.card + " overflow-hidden"}>
              {/* Ad Header */}
              <div className="p-3 flex items-center gap-2.5 border-b border-border/60">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">AdRuby AI</p>
                  <p className="text-xs text-muted-foreground">Sponsored</p>
                </div>
              </div>

              {/* Ad Body Text */}
              <div className="p-3">
                <p className="text-sm leading-relaxed">{currentAd.primaryText}</p>
              </div>

              {/* Ad Image - Realistic Facebook aspect ratio */}
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <ImageWithFallback
                  src={currentAd.image}
                  alt={`${selectedIndustry} ad example`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white rounded text-[10px] font-bold">
                  AI Generated
                </div>
              </div>

              {/* Ad Footer */}
              <div className="p-3 border-t border-border/60">
                <h3 className="font-bold text-sm mb-2">{currentAd.headline}</h3>
                <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
                  {currentAd.cta}
                </button>
              </div>

              {/* Performance Prediction - Kompakter */}
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-t border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                    AI Prediction
                  </span>
                  <span className="text-[10px] font-semibold text-green-600">{currentAd.confidence}% confidence</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Expected CTR</p>
                    <p className="text-lg font-bold text-green-600">{currentAd.ctr}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Expected ROAS</p>
                    <p className="text-lg font-bold text-green-600">{currentAd.roas}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            {currentAds.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                {currentAds.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAdIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${index === currentAdIndex ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-primary/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          AI INSIGHTS - ASSISTANT VIBE
          ============================================ */}
      <section className={tokens.sectionSpacing + " bg-muted/30"}>
        <PageContainer>
          <SectionHeader
            title="AI doesn't just create ads — it optimizes them"
            subtitle="Smart insights that improve performance automatically"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {/* Performance Prediction */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Performance</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-1">8.2x</div>
              <p className="text-sm text-muted-foreground mb-4">Estimated ROAS</p>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs font-semibold text-green-600">High confidence (94%)</p>
              </div>
            </Card>

            {/* CTR Score */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Click-Through Rate</h3>
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-1">4.1%</div>
              <p className="text-sm text-muted-foreground mb-4">Above industry avg (2.3%)</p>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs font-semibold text-blue-600">Excellent performance expected</p>
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">AI Suggestions</h3>
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Video creatives outperform images by 34%</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Audience overlap detected</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Increase budget by 20%</p>
                </div>
              </div>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          SOCIAL PROOF
          ============================================ */}
      <section className={tokens.sectionSpacing}>
        <PageContainer>
          <SectionHeader title="Trusted by creators & marketers" />

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <TestimonialCard
              quote="We cut ad creation from 2 hours to 8 minutes."
              author="Sarah Chen"
              role="Growth Lead, SaaS Startup"
              avatar="SC"
            />
            <TestimonialCard
              quote="AI variations beat our best performer by 22% CTR."
              author="Mike Rodriguez"
              role="Performance Marketer"
              avatar="MR"
            />
            <TestimonialCard
              quote="Agency workflow finally scalable."
              author="Emma Taylor"
              role="Agency Owner"
              avatar="ET"
            />
          </div>

          {/* Results Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="50,000+" label="ads generated" icon={<Sparkles className="w-5 h-5 text-primary" />} />
            <StatCard value="14x" label="avg ROAS" icon={<TrendingUp className="w-5 h-5 text-green-600" />} />
            <StatCard value="86%" label="time saved" icon={<Zap className="w-5 h-5 text-yellow-600" />} />
            <StatCard value="2,500+" label="active users" icon={<Users className="w-5 h-5 text-blue-600" />} />
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          WHO IT'S FOR
          ============================================ */}
      <section className={tokens.sectionSpacing + " bg-muted/30"}>
        <PageContainer>
          <SectionHeader title="Built for creators & marketers" />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: 'Solo Founders',
                pain: 'No time to create ads manually',
                solution: 'Generate 10+ variations in minutes',
                outcome: 'Launch campaigns 10x faster',
              },
              {
                icon: BarChart3,
                title: 'Performance Marketers',
                pain: 'Need data-driven creative testing',
                solution: 'AI predicts best-performing ads',
                outcome: 'Increase ROAS by 3-5x',
              },
              {
                icon: Briefcase,
                title: 'Agencies',
                pain: 'Managing 50+ client accounts',
                solution: 'Automate creative production',
                outcome: 'Scale clients without hiring',
              },
            ].map((persona, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <persona.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-4">{persona.title}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Their Pain
                    </p>
                    <p className="text-sm font-medium text-red-600">{persona.pain}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      What We Do
                    </p>
                    <p className="text-sm font-medium">{persona.solution}</p>
                  </div>
                  <div className="pt-3 border-t border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Outcome</p>
                    <p className="font-bold text-green-600">{persona.outcome}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          TRY IT LIVE - INTERACTIVE AI TEASER
          ============================================ */}
      <TryItLiveSection onGetStarted={onGetStarted} />

      {/* ============================================
          BEFORE / AFTER COMPARISON
          ============================================ */}
      <BeforeAfterSection />

      {/* ============================================
          REAL USE CASES
          ============================================ */}
      <RealUseCasesSection />

      {/* ============================================
          AI CONFIDENCE & TRUST
          ============================================ */}
      <AITrustSection />

      {/* ============================================
          PRICING
          ============================================ */}
      <section className={tokens.sectionSpacing}>
        <PageContainer>
          <SectionHeader title="Simple, transparent pricing" subtitle="One plan. All features. No surprises." />

          <div className="max-w-lg mx-auto">
            <PricingCard
              title="Pro Plan"
              price="€29.99"
              period="month"
              features={[
                'Unlimited AI ad creatives',
                '1,000 credits included',
                'Real-time performance predictions',
                'Multi-platform support (FB, IG, LinkedIn)',
                'Advanced audience targeting',
                'Priority support',
              ]}
              cta="Start 7-Day Free Trial"
              onCtaClick={onGetStarted}
              featured
            />

            {/* Credits Explanation */}
            <Card className="mt-6">
              <h4 className="font-semibold mb-2">What are credits?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each AI generation uses ~10 credits. 1,000 credits = ~100 ad variations. Need more? Purchase additional
                credits anytime.
              </p>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          AFFILIATE CTA
          ============================================ */}
      <AffiliateCTASection />

      {/* ============================================
          SEO CONTENT
          ============================================ */}
      <SEOContentSection />

      {/* ============================================
          STICKY MOBILE CTA
          ============================================ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in slide-in-from-bottom">
        <button
          onClick={onGetStarted}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          Start Free Trial
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className={tokens.sectionSpacing}>
        <PageContainer>
          <SectionHeader title="Frequently asked questions" />

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                  />
                </div>
                {openFaqIndex === index && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                )}
              </Card>
            ))}

            {/* Contact Card */}
            <Card className="bg-primary/5 border-primary/20 text-center">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Still have questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">Our team is here to help</p>
              <SecondaryButton className="mx-auto">Contact Support</SecondaryButton>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-32 px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-background relative overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <PageContainer className="relative z-10">
          <div className="text-center">
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Start generating ads
              <br />
              in minutes
            </h2>
            <p className="text-xl text-muted-foreground mb-10">No credit card required.</p>
            <PrimaryButton onClick={onGetStarted} className="text-lg px-10 py-5">
              Generate Your First Ad
              <ArrowRight className="w-5 h-5 ml-2" />
            </PrimaryButton>
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="border-t border-border/60">
        <PageContainer className="py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">AdRuby</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered ad platform for creators & marketers.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/60 text-center">
            <p className="text-sm text-muted-foreground">© 2024 AdRuby. All rights reserved.</p>
          </div>
        </PageContainer>
      </footer>

      {/* Styles */}
      <style>{`
        .shimmer {
          background: linear-gradient(90deg, #C80000 0%, #9333ea 50%, #C80000 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        
        .animate-in {
          animation: fade-in 0.7s ease-out, slide-in-from-bottom 0.7s ease-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom {
          from { transform: translateY(1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
