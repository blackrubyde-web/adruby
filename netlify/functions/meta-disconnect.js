import { ok, serverError, methodNotAllowed, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  try {
    const { data: connection } = await supabaseAdmin
      .from("facebook_connections")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "facebook")
      .maybeSingle();

    if (connection?.id) {
      await supabaseAdmin
        .from("meta_tokens")
        .delete()
        .eq("connection_id", connection.id);
    }

    const { error } = await supabaseAdmin
      .from("facebook_connections")
      .update({
        is_active: false,
        access_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "facebook");

    if (error) {
      return serverError(`Failed to disconnect Meta: ${error.message}`);
    }

    return ok({ connected: false });
  } catch (err) {
    captureException(err, { function: "meta-disconnect" });
    return serverError(err?.message || "Meta disconnect failed");
  }
}
