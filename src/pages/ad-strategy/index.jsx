import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import AdStrategyService from '../../services/adStrategyService';
import Icon from '../../components/AppIcon';

const AdStrategy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get ad ID from URL parameters (passed from Ad Builder)
  const adId = searchParams?.get('adId');
  
  // State management
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adData, setAdData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [recommendedStrategy, setRecommendedStrategy] = useState(null);
  const [allStrategies, setAllStrategies] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Saved ads states (DEFAULT VIEW NOW)
  const [savedAds, setSavedAds] = useState([]);
  const [showSavedAds, setShowSavedAds] = useState(true); // DEFAULT: Always show saved ads first
  const [loadingSaved, setLoadingSaved] = useState(false);

  // COMPREHENSIVE: Enhanced strategy finder states for 7-step questionnaire
  const [showStrategyFinder, setShowStrategyFinder] = useState(false);
  const [selectedAdForStrategy, setSelectedAdForStrategy] = useState(null);
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessingStrategy, setIsProcessingStrategy] = useState(false);
  const [strategyRecommendation, setStrategyRecommendation] = useState(null);

  // NEW: Meta Ads Setup states
  const [showMetaAdsSetup, setShowMetaAdsSetup] = useState(false);
  const [selectedAdForMetaAds, setSelectedAdForMetaAds] = useState(null);
  const [metaAdsSetupData, setMetaAdsSetupData] = useState(null);
  const [isGeneratingMetaAds, setIsGeneratingMetaAds] = useState(false);

  // Load saved ads by default on component mount
  useEffect(() => {
    if (user?.id) {
      if (adId) {
        // If specific ad analysis requested, show it but keep saved ads as fallback
        setShowSavedAds(false);
        loadAdAndAnalyzeStrategy();
      }
      // ALWAYS load saved ads (German requirement: show immediately)
      loadSavedAds();
    }
  }, [adId, user?.id]);

  const loadAdAndAnalyzeStrategy = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Step 1: Load ad and product data
      const { data: ad, error: adError } = await AdStrategyService?.getAdWithProduct(adId);
      if (adError) throw adError;

      setAdData(ad);
      setProductData(ad?.product);

      // Step 2: Load available strategies
      const { data: strategies, error: strategiesError } = await AdStrategyService?.getAllStrategies();
      if (strategiesError) throw strategiesError;

      setAllStrategies(strategies || []);

      // Step 3: AI-powered strategy analysis
      const { data: analysis, error: analysisError } = await AdStrategyService?.analyzeAndRecommendStrategy(ad, strategies);
      if (analysisError) throw analysisError;

      setAiAnalysis(analysis);
      setRecommendedStrategy(analysis?.recommended_strategy);

    } catch (error) {
      console.error('Strategy analysis error:', error);
      setError(error?.message || 'Fehler beim Laden der Strategieanalyse.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load saved ad variants (PRIMARY VIEW)
  const loadSavedAds = async () => {
    if (!user?.id) return;

    setLoadingSaved(true);
    try {
      const { data: variants, error } = await AdStrategyService?.getSavedAdVariants(user?.id);
      if (error) throw error;

      setSavedAds(variants || []);
    } catch (error) {
      console.error('Error loading saved ads:', error);
      setError('Fehler beim Laden der gespeicherten Anzeigen');
    } finally {
      setLoadingSaved(false);
    }
  };

  // COMPREHENSIVE: Handle comprehensive strategy finder with 7-step questionnaire
  const handleFindStrategy = async (adVariant) => {
    setSelectedAdForStrategy(adVariant);
    setError(null);

    // Check if strategy already exists
    const existingStrategy = await AdStrategyService?.getAdStrategy(adVariant?.id);
    if (existingStrategy?.data) {
      // Show existing strategy instead of running questionnaire again
      setStrategyRecommendation({
        strategy: existingStrategy?.data?.selected_strategy,
        reasoning: existingStrategy?.data?.ai_analysis?.reasoning,
        score: existingStrategy?.data?.matching_score,
        confidence: existingStrategy?.data?.confidence_level,
        key_alignments: existingStrategy?.data?.ai_analysis?.key_alignments || [],
        implementation_recommendations: existingStrategy?.data?.ai_analysis?.implementation_recommendations || [],
        alternatives: existingStrategy?.data?.ai_analysis?.alternatives || []
      });
      setShowStrategyFinder(true);
      return;
    }

    try {
      // Load comprehensive 7-step questionnaire
      const { data: questions, error: questionsError } = await AdStrategyService?.getStrategyQuestionnaire();
      if (questionsError) throw questionsError;

      setQuestionnaireQuestions(questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setStrategyRecommendation(null);
      setShowStrategyFinder(true);
    } catch (error) {
      setError('Fehler beim Laden des Strategiefinders');
    }
  };

  // Handle questionnaire answer
  const handleAnswerQuestion = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Go to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionnaireQuestions?.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, analyze strategy with AI
      processComprehensiveStrategyRecommendation();
    }
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // OPTIMIZED: Enhanced save strategy with immediate UI updates
  const handleSaveStrategy = async () => {
    if (!strategyRecommendation?.strategy || !selectedAdForStrategy) {
      setError('Keine Strategieempfehlung zum Speichern verfügbar');
      return;
    }

    try {
      // IMMEDIATE UI UPDATE: Optimistically update local state before modal closes
      const optimisticStrategyData = {
        id: `temp_${Date.now()}`, // Temporary ID
        ad_variant_id: selectedAdForStrategy?.id,
        selected_strategy: strategyRecommendation?.strategy,
        selected_strategy_data: {
          title: strategyRecommendation?.strategy?.title,
          description: strategyRecommendation?.strategy?.description
        },
        matching_score: strategyRecommendation?.score,
        confidence_level: strategyRecommendation?.confidence,
        created_at: new Date()?.toISOString()
      };

      // REAL-TIME UPDATE: Update the specific ad card immediately in local state
      setSavedAds(prevAds => 
        prevAds?.map(variant => {
          if (variant?.id === selectedAdForStrategy?.id) {
            return {
              ...variant,
              ad_strategy: [optimisticStrategyData] // Add strategy immediately
            };
          }
          return variant;
        })
      );

      // Show success message immediately for better UX
      setSuccess('Werbestrategie erfolgreich zugewiesen! ✅');
      
      // Close modal immediately to show updated card
      handleCloseStrategyFinder();

      // BACKGROUND SYNC: Persist to database without blocking UI
      try {
        const { error: saveError } = await AdStrategyService?.saveAdStrategy(
          selectedAdForStrategy?.id,
          user?.id,
          answers,
          strategyRecommendation
        );
        
        if (saveError) {
          throw saveError;
        }

        // FINAL SYNC: Reload data to get real IDs and complete data
        setTimeout(async () => {
          await loadSavedAds();
        }, 1500); // Delay to allow user to see immediate change

      } catch (syncError) {
        console.error('Background sync error:', syncError);
        
        // ROLLBACK: Revert optimistic update on error
        setSavedAds(prevAds => 
          prevAds?.map(variant => {
            if (variant?.id === selectedAdForStrategy?.id) {
              return {
                ...variant,
                ad_strategy: variant?.ad_strategy?.filter(s => s?.id !== optimisticStrategyData?.id) || []
              };
            }
            return variant;
          })
        );
        
        setError('Fehler beim Speichern der Strategie. Bitte versuchen Sie es erneut.');
        setSuccess(null);
      }

      // Auto-hide success message
      setTimeout(() => setSuccess(null), 4000);

    } catch (error) {
      console.error('Strategy save error:', error);
      setError('Fehler beim Zuweisen der Strategie');
    }
  };

  // OPTIMIZED: Enhanced strategy processing with immediate feedback
  const processComprehensiveStrategyRecommendation = async () => {
    setIsProcessingStrategy(true);

    try {
      // Load available strategies if not already loaded
      let strategies = allStrategies;
      if (strategies?.length === 0) {
        const { data: strategiesData, error: strategiesError } = await AdStrategyService?.getAllStrategies();
        if (strategiesError) throw strategiesError;
        strategies = strategiesData || [];
        setAllStrategies(strategies);
      }

      // AI-powered comprehensive questionnaire analysis
      const { data: recommendation, error: analysisError } = await AdStrategyService?.analyzeQuestionnaire(answers, strategies);
      if (analysisError) throw analysisError;

      setStrategyRecommendation(recommendation);

      // REMOVED: Auto-save during processing to allow user choice
      // The strategy will be saved when user clicks "Strategie speichern & anwenden"

    } catch (error) {
      setError('Fehler bei der umfassenden Strategieanalyse');
    } finally {
      setIsProcessingStrategy(false);
    }
  };

  // Close strategy finder
  const handleCloseStrategyFinder = () => {
    setShowStrategyFinder(false);
    setSelectedAdForStrategy(null);
    setStrategyRecommendation(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Handle showing analysis view (when adId exists)
  const handleShowAnalysis = () => {
    if (adId) {
      setShowSavedAds(false);
    } else {
      navigate('/app-builder-interface');
    }
  };

  // Handle back to saved ads (DEFAULT VIEW)
  const handleBackToSavedAds = () => {
    setShowSavedAds(true);
    loadSavedAds();
  };

  const handleApplyStrategy = async () => {
    if (!recommendedStrategy?.id || !adId) return;

    try {
      const { error } = await AdStrategyService?.applyStrategyToAd(adId, recommendedStrategy?.id);
      if (error) throw error;

      setSuccess('Strategie erfolgreich übernommen!');
      
      // Update local ad data
      setAdData(prev => ({
        ...prev,
        selected_strategy_id: recommendedStrategy?.id
      }));

    } catch (error) {
      setError(error?.message || 'Fehler beim Übernehmen der Strategie.');
    }
  };

  const handleGoToAnalysis = () => {
    navigate(`/ai-analysis-panel?adId=${adId}&strategyId=${recommendedStrategy?.id}`);
  };

  const handleBackToBuilder = () => {
    navigate('/app-builder-interface');
  };

  // OPTIMIZED: Enhanced delete with immediate UI feedback
  const handleDeleteSavedAd = async (variantId) => {
    try {
      // IMMEDIATE UI UPDATE: Remove from local state first
      const variantToDelete = savedAds?.find(v => v?.id === variantId);
      setSavedAds(prev => prev?.filter(variant => variant?.id !== variantId));
      
      // Show immediate feedback
      setSuccess('Anzeige wird gelöscht...');

      // BACKGROUND DELETE: Actual database deletion
      const { error } = await AdStrategyService?.deleteSavedAdVariant(variantId);
      
      if (error) {
        // ROLLBACK: Restore on error
        setSavedAds(prev => [...prev, variantToDelete]);
        throw error;
      }

      setSuccess('Anzeige erfolgreich gelöscht ✅');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting saved ad:', error);
      setError('Fehler beim Löschen der Anzeige');
    }
  };

  // NEW: Handle Meta Ads Setup Generation
  const handleGenerateMetaAdsSetup = async (adVariant) => {
    if (!adVariant?.ad_strategy?.[0]) {
      setError('Erstellen Sie zuerst eine Werbestrategie für diese Anzeige');
      return;
    }

    setSelectedAdForMetaAds(adVariant);
    setIsGeneratingMetaAds(true);
    setError(null);

    try {
      // Check if Meta Ads setup already exists
      const existingSetup = adVariant?.ad_strategy?.[0]?.meta_ads_setup?.[0];
      
      if (existingSetup) {
        setMetaAdsSetupData(existingSetup);
        setShowMetaAdsSetup(true);
        return;
      }

      // Generate new Meta Ads setup
      const { data: setupData, error: setupError } = await AdStrategyService?.generateMetaAdsSetupForStrategy(adVariant?.id);
      
      if (setupError) throw setupError;

      setMetaAdsSetupData(setupData);
      setShowMetaAdsSetup(true);
      
      // Update local state to show Meta Ads setup immediately
      setSavedAds(prevAds => 
        prevAds?.map(variant => {
          if (variant?.id === adVariant?.id) {
            return {
              ...variant,
              ad_strategy: variant?.ad_strategy?.map(strategy => ({
                ...strategy,
                meta_ads_setup: [setupData]
              }))
            };
          }
          return variant;
        })
      );

      setSuccess('Meta Ads Setup erfolgreich generiert! ✅');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 4000);

    } catch (error) {
      console.error('Meta Ads setup generation error:', error);
      setError('Fehler bei der Meta Ads Setup-Generierung');
    } finally {
      setIsGeneratingMetaAds(false);
    }
  };

  // NEW: Close Meta Ads Setup Modal
  const handleCloseMetaAdsSetup = () => {
    setShowMetaAdsSetup(false);
    setSelectedAdForMetaAds(null);
    setMetaAdsSetupData(null);
  };

  // NEW: Copy Meta Ads Setup Data
  const handleCopyMetaAdsData = (data, section) => {
    const textToCopy = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(textToCopy);
    setSuccess(`${section} erfolgreich kopiert! ✅`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
      />
      <Header 
        onMenuToggle={() => setSidebarOpen(true)}
        isNavCollapsed={isNavCollapsed}
      />
      <motion.main 
        className={`pt-16 transition-all duration-300 ${isNavCollapsed ? "lg:ml-[72px]" : "lg:ml-60"}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          {/* ENHANCED: Page Header - Shows strategies by default */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">
                  {showSavedAds ? 'Werbestrategien' : 'Deine Facebook Ad-Strategie'}
                </h1>
                <p className="text-muted-foreground">
                  {showSavedAds 
                    ? 'Alle deine gespeicherten Anzeigen. Klicke auf "Werbestrategie" um durch unseren 7-Schritte-Fragebogen die optimale Kampagnenstrategie zu ermitteln.' :'Basierend auf deinem Produkt und Ziel hat BlackRuby die optimale Meta-Strategie ausgewählt.'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Toggle between views only if adId exists */}
                {adId && (
                  <button
                    onClick={showSavedAds ? handleShowAnalysis : handleBackToSavedAds}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      showSavedAds 
                        ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                        : 'bg-[#C80000] text-white hover:bg-[#C80000]/90'
                    }`}
                  >
                    <Icon name={showSavedAds ? "BarChart" : "ArrowLeft"} size={20} />
                    <span>{showSavedAds ? 'Zur Analyse' : 'Zu Strategien'}</span>
                  </button>
                )}
                
                <button
                  onClick={handleBackToBuilder}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#C80000] text-white hover:bg-[#C80000]/90 rounded-lg transition-colors"
                >
                  <Icon name="Plus" size={20} />
                  <span>Neue Anzeige erstellen</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error and Success Messages */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive/60 hover:text-destructive"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} />
                <span>{success}</span>
                <button 
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-400 hover:text-green-600"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PRIMARY VIEW: Saved Ads with Werbestrategie Button (German requirement: show directly) */}
          {showSavedAds && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {loadingSaved ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)]?.map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                      <div className="h-20 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : savedAds?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedAds?.map((variant) => (
                    <motion.div
                      key={variant?.id}
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {/* Ad Variant Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                            {variant?.generated_ad?.headline || variant?.variant_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Gespeichert: {new Date(variant?.saved_at)?.toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        {variant?.is_favorite && (
                          <Icon name="Heart" size={16} className="text-red-500 fill-current" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {variant?.generated_ad?.product?.product_name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="capitalize">{variant?.generated_ad?.product?.industry}</span>
                          <span>•</span>
                          <span className="capitalize">{variant?.generated_ad?.product?.tonality}</span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {variant?.generated_ad?.conversion_score || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Conversion</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {variant?.generated_ad?.estimated_ctr?.toFixed(1) || '2.1'}%
                            </div>
                            <div className="text-xs text-muted-foreground">CTR</div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Image Indicator */}
                      {variant?.performance_data?.custom_image_url && (
                        <div className="mb-4 flex items-center space-x-2 text-sm text-blue-600">
                          <Icon name="Image" size={14} />
                          <span>Mit eigenem Bild</span>
                        </div>
                      )}

                      {/* ENHANCED: Strategy Assignment Status with Meta Ads Setup */}
                      {variant?.ad_strategy?.length > 0 ? (
                        <div className="mb-4 space-y-2">
                          <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Icon name="CheckCircle" size={14} className="text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Werbestrategie zugewiesen
                              </span>
                            </div>
                            <p className="text-xs text-green-600 font-medium">
                              {variant?.ad_strategy?.[0]?.selected_strategy?.title}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-green-500">
                                Match: {variant?.ad_strategy?.[0]?.matching_score}/100
                              </span>
                              <span className="text-xs text-green-500 capitalize">
                                Konfidenz: {variant?.ad_strategy?.[0]?.confidence_level?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* NEW: Meta Ads Setup Card */}
                          {variant?.ad_strategy?.[0]?.meta_ads_setup?.length > 0 ? (
                            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Icon name="Settings" size={14} className="text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">
                                    Meta Ads Umsetzung (Facebook & Instagram)
                                  </span>
                                </div>
                                <Icon name="ExternalLink" size={12} className="text-blue-500" />
                              </div>
                              <p className="text-xs text-blue-600 mb-2">
                                Schritt-für-Schritt Setup-Anleitung für Meta Ads Manager 2025
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleGenerateMetaAdsSetup(variant)}
                                  className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Setup anzeigen
                                </button>
                                <button
                                  onClick={() => handleCopyMetaAdsData(variant?.ad_strategy?.[0]?.meta_ads_setup?.[0]?.campaign_config?.campaign_name, 'Kampagnenname')}
                                  className="px-3 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                >
                                  <Icon name="Copy" size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Icon name="Zap" size={14} className="text-orange-600" />
                                <span className="text-sm font-medium text-orange-700">
                                  Meta Ads Setup generieren
                                </span>
                              </div>
                              <p className="text-xs text-orange-600 mb-2">
                                Automatische Meta Ads Manager Anleitung basierend auf Ihrer Strategie
                              </p>
                              <button
                                onClick={() => handleGenerateMetaAdsSetup(variant)}
                                disabled={isGeneratingMetaAds}
                                className="w-full px-3 py-2 bg-gradient-to-r from-[#C80000] to-[#A00000] text-white rounded-lg hover:from-[#B00000] hover:to-[#900000] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                              >
                                {isGeneratingMetaAds && selectedAdForMetaAds?.id === variant?.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="text-sm">KI erstellt Setup...</span>
                                  </>
                                ) : (
                                  <>
                                    <Icon name="Settings" size={16} />
                                    <span className="text-sm font-medium">Meta Ads Setup erstellen</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleFindStrategy(variant)}
                            className="w-full px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Strategie bearbeiten
                          </button>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <button
                            onClick={() => handleFindStrategy(variant)}
                            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-[#C80000] to-[#A00000] text-white rounded-lg hover:from-[#B00000] hover:to-[#900000] transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-[#C80000]/25"
                          >
                            <Icon name="Target" size={16} />
                            <span className="font-medium">Werbestrategie</span>
                          </button>
                        </div>
                      )}

                      {/* Ad Preview */}
                      <div className="mb-4 p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {variant?.generated_ad?.primary_text}
                        </p>
                      </div>

                      {/* Action Buttons - Werbestrategie button is now ABOVE Bearbeiten */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/app-builder-interface?adId=${variant?.generated_ad?.id}`)}
                            className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteSavedAd(variant?.id)}
                            className="px-3 py-2 text-sm border border-border rounded hover:bg-muted transition-colors"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Noch keine Werbestrategien vorhanden
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Erstellen Sie Anzeigen im Ad Builder und übernehmen Sie sie, um hier Strategien zu entwickeln.
                  </p>
                  <button
                    onClick={() => navigate('/app-builder-interface')}
                    className="px-6 py-3 bg-[#C80000] text-white rounded-lg hover:bg-[#C80000]/90 transition-colors"
                  >
                    Zum Ad Builder
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYSIS VIEW: Only show when specific ad analysis requested */}
          {!showSavedAds && !isAnalyzing && adData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Ad Summary */}
              <motion.div 
                className="bg-card border border-border rounded-lg p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Target" size={20} className="mr-2 text-primary" />
                  Deine Anzeige
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Produkt</h4>
                    <p className="text-sm text-muted-foreground">{productData?.product_name}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Zielgruppe</h4>
                    <p className="text-sm text-muted-foreground">{productData?.target_audience}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Branche</h4>
                    <p className="text-sm text-muted-foreground capitalize">{productData?.industry}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Tonalität</h4>
                    <p className="text-sm text-muted-foreground capitalize">{productData?.tonality}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-1">CTA</h4>
                    <p className="text-sm text-muted-foreground">{adData?.cta}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-1">Conversion Score</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${adData?.conversion_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">{adData?.conversion_score}/100</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Middle Column - AI Recommended Strategy */}
              <motion.div 
                className="bg-card border border-border rounded-lg p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Sparkles" size={20} className="mr-2 text-success" />
                  KI-Empfohlene Strategie
                </h3>

                {recommendedStrategy ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-lg">{recommendedStrategy?.title}</h4>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded text-sm">
                        <Icon name="TrendingUp" size={14} />
                        <span>{recommendedStrategy?.performance_score}/100</span>
                      </div>
                    </div>

                    <div>
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                        {recommendedStrategy?.goal_type?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {recommendedStrategy?.description}
                    </p>

                    {aiAnalysis?.reasoning && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Warum diese Strategie?</h5>
                        <p className="text-sm text-muted-foreground">{aiAnalysis?.reasoning}</p>
                      </div>
                    )}

                    {recommendedStrategy?.recommended_budget_range && (
                      <div>
                        <h5 className="font-medium text-foreground mb-1">Empfohlenes Budget</h5>
                        <p className="text-sm text-muted-foreground">{recommendedStrategy?.recommended_budget_range}</p>
                      </div>
                    )}

                    {!adData?.selected_strategy_id && (
                      <button
                        onClick={handleApplyStrategy}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Icon name="Check" size={16} />
                        <span>Strategie übernehmen</span>
                      </button>
                    )}

                    {adData?.selected_strategy_id && (
                      <div className="flex items-center space-x-2 p-3 bg-success/10 text-success rounded-lg">
                        <Icon name="CheckCircle" size={16} />
                        <span className="text-sm">Strategie übernommen</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Keine passende Strategie gefunden</p>
                  </div>
                )}
              </motion.div>

              {/* Right Column - Action Plan */}
              <motion.div 
                className="bg-card border border-border rounded-lg p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="ListChecks" size={20} className="mr-2 text-warning" />
                  Handlungsplan
                </h3>

                {recommendedStrategy?.step_by_step ? (
                  <div className="space-y-3">
                    {recommendedStrategy?.step_by_step?.split('\n')?.map((step, index) => (
                      step?.trim() && (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm text-muted-foreground flex-1">{step?.replace(/^\d+️⃣\s*/, '')}</p>
                        </div>
                      )
                    ))}

                    <div className="mt-6 pt-4 border-t border-border">
                      <h5 className="font-medium text-foreground mb-2">Nächste Schritte</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Icon name="ArrowRight" size={14} />
                          <span>Strategie in Ad Builder umsetzen</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Icon name="ArrowRight" size={14} />
                          <span>Performance in Analysis überwachen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Handlungsplan wird geladen...</p>
                )}
              </motion.div>
            </div>
          )}

          {/* Loading State for Analysis */}
          {!showSavedAds && isAnalyzing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)]?.map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons for Analysis */}
          {!showSavedAds && !isAnalyzing && recommendedStrategy && (
            <motion.div 
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <button
                onClick={() => navigate('/app-builder-interface')}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Icon name="Edit" size={20} />
                <span>Ad überarbeiten</span>
              </button>
              
              <button
                onClick={handleGoToAnalysis}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon name="BarChart" size={20} />
                <span>Weiter zur Performance Analyse</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.main>
      {/* COMPREHENSIVE: Enhanced Interactive Strategy Finder Modal with 7-Step Questionnaire */}
      {showStrategyFinder && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseStrategyFinder}
          >
            <motion.div
              className="bg-card border border-border rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e?.stopPropagation()}
            >
              {/* Modal Header - COMPREHENSIVE DESIGN */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-[#C80000]/10 to-[#C80000]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#C80000]/20 to-[#C80000]/30 rounded-full flex items-center justify-center shadow-lg">
                      <Icon name="Target" size={28} className="text-[#C80000]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        🎯 Werbestrategie-Finder
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {strategyRecommendation ? 'Ihre personalisierte Kampagnenstrategie' : 
                         (questionnaireQuestions?.[currentQuestionIndex]?.category || 'Personalisierte Strategieempfehlung entwickeln')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseStrategyFinder}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>

                {/* Enhanced Progress Bar - only show during questionnaire */}
                {!strategyRecommendation && questionnaireQuestions?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center space-x-2">
                        <Icon name="Clock" size={14} />
                        <span>Schritt {currentQuestionIndex + 1} von {questionnaireQuestions?.length}</span>
                      </span>
                      <span className="text-[#C80000] font-medium">
                        {Math.round(((currentQuestionIndex + 1) / questionnaireQuestions?.length) * 100)}% abgeschlossen
                      </span>
                    </div>
                    
                    {/* Step indicators with category icons */}
                    <div className="flex space-x-2 mb-4">
                      {questionnaireQuestions?.map((_, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                            index < currentQuestionIndex 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-md' 
                              : index === currentQuestionIndex
                              ? 'bg-gradient-to-r from-[#C80000] to-[#A00000] shadow-lg shadow-[#C80000]/25'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Category progress with enhanced styling */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {questionnaireQuestions?.map((question, index) => (
                        <span 
                          key={index}
                          className={`text-center flex-1 transition-colors ${
                            index === currentQuestionIndex ? 'text-[#C80000] font-medium' : ''
                          }`}
                        >
                          {question?.category?.split('&')?.[0]?.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Content - COMPREHENSIVE QUESTIONNAIRE OR RESULTS */}
              <div className="p-6">
                {!strategyRecommendation ? (
                  <div className="space-y-8">
                    {/* Current Question - ENHANCED DESIGN */}
                    {questionnaireQuestions?.[currentQuestionIndex] && (
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#C80000]/10 rounded-full mb-4">
                            <Icon name="HelpCircle" size={16} className="text-[#C80000]" />
                            <span className="text-sm font-medium text-[#C80000]">
                              Schritt {questionnaireQuestions?.[currentQuestionIndex]?.step} von 7
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            {questionnaireQuestions?.[currentQuestionIndex]?.question}
                          </h3>
                          
                          {questionnaireQuestions?.[currentQuestionIndex]?.description && (
                            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                              {questionnaireQuestions?.[currentQuestionIndex]?.description}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                          {questionnaireQuestions?.[currentQuestionIndex]?.options?.map((option) => (
                            <motion.button
                              key={option?.value}
                              onClick={() => handleAnswerQuestion(
                                questionnaireQuestions?.[currentQuestionIndex]?.id, 
                                option?.value
                              )}
                              className={`p-6 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                                answers?.[questionnaireQuestions?.[currentQuestionIndex]?.id] === option?.value
                                  ? 'border-[#C80000] bg-gradient-to-r from-[#C80000]/5 to-[#C80000]/10 shadow-xl shadow-[#C80000]/20'
                                  : 'border-border hover:border-[#C80000]/50 hover:bg-muted/50'
                              }`}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start space-x-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                  answers?.[questionnaireQuestions?.[currentQuestionIndex]?.id] === option?.value
                                    ? 'border-[#C80000] bg-[#C80000] shadow-md shadow-[#C80000]/25'
                                    : 'border-muted-foreground'
                                }`}>
                                  {answers?.[questionnaireQuestions?.[currentQuestionIndex]?.id] === option?.value && (
                                    <Icon name="Check" size={14} className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-foreground mb-2">
                                    {option?.label}
                                  </div>
                                  <div className="text-sm text-muted-foreground leading-relaxed">
                                    {option?.description}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation Buttons - ENHANCED DESIGN */}
                    <div className="flex justify-between items-center pt-6 border-t border-border">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="ArrowLeft" size={16} />
                        <span>Zurück</span>
                      </button>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Icon name="Shield" size={14} />
                        <span>Ihre Daten sind sicher und werden nicht weitergegeben</span>
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        disabled={!answers?.[questionnaireQuestions?.[currentQuestionIndex]?.id] || isProcessingStrategy}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C80000] to-[#A00000] text-white rounded-lg hover:from-[#B00000] hover:to-[#900000] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C80000]/25"
                      >
                        {currentQuestionIndex === questionnaireQuestions?.length - 1 ? (
                          <>
                            {isProcessingStrategy ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>KI analysiert Strategie...</span>
                              </>
                            ) : (
                              <>
                                <span>Strategie generieren</span>
                                <Icon name="Zap" size={16} />
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span>Weiter</span>
                            <Icon name="ArrowRight" size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // COMPREHENSIVE: Strategy Recommendation Result - ENHANCED DESIGN
                  (<motion.div
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25">
                        <Icon name="CheckCircle" size={36} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        🎯 Perfekte Werbestrategie gefunden!
                      </h3>
                      <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Basierend auf Ihren {Object.keys(answers)?.length} detaillierten Antworten haben wir mit KI-Power die optimale Kampagnenstrategie für Ihr Business ermittelt.
                      </p>
                    </div>
                    {strategyRecommendation?.strategy && (
                      <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-8 border">
                        {/* Strategy Header - ENHANCED */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#C80000]/20 to-[#C80000]/30 rounded-lg flex items-center justify-center shadow-lg">
                              <Icon name="Target" size={28} className="text-[#C80000]" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-foreground">
                                {strategyRecommendation?.strategy?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                KI-Konfidenz: {strategyRecommendation?.confidence?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 rounded-full text-lg font-bold shadow-md">
                              <Icon name="TrendingUp" size={18} />
                              <span>{strategyRecommendation?.score}% Match</span>
                            </div>
                          </div>
                        </div>

                        {/* Strategy Description */}
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          {strategyRecommendation?.strategy?.description}
                        </p>

                        {/* Key Alignments - NEW SECTION */}
                        {strategyRecommendation?.key_alignments?.length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-semibold text-foreground mb-3 flex items-center">
                              <Icon name="CheckSquare" size={16} className="mr-2 text-[#C80000]" />
                              Warum diese Strategie perfekt zu Ihnen passt
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {strategyRecommendation?.key_alignments?.map((alignment, index) => (
                                <div key={index} className="flex items-start space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-muted-foreground">{alignment}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Implementation Recommendations - NEW SECTION */}
                        {strategyRecommendation?.implementation_recommendations?.length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-semibold text-foreground mb-3 flex items-center">
                              <Icon name="Lightbulb" size={16} className="mr-2 text-blue-500" />
                              Konkrete Umsetzungsempfehlungen
                            </h5>
                            <div className="space-y-2">
                              {strategyRecommendation?.implementation_recommendations?.map((recommendation, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50/50 rounded-lg">
                                  <div className="w-6 h-6 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm text-muted-foreground leading-relaxed">{recommendation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Reasoning */}
                        {strategyRecommendation?.reasoning && (
                          <div className="bg-card p-4 rounded-lg border border-border mb-6">
                            <h5 className="font-medium text-foreground mb-2 flex items-center">
                              <Icon name="Brain" size={16} className="mr-2 text-purple-500" />
                              KI-Analyse: Warum diese Strategie?
                            </h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {strategyRecommendation?.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Budget Information */}
                        {strategyRecommendation?.strategy?.budget_recommendations && (
                          <div className="mb-6 flex items-center justify-between text-sm p-4 bg-yellow-50/50 rounded-lg">
                            <span className="text-muted-foreground">💰 Empfohlenes Tagesbudget:</span>
                            <span className="font-medium text-[#C80000]">
                              {strategyRecommendation?.strategy?.budget_recommendations?.daily_budget || 'Individuell anpassbar'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Alternative Strategies - ENHANCED */}
                    {strategyRecommendation?.alternatives?.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-foreground mb-4 flex items-center">
                          <Icon name="GitBranch" size={16} className="mr-2" />
                          Alternative Strategien
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {strategyRecommendation?.alternatives?.map((alt, index) => (
                            <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-foreground">{alt?.title}</h6>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{alt?.score}% Match</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{alt?.description}</p>
                              {alt?.reason && (
                                <p className="text-xs text-blue-600">{alt?.reason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Action Buttons - ENHANCED */}
                    <div className="flex space-x-4 pt-6 border-t border-border">
                      <button
                        onClick={handleCloseStrategyFinder}
                        className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                      >
                        Später entscheiden
                      </button>
                      <button
                        onClick={handleSaveStrategy}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C80000] to-[#A00000] text-white rounded-lg hover:from-[#B00000] hover:to-[#900000] transition-all shadow-lg shadow-[#C80000]/25 text-center font-medium"
                      >
                        <Icon name="Save" size={16} className="inline mr-2" />
                        Strategie speichern & anwenden
                      </button>
                    </div>
                  </motion.div>)
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* NEW: Meta Ads Setup Modal */}
      {showMetaAdsSetup && metaAdsSetupData && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMetaAdsSetup}
          >
            <motion.div
              className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e?.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-blue-500/10 to-indigo-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/30 rounded-full flex items-center justify-center shadow-lg">
                      <Icon name="Settings" size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        📱 Meta Ads Umsetzung (Facebook & Instagram)
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Schritt-für-Schritt Anleitung für Meta Ads Manager 2025
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseMetaAdsSetup}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Campaign Configuration */}
                {metaAdsSetupData?.campaign_config && (
                  <motion.div
                    className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center">
                        <Icon name="Target" size={20} className="mr-2 text-blue-600" />
                        1. Kampagne erstellen
                      </h3>
                      <button
                        onClick={() => handleCopyMetaAdsData(metaAdsSetupData?.campaign_config, 'Kampagne')}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Icon name="Copy" size={14} />
                        <span>Kopieren</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Kampagnenziel</label>
                          <p className="text-foreground font-medium">{metaAdsSetupData?.campaign_config?.objective}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Kampagnenname</label>
                          <p className="text-foreground font-medium break-words">{metaAdsSetupData?.campaign_config?.campaign_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tagesbudget</label>
                          <p className="text-foreground font-medium">{metaAdsSetupData?.campaign_config?.budget}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Optimierungsziel</label>
                          <p className="text-foreground font-medium">{metaAdsSetupData?.campaign_config?.optimization_goal}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Laufzeit</label>
                          <p className="text-foreground font-medium">{metaAdsSetupData?.campaign_config?.duration}</p>
                        </div>
                        {metaAdsSetupData?.campaign_config?.notes && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Wichtige Hinweise</label>
                            <p className="text-sm text-muted-foreground">{metaAdsSetupData?.campaign_config?.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* AdSets Configuration */}
                {metaAdsSetupData?.adsets_config?.length > 0 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground flex items-center">
                        <Icon name="Users" size={20} className="mr-2 text-green-600" />
                        2. AdSets konfigurieren ({metaAdsSetupData?.adsets_config?.length} Zielgruppen)
                      </h3>
                      <button
                        onClick={() => handleCopyMetaAdsData(metaAdsSetupData?.adsets_config, 'AdSets')}
                        className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        <Icon name="Copy" size={14} />
                        <span>Alle kopieren</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {metaAdsSetupData?.adsets_config?.map((adset, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-lg p-4 border border-green-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{adset?.name}</h4>
                            <span className="text-sm font-medium text-green-600">{adset?.budget}</span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Platzierungen:</span>
                              <span className="text-foreground">{adset?.placements}</span>
                            </div>
                            
                            {adset?.target_audience && (
                              <div className="mt-3 p-2 bg-muted/30 rounded">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Zielgruppe:</p>
                                {adset?.target_audience?.age && (
                                  <p className="text-xs">Alter: {adset?.target_audience?.age}</p>
                                )}
                                {adset?.target_audience?.locations?.length > 0 && (
                                  <p className="text-xs">Standorte: {adset?.target_audience?.locations?.join(', ')}</p>
                                )}
                                {adset?.target_audience?.interests?.length > 0 && (
                                  <p className="text-xs">Interessen: {adset?.target_audience?.interests?.slice(0, 3)?.join(', ')}{adset?.target_audience?.interests?.length > 3 ? '...' : ''}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Ads Configuration */}
                {metaAdsSetupData?.ads_config?.length > 0 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground flex items-center">
                        <Icon name="Image" size={20} className="mr-2 text-purple-600" />
                        3. Anzeigen erstellen ({metaAdsSetupData?.ads_config?.length} Varianten)
                      </h3>
                      <button
                        onClick={() => handleCopyMetaAdsData(metaAdsSetupData?.ads_config, 'Anzeigen')}
                        className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Icon name="Copy" size={14} />
                        <span>Alle kopieren</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {metaAdsSetupData?.ads_config?.map((ad, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-lg p-4 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{ad?.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">{ad?.format}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{ad?.cta}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Headline:</label>
                              <p className="text-sm text-foreground">{ad?.headline}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Text:</label>
                              <p className="text-sm text-foreground line-clamp-2">{ad?.primary_text}</p>
                            </div>
                            {ad?.tracking && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Tracking:</label>
                                <p className="text-xs text-muted-foreground">{ad?.tracking}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommendations */}
                {metaAdsSetupData?.recommendations && (
                  <motion.div
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-xl p-6 border border-yellow-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center">
                        <Icon name="Lightbulb" size={20} className="mr-2 text-yellow-600" />
                        4. Empfehlungen & Best Practices
                      </h3>
                      <button
                        onClick={() => handleCopyMetaAdsData(metaAdsSetupData?.recommendations, 'Empfehlungen')}
                        className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                      >
                        <Icon name="Copy" size={14} />
                        <span>Kopieren</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {metaAdsSetupData?.recommendations?.testing && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center">
                            <Icon name="TestTube" size={16} className="mr-1 text-yellow-600" />
                            Testing
                          </h4>
                          <p className="text-sm text-muted-foreground">{metaAdsSetupData?.recommendations?.testing}</p>
                        </div>
                      )}
                      {metaAdsSetupData?.recommendations?.scaling && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center">
                            <Icon name="TrendingUp" size={16} className="mr-1 text-green-600" />
                            Skalierung
                          </h4>
                          <p className="text-sm text-muted-foreground">{metaAdsSetupData?.recommendations?.scaling}</p>
                        </div>
                      )}
                      {metaAdsSetupData?.recommendations?.reporting && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center">
                            <Icon name="BarChart" size={16} className="mr-1 text-blue-600" />
                            Reporting
                          </h4>
                          <p className="text-sm text-muted-foreground">{metaAdsSetupData?.recommendations?.reporting}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-border">
                  <button
                    onClick={handleCloseMetaAdsSetup}
                    className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    Schließen
                  </button>
                  <button
                    onClick={() => handleCopyMetaAdsData(metaAdsSetupData?.setup_data, 'Komplettes Setup')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C80000] to-[#A00000] text-white rounded-lg hover:from-[#B00000] hover:to-[#900000] transition-all shadow-lg shadow-[#C80000]/25 text-center font-medium"
                  >
                    <Icon name="Download" size={16} className="inline mr-2" />
                    Komplettes Setup exportieren
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AdStrategy;
