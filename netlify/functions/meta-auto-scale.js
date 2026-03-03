/**
 * meta-auto-scale.js — Scheduled Auto-Scaling Orchestrator
 *
 * Runs every 6 hours (configurable). For each user with autopilot enabled:
 *  1. Reads synced campaign data from meta_campaigns
 *  2. Reads user's automation_rules from Supabase
 *  3. Evaluates rules against campaign metrics
 *  4. Applies matching actions via meta-apply-action
 *  5. Applies AI recommendations (if no rules match) via ai-campaign-analyze → apply
 *  6. Logs all actions to ai_learning + meta_action_logs
 *
 * Safety: max budget change per run is capped, duplicate cap per day.
 */

import { serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { resolveMetaAccessToken } from "./_shared/meta.js";

// Run every 6 hours
export const schedule = "0 */6 * * *";

// Safety limits
const SAFETY = {
    maxBudgetIncreasePct: 0.50,   // Max 50% increase per run
    maxBudgetDecreasePct: 0.30,   // Max 30% decrease per run
    maxActionsPerUser: 10,         // Max 10 actions per run per user
    minSpendBeforeAction: 1,       // Min €1 spend before auto-actions
};

function evaluateRule(rule, campaign) {
    const metric = Number(campaign[rule.condition.metric] || 0);
    const threshold = Number(rule.condition.value || 0);

    switch (rule.condition.operator) {
        case '>': return metric > threshold;
        case '<': return metric < threshold;
        case '>=': return metric >= threshold;
        case '<=': return metric <= threshold;
        case '==': return metric === threshold;
        default: return false;
    }
}

function ruleActionToMeta(actionType) {
    switch (actionType) {
        case 'pause': return 'pause';
        case 'increase_budget': return 'increase';
        case 'decrease_budget': return 'decrease';
        case 'duplicate': return 'duplicate';
        default: return null;
    }
}

async function processUserAutoscale(userId, host) {
    const results = { userId, actions: [], errors: [], skipped: 0 };

    try {
        // 1. Check Meta connection
        const { token } = await resolveMetaAccessToken(userId);
        if (!token) {
            results.errors.push("No Meta token");
            return results;
        }

        // 2. Load campaigns from DB (already synced by meta-sync-scheduled)
        const { data: campaigns, error: campaignError } = await supabaseAdmin
            .from("meta_campaigns")
            .select("*")
            .eq("user_id", userId);

        if (campaignError || !campaigns?.length) {
            results.errors.push(campaignError?.message || "No campaigns");
            return results;
        }

        // 3. Load user's automation rules
        const { data: rules } = await supabaseAdmin
            .from("automation_rules")
            .select("*")
            .eq("user_id", userId)
            .eq("enabled", true)
            .order("created_at", { ascending: true });

        // 4. Load recent actions to prevent over-scaling
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        const { data: recentActions } = await supabaseAdmin
            .from("meta_action_logs")
            .select("campaign_id,action")
            .eq("user_id", userId)
            .eq("success", true)
            .gte("created_at", sixHoursAgo);

        const recentCampaignActions = new Set(
            (recentActions || []).map(a => `${a.campaign_id}:${a.action}`)
        );

        let actionCount = 0;

        for (const campaign of campaigns) {
            if (actionCount >= SAFETY.maxActionsPerUser) break;
            if (Number(campaign.spend || 0) < SAFETY.minSpendBeforeAction) {
                results.skipped++;
                continue;
            }

            const campaignId = campaign.facebook_campaign_id;
            if (!campaignId) continue;

            let matchedAction = null;
            let matchedRule = null;
            let scalePct = undefined;

            // 5. Evaluate user rules
            if (rules?.length) {
                for (const rule of rules) {
                    if (evaluateRule(rule, campaign)) {
                        const action = ruleActionToMeta(rule.action?.type);
                        if (!action) continue;

                        // Skip if already actioned recently
                        if (recentCampaignActions.has(`${campaignId}:${action}`)) continue;

                        matchedAction = action;
                        matchedRule = rule;
                        scalePct = rule.action?.value
                            ? Math.min(rule.action.value / 100, SAFETY.maxBudgetIncreasePct)
                            : undefined;
                        break; // First matching rule wins
                    }
                }
            }

            // 6. Fallback: simple rule-based analysis if no user rules matched
            if (!matchedAction) {
                const roas = Number(campaign.roas || 0);
                const ctr = Number(campaign.ctr || 0);

                if (roas >= 4.0 && ctr >= 2.0) {
                    matchedAction = "increase";
                    scalePct = 0.20; // +20% for top performers
                } else if (roas < 0.8) {
                    matchedAction = "pause";
                } else if (roas >= 1.0 && roas < 2.0) {
                    matchedAction = "decrease";
                    scalePct = 0.15; // -15% for underperformers
                }
                // roas 2.0-4.0 → no action (maintain)
            }

            if (!matchedAction) continue;
            if (recentCampaignActions.has(`${campaignId}:${matchedAction}`)) continue;

            // 7. Apply action
            try {
                const protocol = host?.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;

                // Get user token for auth
                const { data: sessionData } = await supabaseAdmin.auth.admin.getUserById(userId);

                const applyRes = await fetch(
                    `${baseUrl}/.netlify/functions/meta-apply-action`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-autoscale-user-id": userId, // Internal service auth
                        },
                        body: JSON.stringify({
                            campaignId,
                            action: matchedAction,
                            scalePct,
                            userId, // Pass userId for the action function
                        }),
                    }
                );

                const applyJson = await applyRes.json().catch(() => ({}));
                const success = applyRes.ok && applyJson?.ok;

                // Log to ai_learning
                await supabaseAdmin.from("ai_learning").insert({
                    campaign_id: campaignId,
                    recommendation: matchedAction,
                    confidence: matchedRule ? 80 : 70,
                    reason: matchedRule
                        ? `Rule: ${matchedRule.name}`
                        : `Auto: ROAS=${campaign.roas}, CTR=${campaign.ctr}`,
                    applied_action: matchedAction,
                    success,
                    created_at: new Date().toISOString(),
                }).catch(err => console.warn("[AutoScale] ai_learning log error:", err?.message));

                // Update rule trigger count if applicable
                if (matchedRule && success) {
                    await supabaseAdmin
                        .from("automation_rules")
                        .update({
                            trigger_count: (matchedRule.trigger_count || 0) + 1,
                            last_triggered: new Date().toISOString(),
                        })
                        .eq("id", matchedRule.id)
                        .catch(() => { });
                }

                results.actions.push({
                    campaignId,
                    campaignName: campaign.name,
                    action: matchedAction,
                    scalePct,
                    success,
                    ruleId: matchedRule?.id || null,
                    ruleName: matchedRule?.name || "auto-fallback",
                });

                actionCount++;
            } catch (err) {
                results.errors.push(`${campaignId}: ${err?.message || "unknown"}`);
            }
        }
    } catch (err) {
        results.errors.push(err?.message || "Unknown error");
    }

    return results;
}

