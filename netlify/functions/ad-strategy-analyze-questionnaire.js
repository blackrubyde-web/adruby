const {
  getStrategyBlueprintByCategory,
  getBlueprintSections,
} = require("./_shared/strategyBlueprints");

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

async function generateStrategyRecommendation(answers, strategies) {
  // Placeholder implementation — replace with real OpenAI logic when available.
  return {
    strategy: {
      title: "D2C Performance Strategy – Placeholder",
      description: "Dies ist ein Platzhalter für die echte OpenAI-Logik.",
      budget_recommendations: {
        daily_budget: "Empfohlen: 50–100 € / Tag als Startpunkt",
      },
    },
    score: 82,
    confidence: "medium",
    key_alignments: ["Passt zu deinem Funnel-Status und Budgetrahmen."],
    implementation_recommendations: ["Starte mit 2–3 Kampagnen und 3–5 Creatives je Adset."],
    alternatives: [],
    reasoning: "Platzhalter-Begründung. Diese sollte später vom Modell kommen.",
  };
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

    const recommendation = await generateStrategyRecommendation(answers, strategies);

    let diagnosis = { primary_problem: "hook", secondary_problems: [], kpi_snapshot: {}, kpi_pattern_tags: [] };
    try {
      diagnosis = buildDiagnosis(answers);
      console.log("[Questionnaire] Diagnosis:", diagnosis);
    } catch (err) {
      console.error("[Questionnaire][Diagnosis] Failed to build diagnosis", err);
    }

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
      console.error("[Questionnaire][Blueprint] Failed to load blueprint/sections", err);
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
    console.error("[Questionnaire][Handler] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
