import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  CheckCircle,
  Brain,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  SlidersHorizontal,
  Filter,
  Copy,
  Save,
  Share,
  Download,
  ArrowUpRight,
  Command,
  Sparkle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Video,
  FileSpreadsheet
} from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const sampleAds = [
  {
    headline: 'Erreiche deine Ziele 3x schneller',
    hook: 'Social proof + Klarer Nutzen',
    primaryText:
      'Über 50.000 Kunden nutzen unseren Tracker, um mehr Fokus und Energie in den Alltag zu bringen. 14 Tage kostenlos testen.',
    description: 'Perfekt für E-Com & Fitness | deutsch',
    cta: 'Jetzt testen',
    ctr: '+238%',
    hookScore: '9.2/10'
  },
  {
    headline: 'Mehr Umsatz mit weniger Ad-Spend',
    hook: 'Value-first Offer',
    primaryText:
      'Starte mit 1.000 kostenlosen Credits und lass die KI deine besten Creatives bauen. Ohne Kreditkarte, sofort live.',
    description: 'B2B SaaS | englisch',
    cta: 'Free Trial starten',
    ctr: '+312%',
    hookScore: '9.5/10'
  },
  {
    headline: 'Lokale Leads in 48 Stunden',
    hook: 'Dringlichkeit + Lokal',
    primaryText:
      'Für Coaches & Agenturen: KI-generierte Anzeigen, die hyperlokal targeten. Mehr Termine, weniger Streuverlust.',
    description: 'Local Service | deutsch',
    cta: 'Demo sichern',
    ctr: '+186%',
    hookScore: '8.7/10'
  }
];

