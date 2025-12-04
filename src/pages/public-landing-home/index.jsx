import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Star, CheckCircle, Brain, BarChart3, Target, Zap, Award } from 'lucide-react';
import Header from './components/Header';

const PublicLandingHome = () => {
  const handleWatchDemo = () => {
    // Placeholder action for the demo video CTA
    console.log('Demo-Video ansehen');
  };

  useEffect(() => {
    const seo = {
      title: 'AdRuby – KI-basiertes Meta Ads OS für E-Commerce, Agenturen & Coaches',
      description:
        'AdRuby kombiniert KI, Strategien und Meta Ads Setups. Schreibe, teste und skaliere profitabel Facebook & Instagram Ads – wie eine Top-Agentur, ohne Agenturpreise.',
      url: 'https://adruby.ai/',
      image: '/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png'
    };

    const upsertMeta = (key, value, attr = 'name') => {
      if (!value) return;
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    document.title = seo.title;
    upsertMeta('description', seo.description);
    upsertMeta('og:title', seo.title, 'property');
    upsertMeta('og:description', seo.description, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:url', seo.url, 'property');
    upsertMeta('og:image', seo.image, 'property');

    const scriptId = 'adruby-structured-data';
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = scriptId;
      document.head.appendChild(scriptTag);
    }
    const ldJson = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AdRuby',
      applicationCategory: 'Advertising, Marketing, Meta Ads',
      operatingSystem: 'Web',
      description: seo.description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: '30',
        availability: 'https://schema.org/InStock'
      },
      url: seo.url
    };
    scriptTag.textContent = JSON.stringify(ldJson);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  // Mock user avatars for social proof
  const userAvatars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=adruby${i + 1}&backgroundColor=red,blue,green&clothing=blazer,hoodie,sweater`
  }));

  // Partner/Brand logos (placeholder)
  const partnerBrands = [
    'Mercedes-Benz',
    'Adidas',
    'BMW',
    'Zalando',
    'Otto',
    'MediaMarkt'
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Strategie statt Zufalls-Ads',
      description:
        'AdRuby denkt in Funnel-Logik, Zielgruppen und Budgets – nicht in Zufalls-Kampagnen. Du bekommst exportierbare Meta Strategien, die ROAS und CPA klar im Blick haben.'
    },
    {
      icon: Zap,
      title: 'Creatives & Copy in Minuten',
      description:
        'Du gibst Produkt, Zielgruppe und Ziel ein – AdRuby generiert Hooks, Ad-Copy und Creative-Ideen mit Markt-Insights, damit du mehr Tests mit weniger Stress fährst.'
    },
    {
      icon: Brain,
      title: 'Meta Setup auf Autopilot',
      description:
        'Strukturierte Kampagnen-Setups, Budgetempfehlungen und Creative-Testing-Pläne – du setzt schneller um und stoppst, was ROAS killt.'
    },
    {
      icon: BarChart3,
      title: 'Aus Daten lernen, nicht raten',
      description:
        'AdRuby nutzt Wettbewerbs-Ads, deine Ergebnisse und Antworten, um Empfehlungen pro Test zu verbessern – weniger Raten, mehr Scaling.'
    }
  ];

  const icpSegments = [
    {
      title: 'E-Commerce & D2C Brands',
      description:
        'Du investierst ernsthaft in Meta Ads, willst profitabel skalieren und schneller neue Creatives testen.',
      link: '/meta-ads-tool-ecommerce',
      bullets: [
        'Scaling-Frameworks für D2C Funnels mit klaren Budgets',
        'Produkt-Hooks, UGC-Ideen und Ad-Copy, die ROAS treiben',
        'ROAS/CPA Alerts und Budget-Cluster nach Intent'
      ]
    },
    {
      title: 'Performance-Agenturen & Media Buyer',
      description:
        'Du willst mehr Kunden gleichzeitig betreuen, ohne in Copy- und Creative-Arbeit zu ersticken.',
      link: '/meta-ads-tool-agenturen',
      bullets: [
        'Strategie-Templates pro Kunde speicherbar und wiederverwendbar',
        'Schnelle Creative-Briefs & Copy-Blöcke für mehr Tests pro Woche',
        'Meta-Setups, die Onboarding und Freigaben verkürzen'
      ]
    },
    {
      title: 'Coaches, Kurse & Info-Produkte',
      description:
        'Du hast ein gutes Angebot, aber deine Ads brechen, sobald du skalierst.',
      link: '/meta-ads-tool-coaches',
      bullets: [
        'Storytelling-Hooks für High-Ticket-Angebote mit Proof',
        'Retargeting-Strecken für Webinare und Evergreen-Funnel',
        'Testpläne für kalte Zielgruppen, damit Skalierung hält'
      ]
    }
  ];

  const steps = [
    {
      title: '1. Ad & Produkt anlegen',
      description:
        'Du gibst Produkt, Ziel, Budget-Level und Zielgruppe ein oder importierst bestehende Ads. Fokus: ROAS/CPA-Ziel festlegen.'
    },
    {
      title: '2. Fragen beantworten',
      description:
        'AdRuby stellt dir ein kurzes, smartes Fragen-Set zu Funnel, Risiko-Level und KPIs – damit das Setup zu deinem Scaling-Plan passt.'
    },
    {
      title: '3. Strategie, Ads & Meta Setup erhalten',
      description:
        'Du bekommst eine komplette Strategie, Ad-Varianten und ein Setup zum Export – direkt im Meta Ads Manager umsetzbar.'
    }
  ];

  const testimonials = [
    {
      quote:
        'AdRuby liefert uns in Minuten ein komplettes Kampagnen-Setup. Wir testen 5x mehr Creatives pro Monat, ROAS steigt und Budget-Entscheidungen sind datenbasiert.',
      author: 'Sarah Weber',
      role: 'Marketing Director',
      company: 'E-Commerce Boutique',
      metric: '+35 % ROAS in 6 Wochen'
    },
    {
      quote:
        'Wir betreuen mehr Kunden parallel, ohne Qualität zu verlieren. Strategien, Copy und Setups liegen ready-to-use vor und sparen uns stundenlange Abstimmungen. Mehr Tests, weniger Burn.',
      author: 'Marcus Klein',
      role: 'Geschäftsführer',
      company: 'Performance-Agentur',
      metric: '5x mehr Creatives getestet'
    },
    {
      quote:
        'Von 2% auf 8% Conversion-Rate in vier Wochen. AdRuby zwingt uns, sauber zu testen, liefert Hooks und Zielgruppen auf Knopfdruck und hält den CPA unten.',
      author: 'Lisa Hoffmann',
      role: 'Founder',
      company: 'Coaching & Education',
      metric: '+300 % Conversions'
    }
  ];

  const featureDetails = [
    'KI-Strategie-Generator',
    'Ad-Creative & Copy Generator',
    'Meta Ads Setup Empfehlungen',
    'Kampagnen- & Test-Pläne',
    'Wettbewerbs-Analyse (Ads Inspiration)',
    'Speicherbare Strategien & Varianten'
  ];

  const faqs = [
    {
      question: 'Ist AdRuby nur ein weiterer AI-Textgenerator?',
      answer:
        'Nein. AdRuby ist ein Meta Ads OS: Wettbewerbsdaten, deine Inputs und Ergebnisse werden zu Strategien, Creatives und Setups verbunden – keine losen Textschnipsel.'
    },
    {
      question: 'Brauche ich trotzdem noch eine Agentur?',
      answer:
        'Wenn du Kapazität hast, ersetzt AdRuby viel Agenturarbeit. Mit Agentur liefert AdRuby Briefings, Tests und Setups, die Abstimmungen radikal verkürzen.'
    },
    {
      question: 'Funktioniert das für meine Branche?',
      answer:
        'Ja. Fragen und Vorlagen passen sich an Produkt, Budget-Level und Risiko an – egal ob E-Com, Services oder Info-Produkte.'
    },
    {
      question: 'Wie lange dauert es, bis ich Ergebnisse sehe?',
      answer:
        'Du erhältst in Minuten ein umsetzbares Setup. Erste Learnings kommen nach den ersten Tests – mit klaren ROAS/CPA-Signalen.'
    },
    {
      question: 'Kann ich AdRuby erstmal testen?',
      answer:
        'Ja. Starte mit dem kostenlosen Testzugang – kein Risiko, jederzeit kündbar.'
    },
    {
      question: 'Unterstützt AdRuby Teamarbeit?',
      answer:
        'Du kannst Strategien speichern, teilen und iterieren – inklusive einheitlicher Briefings für Creatives und Media Buyer.'
    },
    {
      question: 'Wie passt AdRuby in meinen bestehenden Workflow?',
      answer:
        'AdRuby liefert Strategien, Ad-Varianten und Setups, die du direkt im Meta Ads Manager umsetzt. Dein Workflow bleibt, nur schneller und klarer.'
    },
    {
      question: 'Welche Daten nutzt AdRuby?',
      answer:
        'Wir kombinieren deine Antworten, historische Performance und öffentliche Wettbewerbs-Ads, um Empfehlungen pro Testlauf zu verbessern.'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#0b0b0b]">
        <motion.div
          className="bg-[#C80000] text-white py-3 px-4 text-center text-sm font-medium relative"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center px-4">
            <Award className="w-4 h-4 shrink-0" />
            <span>Early Access Deal — 50% OFF + Free Mobile App & Pro Features!</span>
          </div>
        </motion.div>

        <main className="relative">
          {/* HERO */}
          <motion.section
            id="hero"
            aria-label="Hero"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-[#FAFAFA] scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-10 md:gap-12 lg:grid-cols-2 items-center">
                <div className="space-y-6">
                  <motion.p
                    variants={itemVariants}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C80000]"
                  >
                    KI-basiertes Meta Ads OS für E-Commerce, Agenturen & Coaches
                  </motion.p>

                  <motion.h1
                    variants={itemVariants}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#0b0b0b]"
                  >
                    Skaliere deine Meta Ads wie eine Top-Agentur – mit KI und klarer Strategie
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-base md:text-lg text-[#2c2c2c] leading-relaxed max-w-2xl space-y-3"
                  >
                    <span className="block">
                      AdRuby ist dein Meta Ads Betriebssystem: Wettbewerbs-Insights, Creative-Testing, Copy und Meta Setup in einem Flow.
                    </span>
                    <span className="block">
                      Du bekommst ROAS-orientierte Strategien, exportierbare Ads und Scaling-Playbooks in Minuten statt Tagen.
                    </span>
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
                  >
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <Link
                        to="/ad-ruby-registration"
                        className="w-full inline-flex items-center justify-center bg-[#C80000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a50000] transition-all duration-200 min-h-[44px]"
                      >
                        AdRuby kostenlos testen
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleWatchDemo}
                        className="w-full sm:w-auto border border-[#d4d4d4] text-[#0b0b0b] px-6 py-3 rounded-lg font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <PlayCircle size={20} />
                        Demo-Video ansehen
                      </button>
                    </motion.div>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-sm text-[#4a4a4a]"
                  >
                    Kein Risiko · Jederzeit kündbar · Für ROAS-getriebene Meta Ads Profis
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {userAvatars.map((user) => (
                          <div
                            key={user.id}
                            className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                          >
                            <img
                              src={user.avatar}
                              alt={`Avatar von ${user.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-[#4a4a4a]">
                        Vertraut von Performance-Marketer:innen, E-Com Brands und Media Buyern
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#6b6b6b] mb-3">
                        Marken, die AdRuby-Inspirationen nutzen
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {partnerBrands.map((brand) => (
                          <div
                            key={brand}
                            className="px-4 py-2 bg-white rounded-lg border border-[#ededed] text-sm text-[#3a3a3a] font-medium shadow-sm"
                          >
                            {brand}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="relative w-full"
                >
                  <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-2xl p-6 sm:p-8 max-w-xl mx-auto md:ml-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                          alt="AdRuby Dashboard Icon"
                          className="w-7 h-7 object-contain"
                        />
                        <div>
                          <p className="text-sm text-[#6b6b6b]">AdRuby OS</p>
                          <p className="font-semibold text-[#0b0b0b]">Meta Ads Blueprint</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#27ca3f] rounded-full" />
                        <span className="text-xs text-[#4a4a4a]">Live Sync</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#0f172a] text-white rounded-xl p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Strategie</h3>
                          <span className="text-xs bg-white/10 px-2 py-1 rounded">Full-Funnel</span>
                        </div>
                        <div className="space-y-2 text-sm text-white/80">
                          <div className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-[#22c55e] mt-0.5" />
                            <span>Budget-Cluster nach Intent und Funnel-Stufe</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-[#22c55e] mt-0.5" />
                            <span>Funnel: Prospecting → Warm → Hot, mit klaren KPIs (ROAS/CPA)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-[#22c55e] mt-0.5" />
                            <span>Testing Plan: 5 Hooks/Woche, auswertbar nach ROAS</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e5e7eb] space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-[#0b0b0b]">Ad Varianten</h3>
                          <span className="text-xs text-[#C80000] bg-[#fee2e2] px-2 py-1 rounded">Ready</span>
                        </div>
                        <div className="space-y-2 text-sm text-[#2c2c2c]">
                          <div className="rounded-lg bg-white border border-[#ededed] p-3">
                            <p className="font-semibold">Hook: „Stop Scrolling. Scale Profitably.“</p>
                            <p className="text-xs text-[#666] mt-1">Primary: UGC + Social Proof + klarer ROAS-CTA</p>
                          </div>
                          <div className="rounded-lg bg-white border border-[#ededed] p-3">
                            <p className="font-semibold">Copy: Performance-Playbook</p>
                            <p className="text-xs text-[#666] mt-1">CTA: „Meta Setup übernehmen“ – zero guesswork</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="col-span-2 bg-[#fff8f5] border border-[#f3dada] rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm text-[#7a1a1a]">Meta Setup</h3>
                          <span className="text-xs text-[#7a1a1a]">Exportierbar</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-[#5a5a5a]">
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#f1e5e5]">
                            <p className="font-semibold text-[#0b0b0b]">Kampagne</p>
                            <p className="text-xs mt-1">Conversions</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#f1e5e5]">
                            <p className="font-semibold text-[#0b0b0b]">Ad Sets</p>
                            <p className="text-xs mt-1">4 Zielgruppen</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-[#f1e5e5]">
                            <p className="font-semibold text-[#0b0b0b]">Ads</p>
                            <p className="text-xs mt-1">6 Varianten</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#ecfdf3] border border-[#d1fadf] rounded-xl p-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-[#16a34a] mb-2">Live KPIs</p>
                          <p className="text-2xl font-bold text-[#0b0b0b]">4.2x ROAS</p>
                          <p className="text-sm text-[#4a4a4a]">CPA -18% vs. letzte Woche</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#4a4a4a] mt-3">
                          <span>Letztes Update</span>
                          <span className="font-semibold text-[#0b0b0b]">vor 2 Min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="hidden lg:block absolute -left-16 top-10 bg-white rounded-xl border border-[#ededed] shadow-xl p-4 w-52 space-y-3"
                  >
                    <p className="text-xs uppercase tracking-[0.15em] text-[#7a1a1a]">Scaling Signals</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>CTR</span>
                      <span className="font-semibold text-[#C80000]">+340%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>CPC</span>
                      <span className="font-semibold text-[#C80000]">-60%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Spend</span>
                      <span className="font-semibold text-[#0b0b0b]">+18%</span>
                    </div>
                    <button className="w-full mt-2 text-xs font-semibold text-white bg-[#C80000] rounded-md py-2 hover:bg-[#a50000] transition-all">
                      Scaling starten
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* VALUE PROPOSITION / BENEFITS */}
          <motion.section
            id="benefits"
            aria-label="Value Proposition"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0b0b0b]">
                  Warum AdRuby dein Meta Ads Game verändert
                </h2>
                <p className="text-lg text-[#4a4a4a] max-w-3xl mx-auto">
                  Ein Meta Ads System, das Strategie, Creatives, Copy und Setup bündelt – damit du schneller testest, profitabler skalierst und ROAS statt Zufall bekommst.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    variants={itemVariants}
                    className="p-5 md:p-6 rounded-xl border border-[#ededed] bg-[#fafafa] hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#C80000]/10 text-[#C80000] flex items-center justify-center mb-4">
                      <benefit.icon size={20} />
                    </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#0b0b0b]">{benefit.title}</h3>
                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ICP / FÜR WEN */}
          <motion.section
            id="for-whom"
            aria-label="Zielgruppen"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-[#fafafa] scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0b0b0b]">
                    Für wen ist AdRuby gebaut?
                  </h2>
                  <p className="text-lg text-[#4a4a4a] max-w-3xl mx-auto">
                  AdRuby ist gebaut für Teams, die Meta Ads ernst meinen: klare Workflows pro ICP, weniger Rätselraten, mehr ROAS.
                  </p>
                </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {icpSegments.map((segment) => (
                  <motion.div
                    key={segment.title}
                    variants={itemVariants}
                    className="p-6 rounded-xl border border-[#e5e5e5] bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-[#0b0b0b]">{segment.title}</h3>
                    <p className="text-sm text-[#4a4a4a] mb-4 leading-relaxed">{segment.description}</p>
                    <ul className="space-y-2 text-sm text-[#2c2c2c]">
                      {segment.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-[#C80000] mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={segment.link}
                      className="inline-flex items-center gap-2 text-[#C80000] font-semibold text-sm mt-4 px-3 py-2 rounded-md underline md:no-underline"
                      aria-label={`${segment.title} - Mehr erfahren`}
                    >
                      Mehr erfahren
                      <span aria-hidden="true">→</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* HOW IT WORKS */}
          <motion.section
            id="how-it-works"
            aria-label="So funktioniert AdRuby"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#0b0b0b]">So funktioniert AdRuby</h2>
                <p className="text-lg text-[#4a4a4a]">In drei Schritten von Idee zu ROAS-orientiertem Meta Setup.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    className="p-6 rounded-xl border border-[#ededed] bg-[#fafafa] relative overflow-hidden"
                  >
                    <span className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#C80000]/10 text-[#C80000] flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold mb-2 text-[#0b0b0b]">{step.title}</h3>
                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-[#4a4a4a] mt-8"
              >
                Alles in unter 10 Minuten – statt Stunden in Sheets, Notizen und random Kampagnen.
              </motion.p>
            </div>
          </motion.section>

          {/* SOCIAL PROOF */}
          <motion.section
            id="social-proof"
            aria-label="Social Proof"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-[#0f0f10] text-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Was AdRuby-Kund:innen sagen</h2>
                <p className="text-lg text-white/70">
                  Case Studies aus E-Commerce, Agenturen und Education – Fokus: ROAS, CPA, Creative-Speed.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.author}
                    variants={itemVariants}
                    className="p-6 rounded-xl bg-white text-[#0b0b0b] shadow-lg"
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-[#C80000] fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-[#2c2c2c] leading-relaxed mb-6">“{testimonial.quote}”</p>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-[#0b0b0b]">{testimonial.author}</p>
                        <p className="text-[#4a4a4a]">{testimonial.role}</p>
                        <p className="text-[#6b6b6b] text-xs">{testimonial.company}</p>
                      </div>
                      <span className="text-[#C80000] font-semibold text-right">{testimonial.metric}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* FEATURE DETAILS */}
          <motion.section
            id="features"
            aria-label="Feature Details"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0b0b0b]">
                  Alles, was du für profitable Meta Ads brauchst – in einem Tool
                </h2>
                <p className="text-lg text-[#4a4a4a] max-w-3xl mx-auto">
                  Vom ersten Hook bis zum fertigen Meta Setup: AdRuby liefert dir konsistente Outputs, die du sofort nutzen kannst.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featureDetails.map((feature) => (
                  <motion.div
                    key={feature}
                    variants={itemVariants}
                    className="p-5 md:p-6 rounded-xl border border-[#ededed] bg-[#fafafa] hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-[#0b0b0b] mb-2">{feature}</h3>
                    <p className="text-sm text-[#4a4a4a]">
                      AdRuby liefert klare ROAS/CPA-Empfehlungen, Saves und Exporte – weniger Zeit im Ads Manager, mehr Zeit für Tests.
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            id="faq"
            aria-label="FAQ"
            className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-[#fafafa] scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0b0b0b]">Häufige Fragen zu AdRuby</h2>
                <p className="text-lg text-[#4a4a4a]">Klare Antworten auf die wichtigsten Meta Ads Einwände.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((faq) => (
                  <motion.div
                    key={faq.question}
                    variants={itemVariants}
                    className="p-5 md:p-6 rounded-xl border border-[#e5e5e5] bg-white shadow-sm space-y-2"
                  >
                    <h3 className="font-semibold text-[#0b0b0b] mb-2">{faq.question}</h3>
                    <p className="text-sm text-[#4a4a4a] leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Frequently Searched */}
          <motion.section
            id="popular-searches"
            aria-label="Häufig gesucht"
            className="py-12 md:py-14 px-4 md:px-8 lg:px-16 bg-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-5xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b0b0b]">Häufig gesucht</h2>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm font-semibold"
              >
                <Link
                  to="/facebook-ads-agentur-alternative"
                  className="text-[#C80000] hover:underline px-3 py-2 rounded-md"
                >
                  Alternative zur Facebook Ads Agentur
                </Link>
                <Link
                  to="/adcreative-ai-alternative"
                  className="text-[#C80000] hover:underline px-3 py-2 rounded-md"
                >
                  AdCreative.ai Alternative
                </Link>
                <Link
                  to="/madgicx-alternative"
                  className="text-[#C80000] hover:underline px-3 py-2 rounded-md"
                >
                  Madgicx Alternative
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* FINAL CTA */}
          <motion.section
            id="final-cta"
            aria-label="Final Call to Action"
            className="py-14 md:py-16 px-4 md:px-8 lg:px-16 bg-[#C80000] text-white scroll-mt-24"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="max-w-5xl mx-auto text-center space-y-6">
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold leading-tight"
              >
                Bereit, deine Meta Ads profitabel zu skalieren?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-white/90 max-w-3xl mx-auto"
              >
                Starte mit klaren Strategien, fertigen Anzeigen und einem Meta Setup, das in Minuten steht.
                Weniger Rätselraten, mehr ROAS, weniger verbranntes Budget.
              </motion.p>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      to="/ad-ruby-registration"
                      className="inline-flex items-center justify-center bg-white text-[#C80000] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto min-h-[44px]"
                    >
                  AdRuby kostenlos testen
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={handleWatchDemo}
                    className="w-full sm:w-auto border border-white/40 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 min-h-[44px]"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Kurzberatung buchen
                  </motion.button>
              </motion.div>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="bg-[#000000] text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-12 mb-12">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                    alt="AdRuby Markenlogo"
                    loading="lazy"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold">AdRuby</span>
                </div>
                <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                  KI-powered Meta Ads OS für Marketer:innen & Agencies. Strategien, Creatives, Copy und Setup
                  in einem Workflow.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Produkt</h4>
                <div className="space-y-3">
                  {['KI-Strategie', 'Ad Generator', 'Meta Setup', 'Analytics', 'API Access'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4">Unternehmen</h4>
                <div className="space-y-3">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800">
              <div className="flex items-center gap-8 mb-6 lg:mb-0">
                <span className="text-sm text-gray-400">© 2025 AdRuby. Alle Rechte vorbehalten.</span>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">Impressum</a>
                  <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
                  <a href="#" className="hover:text-white transition-colors">AGB</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.013C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicLandingHome;
