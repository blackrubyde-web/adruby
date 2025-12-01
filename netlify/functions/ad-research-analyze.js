// netlify/functions/ad-research-analyze.js

const { getSupabaseClient } = require("./_shared/supabaseClient");
const { analyzeAdsWithOpenAI } = require("./_shared/aiAdAnalysis.js");

/**
 * Netlify Function:
 *  - Nimmt jobId (+ optional limit) entgegen
 *  - Holt Ads aus ad_research_ads
 *  - Schickt sie an OpenAI
 *  - Speichert score + analysis zurück in Supabase
 *  - Gibt die analysierten Ads zurück
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
    console.error("[AdResearch][Analyze] Failed to parse body", err);
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { jobId, limit: rawLimit } = body;
  console.log("[AdResearch][Analyze] Body", body);

  if (!jobId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "jobId is required" }),
    };
  }

  let limit = Number(rawLimit) || 20;
  if (limit > 50) limit = 50;

  const supabase = getSupabaseClient();

  try {
    // 1) Ads zu diesem Job holen
    const { data: ads, error: adsError } = await supabase
      .from("ad_research_ads")
      .select(
        "id, primary_text, headline, description, score, analysis, page_name, country, language"
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (adsError) {
      console.error("[AdResearch][Analyze] Failed to load ads", adsError);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to load ads for analysis" }),
      };
    }

    if (!ads || ads.length === 0) {
      console.warn("[AdResearch][Analyze] No ads found for job", jobId);
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No ads found for this job" }),
      };
    }

    console.log(
      "[AdResearch][Analyze] Loaded",
      ads.length,
      "ads for job",
      jobId
    );

    const adsForAi = ads.map((ad) => ({
      id: ad.id,
      primary_text: ad.primary_text || "",
      headline: ad.headline || "",
      description: ad.description || "",
    }));

    // 2) OpenAI-Analyse
    const analysisResults = await analyzeAdsWithOpenAI(adsForAi);
    console.log(
      "[AdResearch][Analyze] AI returned",
      analysisResults.length,
      "items"
    );

    if (!analysisResults || analysisResults.length === 0) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "AI analysis returned no results" }),
      };
    }

    // 3) Ergebnisse zurück in Supabase schreiben
    let updatedCount = 0;

    for (const result of analysisResults) {
      const adId = result.id;
      if (!adId) continue;

      const score =
        typeof result.score === "number" ? result.score : Number(result.score) || 0;

      const analysis = {
        main_hook: result.main_hook || "",
        summary: result.summary || "",
        analyzed_at: new Date().toISOString(),
        model: "gpt-4.1-mini",
      };

      const { error: updateError } = await supabase
        .from("ad_research_ads")
        .update({ score, analysis })
        .eq("id", adId);

      if (updateError) {
        console.error(
          "[AdResearch][Analyze] Failed to update ad",
          adId,
          updateError
        );
      } else {
        updatedCount += 1;
      }
    }

    // 4) Enriched Ads für Response bauen
    const enrichedAds = ads.map((ad) => {
      const ai = analysisResults.find((a) => a.id === ad.id);
      const existingAnalysis = ad.analysis || {};

      const score =
        ai?.score ?? existingAnalysis.score ?? ad.score ?? 0;

      const mainHook =
        ai?.main_hook ?? existingAnalysis.main_hook ?? null;

      const summary =
        ai?.summary ?? existingAnalysis.summary ?? null;

      return {
        id: ad.id,
        pageName: ad.page_name || null,
        primaryText: ad.primary_text || null,
        headline: ad.headline || null,
        description: ad.description || null,
        country: ad.country || null,
        language: ad.language || null,
        score,
        mainHook,
        summary,
      };
    });

    console.log(
      "[AdResearch][Analyze] Updated scores for",
      updatedCount,
      "ads"
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          jobId,
          adsCount: enrichedAds.length,
          updatedCount,
          ads: enrichedAds,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.error("[AdResearch][Analyze] Unexpected error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Ad analysis failed",
        details: error.message || String(error),
      }),
    };
  }
};
