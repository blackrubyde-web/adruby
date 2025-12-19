import { ok, serverError, methodNotAllowed, withCors } from "./utils/response.js";
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

  try {
    const { data, error } = await supabaseAdmin
      .from("facebook_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return serverError(`Failed to load Meta connection: ${error.message}`);
    }

    if (!data) {
      return ok({ connected: false, connection: null });
    }

    return ok({
      connected: true,
      connection: {
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
      },
    });
  } catch (err) {
    captureException(err, { function: "meta-status" });
    return serverError(err?.message || "Meta status failed");
  }
}
