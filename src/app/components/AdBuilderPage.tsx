import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from 'react';
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
  Users,
  Check,
  Zap,
} from 'lucide-react';
import { PageShell, HeroHeader, Card } from './layout';
import {
  adBuilderReducer,
  initialAdBuilderState,
  type AdBuilderData
} from './ad-builder/adBuilderReducer';
import type { CreativeOutput, CreativeOutputV1, CreativeOutputPro } from '../lib/creative/types';
import useAdBuilder from '../hooks/useAdBuilder';
import { toast } from 'sonner';
import CreativeResults from './creative-builder/CreativeResults';
import ImageDropzone from './creative-builder/ImageDropzone';
import { supabase } from '../lib/supabaseClient';
import { StrategySelector } from './studio/StrategySelector';
import { StrategyWizard } from './studio/StrategyWizard';
import { useStrategies, type StrategyBlueprint } from '../hooks/useStrategies';

const DRAFT_KEY = 'ad_ruby_ad_builder_draft';
const DRAFT_SKIP_KEY = 'ad_ruby_skip_draft_restore';

const steps = [
  { id: 1, name: 'Strategy', icon: Zap },
  { id: 2, name: 'Produkt & Bild', icon: Sparkles },
  { id: 3, name: 'Zielgruppe & Angebot', icon: Users },
  { id: 4, name: 'Generieren', icon: ImageIcon },
  { id: 5, name: 'Ergebnisse', icon: Check },
];

type PendingDraft = {
  currentStep: number;
  formData: Partial<AdBuilderData>;
  generatedCopy: { headline: string; description: string; cta: string }[];
  selectedCopy: number | null;
  selectedVisualStyle: string | null;
  selectedCTA: string | null;
  draftId: string | null;
  updatedAt: string | null;
};

// ... (keep existing CreativeV2Variant type)


type CreativeV2Variant = {
  id?: string;
  format?: string;
  hook?: string;
  cta?: string;
  script?: {
    hook?: string;
    offer?: string;
    proof?: string;
    problem?: string;
    cta?: string;
  };
  image?: {
    input_image_used?: boolean;
    render_intent?: string;
    hero_image_url?: string;
    hero_image_bucket?: string;
    hero_image_path?: string;
    final_image_url?: string;
    final_image_bucket?: string;
    final_image_path?: string;
    width?: number;
    height?: number;
    model?: string;
    seed?: number;
    prompt_hash?: string;
    render_version?: string;
    error?: string;
  };
};

