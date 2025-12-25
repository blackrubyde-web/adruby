import {
    ok,
    badRequest,
    serverError,
    methodNotAllowed,
    withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { postGraph, fetchGraph, resolveMetaAccessToken, pickPrimaryAdAccount } from "./_shared/meta.js";
import { supabaseAdmin } from "./_shared/clients.js";

/**
 * Create a full campaign structure in Meta Ads
 * POST body: { adAccountId, campaign, adSets }
 */
export async function handler(event) {
    if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
    if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

    initTelemetry();

    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    const entitlement = await requireActiveSubscription(userId);
    if (!entitlement.ok) return entitlement.response;

    let body = {};
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch {
        return badRequest("Invalid JSON body");
    }

    const { adAccountId, campaign, adSets } = body;

    if (!campaign) {
        return badRequest("Missing campaign data");
    }

    try {
        const { token, connection } = await resolveMetaAccessToken(userId);
        if (!token) {
            return badRequest("Meta nicht verbunden. Bitte zuerst Meta verknüpfen.");
        }

        // Resolve ad account
        let accountId = adAccountId;
        if (!accountId && connection?.ad_accounts) {
            const accounts = JSON.parse(connection.ad_accounts || "[]");
            const primary = pickPrimaryAdAccount(accounts, connection.preferred_ad_account_id);
            accountId = primary?.id;
        }

        if (!accountId) {
            return badRequest("Kein Ad Account gefunden. Bitte in Einstellungen konfigurieren.");
        }

        // Normalize account ID format
        const actId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

        // === 1. CREATE CAMPAIGN ===
        const campaignParams = {
            name: campaign.name || "AdRuby Campaign",
            objective: mapObjective(campaign.objective),
            status: "PAUSED", // Start paused for safety
            special_ad_categories: "[]",
        };

        // Add budget at campaign level if using CBO
        if (campaign.budgetType === "daily" && campaign.dailyBudget) {
            campaignParams.daily_budget = Math.round(campaign.dailyBudget * 100); // Convert to cents
        } else if (campaign.budgetType === "lifetime" && campaign.lifetimeBudget) {
            campaignParams.lifetime_budget = Math.round(campaign.lifetimeBudget * 100);
        }

        if (campaign.bidStrategy) {
            campaignParams.bid_strategy = mapBidStrategy(campaign.bidStrategy);
        }

        console.log("[Meta] Creating campaign:", campaignParams);
        const campaignResult = await postGraph(`/${actId}/campaigns`, token, campaignParams);
        const campaignId = campaignResult.id;

        if (!campaignId) {
            throw new Error("Campaign creation failed - no ID returned");
        }

        const createdAdSets = [];
        const createdAds = [];

        // === 2. CREATE AD SETS ===
        for (const adSet of (adSets || [])) {
            const adSetParams = {
                campaign_id: campaignId,
                name: adSet.name || "AdRuby Ad Set",
                status: "PAUSED",
                optimization_goal: mapOptimizationGoal(adSet.optimizationGoal),
                billing_event: "IMPRESSIONS",
                targeting: buildTargeting(adSet.targeting),
            };

            // Budget at ad set level if not using CBO
            if (!campaign.dailyBudget && !campaign.lifetimeBudget) {
                if (adSet.dailyBudget) {
                    adSetParams.daily_budget = Math.round(adSet.dailyBudget * 100);
                } else {
                    adSetParams.daily_budget = 500; // Default €5/day
                }
            }

            console.log("[Meta] Creating ad set:", adSetParams);
            const adSetResult = await postGraph(`/${actId}/adsets`, token, adSetParams);
            const adSetId = adSetResult.id;

            if (adSetId) {
                createdAdSets.push({ id: adSetId, name: adSet.name });

                // === 3. CREATE ADS ===
                for (const ad of (adSet.ads || [])) {
                    // First create ad creative
                    const creativeParams = {
                        name: `${ad.name || "Ad"} Creative`,
                        object_story_spec: JSON.stringify({
                            page_id: connection?.page_id || process.env.META_PAGE_ID,
                            link_data: {
                                message: ad.primaryText || "",
                                name: ad.headline || "",
                                link: ad.destinationUrl || "https://example.com",
                                call_to_action: {
                                    type: mapCTA(ad.cta),
                                    value: { link: ad.destinationUrl || "https://example.com" },
                                },
                            },
                        }),
                    };

                    // Add image if available
                    if (ad.imageHash) {
                        creativeParams.object_story_spec = JSON.stringify({
                            ...JSON.parse(creativeParams.object_story_spec),
                            link_data: {
                                ...JSON.parse(creativeParams.object_story_spec).link_data,
                                image_hash: ad.imageHash,
                            },
                        });
                    }

                    console.log("[Meta] Creating creative for ad:", ad.name);
                    const creativeResult = await postGraph(`/${actId}/adcreatives`, token, creativeParams);
                    const creativeId = creativeResult.id;

                    if (creativeId) {
                        // Create the ad
                        const adParams = {
                            name: ad.name || "AdRuby Ad",
                            adset_id: adSetId,
                            creative: JSON.stringify({ creative_id: creativeId }),
                            status: "PAUSED",
                        };

                        console.log("[Meta] Creating ad:", adParams);
                        const adResult = await postGraph(`/${actId}/ads`, token, adParams);

                        if (adResult.id) {
                            createdAds.push({ id: adResult.id, name: ad.name });
                        }
                    }
                }
            }
        }

        // Log successful creation
        await supabaseAdmin.from("meta_action_logs").insert({
            user_id: userId,
            campaign_id: campaignId,
            action: "create_campaign",
            params: {
                campaign_name: campaign.name,
                ad_sets_count: createdAdSets.length,
                ads_count: createdAds.length,
            },
            response: { campaignId, createdAdSets, createdAds },
            success: true,
        });

        // Sync the new campaign to local DB
        await supabaseAdmin.from("meta_campaigns").upsert({
            user_id: userId,
            facebook_campaign_id: campaignId,
            name: campaign.name,
            status: "PAUSED",
            objective: campaign.objective,
        }, { onConflict: "facebook_campaign_id" });

        return ok({
            success: true,
            message: `Kampagne "${campaign.name}" erfolgreich erstellt!`,
            campaignId,
            adSets: createdAdSets,
            ads: createdAds,
            note: "Kampagne ist pausiert. Aktiviere sie im Meta Ads Manager wenn bereit.",
        });

    } catch (err) {
        console.error("[Meta] Create campaign error:", err);
        captureException(err, { function: "meta-create-campaign" });

        await supabaseAdmin.from("meta_action_logs").insert({
            user_id: userId,
            campaign_id: null,
            action: "create_campaign",
            params: { campaign_name: campaign?.name },
            response: err?.data || null,
            success: false,
            error_message: err?.message || "Campaign creation failed",
        });

        // Handle specific Meta errors
        const code = err?.data?.error?.code;
        if (code === 190) {
            return badRequest("Meta Verbindung abgelaufen. Bitte neu verbinden.");
        }
        if (code === 10 || code === 200) {
            return badRequest("Fehlende Meta Berechtigung. Bitte Admin-Zugriff prüfen.");
        }
        if (code === 100) {
            return badRequest(`Meta Fehler: ${err?.data?.error?.message || "Ungültige Anfrage"}`);
        }

        return serverError(err?.message || "Kampagne konnte nicht erstellt werden");
    }
}

// Helper functions
function mapObjective(objective) {
    const map = {
        CONVERSIONS: "OUTCOME_SALES",
        TRAFFIC: "OUTCOME_TRAFFIC",
        AWARENESS: "OUTCOME_AWARENESS",
        ENGAGEMENT: "OUTCOME_ENGAGEMENT",
        LEADS: "OUTCOME_LEADS",
        APP_INSTALLS: "OUTCOME_APP_PROMOTION",
    };
    return map[objective] || "OUTCOME_SALES";
}

function mapBidStrategy(strategy) {
    const map = {
        LOWEST_COST: "LOWEST_COST_WITHOUT_CAP",
        COST_CAP: "COST_CAP",
        BID_CAP: "LOWEST_COST_WITH_BID_CAP",
        MINIMUM_ROAS: "LOWEST_COST_WITH_MIN_ROAS",
    };
    return map[strategy] || "LOWEST_COST_WITHOUT_CAP";
}

function mapOptimizationGoal(goal) {
    const map = {
        CONVERSIONS: "OFFSITE_CONVERSIONS",
        LINK_CLICKS: "LINK_CLICKS",
        IMPRESSIONS: "IMPRESSIONS",
        REACH: "REACH",
        LANDING_PAGE_VIEWS: "LANDING_PAGE_VIEWS",
    };
    return map[goal] || "OFFSITE_CONVERSIONS";
}

function mapCTA(cta) {
    const map = {
        "Learn More": "LEARN_MORE",
        "Shop Now": "SHOP_NOW",
        "Sign Up": "SIGN_UP",
        "Get Offer": "GET_OFFER",
        "Book Now": "BOOK_NOW",
        "Contact Us": "CONTACT_US",
        "Download": "DOWNLOAD",
        "Watch More": "WATCH_MORE",
    };
    return map[cta] || "LEARN_MORE";
}

function buildTargeting(targeting) {
    if (!targeting) {
        return JSON.stringify({
            geo_locations: { countries: ["DE"] },
            age_min: 18,
            age_max: 65,
        });
    }

    const result = {
        geo_locations: {},
        age_min: targeting.ageMin || 18,
        age_max: targeting.ageMax || 65,
    };

    // Locations
    if (targeting.locations?.length > 0) {
        result.geo_locations.countries = targeting.locations;
    } else {
        result.geo_locations.countries = ["DE"];
    }

    // Gender
    if (targeting.gender === "male") {
        result.genders = [1];
    } else if (targeting.gender === "female") {
        result.genders = [2];
    }

    // Interests
    if (targeting.interests?.length > 0) {
        result.flexible_spec = [{
            interests: targeting.interests.map(interest => ({
                name: interest,
                // Note: In production, you'd need to lookup the interest IDs
            })),
        }];
    }

    // Placements
    if (targeting.placements?.length > 0) {
        result.publisher_platforms = targeting.placements.includes("facebook") ? ["facebook"] : [];
        if (targeting.placements.includes("instagram") || targeting.placements.includes("stories") || targeting.placements.includes("reels")) {
            result.publisher_platforms.push("instagram");
        }
    }

    return JSON.stringify(result);
}
