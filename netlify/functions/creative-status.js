import {
  badRequest,
  methodNotAllowed,
  ok,
  serverError,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "GET") return methodNotAllowed("GET,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const id = String(event.queryStringParameters?.id || "").trim();
  if (!id) return badRequest("Missing id");

  try {
    const { data, error } = await supabaseAdmin
      .from("generated_creatives")
      .select("id,outputs,status,score,saved,created_at,progress,progress_meta")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return serverError(error.message || "Failed to load status");
    }

    if (!data?.id) {
      return badRequest("Creative not found", 404);
    }

    return ok({
      id: data.id,
      status: data.status || "complete",
      outputs: data.outputs || null,
      score: data.score ?? null,
      saved: data.saved ?? null,
      created_at: data.created_at || null,
      progress: typeof data.progress === "number" ? data.progress : null,
      progress_meta: data.progress_meta || null,
    });
  } catch (err) {
    captureException(err, { function: "creative-status" });
    return serverError(err?.message || "Status check failed");
  }
}
