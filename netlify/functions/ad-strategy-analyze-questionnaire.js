// netlify/functions/ad-strategy-analyze-questionnaire.js

const OpenAI = require("openai");
const { getSupabaseClient } = require("./_shared/supabaseClient");
const {
  getStrategyBlueprintByCategory,
  getBlueprintSections,
} = require("./_shared/strategyBlueprints");

// --- OpenAI Setup ---
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("[Questionnaire] Missing OPENAI_API_KEY");
}
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// --- Helper: Blueprint-Kategorie bestimmen ---
function resolveBlueprintCategory(payload = {}) {
  const industry =
    (
      payload.industry ||
      payload.productIndustry ||
      payload.business_type ||
      payload?.product?.industry ||
      ""
    ).toLowerCase();

  if (industry.includes("e-com") || industry.includes("ecom") || industry.includes("shop")) return "ecommerce";
  if (industry.includes("saas") || industry.includes("software") || industry.includes("tool")) return "saas_software";
  if (industry.includes("coach") || industry.includes("mentoring") || industry.includes("kurs"))
    return "coaching_education";
  if (industry.includes("b2b")) return "b2b_services";
  if (industry.includes("handwerk") || industry.includes("lokal")) return "handwerk_local";
  if (industry.includes("restaurant") || industry.includes("café") || industry.includes("cafe") || industry.includes("local"))
    return "local_business";

  return "ecommerce";
}

// --- Helper: Diagnose aus Antworten ableiten ---
function buildDiagnosis(answers = {}) {
  const diagnosis = {
    primary_problem: null,
    secondary_problems: [],
    kpi_snapshot: {
      ctr: null,
      atc_rate: null,
      purchase_cvr: null,
      roas: null,
      frequency: null,
      cpm: null,
    },
    kpi_pattern_tags: [],
  };

  if (answers?.main_problem === "tof" || answers?.creative_issue === "hook" || answers?.main_issue === "hook") {
    diagnosis.primary_problem = "hook";
    diagnosis.kpi_pattern_tags.push("ctr_low");
  }

  if (answers?.conversion_pattern === "atc_ok_purchase_bad" || answers?.conversion_dropoff === "bof") {
    diagnosis.primary_problem = diagnosis.primary_problem || "bof";
    diagnosis.secondary_problems.push("offer");
    diagnosis.kpi_pattern_tags.push("atc_ok_purchase_bad");
  }

  if (answers?.roas_behavior === "volatile") {
    if (!diagnosis.primary_problem) diagnosis.primary_problem = "fatigue";
    diagnosis.secondary_problems.push("scaling");
    diagnosis.kpi_pattern_tags.push("roas_volatile");
  }

  if (answers?.ctr != null) diagnosis.kpi_snapshot.ctr = Number(answers.ctr);
  if (answers?.atc_rate != null) diagnosis.kpi_snapshot.atc_rate = Number(answers.atc_rate);
  if (answers?.purchase_cvr != null) diagnosis.kpi_snapshot.purchase_cvr = Number(answers.purchase_cvr);
  if (answers?.roas != null) diagnosis.kpi_snapshot.roas = Number(answers.roas);
  if (answers?.frequency != null) diagnosis.kpi_snapshot.frequency = Number(answers.frequency);
  if (answers?.cpm != null) diagnosis.kpi_snapshot.cpm = Number(answers.cpm);

  if (!diagnosis.primary_problem) {
    diagnosis.primary_problem = "hook";
  }

  return diagnosis;
}

/**
 * Lädt optional den zugehörigen Ad- / Produkt-Kontext über adVariantId + userId
 * saved_ad_variants → generated_ads → products
 */
async function loadAdContext(adVariantId, userId) {
  if (!adVariantId || !userId) return null;

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("saved_ad_variants")
      .select(
        `
        id,
        user_id,
        generated_ad:generated_ads(
          *,
          product:products(*)
        )
      `
      )
      .eq("id", adVariantId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Questionnaire][AdContext] Supabase error:", error);
      return null;
    }

    if (!data) {
      console.warn("[Questionnaire][AdContext] No saved_ad_variant found for given adVariantId/userId", {
        adVariantId,
        userId,
      });
      return null;
    }

    return data;
  } catch (err) {
    console.error("[Questionnaire][AdContext] Failed to load ad context:", err);
    return null;
  }
}

