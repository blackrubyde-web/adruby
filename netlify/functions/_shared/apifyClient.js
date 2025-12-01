// netlify/functions/_shared/apifyClient.js

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_AD_RESEARCH_ACTOR_ID = process.env.APIFY_AD_RESEARCH_ACTOR_ID;

/**
 * Kleiner Helper zum Warten (Polling für Apify-Run).
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Startet einen Apify Actor und holt danach die Dataset-Items (Ads).
 *
 * @param {Object} params
 * @param {string} [params.actorId] - Optional eigener Actor, sonst ENV
 * @param {Object} [params.input]   - Input für den Actor
 *
 * @returns {Promise<{ ads: any[] }>}
 */
async function runAdResearchActor({ actorId = APIFY_AD_RESEARCH_ACTOR_ID, input = {} } = {}) {
  if (!APIFY_API_TOKEN) {
    console.error("[ApifyClient] Missing APIFY_API_TOKEN");
    throw new Error("APIFY_API_TOKEN is not set");
  }

  if (!actorId) {
    console.error("[ApifyClient] Missing APIFY_AD_RESEARCH_ACTOR_ID");
    throw new Error("APIFY_AD_RESEARCH_ACTOR_ID is not set");
  }

  const baseUrl = "https://api.apify.com/v2";

  console.log("[ApifyClient] Starting actor run", {
    actorId,
    hasInput: !!input,
  });

  // 1) Actor-Run starten
  const startRes = await fetch(`${baseUrl}/actors/${actorId}/runs?token=${APIFY_API_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input || {}),
  });

  if (!startRes.ok) {
    const text = await startRes.text();
    console.error("[ApifyClient] Failed to start actor run", {
      status: startRes.status,
      body: text,
    });
    throw new Error(`Failed to start Apify actor: ${startRes.status}`);
  }

  const startJson = await startRes.json();
  const run = startJson?.data;
  const runId = run?.id;

  if (!runId) {
    console.error("[ApifyClient] No runId in start response", startJson);
    throw new Error("Apify did not return a runId");
  }

  console.log("[ApifyClient] Actor run started", { runId });

  // 2) Polling bis der Run fertig ist
  let status = run?.status;
  let datasetId = run?.defaultDatasetId;

  while (!status || ["READY", "RUNNING", "STARTING"].includes(status)) {
    console.log("[ApifyClient] Polling run status", { runId, status });
    await sleep(5000);

    const runRes = await fetch(`${baseUrl}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
    if (!runRes.ok) {
      const text = await runRes.text();
      console.error("[ApifyClient] Failed to fetch run status", {
        status: runRes.status,
        body: text,
      });
      throw new Error(`Failed to fetch Apify run status: ${runRes.status}`);
    }

    const runJson = await runRes.json();
    status = runJson?.data?.status;
    datasetId = runJson?.data?.defaultDatasetId;

    if (!status) {
      console.error("[ApifyClient] No status in run status response", runJson);
      throw new Error("Apify run status is unknown");
    }

    if (!["READY", "RUNNING", "STARTING", "SUCCEEDED"].includes(status)) {
      console.error("[ApifyClient] Run ended with non-success status", {
        runId,
        status,
      });
      throw new Error(`Apify run did not succeed. Status: ${status}`);
    }

    if (status === "SUCCEEDED") break;
  }

  if (!datasetId) {
    console.error("[ApifyClient] No datasetId for run", { runId, status });
    throw new Error("Apify run did not provide a datasetId");
  }

  // 3) Dataset-Items (Ads) holen
  const itemsRes = await fetch(
    `${baseUrl}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&clean=true&format=json`
  );

  if (!itemsRes.ok) {
    const text = await itemsRes.text();
    console.error("[ApifyClient] Failed to fetch dataset items", {
      status: itemsRes.status,
      body: text,
    });
    throw new Error(`Failed to fetch Apify dataset items: ${itemsRes.status}`);
  }

  const items = await itemsRes.json();
  const count = Array.isArray(items) ? items.length : 0;

  console.log("[ApifyClient] Retrieved dataset items", {
    runId,
    datasetId,
    count,
  });

  return {
    ads: Array.isArray(items) ? items : [],
  };
}

/**
 * High-Level Helper für den Facebook Ads Library Scraper.
 * Passt den Input an deinen Apify Actor an und gibt direkt die Ads zurück.
 */
async function callApifyFacebookAdsLibrary({
  urls = [],
  period = "",
  limitPerSource = 30,
  count = 30,
  countryCode = "DE",
  activeStatus = "all",
  scrapeAdDetails = true,
} = {}) {
  const input = {
    startUrls: urls.map((url) => ({ url })),
    country: countryCode,
    period,
    limit: count,
    activeStatus,
    scrapeAdDetails,
  };

  console.log("[ApifyClient] callApifyFacebookAdsLibrary input", input);

  const { ads } = await runAdResearchActor({ input });
  return ads;
}

module.exports = {
  runAdResearchActor,
  callApifyFacebookAdsLibrary,
};
