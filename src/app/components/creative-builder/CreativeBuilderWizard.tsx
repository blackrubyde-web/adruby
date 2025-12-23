import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { Form } from "../ui/form";
import StepHeader from "./StepHeader";
import ImageDropzone from "./ImageDropzone";
import CreativeBriefForm from "./CreativeBriefForm";
import NormalizedBriefReview from "./NormalizedBriefReview";
import CreativeResults from "./CreativeResults";
import type {
  CreativeOutput,
  CreativeOutputPro,
  CreativeOutputV1,
  CreativeOutputV2,
  NormalizedBrief,
} from "../../lib/creative/schemas";
import { creativeAnalyze, creativeGenerate, creativeStatus } from "../../lib/api/creative";
import { useAuthState } from "../../contexts/AuthContext";

const FormSchema = z.object({
  brandName: z.string().min(1, "Brand is required"),
  productName: z.string().min(1, "Product is required"),
  productUrl: z.string().url().optional().or(z.literal("")),
  offer: z.string().optional(),
  audience: z.string().min(1, "Audience is required"),
  tone: z.string().min(1),
  goal: z.string().min(1),
  funnel: z.string().min(1),
  language: z.string().min(1),
  format: z.string().min(1),
  inspiration: z.string().optional(),
  avoidClaims: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;
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

export default function CreativeBuilderWizard() {
  const { session, isAuthReady, isLoading, authError } = useAuthState();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMeta, setImageMeta] = useState<{ path: string; signedUrl: string } | null>(null);

  const [brief, setBrief] = useState<NormalizedBrief | null>(null);
  const [output, setOutput] = useState<CreativeOutputV1 | null>(null);
  const [quality, setQuality] = useState<{ satisfaction?: number; target?: number; issues?: unknown[] } | null>(null);

  const [loading, setLoading] = useState<null | "analyze" | "generate">(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      brandName: "",
      productName: "",
      productUrl: "",
      offer: "",
      audience: "",
      tone: "direct",
      goal: "sales",
      funnel: "cold",
      language: "de",
      format: "4:5",
      inspiration: "",
      avoidClaims: "",
    },
    mode: "onChange",
  });

  const canAnalyze = form.formState.isValid && !loading && isAuthReady && !isLoading && !!session;

  const buildFallbackBrief = useCallback((): NormalizedBrief => {
    const values = form.getValues();
    const goal =
      values.goal === "leads"
        ? "leads"
        : values.goal === "traffic"
          ? "traffic"
          : values.goal === "app_installs"
            ? "app_installs"
            : "sales";
    const funnel = values.funnel === "hot" ? "hot" : values.funnel === "warm" ? "warm" : "cold";
    const format =
      values.format === "1:1" || values.format === "9:16" || values.format === "4:5"
        ? values.format
        : "4:5";
    const language = values.language === "en" ? "en" : "de";
    const audienceSummary = values.audience || "Audience";

    return {
      brand: { name: values.brandName || values.productName || "Brand" },
      product: {
        name: values.productName || "Product",
        url: values.productUrl || null,
        category: null,
      },
      goal,
      funnel_stage: funnel,
      language,
      format,
      audience: {
        summary: audienceSummary,
        segments: [audienceSummary].filter(Boolean),
      },
      offer: { summary: values.offer || null, constraints: [] },
      tone: "direct",
      angles: [],
      risk_flags: [],
    };
  }, [form]);

  const normalizeOutputToV1 = useCallback((raw: CreativeOutput | null): CreativeOutputV1 | null => {
    if (!raw || typeof raw !== "object") return null;
    if ("version" in raw && raw.version === "1.0") return raw as CreativeOutputV1;
    const baseBrief = brief ?? buildFallbackBrief();

    if ("schema_version" in raw && raw.schema_version === "2.1-pro") {
      const pro = raw as CreativeOutputPro;
      const creatives = (pro.variants || []).map((variant, idx) => ({
        id: variant.id || `c${idx + 1}`,
        angle_id: variant.id || `angle${idx + 1}`,
        format: variant.format || baseBrief.format,
        copy: {
          hook: variant.copy.hook || "Hook",
          primary_text: variant.copy.primary_text || "Primary text",
          cta: variant.copy.cta || "Mehr erfahren",
          bullets: variant.copy.bullets || [],
        },
        score: {
          value: variant.quality?.total ?? 0,
          rationale: variant.quality?.issues?.[0] || "Auto-scored variant",
        },
        image: {
          input_image_used: Boolean(variant.visual?.image?.input_image_used),
          render_intent: variant.visual?.image?.render_intent || "Hero image",
          hero_image_url: variant.visual?.image?.hero_image_url ?? undefined,
          hero_image_bucket: variant.visual?.image?.hero_image_bucket ?? undefined,
          hero_image_path: variant.visual?.image?.hero_image_path ?? undefined,
          final_image_url: variant.visual?.image?.final_image_url ?? undefined,
          final_image_bucket: variant.visual?.image?.final_image_bucket ?? undefined,
          final_image_path: variant.visual?.image?.final_image_path ?? undefined,
          width: variant.visual?.image?.width ?? undefined,
          height: variant.visual?.image?.height ?? undefined,
          model: variant.visual?.image?.model ?? undefined,
          seed: variant.visual?.image?.seed ?? undefined,
          prompt_hash: variant.visual?.image?.prompt_hash ?? undefined,
          render_version: variant.visual?.image?.render_version ?? undefined,
          error: variant.visual?.image?.error ?? undefined,
        },
      }));
      const angles =
        baseBrief.angles?.length
          ? baseBrief.angles
          : creatives.map((c) => ({
              id: c.angle_id,
              label: c.copy.hook,
              why_it_fits: "Generated variant",
            }));
      return {
        version: "1.0",
        brief: { ...baseBrief, angles },
        creatives,
      } as CreativeOutputV1;
    }

    if ("schema_version" in raw && raw.schema_version === "2.0") {
      const v2 = raw as CreativeOutputV2;
      const variants = Array.isArray(v2.variants) ? v2.variants : [];
      const creatives = variants.map((variantRaw, idx: number) => {
        const variant =
          variantRaw && typeof variantRaw === "object"
            ? (variantRaw as CreativeV2Variant)
            : ({} as CreativeV2Variant);
        return {
          id: variant.id || `c${idx + 1}`,
          angle_id: variant.id || `angle${idx + 1}`,
          format: variant.format || baseBrief.format,
          copy: {
            hook: variant.hook || variant?.script?.hook || "Hook",
          primary_text:
            variant?.script?.offer ||
            variant?.script?.proof ||
            variant?.script?.problem ||
            "Primary text",
          cta: variant.cta || variant?.script?.cta || "Mehr erfahren",
          bullets: [],
        },
        score: { value: 80, rationale: "Auto-scored variant" },
        image: {
          input_image_used: Boolean(variant?.image?.input_image_used),
          render_intent: variant?.image?.render_intent || "Hero image",
          hero_image_url: variant?.image?.hero_image_url ?? undefined,
          hero_image_bucket: variant?.image?.hero_image_bucket ?? undefined,
          hero_image_path: variant?.image?.hero_image_path ?? undefined,
          final_image_url: variant?.image?.final_image_url ?? undefined,
          final_image_bucket: variant?.image?.final_image_bucket ?? undefined,
          final_image_path: variant?.image?.final_image_path ?? undefined,
          width: variant?.image?.width ?? undefined,
          height: variant?.image?.height ?? undefined,
          model: variant?.image?.model ?? undefined,
          seed: variant?.image?.seed ?? undefined,
          prompt_hash: variant?.image?.prompt_hash ?? undefined,
          render_version: variant?.image?.render_version ?? undefined,
          error: variant?.image?.error ?? undefined,
        },
        };
      });
      return {
        version: "1.0",
        brief: { ...baseBrief, angles: baseBrief.angles },
        creatives,
      } as CreativeOutputV1;
    }

    return null;
  }, [brief, buildFallbackBrief]);

  async function onAnalyze() {
    setError(null);
    setLoading("analyze");
    try {
      const v = form.getValues();
      const fd = new FormData();
      Object.entries(v).forEach(([k, val]) => fd.append(k, String(val ?? "")));
      if (imageFile) fd.append("image", imageFile);

      const res = await creativeAnalyze(fd);
      setBrief(res.brief);
      setImageMeta(res.image ?? null);
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analyze failed.");
    } finally {
      setLoading(null);
    }
  }

  async function onGenerate() {
    if (!brief) return;
    setError(null);
    setLoading("generate");
    setProgress(null);
    try {
      const res = await creativeGenerate({
        brief,
        hasImage: Boolean(imageFile),
        imagePath: imageMeta?.path ?? null,
      });
      setJobId(res.jobId ?? null);
      if (res.output) {
        const normalized = normalizeOutputToV1(res.output ?? null);
        setOutput(normalized);
        setQuality(res.quality != null ? { satisfaction: res.quality } : null);
      }
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generate failed.");
    } finally {
      setLoading(null);
      setProgress(null);
    }
  }

  function resetAll() {
    form.reset();
    setImageFile(null);
    setImageMeta(null);
    setBrief(null);
    setOutput(null);
    setQuality(null);
    setJobId(null);
    setProgress(null);
    setError(null);
    setStep(1);
  }

  const authState = useMemo(() => {
    if (!isAuthReady || isLoading) return { kind: "loading" as const };
    if (!session) return { kind: "missing" as const };
    return { kind: "ok" as const };
  }, [isAuthReady, isLoading, session]);

  useEffect(() => {
    if (!jobId || output || loading === "generate") return;
    let cancelled = false;
    let attempt = 0;

    const poll = async () => {
      if (cancelled) return;
      try {
        const status = await creativeStatus(jobId);
        if (cancelled) return;
        if (typeof status.progress === "number") setProgress(status.progress);
        if (status.status === "complete" && status.outputs) {
          const normalized = normalizeOutputToV1(status.outputs);
          setOutput(normalized);
          setQuality(
            status.score != null ? { satisfaction: status.score, target: quality?.target } : null,
          );
          return;
        }
        if (status.status === "error") {
          setError("Generierung fehlgeschlagen.");
          return;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Status check failed.");
        }
        return;
      }

      attempt += 1;
      const delay = Math.min(5000, 1200 + attempt * 300);
      setTimeout(poll, delay);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId, output, loading, quality?.target, normalizeOutputToV1]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <StepHeader
        title="Create Ad Creative"
        subtitle="Analyze input into a strict brief JSON, then generate variants with a quality gate."
        step={step}
      />

      {authState.kind === "loading" && (
        <Card className="p-5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-3 h-4 w-80" />
        </Card>
      )}

      {authState.kind === "missing" && (
        <Alert>
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            {authError
              ? authError
              : "You need a valid Supabase session to use Creative Builder. Please log in, then retry."}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <ImageDropzone value={imageFile} onChange={setImageFile} />
            {imageMeta?.path && (
              <div className="mt-3 text-xs text-muted-foreground">
                Uploaded to storage: <span className="font-medium">{imageMeta.path}</span>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <Form {...form}>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <CreativeBriefForm form={form} />
                <div className="flex flex-wrap gap-3">
                  <Button disabled={!canAnalyze} onClick={onAnalyze} type="button">
                    {loading === "analyze" ? "Analyzing…" : "Analyse & JSON erstellen"}
                  </Button>
                  <Button variant="secondary" onClick={resetAll} disabled={!!loading} type="button">
                    Zurücksetzen
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Next: We will normalize your input into a strict brief JSON (Step 2).
                </div>
              </form>
            </Form>
          </Card>
        </div>
      )}

      {step === 2 && brief && (
        <Card className="p-5">
          <NormalizedBriefReview brief={brief} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={onGenerate} disabled={loading === "generate"} type="button">
              {loading === "generate" ? "Generating…" : "Creatives generieren"}
            </Button>
            <Button variant="secondary" onClick={() => setStep(1)} disabled={!!loading} type="button">
              Brief bearbeiten
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Step 3 generates 4–6 variants and reruns an AI quality check until it meets the target
            (best effort).
          </div>
        </Card>
      )}

      {step === 3 && output && (
        <CreativeResults output={output} quality={quality} onReset={resetAll} />
      )}

      {step === 3 && !output && (
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">
            {loading === "generate" ? "Generierung läuft…" : "Ergebnis wird geladen…"}
          </div>
          {typeof progress === "number" && (
            <div className="mt-2 text-xs text-muted-foreground">
              Fortschritt: {Math.round(progress)}%
            </div>
          )}
          {jobId && (
            <div className="mt-2 text-xs text-muted-foreground">
              Job: <span className="font-medium">{jobId}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
