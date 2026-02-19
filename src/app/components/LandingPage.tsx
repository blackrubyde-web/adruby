import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Eye,
  ChevronDown,
  MessageCircle,
  Quote,
  TrendingUp,
  Users,
  Shield,
  Lock,
  Heart,
} from 'lucide-react';
import { Card } from './ui/card';
import { PageContainer, SectionHeader, SecondaryButton } from './design-system';
import { PricingCard } from './landing/MarketingComponents';
import { TryItLiveSection } from './landing/TryItLiveSection';
import { BeforeAfterSection } from './landing/BeforeAfterSection';
import { RealUseCasesSection } from './landing/RealUseCasesSection';
import { AITrustSection } from './landing/AITrustSection';
import { AffiliateCTASection } from './landing/AffiliateCTASection';
import { SEOContentSection } from './landing/SEOContentSection';
import { GlobalNav } from './landing/GlobalNav';
import { MobileStickyCTA } from './landing/MobileStickyCTA';
import { DashboardShowcaseSection } from './landing/DashboardShowcaseSection';
import { PainPointsSection } from './landing/PainPointsSection';
import { ObjectionHandlingSection } from './landing/ObjectionHandlingSection';
import { useParticles } from '../hooks/useParticles';
import { PIPELINE_STEPS, TESTIMONIALS, FAQS, PERSONAS } from './landing/landing-constants';

// ─── Motion variants ────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

// ─── Component ──────────────────────────────────────────
interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate?: (page: string) => void;
}