const AdRubyAdBuilder = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState('idle'); // idle | scraping | analyzing | done | error
  const [scrapedAds, setScrapedAds] = useState([]);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('');
  const [market, setMarket] = useState('');
  const [language, setLanguage] = useState('de');
  const [searchUrl, setSearchUrl] = useState('');
  const [filterObjective, setFilterObjective] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('ctr');
  const [selectedTab, setSelectedTab] = useState('creatives'); // creatives | placements | ugc | compliance | insights

  const handleStartFreeTrial = () => {
    navigate('/ad-ruby-registration');
  };

  const handleUseSampleData = () => {
    setError(null);
    setStep('done');
    setGeneratedAds(sampleAds);
  };

  const handleAdCreationStart = async () => {
    setError(null);
    setIsRunning(true);
    setStep('scraping');
    setGeneratedAds([]);
    setScrapedAds([]);

    try {
      const scrapeRes = await fetch('/api/ad-research-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchUrl,
          maxAds: 30
        })
      });

      if (!scrapeRes.ok) {
        throw new Error(`Scraping failed with status ${scrapeRes.status}`);
      }

      const scrapeData = await scrapeRes.json();
      const items = scrapeData.items || [];

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
          'Es konnten keine Ads aus der Facebook Ads Library geladen werden. Bitte URL oder Filter anpassen.'
        );
      }

      setScrapedAds(items);
      setStep('analyzing');

      const aiRes = await fetch('/api/ai-ad-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userBriefing: {
            product,
            goal,
            market,
            language
          },
          scrapedAds: items
        })
      });

      if (!aiRes.ok) {
        throw new Error(`AI analysis failed with status ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      const finalAds = aiData.ads || aiData.results || [];

      if (!Array.isArray(finalAds) || finalAds.length === 0) {
        throw new Error('Die KI konnte aus den Daten keine Ads generieren. Bitte Eingaben prüfen.');
      }

      setGeneratedAds(finalAds);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Unbekannter Fehler bei der Ad-Erstellung');
      setStep('error');
    } finally {
      setIsRunning(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  const filteredAds = useMemo(() => {
    let ads = [...generatedAds];
    if (filterObjective !== 'all') {
      ads = ads.filter((ad) =>
        (ad.objective || ad.description || '').toLowerCase().includes(filterObjective)
      );
    }
    if (filterLanguage !== 'all') {
      ads = ads.filter((ad) => (ad.language || language).toLowerCase().includes(filterLanguage));
    }
    if (sortBy === 'ctr') {
      ads.sort((a, b) => parseFloat((b.ctr || '').replace(/[^\d.-]/g, '')) - parseFloat((a.ctr || '').replace(/[^\d.-]/g, '')));
    }
    return ads;
  }, [generatedAds, filterObjective, filterLanguage, sortBy, language]);

  const progressSteps = [
    { key: 'scraping', label: 'Scraping', active: step === 'scraping', done: step !== 'idle' && step !== 'scraping' },
    { key: 'analyzing', label: 'Analyse', active: step === 'analyzing', done: step === 'done' || step === 'error' },
    { key: 'done', label: 'Ergebnisse', active: step === 'done', done: step === 'done' }
  ];

  const placementPacks = useMemo(() => {
    const base = filteredAds.length ? filteredAds : sampleAds;
    return base.slice(0, 3).map((ad, idx) => ({
      placement: idx === 0 ? 'Feed' : idx === 1 ? 'Stories' : 'Reels',
      headline: ad.headline,
      cta: ad.cta || 'Jetzt starten',
      textShort: (ad.primaryText || '').slice(0, 120),
      overlay: ad.headline,
      ratio: idx === 0 ? '1:1 / 4:5' : idx === 1 ? '9:16' : '9:16',
      score: ad.ctr || '+200% CTR'
    }));
  }, [filteredAds]);

  const ugcScripts = useMemo(
    () => [
      {
        hook: 'Problem/Solution',
        scenes: [
          'Hook: “Keiner erzählt dir, dass…” (2s)',
          'Demo: Produkt im Einsatz (12s)',
          'Social Proof: Screenshot/Review (6s)',
          'CTA: “Hol dir 1.000 kostenlose Credits” (4s)'
        ],
        cta: 'Jetzt testen'
      },
      {
        hook: 'Before/After',
        scenes: [
          'Hook: Vorher-Frust zeigen (3s)',
          'After: Ergebnis in 5s highlighten (10s)',
          'Claim + Proof: “+340% CTR” (5s)',
          'CTA: “In 15s zur fertigen Ad” (4s)'
        ],
        cta: 'Demo ansehen'
      }
    ],
    []
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <motion.section
          className="relative pt-18 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-10 hero-grid overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(244,45,99,0.12),transparent_30%)]" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.08em] text-white/80">
                AI Copilot
              </span>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 mb-4">
              {['HubSpot', 'Shopify', 'Meta Partner', 'Stripe'].map((brand) => (
                <span
                  key={brand}
                  className="text-white/60 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5"
                >
                  {brand}
                </span>
              ))}
            </div>

            <div className="grid gap-10 xl:grid-cols-2 xl:gap-12 items-start">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs">
                    <Command size={14} />
                    Command Palette (⌘K)
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs">
                    <Sparkle size={14} />
                    Auto-Suggestions an
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  {['HubSpot', 'Shopify', 'Meta Partner', 'Stripe'].map((brand) => (
                    <span
                      key={brand}
                      className="text-white/60 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
                <motion.h1
                  variants={itemVariants}
                  className="text-[clamp(2.3rem,6vw,3.8rem)] font-semibold leading-[1.05] text-white"
                >
                  Baue performante Ads in <span className="text-primary">Sekunden</span> – von Briefing
                  bis Creative.
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-white/80 leading-relaxed max-w-2xl"
                >
                  Scrape Top-Ads, lass die KI analysieren und erhalte sofort exportfertige Creatives mit
                  CTA, Hook-Score und Performance-Prognose. Mobile-first, zero friction.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#c32252] transition-smooth flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Award className="w-5 h-5" />
                    1.000 Credits kostenlos starten
                  </motion.button>
                  <motion.button
                    className="w-full sm:w-auto border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-smooth flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Demo ansehen
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-5 glass-panel rounded-2xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-primary mb-1">15s</div>
                    <div className="text-xs text-white/70">Durchschnittliche Erstellung</div>
                  </div>
                  <div className="text-center border-x border-white/10 px-2">
                    <div className="text-2xl font-semibold text-primary mb-1">+340%</div>
                    <div className="text-xs text-white/70">CTR Lift</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-primary mb-1">4.2x</div>
                    <div className="text-xs text-white/70">ROAS</div>
                  </div>
                </motion.div>
              </div>

              {/* Form + Preview */}
              <motion.div
                variants={itemVariants}
                className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                      <Brain className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Briefing</p>
                      <p className="text-base font-semibold text-white">Ad Builder</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUseSampleData}
                    className="text-xs text-white/70 hover:text-white transition-smooth underline"
                  >
                    Sample laden
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm text-white/70">Ads Library URL</label>
                    <input
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://facebook.com/ads/library/..."
                      value={searchUrl}
                      onChange={(e) => setSearchUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Produkt</label>
                    <input
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="z.B. Fitness Tracker"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Ziel</label>
                    <input
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Leads, Sales, Trial..."
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Zielgruppe / Markt</label>
                    <input
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="DACH, E-Com, B2B SaaS..."
                      value={market}
                      onChange={(e) => setMarket(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Sprache</label>
                    <select
                      className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">Englisch</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['E-Com', 'SaaS', 'Local'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setGoal(preset === 'E-Com' ? 'Sales' : preset === 'SaaS' ? 'Trials' : 'Leads');
                        setMarket(preset === 'Local' ? 'Regionale Dienstleistung' : preset);
                      }}
                    className="px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-xs border border-white/10 hover:border-primary/50"
                  >
                    {preset}
                  </button>
                  ))}
                  <button
                    onClick={() => {
                      setGoal('Awareness');
                      setMarket('Global');
                      setLanguage('en');
                    }}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/30 hover:border-primary/60"
                  >
                    Global Brand
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/70">Fortschritt</p>
                    {step === 'error' && (
                      <span className="text-xs text-red-300">Fehler: {error}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {progressSteps.map((s) => (
                      <div
                        key={s.key}
                        className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                          s.done ? 'bg-primary/10 text-primary' : s.active ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${s.done ? 'bg-primary' : s.active ? 'bg-white' : 'bg-white/30'}`} />
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAdCreationStart}
                    disabled={isRunning}
                    className="w-full sm:w-auto bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#c32252] transition-smooth flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Zap size={18} />
                    {isRunning ? 'Läuft...' : 'Ads generieren'}
                  </button>
                  <button
                    onClick={handleUseSampleData}
                    className="w-full sm:w-auto border border-white/15 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/10 transition-smooth flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Sample Ergebnisse
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Results */}
        <section className="py-14 px-4 sm:px-6 lg:px-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60 uppercase tracking-[0.12em]">Workspace</p>
                  <h2 className="text-2xl font-semibold text-white">Deine Ad Suite</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  {['creatives', 'placements', 'ugc', 'compliance', 'insights'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`px-3 py-2 rounded-lg border transition-smooth ${
                        selectedTab === tab
                          ? 'border-primary bg-primary/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                      }`}
                    >
                      {tab === 'creatives' && 'Creatives'}
                      {tab === 'placements' && 'Placement Packs'}
                      {tab === 'ugc' && 'UGC Scripts'}
                      {tab === 'compliance' && 'Compliance'}
                      {tab === 'insights' && 'Insights'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/60">
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Mobile-ready
                </span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Live-Preview
                </span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  Exportfertig
                </span>
              </div>
            </div>

            {selectedTab === 'creatives' && step === 'idle' && (
              <div className="glass-panel rounded-xl p-6 border border-white/10 text-white/80">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-primary" />
                  <p>Starte den Flow oder lade Sample-Ergebnisse, um Vorschläge zu sehen.</p>
                </div>
              </div>
            )}

            {selectedTab === 'creatives' && isRunning && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass-panel rounded-xl p-4 border border-white/10 animate-pulse h-44"
                  />
                ))}
              </div>
            )}

            {selectedTab === 'creatives' && step === 'error' && (
              <div className="glass-panel rounded-xl p-6 border border-red-400/30 text-red-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <p>Fehler bei der Generierung: {error}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleUseSampleData}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
                  >
                    Sample laden
                  </button>
                  <button
                    onClick={handleAdCreationStart}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
                  >
                    Erneut versuchen
                  </button>
                </div>
              </div>
            )}

            {selectedTab === 'placements' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {placementPacks.map((pack, idx) => (
                  <div
                    key={idx}
                    className="glass-panel rounded-xl p-4 border border-white/10 hover:-translate-y-1 transition-spatial flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-white/50">{pack.placement}</p>
                        <h3 className="text-lg font-semibold text-white mt-1">{pack.headline}</h3>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                        {pack.score}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">{pack.textShort}</p>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Ratio: {pack.ratio}</span>
                      <span>Overlay: {pack.overlay?.slice(0, 28)}...</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Copy size={14} />
                        Copy
                      </button>
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'ugc' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ugcScripts.map((script, idx) => (
                  <div
                    key={idx}
                    className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-primary" />
                      <p className="text-sm uppercase tracking-[0.14em] text-white/60">{script.hook}</p>
                    </div>
                    <ul className="text-sm text-white/80 space-y-2">
                      {script.scenes.map((scene) => (
                        <li key={scene} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{scene}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">CTA: {script.cta}</span>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                          <Download size={14} />
                          PDF
                        </button>
                        <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                          <Copy size={14} />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'compliance' && (
              <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <p className="text-sm font-semibold text-white">Policy Check & Heatmap</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80">
                  <p>
                    Achtung: <span className="bg-amber-500/30 px-1 rounded">“schnell abnehmen”</span>{' '}
                    könnte als Health-Claim markiert werden. Vorschlag:{' '}
                    <span className="bg-green-500/20 px-1 rounded">“gesünder fühlen”</span>.
                  </p>
                  <p className="mt-2">
                    Vermeide personalisierte Attribute wie{' '}
                    <span className="bg-red-500/30 px-1 rounded">“für Mütter über 40”</span>. Nutze stattdessen
                    <span className="bg-green-500/20 px-1 rounded"> “für vielbeschäftigte Teams”</span>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-primary text-white">
                    <ShieldCheck size={14} />
                    Auto-Rewrite
                  </button>
                  <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-white/10 text-white">
                    <ShieldAlert size={14} />
                    Risiken anzeigen
                  </button>
                </div>
              </div>
            )}

            {selectedTab === 'insights' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-primary" />
                    <p className="text-sm text-white">Performance Muster</p>
                  </div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>Top Hook: Social Proof (+240% CTR)</li>
                    <li>CTA-Wortwahl: “Jetzt testen” outperformt “Mehr erfahren”</li>
                    <li>Optimale Länge: 120–160 Zeichen</li>
                  </ul>
                  <button className="text-xs text-primary underline">Neue Varianten auf Basis der Muster</button>
                </div>
                <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
                  <p className="text-sm text-white">Upload Backtest (CSV/Meta)</p>
                  <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-white/60 text-sm">
                    Drop your report.csv hier oder wähle Datei
                  </div>
                  <p className="text-xs text-white/50">Ergebnis: Hook-Typen, CTA-Words, Leselevel.</p>
                </div>
              </div>
            )}

            {selectedTab === 'creatives' && !isRunning && filteredAds.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAds.map((ad, idx) => (
                  <div
                    key={`${ad.headline || idx}-${idx}`}
                    className="glass-panel rounded-xl p-4 border border-white/10 hover:-translate-y-1 transition-spatial flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-white/50">Variante {idx + 1}</p>
                        <h3 className="text-lg font-semibold text-white mt-1">
                          {ad.headline || `Variante ${idx + 1}`}
                        </h3>
                        {ad.hook && (
                          <p className="text-xs text-white/60 mt-1">Hook: {ad.hook}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                          {ad.ctr || '+200% CTR'}
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-white font-semibold">
                          {ad.hookScore || '9/10'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                      {ad.primaryText || ad.text || ad.copy}
                    </p>
                    {ad.description && (
                      <p className="text-xs text-white/60">{ad.description}</p>
                    )}
                    {ad.cta && (
                      <div className="flex items-center justify-between text-xs font-medium text-white mt-auto">
                        <span>CTA: {ad.cta}</span>
                        <button className="px-2 py-1 rounded-md bg-primary text-white">
                          {ad.cta}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <TrendingUp size={14} />
                      <span>Basierend auf {scrapedAds.length || 30}+ analysierten Ads</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Copy size={14} />
                        Copy
                      </button>
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Save size={14} />
                        Save
                      </button>
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Share size={14} />
                        Share
                      </button>
                      <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 transition-smooth">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'creatives' && !isRunning && filteredAds.length === 0 && step === 'done' && (
              <div className="glass-panel rounded-xl p-6 border border-white/10 text-white/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-full bg-primary/15 text-primary">
                  <ArrowUpRight size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Keine Treffer für deine Filter.</p>
                  <p className="text-sm text-white/70">Passe Filter an oder lade Sample-Ergebnisse.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFilterLanguage('all');
                      setFilterObjective('all');
                    }}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs"
                  >
                    Filter zurücksetzen
                  </button>
                  <button
                    onClick={handleUseSampleData}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs"
                  >
                    Sample laden
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-[#141824] via-[#0f121c] to-[#0b0d12]">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.12em] text-white/70">
              <Sparkles size={14} />
              Ready to scale
            </div>
            <h3 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
              Starte heute und erhalte <span className="text-primary">1.000 kostenlose Credits</span>
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Keine Kreditkarte nötig. In <strong>15 Sekunden</strong> von Briefing zu fertigen Creatives.
              Perfekt für Mobile & Desktop.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleStartFreeTrial}
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#c32252] transition-smooth"
              >
                Kostenlos starten
              </button>
              <button className="border border-white/15 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-smooth">
                Demo ansehen
              </button>
            </div>
          </div>
        </section>

        {/* Mobile sticky action bar */}
        <div className="fixed bottom-3 inset-x-3 sm:hidden glass-panel rounded-2xl p-3 flex items-center gap-3 border border-white/10 shadow-2xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Ad Builder</p>
            <p className="text-[11px] text-white/70">15s von Briefing zu fertigen Ads</p>
          </div>
          <button
            onClick={handleStartFreeTrial}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Start
          </button>
          <button
            onClick={handleUseSampleData}
            className="px-3 py-2 rounded-xl text-xs text-white bg-white/10"
          >
            Sample
          </button>
        </div>
      </div>
    </>
  );
};

export default AdRubyAdBuilder;
