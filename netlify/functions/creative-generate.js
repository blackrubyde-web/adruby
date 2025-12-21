import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { NormalizedBriefSchema } from "./_shared/creativeSchemas.js";

function getAuthHeader(headers) {
  if (!headers) return null;
  return headers.authorization || headers.Authorization || null;
}

function getBaseUrl(event) {
  const base = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || "";
  if (base) return base.replace(/\/$/, "");
  const headers = event?.headers || {};
  const proto = headers["x-forwarded-proto"] || headers["X-Forwarded-Proto"] || "https";
  const host = headers["x-forwarded-host"] || headers["X-Forwarded-Host"] || headers.host || headers.Host;
  if (host) return `${proto}://${host}`;
  return "http://localhost:8888";
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  if (process.env.DEBUG_FUNCTIONS === "1") {
    try {
      console.info(
        `[creative-generate] queue start method=${event.httpMethod} hasAuth=${Boolean(
          event.headers?.authorization,
        )} body-length=${event?.body ? String(event.body).length : 0}`,
      );
    } catch {
      /* ignore logging errors */
    }
  }

  const auth = await requireUserId(event);
  if (!auth.ok) {
    if (process.env.DEBUG_FUNCTIONS === "1") {
      console.warn("[creative-generate] Auth failed", {
        path: event.path,
        method: event.httpMethod,
      });
    }
    return auth.response;
  }
  const userId = auth.userId;

  const entitlement = await requireActiveSubscription(userId);
  if (!entitlement.ok) {
    if (process.env.DEBUG_FUNCTIONS === "1") {
      console.warn("[creative-generate] Entitlement check failed", { userId });
    }
    return entitlement.response;
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const briefParsed = NormalizedBriefSchema.safeParse(body?.brief ?? body);
  if (!briefParsed.success) {
    if (process.env.DEBUG_FUNCTIONS === "1") {
      try {
        console.warn("[creative-generate] Invalid brief payload", {
          bodySample: String(body).slice(0, 200),
        });
      } catch {
        /* ignore */
      }
    }
    return badRequest("Invalid brief");
  }

  const hasImage = Boolean(body?.hasImage);
  const strategyId = typeof body?.strategyId === "string" ? body.strategyId.trim() : null;

  let placeholderId = null;
  try {
    const insertPayload = {
      user_id: userId,
      blueprint_id: strategyId || null,
      inputs: { brief: briefParsed.data, hasImage, strategyId: strategyId || null },
      outputs: null,
      score: null,
      saved: false,
      status: "pending",
      progress: 0,
    };

    let createdRow;
    let createErr;
    ({ data: createdRow, error: createErr } = await supabaseAdmin
      .from("generated_creatives")
      .insert(insertPayload)
      .select("id")
      .single());

    if (createErr && String(createErr.message || "").includes("research_snapshot")) {
      ({ data: createdRow, error: createErr } = await supabaseAdmin
        .from("generated_creatives")
        .insert({
          user_id: insertPayload.user_id,
          blueprint_id: insertPayload.blueprint_id,
          inputs: insertPayload.inputs,
          outputs: null,
          score: null,
          saved: false,
          status: "pending",
          progress: 0,
        })
        .select("id")
        .single());
    }

    if (createErr) {
      return serverError(createErr.message || "Failed to create job");
    }
    placeholderId = createdRow?.id ?? null;
  } catch (err) {
    return serverError(err?.message || "Failed to create job");
  }

  if (!placeholderId) {
    return serverError("Failed to allocate generation job");
  }

  const baseUrl = getBaseUrl(event);
  const authHeader = getAuthHeader(event.headers);
  const backgroundUrl = `${baseUrl}/.netlify/functions/creative-generate-background`;

  try {
    const bgRes = await fetch(backgroundUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ ...body, jobId: placeholderId }),
    });
    if (process.env.DEBUG_FUNCTIONS === "1") {
      console.info("[creative-generate] background response", {
        status: bgRes.status,
        ok: bgRes.ok,
        url: backgroundUrl,
      });
    }
    if (!bgRes.ok) {
      const text = await bgRes.text();
      if (process.env.DEBUG_FUNCTIONS === "1") {
        console.warn("[creative-generate] background failed", {
          status: bgRes.status,
          body: text?.slice(0, 200) || null,
        });
      }
      await supabaseAdmin
        .from("generated_creatives")
        .update({
          status: "error",
          progress: 0,
          progress_meta: { error: "queue_failed", status: bgRes.status },
        })
        .eq("id", placeholderId);
    }
  } catch (err) {
    if (process.env.DEBUG_FUNCTIONS === "1") {
      console.warn("[creative-generate] background fetch error", err?.message || err);
    }
    try {
      await supabaseAdmin
        .from("generated_creatives")
        .update({ status: "error", progress: 0, progress_meta: { error: "queue_failed" } })
        .eq("id", placeholderId);
    } catch {
      /* ignore */
    }
  }

  return ok({ jobId: placeholderId, status: "queued" });
}
