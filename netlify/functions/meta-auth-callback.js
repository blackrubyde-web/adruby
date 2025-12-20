import crypto from "crypto";
import { supabaseAdmin } from "./_shared/clients.js";
import { fetchGraph, pickPrimaryAdAccount } from "./_shared/meta.js";

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + padding, "base64").toString("utf8");
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

function redirectResponse(url) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      "Cache-Control": "no-store",
    },
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error?.error_user_msg ||
      "Meta OAuth request failed";
    const err = new Error(msg);
    err.data = json;
    throw err;
  }
  return json;
}

export async function handler(event) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || "/";

  if (!appId || !appSecret) {
    return redirectResponse(
      `${frontendUrl}/settings?tab=integrations&meta_error=${encodeURIComponent("Meta OAuth not configured")}`
    );
  }

  const params = event.queryStringParameters || {};
  const code = params.code;
  const state = params.state;
  const error = params.error || params.error_description;

  if (error) {
    return redirectResponse(
      `${frontendUrl}/settings?tab=integrations&meta_error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return redirectResponse(
      `${frontendUrl}/settings?tab=integrations&meta_error=${encodeURIComponent("Missing OAuth code")}`
    );
  }

  try {
    const [payload, signature] = state.split(".");
    if (!payload || !signature) {
      throw new Error("Invalid OAuth state");
    }

    const expected = signState(payload, appSecret);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new Error("Invalid OAuth state signature");
    }

    const decoded = JSON.parse(base64UrlDecode(payload));
    const userId = decoded?.userId;
    if (!userId) throw new Error("Invalid OAuth state payload");

    const redirectUrl = getRedirectUrl();
    if (!redirectUrl) throw new Error("Missing redirect URL");

    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUrl);
    tokenUrl.searchParams.set("code", code);

    const shortToken = await fetchJson(tokenUrl.toString());
    let accessToken = shortToken.access_token;
    let expiresIn = Number(shortToken.expires_in || 0);

    if (accessToken) {
      const longUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
      longUrl.searchParams.set("grant_type", "fb_exchange_token");
      longUrl.searchParams.set("client_id", appId);
      longUrl.searchParams.set("client_secret", appSecret);
      longUrl.searchParams.set("fb_exchange_token", accessToken);
      const longToken = await fetchJson(longUrl.toString());
      accessToken = longToken.access_token || accessToken;
      const longExpires = Number(longToken.expires_in || 0);
      if (longExpires) {
        expiresIn = longExpires;
      }
    }

    if (!accessToken) throw new Error("Meta access token missing");
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const me = await fetchGraph("/me", accessToken, { fields: "id,name,picture" });
    const adAccountsResponse = await fetchGraph("/me/adaccounts", accessToken, {
      fields: "id,account_id,name,account_status",
      limit: "50",
    });
    const adAccounts = adAccountsResponse?.data || [];
    const primaryAccount = pickPrimaryAdAccount(adAccounts, null);

    const payloadToSave = {
      user_id: userId,
      provider: "facebook",
      facebook_user_id: me?.id || null,
      access_token: null,
      profile_picture: me?.picture?.data?.url || null,
      full_name: me?.name || null,
      ad_account_id: primaryAccount?.id || null,
      meta: {
        ad_accounts: adAccounts,
        selected_account: primaryAccount || null,
        app_id: appId,
      },
      is_active: true,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: connection, error: upsertError } = await supabaseAdmin
      .from("facebook_connections")
      .upsert(payloadToSave, { onConflict: "user_id,provider" })
      .select("id,user_id")
      .single();

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    if (!connection?.id) {
      throw new Error("Failed to resolve Meta connection");
    }

    const { error: tokenUpsertError } = await supabaseAdmin
      .from("meta_tokens")
      .upsert(
        {
          connection_id: connection.id,
          user_id: connection.user_id,
          access_token: accessToken,
          token_expires_at: tokenExpiresAt,
          scopes: null,
        },
        { onConflict: "connection_id" }
      );

    if (tokenUpsertError) {
      throw new Error(tokenUpsertError.message);
    }

    return redirectResponse(
      `${frontendUrl}/settings?tab=integrations&meta=connected&meta_ts=${Date.now()}`
    );
  } catch (err) {
    return redirectResponse(
      `${frontendUrl}/settings?tab=integrations&meta_error=${encodeURIComponent(err?.message || "Meta OAuth failed")}`
    );
  }
}
