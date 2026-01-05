import { useState, useRef } from 'react';
import {
  Check,
  Rocket,
  Crown,
  Building2,
  ChevronDown
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { MobileStickyCTA } from './landing/MobileStickyCTA';

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

  // Spotlight Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

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
      features: [
        'Advanced AI Models (GPT-4o)',
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
    }
  ];

  return (
    <div className="landing-theme-root min-h-screen bg-black font-sans text-foreground overflow-x-hidden selection:bg-rose-500/30">
      <GlobalNav
        currentPage="pricing"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-rose-600/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <section ref={heroRef} className="relative z-10 pt-32 pb-20 sm:pt-48 sm:pb-32">
        <div className="landing-container">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-8 text-white">
              Investiere in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Wachstum.</span>
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Faire Preise für jede Phase. Starte kostenlos und skaliere, wenn deine Ads profitabel sind.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/60'}`}>Monatlich</span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-16 h-8 rounded-full bg-white/10 border border-white/10 p-1 relative transition-colors hover:bg-white/20"
              >
                <div className={`w-6 h-6 rounded-full bg-rose-500 shadow-lg transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-white/60'}`}>
                Jährlich <span className="text-rose-500 text-xs ml-1">(-20%)</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, _i) => {
              const isPro = plan.id === 'pro';
              return (
                <div
                  key={plan.id}
                  onMouseMove={handleMouseMove}
                  className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${isPro
                    ? 'bg-white/10 border-rose-500/50 shadow-[0_0_40px_rgba(225,29,72,0.15)] md:-mt-8 md:mb-8 z-10'
                    : 'bg-black/40 border-white/10 hover:border-white/20 backdrop-blur-xl'
                    } overflow-hidden`}
                >
                  <div className="spotlight absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {isPro && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isPro ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/5 text-white/80'}`}>
                        <plan.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-white/60 text-sm h-10">{plan.description}</p>
                    </div>

                    <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">€{plan.price}</span>
                        <span className="text-white/60 text-sm">{plan.period}</span>
                      </div>
                      <div className="mt-2 text-xs font-mono text-white/40 uppercase tracking-wider">
                        {plan.credits}
                      </div>
                    </div>

                    <ul className="flex-1 space-y-4 mb-8">
                      {plan.features.map((feature: string, _i: number) => (
                        <li key={_i} className="flex items-start gap-3 text-sm text-white/80">
                          <Check className={`w-5 h-5 shrink-0 ${isPro ? 'text-rose-500' : 'text-white/40'}`} />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isPro
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 hover:scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        }`}
                    >
                      {plan.cta}
                    </button>
                    {isPro && (
                      <p className="text-center text-xs text-white/40 mt-4">Kreditkarte erforderlich. Jederzeit kündbar.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-32">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Häufige Fragen</h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 cursor-pointer"
                >
                  <div className="p-6 flex items-center justify-between gap-4">
                    <h4 className="text-lg font-medium text-white group-hover:text-rose-400 transition-colors">{faq.q}</h4>
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                  </div>
                  <div className={`grid transition-all duration-300 ${openFaqIndex === i ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden px-6">
                      <p className="text-white/60 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
