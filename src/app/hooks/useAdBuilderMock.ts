import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedBrief } from "../lib/creative/schemas";

type Status = "idle" | "analyzing" | "generating" | "polling" | "complete" | "error";

// A deterministic demo creative output used in tests and local demo page.
const DEMO_OUTPUT = {
  variants: [
    {
      id: "v1",
      headline: "Mehr Kunden in 30 Tagen — Jetzt starten",
      body: "Steigere deine Verkäufe mit unserem erprobten Marketing-Setup für Selbständige.",
      cta: "Jetzt testen",
      image: "/demo-assets/demo-product-1.jpg",
    },
  ],
  metadata: { estimated_performance: 78 },
};

const isTestEnv = import.meta.env.MODE === "test";
const analyzeDelayMs = isTestEnv ? 50 : 1000;
const generateDelayMs = isTestEnv ? 50 : 1200;

export function useAdBuilderMock() {
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<NormalizedBrief | null>(null);
  const [imageMeta, setImageMeta] = useState<{ path: string; signedUrl: string } | null>(null);
  const [result, setResult] = useState<typeof DEMO_OUTPUT | null>(null);
  const [quality, setQuality] = useState<{ satisfaction: number; target: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelledRef = useRef(false);

  useEffect(() => () => void (cancelledRef.current = true), []);

  const analyze = useCallback(async (fd: FormData) => {
    setError(null);
    setStatus("analyzing");
    // simulate network + model latency
    await new Promise((r) => setTimeout(r, analyzeDelayMs));

    // build a trivial normalized brief from FormData for demo
    const b: Record<string, string> = {};
    fd.forEach((v, k) => {
      b[k] = String(v || "");
    });

    setBrief(b as unknown as NormalizedBrief);
    // pretend image uploaded
    setImageMeta(b.image ? { path: "demo/path.jpg", signedUrl: "/demo-assets/demo-product-1.jpg" } : null);
    setStatus("idle");
    return { brief: b, image: imageMeta };
  }, [imageMeta]);

  const generate = useCallback(
    async (_opts: { brief: unknown; hasImage: boolean; strategyId?: string | null }) => {
      setError(null);
      setStatus("generating");
      cancelledRef.current = false;

      // simulate model generation and gradual quality checks
      await new Promise((r) => setTimeout(r, generateDelayMs));
      if (cancelledRef.current) throw new Error("Cancelled");

      setStatus("polling");
      await new Promise((r) => setTimeout(r, generateDelayMs));
      if (cancelledRef.current) throw new Error("Cancelled");

      setResult(DEMO_OUTPUT);
      setQuality({ satisfaction: 78, target: 90 });
      setStatus("complete");
      return { output: DEMO_OUTPUT, quality: { satisfaction: 78 } };
    },
    [],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setStatus("idle");
  }, []);

  return {
    status,
    brief,
    imageMeta,
    result,
    quality,
    error,
    analyze,
    generate,
    cancel,
  } as const;
}

export default useAdBuilderMock;
