import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel } from "./_shared/openai.js";
import { parseWithRepair } from "./_shared/repair.js";
import { StrategyPlanSchema, STRATEGY_PLAN_JSON_SCHEMA } from "./_shared/creativeSchemas.js";
import { buildStrategyPrompt } from "./_shared/creativePrompts.js";

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s-]/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreBlueprint(blueprint, keywords) {
  if (!blueprint) return 0;
  const hay = [
    blueprint.title,
    blueprint.category,
    blueprint.raw_content_markdown?.slice(0, 1200),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;
  keywords.forEach((kw) => {
    if (kw && hay.includes(kw)) score += 1;
  });
  return score;
}

async function pickBlueprint({ brief }) {
  const { data: blueprints, error } = await supabaseAdmin
    .from("strategy_blueprints")
    .select("id,title,category,raw_content_markdown,created_at")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(blueprints) || blueprints.length === 0) {
    return { blueprint: null, warning: "no_blueprints" };
  }

  if (blueprints.length === 1) {
    return { blueprint: blueprints[0], warning: null };
  }

  const keywords = [
    ...(brief?.product?.name ? tokenize(brief.product.name) : []),
    ...(brief?.product?.category ? tokenize(brief.product.category) : []),
    ...(brief?.audience?.summary ? tokenize(brief.audience.summary) : []),
    ...(Array.isArray(brief?.audience?.segments) ? brief.audience.segments.flatMap(tokenize) : []),
  ];

  let best = blueprints[0];
  let bestScore = -1;
  for (const bp of blueprints) {
    const score = scoreBlueprint(bp, keywords);
    if (score > bestScore) {
      best = bp;
      bestScore = score;
    }
  }

  return { blueprint: best, warning: null };
}

async function callOpenAiJson(prompt, responseFormat, { retries = 2 } = {}) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();
  const useSchema = process.env.USE_JSON_SCHEMA === "1";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 60000);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("OpenAI request timed out")), timeoutMs);
    });

    const requestPromise = openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown. Follow the schema strictly.",
        },
        { role: "user", content: [{ type: "input_text", text: prompt }] },
      ],
      temperature: 0.2,
      ...(useSchema && responseFormat
        ? {
            text: {
              format: {
                type: "json_schema",
                name: responseFormat?.name || "schema",
                schema: responseFormat?.schema || responseFormat,
                strict: responseFormat?.strict ?? true,
              },
            },
          }
        : {}),
    });

    try {
      const res = await Promise.race([requestPromise, timeoutPromise]).finally(() =>
        clearTimeout(timeoutId),
      );
      return res.output_text;
    } catch (err) {
      const isTimeout = err instanceof Error && /timed out/i.test(err.message);
      if (!isTimeout || attempt >= retries) {
        throw err;
      }
      const backoffMs = 1500 + attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw new Error("OpenAI request timed out");
}

export async function handler(event) {
  const headers = { ...withCors().headers, "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const entitlement = await requireActiveSubscription(userId);
  if (!entitlement.ok) return entitlement.response;

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const creativeId = typeof body?.creativeId === "string" ? body.creativeId.trim() : "";
  if (!creativeId) return badRequest("creativeId is required");

  try {
    const { data: row, error } = await supabaseAdmin
      .from("generated_creatives")
      .select("id,user_id,blueprint_id,inputs,outputs")
      .eq("id", creativeId)
      .single();

    if (error || !row) {
      return badRequest("Creative not found");
    }
    if (row.user_id !== userId) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Not allowed" }) };
    }

    const inputs = row.inputs || {};
    const outputs = row.outputs || null;
    const brief = outputs?.brief || inputs?.brief || null;
    if (!brief) {
      return badRequest("Creative brief missing");
    }

    let strategyBlueprintId =
      typeof body?.strategyId === "string" ? body.strategyId.trim() : row.blueprint_id || null;
    let blueprint = null;

    if (!strategyBlueprintId) {
      const auto = await pickBlueprint({ brief });
      blueprint = auto.blueprint;
      strategyBlueprintId = blueprint?.id || null;
    }

    if (strategyBlueprintId) {
      const { data: bp, error: bpError } = await supabaseAdmin
        .from("strategy_blueprints")
        .select("id,title,category,raw_content_markdown")
        .eq("id", strategyBlueprintId)
        .single();
      if (!bpError && bp) blueprint = bp;
    }

    const researchIds = Array.isArray(inputs?.researchIds) ? inputs.researchIds : [];
    let researchContext = [];
    if (researchIds.length > 0) {
      const { data: researchRows } = await supabaseAdmin
        .from("ad_research_ads")
        .select("page_name,primary_text,headline,description,image_url")
        .in("id", researchIds);
      researchContext = researchRows || [];
    }

    const prompt = buildStrategyPrompt({
      brief,
      blueprint: blueprint?.raw_content_markdown || null,
      blueprintTitle: blueprint?.title || null,
      outputs,
      researchContext,
      userNotes: inputs?.strategy_notes || null,
    });

    const raw = await callOpenAiJson(prompt, STRATEGY_PLAN_JSON_SCHEMA);
    const repaired = await parseWithRepair({
      schema: StrategyPlanSchema,
      initial: raw,
      makeRequest: async (instruction) =>
        callOpenAiJson(`${prompt}\n\n${instruction}`, STRATEGY_PLAN_JSON_SCHEMA),
    });

    const strategy = repaired.data;
    const updatedInputs = {
      ...(inputs && typeof inputs === "object" ? inputs : {}),
      ai_strategy: strategy,
      strategy_id: strategyBlueprintId,
    };

    await supabaseAdmin
      .from("generated_creatives")
      .update({ inputs: updatedInputs, blueprint_id: strategyBlueprintId })
      .eq("id", creativeId);

    return ok({
      strategy,
      blueprint: blueprint ? { id: blueprint.id, title: blueprint.title } : null,
    });
  } catch (err) {
    console.error("[strategy-generate] failed", err);
    captureException(err, { function: "strategy-generate" });
    return serverError(err?.message || "Strategy generation failed.");
  }
}
