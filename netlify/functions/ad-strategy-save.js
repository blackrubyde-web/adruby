const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event, context) => {
  console.log("[AdStrategySave] Incoming request:", {
    method: event.httpMethod,
    body: event.body,
  });

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[AdStrategySave] Failed to init Supabase client:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Supabase client init failed",
        details: err.message || String(err),
      }),
    };
  }

  try {
    const { adVariantId, userId, answers, strategyRecommendation } = JSON.parse(event.body || "{}");

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategyRecommendation: !!strategyRecommendation,
    });

    if (!adVariantId || !userId || !strategyRecommendation || !strategyRecommendation.strategy) {
      console.error("[AdStrategySave] Missing required fields");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields",
          details: "adVariantId, userId and strategyRecommendation.strategy are required",
        }),
      };
    }

    const insertPayload = {
      ad_variant_id: adVariantId,
      user_id: userId,
      answers: answers || {},
      selected_strategy:
        strategyRecommendation.strategy.title ||
        strategyRecommendation.strategy.id ||
        "Unknown Strategy",
      matching_score: strategyRecommendation.score ?? null,
      confidence_level: strategyRecommendation.confidence ?? null,
      ai_analysis: {
        key_alignments: strategyRecommendation.key_alignments || [],
        implementation_recommendations:
          strategyRecommendation.implementation_recommendations || [],
        alternatives: strategyRecommendation.alternatives || [],
        reasoning: strategyRecommendation.reasoning || "",
        diagnosis: strategyRecommendation.diagnosis || null,
        deep_dive_sections: strategyRecommendation.deep_dive_sections || [],
      },
    };

    console.log("[AdStrategySave] Upserting payload into ad_strategies:", insertPayload);

    const { data, error } = await supabase
      .from("ad_strategies")
      .upsert(insertPayload, { onConflict: "ad_variant_id" })
      .select()
      .single();

    if (error) {
      console.error("[AdStrategySave] Supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to save strategy",
          details: error.message || error,
        }),
      };
    }

    console.log("[AdStrategySave] Strategy saved successfully:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[AdStrategySave] Handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected server error",
        details: err.message || String(err),
      }),
    };
  }
};
