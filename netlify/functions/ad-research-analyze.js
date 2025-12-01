// netlify/functions/ad-research-analyze.js

import { supabaseAdmin } from "./_shared/clients.js";

const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
});

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let jobId;
  let limit;

  try {
    const body = JSON.parse(event.body || "{}");
    jobId = body.jobId;
    limit = body.limit;
  } catch (err) {
    console.error("[AdResearch][Analyze] Failed to parse body", err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // fallback to query params
  const params = event.queryStringParameters || {};
  jobId = jobId || params.jobId;
  limit = limit || (params.limit ? Number(params.limit) : undefined);

  if (limit) {
    limit = Number(limit);
  }
  if (!limit || Number.isNaN(limit)) limit = 30;
  if (limit > 50) limit = 50;

  console.log("[AdResearch][Analyze] Loading ads for job", jobId, "limit", limit);

  if (!jobId) {
    console.error("[AdResearch][Analyze] Missing jobId");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing jobId" }),
    };
  }

  try {
    const { data: ads, error } = await supabaseAdmin
      .from("ad_research_ads")
      .select(
        `
          id,
          job_id,
          ad_library_id,
          page_id,
          page_name,
          primary_text,
          headline,
          description,
          image_url,
          video_url,
          score,
          main_hook,
          summary,
          created_at
        `
      )
      .eq("job_id", jobId)
      .order("score", { ascending: false, nullsLast: true })
      .limit(limit);

    if (error) {
      console.error("[AdResearch][Analyze] Supabase error while loading ads", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Failed to load ads for analysis",
          details: error.message,
        }),
      };
    }

    if (!ads || ads.length === 0) {
      console.log("[AdResearch][Analyze] No ads found for job", jobId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ads: [],
          hasResearchContext: false,
        }),
      };
    }

    console.log("[AdResearch][Analyze] Loaded ads for job", jobId, "count", ads.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ads,
        hasResearchContext: true,
      }),
    };
  } catch (err) {
    console.error("[AdResearch][Analyze] Unexpected error", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Unexpected error during analysis",
      }),
    };
  }
};