export function AdBuilderPage() {
  const [state, dispatch] = useReducer(adBuilderReducer, initialAdBuilderState);
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);
  const [analysisRetrying, setAnalysisRetrying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const runIdRef = useRef(0);
  const draftSaveTimeoutRef = useRef<number | null>(null);
  const lastDraftPayloadRef = useRef<string | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const progressRafRef = useRef<number | null>(null);
  const progressValueRef = useRef(0);

  const [generatedCopy, setGeneratedCopy] = useState<{ headline: string, description: string, cta: string }[]>([]);
  const [selectedCopy, setSelectedCopy] = useState<number | null>(null);
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<string | null>(null);
  // Strategy State
  const { strategies, loading: strategiesLoading, refreshStrategies } = useStrategies();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [showStrategyWizard, setShowStrategyWizard] = useState(false);

  const handleStrategySelect = (id: string, _strategy: StrategyBlueprint) => {
    setSelectedStrategyId(id);
    // You might want to update form data based on strategy here if needed
    // e.g. set industry or tone based on strategy
  };

  const handleCreateStrategy = async (data: { name: string; industry_type: string; target_roas: number; max_daily_budget: number; scale_speed: string; risk_tolerance: string }) => {
    try {
      // Save new strategy blueprint
      const { error } = await supabase.from('strategy_blueprints').insert({
        title: data.name,
        category: 'custom', // or drive from wizard
        industry_type: data.industry_type,
        autopilot_config: {
          enabled: true,
          target_roas: data.target_roas,
          max_daily_budget: data.max_daily_budget,
          scale_speed: data.scale_speed, // mapped from risk in wizard
          risk_tolerance: data.risk_tolerance,
          // Defaults for others
          pause_threshold_roas: 1.0,
          scale_threshold_roas: data.target_roas * 1.2,
          max_budget_increase_pct: 0.2,
          min_conversions_required: 10
        },
        raw_content_markdown: `Strategy: ${data.name}\nIndustry: ${data.industry_type}\nRisk: ${data.risk_tolerance}`, // Placeholder content
        metadata: {
          created_via: 'ad_builder_wizard'
        }
      });

      if (error) throw error;

      toast.success("Master Strategy Created!");
      refreshStrategies();
      setShowStrategyWizard(false);
    } catch (e: any) {
      toast.error("Failed to create strategy: " + e.message);
    }
  };

  const [selectedCTA, setSelectedCTA] = useState<string | null>(null);
  const maxStep = steps.length;
  const normalizeStep = useCallback((step: number | null | undefined) => {
    if (!step || Number.isNaN(step)) return 1;
    return Math.min(Math.max(step, 1), maxStep);
  }, [maxStep]);

  const maybeSetPendingDraft = useCallback((nextDraft: PendingDraft) => {
    const currentTs = pendingDraft?.updatedAt ? Date.parse(pendingDraft.updatedAt) : 0;
    const nextTs = nextDraft.updatedAt ? Date.parse(nextDraft.updatedAt) : 0;
    if (currentTs && nextTs && nextTs <= currentTs) return;
    setPendingDraft(nextDraft);
    setDraftTimestamp(nextDraft.updatedAt);
    setDraftAvailable(true);
  }, [pendingDraft]);

  const applyPendingDraft = (draft: PendingDraft) => {
    dispatch({
      type: 'LOAD_DRAFT',
      payload: {
        currentStep: normalizeStep(draft.currentStep),
        formData: draft.formData ?? {}
      }
    });
    setGeneratedCopy(draft.generatedCopy || []);
    setSelectedCopy(draft.selectedCopy ?? null);
    setSelectedVisualStyle(draft.selectedVisualStyle ?? null);
    setSelectedCTA(draft.selectedCTA ?? null);
    setDraftTimestamp(draft.updatedAt || null);
    setDraftId(draft.draftId || null);
    setDraftAvailable(false);
    setPendingDraft(null);
  };

  useEffect(() => {
    if (sessionStorage.getItem(DRAFT_SKIP_KEY) === '1') {
      sessionStorage.removeItem(DRAFT_SKIP_KEY);
      return;
    }
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.formData || parsed?.currentStep) {
        maybeSetPendingDraft({
          currentStep: normalizeStep(parsed.currentStep),
          formData: parsed.formData ?? {},
          generatedCopy: parsed.generatedCopy || [],
          selectedCopy: parsed.selectedCopy ?? null,
          selectedVisualStyle: parsed.selectedVisualStyle ?? null,
          selectedCTA: parsed.selectedCTA ?? null,
          draftId: parsed.draftId || null,
          updatedAt: parsed.updatedAt || null,
        });
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [maybeSetPendingDraft, normalizeStep]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      if (sessionStorage.getItem(DRAFT_SKIP_KEY) === '1') {
        sessionStorage.removeItem(DRAFT_SKIP_KEY);
        return;
      }

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

      maybeSetPendingDraft({
        currentStep: normalizeStep(inputs.currentStep ?? 1),
        formData: inputs.formData ?? {},
        generatedCopy: inputs.generatedCopy || [],
        selectedCopy: inputs.selectedCopy ?? null,
        selectedVisualStyle: inputs.selectedVisualStyle ?? null,
        selectedCTA: inputs.selectedCTA ?? null,
        draftId: draftRow.id || null,
        updatedAt: draftRow.created_at || null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [draftTimestamp, maybeSetPendingDraft, normalizeStep]);

  useEffect(() => {
    if (draftSaveTimeoutRef.current) {
      window.clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }
    const hasFormData = Object.values(state.formData).some(
      (value) => value && value !== 'conversions'
    );
    const hasSelections =
      generatedCopy.length > 0 || selectedCopy !== null || selectedCTA || selectedVisualStyle;

    if (!hasFormData && !hasSelections && state.currentStep === 1) {
      if (pendingDraft) return;
      lastDraftPayloadRef.current = null;
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
      updatedAt: new Date().toISOString()
    };
    const payload = JSON.stringify(draft);
    if (payload === lastDraftPayloadRef.current) return;
    // Debounce draft saves to keep typing smooth.
    draftSaveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, payload);
      lastDraftPayloadRef.current = payload;
      draftSaveTimeoutRef.current = null;
    }, 350);
    return () => {
      if (draftSaveTimeoutRef.current) {
        window.clearTimeout(draftSaveTimeoutRef.current);
        draftSaveTimeoutRef.current = null;
      }
    };
  }, [
    generatedCopy,
    selectedCopy,
    selectedCTA,
    selectedVisualStyle,
    pendingDraft,
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
    setDraftAvailable(false);
    setPendingDraft(null);
    setDraftTimestamp(null);
  };

  const resetAll = () => {
    clearDraft();
    setAnalysisWarning(null);
    setCopyError(null);
  };

  const startNewAd = () => {
    sessionStorage.setItem(DRAFT_SKIP_KEY, '1');
    resetAll();
    dispatch({ type: 'SET_STEP', step: 1 });
  };

  const continueDraft = () => {
    if (pendingDraft) {
      applyPendingDraft(pendingDraft);
    } else {
      setDraftAvailable(false);
    }
  };

  const draftLabel = useMemo(() => {
    if (!draftTimestamp) return 'Draft gefunden';
    try {
      return `Draft gefunden (${new Date(draftTimestamp).toLocaleString('de-DE')})`;
    } catch {
      return 'Draft gefunden';
    }
  }, [draftTimestamp]);

  const updateFormData = (field: keyof AdBuilderData, value: string) => {
    if (draftAvailable) {
      setDraftAvailable(false);
      setPendingDraft(null);
    }
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
    cancel: cancelGeneration,
  } = useAdBuilder();

  useEffect(() => {
    if (hookJobId) setDraftId(hookJobId);
  }, [hookJobId]);

  const isGeneratingCopy = adStatus === 'generating' || adStatus === 'polling';
  // If we are already on step 4 (Results), we don't block with overlay anymore.
  const isProcessing = (adStatus === 'analyzing' || isGeneratingCopy) && state.currentStep < 4;

  const overlayTitle = adStatus === 'analyzing' ? 'Analyse läuft…' : 'Generierung läuft…';
  const overlayDescription =
    adStatus === 'analyzing'
      ? 'Wir erstellen dein Briefing und bereiten die Generierung vor.'
      : 'Bitte warten – die KI erstellt gerade deine Varianten.';

  useEffect(() => {
    if (!isProcessing) {
      setDisplayProgress(0);
      progressValueRef.current = 0;
      if (progressRafRef.current) {
        cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
      return;
    }

    const fallbackTarget = adStatus === 'analyzing' ? 18 : adStatus === 'generating' ? 45 : 72;
    const target = typeof hookProgress === 'number' ? hookProgress : fallbackTarget;
    const clamped = Math.max(0, Math.min(100, target));
    const start = progressValueRef.current;
    const startTime = performance.now();
    const duration = Math.max(450, Math.min(1200, Math.abs(clamped - start) * 10));

    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = start + (clamped - start) * eased;
      progressValueRef.current = next;
      setDisplayProgress(next);
      if (t < 1) {
        progressRafRef.current = requestAnimationFrame(tick);
      }
    };

    progressRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressRafRef.current) {
        cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
    };
  }, [adStatus, hookProgress, isProcessing]);

  const handleOverlayKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const node = overlayRef.current;
    if (!node) return;
    const focusable = Array.from(
      node.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey) {
      if (active === first || !node.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const handleCancelGeneration = useCallback(() => {
    runIdRef.current += 1;
    cancelGeneration();
    setCopyError('Generierung abgebrochen.');
  }, [cancelGeneration]);

  useEffect(() => {
    if (!isProcessing) return undefined;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [isProcessing]);

  useEffect(() => {
    // Progressive Rendering:
    // If we have a result and (status is complete OR progress is far enough along that text is ready),
    // we move to step 4 to show the text results while images load.
    // Progress 65 is "text_ready" phase in backend.
    const isReady =
      hookResult &&
      (adStatus === 'complete' || (typeof hookProgress === 'number' && hookProgress >= 65));

    if (isReady && state.currentStep < 4) {
      dispatch({ type: 'SET_STEP', step: 4 });
    }
  }, [hookResult, adStatus, state.currentStep, hookProgress]);

  const extractCreativeOutput = (value: unknown): CreativeOutput | null => {
    if (!value || typeof value !== 'object') return null;
    const typed = value as { output?: CreativeOutput | null; outputs?: CreativeOutput | null };
    return typed.output ?? typed.outputs ?? null;
  };

  const buildFallbackBrief = useCallback(() => {
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
  }, [state.formData]);

  const normalizeOutputToV1 = useCallback((output: CreativeOutput | null): CreativeOutputV1 | null => {
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
          hero_image_bucket: variant.visual?.image?.hero_image_bucket || undefined,
          hero_image_path: variant.visual?.image?.hero_image_path || undefined,
          final_image_url: variant.visual?.image?.final_image_url || undefined,
          final_image_bucket: variant.visual?.image?.final_image_bucket || undefined,
          final_image_path: variant.visual?.image?.final_image_path || undefined,
          width: variant.visual?.image?.width || undefined,
          height: variant.visual?.image?.height || undefined,
          model: variant.visual?.image?.model || undefined,
          seed: variant.visual?.image?.seed || undefined,
          prompt_hash: variant.visual?.image?.prompt_hash || undefined,
          render_version: variant.visual?.image?.render_version || undefined,
          error: variant.visual?.image?.error || undefined,
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
      const variants = Array.isArray((output as { variants?: unknown[] })?.variants)
        ? (output as { variants?: unknown[] }).variants ?? []
        : [];
      const creatives = variants.map((variantRaw, idx) => {
        const variant =
          variantRaw && typeof variantRaw === 'object'
            ? (variantRaw as CreativeV2Variant)
            : ({} as CreativeV2Variant);
        return {
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
            hero_image_bucket: variant?.image?.hero_image_bucket || undefined,
            hero_image_path: variant?.image?.hero_image_path || undefined,
            final_image_url: variant?.image?.final_image_url || undefined,
            final_image_bucket: variant?.image?.final_image_bucket || undefined,
            final_image_path: variant?.image?.final_image_path || undefined,
            width: variant?.image?.width || undefined,
            height: variant?.image?.height || undefined,
            model: variant?.image?.model || undefined,
            seed: variant?.image?.seed || undefined,
            prompt_hash: variant?.image?.prompt_hash || undefined,
            render_version: variant?.image?.render_version || undefined,
            error: variant?.image?.error || undefined,
          },
        };
      });
      return {
        version: '1.0',
        brief: { ...baseBrief, angles: baseBrief.angles },
        creatives,
      } as CreativeOutputV1;
    }
    return null;
  }, [buildFallbackBrief]);

  const handleNext = async () => {
    if (state.currentStep < steps.length) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'PREV_STEP' });
    }
  };

  const getNextButtonLabel = () => {
    if (state.currentStep === 1) return 'Weiter zu Produkt';
    if (state.currentStep === 2) return 'Weiter zu Zielgruppe';
    if (state.currentStep === 3) return 'Weiter zur Generierung';
    if (state.currentStep === 4) return 'Weiter zu Ergebnissen';
    return 'Weiter';
  };

  const canGenerateCopy =
    Boolean(state.formData.productName) &&
    Boolean(state.formData.targetAudience) &&
    Boolean(state.formData.uniqueSellingPoint);

  const buildAnalyzeFormData = () => {
    const fd = new FormData();
    const inspirationParts = [
      state.formData.productDescription,
      state.formData.creativeNotes,
    ]
      .map((value) => value?.trim())
      .filter(Boolean);
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
    fd.append('inspiration', inspirationParts.join('\n\n'));
    // Strategy is auto-determined server-side; no manual strategyId here. -> UPDATED
    if (selectedStrategyId) {
      fd.append('strategyId', selectedStrategyId);
    }
    if (imageFile) {
      fd.append('image', imageFile);
    }
    return fd;
  };

  const retryAnalyze = async () => {
    if (!canGenerateCopy || isProcessing || analysisRetrying) return;
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
    if (!canGenerateCopy || isProcessing) return;
    const runId = (runIdRef.current += 1);
    setCopyError(null);
    try {
      const fd = buildAnalyzeFormData();

      // use hook analyze + generate — hook will poll if backend returns jobId
      const analyzeRes = await hookAnalyze(fd);
      if (runId !== runIdRef.current) return;
      setAnalysisWarning(analyzeRes?.warning ?? null);
      const analyzeImagePath =
        analyzeRes?.image && typeof analyzeRes.image === 'object' && 'path' in analyzeRes.image
          ? String(analyzeRes.image.path || '')
          : '';
      const resolvedImagePath = analyzeImagePath || hookImageMeta?.path || null;
      const generateRes = await hookGenerate({
        brief: analyzeRes.brief,
        hasImage: Boolean(imageFile || resolvedImagePath),
        imagePath:
          resolvedImagePath,
        outputMode: 'pro',
        style_mode: 'default',
        visual_style: selectedVisualStyle || undefined,
        cta_preference: selectedCTA || undefined,
        platforms: ['meta'],
        formats: ['4:5'],
      });
      if (runId !== runIdRef.current) return;

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
      if (runId !== runIdRef.current) return;
      const message = err instanceof Error ? err.message : hookError || 'Generate failed.';
      setCopyError(message);
    } finally {
      // noop — hook status reflects generation state
    }
  };

  const progressPercentage = (state.currentStep / steps.length) * 100;
  const displayOutput = useMemo(() => normalizeOutputToV1(hookResult), [hookResult, normalizeOutputToV1]);
  const displayQuality = useMemo(() => {
    if (!hookQuality) return null;
    if (typeof hookQuality === 'number') return { satisfaction: hookQuality };
    if (typeof hookQuality === 'object') {
      const typed = hookQuality as Record<string, unknown>;
      const satisfaction =
        typeof typed.satisfaction === 'number'
          ? typed.satisfaction
          : typeof typed.score === 'number'
            ? typed.score
            : undefined;
      const target = typeof typed.target === 'number' ? typed.target : undefined;
      const issues = Array.isArray(typed.issues) ? typed.issues : undefined;
      return { satisfaction, target, issues };
    }
    return null;
  }, [hookQuality]);

  return (
    <PageShell>
      <HeroHeader
        title="Creative Generator Pro"
        subtitle="Generate premium ads with AI copy + hero images + production-ready templates"
      />

      {/* Progress Stepper */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${state.currentStep > step.id
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
                  className={`text-sm text-center ${state.currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded ${state.currentStep > step.id ? 'bg-primary' : 'bg-border'
                    }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </Card>

      {draftAvailable && (
        <Card className="p-4 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-foreground">{draftLabel}</div>
            <div className="text-sm text-muted-foreground">
              Entwurf übernehmen oder mit einem leeren Briefing starten.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={continueDraft}>
              Weiter mit Entwurf
            </Button>
            <Button onClick={startNewAd}>
              Neues Briefing
            </Button>
          </div>
        </Card>
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
      <div className="w-full max-w-5xl mx-auto">
        <Card className="bg-card border-border p-4 sm:p-6 min-w-0">
          {/* Step 1: Strategy */}
          {state.currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 rounded-2xl border border-primary/10">
                <h2 className="text-xl font-bold mb-2">Define Your Master Strategy</h2>
                <p className="text-muted-foreground mb-6">
                  Choose a strategy to guide the AI&apos;s creativity and the Autopilot&apos;s budget decisions.
                </p>

                {strategiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <StrategySelector
                    strategies={strategies}
                    selectedId={selectedStrategyId}
                    onSelect={handleStrategySelect}
                    onCreateNew={() => setShowStrategyWizard(true)}
                    recommendedGoal="scaling"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Product & Image */}
          {state.currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-foreground truncate">Produkt & Bild</h2>
                  <p className="text-muted-foreground text-sm break-words">
                    Die wichtigsten Infos + optional dein Produktbild.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-foreground mb-2">Brand/Unternehmen</Label>
                  <Input
                    value={state.formData.brandName}
                    onChange={(e) => updateFormData('brandName', e.target.value)}
                    placeholder="z.B. BlackRuby Performance"
                    className="bg-input border-border text-foreground w-full max-w-full"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-2">Produktname *</Label>
                  <Input
                    value={state.formData.productName}
                    onChange={(e) => updateFormData('productName', e.target.value)}
                    placeholder="z.B. FitMax Pro Supplement"
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
                  <Label className="text-foreground mb-3">Produktbild (optional)</Label>
                  <ImageDropzone value={imageFile} onChange={setImageFile} />
                  {hookImageMeta?.path && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Uploaded to storage: <span className="font-medium">{hookImageMeta.path}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Die Strategie wird jetzt automatisch aus deinem Produkt, deiner Zielgruppe und den
                  Blueprint‑Daten abgeleitet. Du musst hier nichts mehr auswählen.
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Audience & Offer */}
          {state.currentStep === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-foreground truncate">Zielgruppe & Angebot</h2>
                  <p className="text-muted-foreground text-sm break-words">
                    Wer soll die Anzeige sehen und was ist der Kernnutzen?
                  </p>
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

                <div>
                  <Label className="text-foreground mb-2">Zusatzhinweise (optional)</Label>
                  <Textarea
                    value={state.formData.creativeNotes}
                    onChange={(e) => updateFormData('creativeNotes', e.target.value)}
                    placeholder="z.B. Ton: direkt, Fokus auf Vorteil X, keine Rabattversprechen"
                    rows={3}
                    className="bg-input border-border text-foreground w-full max-w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {state.currentStep === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-foreground truncate">Generieren</h2>
                  <p className="text-muted-foreground text-sm break-words">
                    Starte die Generierung. Die Ergebnisse erscheinen im naechsten Schritt.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground mb-3">Visual Style</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'Modern & Clean', gradient: 'from-blue-500 to-cyan-400' },
                        { name: 'Bold & Vibrant', gradient: 'from-primary to-orange-500' },
                        { name: 'Minimalistisch', gradient: 'from-gray-800 to-gray-600' }
                      ].map((style) => (
                        <div
                          key={style.name}
                          onClick={() => setSelectedVisualStyle(style.name)}
                          className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all w-full min-w-0 ${selectedVisualStyle === style.name
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-muted-foreground'
                            }`}
                        >
                          <div className={`w-full h-16 bg-gradient-to-br ${style.gradient} rounded mb-2 relative`}>
                            {selectedVisualStyle === style.name && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-6 h-6 text-white drop-shadow-lg" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Jetzt kaufen', 'Mehr erfahren', 'Kostenlos testen', 'Angebot sichern'].map(
                        (cta) => (
                          <div
                            key={cta}
                            onClick={() => setSelectedCTA(cta)}
                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all w-full min-w-0 ${selectedCTA === cta
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    Bereit zur Generierung
                  </div>
                  <Button
                    onClick={generateCopy}
                    disabled={!canGenerateCopy || isProcessing}
                    className="btn-sweep bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 h-11 px-6 text-base font-semibold hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
                  >
                    <Zap className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-pulse' : ''}`} />
                    {adStatus === 'analyzing' ? 'Analysiere…' : isGeneratingCopy ? 'Generiere…' : 'KI generieren'}
                  </Button>
                </div>

                {copyError && (
                  <div className="text-sm text-red-600">{copyError}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {state.currentStep === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-foreground truncate">Ergebnisse</h2>
                  <p className="text-muted-foreground text-sm break-words">
                    Hier findest du die fertigen Creatives und kannst sie speichern.
                  </p>
                </div>
              </div>

              {!displayOutput && (
                <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  Noch keine Ergebnisse. Geh zur Generierung zurueck und starte eine KI-Erstellung.
                </div>
              )}

              {displayOutput && (
                <CreativeResults
                  output={displayOutput}
                  quality={displayQuality}
                  onReset={resetAll}
                />
              )}
            </div>
          )}

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
            {state.currentStep < steps.length ? (
              state.currentStep !== 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={state.currentStep === 1 && !selectedStrategyId}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-primary/30"
                >
                  {getNextButtonLabel()}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : null
            ) : (
              <Button
                onClick={resetAll}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Neues Briefing
              </Button>
            )}
          </div>
        </Card>
      </div>

      {isProcessing && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={overlayTitle}
          onKeyDown={handleOverlayKeyDown}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-foreground">{overlayTitle}</div>
              <div className="text-xs text-muted-foreground">
                {Math.round(displayProgress)}% · {adStatus}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{overlayDescription}</p>
            <div className="mt-4">
              <Progress value={displayProgress} className="h-2" />
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                ref={cancelButtonRef}
                type="button"
                variant="outline"
                onClick={handleCancelGeneration}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
      {showStrategyWizard && (
        <StrategyWizard
          onComplete={handleCreateStrategy}
          onCancel={() => setShowStrategyWizard(false)}
        />
      )}
    </PageShell>
  );
}