/**
 * Baut eine menschenlesbare Zusammenfassung aus Produkt-Daten
 */
function buildProductSummary(product = {}) {
  if (!product) return "Keine Produktdaten vorhanden.";

  const parts = [];

  if (product.product_name) parts.push(`Produkt: ${product.product_name}`);
  if (product.industry) parts.push(`Branche: ${product.industry}`);
  if (product.target_audience) parts.push(`Zielgruppe: ${product.target_audience}`);
  if (product.main_benefits) parts.push(`Hauptnutzen: ${product.main_benefits}`);
  if (product.pain_points) parts.push(`Schmerzpunkte: ${product.pain_points}`);
  if (product.usp) parts.push(`USP: ${product.usp}`);
  if (product.price_offer) parts.push(`Preis/Angebot: ${product.price_offer}`);
  if (product.tonality) parts.push(`Tonalität: ${product.tonality}`);

  return parts.join("\n");
}

/**
 * Baut eine Zusammenfassung der aktuellen Ad
 */
function buildAdSummary(ad = {}) {
  if (!ad) return "Keine Anzeigendaten vorhanden.";

  const parts = [];

  if (ad.headline) parts.push(`Headline: ${ad.headline}`);
  if (ad.primary_text) parts.push(`Primärer Text: ${ad.primary_text}`);
  if (ad.cta) parts.push(`CTA: ${ad.cta}`);
  if (ad.conversion_score != null) parts.push(`Conversion Score: ${ad.conversion_score}/100`);
  if (ad.estimated_ctr != null) parts.push(`Geschätzte CTR: ${ad.estimated_ctr}%`);

  return parts.join("\n");
}

/**
 * Ruft OpenAI auf, um eine echte Strategie-Empfehlung zu bauen.
 * KEIN Platzhalter mehr.
 */