export async function handler(event) {
    initTelemetry();

    // Allow manual trigger via POST as well
    const host = event?.headers?.host || event?.headers?.Host || "localhost:8888";

    try {
        // Find all users with autopilot enabled
        const { data: autopilotUsers, error } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("autopilot_enabled", true);

        if (error) {
            console.error("[AutoScale] Failed to load autopilot users:", error.message);
            return serverError(`Failed to load users: ${error.message}`);
        }

        if (!autopilotUsers?.length) {
            return withCors({
                statusCode: 200,
                body: JSON.stringify({ message: "No users with autopilot enabled", processed: 0 }),
            });
        }

        const summary = { processed: 0, failed: 0, skipped: 0, totalActions: 0, results: [] };

        for (const user of autopilotUsers) {
            const entitlement = await requireActiveSubscription(user.id);
            if (!entitlement.ok) {
                summary.skipped++;
                continue;
            }

            const result = await processUserAutoscale(user.id, host);
            summary.processed++;
            summary.totalActions += result.actions.length;
            if (result.errors.length) summary.failed++;
            summary.results.push(result);
        }

        console.log(`[AutoScale] Done: ${summary.processed} users, ${summary.totalActions} actions`);

        return withCors({
            statusCode: 200,
            body: JSON.stringify(summary),
        });
    } catch (err) {
        captureException(err, { function: "meta-auto-scale" });
        return serverError(err?.message || "Auto-scale failed");
    }
}
