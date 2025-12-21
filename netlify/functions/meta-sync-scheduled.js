import { serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { supabaseAdmin } from "./_shared/clients.js";
import {
  fetchGraph,
  formatDate,
  pickPrimaryAdAccount,
  resolveMetaAccessToken,
} from "./_shared/meta.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";

export const schedule = "@daily";

function parseNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function extractActionValue(actions, type) {
  if (!Array.isArray(actions)) return 0;
  const item = actions.find((a) => a.action_type === type);
  return parseNumber(item?.value);
}

async function syncForUser({ userId, preferredAdAccountId, rangeDays }) {
  const { token, connection } = await resolveMetaAccessToken(userId);
  const connectionId = connection?.id || null;
  if (!token) return { ok: false, error: "missing_token" };

  let jobId = null;
  try {
    const { data: job } = await supabaseAdmin
      .from("meta_sync_jobs")
      .insert({
        user_id: userId,
        connection_id: connectionId,
        job_type: "scheduled",
        status: "running",
        meta: { rangeDays },
      })
      .select("id")
      .single();
    jobId = job?.id || null;

    const adAccountsResponse = await fetchGraph("/me/adaccounts", token, {
      fields: "id,account_id,name,account_status",
      limit: "50",
    });

    const adAccounts = adAccountsResponse?.data || [];
    const primaryAccount = pickPrimaryAdAccount(
      adAccounts,
      preferredAdAccountId || connection?.ad_account_id
    );
    const adAccountId = primaryAccount?.id;

    if (!adAccountId) {
      return { ok: false, error: "no_ad_account" };
    }

    const until = new Date();
    const since = new Date();
    since.setDate(until.getDate() - (rangeDays - 1));

    const timeRange = {
      since: formatDate(since),
      until: formatDate(until),
    };

    const insightsResponse = await fetchGraph(`/${adAccountId}/insights`, token, {
      level: "campaign",
      time_range: JSON.stringify(timeRange),
      fields:
        "campaign_id,campaign_name,impressions,clicks,spend,ctr,cpm,frequency,actions,action_values",
      limit: "200",
    });

    const insights = insightsResponse?.data || [];
    const campaigns = insights.map((row) => {
      const impressions = parseNumber(row.impressions);
      const clicks = parseNumber(row.clicks);
      const spend = parseNumber(row.spend);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const frequency = parseNumber(row.frequency || 0);
      const conversions = extractActionValue(row.actions, "purchase");
      const purchaseValue = extractActionValue(row.action_values, "purchase");
      const roas = spend > 0 ? purchaseValue / spend : 0;

      return {
        facebook_campaign_id: row.campaign_id,
        name: row.campaign_name,
        status: "active",
        spend,
        impressions,
        clicks,
        conversions,
        ctr: Number(ctr.toFixed(2)),
        cpm: Number(cpm.toFixed(2)),
        roas: Number(roas.toFixed(2)),
        frequency: Number(frequency.toFixed(2)),
        revenue: purchaseValue,
        raw_payload: row,
      };
    });

    if (campaigns.length) {
      const upsertPayload = campaigns.map((row) => ({
        user_id: userId,
        facebook_campaign_id: row.facebook_campaign_id,
        name: row.name,
        status: row.status,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        ctr: row.ctr,
        cpm: row.cpm,
        roas: row.roas,
        frequency: row.frequency,
        revenue: row.revenue,
        raw_payload: row.raw_payload,
      }));

      const { error: upsertError } = await supabaseAdmin
        .from("meta_campaigns")
        .upsert(upsertPayload, { onConflict: "user_id,facebook_campaign_id" });

      if (upsertError) {
        throw new Error(`Failed to sync campaigns: ${upsertError.message}`);
      }
    }

    const dailyResponse = await fetchGraph(`/${adAccountId}/insights`, token, {
      time_increment: "1",
      time_range: JSON.stringify(timeRange),
      fields:
        "date_start,date_stop,impressions,clicks,spend,ctr,cpm,frequency,actions,action_values",
      limit: "200",
    });

    const dailyRows = (dailyResponse?.data || []).map((row) => {
      const impressions = parseNumber(row.impressions);
      const clicks = parseNumber(row.clicks);
      const spend = parseNumber(row.spend);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const frequency = parseNumber(row.frequency || 0);
      const conversions = extractActionValue(row.actions, "purchase");
      const purchaseValue = extractActionValue(row.action_values, "purchase");
      const roas = spend > 0 ? purchaseValue / spend : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;

      return {
        user_id: userId,
        date: row.date_start,
        impressions,
        clicks,
        spend,
        conversions,
        ctr: Number(ctr.toFixed(2)),
        cpm: Number(cpm.toFixed(2)),
        frequency: Number(frequency.toFixed(2)),
        revenue: purchaseValue,
        roas: Number(roas.toFixed(2)),
        cpa: Number(cpa.toFixed(2)),
        raw_payload: row,
      };
    });

    if (dailyRows.length) {
      const { error: dailyError } = await supabaseAdmin
        .from("meta_insights_daily")
        .upsert(dailyRows, { onConflict: "user_id,date" });

      if (dailyError) {
        throw new Error(`Failed to sync daily insights: ${dailyError.message}`);
      }
    }

    await supabaseAdmin
      .from("facebook_connections")
      .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("provider", "facebook");

    if (jobId) {
      await supabaseAdmin
        .from("meta_sync_jobs")
        .update({ status: "completed", finished_at: new Date().toISOString() })
        .eq("id", jobId);
    }

    return { ok: true, campaigns: campaigns.length, daily: dailyRows.length };
  } catch (err) {
    if (jobId) {
      await supabaseAdmin
        .from("meta_sync_jobs")
        .update({
          status: "failed",
          error_message: err?.message || "Meta sync failed",
          finished_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }
    return { ok: false, error: err?.message || "sync_failed" };
  }
}

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
