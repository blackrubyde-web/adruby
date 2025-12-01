// netlify/functions/ad-research-start.js

const { runAdResearchActor } = require("./_shared/apifyClient");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { searchUrl, maxAds } = body;

    if (!searchUrl) {
      console.warn(
        "[AdResearch][Start] searchUrl fehlt im Request-Body:",
        body
      );
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
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

    const run = await runAdResearchActor({ searchUrl, maxAds });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: run?.id,
        status: run?.status,
      }),
    };
  } catch (error) {
    console.error("[AdResearch][Start] Error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to start ad research",
        details: error.message,
      }),
    };
  }
};
