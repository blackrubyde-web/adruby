import { useState, useRef } from 'react';
import {
  Check,
  Sparkles,
  Zap,
  Brain,
  BarChart3,
  Download,
  ChevronDown,
  ShieldCheck,
  Building2,
  Rocket,
  Crown,
  Info
} from 'lucide-react';
import { GlobalNav } from './landing/GlobalNav';
import { PageContainer } from './design-system';
import { MobileStickyCTA } from './landing/MobileStickyCTA';

interface PricingPageProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function PricingPage({ onNavigate, onSignIn, onGetStarted }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [calculatorAds, setCalculatorAds] = useState(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const calculateCredits = (ads: number) => {
    // Approx calculations: 10 credits per ad gen + 5 for resize/export
    return ads * 15;
  };

  const neededCredits = calculateCredits(calculatorAds);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '€0',
      period: 'dauerhaft',
      description: 'Für Gründer und Creator, die erste Ads testen.',
      credits: '100 Credits / Monat',
      icon: Rocket,
      features: [
        'Basis AI Text & Bild',
        'Bis zu 10 Ad-Variationen',
        'Performance Tracking',
        'Meta Ads Export',
        'Community Support',
      ],
      cta: 'Kostenlos starten',
      highlight: false,
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '€29' : '€24',
      period: 'Monat',
      description: 'Für Growth-Marketer, die skalieren wollen.',
      credits: '1.000 Credits / Monat',
      badge: 'Beliebteste Wahl',
      icon: Crown,
      features: [
        'Alles aus Starter',
        'Unlimitierte Ad-Variationen',
        'AI Performance Vorhersagen',
        'Deep Analytics & Insights',
        'A/B Testing Manager',
        'Priority Support',
      ],
      cta: '7 Tage kostenlos testen',
      highlight: true,
      color: 'rose'
    },
    {
      id: 'agency',
      name: 'Agency',
      price: billingCycle === 'monthly' ? '€99' : '€79',
      period: 'Monat',
      description: 'Für Agenturen mit mehreren Kunden.',
      credits: '5.000 Credits / Monat',
      icon: Building2,
      features: [
        'Alles aus Pro',
        'Team Collaboration',
        'Kundenfreigabe-Workflows',
        'Auto-Optimierung (Regeln)',
        'White-Label Reports',
        'Dedicated Account Manager',
      ],
      cta: '7 Tage kostenlos testen',
      highlight: false,
      color: 'purple'
    },
  ];

  const faqs = [
    {
      question: 'Was passiert nach der Testphase?',
      answer: 'Deine Testphase geht nach 7 Tagen automatisch in den gewählten Plan über. Du kannst jederzeit vorher kündigen - es entstehen keine Kosten.',
    },
    {
      question: 'Kann ich jederzeit kündigen?',
      answer: 'Ja, absolut. Du kannst dein Abo monatlich kündigen. Es gibt keine versteckten Laufzeiten oder Knebelverträge.',
    },
    {
      question: 'Was wenn meine Credits leer sind?',
      answer: 'Kein Problem. Du kannst jederzeit Credit-Packs nachkaufen oder einfach auf den nächsthöheren Plan upgraden. In Pro & Agency rollen ungenutzte Credits in den nächsten Monat über.',
    },
    {
      question: 'Bietet ihr Agentur-Preise an?',
      answer: 'Ja, unser Agency-Plan ist speziell dafür gebaut. Für Enterprise-Bedürfnisse mit mehr als 10 Accounts kontaktiere bitte unseren Sales.',
    },
    {
      question: 'Welche Zahlungsmethoden akzeptiert ihr?',
      answer: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex) sowie PayPal und SEPA-Lastschrift für jährliche Zahlungen.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative font-sans text-foreground">
      <GlobalNav
        currentPage="pricing"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <MobileStickyCTA onGetStarted={onGetStarted} showAfterRef={heroRef} isHidden={isMobileMenuOpen} />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[1000px] h-[1000px] bg-rose-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slower"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              Einfache Preise. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600">
                Maximaler Wert.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Starte kostenlos. Upgrade wenn du wächst. Keine versteckten Kosten.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monatlich</span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-16 h-8 rounded-full bg-card border border-rose-500/20 relative p-1 transition-colors hover:border-rose-500/50"
              >
                <div className={`w-6 h-6 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30 transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Jährlich <span className="text-emerald-500 font-bold text-xs ml-1">-20%</span>
              </span>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-white/5 backdrop-blur-sm text-sm font-medium">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>7 Tage kostenlos testen</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-white/5 backdrop-blur-sm text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Jederzeit kündbar</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-white/5 backdrop-blur-sm text-sm font-medium">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sofortiger Zugang</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 relative z-10">
        <PageContainer>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-3xl transition-all duration-300 group ${plan.highlight
                    ? 'bg-card border-rose-500 shadow-2xl shadow-rose-900/20 scale-105 z-10'
                    : 'bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/60'
                    } border backdrop-blur-xl flex flex-col h-full`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C80000] to-rose-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-rose-900/40">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'
                      }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground h-10">{plan.description}</p>
                  </div>

                  <div className="mb-8 p-4 rounded-2xl bg-background/50 border border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <Zap className="w-3 h-3 fill-current" />
                      {plan.credits}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-rose-500/20 text-rose-500' : 'bg-white/10 text-muted-foreground'
                          }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onGetStarted}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${plan.highlight
                      ? 'bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white shadow-lg hover:shadow-rose-500/25 hover:scale-[1.02]'
                      : 'bg-white/5 text-foreground hover:bg-white/10 border border-white/5'
                      }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* Credits Calculator Section */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <PageContainer>
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-4">Wie viele Credits brauche ich?</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Nutze unseren Rechner, um deinen Bedarf zu ermitteln. AdRuby Credits sind die Währung für alle AI-Aktionen.
              </p>

              <div className="bg-card border border-white/10 rounded-3xl p-8 backdrop-blur shadow-xl">
                <div className="mb-8">
                  <div className="flex justify-between mb-4">
                    <label className="font-semibold">Anzahl Ads pro Woche</label>
                    <span className="font-mono text-rose-500 font-bold">{calculatorAds} Ads</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={calculatorAds}
                    onChange={(e) => setCalculatorAds(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>1 Ad</span>
                    <span>100 Ads</span>
                  </div>
                </div>

                <div className="bg-background/50 rounded-2xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Benötigte Credits ca.</span>
                    <span className="text-2xl font-black">{neededCredits} / Monat</span>
                  </div>
                  <div className={`text-sm font-semibold flex items-center gap-2 ${neededCredits <= 100 ? 'text-blue-500' :
                    neededCredits <= 1000 ? 'text-rose-500' : 'text-purple-500'
                    }`}>
                    <Info className="w-4 h-4" />
                    Empfohlener Plan: {
                      neededCredits <= 100 ? 'Starter' :
                        neededCredits <= 1000 ? 'Pro' : 'Agency'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <Brain className="w-8 h-8 text-rose-500 mb-4" />
                <div className="font-bold mb-1">10 Credits</div>
                <div className="text-sm text-muted-foreground">pro generierter Ad</div>
              </div>
              <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
                <div className="font-bold mb-1">5 Credits</div>
                <div className="text-sm text-muted-foreground">pro AI-Prediction</div>
              </div>
              <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <Sparkles className="w-8 h-8 text-amber-500 mb-4" />
                <div className="font-bold mb-1">2 Credits</div>
                <div className="text-sm text-muted-foreground">pro Variation/Resize</div>
              </div>
              <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <Download className="w-8 h-8 text-green-500 mb-4" />
                <div className="font-bold mb-1">0 Credits</div>
                <div className="text-sm text-muted-foreground">für Export & Download</div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <PageContainer>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Häufig gestellte Fragen</h2>
              <p className="text-muted-foreground">Alles was du wissen musst.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${openFaqIndex === index
                    ? 'bg-card border-rose-500/30 shadow-lg'
                    : 'bg-card/30 border-white/5 hover:bg-card/50'
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left p-6 flex items-center justify-between"
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180 text-rose-500' : ''
                        }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-in-out ${openFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA Bottom */}
      <section className="py-20">
        <PageContainer>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#C80000] to-rose-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Bereit für bessere Ads?
              </h2>
              <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
                Schließe dich 10.000+ Marketern an, die ihre Performance mit AdRuby skalieren.
              </p>
              <button
                onClick={onGetStarted}
                className="bg-white text-rose-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
              >
                Kostenlos starten
              </button>
              <p className="mt-6 text-white/50 text-sm">Keine Kreditkarte erforderlich. 7 Tage Trial.</p>
            </div>
          </div>
        </PageContainer>
      </section>

    </div>
  );
}
