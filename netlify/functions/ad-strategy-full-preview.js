// netlify/functions/ad-strategy-full-preview.js

const { getSupabaseClient } = require("./_shared/supabaseClient");
const { getOpenAIClient } = require("./_shared/openaiClient");

exports.handler = async (event) => {
  console.log("[FullFlow] Incoming request", {
    method: event.httpMethod,
    hasBody: !!event.body,
  });

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("[FullFlow] Failed to parse JSON body", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { adVariantId, userId, answers } = payload;
  console.log("[FullFlow] Parsed payload:", {
    adVariantId,
    userId,
    hasAnswers: !!answers,
  });

  if (!adVariantId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing adVariantId or userId" }),
    };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error("[FullFlow] Supabase init failed", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Supabase init failed" }),
    };
  }

  // Load ad variant with generated ad + product
  const { data: adVariant, error: adError } = await supabase
    .from("saved_ad_variants")
    .select(
      `
        id,
        user_id,
        *,
        generated_ad:generated_ads(
          *,
          product:products(*)
        )
      `
    )
    .eq("id", adVariantId)
    .single();

  if (adError) {
    console.error("[FullFlow] Failed to load adVariant:", adError);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to load saved ad variant",
        details: adError.message || adError,
      }),
    };
  }

  console.log("[FullFlow] Loaded adVariant", {
    id: adVariant?.id,
    hasGeneratedAd: !!adVariant?.generated_ad,
    productName: adVariant?.generated_ad?.product?.product_name,
  });

  // Load blueprint
  const industry = adVariant?.generated_ad?.product?.industry || "generic";
  const goal = answers?.goal || "sales";

  const { data: blueprints, error: blueprintError } = await supabase
    .from("strategy_blueprints")
    .select("*")
    .eq("industry", industry)
    .eq("primary_goal", goal)
    .order("blueprint_key", { ascending: true });
  // Kein maybeSingle(), kein limit(1) hier – wir holen alle und wählen selbst das erste

  if (blueprintError) {
    console.error("[FullFlow] Blueprint fetch error", blueprintError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load blueprint" }),
    };
  }

  const blueprint = Array.isArray(blueprints) && blueprints.length > 0
    ? blueprints[0]
    : null;

  if (!blueprint) {
    console.error("[FullFlow] No matching blueprint found", { industry, goal });
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Kein passender Strategy-Blueprint gefunden. Bitte einen Blueprint für diese Branche/Ziel anlegen.",
        industry,
        goal,
      }),
    };
  }

  console.log("[FullFlow] Loaded blueprint", {
    exists: !!blueprint,
    id: blueprint?.id,
    blueprint_key: blueprint?.blueprint_key,
    industry: blueprint?.industry,
    primary_goal: blueprint?.primary_goal,
  });

  const product = adVariant?.generated_ad?.product || {};
  const generatedAd = adVariant?.generated_ad || {};

  const fullFlowSchema = {
    name: "full_strategy_and_meta_setup",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        strategyResult: {
          type: "object",
          additionalProperties: false,
          properties: {
            strategy: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                budget_recommendations: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    daily_budget: { type: "string" },
                  },
                  required: ["daily_budget"],
                },
              },
              required: ["title", "description", "budget_recommendations"],
            },
            score: { type: "number" },
            confidence: { type: "string" },
            key_alignments: {
              type: "array",
              items: { type: "string" },
            },
            implementation_recommendations: {
              type: "array",
              items: { type: "string" },
            },
            deep_dive_sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  section_id: { type: "string" },
                  chapter: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "number" },
                },
                required: ["section_id", "chapter", "title", "reason", "priority"],
              },
            },
            diagnosis: {
              type: "object",
              additionalProperties: false,
              properties: {
                primary_problem: {
                  type: "string",
                  enum: ["hook", "offer", "bof", "retention", "tracking", "fatigue", "scaling"],
                },
                kpi_snapshot: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    ctr: { type: "number" },
                    atc_rate: { type: "number" },
                    purchase_cvr: { type: "number" },
                    roas: { type: "number" },
                    frequency: { type: "number" },
                    cpm: { type: "number" },
                  },
                  required: ["ctr", "atc_rate", "purchase_cvr", "roas", "frequency", "cpm"],
                },
              },
              required: ["primary_problem", "kpi_snapshot"],
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  score: { type: "number" },
                  reason: { type: "string" },
                },
                required: ["title", "description", "score", "reason"],
              },
            },
            reasoning: { type: "string" },
            blueprint_key: { type: "string" },
          },
          required: [
            "strategy",
            "score",
            "confidence",
            "key_alignments",
            "implementation_recommendations",
            "deep_dive_sections",
            "diagnosis",
            "alternatives",
            "reasoning",
            "blueprint_key",
          ],
        },
        metaAdsSetup: {
          type: "object",
          additionalProperties: false,
          properties: {
            campaign_config: {
              type: "object",
              additionalProperties: false,
              properties: {
                campaign_name: { type: "string" },
                objective: { type: "string" },
                budget: { type: "string" },
                optimization_goal: { type: "string" },
                duration: { type: "string" },
                notes: { type: "string" },
              },
              required: [
                "campaign_name",
                "objective",
                "budget",
                "optimization_goal",
                "duration",
                "notes",
              ],
            },
            adsets_config: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  budget: { type: "string" },
                  placements: { type: "string" },
                  target_audience: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      age: { type: "string" },
                      locations: {
                        type: "array",
                        items: { type: "string" },
                      },
                      interests: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["age", "locations", "interests"],
                  },
                },
                required: ["name", "budget", "placements", "target_audience"],
              },
            },
            ads_config: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  format: { type: "string" },
                  headline: { type: "string" },
                  primary_text: { type: "string" },
                  cta: { type: "string" },
                  tracking: { type: "string" },
                },
                required: ["name", "format", "headline", "primary_text", "cta", "tracking"],
              },
            },
            recommendations: {
              type: "object",
              additionalProperties: false,
              properties: {
                testing: { type: "string" },
                scaling: { type: "string" },
                reporting: { type: "string" },
              },
              required: ["testing", "scaling", "reporting"],
            },
          },
          required: [
            "campaign_config",
            "adsets_config",
            "ads_config",
            "recommendations",
          ],
        },
      },
      required: ["strategyResult", "metaAdsSetup"],
    },
  };

  const systemPrompt = `


Du bist ein Elite-Full-Funnel-Meta-Ads-Stratege (DACH-Markt, Performance-Fokus).
Deine Aufgabe:

Nimm den gelieferten Strategie-Blueprint (Meta-Bibel).

Nimm die konkrete Ad (Hook, Headline, Primary Text, Offer).

Nimm die Antworten aus dem 7-Schritte-Fragebogen.

Erstelle daraus eine vollständig ausgearbeitete Werbestrategie UND ein detailliertes Meta-Ads-Setup, das 1:1 in den Meta Ads Manager 2025 übernommen werden kann.

Wichtige Regeln:

Schreibe auf Deutsch.

Schreibe klar, konkret, ohne Bullshit.

Kein Agentur-Blabla, sondern exakte Empfehlungen.

Halte dich strikt an das JSON-Schema.
`;

  const userPrompt = {
    blueprint,
    product: {
      name: product.product_name,
      industry: product.industry,
      target_audience: product.target_audience,
      tonality: product.tonality,
      price_point: product.price_point,
    },
    generatedAd: {
      headline: generatedAd.headline,
      primary_text: generatedAd.primary_text,
      hook: generatedAd.hook,
      cta: generatedAd.cta,
    },
    questionnaire_answers: answers || {},
  };

  let aiResult;
  try {
    const openai = getOpenAIClient();
    console.log("[FullFlow] Calling OpenAI for full strategy flow…");
    console.log("[FullFlow] Calling OpenAI with context", {
      adVariantId,
      userId,
      blueprintKey: blueprint?.key || null,
      answersKeys: Object.keys(answers || {}),
    });

    const response = await openai.responses.create({
      model: process.env.ADSTRATEGY_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Erstelle eine vollständige Werbestrategie + Meta Ads Setup basierend auf diesen Daten. Antworte ausschließlich als JSON nach Schema.",
            },
            {
              type: "input_text",
              text: `Hier sind alle relevanten Daten im JSON-Format:\n${JSON.stringify(
                userPrompt
              )}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: fullFlowSchema.name || "full_strategy_and_meta_setup",
          strict: fullFlowSchema.strict,
          schema: fullFlowSchema.schema,
        },
      },
    });

    // Responses API: JSON sitzt im output[..].content[..].json
    aiResult = response.output?.[0]?.content?.[0]?.json || null;

    console.log("[FullFlow] OpenAI full strategy generated", {
      hasStrategy: !!aiResult?.strategyResult?.strategy,
      hasMetaSetup: !!aiResult?.metaAdsSetup,
    });
  } catch (openAiError) {
    console.error("[FullFlow] OpenAI error", openAiError);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "OpenAI full strategy generation failed",
        details: openAiError.message,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      strategyResult: aiResult?.strategyResult || null,
      metaAdsSetup: aiResult?.metaAdsSetup || null,
    }),
  };
};
