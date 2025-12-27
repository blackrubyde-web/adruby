import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Expert Logic Helper Functions */
const RULES = {
    MIN_IMPRESSIONS_LEARNING: 500,
    FATIGUE_FREQUENCY_THRESHOLD: 2.2,
    FATIGUE_CTR_DROP_THRESHOLD: 0.8,
};

function getDynamicRules(riskTolerance: 'low' | 'medium' | 'high' = 'medium') {
    switch (riskTolerance) {
        case 'high': // Aggressive
            return {
                SURF_ROAS_MULTIPLIER: 1.1, // Scale easier (1.1x Target)
                SOFT_KILL_MULTIPLIER: 2.0, // Give more room (2.0x CPA)
            };
        case 'low': // Conservative
            return {
                SURF_ROAS_MULTIPLIER: 1.5, // Scale harder (1.5x Target)
                SOFT_KILL_MULTIPLIER: 1.2, // Kill faster (1.2x CPA)
            };
        default: // Medium/Balanced
            return {
                SURF_ROAS_MULTIPLIER: 1.3,
                SOFT_KILL_MULTIPLIER: 1.5,
            };
    }
}

// @ts-ignore
serve(async (req: any) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabaseClient = createClient(
            // @ts-ignore
            Deno.env.get("SUPABASE_URL") ?? "",
            // @ts-ignore
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Fetch Data
        const { data: assignments } = await supabaseClient
            .from("meta_strategy_assignments")
            .select("entity_id, strategy_id")
            .eq("entity_type", "campaign");
        const assignmentMap = new Map((assignments || []).map((a: any) => [a.entity_id, a.strategy_id]));

        const { data: campaigns } = await supabaseClient
            .from("meta_campaigns")
            .select("*")
            .eq("status", "ACTIVE");

        const { data: strategies } = await supabaseClient.from("strategy_blueprints").select("*");
        const strategyMap = new Map((strategies || []).map((s: any) => [s.id, s]));

        const actionsTaken: any[] = [];

        // 2. Evaluate Expert Rules
        for (const camp of (campaigns || [])) {
            const strategyId = assignmentMap.get(camp.id) || camp.strategy_id;
            if (!strategyId) continue;
            const strategy = strategyMap.get(strategyId);
            // @ts-ignore
            if (!strategy?.autopilot_config?.enabled) continue;

            const config = (strategy as any).autopilot_config;
            const metrics = {
                roas: camp.roas || 0,
                spend: camp.spend || 0,
                ctr: camp.ctr || 0,
                cpa: camp.cpa || (camp.spend / (camp.purchases || 1)), // Fallback
                purchases: camp.purchases || 0,
                impressions: camp.impressions || 0,
                frequency: camp.frequency || 1.0,
                daily_budget: camp.daily_budget || 0
            };

            // 🛡️ Rule 0: Learning Phase Protection
            if (metrics.impressions < 500) { // Using hardcoded value as it's not dynamic
                console.log(`Skipping ${camp.name}: Learning Phase (${metrics.impressions} imps)`);
                continue;
            }

            // 💀 Rule 1: The Soft Kill (Bleeder Detection)
            // Logic: Spent X times Target CPA with 0 Sales? Kill it.
            // Note: We infer Target CPA from Target ROAS if not explicitly set (AOV Assumed 50)
            const assumedAOV = 50;
            const impliedTargetCPA = assumedAOV / config.target_roas;

            const dynamicRules = getDynamicRules(config.risk_tolerance as any);
            const killSpendThreshold = impliedTargetCPA * dynamicRules.SOFT_KILL_MULTIPLIER;

            if (metrics.purchases === 0 && metrics.spend > killSpendThreshold) {
                await executeAction(supabaseClient, camp, 'PAUSE', `SOFT KILL: Spent €${metrics.spend.toFixed(2)} (>${dynamicRules.SOFT_KILL_MULTIPLIER}x CPA) with 0 Sales.`);
                actionsTaken.push({ type: 'SOFT_KILL', campaign: camp.name, reason: 'Zero sales, high spend' });
                continue; // Stop processing this camp
            }

            // 🛑 Rule 2: Hard Stop Loss (ROAS)
            if (metrics.purchases > 0 && metrics.roas < config.pause_threshold_roas) {
                await executeAction(supabaseClient, camp, 'PAUSE', `HARD STOP: ROAS ${metrics.roas.toFixed(2)} < Threshold ${config.pause_threshold_roas}`);
                actionsTaken.push({ type: 'HARD_STOP', campaign: camp.name, reason: 'Low ROAS' });
                continue;
            }

            // 📉 Rule 3: Fatigue Detection
            if (metrics.frequency > 2.2 && metrics.ctr < 0.8) { // Using hardcoded values as they're not dynamic
                // Creative is burnt out. Reduce budget or Pause.
                // Expert Move: Reduce Budget 20% to milk remaining efficiency
                const newBudget = Math.round(metrics.daily_budget * 0.8);
                await executeAction(supabaseClient, camp, 'DECREASE_BUDGET', `FATIGUE: Freq ${metrics.frequency} > 2.2 & Low CTR`, newBudget);
                actionsTaken.push({ type: 'FATIGUE_THROTTLE', campaign: camp.name, reason: 'High Freq + Low CTR' });
                continue;
            }

            // 🏄‍♂️ Rule 4: Surf Scaling (Winners)
            // Logic: Is it crushing the target? Scale it NOW.
            const surfThreshold = config.target_roas * dynamicRules.SURF_ROAS_MULTIPLIER;
            if (metrics.roas > surfThreshold && metrics.spend > (metrics.daily_budget * 0.5)) {
                const increasePct = config.max_budget_increase_pct || 0.2;
                const newBudget = Math.round(metrics.daily_budget * (1 + increasePct));

                // Safety Cap
                if (newBudget <= config.max_daily_budget) {
                    await executeAction(supabaseClient, camp, 'INCREASE_BUDGET', `SURFING: ROAS ${metrics.roas.toFixed(2)} is > ${(dynamicRules.SURF_ROAS_MULTIPLIER - 1) * 100}% above target via "Surf" Strategy.`, newBudget);
                    actionsTaken.push({ type: 'SURF_SCALE', campaign: camp.name, change: `Budget -> ${newBudget}` });
                }
            }
        }

        return new Response(JSON.stringify({ success: true, actions: actionsTaken }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function executeAction(client: any, campaign: any, type: string, reason: string, newVal?: any) {
    // 1. Log
    await client.from('autopilot_activity_log').insert({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        action_type: type,
        reason: reason,
        old_value: type === 'PAUSE' ? 'ACTIVE' : campaign.daily_budget,
        new_value: type === 'PAUSE' ? 'PAUSED' : newVal,
        status: 'applied'
    });

    // 2. Apply (Mock)
    if (type === 'PAUSE') {
        await client.from('meta_campaigns').update({ status: 'PAUSED' }).eq('id', campaign.id);
    } else if (type === 'INCREASE_BUDGET' || type === 'DECREASE_BUDGET') {
        await client.from('meta_campaigns').update({ daily_budget: newVal }).eq('id', campaign.id);
    }
}
