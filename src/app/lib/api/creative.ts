import { supabase } from "../supabaseClient";
import { CreativeOutputSchema, NormalizedBriefSchema } from "../creative/schemas";
import type { CreativeOutput, NormalizedBrief } from "../creative/schemas";

function apiUrl(path: string) {
  const base = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

async function requireAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated.");
  return token;
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: "Invalid server response." };
  }
}

export async function creativeAnalyze(fd: FormData) {
  const token = await requireAccessToken();

  const res = await fetch(apiUrl("/api/creative/analyze"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Analyze failed");

  const parsed = NormalizedBriefSchema.safeParse(json?.brief);
  if (!parsed.success) throw new Error("Server returned invalid brief JSON.");

  return {
    brief: parsed.data,
    image: json?.image ?? null,
    credits: json?.credits ?? null,
    warning: json?.warning ?? null,
  };
}

export type CreativeGenerateResponse = {
  output: CreativeOutput | null;
  credits: number | null;
  quality: number | null;
  jobId: string | null;
};

export async function creativeGenerate(params: {
  brief: NormalizedBrief | unknown;
  hasImage: boolean;
  imagePath?: string | null;
  strategyId?: string | null;
  researchIds?: string[] | null;
  outputMode?: string | null;
  style_mode?: string | null;
  visual_style?: string | null;
  cta_preference?: string | null;
  platforms?: string[] | null;
  formats?: string[] | null;
}): Promise<CreativeGenerateResponse> {
  const token = await requireAccessToken();

  const res = await fetch(apiUrl("/api/creative/generate"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Generate failed");
  // The backend may respond in two modes:
  // - direct: returns `output` immediately
  // - job-mode: returns a `jobId` and no immediate output
  // Only validate `output` if present to avoid throwing on job-mode responses.
  let parsedOutput: CreativeOutput | null = null;
  if (json?.output) {
    const p = CreativeOutputSchema.safeParse(json.output);
    if (!p.success) throw new Error("Server returned invalid CreativeOutput JSON.");
    parsedOutput = p.data;
  }

  return {
    output: parsedOutput,
    credits: json?.credits ?? null,
    quality: json?.quality ?? null,
    jobId: json?.jobId ?? null,
  };
}

export type CreativeStatusResponse = {
  status: string;
  id: string;
  outputs: CreativeOutput | null;
  score?: number | null;
  saved?: boolean | null;
  created_at?: string | null;
  progress?: number | null;
  progress_meta?: unknown | null;
};

export async function creativeStatus(jobId: string): Promise<CreativeStatusResponse> {
  const token = await requireAccessToken();
  const url = apiUrl(`/api/creative/status?id=${encodeURIComponent(jobId)}`);
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Status check failed");
  // Validate outputs if present
  if (json?.outputs) {
    const p = CreativeOutputSchema.safeParse(json.outputs);
    if (!p.success) throw new Error('Server returned invalid CreativeOutput JSON in status');
    json.outputs = p.data;
  }
  return json as CreativeStatusResponse;
}

export async function creativeLibraryStatus() {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl("/api/creative/save"), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) return { enabled: false, reason: json?.error ?? "Library not available" };
  return { enabled: Boolean(json?.enabled), reason: json?.reason ?? null };
}

export async function fetchAdResearch(limit = 10) {
  const token = await requireAccessToken();
  const url = apiUrl(`/api/ad-research-list?limit=${encodeURIComponent(String(limit))}`);
  const res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? 'Failed to fetch ad research items');
  return json;
}

export async function saveResearchSelection(params: { name?: string | null; selectionIds: string[] }) {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl('/api/ad-research-save'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: params.name || null, selectionIds: params.selectionIds }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? 'Save failed');
  return json;
}

export async function fetchResearchSelections() {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl('/api/ad-research-save'), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? 'Fetch failed');
  return json;
}

export async function creativeSaveToLibrary(params: { output: unknown; creativeId?: string | null }) {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl("/api/creative/save"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Save failed");
  return json;
}

export async function generateStrategyPlan(params: { creativeId: string; strategyId?: string | null }) {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl("/api/strategy-generate"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ creativeId: params.creativeId, strategyId: params.strategyId || null }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Strategy generation failed");
  return json;
}
