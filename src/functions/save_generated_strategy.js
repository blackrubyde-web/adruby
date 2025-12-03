const { getSupabaseClient } = require("../../netlify/functions/_shared/supabaseClient");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { ad_id, user_id, strategy_data } = JSON.parse(event.body || "{}");

    if (!ad_id || !user_id || !strategy_data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: ad_id, user_id, strategy_data" }),
      };
    }

    const { data, error } = await supabase
      .from("generated_strategies")
      .insert([{ ad_id, user_id, strategy_data }])
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Strategy saved successfully", data }),
    };
  } catch (err) {
    console.error("Error saving strategy:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save strategy", details: err.message }),
    };
  }
};
