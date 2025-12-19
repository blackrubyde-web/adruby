import crypto from "crypto";
import { ok, serverError, methodNotAllowed, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signState(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function getRedirectUrl() {
  const base =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.FRONTEND_URL ||
    "";
  const fallback = base ? `${base}/.netlify/functions/meta-auth-callback` : "";
  return process.env.META_OAUTH_REDIRECT_URL || fallback;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "GET") return methodNotAllowed("GET,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUrl = getRedirectUrl();

  if (!appId || !appSecret || !redirectUrl) {
    return serverError("Meta OAuth not configured");
  }

  try {
    const payload = base64Url(
      JSON.stringify({
        userId: auth.userId,
        ts: Date.now(),
        nonce: crypto.randomUUID(),
      })
    );
    const signature = signState(payload, appSecret);
    const state = `${payload}.${signature}`;

    const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUrl);
    url.searchParams.set("state", state);
    url.searchParams.set(
      "scope",
      [
        "ads_read",
        "ads_management",
        "read_insights",
        "business_management",
        "pages_show_list",
      ].join(",")
    );
    url.searchParams.set("response_type", "code");

    return ok({ url: url.toString() });
  } catch (err) {
    captureException(err, { function: "meta-auth-url" });
    return serverError(err?.message || "Failed to build Meta OAuth URL");
  }
}
