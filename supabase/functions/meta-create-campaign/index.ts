import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

// ==========================================
// HELPERS
// ==========================================

async function postGraph(path: string, accessToken: string, params: Record<string, any> = {}) {
    const url = new URL(`${GRAPH_API_BASE}${path}`);
    const body = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            body.set(key, String(value));
        }
    });
    body.set("access_token", accessToken);

    const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(json?.error?.message || "Meta API request failed");
    }
    return json;
}

function mapObjective(objective: string) {
    const map: Record<string, string> = {
        CONVERSIONS: "OUTCOME_SALES",
        TRAFFIC: "OUTCOME_TRAFFIC",
        AWARENESS: "OUTCOME_AWARENESS",
        ENGAGEMENT: "OUTCOME_ENGAGEMENT",
        LEADS: "OUTCOME_LEADS",
        APP_INSTALLS: "OUTCOME_APP_PROMOTION",
    };
    return map[objective] || "OUTCOME_SALES";
}

function mapOptimizationGoal(goal: string) {
    const map: Record<string, string> = {
        CONVERSIONS: "OFFSITE_CONVERSIONS",
        LINK_CLICKS: "LINK_CLICKS",
        IMPRESSIONS: "IMPRESSIONS",
        REACH: "REACH",
        LANDING_PAGE_VIEWS: "LANDING_PAGE_VIEWS",
    };
    return map[goal] || "OFFSITE_CONVERSIONS";
}

function mapCTA(cta: string) {
    const map: Record<string, string> = {
        "Learn More": "LEARN_MORE",
        "Shop Now": "SHOP_NOW",
        "Sign Up": "SIGN_UP",
        "Get Offer": "GET_OFFER",
        "Book Now": "BOOK_NOW",
        "Contact Us": "CONTACT_US",
    };
    return map[cta] || "LEARN_MORE";
}

function buildTargeting(targeting: any) {
    if (!targeting) return JSON.stringify({ geo_locations: { countries: ["DE"] }, age_min: 18, age_max: 65 });

    const result: any = {
        geo_locations: { countries: targeting.locations?.length > 0 ? targeting.locations : ["DE"] },
        age_min: targeting.ageMin || 18,
        age_max: targeting.ageMax || 65,
    };

    if (targeting.gender === "male") result.genders = [1];
    else if (targeting.gender === "female") result.genders = [2];

    if (targeting.interests?.length > 0) {
        result.flexible_spec = [{
            interests: targeting.interests.map((i: string) => ({ name: i, id: "0" })) // Mock ID for preview, real ID needs lookup
        }];
    }

    if (targeting.placements?.length > 0) {
        result.publisher_platforms = targeting.placements.includes("facebook") ? ["facebook"] : [];
        if (targeting.placements.some((p: string) => ["instagram", "stories", "reels"].includes(p))) {
            result.publisher_platforms.push("instagram");
        }
    }

    return JSON.stringify(result);
}

