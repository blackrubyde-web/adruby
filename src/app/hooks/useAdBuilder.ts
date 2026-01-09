import { useCallback, useEffect, useRef, useState } from "react";
import { creativeAnalyze, creativeGenerate, creativeStatus } from "../lib/api/creative";
import type { CreativeGenerateResponse, CreativeStatusResponse } from "../lib/api/creative";
import { NormalizedBriefSchema, type NormalizedBrief, type CreativeOutput } from "../lib/creative/schemas";
import { env } from "../lib/env";

type Quality =
  | number
  | {
    satisfaction?: number | null;
    score?: number | null;
    comment?: string | null;
    summary?: string | null;
  };

type Status = "idle" | "analyzing" | "generating" | "polling" | "complete" | "error";

const DEMO_BRIEF: NormalizedBrief = {
  brand: { name: "AdRuby Demo" },
  product: { name: "Demo Product", url: "https://example.com", category: "Software" },
  goal: "sales",
  funnel_stage: "cold",
  language: "de",
  format: "4:5",
  audience: { summary: "Tech teams scaling fast", segments: ["Founders", "Ops Leads"] },
  offer: { summary: "14-day free trial", constraints: [] },
  tone: "trustworthy",
  angles: [
    { id: "benefit", label: "Key benefit", why_it_fits: "Highlights the main value quickly." },
    { id: "proof", label: "Social proof", why_it_fits: "Builds trust with results." },
  ],
  risk_flags: [],
};

const DEMO_IMAGE = {
  path: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
};

