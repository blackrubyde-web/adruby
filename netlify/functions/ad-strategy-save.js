// netlify/functions/ad-strategy-save.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event, context) => {
  console.log("[AdStrategySave] Incoming request:", {
    method: event.httpMethod,
    bodySnippet: event.body ? event.body.slice(0, 500) : null,
  });

  // Nur POST zulassen
  if (event.httpMethod !== "POST") {
    console.warn("[AdStrategySave] Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Supabase Client initialisieren
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[AdStrategySave] Failed to init Supabase client:", {
      message: err.message,
      stack: err.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Supabase client init failed",
        details: err.message || String(err),
      }),
    };
  }

  try {
    // Body parsen
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body || "{}");
    } catch (err) {
      console.error("[AdStrategySave] Failed to parse JSON body:", {
        rawBody: event.body,
        message: err.message,
        stack: err.stack,
      });
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid JSON body",
          details: err.message || String(err),
        }),
      };
    }

    const {
      adVariantId,
      userId,
      answers,
      strategyRecommendation,
    } = parsedBody;

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategyRecommendation: !!strategyRecommendation,
      hasStrategyObject: !!(strategyRecommendation && strategyRecommendation.strategy),
    });

    // Required Fields check
    if (
      !adVariantId ||
      !userId ||
      !strategyRecommendation ||
      !strategyRecommendation.strategy
    ) {
      console.error("[AdStrategySave] Missing required fields", {
        adVariantIdPresent: !!adVariantId,
        userIdPresent: !!userId,
        hasStrategyRecommendation: !!strategyRecommendation,
        hasStrategy: !!(strategyRecommendation && strategyRecommendation.strategy),
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields",
          details:
            "adVariantId, userId and strategyRecommendation.strategy are required",
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

    console.log("[AdStrategySave] Upserting payload into ad_strategies:", {
      insertPayload,
    });

    const { data, error } = await supabase
      .from("ad_strategies")
      .upsert(insertPayload, { onConflict: "ad_variant_id" })
      .select()
      .single();

    if (error) {
      console.error("[AdStrategySave] Supabase error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to save strategy",
          details: error.message || error,
          supabase: {
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        }),
      };
    }

    console.log("[AdStrategySave] Strategy saved successfully:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[AdStrategySave] Handler error:", {
      message: err.message,
      stack: err.stack,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected server error",
        details: err.message || String(err),
      }),
    };
  }
};
