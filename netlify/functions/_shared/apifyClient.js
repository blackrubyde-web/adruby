// netlify/functions/_shared/apifyClient.js

const { ApifyClient } = require("apify-client");

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_FACEBOOK_ADS_ACTOR_ID = process.env.APIFY_FACEBOOK_ADS_ACTOR_ID;

/**
 * Normalize actor id: "user/actor" -> "user~actor" as required by Apify API.
 */
function normalizeActorId(id) {
  if (!id) return id;
  if (id.includes("/")) {
    return id.replace("/", "~");
  }
  return id;
}

/**
 * Startet den Facebook Ads Library Actor auf Apify.
 *
 * @param {Object} params
 * @param {string} params.searchUrl - Facebook Ads Library URL
 * @param {number} [params.maxAds] - Maximale Anzahl an Ads
 * @returns {Promise<Object>} Apify Run Objekt
 */
async function runAdResearchActor(params = {}) {
  if (!APIFY_API_TOKEN) {
    console.error("[ApifyClient] Missing APIFY_API_TOKEN");
    throw new Error("APIFY_API_TOKEN is not set in environment");
  }

  if (!APIFY_FACEBOOK_ADS_ACTOR_ID) {
    console.error("[ApifyClient] Missing APIFY_FACEBOOK_ADS_ACTOR_ID");
    throw new Error("APIFY_FACEBOOK_ADS_ACTOR_ID is not set in environment");
  }

  const { searchUrl, maxAds } = params;

  console.log("[ApifyClient] Incoming params for runAdResearchActor", {
    searchUrl,
    maxAds,
    typeOfSearchUrl: typeof searchUrl,
  });

  if (!searchUrl) {
    console.error(
      "[ApifyClient] searchUrl fehlt – ohne Facebook Ad Library URL kann der Actor nicht laufen.",
      { searchUrl }
    );
    throw new Error(
      "searchUrl fehlt – ohne Facebook Ad Library URL kann der Actor nicht laufen."
    );
  }

  // ✅ Validierung und Normalisierung der URL
  let finalUrl;
  try {
    const urlObj = new URL(searchUrl);
    finalUrl = urlObj.toString();
  } catch (e) {
    console.error("[ApifyClient] Ungültige searchUrl, keine valide URL:", {
      searchUrl,
      typeOfSearchUrl: typeof searchUrl,
      error: e.message,
    });
    throw new Error(
      `searchUrl ist keine gültige URL: "${searchUrl}". Erwartet wird eine vollständige https://www.facebook.com/ads/library/... URL.`
    );
  }

  const actorId = normalizeActorId(APIFY_FACEBOOK_ADS_ACTOR_ID);

  // 🔧 WICHTIG: Input-Shape an Actor-Schema anpassen
  const input = {
    urls: [{ url: finalUrl }],
    count: typeof maxAds === "number" ? maxAds : 200,
    // period: "",
    // "scrapePageAds.activeStatus": "all",
    // "scrapePageAds.countryCode": "ALL",
  };

  console.log("[ApifyClient] Starting actor run", { actorId, input });

  const client = new ApifyClient({ token: APIFY_API_TOKEN });

  try {
    const run = await client.actor(actorId).call(input);
    console.log("[ApifyClient] Actor run response", {
      runId: run?.id,
      status: run?.status,
    });
    return run;
  } catch (error) {
    console.error("[ApifyClient] Failed to start actor run", {
      status: error?.status,
      message: error?.message,
      body: error?.body,
    });
    throw new Error(
      `Failed to start Apify actor: ${
        (error?.body && error.body.error && error.body.error.message) ||
        error?.message ||
        String(error)
      }`
    );
  }
}

module.exports = {
  runAdResearchActor,
};
