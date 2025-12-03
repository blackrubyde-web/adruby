// netlify/functions/ad-strategy-save.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event) => {
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
    const payload = JSON.parse(event.body || "{}");
    const { adVariantId, userId, answers, strategyRecommendation, metaAdsSetup } = payload;

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategy: !!strategyRecommendation,
      hasMeta: !!metaAdsSetup,
    });

    if (!adVariantId || !userId || !strategyRecommendation || !strategyRecommendation.strategy) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields for saving strategy" }),
      };
    }

    const selectedStrategy = strategyRecommendation.strategy;

    // Score sauber auf Integer mappen (DB-Spalte ist integer)
    let matchingScore = null;
    if (strategyRecommendation.score !== undefined && strategyRecommendation.score !== null) {
      const numericScore = parseFloat(strategyRecommendation.score);
      if (Number.isFinite(numericScore)) {
        matchingScore = Math.round(numericScore); // 9.8 -> 10
      }
    }

    const confidenceLevel = strategyRecommendation.confidence ?? null;

    const { data: insertedStrategy, error: strategyError } = await supabase
      .from("ad_strategies")
      .insert([
        {
          ad_variant_id: adVariantId,
          user_id: userId,
          blueprint_key: strategyRecommendation.blueprint_key || null,
          answers: answers || {},
          selected_strategy: selectedStrategy,
          matching_score: matchingScore,
          confidence_level: confidenceLevel,
          ai_analysis: {
            reasoning: strategyRecommendation.reasoning || null,
            deep_dive_sections: strategyRecommendation.deep_dive_sections || [],
            key_alignments: strategyRecommendation.key_alignments || [],
            implementation_recommendations:
              strategyRecommendation.implementation_recommendations || [],
            diagnosis: strategyRecommendation.diagnosis || null,
            alternatives: strategyRecommendation.alternatives || [],
          },
        },
      ])
      .select("*")
      .single();

    if (strategyError) {
      console.error("[AdStrategySave] Failed to insert ad_strategy:", strategyError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to insert ad_strategy",
          details: strategyError.message || String(strategyError),
        }),
      };
    }

    console.log("[AdStrategySave] Inserted ad_strategy", {
      id: insertedStrategy?.id,
      ad_variant_id: insertedStrategy?.ad_variant_id,
      user_id: insertedStrategy?.user_id,
    });

    let insertedMeta = null;
    if (metaAdsSetup) {
      const { data: metaData, error: metaError } = await supabase
        .from("meta_ads_setups")
        .insert([
          {
            ad_strategy_id: insertedStrategy.id,
            campaign_config: metaAdsSetup.campaign_config || {},
            adsets_config: metaAdsSetup.adsets_config || [],
            ads_config: metaAdsSetup.ads_config || [],
            recommendations: metaAdsSetup.recommendations || {},
          },
        ])
        .select("*")
        .single();

      if (metaError) {
        console.error("[AdStrategySave] Failed to insert meta_ads_setup:", metaError);
      } else {
        insertedMeta = metaData;
        console.log("[AdStrategySave] Inserted meta_ads_setup", {
          id: insertedMeta?.id,
          ad_strategy_id: insertedMeta?.ad_strategy_id,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        ad_strategy: insertedStrategy,
        meta_ads_setup: insertedMeta,
      }),
    };
  } catch (err) {
    console.error("[AdStrategySave] Unexpected error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected error in AdStrategySave",
        details: err.message || String(err),
      }),
    };
  }
};
