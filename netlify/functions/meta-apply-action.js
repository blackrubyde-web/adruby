import {
  ok,
  badRequest,
  serverError,
  methodNotAllowed,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { fetchGraph, postGraph, resolveMetaAccessToken } from "./_shared/meta.js";
import { supabaseAdmin } from "./_shared/clients.js";

const ACTIONS = new Set([
  "pause",
  "resume",
  "duplicate",
  "increase",
  "decrease",
  "delete",
  "kill",
  "activate",
]);

function normalizeAction(action) {
  const value = String(action || "").toLowerCase();
  if (!ACTIONS.has(value)) return null;
  if (value === "kill") return "pause";
  if (value === "activate") return "resume";
  return value;
}

function normalizeScale(raw, action) {
  const fallback = action === "increase" ? 0.5 : 0.3;
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  const pct = n > 1 ? n / 100 : n;
  return Math.min(Math.max(pct, 0.01), 2);
}

function pickBudgetField(payload) {
  const daily = Number(payload?.daily_budget || 0);
  if (Number.isFinite(daily) && daily > 0) {
    return { field: "daily_budget", value: daily };
  }
  const lifetime = Number(payload?.lifetime_budget || 0);
  if (Number.isFinite(lifetime) && lifetime > 0) {
    return { field: "lifetime_budget", value: lifetime };
  }
  return null;
}

function isNumericId(value) {
  return typeof value === "string" && /^\d+$/.test(value);
}

function normalizeMetaError(err) {
  const code = err?.data?.error?.code;
  if (code === 190) {
    return "Meta Verbindung abgelaufen. Bitte neu verbinden.";
  }
  if (code === 10 || code === 200) {
    return "Fehlende Meta Berechtigung. Bitte Admin-Zugriff prüfen.";
  }
  if (code === 100) {
    return "Ungültige Meta Kampagnen-ID.";
  }
  return null;
}

async function withRetries(fn, { retries = 2, baseDelayMs = 300 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}

async function logMetaAction(payload) {
  try {
    await supabaseAdmin.from("meta_action_logs").insert(payload);
  } catch (err) {
    console.warn("[Meta] Failed to log action", err?.message || err);
  }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const entitlement = await requireActiveSubscription(userId);
  if (!entitlement.ok) return entitlement.response;

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const campaignId = String(body.campaignId || "").trim();
  const action = normalizeAction(body.action);
  if (!campaignId) return badRequest("Missing campaignId");
  if (!action) return badRequest("Unsupported action");
  if (!isNumericId(campaignId)) {
    return badRequest("Kampagne ist nicht mit Meta verknüpft. Bitte Sync starten.");
  }

  try {
    const { token } = await resolveMetaAccessToken(userId);
    if (!token) {
      return badRequest("Meta access token not available. Connect Meta first.");
    }

    if (action === "pause" || action === "resume" || action === "delete") {
      const status =
        action === "pause" ? "PAUSED" : action === "resume" ? "ACTIVE" : "DELETED";
      const response = await withRetries(() =>
        postGraph(`/${campaignId}`, token, { status })
      );
      await supabaseAdmin
        .from("meta_campaigns")
        .update({ status })
        .eq("user_id", userId)
        .eq("facebook_campaign_id", campaignId);
      await logMetaAction({
        user_id: userId,
        campaign_id: campaignId,
        action,
        params: { status },
        response,
        success: true,
      });
      return ok({
        ok: true,
        action,
        campaignId,
        resultId: response?.id || null,
        success: response?.success ?? true,
      });
    }

    if (action === "duplicate") {
      const response = await withRetries(() =>
        postGraph(`/${campaignId}/copies`, token, {
          deep_copy: true,
          status_option: "PAUSED",
        })
      );
      await logMetaAction({
        user_id: userId,
        campaign_id: campaignId,
        action,
        params: { deep_copy: true, status_option: "PAUSED" },
        response,
        success: true,
      });
      return ok({
        ok: true,
        action,
        campaignId,
        resultId: response?.id || null,
        success: response?.success ?? true,
      });
    }

    if (action === "increase" || action === "decrease") {
      const campaign = await withRetries(() =>
        fetchGraph(`/${campaignId}`, token, {
          fields: "daily_budget,lifetime_budget",
        })
      );
      const budget = pickBudgetField(campaign);
      if (!budget) {
        return badRequest("Campaign budget not found or not editable.");
      }
      const scale = normalizeScale(body.scalePct, action);
      const direction = action === "increase" ? 1 : -1;
      const next = Math.max(1, Math.round(budget.value * (1 + direction * scale)));

      const response = await withRetries(() =>
        postGraph(`/${campaignId}`, token, {
          [budget.field]: next,
        })
      );
      await logMetaAction({
        user_id: userId,
        campaign_id: campaignId,
        action,
        params: { budget_field: budget.field, scale, previous: budget.value, next },
        response,
        success: true,
      });

      return ok({
        ok: true,
        action,
        campaignId,
        budgetField: budget.field,
        previous: budget.value,
        next,
        resultId: response?.id || null,
        success: response?.success ?? true,
      });
    }

    return badRequest("Unsupported action");
  } catch (err) {
    await logMetaAction({
      user_id: userId,
      campaign_id: campaignId,
      action,
      params: { scalePct: body.scalePct ?? null },
      response: err?.data || null,
      success: false,
      error_message: err?.message || "Meta action failed",
    });
    captureException(err, { function: "meta-apply-action" });
    const friendly = normalizeMetaError(err);
    if (friendly) {
      return badRequest(friendly);
    }
    return serverError(err?.message || "Failed to apply Meta action");
  }
}
