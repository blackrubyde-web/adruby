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
  buildMentorUgcGeneratePrompt,
  buildQualityEvalPromptV2,
  buildImprovePromptDiagnosePlanRewrite,
  buildBatchQualityEvalPromptV2,
} from "./_shared/creativePrompts.js";
import { parseWithRepair } from "./_shared/repair.js";
import {
  CreativeOutputSchema,
  NormalizedBriefSchema,
  QualityEvalSchema,
  CreativeOutputSchemaV2,
  CreativeVariantSchema,
  QualityEvalV2Schema,
  BatchQualityEvalV2Schema,
} from "./_shared/creativeSchemas.js";
import { applySanityFilter } from "./_shared/creativeQuality.js";

function clampInt(n, min, max) {
  const v = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, v));
}

const GOALS = ["sales", "leads", "traffic", "app_installs"];
const FUNNELS = ["cold", "warm", "hot"];
const LANGS = ["de", "en"];
const FORMATS = ["1:1", "4:5", "9:16"];
const TONES = ["direct", "luxury", "playful", "minimal", "bold", "trustworthy"];

const NORMALIZED_BRIEF_JSON_SCHEMA = {
  name: "normalized_brief",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "brand",
      "product",
      "goal",
      "funnel_stage",
      "language",
      "format",
      "audience",
      "offer",
      "tone",
      "angles",
      "risk_flags",
    ],
    properties: {
      brand: {
        type: "object",
        additionalProperties: false,
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1 },
        },
      },
      product: {
        type: "object",
        additionalProperties: false,
        required: ["name", "url", "category"],
        properties: {
          name: { type: "string", minLength: 1 },
          url: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          category: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
        },
      },
      goal: { type: "string", enum: GOALS },
      funnel_stage: { type: "string", enum: FUNNELS },
      language: { type: "string", enum: LANGS },
      format: { type: "string", enum: FORMATS },
      audience: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "segments"],
        properties: {
          summary: { type: "string", minLength: 1 },
          segments: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1 },
          },
        },
      },
      offer: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "constraints"],
        properties: {
          summary: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          constraints: {
            type: "array",
            items: { type: "string", minLength: 1 },
            default: [],
          },
        },
      },
      tone: { type: "string", enum: TONES },
      angles: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "label", "why_it_fits"],
          properties: {
            id: { type: "string", minLength: 1 },
            label: { type: "string", minLength: 1 },
            why_it_fits: { type: "string", minLength: 1 },
          },
        },
      },
      risk_flags: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "severity", "note"],
          properties: {
            type: { type: "string", minLength: 1 },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            note: { type: "string", minLength: 1 },
          },
        },
        default: [],
      },
    },
  },
};

const CREATIVE_VARIANT_JSON_SCHEMA = {
  name: "creative_variant_v2",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "platform",
      "language",
      "tone",
      "hook",
      "proof_type",
      "offer_type",
      "on_screen_text",
      "script",
      "cta",
    ],
    properties: {
      platform: {
        type: "string",
        enum: ["meta", "tiktok", "youtube_shorts", "linkedin"],
      },
      language: { type: "string", minLength: 1 },
      tone: { type: "string", enum: ["raw", "premium", "direct", "empathetic"] },
      hook: { type: "string", minLength: 1 },
      proof_type: {
        type: "string",
        enum: ["demo", "social", "authority", "mechanism"],
      },
      offer_type: {
        type: "string",
        enum: ["trial", "discount", "lead", "bundle", "risk_reversal", "none"],
      },
      on_screen_text: {
        type: "array",
        minItems: 2,
        maxItems: 8,
        items: { type: "string", minLength: 1 },
      },
      script: {
        type: "object",
        additionalProperties: false,
        required: ["hook", "problem", "proof", "offer", "cta"],
        properties: {
          hook: { type: "string", minLength: 1 },
          problem: { type: "string", minLength: 1 },
          proof: { type: "string", minLength: 1 },
          offer: { type: "string", minLength: 1 },
          cta: { type: "string", minLength: 1 },
        },
      },
      cta: { type: "string", minLength: 1 },
    },
  },
};

