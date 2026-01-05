import { useState, useRef, useMemo } from 'react';
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
import { MobileStickyCTA } from './landing/MobileStickyCTA';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const heroRef = useRef<HTMLElement>(null);

  // Generate stable particle positions once
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10
    }));
  }, []);

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
      question: 'Wie generiert die KI Ads?',
      answer: 'AdRuby nutzt fortschrittliche KI-Modelle, die auf Millionen von erfolgreichen Ads trainiert wurden. Beschreiben Sie einfach Ihr Angebot, und unsere KI analysiert Ihre Zielgruppe, Wettbewerber und Markttrends, um mehrere kreative Varianten zu generieren, die für Performance optimiert sind.',
    },
    {
      question: 'Welche Plattformen werden unterstützt?',
      answer: 'Wir unterstützen aktuell Facebook, Instagram und LinkedIn Ads. Exportieren Sie Ihre Creatives direkt in den Meta Ads Manager oder laden Sie sie für manuellen Upload herunter.',
    },
    {
      question: 'Wie viele Credits erhalte ich?',
      answer: 'Unser Standard-Plan enthält 1.000 Credits pro Monat. Jede KI-Generierung verbraucht ~10 Credits, sodass Sie ca. 100 Ad-Varianten erstellen können. Mehr benötigt? Kaufen Sie jederzeit zusätzliche Credits.',
    },
    {
      question: 'Kann ich jederzeit kündigen?',
      answer: 'Ja! Jederzeit kündbar in Ihren Account-Einstellungen. Keine Fragen gestellt. Ihr Abo bleibt bis zum Ende des Abrechnungszeitraums aktiv.',
    },
    {
      question: 'Bieten Sie Agentur-Pläne an?',
      answer: 'Ja! Kontaktieren Sie unser Sales-Team für individuelle Agentur-Pläne mit unbegrenzten Seats, White-Label-Optionen und Priority-Support.',
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

      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} />

      {/* ============================================
          HERO - MOBILE-FIRST META ADS OPTIMIERT
          ============================================ */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background"
      >
        {/* Animated Gradient Mesh Background - PERF OPTIMIZED */}
        <div className="absolute inset-0 opacity-30 pointer-events-none -z-20 motion-reduce:hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#C80000]/30 via-rose-500/20 to-transparent rounded-full blur-[120px] animate-pulse-slow will-change-transform" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-[100px] animate-pulse-slower will-change-transform" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-transparent rounded-full blur-[140px] animate-pulse-slowest will-change-transform" />
        </div>

        {/* Floating Particles - PERF OPTIMIZED */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-40 motion-reduce:hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-float will-change-transform"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Ambient Ruby Glow - Enhanced */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#C80000]/15 via-rose-500/8 to-transparent blur-[150px] pointer-events-none -z-10 animate-glow will-change-transform" />

        {/* Mobile-First Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Early Bird Banner */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up text-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full sm:rounded-2xl shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm md:text-base">
                JETZT 7 TAGE KOSTENLOS TESTEN
              </span>
            </div>
          </div>

          {/* Social Proof Badge - Mobile Optimized */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up delay-100 text-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/60 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm">
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  MK
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  JS
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  AL
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  TP
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground">
                <span className="font-bold text-primary">2.500+</span> Marketer vertrauen AdRuby
              </span>
            </div>
          </div>

          {/* Main Headline - MOBILE FIRST */}
          <div className="text-center mb-8 sm:mb-10 animate-fade-in-up delay-200">
            <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight">
              <span className="text-foreground">KI-Ads die verkaufen.</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600 pb-2">
                In Sekunden.
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              AdRuby analysiert was konvertiert und erstellt gewinnende Hooks, Texte und Designs — für <span className="text-foreground font-semibold">3x höheren ROAS</span>.
            </p>
          </div>

          {/* CTA Buttons - MOBILE OPTIMIZED (min 48px touch target) */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-in-up delay-300 px-4">
            {/* Google Login - PRIMARY CTA */}
            <button
              onClick={onLogin}
              className="button-spring w-full sm:w-auto min-h-[52px] px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all shadow-xl flex items-center justify-center gap-3 group">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  opacity="0.9"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  opacity="0.9"
                />
              </svg>
              <span className="flex flex-col items-start gap-0.5">
                <span className="leading-none">7 Tage kostenlos testen</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide leading-none">Jederzeit kündbar</span>
              </span>
            </button>

            {/* Email Signup - SECONDARY */}
            <button
              onClick={onGetStarted}
              className="button-spring w-full sm:w-auto min-h-[48px] px-8 sm:px-10 py-3 bg-card/60 backdrop-blur-sm border-2 border-border/60 text-foreground rounded-2xl font-semibold text-base sm:text-lg hover:bg-muted/80 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              Kostenlosen Account erstellen
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Trust Logos - Mobile Friendly */}
          <div className="text-center animate-fade-in-up delay-400 mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-4 sm:mb-6 uppercase tracking-wide">
              Vertraut von führenden Marken
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 opacity-40 grayscale">
              <div className="text-base sm:text-lg md:text-xl font-bold font-mono">Shopify</div>
              <div className="text-base sm:text-lg md:text-xl font-bold font-serif italic">Vogue</div>
              <div className="text-base sm:text-lg md:text-xl font-bold tracking-widest">Forbes</div>
              <div className="text-base sm:text-lg md:text-xl font-bold font-sans">TechCrunch</div>
            </div>
          </div>

          {/* Mobile Hero Visual - Enhanced with 3D Tilt */}
          <div className="animate-fade-in-up delay-500">
            {/* Mobile: Single phone mockup */}
            <div className="block sm:hidden relative mx-auto max-w-[280px] transform-gpu transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-border/40 bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-xl">
                <div className="aspect-[9/16] bg-gradient-to-br from-muted via-card to-muted/50 flex items-center justify-center p-6 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />

                  <div className="text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#C80000] to-rose-600 flex items-center justify-center shadow-lg animate-pulse-glow">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-foreground/20 rounded w-3/4 mx-auto animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="h-3 bg-foreground/15 rounded w-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="h-3 bg-foreground/10 rounded w-2/3 mx-auto animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <div className="h-10 bg-gradient-to-r from-[#C80000] to-rose-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                      Ad erstellen
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet/Desktop: Full dashboard with 3D tilt */}
            <div className="hidden sm:block relative group perspective-1000">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40 transform-gpu transition-all duration-500 hover:scale-[1.02] tilt-card">
                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C80000] via-rose-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />

                <div className="relative bg-card/50 backdrop-blur-sm p-2 rounded-2xl">
                  <img
                    src="/images/mockups/dashboard.png"
                    alt="AdRuby Dashboard"
                    className="w-full h-auto rounded-xl shadow-2xl"
                  // loading="eager" // Removed to let browser decide, or keep if crucial
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Separator */}
        <div className="mt-16 sm:mt-20 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ============================================
          8-STUFEN KI-PIPELINE (MOBIL-OPTIMIERT)
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/20">
        <div className={tokens.marketingContainer}>
          <div className="text-center mb-10 sm:mb-12 animate-fade-in-up px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Wie AdRuby's KI <span className="text-primary">gewinnende Ads</span> erstellt
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligentes System, das analysiert, erstellt und optimiert
            </p>
          </div>

          {/* Vertical Mobile Pipeline / Horizontal Desktop */}
          <div className="workflow-pipeline max-w-5xl mx-auto flex flex-col md:flex-row gap-3 sm:gap-4 relative px-4">
            {/* Mobile Connecting Line (Vertical) */}
            <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-yellow-500 via-green-500 to-red-500 md:hidden -z-10 opacity-20" />

            {/* Stage 1 - Strategische Analyse */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">1. Strategie</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Analyse & Design Tokens</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 2 - Template */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">2. Template</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Dynamische Layouts</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 3 - Copy */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">3. Copy</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">10x Hook-Varianten</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 4 - Cutout */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-3 sm:mb-4">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">4. Ausschnitt</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">WASM Hintergrund-Entfernung</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 5 - Scene + Vision QA */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">5. Szene</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">KI-Komposition + QA</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 6 - Variations */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">6. Variationen</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Stil-Mutationen</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 7 - Forecast */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4">
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">7. Prognose</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">KPI-Vorhersage</p>
            </div>

            <div className="workflow-connector" />

            {/* Stage 8 - Launch */}
            <div className="workflow-step landing-card-hover">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#C80000] to-rose-600 flex items-center justify-center mb-3 sm:mb-4">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">8. Launch</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Export zu Meta</p>
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
          KI INSIGHTS & PERFORMANCE
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-muted/30">
        <PageContainer>
          <div className="text-center mb-10 sm:mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              KI <span className="text-primary">erstellt</span> nicht nur Ads — sie <span className="text-primary">optimiert</span> sie
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligente Insights die Performance automatisch verbessern
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Performance Prediction */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold">Performance</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">8.2x</div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Erwarteter ROAS</p>
              <div className="p-2.5 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs font-semibold text-green-600">Hohe Konfidenz (94%)</p>
              </div>
            </Card>

            {/* CTR Score */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold">Klickrate (CTR)</h3>
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">4.1%</div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Über Branchen-Ø (2.3%)</p>
              <div className="p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs font-semibold text-blue-600">Exzellente Performance erwartet</p>
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold">KI-Empfehlungen</h3>
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Video-Ads übertreffen Bilder um 34%</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Zielgruppen-Überschneidung erkannt</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">Budget um 20% erhöhen</p>
                </div>
              </div>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          SOCIAL PROOF
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24">
        <PageContainer>
          <div className="text-center mb-10 sm:mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Vertraut von <span className="text-primary">Marketern & Gründern</span>
            </h2>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <TestimonialCard
              quote="Wir haben Ad-Erstellung von 2 Stunden auf 8 Minuten reduziert."
              author="Markus Klein"
              role="Growth Lead, SaaS Startup"
              avatar="MK"
            />
            <TestimonialCard
              quote="KI-Varianten schlagen unsere Best-Performer um 22% CTR."
              author="Julia Schmidt"
              role="Performance Marketerin"
              avatar="JS"
            />
            <TestimonialCard
              quote="Endlich skalierbare Workflows für unsere Agentur."
              author="Alexander Lang"
              role="Agentur-Inhaber"
              avatar="AL"
            />
          </div>

          {/* Results Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="50.000+" label="Ads erstellt" icon={<Sparkles className="w-5 h-5 text-primary" />} />
            <StatCard value="14x" label="Ø ROAS" icon={<TrendingUp className="w-5 h-5 text-green-600" />} />
            <StatCard value="86%" label="Zeit gespart" icon={<Zap className="w-5 h-5 text-yellow-600" />} />
            <StatCard value="2.500+" label="Aktive Nutzer" icon={<Users className="w-5 h-5 text-blue-600" />} />
          </div>
        </PageContainer>
      </section>

      {/* ============================================
          FÜR WEN IST ADRUBY?
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-muted/30 to-background">
        <PageContainer>
          <div className="text-center mb-10 sm:mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Entwickelt für <span className="text-primary">Marketer & Gründer</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: 'Solo-Gründer',
                pain: 'Keine Zeit für manuelle Ad-Erstellung',
                solution: '10+ Varianten in Minuten generieren',
                outcome: 'Kampagnen 10x schneller launchen',
              },
              {
                icon: BarChart3,
                title: 'Performance Marketer',
                pain: 'Benötigen datengetriebenes Creative-Testing',
                solution: 'KI sagt best-performende Ads voraus',
                outcome: 'ROAS um 3-5x steigern',
              },
              {
                icon: Briefcase,
                title: 'Agenturen',
                pain: '50+ Kunden-Accounts verwalten',
                solution: 'Creative-Produktion automatisieren',
                outcome: 'Skalieren ohne neues Personal',
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
                      Herausforderung
                    </p>
                    <p className="text-sm font-medium text-red-600">{persona.pain}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Unsere Lösung
                    </p>
                    <p className="text-sm font-medium">{persona.solution}</p>
                  </div>
                  <div className="pt-3 border-t border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ergebnis</p>
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
          PREISE
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <PageContainer>
          <div className="text-center mb-10 sm:mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Einfache, transparente Preise</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Ein Plan. Alle Features. Keine Überraschungen.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <PricingCard
              title="Pro Plan"
              price="€29.99"
              period="Monat"
              features={[
                'Unbegrenzte KI-Ads',
                '1.000 Credits inklusive',
                'Echtzeit Performance-Prognosen',
                'Multi-Plattform (FB, IG, LinkedIn)',
                'Erweiterte Zielgruppen-Targeting',
                'Prioritäts-Support',
              ]}
              cta="7 Tage kostenlos testen"
              onCtaClick={onGetStarted}
              featured
            />

            {/* Credits Explanation */}
            <Card className="mt-6">
              <h4 className="font-semibold mb-2">Was sind Credits?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jede KI-Generierung verbraucht ~10 Credits. 1.000 Credits = ~100 Ad-Varianten. Mehr benötigt? Jederzeit zusätzliche Credits kaufen.
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
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-card/95 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in slide-in-from-bottom">
        <button
          onClick={onGetStarted}
          className="w-full min-h-[52px] py-3 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
          Jetzt kostenlos starten
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-background">
        <PageContainer>
          <div className="text-center mb-10 sm:mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Häufig gestellte Fragen</h2>
          </div>

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
              <h3 className="font-bold mb-2">Noch Fragen?</h3>
              <p className="text-sm text-muted-foreground mb-4">Unser Team hilft Ihnen gerne weiter</p>
              <SecondaryButton className="mx-auto">Support kontaktieren</SecondaryButton>
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
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              Starten Sie jetzt mit der
              <br />
              Generierung von Ads
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 px-4">Keine Kreditkarte erforderlich.</p>
            <button
              onClick={onGetStarted}
              className="button-spring px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all shadow-xl inline-flex items-center gap-2">
              Erste Ad generieren
              <ArrowRight className="w-5 h-5" />
            </button>
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
                KI-gestützte Ad-Plattform für Marketer & Gründer.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Produkt</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Preise
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
              <h3 className="font-bold mb-4">Unternehmen</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Über uns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Rechtliches</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    AGB
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Sicherheit
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
        /* Premium Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0.8;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1) translateX(20px);
            opacity: 0.5;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.15) translateY(-20px);
            opacity: 0.4;
          }
        }

        @keyframes pulse-slowest {
          0%, 100% {
            transform: scale(1) translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05) translateX(-15px);
            opacity: 0.3;
          }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(200, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(200, 0, 0, 0.6);
          }
        }

        .shimmer {
          background: linear-gradient(90deg, #C80000 0%, #9333ea 50%, #C80000 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          to { transform: translateX(200%); }
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

        /* Premium effect classes */
        .animate-float { animation: float linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 12s ease-in-out infinite; }
        .animate-pulse-slowest { animation: pulse-slowest 15s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

        .perspective-1000 { perspective: 1000px; }
        
        .tilt-card {
          transition: transform 0.5s ease;
        }
        
        .tilt-card:hover {
          transform: rotateY(2deg) rotateX(-1deg) scale(1.02);
        }

        /* Accessibility: Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-pulse-slow, .animate-pulse-slower, 
          .animate-pulse-slowest, .animate-glow, .animate-shimmer, .animate-pulse-glow {
            animation: none;
          }
          .tilt-card:hover {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