async function generateStrategyRecommendation(answers, strategies = [], context = {}) {
  if (!openai) {
    throw new Error("OpenAI client not initialized (missing OPENAI_API_KEY)");
  }

  const { productSummary, adSummary, blueprint, blueprintSections } = context;

  // Nur ein paar Strategien in den Prompt geben (falls später genutzt)
  const safeStrategies = Array.isArray(strategies)
    ? strategies.slice(0, 6).map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        goal_type: s.goal_type,
        performance_score: s.performance_score,
        ideal_tone: s.ideal_tone,
        recommended_budget_range: s.recommended_budget_range,
      }))
    : [];

  const blueprintInfo =
    blueprint && Array.isArray(blueprintSections)
      ? {
          id: blueprint.id,
          title: blueprint.title,
          category: blueprint.category || null,
          sections: blueprintSections.map((s) => ({
            id: s.id,
            chapter: s.chapter,
            title: s.title,
            anchor: s.anchor,
            focus: s.focus,
            kpi_tags: s.kpi_tags,
          })),
        }
      : null;

  const questionnaireJson = JSON.stringify(answers || {}, null, 2);
  const strategiesJson = JSON.stringify(safeStrategies, null, 2);
  const blueprintJson = JSON.stringify(blueprintInfo, null, 2);

  const userPrompt = `
Du bist ein Elite-Meta-Performance-Marketer (Facebook & Instagram Ads, Stand 2025).

Deine Aufgabe:
- Analysiere die Antworten aus einem 7-stufigen Strategie-Fragebogen.
- Nutze (falls vorhanden) Produkt- und Ad-Kontext.
- Nutze (falls vorhanden) einen Strategie-Blueprint mit Kapiteln/Sections als "Meta-Bibel".
- Baue daraus eine konkrete, umsetzbare Kampagnenstrategie.

WICHTIG:
- Ziel ist eine Strategie, die direkt in Meta Ads Manager als Kampagnen-, Adset- und Creative-Logik umgesetzt werden kann.
- Fokus auf ROAS, saubere Struktur, Creative-Strategie und Skaliermechanik.
- Die Strategie ist spezifisch für dieses Setup – keine generische Theorie.

VERFÜGBARE DATEN:

[FRAGEBOGEN-ANTWORTEN]
${questionnaireJson}

[PRODUKT-KONTEXT]
${productSummary || "Keine Produktdaten verfügbar."}

[ANZEIGEN-KONTEXT]
${adSummary || "Keine Anzeigendaten verfügbar."}

[OPTIONALE BASIS-STRATEGIEN]
${strategiesJson}

[OPTIONALER STRATEGIE-BLUEPRINT]
${blueprintJson}

Erstelle eine empfohlene Strategie für diese Kampagne mit folgenden Anforderungen:

- strategy.title: Klarer Name der Strategie (z. B. "High-Intent Conversion Funnel für D2C Supplement Brand").
- strategy.description: Konkrete Beschreibung, warum diese Struktur gewählt wird und wie sie funktioniert.
- strategy.budget_recommendations.daily_budget: Konkrete Empfehlung für Tagesbudget-Spanne, angepasst an Fragebogen-Antworten.
- score: Match-Score (0–100), wie gut diese Strategie zur Situation passt.
- confidence: "low", "medium", "high" oder "very_high" (nur diese Werte).
- key_alignments: Liste von Gründen, warum diese Strategie perfekt zu Zielen, Angebot, Budget, Risiko-Level etc. passt.
- implementation_recommendations: Sehr konkrete, praktische Umsetzungspunkte (Konto-/Kampagnenstruktur, Targeting, Creative-Empfehlungen, Offer/LP-Hebel).
- alternatives: 1–3 alternative Strategien mit eigenem Score, Titel, Beschreibung und kurzer Begründung, wann sie sinnvoll wären.
- reasoning: Erkläre transparent, wie du zu dieser Empfehlung gekommen bist (auf Deutsch, aber kompakt und praxisnah).
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content:
          "Du bist ein hochspezialisierter Meta-Performance-Marketing-Experte (Facebook & Instagram Ads, Stand 2025). Du erstellst praktische, direkt umsetzbare Kampagnenstrategien. Antworte NUR auf Deutsch und NUR im JSON-Format.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "strategy_recommendation",
        schema: {
          type: "object",
          properties: {
            strategy: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                budget_recommendations: {
                  type: "object",
                  properties: {
                    daily_budget: { type: "string" },
                  },
                  required: ["daily_budget"],
                  additionalProperties: true,
                },
              },
              required: ["title", "description", "budget_recommendations"],
              additionalProperties: true,
            },
            score: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            confidence: {
              type: "string",
              enum: ["low", "medium", "high", "very_high"],
            },
            key_alignments: {
              type: "array",
              items: { type: "string" },
            },
            implementation_recommendations: {
              type: "array",
              items: { type: "string" },
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  score: { type: "number" },
                  reason: { type: "string" },
                  goal_type: { type: "string" },
                  recommended_budget_range: { type: "string" },
                },
                required: ["title", "description", "score"],
                additionalProperties: true,
              },
            },
            reasoning: {
              type: "string",
            },
          },
          required: ["strategy", "score", "confidence", "key_alignments", "implementation_recommendations", "alternatives", "reasoning"],
          additionalProperties: true,
        },
      },
    },
    reasoning_effort: "high",
  });

  const raw = completion?.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[Questionnaire][OpenAI] Failed to parse JSON response:", err, raw);
    throw new Error("OpenAI response was not valid JSON.");
  }

  return parsed;
}

exports.handler = async (event) => {
  console.log("[Questionnaire] Incoming request:", {
    method: event.httpMethod,
    rawBody: event.body || null,
  });

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { answers, strategies = [] } = JSON.parse(event.body || "{}");
    console.log("[Questionnaire] Parsed payload:", {
      answers,
      hasStrategies: Array.isArray(strategies),
    });

    if (!answers || typeof answers !== "object") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid answers" }),
      };
    }

    const adVariantId = answers?.adVariantId || answers?.ad_variant_id || null;
    const userId = answers?.userId || answers?.user_id || null;

    // Optional: Ad- / Produkt-Kontext laden
    let adContext = null;
    let productSummary = null;
    let adSummary = null;

    try {
      adContext = await loadAdContext(adVariantId, userId);
      if (adContext?.generated_ad?.product) {
        productSummary = buildProductSummary(adContext.generated_ad.product);
      }
      if (adContext?.generated_ad) {
        adSummary = buildAdSummary(adContext.generated_ad);
      }
    } catch (err) {
      console.error("[Questionnaire] Failed to load ad context:", err);
    }

    // Blueprint & Sections laden
    let blueprint = null;
    let sections = [];
    try {
      const category = resolveBlueprintCategory(
        answers.product || answers || {}
      );
      const { data: bp } = await getStrategyBlueprintByCategory(category);
      blueprint = bp || null;
      if (blueprint?.id) {
        const { data: s } = await getBlueprintSections(blueprint.id);
        sections = s || [];
      }
      console.log("[Questionnaire] Blueprint resolve:", {
        category,
        blueprintId: blueprint?.id || null,
        blueprintTitle: blueprint?.title || null,
        sectionCount: Array.isArray(sections) ? sections.length : 0,
      });
    } catch (err) {
      console.error("[Questionnaire][Blueprint] Failed to load blueprint/sections", err);
    }

    // OpenAI-Empfehlung (KEIN Platzhalter mehr)
    const recommendation = await generateStrategyRecommendation(answers, strategies, {
      productSummary,
      adSummary,
      blueprint,
      blueprintSections: sections,
    });

    let diagnosis = { primary_problem: "hook", secondary_problems: [], kpi_snapshot: {}, kpi_pattern_tags: [] };
    try {
      diagnosis = buildDiagnosis(answers);
      console.log("[Questionnaire] Diagnosis:", diagnosis);
    } catch (err) {
      console.error("[Questionnaire][Diagnosis] Failed to build diagnosis", err);
    }

    const deepDiveSections = [];
    try {
      if (Array.isArray(sections)) {
        for (const section of sections) {
          const focus = Array.isArray(section.focus) ? section.focus : [];
          const kpiTags = Array.isArray(section.kpi_tags) ? section.kpi_tags : [];

          let priority = 3;
          let reason = "";

          const matchesKpi = diagnosis.kpi_pattern_tags?.some((tag) => kpiTags.includes(tag));
          if (matchesKpi) {
            priority = 1;
            reason = "Direkt verknüpft mit den erkannten KPI-Mustern deiner Kampagne.";
          } else if (
            diagnosis.primary_problem &&
            focus.some((f) =>
              (diagnosis.primary_problem === "hook" && ["hook", "creative", "positioning"].includes(f)) ||
              (diagnosis.primary_problem === "bof" && ["bof", "offer", "checkout"].includes(f)) ||
              (diagnosis.primary_problem === "retention" && ["retention", "ltv", "lifecycle"].includes(f)) ||
              (diagnosis.primary_problem === "tracking" && ["tracking", "measurement", "attribution"].includes(f)) ||
              (diagnosis.primary_problem === "fatigue" && ["testing", "fatigue", "creative_engine"].includes(f)) ||
              (diagnosis.primary_problem === "scaling" && ["scaling", "budget", "structure"].includes(f))
            )
          ) {
            priority = 2;
            reason = "Unterstützt die Lösung des Hauptproblems deiner Kampagne.";
          }

          if (priority <= 2) {
            deepDiveSections.push({
              section_id: section.id,
              blueprint_id: section.blueprint_id,
              title: section.title,
              chapter: section.chapter,
              anchor: section.anchor,
              reason,
              priority,
            });
          }
        }
      }
      console.log("[Questionnaire] Deep dive sections:", {
        count: Array.isArray(deepDiveSections) ? deepDiveSections.length : 0,
        priorities: deepDiveSections.map((s) => s.priority),
      });
    } catch (err) {
      console.error("[Questionnaire][DeepDive] Failed to map sections", err);
    }

    const extendedRecommendation = {
      ...recommendation,
      diagnosis,
      deep_dive_sections: deepDiveSections,
      blueprint_id: blueprint?.id || null,
      blueprint_title: blueprint?.title || null,
      adVariantId: adVariantId,
      userId: userId,
    };

    console.log("[Questionnaire] Final recommendation shape:", {
      hasStrategy: !!extendedRecommendation.strategy,
      score: extendedRecommendation.score,
      confidence: extendedRecommendation.confidence,
      hasDiagnosis: !!extendedRecommendation.diagnosis,
      deepDiveCount: Array.isArray(extendedRecommendation.deep_dive_sections)
        ? extendedRecommendation.deep_dive_sections.length
        : 0,
      adVariantId: extendedRecommendation.adVariantId || null,
      userId: extendedRecommendation.userId || null,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        strategyRecommendation: extendedRecommendation,
      }),
    };
  } catch (err) {
    console.error("[Questionnaire][Handler] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message || String(err) }),
    };
  }
};
