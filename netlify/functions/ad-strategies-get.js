// netlify/functions/ad-strategies-get.js

const { getSupabaseClient } = require("./_shared/supabaseClient");

exports.handler = async (event) => {
  console.log("[AdStrategiesGet] Incoming request:", {
    method: event.httpMethod,
    query: event.queryStringParameters || null,
  });

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[AdStrategiesGet] Failed to init Supabase client:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Supabase client init failed",
        details: err.message || String(err),
      }),
    };
  }

  try {
    const { userId, adVariantId } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing userId in query string" }),
      };
    }

    let query = supabase
      .from("ad_strategies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (adVariantId) {
      query = query.eq("ad_variant_id", adVariantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[AdStrategiesGet] Supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to load strategies",
          details: error.message || error,
        }),
      };
    }

    console.log("[AdStrategiesGet] Loaded strategies:", {
      count: Array.isArray(data) ? data.length : 0,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ strategies: data || [] }),
    };
  } catch (err) {
    console.error("[AdStrategiesGet] Handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected server error",
        details: err.message || String(err),
      }),
    };
  }
};
