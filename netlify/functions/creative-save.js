import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { logAiAction } from "./_shared/aiLogging.js";
import { CreativeOutputAnySchema } from "./_shared/creativeSchemas.js";

function getLibraryConfig() {
  const rpc = process.env.CREATIVE_LIBRARY_RPC || "";
  return { rpc: rpc.trim() || null };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const cfg = getLibraryConfig();
  if (event.httpMethod === "GET") {
    if (!cfg.rpc) {
      return ok({ enabled: true, mode: "direct" });
    }
    return ok({ enabled: true, mode: "rpc" });
  }

  if (event.httpMethod !== "POST") return methodNotAllowed("GET,POST,OPTIONS");

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = CreativeOutputAnySchema.safeParse(body?.output ?? body);
  if (!parsed.success) return badRequest("Invalid creative output");

  const creativeId = typeof body?.creativeId === "string" ? body.creativeId : null;
  const averageScore = (() => {
    try {
      if (Array.isArray(parsed.data?.creatives)) {
        const scores = parsed.data.creatives.map((c) => c?.score?.value ?? 0);
        const sum = scores.reduce((acc, n) => acc + Number(n || 0), 0);
        return scores.length ? Math.round(sum / scores.length) : null;
      }
      if (Array.isArray(parsed.data?.variants)) {
        const scores = parsed.data.variants.map((v) => v?.quality?.total ?? 0);
        const sum = scores.reduce((acc, n) => acc + Number(n || 0), 0);
        return scores.length ? Math.round(sum / scores.length) : null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  try {
    if (cfg.rpc) {
      const { data, error } = await supabaseAdmin.rpc(cfg.rpc, {
        p_user_id: userId,
        p_output: parsed.data,
      });
      if (error) {
        console.warn("[creative-save] rpc failed:", error.message);
        throw new Error("Library save endpoint not configured on the backend.");
      }

      await logAiAction({
        userId,
        actionType: "creative_generate",
        status: "success",
        input: { action: "library_save" },
        output: { library: "saved", data: data ?? null },
        meta: { rpc: cfg.rpc },
      });

      return ok({ ok: true, data: data ?? null, mode: "rpc" });
    }

    let existingInputs = null;
    if (creativeId) {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("generated_creatives")
        .select("inputs")
        .eq("id", creativeId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existingError) {
        throw new Error(existingError.message || "Failed to load existing creative");
      }
      existingInputs = existing?.inputs || null;
    }

    const baseInputs =
      existingInputs && typeof existingInputs === "object" ? existingInputs : {};
    const existingBrief =
      baseInputs?.brief && typeof baseInputs.brief === "object" ? baseInputs.brief : {};
    const nextBrief =
      parsed.data?.brief && typeof parsed.data.brief === "object" ? parsed.data.brief : {};

    const mergedInputs = {
      ...baseInputs,
      brief: { ...existingBrief, ...nextBrief },
    };

    const updatePayload = {
      outputs: parsed.data,
      inputs: mergedInputs,
      saved: true,
      status: "complete",
      progress: 100,
      score: averageScore,
    };

    let savedId = creativeId;
    if (creativeId) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("generated_creatives")
        .update(updatePayload)
        .eq("id", creativeId)
        .eq("user_id", userId)
        .select("id")
        .single();
      if (updateError || !updated?.id) {
        savedId = null;
      }
    }

    if (!savedId) {
      const { data: created, error: insertError } = await supabaseAdmin
        .from("generated_creatives")
        .insert({
          user_id: userId,
          ...updatePayload,
        })
        .select("id")
        .single();
      if (insertError) {
        throw new Error(insertError.message || "Save failed");
      }
      savedId = created?.id || null;
    }

    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "success",
      input: { action: "library_save" },
      output: { library: "saved", creativeId: savedId },
      meta: { mode: "direct" },
    });

    return ok({ ok: true, creativeId: savedId, saved: true, mode: "direct" });
  } catch (err) {
    console.error("[creative-save] failed", err);
    captureException(err, { function: "creative-save" });
    return serverError(err?.message || "Save failed.");
  }
}