// ==========================================
// MAIN HANDLER
// ==========================================

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // 1. AUTH CHECK
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Auth Header');

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        const { mode = 'create', adAccountId, campaign, adSets } = await req.json();

        if (!campaign) throw new Error("Missing campaign data");

        // PREVIEW MODE
        if (mode === 'preview') {
            const previewPayload = {
                campaign: {
                    name: campaign.name,
                    objective: mapObjective(campaign.objective),
                    status: 'PAUSED',
                    buying_type: 'AUCTION'
                },
                adSets: (adSets || []).map((adSet: any) => ({
                    name: adSet.name,
                    optimization_goal: mapOptimizationGoal(adSet.optimizationGoal),
                    targeting: JSON.parse(buildTargeting(adSet.targeting)),
                    ads: (adSet.ads || []).map((ad: any) => ({
                        name: ad.name,
                        creative: {
                            title: ad.headline,
                            body: ad.primaryText,
                            cta: mapCTA(ad.cta)
                        }
                    }))
                }))
            };

            return new Response(JSON.stringify({
                success: true,
                preview: previewPayload,
                message: "Preview generated. Ready to push to Meta."
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // CREATE MODE (REAL EXECUTION)

        // 1. Get Meta Token
        const { data: connection } = await supabase
            .from("facebook_connections")
            .select("access_token, ad_accounts, page_id, page_name")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();

        if (!connection || !connection.access_token) {
            throw new Error("No active Meta connection found.");
        }

        const token = connection.access_token;
        const pageId = connection.page_id;

        if (!pageId) {
            throw new Error("No Page ID found in connection. Please reconnect Facebook.");
        }

        // 2. Resolve Ad Account
        let actId = adAccountId;
        if (!actId && connection.ad_accounts) {
            const accounts = JSON.parse(connection.ad_accounts);
            actId = accounts[0]?.id;
        }
        if (!actId) throw new Error("No Ad Account found.");
        if (!actId.startsWith('act_')) actId = `act_${actId}`;

        // 3. Create Campaign
        const campaignParams: any = {
            name: campaign.name || "AdRuby Campaign",
            objective: mapObjective(campaign.objective),
            status: "PAUSED",
            special_ad_categories: "[]",
        };

        if (campaign.budgetType === "daily" && campaign.dailyBudget) {
            campaignParams.daily_budget = Math.round(campaign.dailyBudget * 100);
        }

        console.log(`Creating Campaign on ${actId}...`);
        const campResult = await postGraph(`/${actId}/campaigns`, token, campaignParams);
        const campaignId = campResult.id;

        const createdAdSets = [];
        const createdAds = [];

        // 4. Create Ad Sets & Ads
        for (const adSet of (adSets || [])) {
            const adSetParams: any = {
                campaign_id: campaignId,
                name: adSet.name || "Ad Set",
                status: "PAUSED",
                optimization_goal: mapOptimizationGoal(adSet.optimizationGoal),
                billing_event: "IMPRESSIONS",
                targeting: buildTargeting(adSet.targeting),
            };

            // Simple budget fallback
            if (!campaign.dailyBudget) adSetParams.daily_budget = 500;

            const asResult = await postGraph(`/${actId}/adsets`, token, adSetParams);
            const adSetId = asResult.id;
            createdAdSets.push(adSetId);

            for (const ad of (adSet.ads || [])) {
                // Creative
                let imageHash = null;

                // 4a. Upload Image if available
                if (ad.imageUrl) {
                    try {
                        console.log(`Fetching image from ${ad.imageUrl}...`);
                        const imgRes = await fetch(ad.imageUrl);
                        if (imgRes.ok) {
                            const blob = await imgRes.blob();
                            const formData = new FormData();
                            formData.append("access_token", token);
                            formData.append("filename", ad.creativeId || "ad_image.jpg");
                            formData.append("file", blob);

                            // Helper for multipart upload since postGraph is url-encoded
                            const uploadRes = await fetch(`${GRAPH_API_BASE}/${actId}/adimages`, {
                                method: 'POST',
                                body: formData
                            });

                            const uploadJson = await uploadRes.json();
                            if (uploadJson.images && uploadJson.images[ad.creativeId || "ad_image.jpg"]) {
                                imageHash = uploadJson.images[ad.creativeId || "ad_image.jpg"].hash;
                                console.log(`Image uploaded! Hash: ${imageHash}`);
                            } else {
                                console.warn("Image upload response invalid:", uploadJson);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to upload image:", err);
                    }
                }

                const linkData: any = {
                    message: ad.primaryText || "",
                    name: ad.headline || "",
                    link: ad.destinationUrl || "https://example.com",
                    call_to_action: {
                        type: mapCTA(ad.cta),
                        value: { link: ad.destinationUrl || "https://example.com" },
                    },
                };

                if (imageHash) {
                    linkData.image_hash = imageHash;
                }

                const creativeParams = {
                    name: `${ad.name} Creative`,
                    object_story_spec: JSON.stringify({
                        page_id: pageId,
                        link_data: linkData,
                    }),
                };

                const crResult = await postGraph(`/${actId}/adcreatives`, token, creativeParams);
                const creativeId = crResult.id;

                // Ad
                const adParams = {
                    name: ad.name,
                    adset_id: adSetId,
                    creative: JSON.stringify({ creative_id: creativeId }),
                    status: "PAUSED"
                };
                const adResult = await postGraph(`/${actId}/ads`, token, adParams);
                createdAds.push(adResult.id);
            }
        }

        // 5. Log & Return
        await supabase.from("meta_campaigns").upsert({
            user_id: user.id,
            facebook_campaign_id: campaignId,
            name: campaign.name,
            status: "PAUSED",
            objective: campaign.objective,
        }, { onConflict: "facebook_campaign_id" });

        return new Response(JSON.stringify({
            success: true,
            campaignId,
            adSets: createdAdSets,
            ads: createdAds,
            message: "Campaign successfully created on Meta!"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
