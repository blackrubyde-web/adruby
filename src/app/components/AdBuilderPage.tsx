import { useEffect, useMemo, useReducer, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Image as ImageIcon, 
  TrendingUp,
  Users,
  Check,
  Zap,
  Brain,
  BarChart3,
  Rocket
} from 'lucide-react';
import { MarketAnalysisLoader } from './MarketAnalysisLoader';
import { AdPreview } from './AdPreview';
import { ConversionScore } from './ConversionScore';
import { AIAdCopyGenerator } from './AIAdCopyGenerator';
import { PageShell, HeroHeader, Card } from './layout';
import {
  adBuilderReducer,
  initialAdBuilderState,
  type AdBuilderData
} from './ad-builder/adBuilderReducer';
import type { CreativeOutput, CreativeOutputV1, CreativeOutputPro } from '../lib/creative/types';
import { useStrategies } from '../hooks/useStrategies';
import useAdBuilder from '../hooks/useAdBuilder';
import { creativeSaveToLibrary } from '../lib/api/creative';
import { toast } from 'sonner';
import AdResearchList from '../demo/AdResearchList';
import CreativeResults from './creative-builder/CreativeResults';
import ImageDropzone from './creative-builder/ImageDropzone';
import { supabase } from '../lib/supabaseClient';

const DRAFT_KEY = 'ad_ruby_ad_builder_draft';

const steps = [
  { id: 1, name: 'Produkt & Angebot', icon: Sparkles },
  { id: 2, name: 'Zielgruppe', icon: Users },
  { id: 3, name: 'Creative System', icon: ImageIcon },
  { id: 4, name: 'Marktanalyse', icon: BarChart3 },
  { id: 5, name: 'Generierung', icon: TrendingUp },
  { id: 6, name: 'Review & Export', icon: Rocket },
];

