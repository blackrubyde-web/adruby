import { useCallback, useEffect, useRef, useState } from "react";
import { creativeAnalyze, creativeGenerate, creativeStatus } from "../lib/api/creative";
import type { CreativeGenerateResponse, CreativeStatusResponse } from "../lib/api/creative";
import type { NormalizedBrief, CreativeOutput } from "../lib/creative/schemas";

type Quality =
  | number
  | {
      satisfaction?: number | null;
      score?: number | null;
      comment?: string | null;
      summary?: string | null;
    };

type Status = "idle" | "analyzing" | "generating" | "polling" | "complete" | "error";

export function useAdBuilder() {
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<NormalizedBrief | null>(null);
  const [imageMeta, setImageMeta] = useState<unknown | null>(null);
  const [result, setResult] = useState<CreativeOutput | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const pollRef = useRef<{ cancelled: boolean }>({ cancelled: false });

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
  async (opts: { brief: NormalizedBrief | unknown; hasImage: boolean; strategyId?: string | null; researchIds?: string[] | null }): Promise<CreativeGenerateResponse | CreativeStatusResponse> => {
      setError(null);
      setStatus("generating");
      setJobId(null);
      pollRef.current.cancelled = false;
      try {
  const res = await creativeGenerate(opts);
        setJobId(res.jobId ?? null);

        // If server provided a jobId, poll for completion. Otherwise accept immediate output.
        if (res.jobId) {
          setStatus("polling");
          const maxAttempts = 20;
          let attempt = 0;
          while (!pollRef.current.cancelled && attempt < maxAttempts) {
            attempt += 1;
            try {
              // eslint-disable-next-line no-await-in-loop
              const s = await creativeStatus(res.jobId);
              // update live progress/status if available
              if (typeof s?.progress === 'number') setProgress(Number(s.progress));
              if (s?.status) setStatus(s.status === 'complete' ? 'complete' : 'polling');
              if (s?.id) setJobId(s.id);
              if (s?.status === "complete") {
                setResult(s.outputs ?? null);
                setQuality(s.score ?? null);
                setStatus("complete");
                return s as CreativeStatusResponse;
              }
            } catch (e) {
              // keep polling unless unrecoverable
              // if 404 treat as pending and continue
            }

            // backoff delay (start a bit slower to reduce rapid polling)
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 1500 + Math.min(4000, attempt * 400)));
          }

          if (pollRef.current.cancelled) {
            setStatus("idle");
            throw new Error("Poll cancelled");
          }

          throw new Error("Polling timed out");
        }

        // immediate output
  setResult(res.output ?? null);
  setQuality(res.quality ?? null);
        setStatus("complete");
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Generate failed";
        setError(message);
        setStatus("error");
        setJobId(null);
        throw err;
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    pollRef.current.cancelled = true;
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
