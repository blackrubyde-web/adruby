const { callApifyFacebookAdsLibrary } = require("./_shared/apifyClient");
const { getSupabaseClient } = require("./_shared/supabaseClient");

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

    const { userId, keyword, country: rawCountry, maxResults: rawMaxResults, period = "" } = body;

    if (!userId || !keyword) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "userId and keyword are required" }),
      };
    }

    const country = rawCountry || "DE";
    const maxResults = Math.min(rawMaxResults || 30, 100);

    // Create job
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

    if (jobError) {
      throw jobError;
    }

    job = createdJob;
    console.log("[AdResearch][Start] Job created", { jobId: job.id });

    const adsUrl = buildFacebookAdsLibraryUrl(keyword, country);

    const ads = await callApifyFacebookAdsLibrary({
      urls: [adsUrl],
      period,
      limitPerSource: maxResults,
      count: maxResults,
      countryCode: country,
      activeStatus: "all",
      scrapeAdDetails: true,
    });

    console.log("[AdResearch][Start] Received", ads.length, "ads from Apify");

    let insertedAds = [];
    if (ads.length > 0) {
      const mappedAds = ads.map((ad) => ({
        job_id: job.id,
        external_ad_id: ad.adId,
        page_name: ad.pageName,
        page_id: ad.pageId,
        primary_text: ad.primaryText,
        headline: ad.headline,
        description: ad.description,
        cta_label: ad.ctaLabel,
        creative_type: ad.creativeType,
        platform: ad.platform,
        country: ad.country,
        language: ad.language,
        meta_raw: ad.raw,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("ad_research_ads")
        .insert(mappedAds)
        .select("id, page_name, primary_text, headline, cta_label, creative_type, country, language");

      if (insertError) {
        throw insertError;
      }

      insertedAds = inserted || [];
      console.log("[AdResearch][Start] Inserted", insertedAds.length, "ads into ad_research_ads");
    }

    const { error: updateError } = await supabase
      .from("ad_research_jobs")
      .update({
        status: "completed",
        stats: { ads_found: ads.length },
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      throw updateError;
    }

    const responseAds = insertedAds.map((ad) => ({
      id: ad.id,
      pageName: ad.page_name,
      primaryText: ad.primary_text,
      headline: ad.headline,
      ctaLabel: ad.cta_label,
      creativeType: ad.creative_type,
      country: ad.country,
      language: ad.language,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        status: "completed",
        adsCount: responseAds.length,
        ads: responseAds,
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
