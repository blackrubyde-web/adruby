// netlify/functions/ad-strategy-analyze-questionnaire.js

const OpenAI = require("openai");
const {
  getStrategyBlueprintByCategory,
  getBlueprintSections,
} = require("./_shared/strategyBlueprints");

// --- OpenAI Client ----------------------------------------------------------
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("[Questionnaire][OpenAI] Missing OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey });

// --- Helper: Blueprint-Kategorie aus Antworten / Produkt ableiten -----------

function resolveBlueprintCategory(payload = {}) {
  const industry =
    (
      payload.industry ||
      payload.productIndustry ||
      payload.business_type ||
      payload?.product?.industry ||
      ""
    ).toLowerCase();

  if (industry.includes("e-com") || industry.includes("ecom") || industry.includes("shop"))
    return "ecommerce";
  if (industry.includes("saas") || industry.includes("software") || industry.includes("tool"))
    return "saas_software";
  if (industry.includes("coach") || industry.includes("mentoring") || industry.includes("kurs"))
    return "coaching_education";
  if (industry.includes("b2b")) return "b2b_services";
  if (industry.includes("handwerk") || industry.includes("lokal"))
    return "handwerk_local";
  if (
    industry.includes("restaurant") ||
    industry.includes("café") ||
    industry.includes("cafe") ||
    industry.includes("local")
  )
    return "local_business";

  return "ecommerce";
}

// --- Helper: Diagnose aus Fragebogen bauen ---------------------------------

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

  if (
    answers?.main_problem === "tof" ||
    answers?.creative_issue === "hook" ||
    answers?.main_issue === "hook"
  ) {
    diagnosis.primary_problem = "hook";
    diagnosis.kpi_pattern_tags.push("ctr_low");
  }

  if (
    answers?.conversion_pattern === "atc_ok_purchase_bad" ||
    answers?.conversion_dropoff === "bof"
  ) {
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
  if (answers?.purchase_cvr != null)
    diagnosis.kpi_snapshot.purchase_cvr = Number(answers.purchase_cvr);
  if (answers?.roas != null) diagnosis.kpi_snapshot.roas = Number(answers.roas);
  if (answers?.frequency != null)
    diagnosis.kpi_snapshot.frequency = Number(answers.frequency);
  if (answers?.cpm != null) diagnosis.kpi_snapshot.cpm = Number(answers.cpm);

  if (!diagnosis.primary_problem) {
    diagnosis.primary_problem = "hook";
  }

  return diagnosis;
}

// --- OpenAI: Echte Strategie-Empfehlung generieren -------------------------

async function generateStrategyRecommendation(answers, strategies) {
  // Wenn keine Strategien in der DB sind -> Mini-Fallback
  if (!Array.isArray(strategies) || strategies.length === 0) {
    console.warn(
      "[Questionnaire][OpenAI] No strategies provided. Falling back to simple template."
    );
    return {
      strategy: {
        title: "Performance Strategy (Default)",
        description:
          "Standardisierte Performance-Strategie basierend auf deinen Antworten. Ergänze sie im AdRuby-Strategie-Blueprint.",
        budget_recommendations: {
          daily_budget: "Passe dein Budget abhängig von Marge und Ziel-CPA an.",
        },
      },
      score: 80,
      confidence: "medium",
      key_alignments: [
        "Basierend auf deinen Zielen, Budgetangaben und Risikoprofil.",
      ],
      implementation_recommendations: [
        "Starte mit 2–3 Kampagnenstrukturen und mehreren Creatives pro Adset.",
      ],
      alternatives: [],
      reasoning:
        "Fallback-Empfehlung, weil keine spezifischen Strategien aus der Datenbank geladen wurden.",
    };
  }

  const diagnosisPreview = buildDiagnosis(answers);

  const payloadForModel = {
    questionnaire_answers: answers,
    available_strategies: strategies,
    diagnosis_preview: diagnosisPreview,
  };

  const systemPrompt =
    "Du bist ein Senior Meta Ads Stratege (Facebook & Instagram) und arbeitest für ein Profi-Tool namens AdRuby.\n" +
    "Auf Basis von (1) Fragebogen-Antworten, (2) verfügbaren Strategie-Blueprints aus der Datenbank und (3) einer groben Diagnose sollst du:\n" +
    "- die BESTPASSENDE Strategie auswählen oder aus den vorhandenen Strategien ableiten,\n" +
    "- ein strukturiertes JSON zurückgeben (kein Fließtext),\n" +
    "- maximal 1 Hauptstrategie + einige Alternativen liefern.\n" +
    "Sprich den Nutzer in der dritten Person an (\"die Kampagne\", \"das Konto\") – nicht direkt mit \"du\".";

  try {
    console.log("[Questionnaire][OpenAI] Calling model for recommendation...");

    const response = await openai.responses.create({
      // Du kannst das Modell auch über ENV steuern, z.B. ADSTRATEGY_MODEL
      model: process.env.ADSTRATEGY_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Hier sind Fragebogen-Antworten, verfügbare Strategien und Diagnose als JSON:\n\n" +
            JSON.stringify(payloadForModel, null, 2) +
            "\n\nErzeuge bitte ein kompaktes, sauberes JSON entsprechend des Schemas.",
        },
      ],
      // WICHTIG: Kein temperature-Override -> vermeidet deinen 400er-Fehler
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "strategy_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              strategy: {
                type: "object",
                description:
                  "Die ausgewählte Hauptstrategie inkl. Meta-spezifischer Infos.",
                properties: {
                  id: { type: "string", nullable: true },
                  title: { type: "string" },
                  description: { type: "string" },
                  goal_type: { type: "string", nullable: true },
                  platform: { type: "string", nullable: true },
                  step_by_step: { type: "string", nullable: true },
                  recommended_budget_range: {
                    type: "string",
                    nullable: true,
                  },
                  budget_recommendations: {
                    type: "object",
                    nullable: true,
                    properties: {
                      daily_budget: { type: "string", nullable: true },
                      notes: { type: "string", nullable: true },
                    },
                    additionalProperties: true,
                  },
                  // Wir erlauben zusätzliche Felder, damit der Bot frei anreichern kann
                  meta: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                },
                required: ["title", "description"],
                additionalProperties: true,
              },
              score: {
                type: "number",
                description: "Match-Score 0–100",
              },
              confidence: {
                type: "string",
                description: "Verbalisiertes Confidence-Level",
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
                    id: { type: "string", nullable: true },
                    title: { type: "string" },
                    description: { type: "string" },
                    score: { type: "number", nullable: true },
                    reason: { type: "string", nullable: true },
                    goal_type: { type: "string", nullable: true },
                    platform: { type: "string", nullable: true },
                    step_by_step: { type: "string", nullable: true },
                    recommended_budget_range: {
                      type: "string",
                      nullable: true,
                    },
                  },
                  required: ["title", "description"],
                  additionalProperties: true,
                },
              },
              reasoning: {
                type: "string",
                description:
                  "Kurze Begründung, warum diese Hauptstrategie am besten passt.",
              },
            },
            required: ["strategy", "score", "confidence"],
            additionalProperties: false,
          },
        },
      },
      max_output_tokens: 1400,
    });

    const raw =
      response?.output?.[0]?.content?.[0]?.text ||
      response?.output?.[0]?.content?.[0]?.json;

    if (!raw) {
      console.error(
        "[Questionnaire][OpenAI] Empty response content – falling back."
      );
      throw new Error("Empty OpenAI response");
    }

    const parsed =
      typeof raw === "string" ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw));

    console.log("[Questionnaire][OpenAI] Parsed recommendation:", {
      hasStrategy: !!parsed.strategy,
      score: parsed.score,
      confidence: parsed.confidence,
      alternatives: Array.isArray(parsed.alternatives)
        ? parsed.alternatives.length
        : 0,
    });

    return parsed;
  } catch (err) {
    console.error("[Questionnaire][OpenAI] Error – using fallback:", {
      message: err.message,
      stack: err.stack,
    });

    // Sauberer Fallback, falls OpenAI ausfällt / timeouted
    return {
      strategy: {
        title: "Fallback Performance Strategy",
        description:
          "Fallback-Strategie, weil der KI-Call nicht erfolgreich war. Nutzt trotzdem deine Fragebogen-Antworten für eine solide Ausgangsbasis.",
        budget_recommendations: {
          daily_budget:
            "Starte mit einem moderaten Tagesbudget und skaliere in 10–20% Schritten bei stabilem ROAS.",
        },
      },
      score: 75,
      confidence: "low",
      key_alignments: [
        "Auf Basis der beantworteten Fragen zu Ziel, Budget und Risiko erstellt.",
      ],
      implementation_recommendations: [
        "Halte deine Kampagnenstruktur schlank und teste vor allem Creatives.",
      ],
      alternatives: [],
      reasoning:
        "Technischer Fallback, weil das Modell nicht erfolgreich antworten konnte.",
    };
  }
}

