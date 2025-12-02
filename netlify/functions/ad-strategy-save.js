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

  try {
    const { adVariantId, userId, answers, strategyRecommendation } = JSON.parse(event.body || "{}");

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategyRecommendation: !!strategyRecommendation,
    });

    let supabase = null;
    try {
      supabase = getSupabaseClient();
    } catch (e) {
      console.error("[AdStrategySave] Supabase client init failed", e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase client not initialized" }),
      };
    }

    if (!adVariantId || !userId || !strategyRecommendation || !strategyRecommendation.strategy) {
      console.error("[AdStrategySave] Missing required fields");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields: adVariantId, userId, strategyRecommendation.strategy",
        }),
      };
    }

    const insertPayload = {
      ad_variant_id: adVariantId,
      user_id: userId,
      questionnaire_answers: answers || {},
      selected_strategy_id: strategyRecommendation?.strategy?.id || null,
      selected_strategy_data: strategyRecommendation?.strategy || null,
      ai_analysis: {
        reasoning: strategyRecommendation?.reasoning || "",
        confidence: strategyRecommendation?.confidence || null,
        key_alignments: strategyRecommendation?.key_alignments || [],
        implementation_recommendations:
          strategyRecommendation?.implementation_recommendations || [],
        alternatives: strategyRecommendation?.alternatives || [],
        diagnosis: strategyRecommendation?.diagnosis || null,
        deep_dive_sections: strategyRecommendation?.deep_dive_sections || [],
        blueprint_id: strategyRecommendation?.blueprint_id || null,
        blueprint_title: strategyRecommendation?.blueprint_title || null,
      },
      matching_score: strategyRecommendation?.score ?? null,
      confidence_level: strategyRecommendation?.confidence ?? null,
      status: "analyzed",
    };

    console.log("[AdStrategySave] Upserting payload:", insertPayload);

    const { data, error } = await supabase
      .from("ad_strategies")
      .upsert(insertPayload)
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
