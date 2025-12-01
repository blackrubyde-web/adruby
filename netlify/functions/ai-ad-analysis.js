// netlify/functions/ai-ad-analysis.js

const { generateCreativesFromAds } = require("./_shared/aiAdAnalysis.js");

/**
 * Nimmt gescrapte Ads + User-Briefing entgegen
 * und gibt fertige Ad-Creatives zurück.
 *
 * Body:
 * {
 *   "userBriefing": { "product": "...", "goal": "...", "market": "...", "language": "de" },
 *   "scrapedAds": [ ... Apify Items ... ]
 * }
 */
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("[AIAnalysisFn] Failed to parse body", err);
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { userBriefing, scrapedAds } = body || {};

  console.log("[AIAnalysisFn] Incoming request", {
    hasBriefing: !!userBriefing,
    scrapedCount: Array.isArray(scrapedAds) ? scrapedAds.length : 0,
  });

  if (!Array.isArray(scrapedAds) || scrapedAds.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "scrapedAds is required and must be a non-empty array",
      }),
    };
  }

  try {
    // Mapping der Apify-Items auf das interne Format
    const normalizedAds = scrapedAds.map((item, index) => ({
      id: item.id || item.ad_id || `apify-${index}`,
      primary_text:
        item.primary_text ||
        item.primaryText ||
        item.ad_creative_body ||
        "",
      headline:
        item.headline ||
        item.ad_creative_link_title ||
        item.title ||
        "",
      description:
        item.description ||
        item.ad_creative_link_description ||
        "",
    }));

    const creatives = await generateCreativesFromAds({
      userBriefing: userBriefing || {},
      ads: normalizedAds,
    });

    console.log("[AIAnalysisFn] Generated creatives", {
      count: creatives.length,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          ads: creatives,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.error("[AIAnalysisFn] Unexpected error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "AI analysis failed",
        details: error.message || String(error),
      }),
    };
  }
};