const CREATIVE_OUTPUT_JSON_SCHEMA_V2 = {
  name: "creative_output_v2",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["schema_version", "style_mode", "variants"],
    properties: {
      schema_version: { type: "string", enum: ["2.0"] },
      style_mode: {
        type: "string",
        enum: ["default", "mentor_ugc", "brand_direct", "ugc_demo"],
      },
      brand: {
        type: "object",
        additionalProperties: false,
        required: [],
        properties: {
          name: { type: "string" },
          voice: { type: "array", items: { type: "string" } },
        },
      },
      variants: {
        type: "array",
        minItems: 6,
        maxItems: 12,
        items: CREATIVE_VARIANT_JSON_SCHEMA.schema,
      },
      quality_eval: {
        type: "object",
        additionalProperties: false,
        required: ["subscores", "ko", "issues", "weakest_dimensions"],
        properties: {
          subscores: {
            type: "object",
            additionalProperties: false,
            required: [
              "hookPower",
              "clarity",
              "proof",
              "offer",
              "objectionHandling",
              "platformFit",
              "novelty",
            ],
            properties: {
              hookPower: { type: "integer", minimum: 0, maximum: 5 },
              clarity: { type: "integer", minimum: 0, maximum: 5 },
              proof: { type: "integer", minimum: 0, maximum: 5 },
              offer: { type: "integer", minimum: 0, maximum: 5 },
              objectionHandling: { type: "integer", minimum: 0, maximum: 5 },
              platformFit: { type: "integer", minimum: 0, maximum: 5 },
              novelty: { type: "integer", minimum: 0, maximum: 5 },
            },
          },
          ko: {
            type: "object",
            additionalProperties: false,
            required: ["complianceFail", "genericBuzzwordFail"],
            properties: {
              complianceFail: { type: "boolean" },
              genericBuzzwordFail: { type: "boolean" },
            },
          },
          issues: { type: "array", items: { type: "string" }, default: [] },
          weakest_dimensions: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "hookPower",
                "clarity",
                "proof",
                "offer",
                "objectionHandling",
                "platformFit",
                "novelty",
              ],
            },
            default: [],
          },
        },
      },
    },
  },
};

const CREATIVE_OUTPUT_JSON_SCHEMA_V1 = {
  name: "creative_output_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["version", "brief", "creatives"],
    properties: {
      version: { type: "string", enum: ["1.0"] },
      brief: NORMALIZED_BRIEF_JSON_SCHEMA.schema,
      creatives: {
        type: "array",
        minItems: 2,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "angle_id", "format", "copy", "score", "image"],
          properties: {
            id: { type: "string", minLength: 1 },
            angle_id: { type: "string", minLength: 1 },
            format: { type: "string", enum: FORMATS },
            copy: {
              type: "object",
              additionalProperties: false,
              required: ["hook", "primary_text", "cta", "bullets"],
              properties: {
                hook: { type: "string", minLength: 1, maxLength: 80 },
                primary_text: { type: "string", minLength: 1, maxLength: 700 },
                cta: { type: "string", minLength: 1, maxLength: 30 },
                bullets: {
                  type: "array",
                  items: { type: "string", minLength: 1, maxLength: 90 },
                  maxItems: 6,
                  default: [],
                },
              },
            },
            score: {
              type: "object",
              additionalProperties: false,
              required: ["value", "rationale"],
              properties: {
                value: { type: "integer", minimum: 0, maximum: 100 },
                rationale: { type: "string", minLength: 1, maxLength: 240 },
              },
            },
            image: {
              type: "object",
              additionalProperties: false,
              required: ["input_image_used", "render_intent"],
              properties: {
                input_image_used: { type: "boolean" },
                render_intent: { type: "string", minLength: 1, maxLength: 200 },
              },
            },
          },
        },
      },
    },
  },
};

