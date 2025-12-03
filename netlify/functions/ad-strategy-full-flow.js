/**
 * Orchestrator – ONE CALL
 * Questionnaire → Save → Meta Ads Setup (OpenAI)
 */
const { getSupabaseClient } = require("./_shared/supabaseClient");
const OpenAI = require("openai");

exports.handler = async (event) => {
  console.log("[FullFlow] Incoming request", event.httpMethod);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const {
    adVariantId,
    userId,
    answers,
    strategyRecommendation,
    generatedAd,
  } = JSON.parse(event.body || "{}");

  if (!adVariantId || !userId || !answers) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  let supabase = null;
  try {
    supabase = getSupabaseClient();
  } catch (e) {
    console.error("[FullFlow] Supabase init failed", e);
    return { statusCode: 500, body: JSON.stringify({ error: "Supabase init failed" }) };
  }

  /** 1) Save strategy (reuse ad-strategy-save logic) */
  console.log("[FullFlow] 1/3 Saving strategy…");

  let { data: savedStrategy, error: saveError } = await supabase
    .from("ad_strategies")
    .insert({
      user_id: userId,
      ad_variant_id: adVariantId,
      questionnaire_answers: answers,
      selected_strategy: strategyRecommendation.strategy,
      selected_strategy_data: strategyRecommendation.strategy,
      ai_analysis: strategyRecommendation,
      matching_score: strategyRecommendation.score,
      confidence_level: strategyRecommendation.confidence,
      status: "analyzed"
    })
    .select("*")
    .single();

  if (saveError) {
    console.error("[FullFlow] saveError", saveError);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to save strategy" }) };
  }

  /** 2) Generate Meta Ads Setup using OpenAI */
  console.log("[FullFlow] 2/3 Generating Meta Ads Setup…");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Du bist ein Meta Ads / Facebook Performance Marketer.
Erstelle ein vollständiges Kampagnen-Setup basierend auf:

- Strategie: ${JSON.stringify(strategyRecommendation, null, 2)}
- Nutzung: ${JSON.stringify(answers, null, 2)}
- Generierte Ad: ${JSON.stringify(generatedAd, null, 2)}

Gib ein JSON zurück:
{
 "campaign_config": { ... },
 "adsets_config": [ ... ],
 "ads_config": [ ... ],
 "recommendations": { ... }
}
  `;

  let openAIResult = null;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "system", content: "Du bist ein Meta Ads Experte." }, { role: "user", content: prompt }],
      max_tokens: 6000
    });

    openAIResult = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("[FullFlow] OpenAI error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "OpenAI failed" }) };
  }

  /** 3) Store Meta Setup */
  console.log("[FullFlow] 3/3 Saving Meta Ads Setup…");

  let { data: metaData, error: metaError } = await supabase
    .from("ad_meta_setup")
    .insert({
      ad_strategy_id: savedStrategy.id,
      setup_data: openAIResult,
      created_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (metaError) {
    console.error("[FullFlow] metaError", metaError);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to save Meta Setup" }) };
  }

  /** SUCCESS */
  return {
    statusCode: 200,
    body: JSON.stringify({
      strategy: savedStrategy,
      meta: metaData,
      openAI: openAIResult,
      status: "ok"
    })
  };
};
