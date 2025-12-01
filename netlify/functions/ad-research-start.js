// netlify/functions/ad-research-start.js

const { callApifyFacebookAdsLibrary } = require("./_shared/apifyClient");
const { getSupabaseClient } = require("./_shared/supabaseClient");

/**
 * Baut die URL für die Meta Ad Library
 */
function buildFacebookAdsLibraryUrl(keyword, country) {
  const base = "https://www.facebook.com/ads/library/";
  const params = new URLSearchParams({
    active_status: "all",
    ad_type: "all",
    country: country || "DE",
    q: keyword,
  });
  return `${base}?${params.toString()}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const supabase = getSupabaseClient();
  let job = null;

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("[AdResearch][Start] Request body", body);

    const {
      userId,
      keyword,
      country: rawCountry,
      maxResults: rawMaxResults,
      period = "",
    } = body;

    if (!userId || !keyword) {
      console.warn("[AdResearch][Start] Missing userId or keyword");
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "userId and keyword are required" }),
      };
    }

    const country = rawCountry || "DE";
    const maxResults = Math.min(rawMaxResults || 30, 100);

    // --------------------------------------------
    // 1) Job in Supabase anlegen
    // --------------------------------------------
    const { data: createdJob, error: jobError } = await supabase
      .from("ad_research_jobs")
      .insert({
        user_id: userId,
        status: "running",
        source: "apify_facebook_ad_library",
        apify_actor_id: "curious_coder/facebook-ads-library-scraper",
        input_params: { keyword, country, maxResults, period },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) throw jobError;

    job = createdJob;
    console.log("[AdResearch][Start] Job created", { jobId: job.id });

    // --------------------------------------------
    // 2) Apify Call vorbereiten
    // --------------------------------------------
    const adsUrl = buildFacebookAdsLibraryUrl(keyword, country);

    console.log("[AdResearch][Start] Calling Apify", {
      actor: "callApifyFacebookAdsLibrary",
      adsUrl,
      country,
      maxResults,
      period,
    });

    // --------------------------------------------
    // 3) Apify Scraper laufen lassen
    // --------------------------------------------
    const ads = await callApifyFacebookAdsLibrary({
      urls: [adsUrl],
      period,
      limitPerSource: maxResults,
      count: maxResults,
      countryCode: country,
      activeStatus: "all",
      scrapeAdDetails: true,
    });

    console.log("[AdResearch][Start] Apify returned", ads.length, "ads");

    // --------------------------------------------
    // 4) Ads in DB speichern
    // --------------------------------------------
    let insertedAds = [];

    if (ads.length > 0) {
      const mappedAds = ads.map((ad) => ({
        job_id: job.id,
        external_ad_id: ad.adId || null,
        page_name: ad.pageName || null,
        page_id: ad.pageId || null,
        primary_text: ad.primaryText || null,
        headline: ad.headline || null,
        description: ad.description || null,
        cta_label: ad.ctaLabel || null,
        creative_type: ad.creativeType || null,
        platform: ad.platform || null,
        country: ad.country || null,
        language: ad.language || null,
        meta_raw: ad.raw || ad || null,
        created_at: new Date().toISOString(),
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("ad_research_ads")
        .insert(mappedAds)
        .select(
          "id, page_name, primary_text, headline, cta_label, creative_type, country, language"
        );

      if (insertError) throw insertError;

      insertedAds = inserted;
      console.log(
        "[AdResearch][Start] Inserted",
        insertedAds.length,
        "ads into ad_research_ads"
      );
    }

    // --------------------------------------------
    // 5) Job abschließen
    // --------------------------------------------
    const { error: updateError } = await supabase
      .from("ad_research_jobs")
      .update({
        status: "completed",
        stats: { ads_found: ads.length },
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) throw updateError;

    // Antwort für das Frontend
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        status: "completed",
        adsCount: insertedAds.length,
        ads: insertedAds.map((ad) => ({
          id: ad.id,
          pageName: ad.page_name,
          primaryText: ad.primary_text,
          headline: ad.headline,
          ctaLabel: ad.cta_label,
          creativeType: ad.creative_type,
          country: ad.country,
          language: ad.language,
        })),
      }),
    };
  } catch (error) {
    console.error("[AdResearch][Start] Error", error);

    if (job?.id) {
      await supabase
        .from("ad_research_jobs")
        .update({
          status: "failed",
          error_message: error.message || "Unknown error",
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Ad research failed",
        details: error.message || String(error),
      }),
    };
  }
};
