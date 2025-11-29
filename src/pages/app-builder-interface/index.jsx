import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import InputForm from './components/InputForm';
import AnalysisPanel from './components/AnalysisPanel';
import PreviewPanel from './components/PreviewPanel';
import AdBuilderService from '../../services/adBuilderService';
import Icon from '../../components/AppIcon';
import AdBuilderStepper from '../../components/AdBuilderStepper';

const HighConversionAdBuilder = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const { user, userProfile } = useAuth();
  
  // NEW: Add input collapsed state
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  
  // NEW: Add states for ad selection
  const [selectedAdIndex, setSelectedAdIndex] = useState(0);
  const [adExamples, setAdExamples] = useState([]);
  
  // Form and generation state
  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    industry: 'e_commerce', // Changed default to E-Commerce
    target_audience: '',
    main_benefits: '',
    pain_points: '',
    usp: '',
    price_offer: '',
    tonality: 'professional', // Changed default to Professionell
    cta_text: 'Jetzt kaufen',
    focus_emotion: false,
    focus_benefits: true,
    focus_urgency: false
  });

  // Generation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // input, analyzing, generating, results

  // Results state
  const [marketInsights, setMarketInsights] = useState(null);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [canvasTab, setCanvasTab] = useState('copy'); // copy | image | structure
  const [mode, setMode] = useState('quick'); // quick | pro
  const [adPressure, setAdPressure] = useState('mittel'); // soft | mittel | aggressiv
  const [personaChips, setPersonaChips] = useState([]);
  const [placement, setPlacement] = useState('feed'); // feed | story | reel

  // Error and success states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    generatedAds: 0,
    successRate: 94.2,
    avgGenerationTime: '2.3s'
  });

  // Load user's existing ads count
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      const { data: products } = await AdBuilderService?.getProducts(user?.id);
      const totalAds = products?.reduce((sum, product) => 
        sum + (product?.generated_ads?.length || 0), 0) || 0;
      
      setStats(prev => ({
        ...prev,
        generatedAds: totalAds + 15 // Add base number for demo
      }));
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // NEW: Dedicated market analysis function as requested
  const handleAnalyzeMarket = async () => {
    if (!validateForm()) return;

    console.log("Analyse gestartet");
    setError(null);
    setSuccess(null);
    
    try {
      setIsAnalyzing(true);
      console.log("isAnalyzing set to true");

      // Enhanced API call with better error handling
      const result = await AdBuilderService?.analyzeMarket({
        ...formData,
        ad_pressure: adPressure,
        personas: personaChips
      });
      
      // Check if fallback was used and inform user
      if (result?.fallbackUsed) {
        setSuccess(`Marktanalyse abgeschlossen (${result?.fallbackReason})`);
        console.log("Fallback verwendet:", result?.fallbackReason);
      } else {
        setSuccess("Marktanalyse erfolgreich abgeschlossen!");
      }

      setMarketInsights(result?.data);
      console.log("Analyse beendet", result?.data);
      
    } catch (error) {
      console.error("Fehler bei Marktanalyse:", error);
      
      // More specific error messages based on error type
      if (AdBuilderService?.isOpenAIQuotaError?.(error)) {
        setError("OpenAI API-Limit erreicht. Bitte überprüfen Sie Ihr Konto oder versuchen Sie es später erneut.");
      } else if (AdBuilderService?.isNetworkError?.(error)) {
        setError("Netzwerkproblem festgestellt. Bitte überprüfen Sie Ihre Internetverbindung.");
      } else {
        setError("Analyse konnte nicht abgeschlossen werden. Bitte erneut versuchen.");
      }
    } finally {
      setIsAnalyzing(false);
      console.log("isAnalyzing set to false");
    }
  };

  // NEW: Handle ad selection from PreviewPanel
  const handleSelectAd = (ad) => {
    setSelectedAd(ad);
    console.log('Ad selected for campaign:', ad);
  };

  const handleDuplicateVariant = () => {
    if (!selectedAd) return;
    const clone = { ...selectedAd, id: `${selectedAd.id || Date.now()}-clone-${Date.now()}` };
    const updated = [...generatedAds, clone];
    setGeneratedAds(updated);
    setSelectedAd(clone);
  };

  const handleRerollHook = () => {
    // Reuse existing generation flow to keep logic intact
    handleAnalyzeAndGenerate();
  };

  const handleAnalyzeAndGenerate = async () => {
    if (!validateForm()) return;

    // NEW: Collapse input form when starting analysis
    setIsInputCollapsed(true);
    setIsNavCollapsed(true);

    console.log("Vollständige Analyse & Generierung gestartet");
    setError(null);
    setSuccess(null);
    setCurrentStep('analyzing');
    
    try {
      setIsAnalyzing(true);
      console.log("Analyse-Phase gestartet");

      // Step 1: Create product in database
      const extendedForm = { ...formData, ad_pressure: adPressure, personas: personaChips };

      const { data: product, error: productError } = await AdBuilderService?.createProduct(extendedForm);
      if (productError) throw productError;

      // Step 2: Analyze market with enhanced error handling
      setCurrentStep('analyzing');
      console.log("Marktanalyse wird durchgeführt...");
      
      const { data: insights, error: analysisError, fallbackUsed, fallbackReason } = await AdBuilderService?.analyzeMarket(product);
      
      // Don't throw error if we have insights (even from fallback)
      if (!insights && analysisError) throw analysisError;

      setMarketInsights(insights);
      console.log("Marktanalyse abgeschlossen", insights);
      
      // Show appropriate success message
      if (fallbackUsed) {
        setSuccess(`Marktanalyse mit Fallback-Daten abgeschlossen (${fallbackReason})`);
      }
      
      setIsAnalyzing(false);

      // Step 3: Generate ads with enhanced error handling
      setCurrentStep('generating');
      setIsGenerating(true);
      console.log("Ad-Generierung gestartet");

      const { data: ads, error: adsError, fallbackGenerated } = await AdBuilderService?.generateAds(product, insights);
      
      // Don't throw error if we have ads (even from fallback)
      if (!ads && adsError) throw adsError;

      // Step 4: Save generated ads
      const { data: savedAds, error: saveError } = await AdBuilderService?.saveGeneratedAds(product?.id, ads);
      if (saveError) throw saveError;

      // Save market insights
      await AdBuilderService?.saveMarketInsights(product?.id, insights);

      setGeneratedAds(savedAds || []);
      // NEW: Set first ad as default selection
      setSelectedAd(savedAds?.[0] || null);
      setCurrentStep('results');
      
      // Enhanced success message
      let successMsg = 'Anzeigen erfolgreich generiert!';
      if (fallbackGenerated && fallbackUsed) {
        successMsg = 'Anzeigen mit Fallback-Systemen generiert - vollständig funktionsfähig!';
      } else if (fallbackGenerated) {
        successMsg = 'Anzeigen mit alternativer Generierung erstellt!';
      } else if (fallbackUsed) {
        successMsg = 'Anzeigen erfolgreich generiert (mit Fallback-Marktdaten)!';
      }
      
      setSuccess(successMsg);
      console.log("Vollständiger Prozess abgeschlossen");

      // Update stats
      loadUserStats();

    } catch (error) {
      console.error("Fehler im Gesamtprozess:", error);
      
      // Enhanced error messages
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      
      if (AdBuilderService?.isOpenAIQuotaError?.(error)) {
        errorMessage = 'OpenAI API-Limit erreicht. Bitte überprüfen Sie Ihr OpenAI-Konto oder kontaktieren Sie den Support.';
      } else if (AdBuilderService?.isNetworkError?.(error)) {
        errorMessage = 'Netzwerkproblem festgestellt. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
      } else if (error?.message?.includes('User not authenticated')) {
        errorMessage = 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.';
      } else if (error?.message) {
        errorMessage = `Fehler: ${error?.message}`;
      }
      
      setError(errorMessage);
      setCurrentStep('input');
      // NEW: Expand form again on error
      setIsInputCollapsed(false);
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
      console.log("Alle States zurückgesetzt");
    }
  };

  const validateForm = () => {
    const required = ['product_name', 'product_description', 'target_audience', 'main_benefits', 'pain_points', 'usp'];
    
    for (const field of required) {
      if (!formData?.[field]?.trim()) {
        setError(`Bitte füllen Sie das Feld "${getFieldLabel(field)}" aus.`);
        return false;
      }
    }
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      product_name: 'Produktname',
      product_description: 'Produktbeschreibung',
      target_audience: 'Zielgruppe',
      main_benefits: 'Hauptnutzen',
      pain_points: 'Schmerzpunkte',
      usp: 'USP'
    };
    return labels?.[field] || field;
  };

  const handleNewAnalysis = () => {
    setCurrentStep('input');
    setMarketInsights(null);
    setGeneratedAds([]);
    setSelectedAd(null);
    setError(null);
    setSuccess(null);
    // NEW: Expand form when starting new analysis
    setIsInputCollapsed(false);
  };

  // NEW: Toggle input form visibility
  const toggleInputForm = () => {
    setIsInputCollapsed(!isInputCollapsed);
  };

  // NEW: Create minimized form summary
  const getFormSummary = () => {
    const productName = formData?.product_name || 'Unbenanntes Produkt';
    const industry = formData?.industry || 'e_commerce';
    const industryLabels = {
      'e_commerce': 'E-Commerce',
      'health_fitness': 'Gesundheit & Fitness',
      'finance': 'Finanzen',
      'technology': 'Technologie',
      'education': 'Bildung',
      'beauty_lifestyle': 'Beauty & Lifestyle',
      'travel_leisure': 'Reisen & Freizeit',
      'gastronomy': 'Gastronomie',
      'other': 'Andere'
    };
    return `${productName} • ${industryLabels?.[industry]}`;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  const headline = selectedAd?.headline || selectedAd?.primary_text || 'Noch keine Anzeige gewählt';
  const bodyText = selectedAd?.primary_text || selectedAd?.description || 'Sobald eine Variante ausgewählt ist, erscheint sie hier.';
  const ctaText = selectedAd?.cta_text || formData?.cta_text || 'Jetzt kaufen';

  const scoreValue = Math.min(
    100,
    Math.max(35, Number(selectedAd?.conversion_score || stats?.successRate || 72))
  );

  const focusMetrics = {
    emotion: selectedAd?.focus_emotion ? 90 : 65,
    benefits: selectedAd?.focus_benefits ? 88 : 60,
    urgency: selectedAd?.focus_urgency ? 82 : 55
  };

  const stepOrder = ['input', 'analyzing', 'generating'];
  const currentStepIndex = stepOrder.indexOf(currentStep) === -1 ? 0 : stepOrder.indexOf(currentStep);
  const maxUnlockedStep =
    currentStep === 'results'
      ? stepOrder.length - 1
      : Math.max(0, currentStepIndex);

  const handleStepperChange = (index) => {
    const key = stepOrder[index] || 'input';
    setCurrentStep(key);
  };

  const mainBg = 'bg-slate-50 text-slate-900 dark:bg-[#050509] dark:text-slate-50';
  const cardBg = 'bg-white border-slate-200 dark:bg-[#141418] dark:border-white/5';
  const subtleText = 'text-slate-500 dark:text-slate-400';
  const primaryButton =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition shadow-[0_10px_30px_rgba(200,0,0,0.25)] bg-[#C80000] text-white hover:bg-[#a50000]';
  const secondaryButton =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10';
  const navOffset = isNavCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050509] dark:text-slate-50`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isNavCollapsed}
        onCollapseToggle={() => setIsNavCollapsed((prev) => !prev)}
      />
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isNavCollapsed={isNavCollapsed}
        onNavCollapseToggle={() => setIsNavCollapsed((prev) => !prev)}
      />

      <motion.main
        className={`${navOffset} pt-16`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 sm:p-6">
          {/* Page Header */}
          <motion.div className="mb-6 sm:mb-8 flex flex-col gap-3" variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold">Ad Builder: AdCreative Lab</h1>
                <p className={`text-sm ${subtleText}`}>
                  KI-gestützter Anzeigengenerator für maximale Conversion-Raten
                </p>
              </div>

              {currentStep === 'results' && (
                <motion.button
                  onClick={handleNewAnalysis}
                  className={`${primaryButton}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name="Plus" size={20} />
                  <span>Neue Analyse</span>
                </motion.button>
              )}
            </div>

            {/* Progress Indicator */}
            <AdBuilderStepper
              currentStepIndex={currentStepIndex}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={handleStepperChange}
            />
          </motion.div>

          {/* Error and Success Messages */}
          {error && (
            <motion.div
              className="mb-4 sm:mb-6 p-4 bg-rose-500/10 border border-rose-500/40 rounded-lg text-rose-900 dark:text-rose-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-4 sm:mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-900 dark:text-emerald-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} />
                <span>{success}</span>
              </div>
            </motion.div>
          )}

          {/* Main 3-Zone Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* LEFT: Control Panel */}
            <div className="xl:col-span-3 space-y-4 order-1 xl:order-none">
              {!isInputCollapsed ? (
                <div className={`${cardBg} rounded-2xl p-4 sm:p-5 backdrop-blur relative`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setMode('quick')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                          mode === 'quick'
                            ? 'bg-[#C80000] text-white'
                            : `${secondaryButton}`
                        }`}
                      >
                        Schnellstart
                      </button>
                      <button
                        onClick={() => setMode('pro')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                          mode === 'pro'
                            ? 'bg-[#C80000] text-white'
                            : `${secondaryButton}`
                        }`}
                      >
                        Pro-Lab
                      </button>
                    </div>
                    <button
                      onClick={() => setIsInputCollapsed(true)}
                      className={`${secondaryButton} px-3 py-2 text-xs`}
                    >
                      <Icon name="ChevronLeft" size={14} />
                      Einklappen
                    </button>
                  </div>
                  <AccordionForm
                    mode={mode}
                    formData={formData}
                    setFormData={setFormData}
                    onGenerate={handleAnalyzeAndGenerate}
                    isGenerating={isAnalyzing || isGenerating}
                    isAnalyzing={isAnalyzing}
                    currentStep={currentStep}
                    primaryButton={primaryButton}
                  />
                  <div className="mt-4 space-y-4">
                    <AdPressureSlider value={adPressure} onChange={setAdPressure} />
                    <PersonaChips value={personaChips} onChange={setPersonaChips} />
                  </div>
                </div>
              ) : (
                <div className={`${cardBg} rounded-2xl p-4 flex items-center justify-between`}>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button
                      onClick={() => {
                        setIsInputCollapsed(false);
                      }}
                      className={`${secondaryButton}`}
                    >
                      <Icon name="Menu" size={16} />
                      Öffnen
                    </button>
                  </div>
                  <div>
                    <p className="text-sm">{getFormSummary()}</p>
                    <p className={`text-xs ${subtleText}`}>Eingeklappt</p>
                  </div>
                </div>
              )}
            </div>

            {/* CENTER: Creative Canvas */}
            <div className="xl:col-span-5 space-y-4 order-3 xl:order-none">
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-4 sm:p-5 backdrop-blur shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {['copy', 'image', 'structure'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCanvasTab(tab)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                          canvasTab === tab
                            ? 'bg-[#C80000] text-white'
                            : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {tab === 'copy' && 'Copy'}
                        {tab === 'image' && 'Image Prompts'}
                        {tab === 'structure' && 'Struktur'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 rounded-lg p-1 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                    {['feed', 'story', 'reel'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlacement(p)}
                        className={`px-2 py-1 text-[10px] rounded-md transition ${
                          placement === p
                            ? 'bg-[#C80000] text-white'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                          {p === 'feed' && 'Feed'}
                          {p === 'story' && 'Story'}
                          {p === 'reel' && 'Reel'}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleRerollHook}
                      className={`${secondaryButton}`}
                    >
                      <Icon name="Dice5" size={16} />
                      Hook neu würfeln
                    </button>
                    <button
                      onClick={handleDuplicateVariant}
                      className={`${primaryButton}`}
                    >
                      <Icon name="Copy" size={16} />
                      Variante duplizieren
                    </button>
                  </div>
                </div>

                {/* Canvas Content */}
                <div className="space-y-4">
                  {canvasTab === 'copy' && (
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                        <span>Platzierung: {placement}</span>
                        <span>{selectedAd?.id ? `Variante ID: ${selectedAd.id}` : 'Keine Auswahl'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h3 className="text-xl font-semibold">{headline}</h3>
                        <p className={`text-sm leading-relaxed whitespace-pre-line mt-2 ${subtleText}`}>
                          {bodyText}
                        </p>
                        <div className="mt-3 inline-flex px-3 py-2 rounded-lg bg-[#C80000]/15 border border-[#C80000]/40 text-[11px] font-semibold text-[#C80000] dark:text-white">
                          CTA: {ctaText}
                        </div>
                      </div>
                    </div>
                  )}

                  {canvasTab === 'image' && (
                    <div className={`space-y-2 text-sm ${subtleText}`}>
                      <p>Image Prompts werden hier angezeigt, sobald sie verfügbar sind.</p>
                      <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                        Beispiel: “Ultra-detailliertes Produktfoto mit weichem Licht, Fokus auf USP, hochauflösend, Clean Background”
                      </div>
                    </div>
                  )}

                  {canvasTab === 'structure' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Hook</p>
                        <p className="text-sm mt-1">{headline}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Body</p>
                        <p className={`text-sm mt-1 whitespace-pre-line ${subtleText}`}>{bodyText}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className={`text-xs uppercase tracking-wide ${subtleText}`}>CTA</p>
                        <p className="text-sm mt-1">{ctaText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview & Analysis stacked in center column */}
              <div className="space-y-4">
                <PreviewPanel
                  selectedAd={selectedAd}
                  isGenerating={isGenerating}
                  productData={formData}
                  generatedAds={generatedAds}
                  onSelectAd={handleSelectAd}
                />

                <AnalysisPanel
                  marketInsights={marketInsights}
                  generatedAds={generatedAds}
                  isAnalyzing={isAnalyzing}
                  isGenerating={isGenerating}
                  onSelectAd={setSelectedAd}
                  selectedAd={selectedAd}
                />
              </div>
            </div>

            {/* RIGHT: Score + Variants */}
              <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-20 h-fit order-2 xl:order-none">
              <div className={`${cardBg} rounded-2xl p-4 sm:p-5 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Score</p>
                    <h3 className="text-lg font-semibold">Conversion-Score</h3>
                  </div>
                  <div className="relative h-16 w-16">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#C80000 ${scoreValue * 3.6}deg, #1f2937 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 rounded-full bg-white dark:bg-[#0b0b10] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.45)]">
                      <span className="text-sm font-semibold">{Math.round(scoreValue)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Emotion', value: focusMetrics.emotion, color: 'from-rose-500 to-pink-500' },
                    { label: 'Nutzen', value: focusMetrics.benefits, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Dringlichkeit', value: focusMetrics.urgency, color: 'from-amber-500 to-orange-500' }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                        <span>{metric.label}</span>
                        <span className="text-slate-900 dark:text-white">{metric.value}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${cardBg} rounded-2xl p-4 sm:p-5 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Varianten</p>
                    <h3 className="text-lg font-semibold">Ad-Varianten</h3>
                  </div>
                  <div className={`text-xs ${subtleText}`}>
                    {generatedAds?.length || 0} Stück
                  </div>
                </div>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {generatedAds?.length ? (
                    generatedAds.map((ad, index) => (
                      <div
                        key={ad?.id || index}
                        className={`p-3 rounded-xl border transition cursor-pointer ${
                          selectedAd?.id === ad?.id
                            ? 'border-[#C80000] bg-[#C80000]/10 shadow-[0_10px_40px_rgba(200,0,0,0.25)]'
                            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedAd(ad)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {ad?.headline || ad?.primary_text || `Variante ${index + 1}`}
                            </p>
                            <p className={`text-xs ${subtleText} line-clamp-2`}>
                              {ad?.primary_text || ad?.description || '—'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {ad?.focus_emotion && (
                                <span className="px-2 py-1 text-[10px] rounded-full bg-rose-500/15 text-rose-200">
                                  Emotion
                                </span>
                              )}
                              {ad?.focus_benefits && (
                                <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/15 text-emerald-200">
                                  Nutzen
                                </span>
                              )}
                              {ad?.focus_urgency && (
                                <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/15 text-amber-200">
                                  Dringlichkeit
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator?.clipboard?.writeText(
                                  `${ad?.headline || ''}\n\n${ad?.primary_text || ''}\nCTA: ${
                                    ad?.cta_text || 'Jetzt kaufen'
                                  }`
                                );
                              }}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 transition"
                            >
                              <Icon name="Copy" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Noch keine Varianten generiert.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default HighConversionAdBuilder;

// --- UI Subcomponents for AccordionForm, PersonaChips, Slider ---

const AccordionForm = ({
  mode,
  formData,
  setFormData,
  onGenerate,
  isGenerating,
  isAnalyzing,
  currentStep,
  primaryButton,
  onSectionSelect
}) => {
  const [open, setOpen] = useState(['produkt']);
  const toggle = (key) => {
    setOpen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    onSectionSelect?.();
  };

  const quickFields = ['product_name', 'target_audience', 'main_benefits', 'price_offer', 'usp'];
  const showField = (field) => mode === 'pro' || quickFields.includes(field);

  const renderField = (label, field, placeholder, type = 'text') => {
    if (!showField(field)) return null;
    const baseProps = {
      value: formData?.[field] || '',
      onChange: (e) =>
        setFormData((prev) => ({
          ...prev,
          [field]: e?.target?.value
        })),
      disabled: isGenerating || isAnalyzing
    };
    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">{label}</label>
          <textarea
            {...baseProps}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C80000] bg-white border-slate-200 text-slate-900 dark:bg-[#0b0b10] dark:border-white/10 dark:text-slate-50"
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <input
          {...baseProps}
          type="text"
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C80000] bg-white border-slate-200 text-slate-900 dark:bg-[#0b0b10] dark:border-white/10 dark:text-slate-50"
        />
      </div>
    );
  };

  const renderSelect = (label, field, options) => {
    if (!showField(field)) return null;
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <select
          value={formData?.[field] || options?.[0]?.value}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              [field]: e.target.value
            }))
          }
          disabled={isGenerating || isAnalyzing}
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C80000] bg-white border-slate-200 text-slate-900 dark:bg-[#0b0b10] dark:border-white/10 dark:text-slate-50"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {[
        {
          key: 'produkt',
          title: 'Produkt-Basics',
          content: (
            <div className="space-y-3">
              {renderField('Produktname *', 'product_name', 'z.B. FitMax Pro Supplement')}
              {renderField('Produktbeschreibung *', 'product_description', 'Detaillierte Beschreibung…', 'textarea')}
              {renderSelect('Branche', 'industry', [
                { value: 'e_commerce', label: 'E-Commerce' },
                { value: 'fitness', label: 'Gesundheit & Fitness' },
                { value: 'beauty', label: 'Beauty & Lifestyle' },
                { value: 'food', label: 'Gastronomie & Lebensmittel' },
                { value: 'tech', label: 'Technologie' },
                { value: 'other', label: 'Andere' }
              ])}
            </div>
          )
        },
        {
          key: 'ziel',
          title: 'Zielgruppe & Schmerzpunkte',
          content: (
            <div className="space-y-3">
              {renderField('Zielgruppe *', 'target_audience', 'z.B. Fitness-Enthusiasten, 25-45 Jahre')}
              {renderField('Schmerzpunkte *', 'pain_points', 'Welche Probleme löst Ihr Produkt…', 'textarea')}
              {renderField('Hauptnutzen *', 'main_benefits', 'Die wichtigsten Vorteile…', 'textarea')}
            </div>
          )
        },
        {
          key: 'angebot',
          title: 'Angebot & USP',
          content: (
            <div className="space-y-3">
              {renderField('USP *', 'usp', 'Was macht Ihr Produkt einzigartig…')}
              {renderField('Preis/Angebot', 'price_offer', 'z.B. 49,99 EUR (statt 79,99 EUR)')}
            </div>
          )
        },
        {
          key: 'ton',
          title: 'Tonalität & Fokus',
          content: (
            <div className="space-y-3">
              {renderSelect('Tonalität', 'tonality', [
                { value: 'professional', label: 'Professionell' },
                { value: 'emotional', label: 'Emotional' },
                { value: 'humorous', label: 'Humorvoll' },
                { value: 'serious', label: 'Seriös' },
                { value: 'luxury', label: 'Luxuriös' },
                { value: 'scientific', label: 'Wissenschaftlich' },
                { value: 'friendly', label: 'Freundlich' },
                { value: 'urgent', label: 'Dringlich' },
                { value: 'casual', label: 'Locker' },
                { value: 'playful', label: 'Verspielt' },
                { value: 'exclusive', label: 'Exklusiv' }
              ])}
              {renderField('CTA-Text', 'cta_text', 'Jetzt kaufen')}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { field: 'focus_emotion', label: 'Emotion' },
                  { field: 'focus_benefits', label: 'Nutzen' },
                  { field: 'focus_urgency', label: 'Dringlichkeit' }
                ].map((f) => (
                  <label key={f.field} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!formData?.[f.field]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [f.field]: e.target.checked
                        }))
                      }
                      disabled={isGenerating || isAnalyzing}
                      className="h-4 w-4 rounded text-[#C80000] focus:ring-[#C80000] border-slate-300 bg-white dark:border-white/20 dark:bg-[#0b0b10]"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          )
        }
      ].map((section) => (
        <div
          key={section.key}
          className="rounded-xl overflow-hidden border bg-white border-slate-200 dark:bg-white/5 dark:border-white/10"
        >
          <button
            type="button"
            onClick={() => toggle(section.key)}
            className="w-full px-3 py-2 flex items-center justify-between text-sm font-semibold"
          >
            <span>{section.title}</span>
            <Icon name={open.includes(section.key) ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </button>
          <div
            className={`transition-all duration-200 ease-out ${
              open.includes(section.key) ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden px-3 pb-3 space-y-3`}
          >
            {section.content}
          </div>
        </div>
      ))}

      <button
        onClick={onGenerate}
        disabled={isGenerating || isAnalyzing}
        className={`${primaryButton} w-full mt-3 justify-center disabled:opacity-60`}
      >
        Ads generieren
      </button>
    </div>
  );
};

const AdPressureSlider = ({ value, onChange }) => {
  const options = [
    { key: 'soft', label: 'Soft' },
    { key: 'mittel', label: 'Mittel' },
    { key: 'aggressiv', label: 'Aggressiv' }
  ];
  return (
    <div className="rounded-xl p-3 border bg-white border-slate-200 dark:bg-white/5 dark:border-white/10">
      <div className="flex items-center justify-between text-xs mb-2 text-slate-600 dark:text-slate-300">
        <span>Werbedruck</span>
        <span className="font-semibold capitalize text-slate-900 dark:text-white">{value}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`py-2 rounded-lg text-xs font-semibold transition ${
              value === opt.key
                ? 'bg-[#C80000] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-[#0b0b10] dark:text-slate-300 dark:border-white/5 dark:hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const PersonaChips = ({ value = [], onChange }) => {
  const personas = ['Schnäppchenjäger', 'Premium-Käufer', 'Busy Mom', 'Tech-Nerd'];
  const toggle = (p) =>
    onChange(
      value.includes(p) ? value.filter((v) => v !== p) : [...value, p]
    );
  return (
    <div className="rounded-xl p-3 border bg-white border-slate-200 dark:bg-white/5 dark:border-white/10">
      <p className="text-xs mb-2 text-slate-600 dark:text-slate-300">Personas</p>
      <div className="flex flex-wrap gap-2">
        {personas.map((p) => {
          const active = value.includes(p);
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                active
                  ? 'bg-[#C80000] text-white shadow-[0_10px_30px_rgba(200,0,0,0.35)]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-[#0b0b10] dark:text-slate-300 dark:border-white/5 dark:hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
};
