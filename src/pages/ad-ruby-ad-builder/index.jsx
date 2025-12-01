import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, CheckCircle, Brain, Zap, Target, BarChart3, Sparkles, TrendingUp, Clock, Award } from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const AdRubyAdBuilder = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState("idle"); // idle | scraping | analyzing | done | error
  const [scrapedAds, setScrapedAds] = useState([]);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [error, setError] = useState(null);
  // Annahme: vorhandene Form-States wie product, goal, market, language, searchUrl existieren bereits im realen Flow
  // Platzhalter, falls im Layout noch nicht definiert
  const [product, setProduct] = useState("");
  const [goal, setGoal] = useState("");
  const [market, setMarket] = useState("");
  const [language, setLanguage] = useState("de");
  const [searchUrl, setSearchUrl] = useState("");

  const handleStartFreeTrial = () => {
    navigate('/ad-ruby-registration');
  };

  const handleAdCreationStart = async () => {
    setError(null);
    setIsRunning(true);
    setStep("scraping");
    setGeneratedAds([]);
    setScrapedAds([]);

    try {
      // 1️⃣ Scraping
      console.log("[AdBuilder] Starting scraping request", { searchUrl });

      const scrapeRes = await fetch("/.netlify/functions/ad-research-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchUrl,
          maxAds: 30,
        }),
      });

      if (!scrapeRes.ok) {
        throw new Error(`Scraping failed with status ${scrapeRes.status}`);
      }

      const scrapeData = await scrapeRes.json();
      console.log("[AdBuilder] Scrape result", scrapeData);

      const items = scrapeData.items || [];

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
          "Es konnten keine Ads aus der Facebook Ads Library geladen werden. Bitte URL oder Filter anpassen."
        );
      }

      setScrapedAds(items);

      // 2️⃣ KI-Analyse
      setStep("analyzing");

      console.log("[AdBuilder] Starting AI analysis", {
        product,
        goal,
        market,
        language,
        itemsCount: items.length,
      });

      const aiRes = await fetch("/.netlify/functions/ai-ad-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userBriefing: {
            product,
            goal,
            market,
            language,
          },
          scrapedAds: items,
        }),
      });

      if (!aiRes.ok) {
        throw new Error(`AI analysis failed with status ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      console.log("[AdBuilder] AI result", aiData);

      const finalAds = aiData.ads || aiData.results || [];

      if (!Array.isArray(finalAds) || finalAds.length === 0) {
        throw new Error(
          "Die KI konnte aus den Daten keine Ads generieren. Bitte Eingaben überprüfen."
        );
      }

      setGeneratedAds(finalAds);
      setStep("done");
    } catch (err) {
      console.error("[AdBuilder] Ad creation error", err);
      setError(err.message || "Unbekannter Fehler bei der Ad-Erstellung");
      setStep("error");
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
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  const workflowSteps = [
    {
      icon: Target,
      step: "1. Eingabe",
      title: "Produkt & Zielgruppe",
      description: "Beschreibe dein Produkt, deine Zielgruppe und Kampagnenziele in wenigen Sätzen."
    },
    {
      icon: Brain,
      step: "2. Analyse",
      title: "KI-Verarbeitung",
      description: "Unsere KI analysiert deine Eingaben und vergleicht sie mit erfolgreichen Mustern aus Millionen von Ads."
    },
    {
      icon: Sparkles,
      step: "3. Generierung",
      title: "Creative Erstellung",
      description: "Automatische Generierung von Headlines, Texten, CTAs und visuellen Empfehlungen."
    },
    {
      icon: TrendingUp,
      step: "4. Export",
      title: "Sofortiger Export",
      description: "Lade deine fertigen Ads direkt für Facebook, Instagram, Google und TikTok herunter."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Spart Zeit & Kosten",
      description: "Von Stunden auf Sekunden - erstelle professionelle Ads ohne Design-Team oder externe Agentur."
    },
    {
      icon: BarChart3,
      title: "Datenbasierte Ads",
      description: "Jede Anzeige basiert auf erfolgreichen Mustern aus über 1 Million performanter Werbeanzeigen."
    },
    {
      icon: Target,
      title: "Passt Tonalität an",
      description: "Automatische Anpassung an deine Marke, Zielgruppe und Branche für maximale Relevanz."
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000]">
        
        {/* Breadcrumb Navigation */}
        <motion.div
          className="pt-16 sm:pt-20 pb-4 px-4 sm:px-6 lg:px-10 bg-white border-b border-[#e0e0e0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto">
            <nav className="text-sm text-[#666]">
              <span onClick={() => navigate('/')} className="cursor-pointer hover:text-[#C80000] transition-colors">Home</span>
              <span className="mx-2">/</span>
              <span onClick={() => navigate('/services')} className="cursor-pointer hover:text-[#C80000] transition-colors">Features</span>
              <span className="mx-2">/</span>
              <span className="text-[#C80000] font-medium">Ad Builder</span>
            </nav>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.section
          className="pt-14 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-[#FAFAFA] via-white to-[#FAFAFA]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              
              {/* Left Content */}
              <div className="text-left space-y-6">
                <motion.h1 
                  variants={itemVariants}
                  className="text-[clamp(2.2rem,6vw,3.6rem)] font-bold leading-[1.1] text-[#000000]"
                >
                  Erstelle in Sekunden{' '}
                  <span className="text-[#C80000]">performante Werbeanzeigen</span>{' '}
                  – von Text bis Creative
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-[clamp(1.05rem,3vw,1.3rem)] text-[#333333] leading-relaxed max-w-2xl"
                >
                  Lass unsere KI automatisch Werbetexte, Hooks, CTAs und Visuals generieren, 
                  die deine Zielgruppe überzeugen und deine Konkurrenz übertreffen.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="w-full sm:w-auto bg-[#C80000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a50000] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Award className="w-5 h-5" />
                    Starte jetzt deinen kostenlosen Test mit 1.000 Credits
                  </motion.button>
                  
                  <motion.button
                    className="w-full sm:w-auto border border-[#C80000] text-[#C80000] px-6 py-3 rounded-lg font-medium hover:bg-[#C80000] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Demo ansehen
                  </motion.button>
                </motion.div>

                {/* Success Metrics */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-6 p-6 bg-white rounded-xl border border-[#e0e0e0] shadow-sm"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C80000] mb-1">15s</div>
                    <div className="text-xs text-[#666]">Durchschnittliche Erstellungszeit</div>
                  </div>
                  <div className="text-center border-l border-r border-[#e0e0e0]">
                    <div className="text-2xl font-bold text-[#C80000] mb-1">+340%</div>
                    <div className="text-xs text-[#666]">CTR Verbesserung</div>
                  </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C80000] mb-1">4.2x</div>
                  <div className="text-xs text-[#666]">ROAS Steigerung</div>
                </div>
              </motion.div>

              {/* Status Anzeige */}
              {step !== "idle" && (
                <div className="mt-4 rounded-xl border border-[#e0e0e0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  {step === "scraping" && (
                    <p className="text-sm text-[#C80000] font-medium">
                      Marktrecherche läuft… (Scraping der Ads)
                    </p>
                  )}
                  {step === "analyzing" && (
                    <p className="text-sm text-[#C80000] font-medium">
                      KI analysiert die Ads und erstellt dein Creative…
                    </p>
                  )}
                  {step === "done" && (
                    <p className="text-sm text-emerald-600 font-medium">
                      Fertige Ads wurden erstellt.
                    </p>
                  )}
                  {step === "error" && (
                    <p className="text-sm text-red-500 font-medium">
                      Fehler: {error}
                    </p>
                  )}
                </div>
              )}

              {/* Generierte Ads */}
              {generatedAds.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
                  {generatedAds.map((ad, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm flex flex-col gap-2"
                    >
                      <h3 className="font-semibold">
                        {ad.headline || `Variante ${idx + 1}`}
                      </h3>
                      {ad.hook && (
                        <p className="text-xs uppercase tracking-wide text-[#666]">
                          Hook: {ad.hook}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-line text-[#333]">
                        {ad.primaryText || ad.text || ad.copy}
                      </p>
                      {ad.description && (
                        <p className="text-xs text-[#666]">{ad.description}</p>
                      )}
                      {ad.cta && (
                        <div className="mt-2 text-xs font-medium text-[#000]">
                          Call to Action: {ad.cta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Content - Interactive Dashboard Preview */}
            <div className="relative">
                <motion.div
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Main Dashboard Mockup */}
                  <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-2xl p-8 relative overflow-hidden">
                    
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C80000] rounded-lg flex items-center justify-center">
                          <Brain className="text-white" size={16} />
                        </div>
                        <span className="font-semibold text-[#000000]">AdRuby Builder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#ff5f56] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#ffbd2e] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#27ca3f] rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Input Fields Simulation */}
                    <div className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#333]">Produkt beschreiben</label>
                        <div className="bg-[#f8f9fa] rounded-lg p-3 border border-[#e0e0e0]">
                          <div className="text-sm text-[#666] animate-pulse">Premium Fitness Tracker mit Herzfrequenzmessung...</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#333]">Zielgruppe</label>
                        <div className="bg-[#f8f9fa] rounded-lg p-3 border border-[#e0e0e0]">
                          <div className="text-sm text-[#666] animate-pulse">Gesundheitsbewusste Erwachsene 25-45 Jahre...</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Generated Ad Preview */}
                    <div className="bg-gradient-to-r from-[#C80000]/5 to-[#C80000]/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-[#C80000]" size={16} />
                        <span className="text-sm font-medium text-[#C80000]">KI-generierte Anzeige</span>
                      </div>
                      
                      {/* Mock Ad Content */}
                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <div className="text-sm font-bold text-[#000000]">🔥 Erreiche deine Fitnessziele 3x schneller!</div>
                        <div className="text-xs text-[#666] leading-relaxed">
                          Entdecke den Premium Fitness Tracker, der bereits über 50.000 Menschen 
                          zu ihren Traumzielen verholfen hat...
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">Automatisch optimiert</span>
                          <button className="bg-[#C80000] text-white px-3 py-1 rounded text-xs font-medium">
                            Jetzt bestellen
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Performance Prediction */}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-600" size={14} />
                        <span className="text-sm text-green-700 font-medium">Erwartete Performance: +280% CTR</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-[#C80000] text-white p-3 rounded-full shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Zap size={20} />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white border border-[#e0e0e0] p-3 rounded-xl shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-xs text-[#666] mb-1">Live-Update</div>
                    <div className="text-sm font-bold text-[#C80000]">+12 neue Ads</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Workflow Section */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                Vom Input zur{' '}
                <span className="text-[#C80000]">performanten Anzeige</span>{' '}
                in 4 einfachen Schritten
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                Unser bewährter Workflow verwandelt deine Produktideen in hochkonvertierende 
                Werbeanzeigen, die deine Zielgruppe sofort ansprechen.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8 relative">
              
              {/* Workflow Steps */}
              {workflowSteps?.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative text-center"
                >
                  {/* Step Icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-[#C80000] rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                      <step.icon className="text-white" size={32} />
                    </div>
                    
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-[#C80000] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#C80000]">{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm font-medium text-[#C80000] uppercase tracking-wide">
                      {step?.step}
                    </div>
                    <h3 className="text-xl font-bold text-[#000000]">
                      {step?.title}
                    </h3>
                  </div>
                  
                  <p className="text-[#666] text-sm leading-relaxed">
                    {step?.description}
                  </p>

                  {/* Arrow to next step */}
                  {index < workflowSteps?.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-4 z-10">
                      <ArrowRight className="text-[#C80000]" size={24} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Interactive Demo Button */}
            <motion.div
              variants={itemVariants}
              className="text-center mt-16"
            >
              <motion.button
                className="bg-white border-2 border-[#C80000] text-[#C80000] px-8 py-4 rounded-lg font-medium hover:bg-[#C80000] hover:text-white transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle size={24} />
                Interaktive Demo starten
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="py-20 px-4 bg-[#fafafa]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                Warum AdRuby{' '}
                <span className="text-[#C80000]">dein Marketing revolutioniert</span>
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                Mehr als nur ein Tool - AdRuby ist dein intelligenter Marketing-Partner, 
                der kontinuierlich aus Millionen erfolgreicher Kampagnen lernt.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {benefits?.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-8 border border-[#e0e0e0] hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-[#C80000]/10 rounded-2xl flex items-center justify-center mb-6">
                    <benefit.icon className="text-[#C80000]" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-[#000000]">
                    {benefit?.title}
                  </h3>
                  
                  <p className="text-[#666] leading-relaxed">
                    {benefit?.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Success Stories Preview */}
            <motion.div
              variants={itemVariants}
              className="mt-16 bg-white rounded-2xl p-8 border border-[#e0e0e0] shadow-lg"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#000000] mb-3">
                  Bereits über 50.000 erfolgreiche Kampagnen erstellt
                </h3>
                <p className="text-[#666]">
                  Marketers weltweit vertrauen auf AdRuby für ihre Performance-Marketing-Erfolge
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-[#fafafa] rounded-xl">
                  <div className="text-3xl font-bold text-[#C80000] mb-2">+340%</div>
                  <div className="text-sm text-[#666]">Durchschnittliche CTR-Steigerung</div>
                </div>
                <div className="text-center p-6 bg-[#fafafa] rounded-xl">
                  <div className="text-3xl font-bold text-[#C80000] mb-2">4.2x</div>
                  <div className="text-sm text-[#666]">Return on Ad Spend</div>
                </div>
                <div className="text-center p-6 bg-[#fafafa] rounded-xl">
                  <div className="text-3xl font-bold text-[#C80000] mb-2">15s</div>
                  <div className="text-sm text-[#666]">Von Idee zu fertiger Anzeige</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Call-to-Action Section */}
        <motion.section
          className="py-20 px-4 bg-gradient-to-br from-[#C80000] to-[#a50000] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-[1.1]"
            >
              Starte jetzt deinen{' '}
              <span className="text-white/90">kostenlosen Test</span>
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto"
            >
              Erstelle deine ersten 10 High-Performance-Ads völlig kostenlos. 
              Keine Kreditkarte erforderlich, sofortige Ergebnisse garantiert.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                onClick={handleStartFreeTrial}
                className="bg-white text-[#C80000] px-10 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Award className="w-5 h-5" />
                Starte jetzt mit 1.000 kostenlosen Credits
              </motion.button>
              
              <motion.button
                className="border border-white/30 text-white px-10 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle size={20} />
                Demo ansehen
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row items-center justify-center gap-8 text-white/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Keine Kreditkarte erforderlich</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>14 Tage kostenlos testen</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Jederzeit kündbar</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AdRubyAdBuilder;
