import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const payload = await req.json();
        const {
            name,
            status,
            daily_budget,
            objective,
            ad_sets = []
        } = payload;

        // 1. "Simulate" Meta API Create Call (which would return an ID)
        const mockMetaCampaignId = `meta_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const mockMetaAdSetId = `adset_${Date.now()}`;

        // 2. Insert into meta_campaigns to reflect in Dashboard
        const { data: campaign, error: campError } = await supabaseClient
            .from("meta_campaigns")
            .insert({
                name: name,
                status: status === 'ACTIVE' ? 'active' : 'paused',
                objective: objective,
                daily_budget: daily_budget ? daily_budget / 100 : 0, // Convert back to currency units
                spend: 0,
                revenue: 0,
                roas: 0,
                unique_id: mockMetaCampaignId,
                // Mock performance data for visual completeness
                impressions: 0,
                clicks: 0,
                conversions: 0,
                ctr: 0,
                cpc: 0
            })
            .select()
            .single();

        if (campError) throw campError;

        // 3. Insert Ad Sets (Optional: simplistic mock)
        // Real implementation would handle ad sets and ads relations if those tables exist
        // For now, we just ensure the campaign exists

        return new Response(JSON.stringify({
            success: true,
            campaign_id: campaign.id,
            meta_id: mockMetaCampaignId,
            message: "Campaign simulated and created in database"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
