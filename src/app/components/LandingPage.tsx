import { useState, useRef, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Brain,
  LineChart,
  Rocket,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  ChevronDown,
  MessageCircle,
  Quote,
  TrendingUp,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  PageContainer,
  SectionHeader,
  Card,
  PricingCard,
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

  // Scroll Reveal Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hacker Text Effect Hook
  const useScrambleText = (text: string, speed: number = 30) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovered, setIsHovered] = useState(false);
    const chars = "!<>-_\\/[]{}—=+*^?#________";

    useEffect(() => {
      if (!isHovered) {
        setDisplayText(text);
        return;
      }

      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += 1 / 2; // Faster reveal for better readability
      }, speed);

      return () => clearInterval(interval);
    }, [isHovered, text, speed]);

    return { displayText, setIsHovered };
  };

  const headline = useScrambleText("WERBUNG DIE");
  const subHeadline = useScrambleText("KNALLT.");

  // Spotlight Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

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
      {/* HERO - KRASS & VERSPIELT (MOBILE FIRST) */}
      <div className="relative min-h-[600px] sm:min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center pt-20 sm:pt-24 pb-12 overflow-hidden w-full max-w-[100vw]">

        {/* 1. Animated Background (The "Krass" Factor) */}
        <div className="absolute inset-0 pointer-events-none -z-20">
          {/* The "Deep Ruby" Orb */}
          <div className="absolute top-[-10%] left-[-10%] w-[120vw] h-[120vw] sm:w-[800px] sm:h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,31,31,0.25),transparent_70%)] blur-[80px] animate-pulse-slow will-change-transform" />

          {/* Secondary Ambient Light */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-[radial-gradient(circle_at_center,rgba(60,60,255,0.05),transparent_60%)] blur-[100px] animate-float-delayed will-change-transform" />

          {/* Noise Texture Overlay (Professional Finish) */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>

        {/* 2. Floating Particles (Verspielt) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>

        {/* 3. Main Content Content */}
        <div className="relative z-10 w-full max-w-full px-5 sm:px-8 flex flex-col items-center text-center space-y-8 sm:space-y-12">

          {/* Premium Badge */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-medium tracking-wide text-white/90 uppercase">AdRuby Studio</span>
            </div>
          </div>

          {/* Colossal Typography */}
          <div className="space-y-4 animate-fade-in-up delay-100 max-w-4xl px-2">
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] sm:leading-[0.9] cursor-default break-words">
              <span
                onMouseEnter={() => headline.setIsHovered(true)}
                onMouseLeave={() => headline.setIsHovered(false)}
              >
                {headline.displayText}
              </span> <br className="block sm:hidden" />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF1F1F] via-[#ff4d4d] to-[#C80000] drop-shadow-2xl"
                onMouseEnter={() => subHeadline.setIsHovered(true)}
                onMouseLeave={() => subHeadline.setIsHovered(false)}
              >
                {subHeadline.displayText}
              </span>
            </h1>
            <p className="text-lg sm:text-2xl text-white/60 font-medium max-w-xl mx-auto leading-relaxed pt-4 px-4">
              Schluss mit langweiligen Ads. Erstelle High-End Creatives in Sekunden – <span className="text-white">powered by AI.</span>
            </p>
          </div>

          {/* 3. CTA Buttons (Atomic & Sleek) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up delay-200 w-full sm:w-auto px-4">
            <button
              onClick={onGetStarted}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(200,0,0,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-2xl ring-1 ring-white/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)] animate-pulse-glow" />
              <span className="relative z-10 flex items-center gap-2">
                Jetzt 7 Tage testen
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={onLogin}
              className="group w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Social Proof (Infinite Marquee) */}
          <div className="pt-16 sm:pt-20 w-full overflow-hidden mask-gradient-x relative">
            <div className="flex animate-marquee whitespace-nowrap gap-12 sm:gap-24 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 ease-out hover:opacity-100">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-12 sm:gap-24 items-center">
                  <span className="text-lg font-bold font-serif italic text-white flex items-center gap-2"><Sparkles className="w-4 h-4" />Vogue</span>
                  <span className="text-lg font-black tracking-tighter text-white">Supreme</span>
                  <span className="text-lg font-bold font-mono text-white">Shopify</span>
                  <span className="text-lg font-serif font-bold text-white tracking-widest">FORBES</span>
                  <span className="text-lg font-bold text-white flex items-center gap-1"><div className="w-4 h-4 bg-white rounded-full" />Medium</span>
                  <span className="text-lg font-extrabold tracking-tight text-white italic">NIKE</span>
                  <span className="text-lg font-mono text-white tracking-widest">WIRED</span>
                </div>
              ))}
            </div>

            {/* Fade Edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>

        </div>

        {/* 3D Visual Element (Bottom Anchor) */}
        <div className="absolute bottom-[-15%] sm:bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] sm:w-[80%] opacity-80 pointer-events-none z-0">
          <div className="relative w-full aspect-video bg-gradient-to-t from-[#FF1F1F]/20 to-transparent blur-[80px]" />
        </div>

      </div>


      {/* ============================================
          8-STUFEN KI-PIPELINE (DEEP RUBY GRID)
          ============================================ */}
      <section className="py-24 sm:py-32 bg-black relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF1F1F]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 sm:mb-24 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              KI die <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1F1F] to-rose-600">versteht</span>, <br className="hidden sm:block" />
              nicht nur generiert.
            </h2>
            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto font-medium">
              Vom weißen Blatt zur perfekten Ad in 8 Schritten.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { id: 1, title: 'Strategie', desc: 'Deep-Dive Analyse', icon: Target, color: 'from-blue-500 to-cyan-500' },
              { id: 2, title: 'Tokens', desc: 'Brand DNA Extrakt', icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
              { id: 3, title: 'Hooks', desc: 'Psychologie-Layer', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { id: 4, title: 'Cutout', desc: 'WASM Freisteller', icon: Eye, color: 'from-pink-500 to-rose-500' },
              { id: 5, title: 'Szene', desc: 'KI-Komposition', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
              { id: 6, title: 'Varianten', desc: 'Stil-Mutationen', icon: Zap, color: 'from-green-500 to-emerald-500' },
              { id: 7, title: 'Prognose', desc: 'RoAS Vorhersage', icon: LineChart, color: 'from-teal-500 to-cyan-500' },
              { id: 8, title: 'Export', desc: 'Meta API Push', icon: Rocket, color: 'from-[#C80000] to-rose-600' }
            ].map((step) => (
              <div
                key={step.id}
                onMouseMove={handleMouseMove}
                className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-500 overflow-hidden text-left"
              >
                {/* Spotlight Effect */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 31, 31, 0.15), transparent 40%)`
                  }}
                />

                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>

                <div className="relative z-10">
                  <div className="text-white/20 text-xs font-bold uppercase tracking-widest mb-2">Step 0{step.id}</div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
              </div>
            ))}
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
      </section >

      {/* ============================================
          KI INSIGHTS & PERFORMANCE
          ============================================ */}
      < section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-muted/30" >
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
      </section >

      {/* ============================================
          SOCIAL PROOF
          ============================================ */}
      {/* ============================================
          SOCIAL PROOF (DEEP RUBY)
          ============================================ */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-black via-[#0A0A0A] to-black text-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Vertraut von <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1F1F] to-rose-500">Marketern & Gründern</span>
            </h2>
          </div>

          {/* Testimonials Bento */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                quote: "Wir haben Ad-Erstellung von 2 Stunden auf 8 Minuten reduziert.",
                author: "Markus Klein",
                role: "Growth Lead, SaaS Startup",
                avatar: "MK",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                quote: "KI-Varianten schlagen unsere Best-Performer um 22% CTR.",
                author: "Julia Schmidt",
                role: "Performance Marketerin",
                avatar: "JS",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                quote: "Endlich skalierbare Workflows für unsere Agentur.",
                author: "Alexander Lang",
                role: "Agentur-Inhaber",
                avatar: "AL",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Quote className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg font-medium text-white/90 mb-8 relative z-10">"{t.quote}"</p>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.author}</div>
                    <div className="text-sm text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results Strip - Dark Mode */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "50.000+", label: "Ads erstellt", icon: Sparkles, color: "text-[#FF1F1F]" },
              { value: "14x", label: "Ø ROAS", icon: TrendingUp, color: "text-green-500" },
              { value: "86%", label: "Zeit gespart", icon: Zap, color: "text-yellow-500" },
              { value: "2.500+", label: "Aktive Nutzer", icon: Users, color: "text-blue-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FÜR WEN IST ADRUBY?
          ============================================ */}
      < section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-muted/30 to-background" >
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
      </section >

      {/* ============================================
          TRY IT LIVE - INTERACTIVE AI TEASER
          ============================================ */}
      < TryItLiveSection onGetStarted={onGetStarted} />

      {/* ============================================
          BEFORE / AFTER COMPARISON
          ============================================ */}
      < BeforeAfterSection />

      {/* ============================================
          REAL USE CASES
          ============================================ */}
      < RealUseCasesSection />

      {/* ============================================
          AI CONFIDENCE & TRUST
          ============================================ */}
      < AITrustSection />

      {/* ============================================
          PREISE
          ============================================ */}
      < section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background" >
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
      </section >

      {/* ============================================
          AFFILIATE CTA
          ============================================ */}
      < AffiliateCTASection />

      {/* ============================================
          SEO CONTENT
          ============================================ */}
      < SEOContentSection />

      {/* ============================================
          STICKY MOBILE CTA
          ============================================ */}
      < div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-card/95 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in slide-in-from-bottom" >
        <button
          onClick={onGetStarted}
          className="w-full min-h-[52px] py-3 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
          Jetzt kostenlos starten
          <ArrowRight className="w-5 h-5" />
        </button>
      </div >

      {/* ============================================
          FAQ
          ============================================ */}
      < section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-background" >
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
      </section >

      {/* ============================================
          FINAL CTA
          ============================================ */}
      < section className="py-32 px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-background relative overflow-hidden" >
        {/* Subtle noise texture */}
        < div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

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
      </section >

      {/* ============================================
          FOOTER
          ============================================ */}
      < footer className="border-t border-border/60" >
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
      </footer >

      {/* Styles */}
      < style > {`
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

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
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

          .tilt-card:hover {
            transform: scale(1.02);
          }
        }
        
        /* Scroll Reveal Animation */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        .animate-in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div >
  );
}
