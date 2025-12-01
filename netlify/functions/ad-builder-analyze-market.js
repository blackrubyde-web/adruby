// netlify/functions/ad-builder-analyze-market.js

const { analyzeAdsWithOpenAI } = require("./_shared/aiAdAnalysis");

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

    const { product, researchContext } = body;

    if (!product) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "product fehlt im Body" }),
      };
    }

    console.log("[AnalyzeMarket] Starting market analysis", {
      productId: product.id,
      hasResearchContext: !!researchContext,
    });

    // Vorbereitung des Prompts
    const promptAds = researchContext?.topAds || [];

    const insights = await analyzeAdsWithOpenAI(promptAds);

    console.log("[AnalyzeMarket] Done. Returning insights:", {
      count: insights?.length || 0,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        insights,
        fallbackUsed: false,
        fallbackReason: null,
      }),
    };
  } catch (error) {
    console.error("[AnalyzeMarket] Error", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Market analysis failed",
        details: error.message,
        fallbackUsed: true,
        fallbackReason: "OpenAI request crashed",
        insights: getFallbackInsights(),
      }),
    };
  }
};

// Einfacher Fallback für Notfälle
function getFallbackInsights() {
  return [
    {
      id: "fallback-1",
      score: 82,
      main_hook: "Spare Zeit & steigere Effizienz sofort",
      summary: "Solider Standard-Hook, funktioniert in breiten Zielgruppen.",
    },
    {
      id: "fallback-2",
      score: 75,
      main_hook: "Optimieren statt raten",
      summary: "Funktioniert gut bei performance-orientierten Zielgruppen.",
    },
  ];
}