// --- Main Handler -----------------------------------------------------------

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

    // 1) KI-Empfehlung holen
    const recommendation = await generateStrategyRecommendation(
      answers,
      strategies
    );

    // 2) Diagnose bauen (unabhängig vom OpenAI-Call, aber mit gleichen Antworten)
    let diagnosis = {
      primary_problem: "hook",
      secondary_problems: [],
      kpi_snapshot: {},
      kpi_pattern_tags: [],
    };
    try {
      diagnosis = buildDiagnosis(answers);
      console.log("[Questionnaire] Diagnosis:", diagnosis);
    } catch (err) {
      console.error(
        "[Questionnaire][Diagnosis] Failed to build diagnosis",
        err
      );
    }

    // 3) Blueprint + Sections holen und Deep-Dive Sections berechnen
    let blueprint = null;
    let sections = [];
    try {
      const category = resolveBlueprintCategory(answers || {});
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
      console.error(
        "[Questionnaire][Blueprint] Failed to load blueprint/sections",
        err
      );
    }

    const deepDiveSections = [];
    try {
      if (Array.isArray(sections)) {
        for (const section of sections) {
          const focus = Array.isArray(section.focus) ? section.focus : [];
          const kpiTags = Array.isArray(section.kpi_tags) ? section.kpi_tags : [];

          let priority = 3;
          let reason = "";

          const matchesKpi = diagnosis.kpi_pattern_tags?.some((tag) =>
            kpiTags.includes(tag)
          );
          if (matchesKpi) {
            priority = 1;
            reason =
              "Direkt verknüpft mit den erkannten KPI-Mustern der Kampagne.";
          } else if (
            diagnosis.primary_problem &&
            focus.some((f) =>
              (diagnosis.primary_problem === "hook" &&
                ["hook", "creative", "positioning"].includes(f)) ||
              (diagnosis.primary_problem === "bof" &&
                ["bof", "offer", "checkout"].includes(f)) ||
              (diagnosis.primary_problem === "retention" &&
                ["retention", "ltv", "lifecycle"].includes(f)) ||
              (diagnosis.primary_problem === "tracking" &&
                ["tracking", "measurement", "attribution"].includes(f)) ||
              (diagnosis.primary_problem === "fatigue" &&
                ["testing", "fatigue", "creative_engine"].includes(f)) ||
              (diagnosis.primary_problem === "scaling" &&
                ["scaling", "budget", "structure"].includes(f))
            )
          ) {
            priority = 2;
            reason =
              "Unterstützt die Lösung des Hauptproblems der Kampagne unmittelbar.";
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

    // 4) Alles in ein Extended-Objekt packen (für DB + Frontend)
    const extendedRecommendation = {
      ...recommendation,
      diagnosis,
      deep_dive_sections: deepDiveSections,
      blueprint_id: blueprint?.id || null,
      blueprint_title: blueprint?.title || null,
      adVariantId: answers?.adVariantId || answers?.ad_variant_id || null,
      userId: answers?.userId || answers?.user_id || null,
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
    console.error("[Questionnaire][Handler] Error:", {
      message: err.message,
      stack: err.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
