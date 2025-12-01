import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Header from "../../components/ui/Header";
import Sidebar from "../../components/ui/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import AdBuilderStepper from "../../components/AdBuilderStepper";
import InputForm from "./components/InputForm";
import AnalysisPanel from "./components/AnalysisPanel";
import PreviewPanel from "./components/PreviewPanel";
import Icon from "../../components/AppIcon";
import AdBuilderService from "../../services/adBuilderService";
import Button from "../../components/ui/Button";

const HighConversionAdBuilder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // Form and generation state
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    industry: "e_commerce",
    target_audience: "",
    main_benefits: "",
    pain_points: "",
    usp: "",
    price_offer: "",
    tonality: "professional",
    cta_text: "Jetzt kaufen",
    focus_emotion: false,
    focus_benefits: true,
    focus_urgency: false,
    ad_goal: "sales",
    market_country: "DE",
    language: "de",
    research_keyword: "",
    research_country: "DE",
    research_max_results: 30,
    research_period: "30d",
  });

  const [currentStep, setCurrentStep] = useState(0); // 0=input,1=analyse,2=ads
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketInsights, setMarketInsights] = useState(null);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [canvasTab, setCanvasTab] = useState("copy");
  const [placement, setPlacement] = useState("feed");
  const [adPressure, setAdPressure] = useState("mittel");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [researchJobId, setResearchJobId] = useState(null);
  const [researchAds, setResearchAds] = useState([]);
  const [analyzedResearchAds, setAnalyzedResearchAds] = useState([]);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [isResearchAnalyzing, setIsResearchAnalyzing] = useState(false);
  const [researchError, setResearchError] = useState(null);

  // Load stats for badge feel (optional)
  const [stats, setStats] = useState({
    generatedAds: 0,
    successRate: 94.2,
    avgGenerationTime: "2.3s",
  });

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  useEffect(() => {
    setIsNavCollapsed(true);
    setSidebarOpen(false);
  }, [location?.pathname]);

  const loadUserStats = async () => {
    try {
      const { data: products } = await AdBuilderService.getProducts(user?.id);
      const totalAds =
        products?.reduce(
          (sum, product) => sum + (product?.generated_ads?.length || 0),
          0
        ) || 0;

      setStats((prev) => ({
        ...prev,
        generatedAds: totalAds + 15,
      }));
    } catch (err) {
      console.error("Error loading user stats:", err);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };

  const validateForm = () => {
    const required = [
      "product_name",
      "product_description",
      "target_audience",
      "main_benefits",
      "pain_points",
      "usp",
    ];

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
      product_name: "Produktname",
      product_description: "Produktbeschreibung",
      target_audience: "Zielgruppe",
      main_benefits: "Hauptnutzen",
      pain_points: "Schmerzpunkte",
      usp: "USP",
    };
    return labels?.[field] || field;
  };

  const handleNewAnalysis = () => {
    setCurrentStep(0);
    setMarketInsights(null);
    setGeneratedAds([]);
    setSelectedAd(null);
    setError(null);
    setSuccess(null);
  };

  const handleStepChange = (index) => {
    setCurrentStep(index);
    setIsNavCollapsed(true);
    setSidebarOpen(false);
  };

  const handleSelectAd = (ad) => {
    setSelectedAd(ad);
  };

  const handleDuplicateVariant = () => {
    if (!selectedAd) return;
    const clone = {
      ...selectedAd,
      id: `${selectedAd.id || Date.now()}-clone-${Date.now()}`,
    };
    const updated = [...generatedAds, clone];
    setGeneratedAds(updated);
    setSelectedAd(clone);
  };

  const handleRerollHook = () => {
    handleAnalyzeAndGenerate();
  };

  const buildFacebookAdsLibraryUrl = ({ country, searchTerm, pageId }) => {
    const base = "https://www.facebook.com/ads/library/";
    const params = new URLSearchParams({
      active_status: "all",
      ad_type: "all",
      country: country || "DE",
      q: searchTerm || "",
    });
    if (pageId) {
      params.set("view_all_page_id", pageId);
    }
    return `${base}?${params.toString()}`;
  };

  const startAdResearch = async () => {
    // optional: Formular prüfen, aber nicht hart abbrechen,
    // weil handleAnalyzeAndGenerate schon validiert
    console.log("[AdBuilder] startAdResearch (auto/manual) triggered");

    setResearchError(null);
    setIsResearchLoading(true);

    try {
      const keyword =
        formData.research_keyword?.trim() || formData.product_name?.trim();

      if (!keyword) {
        const msg =
          "Bitte geben Sie ein Research-Keyword oder einen Produktnamen ein.";
        console.warn("[AdBuilder] startAdResearch aborted:", msg);
        setResearchError(msg);
        setIsResearchLoading(false);
        return null;
      }

      const country =
        formData.research_country || formData.market_country || "DE";

      const searchUrl = buildFacebookAdsLibraryUrl({
        country,
        searchTerm: keyword,
        pageId: formData?.page_id,
      });

      const maxAds = Number(formData.research_max_results) || 30;

      console.log("[AdResearch][Frontend] startAdResearch", {
        searchUrl,
        maxAds,
      });

      const res = await fetch("/.netlify/functions/ad-research-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchUrl,
          maxAds,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ad Research Start failed: ${res.status} ${text}`);
      }

      const json = await res.json();

      const jobId = json.jobId || json.job_id || null;
      const ads = Array.isArray(json.ads) ? json.ads : [];

      setResearchJobId(jobId);
      setResearchAds(ads);

      console.log("[AdBuilder] startAdResearch result", {
        jobId,
        adsCount: ads.length,
        status: json.status,
        datasetId: json.datasetId || json.defaultDatasetId || null,
      });

      // Wichtig: Ergebnis an Aufrufer zurückgeben
      return { jobId, ads, raw: json };
    } catch (err) {
      console.error("[AdBuilder] startAdResearch error", err);
      setResearchError(
        err?.message || "Fehler beim Start des Ad Research"
      );
      return null;
    } finally {
      setIsResearchLoading(false);
    }
  };

  const analyzeResearchAds = async (jobIdOverride) => {
    const effectiveJobId = jobIdOverride || researchJobId;

    console.log("[AdBuilder] analyzeResearchAds triggered", {
      jobIdOverride,
      effectiveJobId,
    });

    if (!effectiveJobId) {
      const msg =
        "Kein Research-Job vorhanden. Bitte zuerst Research starten.";
      console.warn("[AdBuilder] analyzeResearchAds aborted:", msg);
      setResearchError(msg);
      return null;
    }

    setResearchError(null);
    setIsResearchAnalyzing(true);

    try {
      const limit = Number(formData.research_max_results) || 30;

      const res = await fetch("/.netlify/functions/ad-research-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: effectiveJobId,
          limit,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ad Research Analyze failed: ${res.status} ${text}`);
      }

      const json = await res.json();
      const ads = json.ads || json.results || [];

      setAnalyzedResearchAds(ads);

      console.log("[AdBuilder] analyzeResearchAds result", {
        jobId: effectiveJobId,
        adsCount: ads.length,
      });

      // Wichtig: Ergebnis zurückgeben
      return { jobId: effectiveJobId, ads, raw: json };
    } catch (err) {
      console.error("[AdBuilder] analyzeResearchAds error", err);
      setResearchError(
        err?.message || "Fehler bei der Analyse der gescrapten Ads"
      );
      return null;
    } finally {
      setIsResearchAnalyzing(false);
    }
  };

  const handleAnalyzeAndGenerate = async () => {
    console.log("[AdBuilder] handleAnalyzeAndGenerate triggered", {
      formData,
      hasResearchAds: Array.isArray(researchAds) && researchAds.length > 0,
      hasAnalyzedResearchAds:
        Array.isArray(analyzedResearchAds) && analyzedResearchAds.length > 0,
    });

    if (!validateForm()) return;
    console.log("[AdBuilder] validateForm passed");

    setError(null);
    setSuccess(null);
    setIsAnalyzing(true);
    setCurrentStep(1);

    // 1) Automatischer Research-Flow (Scraping + Analyse)
    let researchContext = null;

    try {
      console.log("[AdBuilder] Auto research flow: start");

      // a) Scraping (Apify)
      const researchStartResult = await startAdResearch();
      const jobId = researchStartResult?.jobId || researchJobId || null;

      if (jobId) {
        // b) Analyse der gescrapten Ads
        const analyzeResult = await analyzeResearchAds(jobId);
        const analyzedAds = analyzeResult?.ads || [];

        if (Array.isArray(analyzedAds) && analyzedAds.length > 0) {
          researchContext = {
            topAds: analyzedAds.slice(0, 10),
            topHooks: analyzedAds
              .map((a) => a.mainHook || a.main_hook)
              .filter(Boolean)
              .slice(0, 10),
            source: "meta_ad_library",
            jobId,
          };
        }

        console.log("[AdBuilder] Auto research flow finished", {
          jobId,
          analyzedAdsCount: analyzedAds.length,
          hasResearchContext: !!researchContext,
        });
      } else {
        console.warn(
          "[AdBuilder] Auto research flow: no jobId available, continuing without researchContext"
        );
      }
    } catch (researchErr) {
      console.error("[AdBuilder] Error in automatic research flow", researchErr);
      // Fehler im Research sollen die Ad-Erstellung nicht komplett blockieren
    }

    try {
      // 2) Produktdaten mit Werbedruck erweitern
      const extendedForm = {
        ...formData,
        ad_pressure: adPressure,
      };

      console.log("[AdBuilder] Creating product with payload", extendedForm);
      const { data: product, error: productError } =
        await AdBuilderService.createProduct(extendedForm);
      if (productError) throw productError;

      console.log("[AdBuilder] Product created", { productId: product?.id });

      // 3) Marktanalyse mit optionalem Research-Context
      console.log("[AdBuilder] Starting market analysis", {
        hasResearchContext: !!researchContext,
      });

      const {
        data: insights,
        error: analysisError,
        fallbackUsed,
        fallbackReason,
      } = await AdBuilderService.analyzeMarket(
        product,
        researchContext || undefined
      );

      if (!insights && analysisError) throw analysisError;
      setMarketInsights(insights);

      if (fallbackUsed) {
        setSuccess(
          `Marktanalyse mit Fallback-Daten abgeschlossen (${fallbackReason})`
        );
      }

      console.log("[AdBuilder] Market analysis finished", {
        hasInsights: !!insights,
        fallbackUsed,
        fallbackReason,
      });

      // 4) Ad-Generierung
      setIsAnalyzing(false);
      setIsGenerating(true);
      setCurrentStep(2);

      console.log("[AdBuilder] Generating ads", {
        productId: product?.id,
        hasInsights: !!insights,
        hasResearchContext: !!researchContext,
      });

      const { data: ads, error: adsError, fallbackGenerated } =
        await AdBuilderService.generateAds(
          product,
          insights,
          researchContext || undefined
        );
      if (!ads && adsError) throw adsError;

      const { data: savedAds, error: saveError } =
        await AdBuilderService.saveGeneratedAds(product?.id, ads);
      if (saveError) throw saveError;

      await AdBuilderService.saveMarketInsights(product?.id, insights);

      setGeneratedAds(savedAds || []);
      setSelectedAd(savedAds?.[0] || null);
      console.log("[AdBuilder] Ads generated and saved", {
        count: savedAds?.length || 0,
      });

      let successMsg = "Anzeigen erfolgreich generiert!";
      if (fallbackGenerated && fallbackUsed) {
        successMsg =
          "Anzeigen mit Fallback-Systemen generiert - vollständig funktionsfähig!";
      } else if (fallbackGenerated) {
        successMsg = "Anzeigen mit alternativer Generierung erstellt!";
      } else if (fallbackUsed) {
        successMsg =
          "Anzeigen erfolgreich generiert (mit Fallback-Marktdaten)!";
      }

      setSuccess(successMsg);
      loadUserStats();
    } catch (err) {
      console.error(
        "[AdBuilder] Global error in handleAnalyzeAndGenerate",
        err
      );

      let errorMessage =
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";

      if (AdBuilderService?.isOpenAIQuotaError?.(err)) {
        errorMessage =
          "OpenAI API-Limit erreicht. Bitte überprüfen Sie Ihr OpenAI-Konto oder kontaktieren Sie den Support.";
      } else if (AdBuilderService?.isNetworkError?.(err)) {
        errorMessage =
          "Netzwerkproblem festgestellt. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.";
      } else if (err?.message?.includes("User not authenticated")) {
        errorMessage = "Sitzung abgelaufen. Bitte melden Sie sich erneut an.";
      } else if (err?.message) {
        errorMessage = `Fehler: ${err?.message}`;
      }

      setError(errorMessage);
      setCurrentStep(0);
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };


  const subtleText = "text-slate-500 dark:text-slate-400";

  const scoreValue = Math.min(
    100,
    Math.max(35, Number(selectedAd?.conversion_score || stats?.successRate || 72))
  );
  const focusMetrics = {
    emotion: selectedAd?.focus_emotion ? 90 : 65,
    benefits: selectedAd?.focus_benefits ? 88 : 60,
    urgency: selectedAd?.focus_urgency ? 82 : 55,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050509] dark:text-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
      />
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
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
        <div className="p-4 sm:p-6">
          <motion.div
            className="mb-6 sm:mb-8 space-y-3"
            variants={itemVariants}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold">Ad Builder: AdCreative Lab</h1>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-700 dark:text-blue-200">
                    Beta: Ad Research
                  </span>
                </div>
                <p className={`text-sm ${subtleText}`}>
                  KI-gestützter Anzeigengenerator für maximale Conversion-Raten
                </p>
                <p className="text-sm text-muted-foreground">
                  Beim Klick auf <span className="font-semibold">„Ad-Erstellung starten“</span> führt das System automatisch ein Ad&nbsp;Research in der Meta Ad Library durch und richtet deine KI-Ads an den gefundenen Top-Performern aus.
                </p>

                {(researchAds?.length > 0 || analyzedResearchAds?.length > 0) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Automatisches Research aktiv • Gescrapte Ads: {researchAds?.length || 0} • Analysierte Ads: {analyzedResearchAds?.length || 0}
                  </p>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 lg:w-[620px]">
                <AdBuilderStepper currentStep={currentStep} onStepChange={handleStepChange} />
                {generatedAds?.length > 0 && (
                  <div className="flex lg:justify-end">
                    <motion.button
                      onClick={handleNewAnalysis}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition shadow-[0_10px_30px_rgba(200,0,0,0.25)] bg-[#C80000] text-white hover:bg-[#a50000]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon name="Plus" size={20} />
                      <span>Neue Analyse</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

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
          {researchError && (
            <motion.div
              className="mb-4 sm:mb-6 p-4 bg-rose-500/10 border border-rose-500/40 rounded-lg text-rose-900 dark:text-rose-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} />
                <span>{researchError}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                <div className="space-y-4 order-1 xl:order-none">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#0b0b10]">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex gap-2">
                        {["quick", "pro"].map((mode) => (
                          <span
                            key={mode}
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                          >
                            {mode === "quick" ? "Schnellstart" : "Pro-Lab"}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          Werbedruck
                        </span>
                        <div className="flex gap-2">
                          {["soft", "mittel", "aggressiv"].map((p) => (
                            <button
                              key={p}
                              onClick={() => setAdPressure(p)}
                              className={`px-2 py-1 rounded-md border text-[11px] transition ${
                                adPressure === p
                                  ? "border-[#C80000] bg-[#C80000]/10 text-[#C80000]"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <InputForm
                        formData={formData}
                        setFormData={setFormData}
                        handleAdCreationStart={handleAnalyzeAndGenerate}
                        onGenerate={handleAnalyzeAndGenerate}
                        isRunning={
                          isAnalyzing ||
                          isGenerating ||
                          isResearchLoading ||
                          isResearchAnalyzing
                        }
                        isGenerating={isGenerating}
                        isAnalyzing={isAnalyzing}
                      />
                    </div>
                  </div>
                </div>

                  <div className="space-y-4 order-2 xl:order-none">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-lg dark:border-white/10 dark:bg-[#0b0b10]">
                      <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-rose-500">
                          Schnellvorschau
                        </p>
                        <h3 className="text-lg font-semibold">
                          Form-Status & Schnell-Check
                        </h3>
                        <p className={`text-sm ${subtleText}`}>
                          Stelle sicher, dass alle Pflichtfelder gesetzt sind und wähle den passenden Werbedruck.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600">
                          {stats.generatedAds} Anzeigen generiert
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600">
                          Avg {stats.avgGenerationTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-6"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0b0b10]">
                  <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
                        Stage 2
                      </p>
                      <h3 className="text-xl font-semibold">Marktanalyse</h3>
                      <p className={`text-sm ${subtleText}`}>
                        Zielgruppen-Insights, Schmerzpunkte und Wettbewerbsabgrenzung.
                      </p>
                    </div>
                    {analyzedResearchAds?.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        Generiert mit Markt-Research-Signalen
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyzeAndGenerate}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                          <Icon name="RefreshCw" size={16} />
                          Neu analysieren
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#C80000] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(200,0,0,0.25)] hover:bg-[#a50000]"
                        >
                     ‚     Weiter zur Ad-Generierung
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <AnalysisCard
                        title="Zielgruppen-Insights"
                        accent="from-blue-500/20 to-indigo-500/20"
                        bullets={
                          marketInsights?.personas ||
                          marketInsights?.common_hooks || [
                            "Segmentiere nach Bedarf, Budget & Affinität",
                            "Emotionale Trigger: Neugier, Sicherheit, Status",
                            "Platzierungsempfehlung: Feed & Story",
                          ]
                        }
                      />
                      <AnalysisCard
                        title="Wichtigste Schmerzpunkte & Wünsche"
                        accent="from-amber-500/20 to-orange-500/20"
                        bullets={
                          marketInsights?.pain_points || [
                            "Zeitverlust durch manuelle Prozesse",
                            "Unsicherheit bei Kanalwahl & Botschaft",
                            "Budgetverschwendung ohne klare Tests",
                          ]
                        }
                      />
                      <AnalysisCard
                        title="Wettbewerb & Abgrenzung"
                        accent="from-emerald-500/20 to-teal-500/20"
                        bullets={
                          marketInsights?.differentiators || [
                            "Hebe klaren USP hervor (Speed + Präzision)",
                            "Kombiniere Social Proof mit Offer",
                            "Teste aggressive vs. sanfte Hooks A/B",
                          ]
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
              >
                <div className="space-y-4 order-1">
                  <div className="rounded-2xl border border-white/5 bg-[#141418] p-4 sm:p-5 backdrop-blur shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {["copy", "image", "structure"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setCanvasTab(tab)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                              canvasTab === tab
                                ? "bg-[#C80000] text-white"
                                : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {tab === "copy" && "Copy"}
                            {tab === "image" && "Image Prompts"}
                            {tab === "structure" && "Struktur"}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 rounded-lg p-1 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                          {["feed", "story", "reel"].map((p) => (
                            <button
                              key={p}
                              onClick={() => setPlacement(p)}
                              className={`px-2 py-1 text-[10px] rounded-md transition ${
                                placement === p
                                  ? "bg-[#C80000] text-white"
                                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                              }`}
                            >
                              {p === "feed" && "Feed"}
                              {p === "story" && "Story"}
                              {p === "reel" && "Reel"}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleRerollHook}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          <Icon name="Dice5" size={16} />
                          Hook neu würfeln
                        </button>
                        <button
                          onClick={handleDuplicateVariant}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#C80000] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(200,0,0,0.25)] hover:bg-[#a50000]"
                        >
                          <Icon name="Copy" size={16} />
                          Variante duplizieren
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {canvasTab === "copy" && (
                        <div className="space-y-3">
                          <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                            <span>Platzierung: {placement}</span>
                            <span>
                              {selectedAd?.id
                                ? `Variante ID: ${selectedAd.id}`
                                : "Keine Auswahl"}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <h3 className="text-xl font-semibold">
                              {selectedAd?.headline ||
                                "Noch keine Anzeige gewählt"}
                            </h3>
                            <p
                              className={`text-sm leading-relaxed whitespace-pre-line mt-2 ${subtleText}`}
                            >
                              {selectedAd?.primary_text ||
                                "Sobald eine Variante ausgewählt ist, erscheint sie hier."}
                            </p>
                            <div className="mt-3 inline-flex px-3 py-2 rounded-lg bg-[#C80000]/15 border border-[#C80000]/40 text-[11px] font-semibold text-[#C80000] dark:text-white">
                              CTA: {selectedAd?.cta_text || formData?.cta_text || "Jetzt kaufen"}
                            </div>
                          </div>
                        </div>
                      )}

                      {canvasTab === "image" && (
                        <div className={`space-y-2 text-sm ${subtleText}`}>
                          <p>Image Prompts werden hier angezeigt, sobald sie verfügbar sind.</p>
                          <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                            Beispiel: “Ultra-detailliertes Produktfoto mit weichem Licht, Fokus auf USP, hochauflösend, Clean Background”
                          </div>
                        </div>
                      )}

                      {canvasTab === "structure" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className={`text-xs uppercase tracking-wide ${subtleText}`}>
                              Hook
                            </p>
                            <p className="text-sm mt-1">
                              {selectedAd?.headline || "—"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className={`text-xs uppercase tracking-wide ${subtleText}`}>
                              Body
                            </p>
                            <p className={`text-sm mt-1 whitespace-pre-line ${subtleText}`}>
                              {selectedAd?.primary_text || "—"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className={`text-xs uppercase tracking-wide ${subtleText}`}>
                              CTA
                            </p>
                            <p className="text-sm mt-1">
                              {selectedAd?.cta_text || formData?.cta_text || "Jetzt kaufen"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-2">
                  <PreviewPanel
                    selectedAd={selectedAd}
                    isGenerating={isGenerating}
                    productData={formData}
                    generatedAds={generatedAds}
                    onSelectAd={handleSelectAd}
                  />
                </div>

                <div className="space-y-4 order-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#0b0b10]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-rose-500">
                          Score
                        </p>
                        <h3 className="text-lg font-semibold">Conversion-Score</h3>
                      </div>
                      <div className="relative h-16 w-16">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(#C80000 ${scoreValue * 3.6}deg, #1f2937 0deg)`,
                          }}
                        />
                        <div className="absolute inset-2 rounded-full bg-white dark:bg-[#0b0b10] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.45)]">
                          <span className="text-sm font-semibold">
                            {Math.round(scoreValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Emotion",
                          value: focusMetrics.emotion,
                          color: "from-rose-500 to-pink-500",
                        },
                        {
                          label: "Nutzen",
                          value: focusMetrics.benefits,
                          color: "from-emerald-500 to-teal-500",
                        },
                        {
                          label: "Dringlichkeit",
                          value: focusMetrics.urgency,
                          color: "from-amber-500 to-orange-500",
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-1">
                          <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                            <span>{metric.label}</span>
                            <span className="text-slate-900 dark:text-white">
                              {metric.value}%
                            </span>
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#0b0b10]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-rose-500">
                          Varianten
                        </p>
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
                                ? "border-[#C80000] bg-[#C80000]/10 shadow-[0_10px_40px_rgba(200,0,0,0.25)]"
                                : "border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/10"
                            }`}
                            onClick={() => setSelectedAd(ad)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {ad?.headline ||
                                    ad?.primary_text ||
                                    `Variante ${index + 1}`}
                                </p>
                                <p className={`text-xs ${subtleText} line-clamp-2`}>
                                  {ad?.primary_text || ad?.description || "—"}
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
                                      `${ad?.headline || ""}\n\n${ad?.primary_text || ""}\nCTA: ${
                                        ad?.cta_text || "Jetzt kaufen"
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
                        <p className="text-xs text-slate-400">
                          Noch keine Varianten generiert.
                        </p>
                      )}
                    </div>
                  </div>
                  <AnalysisPanel
                    marketInsights={marketInsights}
                    generatedAds={generatedAds}
                    isAnalyzing={isAnalyzing}
                    isGenerating={isGenerating}
                    onSelectAd={setSelectedAd}
                    selectedAd={selectedAd}
                    researchAds={researchAds}
                    analyzedResearchAds={analyzedResearchAds}
                    isResearchLoading={isResearchLoading}
                    isResearchAnalyzing={isResearchAnalyzing}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};

const AnalysisCard = ({ title, bullets, accent }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#0b0b10]">
    <div
      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`}
    />
    <div className="relative flex flex-col gap-3">
      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h4>
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {bullets?.slice(0, 4)?.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#C80000]" />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HighConversionAdBuilder;
