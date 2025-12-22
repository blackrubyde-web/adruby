import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel } from "./_shared/openai.js";
import { parseWithRepair } from "./_shared/repair.js";
import { StrategyPlanSchema, STRATEGY_PLAN_JSON_SCHEMA } from "./_shared/creativeSchemas.js";
import { buildCampaignStrategyPrompt } from "./_shared/creativePrompts.js";

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

function collectKeywordsFromBriefs(briefs) {
  const tokens = [];
  briefs.forEach((brief) => {
    tokens.push(...(brief?.product?.name ? tokenize(brief.product.name) : []));
    tokens.push(...(brief?.product?.category ? tokenize(brief.product.category) : []));
    tokens.push(...(brief?.audience?.summary ? tokenize(brief.audience.summary) : []));
    if (Array.isArray(brief?.audience?.segments)) {
      tokens.push(...brief.audience.segments.flatMap(tokenize));
    }
  });
  return tokens;
}

async function pickBlueprintFromBriefs({ briefs }) {
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

  const keywords = collectKeywordsFromBriefs(briefs || []);
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

function extractPrimaryBrief(rows) {
  for (const row of rows) {
    const inputs = row?.inputs || {};
    const outputs = row?.outputs || {};
    const brief = outputs?.brief || inputs?.brief || null;
    if (brief) return brief;
  }
  return null;
}

function extractCreativeCopy(outputs, inputs) {
  if (outputs && typeof outputs === "object") {
    const creatives = Array.isArray(outputs.creatives) ? outputs.creatives : null;
    const variants = Array.isArray(outputs.variants) ? outputs.variants : null;
    const candidate = creatives?.[0] || variants?.[0] || null;
    if (candidate?.copy) {
      return {
        hook: candidate.copy.hook || null,
        primary_text: candidate.copy.primary_text || null,
        cta: candidate.copy.cta || null,
      };
    }
  }
  return {
    hook: inputs?.headline || inputs?.title || null,
    primary_text: inputs?.description || null,
    cta: inputs?.cta || null,
  };
}

function summarizeCreativeRow(row) {
  const inputs = row?.inputs || {};
  const outputs = row?.outputs || {};
  const brief = outputs?.brief || inputs?.brief || null;
  const copy = extractCreativeCopy(outputs, inputs);
  const angles = Array.isArray(brief?.angles)
    ? brief.angles
        .map((angle) => angle?.label || angle?.id)
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    id: row.id,
    product: brief?.product?.name || inputs?.productName || inputs?.brandName || null,
    brand: brief?.brand?.name || inputs?.brandName || null,
    audience: brief?.audience?.summary || inputs?.targetAudience || inputs?.audience || null,
    goal: brief?.goal || inputs?.objective || null,
    tone: brief?.tone || inputs?.tone || null,
    funnel_stage: brief?.funnel_stage || inputs?.funnel || null,
    format: brief?.format || inputs?.format || null,
    offer: brief?.offer?.summary || inputs?.offer || null,
    angles,
    copy,
  };
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

  const creativeIds = Array.isArray(body?.creativeIds)
    ? body.creativeIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  if (creativeIds.length === 0) return badRequest("creativeIds is required");
  if (creativeIds.length > 25) return badRequest("Too many creatives selected (max 25)");

  const strategyId = typeof body?.strategyId === "string" ? body.strategyId.trim() : "";
  const userNotes = typeof body?.notes === "string" ? body.notes.trim() : null;

  try {
    const uniqueIds = Array.from(new Set(creativeIds));
    const { data: rows, error } = await supabaseAdmin
      .from("generated_creatives")
      .select("id,user_id,inputs,outputs,created_at,blueprint_id")
      .in("id", uniqueIds);

    if (error || !Array.isArray(rows) || rows.length === 0) {
      return badRequest("Creatives not found");
    }

    const missing = uniqueIds.filter((id) => !rows.find((row) => row.id === id));
    if (missing.length > 0) {
      return badRequest("Some creatives were not found");
    }

    const foreign = rows.find((row) => row.user_id !== userId);
    if (foreign) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Not allowed" }) };
    }

    const primaryBrief = extractPrimaryBrief(rows);
    if (!primaryBrief) {
      return badRequest("Creative briefs missing");
    }

    let strategyBlueprintId = strategyId || null;
    let blueprint = null;

    if (!strategyBlueprintId) {
      const auto = await pickBlueprintFromBriefs({
        briefs: rows
          .map((row) => {
            const inputs = row?.inputs || {};
            const outputs = row?.outputs || {};
            return outputs?.brief || inputs?.brief || null;
          })
          .filter(Boolean),
      });
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

    const researchIds = rows
      .flatMap((row) => (Array.isArray(row?.inputs?.researchIds) ? row.inputs.researchIds : []))
      .filter(Boolean);
    const uniqueResearchIds = Array.from(new Set(researchIds)).slice(0, 25);
    let researchContext = [];
    if (uniqueResearchIds.length > 0) {
      const { data: researchRows } = await supabaseAdmin
        .from("ad_research_ads")
        .select("page_name,primary_text,headline,description,image_url")
        .in("id", uniqueResearchIds);
      researchContext = researchRows || [];
    }

    const campaignAds = rows.map(summarizeCreativeRow);
    const prompt = buildCampaignStrategyPrompt({
      primaryBrief,
      campaignAds,
      blueprint: blueprint?.raw_content_markdown || null,
      blueprintTitle: blueprint?.title || null,
      researchContext,
      userNotes,
    });

    const raw = await callOpenAiJson(prompt, STRATEGY_PLAN_JSON_SCHEMA);
    const repaired = await parseWithRepair({
      schema: StrategyPlanSchema,
      initial: raw,
      makeRequest: async (instruction) =>
        callOpenAiJson(`${prompt}\n\n${instruction}`, STRATEGY_PLAN_JSON_SCHEMA),
    });

    const strategy = repaired.data;

    return ok({
      strategy,
      blueprint: blueprint ? { id: blueprint.id, title: blueprint.title } : null,
    });
  } catch (err) {
    console.error("[strategy-campaign-generate] failed", err);
    captureException(err, { function: "strategy-campaign-generate" });
    return serverError(err?.message || "Campaign strategy generation failed.");
  }
}