export function AdBuilderPage() {
  const [state, dispatch] = useReducer(adBuilderReducer, initialAdBuilderState);
  const { strategies, loading: strategiesLoading, error: strategiesError } = useStrategies();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);
  const [analysisRetrying, setAnalysisRetrying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [generatedCopy, setGeneratedCopy] = useState<{headline: string, description: string, cta: string}[]>([]);
  const [selectedCopy, setSelectedCopy] = useState<number | null>(null);
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<string | null>(null);
  const [selectedCTA, setSelectedCTA] = useState<string | null>(null);
  const [selectedResearchIds, setSelectedResearchIds] = useState<string[]>([]);
  const [researchRefreshKey, setResearchRefreshKey] = useState(0);

  const selectedStrategy = useMemo(
    () => strategies.find((strategy) => strategy.id === state.formData.strategyId) ?? null,
    [strategies, state.formData.strategyId]
  );

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.formData || parsed?.currentStep) {
        dispatch({
          type: 'LOAD_DRAFT',
          payload: {
            currentStep: parsed.currentStep,
            formData: parsed.formData
          }
        });
        setGeneratedCopy(parsed.generatedCopy || []);
        setSelectedCopy(parsed.selectedCopy ?? null);
        setSelectedVisualStyle(parsed.selectedVisualStyle ?? null);
        setSelectedCTA(parsed.selectedCTA ?? null);
        setSelectedResearchIds(parsed.selectedResearchIds || []);
        setDraftTimestamp(parsed.updatedAt || null);
        setDraftId(parsed.draftId || null);
        setDraftRestored(true);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;

      const { data: rows, error } = await supabase
        .from('generated_creatives')
        .select('id,inputs,created_at')
        .eq('saved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (cancelled || error || !rows?.length) return;

      const draftRow = rows.find((row) => {
        const inputs = row.inputs || {};
        return inputs?.createdFrom === 'ad_builder' && inputs?.lifecycle?.status === 'draft';
      });

      if (!draftRow) return;

      const localTs = draftTimestamp ? Date.parse(draftTimestamp) : 0;
      const dbTs = draftRow.created_at ? Date.parse(String(draftRow.created_at)) : 0;
      if (localTs && dbTs && dbTs <= localTs) return;

      const inputs = draftRow.inputs || {};

      dispatch({
        type: 'LOAD_DRAFT',
        payload: {
          currentStep: inputs.currentStep ?? 1,
          formData: inputs.formData ?? {}
        }
      });
      setGeneratedCopy(inputs.generatedCopy || []);
      setSelectedCopy(inputs.selectedCopy ?? null);
      setSelectedVisualStyle(inputs.selectedVisualStyle ?? null);
      setSelectedCTA(inputs.selectedCTA ?? null);
      setSelectedResearchIds(inputs.researchIds || []);
      setDraftTimestamp(draftRow.created_at || null);
      setDraftId(draftRow.id || null);
      setDraftRestored(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [draftTimestamp]);

  useEffect(() => {
    const hasFormData = Object.values(state.formData).some(
      (value) => value && value !== 'conversions'
    );
    const hasSelections =
      generatedCopy.length > 0 || selectedCopy !== null || selectedCTA || selectedVisualStyle;

    if (!hasFormData && !hasSelections && state.currentStep === 1) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const draft = {
      draftId,
      currentStep: state.currentStep,
      formData: state.formData,
      generatedCopy,
      selectedCopy,
      selectedVisualStyle,
      selectedCTA,
      selectedResearchIds,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [
    generatedCopy,
    selectedCopy,
    selectedCTA,
    selectedVisualStyle,
    selectedResearchIds,
    draftId,
    state.currentStep,
    state.formData
  ]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    dispatch({ type: 'RESET' });
    setGeneratedCopy([]);
    setSelectedCopy(null);
    setSelectedVisualStyle(null);
    setSelectedCTA(null);
    setImageFile(null);
    setDraftId(null);
    setDraftRestored(false);
    setDraftTimestamp(null);
  };

  const resetAll = () => {
    clearDraft();
    setAnalysisError(null);
    setAnalysisWarning(null);
    setCopyError(null);
  };

  const [savedFlag, setSavedFlag] = useState(false);

  const draftLabel = useMemo(() => {
    if (!draftTimestamp) return 'Draft restored';
    try {
      return `Draft restored (${new Date(draftTimestamp).toLocaleString('de-DE')})`;
    } catch {
      return 'Draft restored';
    }
  }, [draftTimestamp]);

  const updateFormData = (field: keyof AdBuilderData, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const goalFromObjective = (objective: string) => {
    switch (objective) {
      case 'leads':
        return 'leads';
      case 'traffic':
        return 'traffic';
      case 'app_installs':
        return 'app_installs';
      default:
        return 'sales';
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const buildAdLibraryUrl = () => {
    const query = [state.formData.productName, state.formData.brandName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' ');
    if (!query) return null;
    const encoded = encodeURIComponent(query);
    return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=DE&q=${encoded}&search_type=keyword_unordered`;
  };

  // use centralized ad builder hook for analyze/generate/poll
  const {
    status: adStatus,
    analyze: hookAnalyze,
    generate: hookGenerate,
    result: hookResult,
    quality: hookQuality,
    progress: hookProgress,
    jobId: hookJobId,
    imageMeta: hookImageMeta,
    error: hookError,
  } = useAdBuilder();

  useEffect(() => {
    if (hookJobId) setDraftId(hookJobId);
  }, [hookJobId]);

  const isGeneratingCopy = adStatus === 'generating' || adStatus === 'polling';

  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    { retries = 2, baseDelayMs = 400 } = {}
  ): Promise<T> => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        if (attempt >= retries) throw err;
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
    throw new Error('Retry failed');
  };

  const extractCreativeOutput = (value: unknown): CreativeOutput | null => {
    if (!value || typeof value !== 'object') return null;
    const typed = value as { output?: CreativeOutput | null; outputs?: CreativeOutput | null };
    return typed.output ?? typed.outputs ?? null;
  };

  const buildFallbackBrief = () => {
    const audienceSummary = state.formData.targetAudience || 'Audience';
    return {
      brand: { name: state.formData.brandName || state.formData.productName || 'AdRuby' },
      product: { name: state.formData.productName || 'Product', url: null, category: null },
      goal: 'sales',
      funnel_stage: 'cold',
      language: 'de',
      format: '4:5',
      audience: {
        summary: audienceSummary,
        segments: [audienceSummary].filter(Boolean),
      },
      offer: { summary: state.formData.uniqueSellingPoint || null, constraints: [] },
      tone: 'direct',
      angles: [],
      risk_flags: [],
    };
  };

  const normalizeOutputToV1 = (output: CreativeOutput | null): CreativeOutputV1 | null => {
    if (!output || typeof output !== 'object') return null;
    if ('version' in output && output.version === '1.0') {
      return output as CreativeOutputV1;
    }
    if ('schema_version' in output && output.schema_version === '2.1-pro') {
      const pro = output as CreativeOutputPro;
      const baseBrief = pro.brief || buildFallbackBrief();
      const creatives = (pro.variants || []).map((variant, idx) => ({
        id: variant.id || `c${idx + 1}`,
        angle_id: variant.id || `angle${idx + 1}`,
        format: variant.format || baseBrief.format,
        copy: {
          hook: variant.copy.hook || 'Hook',
          primary_text: variant.copy.primary_text || 'Primary text',
          cta: variant.copy.cta || 'Mehr erfahren',
          bullets: variant.copy.bullets || [],
        },
        score: {
          value: variant.quality?.total ?? 0,
          rationale:
            (variant.quality?.issues && variant.quality.issues[0]) ||
            'Auto-scored variant',
        },
        image: {
          input_image_used: Boolean(variant.visual?.image?.input_image_used),
          render_intent: variant.visual?.image?.render_intent || 'Hero image',
          hero_image_url: variant.visual?.image?.hero_image_url || undefined,
          final_image_url: variant.visual?.image?.final_image_url || undefined,
          width: variant.visual?.image?.width || undefined,
          height: variant.visual?.image?.height || undefined,
          model: variant.visual?.image?.model || undefined,
          seed: variant.visual?.image?.seed || undefined,
          prompt_hash: variant.visual?.image?.prompt_hash || undefined,
          render_version: variant.visual?.image?.render_version || undefined,
        },
      }));
      const angles =
        baseBrief.angles?.length
          ? baseBrief.angles
          : creatives.map((c) => ({
              id: c.angle_id,
              label: c.copy.hook,
              why_it_fits: 'Generated variant',
            }));
      return {
        version: '1.0',
        brief: { ...baseBrief, angles },
        creatives,
      } as CreativeOutputV1;
    }
    if ('schema_version' in output && output.schema_version === '2.0') {
      const baseBrief = buildFallbackBrief();
      const variants = (output as { variants?: any[] })?.variants || [];
      const creatives = variants.map((variant, idx) => ({
        id: variant.id || `c${idx + 1}`,
        angle_id: variant.id || `angle${idx + 1}`,
        format: variant.format || baseBrief.format,
        copy: {
          hook: variant.hook || variant?.script?.hook || 'Hook',
          primary_text:
            variant?.script?.offer ||
            variant?.script?.proof ||
            variant?.script?.problem ||
            'Primary text',
          cta: variant.cta || variant?.script?.cta || 'Mehr erfahren',
          bullets: [],
        },
        score: { value: 80, rationale: 'Auto-scored variant' },
        image: {
          input_image_used: Boolean(variant?.image?.input_image_used),
          render_intent: variant?.image?.render_intent || 'Hero image',
          hero_image_url: variant?.image?.hero_image_url || undefined,
          final_image_url: variant?.image?.final_image_url || undefined,
          width: variant?.image?.width || undefined,
          height: variant?.image?.height || undefined,
          model: variant?.image?.model || undefined,
          seed: variant?.image?.seed || undefined,
          prompt_hash: variant?.image?.prompt_hash || undefined,
          render_version: variant?.image?.render_version || undefined,
        },
      }));
      return {
        version: '1.0',
        brief: { ...baseBrief, angles: baseBrief.angles },
        creatives,
      } as CreativeOutputV1;
    }
    return null;
  };

  const buildDraftInputs = () => {
    const selectedCopyData =
      selectedCopy !== null ? generatedCopy[selectedCopy] : generatedCopy[0] || null;
    const imagePath =
      hookImageMeta && typeof hookImageMeta === 'object' && 'path' in hookImageMeta
        ? String(hookImageMeta.path || '')
        : null;
    return {
      productName: state.formData.productName,
      targetAudience: state.formData.targetAudience,
      objective: state.formData.objective,
      budget: state.formData.budget,
      headline: selectedCopyData?.headline || null,
      description: selectedCopyData?.description || null,
      cta: selectedCopyData?.cta || null,
      strategyId: state.formData.strategyId || null,
      researchIds: selectedResearchIds,
      formData: state.formData,
      currentStep: state.currentStep,
      generatedCopy,
      selectedCopy,
      selectedVisualStyle,
      selectedCTA,
      lifecycle: { status: 'draft' },
      createdFrom: 'ad_builder',
      imagePath: imagePath || null,
    };
  };

  const saveDraft = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        throw new Error('Bitte zuerst anmelden.');
      }

      const draftInputs = buildDraftInputs();

      const targetId = hookJobId || draftId;

      if (targetId) {
        const { data: existing, error: readError } = await supabase
          .from('generated_creatives')
          .select('inputs')
          .eq('id', targetId)
          .maybeSingle();

        if (readError) throw readError;

        const mergedInputs = {
          ...(existing?.inputs && typeof existing.inputs === 'object' ? existing.inputs : {}),
          ...draftInputs,
        };

        const { error: updateError } = await supabase
          .from('generated_creatives')
          .update({
            inputs: mergedInputs,
            saved: false,
            status: 'draft',
          })
          .eq('id', targetId);
        if (updateError) throw updateError;
        setDraftId(targetId);
      } else {
        const { data: created, error: insertError } = await supabase
          .from('generated_creatives')
          .insert({
            user_id: userId,
            inputs: draftInputs,
            outputs: null,
            saved: false,
            status: 'draft',
            progress: 0,
          })
          .select('id')
          .single();
        if (insertError) throw insertError;
        if (created?.id) {
          setDraftId(created.id);
        }
      }

      toast.success('Draft gespeichert');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Draft speichern fehlgeschlagen';
      toast.error(message);
    }
  };

  const runMarketAnalysis = async () => {
    setAnalysisError(null);
    setAnalysisProgress(0);

    const interval = window.setInterval(() => {
      setAnalysisProgress((prev) => Math.min(prev + 7, 90));
    }, 500);

    try {
      const searchUrl = buildAdLibraryUrl();
      if (!searchUrl) {
        throw new Error('Bitte Produktname oder Brand angeben.');
      }

      await retryWithBackoff(async () => {
        const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
        const apiUrl = apiBase ? `${apiBase}/api/ad-research-start` : '/api/ad-research-start';
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ searchUrl, maxAds: 20 })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || 'Market analysis failed');
        }
        return json;
      });

      setAnalysisProgress(100);
      await sleep(400);
      setResearchRefreshKey((prev) => prev + 1);
    } finally {
      window.clearInterval(interval);
    }
  };

  const handleNext = async () => {
    if (state.currentStep === 3) {
      dispatch({ type: 'SET_STEP', step: 4 });
      setIsAnalyzing(true);
      try {
        await runMarketAnalysis();
        dispatch({ type: 'SET_STEP', step: 5 });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analyse fehlgeschlagen. Bitte erneut versuchen.';
        setAnalysisError(message);
        dispatch({ type: 'SET_STEP', step: 3 });
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    if (state.currentStep < steps.length) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1 && !isAnalyzing) {
      dispatch({ type: 'PREV_STEP' });
    }
  };

  const getNextButtonLabel = () => {
    switch (state.currentStep) {
      case 1:
        return 'Weiter zur Zielgruppe';
      case 2:
        return 'Weiter zum Creative System';
      case 3:
        return 'Marktanalyse starten';
      case 5:
        return 'Review & Export';
      case 6:
        return 'Complete';
      default:
        return 'Continue';
    }
  };

  const canGenerateCopy =
    Boolean(state.formData.productName) &&
    Boolean(state.formData.targetAudience) &&
    Boolean(state.formData.uniqueSellingPoint);

  const buildAnalyzeFormData = () => {
    const fd = new FormData();
    fd.append(
      'brandName',
      state.formData.brandName || state.formData.productName || 'AdRuby'
    );
    fd.append('productName', state.formData.productName);
    fd.append('audience', state.formData.targetAudience);
    fd.append(
      'offer',
      state.formData.uniqueSellingPoint || state.formData.productDescription || ''
    );
    fd.append('tone', 'direct');
    fd.append('goal', goalFromObjective(state.formData.objective));
    fd.append('funnel', 'cold');
    fd.append('language', 'de');
    fd.append('format', '4:5');
    fd.append('inspiration', state.formData.productDescription || '');
    if (state.formData.strategyId) {
      fd.append('strategyId', state.formData.strategyId);
    }
    if (imageFile) {
      fd.append('image', imageFile);
    }
    return fd;
  };

  const retryAnalyze = async () => {
    if (!canGenerateCopy || isGeneratingCopy || analysisRetrying) return;
    setAnalysisWarning(null);
    setAnalysisRetrying(true);
    try {
      const analyzeRes = await hookAnalyze(buildAnalyzeFormData());
      setAnalysisWarning(analyzeRes?.warning ?? null);
      toast.success('Analyse aktualisiert');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analyse fehlgeschlagen.';
      toast.error(message);
    } finally {
      setAnalysisRetrying(false);
    }
  };

  const generateCopy = async () => {
    if (!canGenerateCopy || isGeneratingCopy) return;
    setCopyError(null);
    try {
      const fd = buildAnalyzeFormData();

      // use hook analyze + generate — hook will poll if backend returns jobId
      const analyzeRes = await hookAnalyze(fd);
      setAnalysisWarning(analyzeRes?.warning ?? null);
      const generateRes = await hookGenerate({
        brief: analyzeRes.brief,
        hasImage: Boolean(imageFile || hookImageMeta?.path),
        imagePath:
          hookImageMeta && typeof hookImageMeta === 'object' && 'path' in hookImageMeta
            ? String(hookImageMeta.path || '')
            : null,
        strategyId: state.formData.strategyId || undefined,
        researchIds: selectedResearchIds.length ? selectedResearchIds : undefined,
        outputMode: 'pro',
        style_mode: 'default',
        platforms: ['meta'],
        formats: ['4:5'],
      });

      const source = normalizeOutputToV1(extractCreativeOutput(generateRes) ?? hookResult ?? null);
      const creatives = Array.isArray(source?.creatives) ? source.creatives : [];
      const copies = creatives.map((creative) => ({
        headline: creative.copy.hook || '',
        description: creative.copy.primary_text || '',
        cta: creative.copy.cta || 'Mehr erfahren',
      }));
      setGeneratedCopy(copies);
      setSelectedCopy(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : hookError || 'Generate failed.';
      setCopyError(message);
    } finally {
      // noop — hook status reflects generation state
    }
  };

  const progressPercentage = (state.currentStep / steps.length) * 100;
  const displayOutput = useMemo(
    () => normalizeOutputToV1(hookResult),
    [hookResult, state.formData],
  );
  const displayQuality = useMemo(() => {
    if (!hookQuality) return null;
    if (typeof hookQuality === 'number') return { satisfaction: hookQuality };
    return hookQuality;
  }, [hookQuality]);

  return (
    <PageShell>
      <HeroHeader
        title="Creative Generator Pro"
        subtitle="Generate premium ads with AI copy + hero images + production-ready templates"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-muted/50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Ads Created</div>
          <div className="text-2xl font-bold text-foreground">24</div>
        </div>
        <div className="p-5 rounded-lg bg-muted/50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Avg. ROAS</div>
          <div className="text-2xl font-bold text-foreground">4.8x</div>
        </div>
        <div className="p-5 rounded-lg bg-muted/50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Avg. CTR</div>
          <div className="text-2xl font-bold text-foreground">3.2%</div>
        </div>
        <div className="p-5 rounded-lg bg-muted/50 border border-border">
          <div className="text-sm text-muted-foreground mb-1">Active Ads</div>
          <div className="text-2xl font-bold text-foreground">12</div>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${
                    state.currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : state.currentStep === step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-transparent border-border text-muted-foreground'
                  }`}
                >
                  {state.currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm text-center ${
                    state.currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded ${
                    state.currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </Card>

      {/* Market Analysis Loader */}
      {isAnalyzing && <MarketAnalysisLoader progress={analysisProgress} />}

      {draftRestored && (
        <Card className="p-4 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-foreground">{draftLabel}</div>
            <div className="text-sm text-muted-foreground">
              You can continue where you left off or reset the draft.
            </div>
          </div>
          <Button variant="outline" onClick={clearDraft}>
            Reset draft
          </Button>
        </Card>
      )}

      {analysisError && (
        <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-xl text-sm text-red-600">
          {analysisError}
        </div>
      )}

      {analysisWarning && (
        <div className="p-4 border border-amber-400/30 bg-amber-50 text-amber-800 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-semibold">Analyse mit Fallback erstellt</div>
            <div className="text-xs text-amber-700/80">{analysisWarning}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={retryAnalyze}
              disabled={analysisRetrying || isGeneratingCopy}
            >
              Analyse erneut
            </Button>
            <Button
              size="sm"
              onClick={generateCopy}
              disabled={isGeneratingCopy}
            >
              Erneut generieren
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isAnalyzing && (
        // FIX 1: Outer Grid - Responsive + Overflow Protection
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
          {/* FIX 2: Left Column - Mobile full width + min-w-0 */}
          <div className="lg:col-span-2 min-w-0">
            <Card className="bg-card border-border p-4 sm:p-6 min-w-0">
              {/* Step 1: Product & Messaging */}
              {state.currentStep === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-foreground truncate">Produkt-Input für Conversion-Ad</h2>
                      <p className="text-muted-foreground text-sm break-words">Geben Sie Ihre Produktdaten ein für die KI-Analyse</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-foreground mb-2">Brand/Unternehmen</Label>
                      <Input
                        value={state.formData.brandName}
                        onChange={(e) => updateFormData('brandName', e.target.value)}
                        placeholder="z.B: BlackRuby Performance"
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-foreground mb-2">Produktname *</Label>
                      <Input
                        value={state.formData.productName}
                        onChange={(e) => updateFormData('productName', e.target.value)}
                        placeholder="z.B: FitMax Pro Supplement"
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-foreground mb-2">Produktbeschreibung *</Label>
                      <Textarea
                        value={state.formData.productDescription}
                        onChange={(e) => updateFormData('productDescription', e.target.value)}
                        placeholder="Detaillierte Beschreibung Ihres Produkts..."
                        rows={4}
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    {/* FIX 5A: Responsive 2-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground mb-2">Branche</Label>
                        <Input
                          placeholder="E-Commerce"
                          className="bg-input border-border text-foreground w-full max-w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground mb-2">Preis</Label>
                        <Input
                          placeholder="€49.99"
                          className="bg-input border-border text-foreground w-full max-w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground mb-2">Hauptnutzen *</Label>
                      <Textarea
                        value={state.formData.uniqueSellingPoint}
                        onChange={(e) => updateFormData('uniqueSellingPoint', e.target.value)}
                        placeholder="Die wichtigsten Vorteile Ihres Produkts..."
                        rows={3}
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Label className="text-foreground">Strategy Blueprint</Label>
                        {strategiesLoading && (
                          <span className="text-xs text-muted-foreground">Lade Strategien…</span>
                        )}
                      </div>

                      {strategiesError && (
                        <div className="text-xs text-red-600 mb-2">{strategiesError}</div>
                      )}

                      {strategies.length === 0 && !strategiesLoading ? (
                        <div className="text-sm text-muted-foreground bg-muted rounded-lg p-4 border border-border">
                          Noch keine Strategies verfügbar. Importiere Blueprints, um sie hier zu sehen.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {strategies.map((strategy) => (
                            <button
                              type="button"
                              key={strategy.id}
                              onClick={() => updateFormData('strategyId', strategy.id)}
                              className={`text-left border-2 rounded-lg p-4 transition-all w-full min-w-0 ${
                                state.formData.strategyId === strategy.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border bg-card hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 min-w-0">
                                <div className="min-w-0">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {strategy.category || 'general'}
                                  </div>
                                  <div className="font-medium text-foreground truncate">
                                    {strategy.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-2 line-clamp-3">
                                    {strategy.raw_content_markdown.slice(0, 160)}
                                  </div>
                                </div>
                                {state.formData.strategyId === strategy.id && (
                                  <Check className="w-5 h-5 text-primary shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedStrategy && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Ausgewählt: <span className="font-medium">{selectedStrategy.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Target Audience */}
              {state.currentStep === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-foreground truncate">Zielgruppen-Targeting</h2>
                      <p className="text-muted-foreground text-sm break-words">KI-gestützte Audience-Definition</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-foreground mb-2">Zielgruppe *</Label>
                      <Input
                        value={state.formData.targetAudience}
                        onChange={(e) => updateFormData('targetAudience', e.target.value)}
                        placeholder="z.B: Fitness-Enthusiasten, 25-45 Jahre"
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    {/* FIX 5A: Responsive 2-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground mb-2">Altersbereich</Label>
                        <Input
                          value={state.formData.ageRange}
                          onChange={(e) => updateFormData('ageRange', e.target.value)}
                          placeholder="25-45"
                          className="bg-input border-border text-foreground w-full max-w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground mb-2">Geschlecht</Label>
                        <Input
                          placeholder="Alle / Männlich / Weiblich"
                          className="bg-input border-border text-foreground w-full max-w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground mb-2">Interessen & Hobbies</Label>
                      <Input
                        value={state.formData.interests}
                        onChange={(e) => updateFormData('interests', e.target.value)}
                        placeholder="Fitness, Gesundheit, Ernährung, Sport"
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-foreground mb-2">Pain Points</Label>
                      <Textarea
                        value={state.formData.painPoints}
                        onChange={(e) => updateFormData('painPoints', e.target.value)}
                        placeholder="Welche Probleme löst Ihr Produkt?"
                        rows={3}
                        className="bg-input border-border text-foreground w-full max-w-full"
                      />
                    </div>

                    <div className="bg-muted rounded-lg p-4 border border-border w-full max-w-full overflow-hidden">
                      <div className="flex items-start gap-3 min-w-0">
                        <Brain className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-foreground mb-1">KI-Empfehlung</h3>
                          <p className="text-sm text-muted-foreground break-words">
                            Basierend auf Ihren Eingaben empfehlen wir zusätzliche Targeting-Optionen:
                            "Personen die kürzlich Fitness-Apps installiert haben" und "Online-Käufer im
                            Health-Segment"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Ad Creative */}
              {state.currentStep === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-foreground truncate">Ad Creative Generierung</h2>
                      <p className="text-muted-foreground text-sm break-words">KI-generierte Copy & Visuals</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-foreground mb-3">Produktbild (optional)</Label>
                      <ImageDropzone value={imageFile} onChange={setImageFile} />
                      {hookImageMeta?.path && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Uploaded to storage: <span className="font-medium">{hookImageMeta.path}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <Label className="text-foreground">Ad Copy Varianten</Label>
                        <Button
                          onClick={generateCopy}
                          size="sm"
                          disabled={!canGenerateCopy || isGeneratingCopy}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                        >
                          <Zap className={`w-4 h-4 mr-2 ${isGeneratingCopy ? 'animate-pulse' : ''}`} />
                          {isGeneratingCopy ? 'Generiere…' : 'KI generieren'}
                        </Button>
                      </div>

                      {copyError && (
                        <div className="text-sm text-red-600 mb-2">{copyError}</div>
                      )}

                      {generatedCopy.length > 0 ? (
                        <div className="space-y-3">
                          {generatedCopy.map((copy, index) => (
                            <div
                              key={index}
                              onClick={() => setSelectedCopy(index)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all min-w-0 ${
                                selectedCopy === index
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border bg-card hover:border-muted-foreground'
                              }`}
                            >
                              {/* FIX 7: Anti-Overflow in Copy Cards */}
                              <div className="flex items-start justify-between min-w-0 gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground mb-1">Variante {index + 1}</div>
                                  <p className="text-foreground break-words">{copy.headline}</p>
                                  <p className="text-foreground text-sm break-words">{copy.description}</p>
                                </div>
                                {selectedCopy === index && (
                                  <Check className="w-5 h-5 text-primary shrink-0 ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-muted rounded-lg p-8 text-center border border-border">
                          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground break-words">
                            Klicken Sie auf "KI generieren" um automatische Ad Copy zu erstellen
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-foreground mb-3">Visual Style</Label>
                      {/* FIX 5B: Responsive 3-column grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { name: 'Modern & Clean', gradient: 'from-blue-500 to-cyan-400' },
                          { name: 'Bold & Vibrant', gradient: 'from-primary to-orange-500' },
                          { name: 'Minimalistisch', gradient: 'from-gray-800 to-gray-600' }
                        ].map((style) => (
                          <div
                            key={style.name}
                            onClick={() => setSelectedVisualStyle(style.name)}
                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all w-full min-w-0 ${
                              selectedVisualStyle === style.name
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:border-muted-foreground'
                            }`}
                          >
                            <div className={`w-full h-20 bg-gradient-to-br ${style.gradient} rounded mb-2 relative`}>
                              {selectedVisualStyle === style.name && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-foreground font-medium truncate">{style.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground mb-3">Call-to-Action</Label>
                      {/* FIX 5A: Responsive 2-column grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Jetzt kaufen', 'Mehr erfahren', 'Kostenlos testen', 'Angebot sichern'].map(
                          (cta) => (
                            <div
                              key={cta}
                              onClick={() => setSelectedCTA(cta)}
                              className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all w-full min-w-0 ${
                                selectedCTA === cta
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border bg-card hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <p className="text-foreground font-medium truncate">{cta}</p>
                                {selectedCTA === cta && <Check className="w-5 h-5 text-primary shrink-0" />}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Performance Prediction */}
              {state.currentStep === 5 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-foreground truncate">Performance Prediction</h2>
                      <p className="text-muted-foreground text-sm break-words">KI-basierte Erfolgs-Prognose</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* FIX 5C: Responsive 3-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="bg-primary border-0 p-4 w-full min-w-0">
                        <div className="text-primary-foreground/80 text-sm mb-1">Erwartete CTR</div>
                        <div className="text-3xl text-primary-foreground font-bold tabular-nums">2.8%</div>
                        <div className="text-primary-foreground/80 text-xs mt-2">+38% vs. Branche</div>
                      </Card>
                      <Card className="bg-foreground border-0 p-4 w-full min-w-0">
                        <div className="text-background/80 text-sm mb-1">Erwartete CVR</div>
                        <div className="text-3xl text-background font-bold tabular-nums">4.2%</div>
                        <div className="text-background/80 text-xs mt-2">Hochwertige Leads</div>
                      </Card>
                      <Card className="bg-muted border-border p-4 w-full min-w-0">
                        <div className="text-muted-foreground text-sm mb-1">Prognostizierter ROAS</div>
                        <div className="text-3xl text-foreground font-bold tabular-nums">5.2x</div>
                        <div className="text-muted-foreground text-xs mt-2">Excellent ROI</div>
                      </Card>
                    </div>

                    <Card className="bg-muted border-border p-5 w-full max-w-full overflow-hidden">
                      <h3 className="text-foreground mb-4">Audience Insights</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1 min-w-0 gap-2">
                            <span className="text-muted-foreground truncate">Potentielle Reichweite</span>
                            <span className="text-foreground tabular-nums shrink-0">2.4M - 3.2M</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1 min-w-0 gap-2">
                            <span className="text-muted-foreground truncate">Kaufbereitschaft</span>
                            <span className="text-primary tabular-nums shrink-0">Hoch (82%)</span>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1 min-w-0 gap-2">
                            <span className="text-muted-foreground truncate">Wettbewerbsintensität</span>
                            <span className="text-foreground tabular-nums shrink-0">Mittel (65%)</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      </div>
                    </Card>

                    {/* FIX 5D: 7-column grid with horizontal scroll */}
                    <Card className="bg-muted border-border p-5 w-full max-w-full overflow-hidden">
                      <h3 className="text-foreground mb-4">Beste Performance-Zeiträume</h3>
                      <div className="w-full max-w-full overflow-x-auto">
                        <div className="grid grid-cols-7 gap-2 min-w-[420px]">
                          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => (
                            <div key={day} className="text-center">
                              <div className="text-xs text-muted-foreground mb-2">{day}</div>
                              <div
                                className={`h-16 rounded ${
                                  index >= 4
                                    ? 'bg-primary'
                                    : index >= 2
                                    ? 'bg-foreground'
                                    : 'bg-border'
                                }`}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 break-words">
                        Beste Performance: Freitag-Sonntag, 18:00-22:00 Uhr
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Launch */}
              {state.currentStep === 6 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Rocket className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-foreground truncate">Review & Launch</h2>
                      <p className="text-muted-foreground text-sm break-words">Finale Übersicht & Kampagnenstart</p>
                    </div>
                  </div>

                  {displayOutput && (
                    <div className="mb-6">
                      <CreativeResults
                        output={displayOutput}
                        quality={displayQuality}
                        onReset={resetAll}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <Card className="bg-muted border-border p-5 w-full max-w-full overflow-hidden">
                      <h3 className="text-foreground mb-3">Kampagnen-Zusammenfassung</h3>
                      {/* FIX 5A: Responsive 2-column grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Produkt</div>
                          <div className="text-foreground truncate">{state.formData.productName || 'Nicht angegeben'}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Zielgruppe</div>
                          <div className="text-foreground truncate">
                            {state.formData.targetAudience || 'Nicht angegeben'}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Budget</div>
                          <div className="text-foreground truncate">€{state.formData.budget || '0'} / Tag</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Laufzeit</div>
                          <div className="text-foreground truncate">{state.formData.duration || '0'} Tage</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-primary/10 border-primary p-5 w-full max-w-full overflow-hidden">
                      <div className="flex items-center gap-3 mb-3 min-w-0">
                        <Check className="w-6 h-6 text-primary shrink-0" />
                        <h3 className="text-foreground truncate">Kampagne bereit zum Start!</h3>
                      </div>
                      <p className="text-foreground/80 text-sm break-words">
                        Alle Einstellungen wurden überprüft. Ihre Kampagne kann jetzt gestartet werden.
                      </p>
                    </Card>

                      {/* Generation status & quality info */}
                      {isGeneratingCopy && (
                        <Card className="mt-3 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Generating creative…</div>
                            <div className="text-xs text-muted-foreground">Status: {adStatus}</div>
                          </div>
                          <Progress value={hookProgress ?? 0} className="h-2" />
                        </Card>
                      )}

                      {hookQuality && (
                        <Card className="mt-3 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-muted-foreground">Quality score</div>
                              <div className="text-lg font-semibold">
                                {typeof hookQuality === 'object'
                                  ? (hookQuality.satisfaction ?? hookQuality.score ?? 'n/a')
                                  : typeof hookQuality === 'number'
                                  ? hookQuality
                                  : 'n/a'}%
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground max-w-xs text-right">
                              {typeof hookQuality === 'object'
                                ? hookQuality.comment || hookQuality.summary || 'Model evaluation of the creative relevance and clarity.'
                                : 'Model evaluation of the creative relevance and clarity.'}
                            </div>
                          </div>
                        </Card>
                      )}

                    <div className="bg-muted border border-border rounded-lg p-4 w-full max-w-full overflow-hidden">
                      <h4 className="text-foreground mb-3">Was passiert nach dem Launch?</h4>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        <li className="flex items-start gap-2 min-w-0">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="break-words">Kampagne wird bei Meta zur Freigabe eingereicht</span>
                        </li>
                        <li className="flex items-start gap-2 min-w-0">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="break-words">Automatisches A/B Testing startet</span>
                        </li>
                        <li className="flex items-start gap-2 min-w-0">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="break-words">Echtzeit-Performance-Tracking aktiviert</span>
                        </li>
                        <li className="flex items-start gap-2 min-w-0">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="break-words">KI-Optimierung läuft kontinuierlich im Hintergrund</span>
                        </li>
                      </ul>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                      <Rocket className="w-5 h-5 mr-2" />
                      Kampagne jetzt starten
                    </Button>

                    <Button
                      onClick={saveDraft}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted h-12"
                    >
                      Als Entwurf speichern
                    </Button>
                    
                    {/* Export & Save actions */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          try {
                            const selected = selectedCopy !== null ? generatedCopy[selectedCopy] : generatedCopy[0] || null;
                            const payload = {
                              meta: { productName: state.formData.productName, targetAudience: state.formData.targetAudience },
                              creative: selected || generatedCopy,
                            };
                            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${(state.formData.productName || 'creative').replace(/\s+/g, '_')}.json`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                            toast.success('Creative exported');
                          } catch (err: unknown) {
                            toast.error('Export failed');
                          }
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Export JSON
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            if (!hookResult) {
                              throw new Error('Bitte zuerst eine KI‑Generierung abschließen.');
                            }
                            const output = hookResult;
                            await creativeSaveToLibrary({ output, creativeId: hookJobId });
                            setSavedFlag(true);
                            toast.success('Saved to Library');
                          } catch (err: unknown) {
                            const message = err instanceof Error ? err.message : 'Save failed';
                            toast.error(message);
                          }
                        }}
                        className="w-full"
                        disabled={savedFlag || !hookResult}
                      >
                        {savedFlag ? 'Saved' : 'Save to Library'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* FIX 6: Navigation Buttons - Mobile Stack */}
              {state.currentStep !== 4 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-border">
                  <Button
                    onClick={handleBack}
                    disabled={state.currentStep === 1}
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={state.currentStep === steps.length}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                  >
                    {getNextButtonLabel()}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* FIX 3: Right Column - Mobile full width + min-w-0 */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6 min-w-0">
            <AdPreview
              copy={selectedCopy !== null ? generatedCopy[selectedCopy] : undefined}
              productName={state.formData.productName}
            />
            <ConversionScore score={94} />
          </div>

          {/* FIX 4: AI Copy Generator Sidebar - Mobile Collapsible */}
          <div className="lg:col-span-1 min-w-0">
            {/* Mobile: Collapsible Section */}
            <details className="lg:hidden rounded-xl border border-border bg-card">
              <summary className="px-4 py-3 cursor-pointer text-foreground font-medium flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Copy Generator öffnen
              </summary>
              <div className="p-4 border-t border-border">
                <AIAdCopyGenerator
                  productName={state.formData.productName}
                  productDescription={state.formData.productDescription}
                  targetAudience={state.formData.targetAudience}
                  uniqueSellingPoint={state.formData.uniqueSellingPoint}
                  strategyId={state.formData.strategyId || null}
                  onSelectCopy={(copy) => {
                    // Add selected AI copy to generatedCopy list
                    const newCopy = {
                      headline: copy.headline,
                      description: copy.description,
                      cta: copy.cta
                    };
                    setGeneratedCopy(prev => [...prev, newCopy]);
                    setSelectedCopy(generatedCopy.length); // Select the newly added copy
                  }}
                />
              </div>
            </details>

            {/* Desktop: Full Sidebar */}
            <div className="hidden lg:block h-auto lg:h-[800px]">
              <Card className="bg-card border-border h-full overflow-hidden min-w-0">
                <AIAdCopyGenerator
                  productName={state.formData.productName}
                  productDescription={state.formData.productDescription}
                  targetAudience={state.formData.targetAudience}
                  uniqueSellingPoint={state.formData.uniqueSellingPoint}
                  strategyId={state.formData.strategyId || null}
                  onSelectCopy={(copy) => {
                    // Add selected AI copy to generatedCopy list
                    const newCopy = {
                      headline: copy.headline,
                      description: copy.description,
                      cta: copy.cta
                    };
                    setGeneratedCopy(prev => [...prev, newCopy]);
                    setSelectedCopy(generatedCopy.length); // Select the newly added copy
                  }}
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    
      {/* Research panel - allow selecting research items to guide generation */}
      <div className="mt-4 lg:col-span-1">
        <Card className="p-4 border-border bg-card">
          <h4 className="font-semibold mb-3">Ad Research (select to include)</h4>
          <AdResearchList
            limit={8}
            selectedIds={selectedResearchIds}
            refreshKey={researchRefreshKey}
            onToggle={(id) => {
              setSelectedResearchIds((prev) => {
                if (prev.includes(id)) return prev.filter((p) => p !== id);
                return [...prev, id];
              });
            }}
          />

          <div className="mt-3 text-sm text-muted-foreground">
            Selected: <strong>{selectedResearchIds.length}</strong>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
