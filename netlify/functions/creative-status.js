import { badRequest, methodNotAllowed, ok, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";

// Simple status endpoint for a generated creative job.
// GET /api/creative/status?id=<uuid>
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "GET") return methodNotAllowed("GET,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const id = (event.queryStringParameters && event.queryStringParameters.id) || null;
  if (!id) return badRequest("Missing id query parameter");

  try {
    const { data, error } = await supabaseAdmin
      .from("generated_creatives")
      .select("id, outputs, score, saved, created_at, status, progress, progress_meta")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return badRequest("Job not found", 404);
    }

    return ok({
      status: data.status || (data.outputs ? 'complete' : 'pending'),
      id: data.id,
      outputs: data.outputs,
      score: data.score,
      saved: data.saved,
      created_at: data.created_at,
      progress: data.progress ?? null,
      progress_meta: data.progress_meta ?? null,
    });
  } catch (err) {
    captureException(err, { function: "creative-status" });
    return badRequest(err?.message || "Failed to get status");
  }
}
