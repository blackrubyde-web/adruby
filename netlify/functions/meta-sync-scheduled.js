import { serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { syncForUser } from "./_shared/syncEngine.js";

export const schedule = "0 */6 * * *";

export async function handler() {
  initTelemetry();

  try {
    const { data: connections, error } = await supabaseAdmin
      .from("facebook_connections")
      .select("id,user_id,ad_account_id,provider")
      .eq("is_active", true)
      .eq("provider", "facebook");

    if (error) {
      return serverError(`Failed to load connections: ${error.message}`);
    }

    const summary = { processed: 0, failed: 0, skipped: 0, results: [] };
    for (const connection of connections || []) {
      const userId = connection.user_id;
      if (!userId) {
        summary.skipped += 1;
        continue;
      }

      const entitlement = await requireActiveSubscription(userId);
      if (!entitlement.ok) {
        summary.skipped += 1;
        continue;
      }

      const result = await syncForUser({
        userId,
        preferredAdAccountId: connection.ad_account_id,
        rangeDays: 7,
        jobType: "scheduled",
      });

      summary.processed += 1;
      if (!result.ok) {
        summary.failed += 1;
      }
      summary.results.push({ userId, ...result });
    }

    return withCors({ statusCode: 200, body: JSON.stringify(summary) });
  } catch (err) {
    captureException(err, { function: "meta-sync-scheduled" });
    return serverError(err?.message || "Scheduled sync failed");
  }
}
