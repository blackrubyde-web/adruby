import { supabase } from "../supabaseClient";

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

export async function generateCampaignStrategyPlan(payload: { creativeIds: string[] }) {
  const token = await requireAccessToken();
  const res = await fetch(apiUrl("/api/strategy-campaign-generate"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ creativeIds: payload.creativeIds }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error ?? "Campaign strategy generation failed");
  return json;
}
