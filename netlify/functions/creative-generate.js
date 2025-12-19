import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { assertAndConsumeCredits } from "./_shared/credits.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { logAiAction } from "./_shared/aiLogging.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel } from "./_shared/openai.js";
import {
  buildGeneratePrompt,
  buildImprovePrompt,
  buildQualityEvalPrompt,
} from "./_shared/creativePrompts.js";
import { parseWithRepair } from "./_shared/repair.js";
import {
  CreativeOutputSchema,
  NormalizedBriefSchema,
  QualityEvalSchema,
} from "./_shared/creativeSchemas.js";
import { applySanityFilter } from "./_shared/creativeQuality.js";

function clampInt(n, min, max) {
  const v = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, v));
}

const TARGET_SATISFACTION = clampInt(
  Number.parseInt(process.env.CREATIVE_QUALITY_TARGET || "95", 10),
  0,
  100,
);
const MAX_IMPROVE_ATTEMPTS = clampInt(
  Number.parseInt(process.env.CREATIVE_QUALITY_MAX_ATTEMPTS || "5", 10),
  0,
  10,
);

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
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

  const briefParsed = NormalizedBriefSchema.safeParse(body?.brief ?? body);
  if (!briefParsed.success) {
    return badRequest("Invalid brief");
  }
  const brief = briefParsed.data;
  const hasImage = Boolean(body?.hasImage);
  const strategyId = typeof body?.strategyId === "string" ? body.strategyId.trim() : "";
  let strategyBlueprint = null;

  if (strategyId) {
    const { data, error } = await supabaseAdmin
      .from("strategy_blueprints")
      .select("raw_content_markdown")
      .eq("id", strategyId)
      .single();

    if (error || !data) {
      return badRequest("Unknown strategy blueprint.");
    }
    strategyBlueprint = data.raw_content_markdown;
  }

  let credits;
  try {
    credits = await assertAndConsumeCredits(userId, "creative_generate");
  } catch (err) {
    return badRequest(err?.message || "Insufficient credits", 402);
  }
  const inputForLog = { brief, hasImage, strategyId: strategyId || null };

  try {
    // Fetch scraped ads as research context. If the client passed specific researchIds, prefer those.
    let researchContext = [];
    try {
      const researchIds = Array.isArray(body?.researchIds) ? body.researchIds.filter(Boolean) : [];
      let query = supabaseAdmin.from('ad_research_ads').select('id,page_name,primary_text,headline,description,image_url,raw_payload');

      if (researchIds.length) {
        // fetch only selected items and preserve order roughly by created_at desc
        query = query.in('id', researchIds);
      } else {
        query = query.order('created_at', { ascending: false }).limit(8);
      }

      const { data: ads } = await query;
      if (Array.isArray(ads)) {
        researchContext = ads.map((a) => ({
          id: a.id || null,
          page_name: a.page_name || null,
          headline: a.headline || null,
          primary_text: a.primary_text || null,
          description: a.description || null,
          image_url: a.image_url || null,
          raw: a.raw_payload || null,
        }));
      }
    } catch (e) {
      console.warn('[creative-generate] failed to load ad_research_ads', e?.message || e);
    }

    // create a placeholder generated_creatives row so clients can poll status/progress
    let placeholderId = null;
    try {
      const { data: createdRow, error: createErr } = await supabaseAdmin
        .from('generated_creatives')
        .insert({
          user_id: userId,
          blueprint_id: strategyId || null,
          inputs: { brief, hasImage, strategyId: strategyId || null },
          outputs: null,
          score: null,
          research_snapshot: researchContext,
          saved: false,
          status: 'pending',
          progress: 0,
        })
        .select('id')
        .single();
      if (createErr) {
        console.warn('[creative-generate] failed to create placeholder row:', createErr.message);
      } else {
        placeholderId = createdRow?.id ?? null;
      }
    } catch (e) {
      console.warn('[creative-generate] placeholder insert failed', e?.message || e);
    }

    const prompt = buildGeneratePrompt(brief, hasImage, strategyBlueprint, researchContext);

    const initial = await callOpenAiJson(prompt);
    const repaired = await parseWithRepair({
      schema: CreativeOutputSchema,
      initial,
      makeRequest: async (instruction) => callOpenAiJson(prompt + "\n\n" + instruction),
    });

    let best = applySanityFilter(repaired.data);
    // update progress: initial parse done
    try {
      if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ status: 'in_progress', progress: 15 }).eq('id', placeholderId);
    } catch (e) {
      /* ignore */
    }

    let bestEval = await evaluateOutput(brief, best, strategyBlueprint, researchContext);

    for (let attempt = 1; attempt <= MAX_IMPROVE_ATTEMPTS; attempt++) {
      if (bestEval.satisfaction >= TARGET_SATISFACTION) break;

      const improvePrompt = buildImprovePrompt({
        brief,
        priorOutput: best,
        issues: bestEval.issues,
        strategyBlueprint,
        researchContext,
      });

      const improvedRaw = await callOpenAiJson(improvePrompt);
      const improvedParsed = await parseWithRepair({
        schema: CreativeOutputSchema,
        initial: improvedRaw,
        makeRequest: async (instruction) =>
          callOpenAiJson(improvePrompt + "\n\n" + instruction),
      });

      const improved = applySanityFilter(improvedParsed.data);
      const improvedEval = await evaluateOutput(brief, improved, strategyBlueprint, researchContext);

      // update progress after each improve attempt
      try {
        if (placeholderId) {
          const p = Math.min(90, 15 + Math.trunc((attempt / MAX_IMPROVE_ATTEMPTS) * 70));
          await supabaseAdmin.from('generated_creatives').update({ progress: p }).eq('id', placeholderId);
        }
      } catch (e) {
        /* ignore */
      }

      if (improvedEval.satisfaction > bestEval.satisfaction) {
        best = improved;
        bestEval = improvedEval;
      }
    }

    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "success",
      input: inputForLog,
      output: best,
      meta: { credits, quality: bestEval, strategyId: strategyId || null },
    });
    // finalize placeholder row with outputs/score/status
    try {
      if (placeholderId) {
        await supabaseAdmin
          .from('generated_creatives')
          .update({ outputs: best, score: bestEval.satisfaction, status: 'complete', progress: 100 })
          .eq('id', placeholderId);
      }
    } catch (e) {
      console.warn('[creative-generate] failed to update generated_creatives:', e?.message || e);
    }

    return ok({
      output: best,
      credits,
      quality: {
        target: TARGET_SATISFACTION,
        ...bestEval,
      },
      jobId: placeholderId,
    });
  } catch (err) {
    console.error("[creative-generate] failed", err);
    captureException(err, { function: "creative-generate" });

    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "error",
      input: inputForLog,
      errorMessage: err?.message || "Unknown error",
    });

    // mark placeholder row as errored if present
    try {
      if (typeof placeholderId !== 'undefined' && placeholderId) {
        await supabaseAdmin.from('generated_creatives').update({ status: 'error', progress: 0, progress_meta: { error: err?.message ?? String(err) } }).eq('id', placeholderId);
      }
    } catch (e) {
      // ignore
    }

    return serverError(err?.message || "Generate failed.");
  }
}

async function callOpenAiJson(prompt) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();

  const res = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "Return ONLY valid JSON. No markdown. Follow the schema strictly. Do not add extra keys.",
      },
      { role: "user", content: [{ type: "input_text", text: prompt }] },
    ],
    temperature: 0.5,
  });

  const text = String(res.output_text || "").trim();
  if (!text) throw new Error("Empty OpenAI response.");
  return text;
}

async function evaluateOutput(brief, output, strategyBlueprint, researchContext) {
  const evalPrompt = buildQualityEvalPrompt({ brief, output, strategyBlueprint, researchContext });

  const initial = await callOpenAiJson(evalPrompt);
  const repaired = await parseWithRepair({
    schema: QualityEvalSchema,
    initial,
    makeRequest: async (instruction) => callOpenAiJson(evalPrompt + "\n\n" + instruction),
  });

  // Additional local sanity: never claim perfect.
  const satisfaction = Math.max(0, Math.min(100, Math.trunc(repaired.data.satisfaction)));
  return { ...repaired.data, satisfaction };
}
