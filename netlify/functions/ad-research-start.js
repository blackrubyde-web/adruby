// netlify/functions/ad-research-start.js

import { runAdResearchActor } from "./_shared/apifyClient.js";
import { supabaseAdmin } from "./_shared/clients.js";

const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
});

export const handler = async (event) => {
  const headers = {
    ...corsHeaders(),
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { searchUrl, maxAds } = body;

    if (!searchUrl) {
      console.warn("[AdResearch][Start] searchUrl fehlt im Request-Body:", body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "searchUrl fehlt. Sende eine gültige Facebook Ad Library URL im Body.",
        }),
      };
    }

    console.log("[AdResearch][Start] Starting Apify run with", {
      searchUrl,
      maxAds,
    });

    const result = await runAdResearchActor({ searchUrl, maxAds });

    const runId = result?.runId || null;
    const items = Array.isArray(result?.items) ? result.items : [];

    console.log("[AdResearch][Start] Apify result summary", {
      runId,
      status: result?.status || null,
      datasetId: result?.defaultDatasetId || null,
      itemCount: items.length,
    });

    if (runId && items.length > 0) {
      const rows = items.map((item) => ({
        job_id: runId,
        ad_library_id: item.id || item.ad_id || null,
        page_id: item.page_id || null,
        page_name: item.page_name || null,
        primary_text: item.primary_text || item.primaryText || "",
        headline: item.headline || "",
        description: item.description || "",
        image_url: item.imageUrl || item.image_url || null,
        video_url: item.videoUrl || item.video_url || null,
        raw_payload: item || null,
      }));

      console.log("[AdResearch][Start] Inserting ads into Supabase", {
        jobId: runId,
        count: rows.length,
      });

      const { error: insertError } = await supabaseAdmin
        .from("ad_research_ads")
        .insert(rows);

      if (insertError) {
        console.error("[AdResearch][Start] Failed to insert ads", insertError);
        throw new Error(insertError.message || "Failed to insert ads");
      }

      console.log(
        "[AdResearch][Start] Stored ads for job",
        runId,
        "count",
        rows.length
      );
    } else {
      console.warn("[AdResearch][Start] No items to insert or missing runId", {
        runId,
        itemsCount: items.length,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jobId: runId,
        status: result?.status || null,
        datasetId: result?.defaultDatasetId || null,
        itemCount: items.length,
      }),
    };
  } catch (error) {
    console.error("[AdResearch][Start] Error", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to start ad research",
        details: error.message,
      }),
    };
  }
};
