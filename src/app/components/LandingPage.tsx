import { useState, useRef } from 'react';
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
  Shield,
  Lock,
  Heart,
  BarChart3,
  Target,
  Palette,
  Layers,
  Play,
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { MobileStickyCTA } from './landing/MobileStickyCTA';
import { useParticles } from '../hooks/useParticles';
import { PIPELINE_STEPS, TESTIMONIALS, FAQS, PERSONAS } from './landing/landing-constants';

// ─── Motion variants ────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
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
  const particles = useParticles(12);

  return (
    <div className="landing-theme-root min-h-screen w-full bg-[#050507] font-body text-white overflow-x-hidden selection:bg-rose-500/30 landing-page">

      {/* ── NAVIGATION ────────────────────────────── */}
      <GlobalNav
        currentPage="landing"
        onNavigate={(page) => onNavigate?.(page)}
        onSignIn={onLogin}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* ══════════════════════════════════════════════
          HERO SECTION — Cinematic Full Viewport
          ══════════════════════════════════════════════ */}
      <section ref={heroRef as React.RefObject<HTMLElement>} className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

        {/* Deep Background Layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Radial gradient mesh */}
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle_at_center,rgba(230,57,70,0.15),transparent_60%)] blur-[80px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(120,50,180,0.08),transparent_60%)] blur-[100px]" />
          <div className="absolute top-[60%] left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] blur-[80px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
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
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-24 pb-12"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Social Proof Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-white/70">Powered by Google Gemini 2.5 · DSGVO-konform 🇩🇪</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={fadeUp} className="text-center max-w-5xl mx-auto mb-8">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95]">
              <span className="text-white">Ads die</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-rose-400 to-[#ff6b6b] animate-text-gradient">
                performen.
              </span>
              <br />
              <span className="text-white/40 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Nicht raten — wissen.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-center text-lg sm:text-xl text-white/50 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            KI-gestützte Meta Ads: generieren, launchen, <span className="text-white/80 font-semibold">automatisch skalieren</span>. Gemini analysiert deine Performance und optimiert Creatives in Echtzeit.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.03, boxShadow: '0 0 50px rgba(230,57,70,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(230,57,70,0.3)] overflow-hidden flex items-center gap-3"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              <Rocket className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Kostenlos starten</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group px-8 py-4 bg-white/[0.04] backdrop-blur-md text-white border border-white/[0.12] rounded-2xl font-semibold text-lg hover:bg-white/[0.08] hover:border-white/[0.2] transition-all flex items-center gap-3"
            >
              <Play className="w-5 h-5" />
              <span>Live Demo</span>
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 mb-16">
            {['7 Tage kostenlos testen', 'Jederzeit kündbar', 'Keine Kreditkarte nötig'].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-white/40 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{badge}</span>
              </div>
            ))}
          </motion.div>

          {/* ── Floating Dashboard Mockup ──────────── */}
          <motion.div variants={scaleIn} className="relative max-w-5xl mx-auto">
            {/* Glow Orb Behind Dashboard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.2),rgba(120,50,180,0.1),transparent_70%)] blur-[60px] pointer-events-none" />

            {/* Dashboard Container */}
            <div className="relative float-3d-card rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl overflow-hidden">
              {/* macOS Chrome Bar */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                    <span className="text-xs text-white/30 font-mono">app.adruby.de/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 sm:p-8">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs text-white/40 font-medium uppercase tracking-widest mb-1">Dashboard</div>
                    <div className="text-xl font-display font-bold">Guten Tag, Marketer 👋</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-semibold text-emerald-400">● Live</div>
                    <div className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white/50">Heute</div>
                  </div>
                </div>

                {/* Metric Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { label: 'ROAS', value: '8.2x', change: '+24%', color: 'text-emerald-400', icon: TrendingUp },
                    { label: 'Spend', value: '€4.2K', change: '-8%', color: 'text-blue-400', icon: BarChart3 },
                    { label: 'CTR', value: '4.1%', change: '+12%', color: 'text-violet-400', icon: Eye },
                    { label: 'CPA', value: '€12', change: '-15%', color: 'text-amber-400', icon: Target },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{m.label}</span>
                        <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                      </div>
                      <div className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-1">{m.change}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row — AI Insight */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E63946]/[0.08] to-violet-500/[0.04] rounded-2xl border border-[#E63946]/[0.15]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-rose-600 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">KI-Empfehlung</div>
                    <div className="text-xs text-white/50">Budget +20% auf Top-Creatives → 3.2x mehr Conversions erwartet</div>
                  </div>
                  <span className="hidden sm:flex px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full">94% Konfidenz</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
          STATS STRIP
          ══════════════════════════════════════════════ */}
      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '72+', label: 'Ad-Archetypen', icon: Sparkles },
              { value: '< 2 Min', label: 'pro Ad Creative', icon: Zap },
              { value: '100%', label: 'Gemini AI', icon: Brain },
              { value: '8 Schritte', label: 'zum Launch', icon: Rocket },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                <stat.icon className="w-5 h-5 text-[#E63946] mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES BENTO GRID
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E63946]/[0.04] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E63946]/[0.08] border border-[#E63946]/[0.15] mb-6">
              <Sparkles className="w-4 h-4 text-[#E63946]" />
              <span className="text-sm font-semibold text-[#E63946]">Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              KI die <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">versteht</span>,
              <br className="hidden sm:block" />
              nicht nur generiert.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-2xl mx-auto">
              Vom weißen Blatt zur perfekten Ad in Sekunden.
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { icon: Sparkles, title: 'AI Ad Generator', desc: 'One-Click Ads aus deinem Produkt — Headlines, Copy, Creatives.', color: 'from-rose-500 to-red-600', size: 'lg:col-span-2' },
              { icon: Layers, title: 'Creative Library', desc: 'Organisiere, tagge und finde deine besten Creatives instant.', color: 'from-violet-500 to-purple-600', size: '' },
              { icon: Rocket, title: 'Campaign Builder', desc: 'Baue & launche Meta-Kampagnen Schritt für Schritt.', color: 'from-blue-500 to-cyan-600', size: '' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Tracke ROAS, CTR, CPA in Echtzeit über alle Kampagnen.', color: 'from-emerald-500 to-green-600', size: '' },
              { icon: Brain, title: 'KI-Analyse', desc: 'Automatische Insights, Empfehlungen und Anomaly Detection.', color: 'from-amber-500 to-orange-600', size: '' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`group relative bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 overflow-hidden ${feature.size}`}
                >
                  {/* Hover gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FÜR WEN? — Persona Cards
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mb-6">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-400">Für wen?</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Gebaut für <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Performance-Teams</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  className="group relative bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-4">{p.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      </div>
                      <p className="text-sm text-white/40">{p.pain}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                      </div>
                      <p className="text-sm text-white/60">{p.solution}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      </div>
                      <p className="text-sm text-emerald-400 font-semibold">{p.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AI PIPELINE — 8 Steps (Real Architecture)
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E63946]/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E63946]/[0.08] border border-[#E63946]/[0.15] mb-6">
              <Brain className="w-4 h-4 text-[#E63946]" />
              <span className="text-sm font-semibold text-[#E63946]">AI Pipeline</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              8 Schritte. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">Eine KI.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-2xl mx-auto">
              Jede Ad durchläuft unsere vollautomatische Pipeline — von der Strategie-Analyse bis zum Meta API Push.
            </motion.p>
          </motion.div>

          {/* Pipeline Flow — Horizontal Scroll on Mobile */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="relative"
          >
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[44px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            <div className="flex gap-3 overflow-x-auto pb-4 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-4 snap-x snap-mandatory scrollbar-hide">
              {PIPELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    variants={fadeUp}
                    className="min-w-[200px] sm:min-w-[220px] lg:min-w-0 snap-center"
                  >
                    <div className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 h-full relative">
                      {/* Step number badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-xs text-white/30">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Scroll hint for mobile */}
            <div className="flex justify-center mt-4 lg:hidden">
              <div className="flex items-center gap-1.5 text-xs text-white/20">
                <ArrowRight className="w-3 h-3" />
                <span>Scrollen für mehr</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          KI INSIGHTS SECTION
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E63946]/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              KI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">erstellt</span> nicht nur Ads —
              <br className="hidden sm:block" /> sie <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">optimiert</span> sie
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-2xl mx-auto">
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
            {/* Performance Card */}
            <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-white">Performance</h3>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-5xl font-display font-bold text-emerald-400 mb-2">8.2x</div>
              <p className="text-sm text-white/40 mb-6">Erwarteter ROAS</p>
              <div className="p-3 bg-emerald-500/[0.08] border border-emerald-500/[0.15] rounded-xl">
                <p className="text-xs font-semibold text-emerald-400">Hohe Konfidenz (94%)</p>
              </div>
            </motion.div>

            {/* CTR Card */}
            <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-white">Klickrate</h3>
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-5xl font-display font-bold text-blue-400 mb-2">4.1%</div>
              <p className="text-sm text-white/40 mb-6">Über Branchen-Ø (2.3%)</p>
              <div className="p-3 bg-blue-500/[0.08] border border-blue-500/[0.15] rounded-xl">
                <p className="text-xs font-semibold text-blue-400">Exzellente Performance erwartet</p>
              </div>
            </motion.div>

            {/* AI Recommendations Card */}
            <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:border-violet-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-white">KI-Empfehlungen</h3>
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-emerald-500/[0.06] border border-emerald-500/[0.12] rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-white/70">Video-Ads übertreffen Bilder um 34%</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-white/70">Zielgruppen-Überschneidung erkannt</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-500/[0.06] border border-blue-500/[0.12] rounded-xl">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-white/70">Budget um 20% erhöhen</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF / TESTIMONIALS
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Vertraut von <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">Marketern & Gründern</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:border-white/[0.12] transition-all duration-300 group"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-white/[0.04] group-hover:text-white/[0.08] transition-colors" />
                <p className="text-lg font-medium text-white/80 mb-8 leading-relaxed relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.author}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMPARISON TABLE — Warum AdRuby?
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Vergleich</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Warum <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">AdRuby</span>?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-2xl mx-auto">
              Kein weiteres Template-Tool. Eine vollständige Ad-Operations-Plattform.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-0 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="p-5">
                <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Feature</span>
              </div>
              <div className="p-5 text-center border-l border-white/[0.06]">
                <div className="text-sm font-bold text-white/50">Native Tools</div>
                <div className="text-[10px] text-white/20">Meta / Google</div>
              </div>
              <div className="p-5 text-center border-l border-white/[0.06]">
                <div className="text-sm font-bold text-white/50">Andere KI-Tools</div>
                <div className="text-[10px] text-white/20">AdCreative.ai etc.</div>
              </div>
              <div className="p-5 text-center border-l border-[#E63946]/20 bg-[#E63946]/[0.04]">
                <div className="text-sm font-bold text-[#E63946]">AdRuby</div>
                <div className="text-[10px] text-[#E63946]/60">Powered by Gemini</div>
              </div>
            </div>

            {/* Table Rows */}
            {[
              { feature: 'KI-Creative-Generierung', native: false, others: true, adruby: true },
              { feature: 'Multimodal (Text + Bild + Video)', native: false, others: false, adruby: true },
              { feature: 'Direkt zu Meta publizieren', native: true, others: false, adruby: true },
              { feature: 'Auto-Scaling mit Safety Limits', native: false, others: false, adruby: true },
              { feature: 'KI-Kampagnen-Analyse', native: false, others: false, adruby: true },
              { feature: '72+ psychologische Archetypen', native: false, others: false, adruby: true },
              { feature: 'DSGVO-konform (EU-Hosting)', native: true, others: false, adruby: true },
              { feature: 'Alles in einem Workflow', native: false, others: false, adruby: true },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-4 gap-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'} ${i < 7 ? 'border-b border-white/[0.04]' : ''}`}>
                <div className="p-4 flex items-center">
                  <span className="text-sm text-white/60">{row.feature}</span>
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/[0.04]">
                  {row.native ? (
                    <CheckCircle className="w-4.5 h-4.5 text-white/20" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/[0.08]" />
                  )}
                </div>
                <div className="p-4 flex items-center justify-center border-l border-white/[0.04]">
                  {row.others ? (
                    <CheckCircle className="w-4.5 h-4.5 text-white/20" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/[0.08]" />
                  )}
                </div>
                <div className="p-4 flex items-center justify-center border-l border-[#E63946]/10 bg-[#E63946]/[0.02]">
                  {row.adruby ? (
                    <CheckCircle className="w-4.5 h-4.5 text-[#E63946]" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/[0.08]" />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING — Inline Preview
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E63946]/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Einfache, transparente <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">Preise</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-xl mx-auto">
              Starte kostenlos. Skaliere wenn es läuft.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { name: 'Free', price: '€0', period: 'dauerhaft', features: ['100 Credits/Monat', 'Basis AI', '3 Personas'], highlight: false },
              { name: 'Pro', price: '€49', period: '/Monat', features: ['2.500 Credits/Monat', 'Gemini 2.5 Flash AI', 'Premium Templates', 'Priority Support'], highlight: true },
              { name: 'Agency', price: '€199', period: '/Monat', features: ['10.000 Credits/Monat', 'White-Labeling', 'Team (5 User)', 'API Zugriff'], highlight: false },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-3xl p-8 border transition-all duration-300 ${plan.highlight
                  ? 'bg-white/[0.06] border-[#E63946]/30 shadow-[0_0_40px_rgba(230,57,70,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E63946] to-transparent" />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#E63946] to-rose-500 rounded-full text-xs font-bold text-white shadow-lg shadow-[#E63946]/30">Beliebt</div>
                  </>
                )}
                <h3 className="font-display text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-[#E63946]' : 'text-white/20'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={plan.name === 'Agency' ? undefined : onGetStarted}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all ${plan.highlight
                    ? 'bg-[#E63946] hover:bg-[#d42e3b] text-white shadow-lg shadow-[#E63946]/20'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]'
                    }`}
                >
                  {plan.highlight ? '7 Tage kostenlos testen' : plan.name === 'Agency' ? 'Sales kontaktieren' : 'Kostenlos starten'}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mt-8"
          >
            <button
              onClick={() => onNavigate?.('pricing')}
              className="text-sm font-semibold text-[#E63946] hover:text-rose-400 transition-colors inline-flex items-center gap-1"
            >
              Alle Preise vergleichen <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white text-center mb-12">
              Häufig gestellte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">Fragen</span>
            </motion.h2>

            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <motion.div key={index} variants={fadeUp}>
                  <button
                    className="w-full text-left bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 overflow-hidden"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <div className="flex items-center justify-between p-6">
                      <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="w-5 h-5 text-white/30 shrink-0" />
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
                          <p className="px-6 pb-6 text-sm text-white/40 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
              <MessageCircle className="w-8 h-8 text-[#E63946] mx-auto mb-3" />
              <h3 className="font-display font-bold text-white mb-2">Noch Fragen?</h3>
              <p className="text-sm text-white/40 mb-4">Unser Team hilft dir gerne weiter</p>
              <button className="px-6 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-semibold text-white transition-all">
                Support kontaktieren
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E63946]/[0.06] via-violet-500/[0.03] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E63946]/[0.08] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Bereit, deinen CPA zu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">halbieren</span>?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 mb-10">
              Starte kostenlos — KI generiert, testet und skaliert deine besten Ads automatisch.
            </motion.p>
            <motion.div variants={fadeUp}>
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(230,57,70,0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="px-10 py-5 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(230,57,70,0.3)] inline-flex items-center gap-3"
              >
                Erste Ad generieren
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E63946]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-2 pr-8">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/images/adruby-logo.png" alt="AdRuby" className="w-9 h-9 object-contain" />
                <span className="font-display font-bold text-xl tracking-tight text-white">AdRuby</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                KI-gestützte Ad-Plattform für Marketer & Gründer. Skaliere deine Meta Ads mit künstlicher Intelligenz.
              </p>
            </div>

            {/* Nav Columns */}
            {[
              {
                title: 'Produkt', links: [
                  { label: 'Features', onClick: () => onNavigate?.('features') },
                  { label: 'Preise', onClick: () => onNavigate?.('pricing') },
                  { label: 'AI Generator', onClick: () => onNavigate?.('feature-ai-generator') },
                ]
              },
              {
                title: 'Unternehmen', links: [
                  { label: 'Über uns', onClick: () => { } },
                  { label: 'Blog', onClick: () => { } },
                  { label: 'Kontakt', onClick: () => { } },
                ]
              },
              {
                title: 'Rechtliches', links: [
                  { label: 'Datenschutz', onClick: () => onNavigate?.('datenschutz') },
                  { label: 'AGB', onClick: () => onNavigate?.('agb') },
                  { label: 'Impressum', onClick: () => onNavigate?.('impressum') },
                  { label: 'Widerruf', onClick: () => onNavigate?.('widerruf') },
                ]
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/50 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map(({ label, onClick }) => (
                    <li key={label}>
                      <button onClick={onClick} className="text-sm text-white/30 hover:text-white transition-colors">
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 py-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            {[
              { icon: <Shield className="w-4 h-4" />, label: 'DSGVO-konform' },
              { icon: <Lock className="w-4 h-4" />, label: 'SSL-verschlüsselt' },
              { icon: <CheckCircle className="w-4 h-4" />, label: '99.9% Uptime' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-white/30 font-medium">
                <span className="text-[#E63946]/50">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} AdRuby by BLACKRUBY UG. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/20">
              <span>Hergestellt mit</span>
              <Heart className="w-3.5 h-3.5 text-[#E63946] fill-[#E63946]" />
              <span>in Deutschland</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600" />
      </footer>


      {/* ── Inline Keyframes ──────────────────────── */}
      <style>{`
        .font-display { font-family: 'Clash Display', 'Satoshi', system-ui, sans-serif; }
        .font-body { font-family: 'Satoshi', 'General Sans', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}