export function useAdBuilder() {
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<NormalizedBrief | null>(null);
  const [imageMeta, setImageMeta] = useState<{ path?: string | null } | null>(null);
  const [result, setResult] = useState<CreativeOutput | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const pollRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const pollIdRef = useRef(0);

  useEffect(() => {
    const ref = pollRef;
    return () => {
      ref.current.cancelled = true;
    };
  }, []);

  const analyze = useCallback(async (fd: FormData) => {
    setError(null);
    setStatus("analyzing");
    setJobId(null);

    if (env.demoMode) {
      await new Promise(r => setTimeout(r, 1500));
      const mockResult = {
        brief: DEMO_BRIEF,
        image: DEMO_IMAGE,
      };
      setBrief(mockResult.brief);
      setImageMeta(mockResult.image);
      setStatus("idle");
      return mockResult;
    }

    try {
      const res = await creativeAnalyze(fd);
      setBrief(res.brief);
      setImageMeta(res.image ?? null);
      setStatus("idle");
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analyze failed";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, []);

  const generate = useCallback(
    async (opts: {
      brief: NormalizedBrief | unknown;
      hasImage: boolean;
      strategyId?: string | null;
      researchIds?: string[] | null;
      imagePath?: string | null;
      outputMode?: string | null;
      style_mode?: string | null;
      visual_style?: string | null;
      cta_preference?: string | null;
      platforms?: string[] | null;
      formats?: string[] | null;
    }): Promise<CreativeGenerateResponse | CreativeStatusResponse> => {
      setError(null);
      setStatus("generating");
      setJobId(null);
      setProgress(null);
      pollRef.current.cancelled = false;
      pollIdRef.current += 1;
      const pollId = pollIdRef.current;

      if (env.demoMode) {
        setJobId("demo-job-123");
        setStatus("polling");

        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          if (pollRef.current.cancelled || pollId !== pollIdRef.current) break;
          setProgress(i);
          await new Promise(r => setTimeout(r, 800));
        }

        if (pollRef.current.cancelled || pollId !== pollIdRef.current) {
          setStatus("idle");
          throw new Error("Poll cancelled");
        }

        const parsedBrief = NormalizedBriefSchema.safeParse(opts.brief);
        const resolvedBrief = parsedBrief.success ? parsedBrief.data : DEMO_BRIEF;

        const mockOutput: CreativeOutput = {
          version: "1.0",
          brief: resolvedBrief,
          creatives: [
            {
              id: "demo-cr-1",
              angle_id: resolvedBrief.angles[0]?.id || "benefit",
              format: resolvedBrief.format,
              copy: {
                hook: "Level up your workflow with AI.",
                primary_text: "Ship faster with AI-powered workflows built for modern teams.",
                cta: "Learn More",
                bullets: [],
              },
              score: { value: 92, rationale: "Clear benefit-driven hook with strong CTA." },
              image: {
                input_image_used: Boolean(opts.hasImage),
                render_intent: "Clean product scene with modern lighting",
              },
            },
            {
              id: "demo-cr-2",
              angle_id: resolvedBrief.angles[1]?.id || "proof",
              format: resolvedBrief.format,
              copy: {
                hook: "Teams switch for measurable ROI.",
                primary_text: "Join 1,200+ teams improving output in the first 14 days.",
                cta: "Start Free Trial",
                bullets: [],
              },
              score: { value: 88, rationale: "Proof-led angle builds trust and urgency." },
              image: {
                input_image_used: Boolean(opts.hasImage),
                render_intent: "Minimal dashboard mockup with bold contrast",
              },
            },
          ],
        };

        setResult(mockOutput);
        setQuality({ score: 95, summary: "Excellent alignment with brief." });
        setStatus("complete");
        setProgress(null);
        return {
          id: "demo-job-123",
          status: "complete",
          outputs: mockOutput,
        } as CreativeStatusResponse;
      }

      try {
        const resolvedImagePath =
          opts.imagePath ||
          (imageMeta && typeof imageMeta === "object" && "path" in imageMeta
            ? imageMeta.path || null
            : null);
        const res = await creativeGenerate({
          ...opts,
          imagePath: resolvedImagePath,
        });
        setJobId(res.jobId ?? null);

        // If server provided a jobId, poll for completion. Otherwise accept immediate output.
        if (res.jobId) {
          setStatus("polling");
          const maxPollingMs = Number(import.meta.env.VITE_CREATIVE_POLL_MAX_MS || 20 * 60 * 1000);
          const deadline = Date.now() + Math.max(60000, maxPollingMs);
          let attempt = 0;
          let lastStatus: string | null = null;
          let lastProgress: number | null = null;
          while (
            !pollRef.current.cancelled &&
            Date.now() < deadline &&
            pollId === pollIdRef.current
          ) {
            attempt += 1;
            try {
              // eslint-disable-next-line no-await-in-loop
              const s = await creativeStatus(res.jobId);
              // update live progress/status if available
              if (typeof s?.progress === 'number') {
                lastProgress = Number(s.progress);
                setProgress(lastProgress);
              }
              if (s?.status) {
                lastStatus = s.status;
                setStatus(s.status === 'complete' ? 'complete' : 'polling');
              }
              if (s?.id) setJobId(s.id);

              // Progressive Rendering: expose outputs early if available
              if (s?.outputs) {
                setResult(s.outputs);
                if (s.score) {
                  setQuality(s.score);
                }
              }

              if (s?.status === "error") {
                const metaError =
                  s?.progress_meta && typeof s.progress_meta === "object" && "error" in s.progress_meta
                    ? String((s.progress_meta as Record<string, unknown>).error || "")
                    : "";
                const errMsg = metaError || "Generierung fehlgeschlagen.";
                // if we have partial results, maybe don't hard fail? 
                // but usually error means stop.
                setError(errMsg);
                setStatus("error");
                setProgress(null);
                throw new Error(errMsg);
              }
              if (s?.status === "complete") {
                setResult(s.outputs ?? null);
                setQuality(s.score ?? null);
                setStatus("complete");
                setProgress(null);
                return s as CreativeStatusResponse;
              }
            } catch (e) {
              // keep polling unless unrecoverable
              // if 404 treat as pending and continue
            }

            // backoff delay (start a bit slower to reduce rapid polling)
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => {
              const baseDelay = 2000;
              const backoff = Math.min(6000, baseDelay + attempt * 500);
              const jitter = Math.floor(Math.random() * 400);
              setTimeout(r, backoff + jitter);
            });
          }

          if (pollRef.current.cancelled) {
            setStatus("idle");
            throw new Error("Poll cancelled");
          }

          console.warn("[useAdBuilder] Polling timed out", {
            jobId: res.jobId,
            status: lastStatus,
            progress: lastProgress,
          });
          throw new Error("Polling timed out");
        }

        // immediate output
        setResult(res.output ?? null);
        setQuality(res.quality ?? null);
        setStatus("complete");
        setProgress(null);
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Generate failed";
        setError(message);
        setStatus("error");
        setJobId(null);
        setProgress(null);
        throw err;
      }
    },
    [imageMeta],
  );

  const cancel = useCallback(() => {
    pollRef.current.cancelled = true;
    pollIdRef.current += 1;
    setStatus("idle");
    setProgress(null);
    setJobId(null);
    setError(null);
  }, []);

  return {
    status,
    brief,
    imageMeta,
    result,
    quality,
    progress,
    jobId,
    error,
    analyze,
    generate,
    cancel,
  } as const;
}

export default useAdBuilder;
