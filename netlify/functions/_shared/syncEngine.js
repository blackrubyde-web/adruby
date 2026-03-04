/**
 * Shared Meta Sync Engine
 *
 * Core logic for syncing Meta campaign data and daily insights.
 * Used by both meta-sync.js (user-triggered) and meta-sync-scheduled.js (cron).
 */

import { supabaseAdmin } from "./clients.js";
import {
    fetchGraph,
    formatDate,
    pickPrimaryAdAccount,
    resolveMetaAccessToken,
} from "./meta.js";

export function parseNumber(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
}

export function extractActionValue(actions, type) {
    if (!Array.isArray(actions)) return 0;
    const item = actions.find((a) => a.action_type === type);
    return parseNumber(item?.value);
}

/**
 * Syncs campaign insights and daily data for a single user.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.preferredAdAccountId]
 * @param {number} params.rangeDays
 * @param {string} [params.jobType] - "full" | "scheduled"
 * @returns {{ ok: boolean, campaigns?: number, daily?: number, error?: string }}
 */
export async function syncForUser({ userId, preferredAdAccountId, rangeDays, jobType = "full" }) {
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
                job_type: jobType,
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

        // === Fetch campaign-level insights ===
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

        // === Fetch daily insights ===
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

        // === Fetch ad set level insights ===
        let adSetsCount = 0;
        try {
            const adSetResponse = await fetchGraph(`/${adAccountId}/insights`, token, {
                level: "adset",
                time_range: JSON.stringify(timeRange),
                fields:
                    "adset_id,adset_name,campaign_id,campaign_name,impressions,clicks,spend,ctr,cpm,frequency,actions,action_values",
                limit: "500",
            });

            const adSets = (adSetResponse?.data || []).map((row) => {
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
                    user_id: userId,
                    facebook_adset_id: row.adset_id,
                    facebook_campaign_id: row.campaign_id,
                    name: row.adset_name,
                    campaign_name: row.campaign_name,
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
                };
            });

            if (adSets.length) {
                const { error: adSetError } = await supabaseAdmin
                    .from("meta_adsets")
                    .upsert(adSets, { onConflict: "user_id,facebook_adset_id" });

                if (adSetError) {
                    console.warn(`[SyncEngine] Ad set sync warning: ${adSetError.message}`);
                } else {
                    adSetsCount = adSets.length;
                }
            }
        } catch (adSetErr) {
            console.warn("[SyncEngine] Ad set level fetch failed (non-blocking):", adSetErr?.message);
        }

        // Update last sync timestamp
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

        return { ok: true, campaigns: campaigns.length, daily: dailyRows.length, adSets: adSetsCount, ad_account_id: adAccountId, time_range: timeRange, job_id: jobId };
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
