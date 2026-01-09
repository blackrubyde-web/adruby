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
import { postGraph, resolveMetaAccessToken, pickPrimaryAdAccount } from "./_shared/meta.js";
import { supabaseAdmin } from "./_shared/clients.js";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

async function uploadImageHash(actId, token, imageUrl, filename) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
        throw new Error(`Image download failed: ${imgRes.status}`);
    }

    const blob = await imgRes.blob();
    const formData = new FormData();
    formData.append("access_token", token);
    formData.append("filename", filename || "ad_image.jpg");
    formData.append("file", blob);

    const uploadRes = await fetch(`${GRAPH_API_BASE}/${actId}/adimages`, {
        method: "POST",
        body: formData,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
        const msg = uploadJson?.error?.message || "Meta image upload failed";
        const err = new Error(msg);
        err.data = uploadJson;
        throw err;
    }

    const images = uploadJson?.images || {};
    const firstKey = Object.keys(images)[0];
    return firstKey ? images[firstKey]?.hash || null : null;
}

function buildPreviewPayload(campaign, adSets) {
    return {
        campaign: {
            name: campaign?.name,
            objective: mapObjective(campaign?.objective),
            status: "PAUSED",
            buying_type: "AUCTION",
        },
        adSets: (adSets || []).map((adSet) => ({
            name: adSet?.name,
            optimization_goal: mapOptimizationGoal(adSet?.optimizationGoal),
            targeting: JSON.parse(buildTargeting(adSet?.targeting)),
            ads: (adSet?.ads || []).map((ad) => ({
                name: ad?.name,
                creative: {
                    title: ad?.headline,
                    body: ad?.primaryText,
                    cta: mapCTA(ad?.cta),
                    image_url: ad?.imageUrl || null,
                },
            })),
        })),
    };
}

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

    const { mode = "create", adAccountId, campaign, adSets } = body;

    if (!campaign) {
        return badRequest("Missing campaign data");
    }

    try {
        if (mode === "preview") {
            return ok({
                success: true,
                preview: buildPreviewPayload(campaign, adSets),
                message: "Preview generated. Ready to push to Meta.",
            });
        }

        const { token, connection } = await resolveMetaAccessToken(userId);
        if (!token) {
            return badRequest("Meta nicht verbunden. Bitte zuerst Meta verknüpfen.");
        }

        // Resolve ad account
        const meta = connection?.meta || {};
        const metaAccounts = Array.isArray(meta?.ad_accounts) ? meta.ad_accounts : [];
        let accountId = adAccountId || connection?.ad_account_id || meta?.selected_account?.id;
        if (!accountId && metaAccounts.length) {
            const primary = pickPrimaryAdAccount(metaAccounts, meta?.selected_account?.id);
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
                    let imageHash = ad.imageHash;
                    if (!imageHash && ad.imageUrl) {
                        try {
                            imageHash = await uploadImageHash(actId, token, ad.imageUrl, ad.creativeId || "ad_image.jpg");
                        } catch (err) {
                            console.warn("[Meta] Image upload failed", err?.message || err);
                        }
                    }

                    if (imageHash) {
                        creativeParams.object_story_spec = JSON.stringify({
                            ...JSON.parse(creativeParams.object_story_spec),
                            link_data: {
                                ...JSON.parse(creativeParams.object_story_spec).link_data,
                                image_hash: imageHash,
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
    const raw = String(objective || "").trim();
    const upper = raw.toUpperCase().replace(/\s+/g, "_");
    if (upper.startsWith("OUTCOME_")) return upper;

    const map = {
        CONVERSIONS: "OUTCOME_SALES",
        TRAFFIC: "OUTCOME_TRAFFIC",
        AWARENESS: "OUTCOME_AWARENESS",
        ENGAGEMENT: "OUTCOME_ENGAGEMENT",
        LEADS: "OUTCOME_LEADS",
        APP_INSTALLS: "OUTCOME_APP_PROMOTION",
    };
    return map[upper] || "OUTCOME_SALES";
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
    const raw = String(cta || "").trim();
    const upper = raw.toUpperCase().replace(/\s+/g, "_");

    const direct = {
        LEARN_MORE: "LEARN_MORE",
        SHOP_NOW: "SHOP_NOW",
        SIGN_UP: "SIGN_UP",
        GET_OFFER: "GET_OFFER",
        BOOK_NOW: "BOOK_NOW",
        CONTACT_US: "CONTACT_US",
        DOWNLOAD: "DOWNLOAD",
        WATCH_MORE: "WATCH_MORE",
    };
    if (direct[upper]) return direct[upper];

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
    return map[raw] || "LEARN_MORE";
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

    // Custom audiences
    if (Array.isArray(targeting.customAudiences) && targeting.customAudiences.length > 0) {
        result.custom_audiences = targeting.customAudiences.map((aud) => ({ id: aud.id }));
    }

    if (Array.isArray(targeting.lookalikeAudiences) && targeting.lookalikeAudiences.length > 0) {
        const lookalikeIds = targeting.lookalikeAudiences.map((aud) => ({ id: aud.id }));
        result.custom_audiences = [...(result.custom_audiences || []), ...lookalikeIds];
    }

    if (Array.isArray(targeting.exclusions) && targeting.exclusions.length > 0) {
        result.excluded_custom_audiences = targeting.exclusions.map((id) => ({ id }));
    }

    // Placements
    if (targeting.placements?.length > 0) {
        const placements = targeting.placements;
        const platforms = [];
        if (placements.includes("feed") || placements.includes("stories") || placements.includes("reels") || placements.includes("explore")) {
            platforms.push("facebook", "instagram");
        }
        if (placements.includes("audience_network")) {
            platforms.push("audience_network");
        }
        result.publisher_platforms = Array.from(new Set(platforms));
    }

    return JSON.stringify(result);
}