const TARGET_SATISFACTION = clampInt(
  Number.parseInt(process.env.CREATIVE_QUALITY_TARGET || "95", 10),
  0,
  100,
);
const MAX_IMPROVE_ATTEMPTS = clampInt(
  Number.parseInt(process.env.CREATIVE_QUALITY_MAX_ATTEMPTS || "3", 10),
  0,
  10,
);
const MAX_DURATION_MS = clampInt(
  Number.parseInt(process.env.CREATIVE_MAX_DURATION_MS || "60000", 10),
  10000,
  300000,
);

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  const debug = process.env.DEBUG_FUNCTIONS === "1";
  const logStep = (step, meta = {}) => {
    if (!debug) return;
    try {
      console.info("[creative-generate-bg]", step, meta);
    } catch {
      /* ignore logging errors */
    }
  };

  if (process.env.DEBUG_FUNCTIONS === "1") {
    try {
      console.info(`[creative-generate] start method=${event.httpMethod} hasAuth=${Boolean(event.headers?.authorization)} body-length=${event?.body ? String(event.body).length : 0}`);
    } catch (e) {
      /* ignore logging errors */
    }
  }

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

  logStep("start", { hasJobId: Boolean(body?.jobId) });

  const briefParsed = NormalizedBriefSchema.safeParse(body?.brief ?? body);
  if (!briefParsed.success) {
    if (process.env.DEBUG_FUNCTIONS === "1") {
      try {
        console.warn('[creative-generate] Invalid brief payload', { bodySample: String(body).slice(0, 200) });
      } catch (e) {}
    }
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
      logStep("research.loaded", { count: researchContext.length });
    } catch (e) {
      console.warn('[creative-generate] failed to load ad_research_ads', e?.message || e);
    }

    // create or reuse a placeholder generated_creatives row so clients can poll status/progress
    let placeholderId = typeof body?.jobId === 'string' ? body.jobId.trim() : '';
    if (!placeholderId) {
      try {
        const insertPayload = {
          user_id: userId,
          blueprint_id: strategyId || null,
          inputs: { brief, hasImage, strategyId: strategyId || null },
          outputs: null,
          score: null,
          research_snapshot: researchContext,
          saved: false,
          status: 'pending',
          progress: 0,
        };

        let createdRow;
        let createErr;
        ({ data: createdRow, error: createErr } = await supabaseAdmin
          .from('generated_creatives')
          .insert(insertPayload)
          .select('id')
          .single());

        if (createErr && String(createErr.message || '').includes('research_snapshot')) {
          const { research_snapshot, ...retryPayload } = insertPayload;
          ({ data: createdRow, error: createErr } = await supabaseAdmin
            .from('generated_creatives')
            .insert(retryPayload)
            .select('id')
            .single());
        }

        if (createErr) {
          console.warn('[creative-generate] failed to create placeholder row:', createErr.message);
        } else {
          placeholderId = createdRow?.id ?? '';
        }
      } catch (e) {
        console.warn('[creative-generate] placeholder insert failed', e?.message || e);
      }
    } else {
      try {
        await supabaseAdmin
          .from('generated_creatives')
          .update({
            status: 'in_progress',
            progress: 5,
            progress_meta: { phase: 'validate' },
          })
          .eq('id', placeholderId);
      } catch (e) {
        console.warn('[creative-generate] failed to update placeholder row', e?.message || e);
      }
      if (researchContext.length) {
        try {
          await supabaseAdmin
            .from('generated_creatives')
            .update({ research_snapshot: researchContext })
            .eq('id', placeholderId);
        } catch (e) {
          // ignore if column not present
        }
      }
    }

    if (!placeholderId) {
      return serverError('Failed to allocate generation job.');
    }
    logStep("job.ready", { jobId: placeholderId, hasImage });

    // support optional premium style modes (non-breaking)
    const styleMode = String(body?.style_mode || "default").trim();
    logStep("style.mode", { jobId: placeholderId, styleMode });

    if (styleMode === "mentor_ugc") {
      // premium Mentor-UGC flow: generate 12 variants, evaluate, improve top candidate, CD pass
      try {
        logStep("mentor.start", { jobId: placeholderId });
        // update progress: validate -> research
        if (placeholderId) {
          await supabaseAdmin.from('generated_creatives').update({ progress: 5, progress_meta: { phase: 'validate' } }).eq('id', placeholderId);
        }

        const prompt = buildMentorUgcGeneratePrompt(brief, researchContext, { style_mode: 'mentor_ugc' });

        if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ progress: 10, progress_meta: { phase: 'research' } }).eq('id', placeholderId);

        logStep("mentor.generate", { jobId: placeholderId });
        const initial = await callOpenAiJson(prompt, {
          responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V2,
        });
        const repaired = await parseWithRepair({
          schema: CreativeOutputSchemaV2,
          initial,
          makeRequest: async (instruction) =>
            callOpenAiJson(prompt + "\n\n" + instruction, {
              responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V2,
            }),
        });

        const v2output = repaired.data;

        // ensure variants exist
        const variants = Array.isArray(v2output.variants) ? v2output.variants : [];

        // update progress: generation done
        if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ progress: 40, progress_meta: { phase: 'generate' } }).eq('id', placeholderId);

        logStep("mentor.eval.batch", { jobId: placeholderId, variants: variants.length });

        // batch-evaluate all variants in a single call
        let evals = [];
        try {
          const batchEvalPrompt = buildBatchQualityEvalPromptV2({
            brief,
            variants,
            strategyBlueprint,
            researchContext,
          });
          const batchEvalRaw = await callOpenAiJson(batchEvalPrompt, {
            responseFormat: {
              name: "batch_quality_eval_v2",
              schema: BatchQualityEvalV2Schema.openapi("batch_quality_eval_v2").schema,
              strict: true,
            },
          });
          const batchEvalParsed = await parseWithRepair({
            schema: BatchQualityEvalV2Schema,
            initial: batchEvalRaw,
            makeRequest: async (instruction) =>
              callOpenAiJson(batchEvalPrompt + "\n\n" + instruction, {
                responseFormat: {
                  name: "batch_quality_eval_v2",
                  schema: BatchQualityEvalV2Schema.openapi("batch_quality_eval_v2").schema,
                  strict: true,
                },
              }),
          });

          const receivedEvals = batchEvalParsed.data.evaluations || [];
          if (receivedEvals.length !== variants.length) {
            throw new Error(
              `Batch eval count mismatch: expected ${variants.length}, got ${receivedEvals.length}`,
            );
          }

          evals = variants.map((variant, i) => ({
            index: i,
            variant,
            eval: receivedEvals[i],
          }));
        } catch (e) {
          logStep("mentor.eval.batch.error", { jobId: placeholderId, error: e.message });
          // on batch failure, create dummy evals to avoid crashing
          evals = variants.map((variant, i) => ({
            index: i,
            variant,
            eval: {
              subscores: {
                hookPower: 0,
                clarity: 0,
                proof: 0,
                offer: 0,
                objectionHandling: 0,
                platformFit: 0,
                novelty: 0,
              },
              ko: { complianceFail: false, genericBuzzwordFail: false },
              issues: ["batch_eval_failed"],
              weakest_dimensions: [],
            },
          }));
        }

        // compute score by summing subscores
        const scored = evals.map((e) => {
          const s = e.eval && e.eval.subscores ? Object.values(e.eval.subscores).reduce((a,b)=>a+b,0) : 0;
          return { ...e, score: s };
        });

        scored.sort((a,b) => b.score - a.score);

        const top3 = scored.slice(0,3).map(s => ({ index: s.index, variant: s.variant, eval: s.eval, score: s.score }));

        if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ progress: 60, progress_meta: { phase: 'eval', top_count: top3.length } }).eq('id', placeholderId);

        // improve-loop on top1 only (max 2 attempts)
        if (top3.length > 0) {
          logStep("mentor.improve", { jobId: placeholderId });
          let top = top3[0];
          for (let attempt = 1; attempt <= 2; attempt++) {
            const weakest = top.eval.weakest_dimensions && top.eval.weakest_dimensions.length ? top.eval.weakest_dimensions.slice(0,2) : ['clarity','hookPower'];
            const improvePrompt = buildImprovePromptDiagnosePlanRewrite({ brief, currentVariant: top.variant, evalV2: top.eval, targetDimensions: weakest });
            try {
              const improvedRaw = await callOpenAiJson(improvePrompt, {
                responseFormat: CREATIVE_VARIANT_JSON_SCHEMA,
              });
              const improvedParsed = await parseWithRepair({
                schema: CreativeVariantSchema,
                initial: improvedRaw,
                makeRequest: async (instruction) =>
                  callOpenAiJson(improvePrompt + "\n\n" + instruction, {
                    responseFormat: CREATIVE_VARIANT_JSON_SCHEMA,
                  }),
              });
              // replace in variants
              variants[top.index] = improvedParsed.data;
              // re-evaluate improved variant
              const reEvalPrompt = buildQualityEvalPromptV2({ brief, variant: improvedParsed.data, strategyBlueprint, researchContext });
              const reEvalRaw = await callOpenAiJson(reEvalPrompt);
              const reEvalParsed = await parseWithRepair({ schema: QualityEvalV2Schema, initial: reEvalRaw, makeRequest: async (instruction) => callOpenAiJson(reEvalPrompt + "\n\n" + instruction) });
              top.eval = reEvalParsed.data;
              // update progress
              if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ progress: 80, progress_meta: { phase: 'improve', attempt } }).eq('id', placeholderId);
            } catch (e) {
              // continue on failures
              break;
            }
          }
        }

        // Creative Director pass: sharpen top variant (finalize)
        try {
          if (top3.length > 0) {
            logStep("mentor.cd-pass", { jobId: placeholderId });
            const top = top3[0];
            const cdPrompt = buildImprovePromptDiagnosePlanRewrite({ brief, currentVariant: variants[top.index], evalV2: top.eval, targetDimensions: ['clarity','hookPower'] });
            const cdRaw = await callOpenAiJson(cdPrompt, {
              responseFormat: CREATIVE_VARIANT_JSON_SCHEMA,
            });
            const cdParsed = await parseWithRepair({
              schema: CreativeVariantSchema,
              initial: cdRaw,
              makeRequest: async (instruction) =>
                callOpenAiJson(cdPrompt + "\n\n" + instruction, {
                  responseFormat: CREATIVE_VARIANT_JSON_SCHEMA,
                }),
            });
            variants[top.index] = cdParsed.data;
          }
        } catch (e) {
          // ignore CD failures
        }

        // finalize: persist outputs (store full v2 output but keep legacy outputs for compatibility)
        const finalOutput = { ...v2output, variants };
        try {
          if (placeholderId) {
            await supabaseAdmin.from('generated_creatives').update({ outputs: finalOutput, score: scored[0]?.score ?? null, status: 'complete', progress: 100, progress_meta: { phase: 'finalize' } }).eq('id', placeholderId);
          }
        } catch (e) {
          console.warn('[creative-generate] failed to update generated_creatives (v2):', e?.message || e);
        }

        await logAiAction({ userId, actionType: 'creative_generate', status: 'success', input: inputForLog, output: finalOutput, meta: { credits, top3Count: top3.length } });

        logStep("mentor.complete", { jobId: placeholderId });
        return ok({ output: finalOutput, credits, quality: { target: TARGET_SATISFACTION, top3 }, jobId: placeholderId });
      } catch (err) {
        // On parse failure, save raw snippet and mark error
        console.error('[creative-generate][mentor_ugc] failed', err);
        logStep("mentor.error", { jobId: placeholderId, error: err?.message || String(err) });
        // capture raw sample if available (best effort)
        try {
          if (placeholderId) {
            await supabaseAdmin.from('generated_creatives').update({ status: 'error', progress: 0, progress_meta: { phase: 'error', code: 'PARSE_FAIL', error: String(err) } }).eq('id', placeholderId);
          }
        } catch (e) {
          /* ignore */
        }
        throw err;
      }
    }

    // default (existing) flow
    const startedAt = Date.now();
    logStep("default.start", { jobId: placeholderId });
    const prompt = buildGeneratePrompt(brief, hasImage, strategyBlueprint, researchContext);

    const initial = await callOpenAiJson(prompt, {
      responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V1,
    });
    const repaired = await parseWithRepair({
      schema: CreativeOutputSchema,
      initial,
      makeRequest: async (instruction) =>
        callOpenAiJson(prompt + "\n\n" + instruction, {
          responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V1,
        }),
    });

    let best = applySanityFilter(repaired.data);
    // update progress: initial parse done
    try {
      if (placeholderId) await supabaseAdmin.from('generated_creatives').update({ status: 'in_progress', progress: 15 }).eq('id', placeholderId);
    } catch (e) {
      /* ignore */
    }

    logStep("default.eval", { jobId: placeholderId });
    let bestEval = await evaluateOutput(brief, best, strategyBlueprint, researchContext);

    let attemptsUsed = 0;
    for (let attempt = 1; attempt <= MAX_IMPROVE_ATTEMPTS; attempt++) {
      attemptsUsed = attempt;
      if (Date.now() - startedAt > MAX_DURATION_MS) {
        logStep("default.timeout", {
          jobId: placeholderId,
          elapsedMs: Date.now() - startedAt,
          attemptsUsed,
        });
        break;
      }
      if (bestEval.satisfaction >= TARGET_SATISFACTION) break;

      logStep("default.improve", { jobId: placeholderId, attempt });
      const improvePrompt = buildImprovePrompt({
        brief,
        priorOutput: best,
        issues: bestEval.issues,
        strategyBlueprint,
        researchContext,
      });

      const improvedRaw = await callOpenAiJson(improvePrompt, {
        responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V1,
      });
      const improvedParsed = await parseWithRepair({
        schema: CreativeOutputSchema,
        initial: improvedRaw,
        makeRequest: async (instruction) =>
          callOpenAiJson(improvePrompt + "\n\n" + instruction, {
            responseFormat: CREATIVE_OUTPUT_JSON_SCHEMA_V1,
          }),
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

    logStep("default.complete", {
      jobId: placeholderId,
      elapsedMs: Date.now() - startedAt,
      attemptsUsed,
      satisfaction: bestEval.satisfaction,
    });

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
    logStep("error", { jobId: placeholderId, error: err?.message || String(err) });

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

async function callOpenAiJson(prompt, options = {}) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();
  const useSchema = process.env.USE_JSON_SCHEMA === "1";
  const responseFormat = options?.responseFormat;

  // Safe timeout around OpenAI requests to prevent hanging on network issues.
  let res;
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 30000);
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("OpenAI request timed out")), timeoutMs);
  });
  try {
    res = await Promise.race([
      openai.responses.create({
        model,
        input: [
          {
            role: "system",
            content:
              "Return ONLY valid JSON. No markdown. Follow the schema strictly. Do not add extra keys.",
          },
          { role: "user", content: [{ type: "input_text", text: prompt }] },
        ],
        temperature: 0.0,
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
      }),
      timeoutPromise,
    ]);
  } catch (err) {
    if (err?.message === "OpenAI request timed out") {
      console.error("[creative-generate] OpenAI request timed out", { timeoutMs });
      throw err;
    }
    console.error('[creative-generate] OpenAI request failed', err?.message || err);
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

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
