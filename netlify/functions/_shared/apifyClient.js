// netlify/functions/_shared/apifyClient.js

const DEFAULT_ACTOR_URL =
  "https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items";

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const ACTOR_URL = process.env.APIFY_FB_ADLIB_ACTOR_URL || DEFAULT_ACTOR_URL;

if (!APIFY_API_KEY) {
  console.error("[Apify] Missing APIFY_API_KEY environment variable");
  throw new Error("APIFY_API_KEY is required for Apify integration");
}

/**
 * Ruft den Apify Facebook Ad Library Scraper synchron auf
 * und gibt ein normalisiertes Array von Ads zurück.
 */
async function callApifyFacebookAdsLibrary(params = {}) {
  const {
    urls,
    period = "",
    limitPerSource,
    count,
    scrapeAdDetails,
    countryCode = "ALL",
    activeStatus = "all",
  } = params;

  if (!Array.isArray(urls) || urls.length === 0 || urls.some((u) => typeof u !== "string")) {
    throw new Error("urls must be a non-empty array of strings");
  }

  const input = {
    urls,
    scrapeAdDetails: !!scrapeAdDetails,
    limitPerSource,
    count,
    period: period || "",
    scrapePageAds: {
      activeStatus: activeStatus || "all",
      countryCode: countryCode || "ALL",
    },
  };

  // Remove undefined keys
  Object.keys(input).forEach((key) => input[key] === undefined && delete input[key]);
  if (input.scrapePageAds) {
    Object.keys(input.scrapePageAds).forEach(
      (key) => input.scrapePageAds[key] === undefined && delete input.scrapePageAds[key]
    );
    if (Object.keys(input.scrapePageAds).length === 0) {
      delete input.scrapePageAds;
    }
  }

  const requestUrl = `${ACTOR_URL}?token=${encodeURIComponent(APIFY_API_KEY)}`;

  console.log("[Apify] Calling Facebook Ads Library Scraper", {
    urlsCount: urls.length,
    period,
    countryCode,
    limitPerSource,
    count,
  });

  let response;
  try {
    response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error("[Apify] Network error calling Facebook Ads Library Scraper", error);
    throw error;
  }

  if (!response.ok) {
    const snippet = await response.text().catch(() => "<no body>");
    console.error("[Apify] HTTP error", {
      status: response.status,
      body: snippet.slice(0, 500),
    });
    throw new Error(`Apify request failed with status ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error("[Apify] Failed to parse JSON response", error);
    throw new Error("Failed to parse Apify response JSON");
  }

  const ads = Array.isArray(data) ? data : [];
  console.log("[Apify] Received", ads.length, "ads from Apify");

  const normalized = ads.map((raw) => ({
    adId: raw.adId || raw.id || null,
    pageName: raw.pageName || raw.page_name || null,
    pageId: raw.pageId || raw.page_id || null,
    primaryText: raw.primaryText || raw.ad_creative_body || raw.text || null,
    headline: raw.headline || raw.ad_creative_link_title || null,
    description: raw.description || raw.ad_creative_link_description || null,
    ctaLabel: raw.callToActionType || raw.cta || null,
    creativeType: raw.publisherPlatform || raw.creativeType || null,
    country: (raw.politicalCountries && raw.politicalCountries[0]) || raw.country || null,
    language: raw.language || null,
    platform: raw.publisherPlatform || null,
    raw,
  }));

  return normalized;
}

module.exports = { callApifyFacebookAdsLibrary };
