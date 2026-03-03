import {
  badRequest,
  ok,
  serverError,
  methodNotAllowed,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { syncForUser } from "./_shared/syncEngine.js";

function parseRangeDays(range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 30;
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

  const range = body.range || "30d";
  const days = parseRangeDays(range);

  try {
    const result = await syncForUser({
      userId,
      preferredAdAccountId: body.adAccountId,
      rangeDays: days,
      jobType: "full",
    });

    if (!result.ok) {
      if (result.error === "missing_token") {
        return badRequest("Meta access token not available. Connect Meta first.");
      }
      if (result.error === "no_ad_account") {
        return badRequest("No Meta ad account found for this connection.");
      }
      return serverError(result.error || "Meta sync failed");
    }

    return ok({
      ok: true,
      campaigns: result.campaigns,
      daily: result.daily,
      ad_account_id: result.ad_account_id,
      time_range: result.time_range,
      job_id: result.job_id,
    });
  } catch (err) {
    captureException(err, { function: "meta-sync" });
    return serverError(err?.message || "Meta sync failed");
  }
}
