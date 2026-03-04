import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Rocket,
  Crown,
  Building2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle,
  Heart,
  Zap,
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { MobileStickyCTA } from './landing/MobileStickyCTA';

// ─── Motion variants ────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

// ─── Component ──────────────────────────────────────────
interface PricingPageProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function PricingPage({ onNavigate, onSignIn, onGetStarted }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '0',
      period: 'dauerhaft',
      description: 'Für Gründer und Creator, die erste Ads testen.',
      credits: '100 Credits / Monat',
      icon: Rocket,
      highlight: false,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Basis AI Text & Bild',
        '3 Brand-Personas',
        'Standard Templates',
        'Community Support',
      ],
      cta: 'Kostenlos starten'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '49' : '39',
      period: 'pro Monat',
      description: 'Für Brands, die profitabel skalieren wollen.',
      credits: '2.500 Credits / Monat',
      icon: Crown,
      highlight: true,
      gradient: 'from-[#E63946] to-rose-500',
      features: [
        'Gemini 2.5 Flash AI',
        'Unlimitierte Brand-Personas',
        'Premium Templates & Videos',
        'Auto-Resize (alle Formate)',
        'Priority Support',
        'Kommerzielle Lizenzen'
      ],
      cta: '7 Tage kostenlos testen'
    },
    {
      id: 'agency',
      name: 'Agency',
      price: billingCycle === 'monthly' ? '199' : '159',
      period: 'pro Monat',
      description: 'Für Agenturen mit hohen Volumen.',
      credits: '10.000 Credits / Monat',
      icon: Building2,
      highlight: false,
      gradient: 'from-violet-500 to-purple-500',
      features: [
        'Alles aus Pro',
        'White-Labeling',
        'Team-Management (5 User)',
        'API Zugriff',
        'Dedicated Success Manager',
        'Custom Integrationen'
      ],
      cta: 'Sales kontaktieren'
    }
  ];

  const faqs = [
    {
      q: "Kann ich jederzeit kündigen?",
      a: "Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kündigen. Es gibt keine versteckten Laufzeiten."
    },
    {
      q: "Was passiert, wenn meine Credits leer sind?",
      a: "Du kannst jederzeit Credits nachkaufen oder auf das nächsthöhere Paket upgraden. Nicht genutzte Credits verfallen am Monatsende nicht, sondern werden in den nächsten Monat übertragen (bis zum 3-fachen deines Monatslimits)."
    },
    {
      q: "Gibt es einen Rabatt für jährliche Zahlung?",
      a: "Ja, bei jährlicher Zahlung sparst du ca. 20% gegenüber der monatlichen Abrechnung."
    },
    {
      q: "Welche Zahlungsarten werden akzeptiert?",
      a: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex) sowie SEPA-Lastschrift über Stripe."
    },
  ];

  return (
    <div className="landing-theme-root min-h-screen bg-[#050507] font-body text-white overflow-x-hidden selection:bg-rose-500/30">
      <GlobalNav
        currentPage="pricing"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[30%] w-[600px] h-[600px] bg-[#E63946]/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* ── Hero ─────────────────────────────── */}
      <section ref={heroRef} className="relative z-10 pt-36 pb-16 sm:pt-48 sm:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E63946]/[0.08] border border-[#E63946]/[0.15] mb-8">
              <Zap className="w-4 h-4 text-[#E63946]" />
              <span className="text-sm font-semibold text-[#E63946]">Pricing</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              Investiere in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-rose-400 to-[#ff6b6b]">
                Wachstum.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Faire Preise für jede Phase. Starte kostenlos und skaliere, wenn deine Ads profitabel sind.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monatlich</span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-16 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] p-1 transition-colors hover:bg-white/[0.1]"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-[#E63946] to-rose-500 shadow-lg shadow-[#E63946]/30 transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`} />
              </button>
              <span className={`text-sm font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40'}`}>
                Jährlich
                <span className="ml-2 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400">-20%</span>
              </span>
            </motion.div>
          </motion.div>

          {/* ── Pricing Cards ─────────────────── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {plans.map((plan) => {
              const isPro = plan.id === 'pro';
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden ${isPro
                    ? 'bg-white/[0.06] border-[#E63946]/30 shadow-[0_0_50px_rgba(230,57,70,0.1)] md:-mt-4 md:mb-4'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                >
                  {/* Top accent */}
                  {isPro && (
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E63946] to-transparent" />
                  )}

                  <div className="relative z-10 flex flex-col h-full p-8">
                    {/* Header */}
                    <div className="mb-8">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${plan.gradient} ${isPro ? 'shadow-lg shadow-[#E63946]/30' : ''}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-2xl font-bold text-white">{plan.name}</h3>
                        {isPro && (
                          <span className="px-2.5 py-1 bg-[#E63946]/15 border border-[#E63946]/25 rounded-full text-[10px] font-bold text-[#E63946] uppercase tracking-wider">Beliebt</span>
                        )}
                      </div>
                      <p className="text-sm text-white/40 h-10">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-display font-bold text-white">€{plan.price}</span>
                        <span className="text-sm text-white/40">{plan.period}</span>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
                        {plan.credits}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-3.5 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                          <Check className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${isPro ? 'text-[#E63946]' : 'text-white/20'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-xl font-bold text-base transition-all ${isPro
                        ? 'bg-gradient-to-r from-[#E63946] to-rose-500 hover:from-[#d42e3b] hover:to-rose-400 text-white shadow-lg shadow-[#E63946]/20 hover:shadow-[#E63946]/30 hover:scale-[1.02]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                    >
                      {plan.cta}
                    </button>
                    {isPro && (
                      <p className="text-center text-xs text-white/30 mt-3">Kreditkarte erforderlich. Jederzeit kündbar.</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────── */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white text-center mb-12">
              Häufig gestellte{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-400">Fragen</span>
            </motion.h2>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button
                    className="w-full text-left bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 overflow-hidden"
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  >
                    <div className="flex items-center justify-between p-6">
                      <h4 className="font-semibold text-white pr-4">{faq.q}</h4>
                      <ChevronDown className={`w-5 h-5 text-white/30 shrink-0 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {openFaqIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 text-sm text-white/40 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────── */}
      <section className="relative z-10 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E63946]/[0.06] via-transparent to-violet-500/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E63946]/[0.08] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
              Bereit loszulegen?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/40 mb-10">
              Starte mit dem kostenlosen Plan und upgrade jederzeit.
            </motion.p>
            <motion.div variants={fadeUp}>
              <button
                onClick={onGetStarted}
                className="group px-10 py-5 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(230,57,70,0.3)] hover:shadow-[0_0_50px_rgba(230,57,70,0.4)] transition-all inline-flex items-center gap-3"
              >
                Kostenlos starten
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E63946]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-red-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">AdRuby</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, label: 'DSGVO-konform' },
                { icon: <Lock className="w-3.5 h-3.5" />, label: 'SSL verschlüsselt' },
                { icon: <CheckCircle className="w-3.5 h-3.5" />, label: '99.9% Uptime' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/25">
                  <span className="text-[#E63946]/40">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/20">
              <span>© {new Date().getFullYear()} BLACKRUBY UG</span>
              <Heart className="w-3 h-3 text-[#E63946] fill-[#E63946]" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
