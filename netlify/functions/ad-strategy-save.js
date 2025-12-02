// netlify/functions/ad-strategy-save.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event, context) => {
  console.log("[AdStrategySave] Incoming request:", {
    method: event.httpMethod,
    body: event.body,
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

    console.log("[AdStrategySave] FULL PAYLOAD", parsedBody);

    const { adVariantId, userId, answers, strategyRecommendation } = parsedBody;

    console.log("[AdStrategySave] Parsed payload:", {
      adVariantId,
      userId,
      hasAnswers: !!answers,
      hasStrategyRecommendation: !!strategyRecommendation,
      hasStrategyObject: !!(strategyRecommendation && strategyRecommendation.strategy),
    });

    // Required Fields check
    if (!strategyRecommendation?.strategy || !adVariantId || !userId) {
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
        blueprint_id: strategyRecommendation.blueprint_id || null,
        blueprint_title: strategyRecommendation.blueprint_title || null,
      },
    };

    console.log("[AdStrategySave] Determining whether to INSERT or UPDATE for ad_variant_id:", adVariantId);

    // 1) Check, ob bereits ein Datensatz für diese ad_variant_id existiert
    const { data: existing, error: fetchError } = await supabase
      .from("ad_strategies")
      .select("id, ad_variant_id")
      .eq("ad_variant_id", adVariantId)
      .maybeSingle();

    if (fetchError) {
      console.error("[AdStrategySave] Failed to fetch existing strategy:", {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code,
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch existing strategy",
          details: fetchError.message || fetchError,
        }),
      };
    }

    let dbResult;
    if (existing) {
      // UPDATE-Fall
      console.log("[AdStrategySave] Existing strategy found, performing UPDATE:", {
        existingId: existing.id,
        ad_variant_id: existing.ad_variant_id,
      });

      const { data, error } = await supabase
        .from("ad_strategies")
        .update(insertPayload)
        .eq("ad_variant_id", adVariantId)
        .select()
        .single();

      if (error) {
        console.error("[AdStrategySave] Supabase UPDATE error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error,
        });

        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Failed to update strategy",
            details: error.message || error,
            supabase: {
              code: error.code,
              details: error.details,
              hint: error.hint,
            },
          }),
        };
      }

      dbResult = data;
    } else {
      // INSERT-Fall
      console.log("[AdStrategySave] No existing strategy, performing INSERT:", {
        ad_variant_id: adVariantId,
      });

      const { data, error } = await supabase
        .from("ad_strategies")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error("[AdStrategySave] Supabase INSERT error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error,
        });

        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Failed to insert strategy",
            details: error.message || error,
            supabase: {
              code: error.code,
              details: error.details,
              hint: error.hint,
            },
          }),
        };
      }

      dbResult = data;
    }

    console.log("[AdStrategySave] Strategy saved successfully:", dbResult);

    return {
      statusCode: 200,
      body: JSON.stringify(dbResult),
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
