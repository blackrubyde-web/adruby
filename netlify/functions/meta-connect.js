import { badRequest, ok, serverError, methodNotAllowed, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { fetchGraph, pickPrimaryAdAccount } from "./_shared/meta.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const accessToken = body.accessToken || process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    return badRequest("Missing Meta access token");
  }

  try {
    const me = await fetchGraph("/me", accessToken, {
      fields: "id,name,picture",
    });

    const adAccountsResponse = await fetchGraph("/me/adaccounts", accessToken, {
      fields: "id,account_id,name,account_status",
      limit: "50",
    });
    const adAccounts = adAccountsResponse?.data || [];
    const primaryAccount = pickPrimaryAdAccount(adAccounts, body.adAccountId);

    const payload = {
      user_id: userId,
      provider: "facebook",
      facebook_user_id: me?.id || null,
      access_token: null,
      profile_picture: me?.picture?.data?.url || null,
      full_name: me?.name || null,
      ad_account_id: primaryAccount?.id || null,
      page_id: body.pageId || null,
      meta: {
        ad_accounts: adAccounts,
        selected_account: primaryAccount || null,
        app_id: process.env.META_APP_ID || null,
      },
      is_active: true,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("facebook_connections")
      .upsert(payload, { onConflict: "user_id,provider" })
      .select()
      .single();

    if (error) {
      return serverError(`Failed to save Meta connection: ${error.message}`);
    }

    const { error: tokenError } = await supabaseAdmin
      .from("meta_tokens")
      .upsert(
        {
          connection_id: data.id,
          user_id: data.user_id,
          access_token: accessToken,
          token_expires_at: null,
          scopes: null,
        },
        { onConflict: "connection_id" }
      );

    if (tokenError) {
      return serverError(`Failed to save Meta token: ${tokenError.message}`);
    }

    const safe = {
      id: data.id,
      user_id: data.user_id,
      facebook_user_id: data.facebook_user_id,
      full_name: data.full_name,
      profile_picture: data.profile_picture,
      ad_account_id: data.ad_account_id,
      page_id: data.page_id,
      is_active: data.is_active,
      connected_at: data.connected_at,
      last_sync_at: data.last_sync_at,
      meta: data.meta || null,
    };

    return ok({ connected: true, connection: safe });
  } catch (err) {
    captureException(err, { function: "meta-connect" });
    return serverError(err?.message || "Meta connect failed");
  }
}