export function LandingPage({ onGetStarted, onLogin, onNavigate }: LandingPageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const particles = useParticles(18);

  // Spotlight effect for pipeline cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="landing-theme-root min-h-screen w-full bg-black font-sans text-foreground overflow-x-hidden selection:bg-rose-500/30 landing-page">

      {/* ── NAVIGATION ────────────────────────────── */}
      <GlobalNav
        currentPage="home"
        onNavigate={(page) => onNavigate?.(page)}
        onSignIn={onLogin}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* ── HERO ──────────────────────────────────── */}
      <div className="relative min-h-[600px] sm:min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center pt-20 sm:pt-24 pb-12 overflow-hidden w-full max-w-[100vw]">

        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none -z-20">
          <div className="absolute top-[-10%] left-[-10%] w-[120vw] h-[120vw] sm:w-[800px] sm:h-[800px] bg-[radial-gradient(circle_at_center,rgba(230,57,70,0.2),transparent_70%)] blur-[80px] animate-pulse-slow will-change-transform" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-[radial-gradient(circle_at_center,rgba(60,60,255,0.04),transparent_60%)] blur-[100px] animate-float-delayed will-change-transform" />
          <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-25">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-float"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                boxShadow: '0 0 8px rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Text */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Badge */}
              <motion.div variants={fadeUp} className="inline-flex">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/15 backdrop-blur-xl shadow-2xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-white/90">🚀 500+ Marketer vertrauen AdRuby</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp} className="space-y-4">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  WERBUNG DIE{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-rose-500 to-[#FF6B6B] animate-gradient-x">
                    KNALLT.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/55 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Erstelle High-Converting Ads in <span className="text-white font-semibold">unter 2 Minuten</span> – KI analysiert, optimiert und liefert.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative px-6 py-3 sm:px-7 sm:py-3.5 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 text-white rounded-full font-bold text-sm sm:text-base hover:shadow-[0_0_30px_rgba(230,57,70,0.5)] transition-shadow flex items-center gap-2 overflow-hidden shadow-xl"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Kostenlos starten</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group px-6 py-3 sm:px-7 sm:py-3.5 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-full font-semibold text-sm sm:text-base hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Live Demo</span>
                </motion.button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                {['7 Tage kostenlos', 'Keine Kreditkarte', 'DSGVO-konform 🇩🇪'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{badge}</span>
                  </div>
                ))}
              </motion.div>

              {/* Mini Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                {[
                  { value: '50K+', label: 'Ads erstellt', color: 'text-white' },
                  { value: '8.2x', label: 'Ø ROAS', color: 'text-emerald-500' },
                  { value: '2min', label: 'Pro Ad', color: 'text-white' },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className={`text-2xl sm:text-3xl font-black ${s.color} font-display`}>{s.value}</div>
                    <div className="text-xs text-white/40 font-medium">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT: Dashboard Preview */}
            <motion.div variants={scaleIn} className="relative hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#E63946]/20 via-rose-500/10 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />

                {/* Dashboard Card */}
                <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-800/90 to-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* macOS Chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-white/40 font-mono">adruby.de/studio</span>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ROAS', value: '8.2x', color: 'text-emerald-500' },
                        { label: 'CTR', value: '4.1%', color: 'text-blue-400' },
                        { label: 'CPA', value: '€12', color: 'text-purple-400' },
                      ].map((m) => (
                        <div key={m.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="text-xs text-white/40 mb-1">{m.label}</div>
                          <div className={`text-xl font-bold ${m.color} font-display`}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ad Preview Mini */}
                    <div className="bg-gradient-to-br from-[#E63946]/10 to-rose-600/5 rounded-xl p-4 border border-[#E63946]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-rose-600 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Neue Ad generiert</div>
                          <div className="text-xs text-white/40">KI-Konfidenz: 94%</div>
                        </div>
                        <div className="ml-auto">
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">TOP</span>
                        </div>
                      </div>
                      <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex items-center justify-center border border-white/5">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-[#E63946]/30 to-rose-600/30 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-rose-400" />
                          </div>
                          <span className="text-xs text-white/40">Dein Creative hier</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-white/80">KI empfiehlt: Budget +20% für 3.2x mehr Conversions</span>
                    </div>
                  </div>
                </div>

                {/* Floating accents */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl animate-pulse delay-1000" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-t from-[#E63946]/8 to-transparent blur-[100px] pointer-events-none" />
      </div>

      {/* ── 8-STEP KI PIPELINE ────────────────────── */}
      <section className="py-24 sm:py-32 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E63946]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16 sm:mb-24"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              KI die <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-600">versteht</span>,{' '}
              <br className="hidden sm:block" />
              nicht nur generiert.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto font-medium">
              Vom weißen Blatt zur perfekten Ad in 8 Schritten.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {PIPELINE_STEPS.map((step) => (
              <motion.div
                key={step.id}
                variants={fadeUp}
                onMouseMove={handleMouseMove}
                className="group relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-500 overflow-hidden text-left"
              >
                {/* Spotlight */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(230, 57, 70, 0.12), transparent 40%)' }}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>

                <div className="relative z-10">
                  <div className="text-white/20 text-xs font-bold uppercase tracking-widest mb-2">Step 0{step.id}</div>
                  <h3 className="font-display text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE ────────────────────── */}
      <DashboardShowcaseSection />

      {/* ── PAIN POINTS ───────────────────────────── */}
      <PainPointsSection />

      {/* ── KI INSIGHTS & PERFORMANCE ─────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-muted/30">
        <PageContainer>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-10 sm:mb-12 px-4"
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              KI <span className="text-primary">erstellt</span> nicht nur Ads — sie <span className="text-primary">optimiert</span> sie
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligente Insights die Performance automatisch verbessern
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeUp}>
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold">Performance</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1 font-display">8.2x</div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Erwarteter ROAS</p>
                <div className="p-2.5 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs font-semibold text-green-600">Hohe Konfidenz (94%)</p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold">Klickrate (CTR)</h3>
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 font-display">4.1%</div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Über Branchen-Ø (2.3%)</p>
                <div className="p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600">Exzellente Performance erwartet</p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
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
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────── */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-black via-[#0A0A0A] to-black text-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16 sm:mb-20"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-black mb-6">
              Vertraut von <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-500">Marketern & Gründern</span>
            </motion.h2>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 mb-16 sm:mb-20"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden group hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg font-medium text-white/90 mb-8 relative z-10 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.author}</div>
                    <div className="text-sm text-white/40">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Strip */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: '50.000+', label: 'Ads erstellt', icon: Sparkles, color: 'text-[#E63946]' },
              { value: '14x', label: 'Ø ROAS', icon: TrendingUp, color: 'text-green-500' },
              { value: '86%', label: 'Zeit gespart', icon: Zap, color: 'text-yellow-500' },
              { value: '2.500+', label: 'Aktive Nutzer', icon: Users, color: 'text-blue-500' },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center hover:bg-white/[0.07] transition-colors duration-300">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-black text-white mb-1 font-display">{stat.value}</div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FÜR WEN IST ADRUBY? ──────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-muted/30 to-background">
        <PageContainer>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-12 px-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Entwickelt für <span className="text-primary">Marketer & Gründer</span>
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8">
              {PERSONAS.map((persona, index) => (
                <motion.div key={index} variants={fadeUp}>
                  <Card className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <persona.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-4">{persona.title}</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Herausforderung</p>
                        <p className="text-sm font-medium text-red-600">{persona.pain}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Unsere Lösung</p>
                        <p className="text-sm font-medium">{persona.solution}</p>
                      </div>
                      <div className="pt-3 border-t border-border/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ergebnis</p>
                        <p className="font-bold text-green-600">{persona.outcome}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ── TRY IT LIVE ───────────────────────────── */}
      <TryItLiveSection onGetStarted={onGetStarted} />

      {/* ── BEFORE / AFTER ────────────────────────── */}
      <BeforeAfterSection />

      {/* ── REAL USE CASES ────────────────────────── */}
      <RealUseCasesSection />

      {/* ── AI TRUST ──────────────────────────────── */}
      <AITrustSection />

      {/* ── OBJECTION HANDLING ────────────────────── */}
      <ObjectionHandlingSection />

      {/* ── PRICING ───────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <PageContainer>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-12 px-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Einfache, transparente Preise</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Ein Plan. Alle Features. Keine Überraschungen.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-lg mx-auto">
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
              <Card className="mt-6">
                <h4 className="font-semibold mb-2">Was sind Credits?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Jede KI-Generierung verbraucht ~10 Credits. 1.000 Credits = ~100 Ad-Varianten. Mehr benötigt? Jederzeit zusätzliche Credits kaufen.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ── AFFILIATE CTA ─────────────────────────── */}
      <AffiliateCTASection />

      {/* ── SEO CONTENT ───────────────────────────── */}
      <SEOContentSection />

      {/* ── STICKY MOBILE CTA ─────────────────────── */}
      {!isMobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-card/95 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in slide-in-from-bottom">
          <motion.button
            onClick={onGetStarted}
            whileTap={{ scale: 0.95 }}
            className="w-full min-h-[52px] py-3 bg-gradient-to-r from-[#c01830] via-rose-600 to-red-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2"
          >
            Jetzt kostenlos starten
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/20 via-background to-background">
        <PageContainer>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-12 px-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Häufig gestellte Fragen</h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {FAQS.map((faq, index) => (
                <motion.div key={index} variants={fadeUp}>
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}

              <Card className="bg-primary/5 border-primary/20 text-center">
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Noch Fragen?</h3>
                <p className="text-sm text-muted-foreground mb-4">Unser Team hilft Ihnen gerne weiter</p>
                <SecondaryButton className="mx-auto">Support kontaktieren</SecondaryButton>
              </Card>
            </div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E63946]/8 via-purple-500/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E63946]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] " />

        <PageContainer className="relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              Starten Sie jetzt mit der
              <br />
              Generierung von Ads
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 px-4">
              Keine Kreditkarte erforderlich.
            </motion.p>
            <motion.div variants={fadeUp}>
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#c01830] via-rose-600 to-red-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-[0_0_40px_rgba(230,57,70,0.3)] transition-shadow shadow-xl inline-flex items-center gap-2"
              >
                Erste Ad generieren
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="border-t border-border/60 relative overflow-hidden">
        {/* Subtle gradient glow at top */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <PageContainer className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-2 pr-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">AdRuby</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
                KI-gestützte Ad-Plattform für Marketer & Gründer. Skaliere deine Meta Ads mit künstlicher Intelligenz.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'X / Twitter', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                  { label: 'LinkedIn', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                  { label: 'YouTube', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
                ].map(({ label, icon }) => (
                  <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation columns */}
            {[
              {
                title: 'Produkt', links: [
                  { label: 'Features', onClick: () => onNavigate?.('features') },
                  { label: 'Preise', onClick: () => onNavigate?.('pricing') },
                  { label: 'AI Generator', onClick: () => onNavigate?.('feature-ai-generator') },
                  { label: 'Creative Studio', onClick: () => onNavigate?.('feature-creative-library') },
                ],
              },
              {
                title: 'Unternehmen', links: [
                  { label: 'Über uns', onClick: () => { } },
                  { label: 'Blog', onClick: () => { } },
                  { label: 'Karriere', onClick: () => { } },
                  { label: 'Kontakt', onClick: () => { } },
                ],
              },
              {
                title: 'Rechtliches', links: [
                  { label: 'Datenschutz', onClick: () => { } },
                  { label: 'AGB', onClick: () => { } },
                  { label: 'Impressum', onClick: () => { } },
                  { label: 'Cookie-Richtlinie', onClick: () => { } },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-foreground/80 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map(({ label, onClick }) => (
                    <li key={label}>
                      <button onClick={onClick} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 text-left">
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 py-6 rounded-2xl bg-muted/30 border border-border/40">
            {[
              { icon: <Shield className="w-4 h-4" />, label: 'DSGVO-konform' },
              { icon: <Lock className="w-4 h-4" />, label: 'SSL-verschlüsselt' },
              { icon: <Shield className="w-4 h-4" />, label: 'SOC 2 Type II' },
              { icon: <CheckCircle className="w-4 h-4" />, label: '99.9% Uptime' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="text-primary/70">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AdRuby by BLACKRUBY UG. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Hergestellt mit</span>
              <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>in Deutschland</span>
            </div>
          </div>
        </PageContainer>

        {/* Bottom gradient accent */}
        <div className="h-1 bg-gradient-to-r from-primary via-red-500 to-orange-400" />
      </footer>

      {/* ── Inline Keyframes ──────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1) translateX(0); opacity: 0.3; }
          50% { transform: scale(1.1) translateX(20px); opacity: 0.5; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: pulse-slow 12s ease-in-out infinite 2s; }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 4s ease infinite;
        }
        .font-display { font-family: 'Satoshi', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}
