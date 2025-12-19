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
      .from("meta_campaigns")
      .select(
        "id,facebook_campaign_id,name,status,spend,impressions,clicks,conversions,ctr,roas,revenue,strategy_id"
      )
      .eq("user_id", userId)
      .order("spend", { ascending: false })
      .limit(50);

    if (error) {
      return serverError(`Failed to load campaigns: ${error.message}`);
    }

    const rows = (data || []).map((row) => ({
      id: row.facebook_campaign_id || row.id,
      name: row.name,
      status: row.status || "active",
      strategyId: row.strategy_id || null,
      spend: Number(row.spend || 0),
      revenue: Number(row.revenue || 0),
      roas: Number(row.roas || 0),
      ctr: Number(row.ctr || 0),
      conversions: Number(row.conversions || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    return ok({ campaigns: rows });
  } catch (err) {
    captureException(err, { function: "meta-campaigns" });
    return serverError(err?.message || "Failed to load campaigns");
  }
}
