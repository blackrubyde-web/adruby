import crypto from "crypto";
import {
  badRequest,
  methodNotAllowed,
  ok,
  serverError,
  withCors,
} from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { assertAndConsumeCredits } from "./_shared/credits.js";
import { logAiAction } from "./_shared/aiLogging.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel, generateHeroImage } from "./_shared/openai.js";
import { buildGeneratePrompt } from "./_shared/creativePrompts.js";
import { CreativeOutputSchema, NormalizedBriefSchema } from "./_shared/creativeSchemas.js";
import { parseWithRepair } from "./_shared/repair.js";
import { applySanityFilter } from "./_shared/creativeQuality.js";
import { renderAdImage } from "./_shared/renderAdImage.js";
import { uploadHeroImage, uploadRenderedImage } from "./_shared/storageRenders.js";

const DEFAULT_CTA_BY_LANG = {
  de: "Mehr erfahren",
  en: "Learn More",
};

const INPUT_BUCKET = process.env.CREATIVE_INPUTS_BUCKET || "creative-inputs";
const SIGNED_TTL_SEC = Number(process.env.CREATIVE_SIGNED_URL_TTL_SEC || 3600);

function clampInt(n, min, max) {
  const value = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, value));
}

function avgScore(creatives) {
  if (!Array.isArray(creatives) || creatives.length === 0) return null;
  const scores = creatives.map((c) => Number(c?.score?.value || 0));
  const total = scores.reduce((acc, n) => acc + n, 0);
  return clampInt(total / scores.length, 0, 100);
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function promptHash(input) {
  return crypto.createHash("sha256").update(String(input || "")).digest("hex").slice(0, 12);
}

async function fetchAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

async function getSignedInputUrl(path) {
  if (!path) return null;
  const signed = await supabaseAdmin.storage.from(INPUT_BUCKET).createSignedUrl(path, SIGNED_TTL_SEC);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(signed.error?.message || "Signed URL failed");
  }
  return signed.data.signedUrl;
}

function buildFallbackOutput(brief, hasImage) {
  const angles = safeArray(brief?.angles);
  const fallbackAngles = angles.length >= 2 ? angles.slice(0, 2) : [
    { id: "benefit", label: "Key benefit" },
    { id: "proof", label: "Proof" },
  ];
  const cta = DEFAULT_CTA_BY_LANG[brief?.language] || DEFAULT_CTA_BY_LANG.de;
  const productName = brief?.product?.name || "Produkt";
  const hookBase = `Warum ${productName}?`;

  return {
    version: "1.0",
    brief,
    creatives: fallbackAngles.map((angle, idx) => ({
      id: `fallback-${idx + 1}`,
      angle_id: angle.id || `angle-${idx + 1}`,
      format: brief?.format || "4:5",
      copy: {
        hook: `${hookBase} ${idx === 0 ? "Jetzt entdecken." : "Jetzt testen."}`.slice(0, 80),
        primary_text: `${productName} liefert messbare Ergebnisse für ${brief?.audience?.summary || "dein Team"}.`,
        cta,
        bullets: [],
      },
      score: { value: 70, rationale: "Fallback output due to generation failure." },
      image: {
        input_image_used: Boolean(hasImage),
        render_intent: `${productName} in a clean, high-contrast ad scene`,
        input_image_url: null,
        input_image_bucket: null,
        input_image_path: null,
        hero_image_url: null,
        hero_image_bucket: null,
        hero_image_path: null,
        final_image_url: null,
        final_image_bucket: null,
        final_image_path: null,
        width: null,
        height: null,
        model: null,
        seed: null,
        prompt_hash: null,
        render_version: null,
        error: null,
      },
    })),
  };
}

async function callOpenAiJson(prompt) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();
  const useSchema = process.env.USE_JSON_SCHEMA === "1";

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "Return ONLY valid JSON matching the schema. No markdown, no extra keys.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2400,
    ...(useSchema ? { response_format: { type: "json_object" } } : {}),
  });

  return response?.choices?.[0]?.message?.content || "";
}

async function loadResearchContext(ids) {
  const safeIds = safeArray(ids).map((id) => String(id));
  if (!safeIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from("ad_research_ads")
    .select("id,page_name,headline,primary_text,description,image_url")
    .in("id", safeIds)
    .limit(25);
  if (error) {
    console.warn("[creative-generate] research load failed:", error.message);
    return [];
  }
  return data || [];
}

async function loadStrategyBlueprint(strategyId) {
  if (!strategyId) return null;
  const { data, error } = await supabaseAdmin
    .from("strategy_blueprints")
    .select("id,title,raw_content_markdown,metadata")
    .eq("id", strategyId)
    .maybeSingle();
  if (error) {
    console.warn("[creative-generate] strategy load failed:", error.message);
    return null;
  }
  return data || null;
}

async function enrichImages({
  output,
  userId,
  inputImage,
  inputImageBase64,
  imageTopN,
}) {
  if (!output?.creatives || output.creatives.length === 0) return output;

  const maxCount = Math.max(0, Math.min(imageTopN, output.creatives.length));
  for (let idx = 0; idx < output.creatives.length; idx += 1) {
    const creative = output.creatives[idx];
    const shouldRender = idx < maxCount;

    creative.image = creative.image || {};
    if (inputImage) {
      creative.image.input_image_url = inputImage.url;
      creative.image.input_image_bucket = inputImage.bucket;
      creative.image.input_image_path = inputImage.path;
    }

    if (!shouldRender) continue;

    let heroBase64 = inputImageBase64 || null;
    let heroUpload = null;
    let heroError = null;

    if (!heroBase64) {
      try {
        const intent = creative?.image?.render_intent || "Clean product photo in a modern studio scene";
        const prompt = `${intent}. High-end commercial photography, no text, crisp lighting.`;
        const generated = await generateHeroImage({
          prompt,
          size: creative?.format === "9:16" ? "1024x1792" : creative?.format === "4:5" ? "1024x1024" : "1024x1024",
          quality: process.env.CREATIVE_IMAGE_QUALITY || "auto",
        });
        heroBase64 = generated.b64;
        heroUpload = await uploadHeroImage({
          userId,
          buffer: Buffer.from(generated.b64, "base64"),
          promptHash: promptHash(prompt),
        });
        creative.image.hero_image_url = heroUpload.previewUrl || null;
        creative.image.hero_image_bucket = heroUpload.bucket || null;
        creative.image.hero_image_path = heroUpload.path || null;
        creative.image.model = generated.model || null;
        creative.image.seed = typeof generated.seed === "number" ? generated.seed : null;
        creative.image.prompt_hash = promptHash(prompt);
      } catch (err) {
        heroError = err?.message || "Hero image generation failed";
      }
    } else if (inputImage?.url) {
      creative.image.hero_image_url = inputImage.url;
      creative.image.hero_image_bucket = inputImage.bucket;
      creative.image.hero_image_path = inputImage.path;
    }

    if (!heroBase64) {
      creative.image.error = heroError || creative.image.error || null;
      continue;
    }

    try {
      const rendered = await renderAdImage({
        creative,
        brief: output.brief,
        format: creative.format,
        heroBase64,
      });
      const uploaded = await uploadRenderedImage({
        userId,
        buffer: rendered.buffer,
        promptHash: creative.image.prompt_hash || promptHash(creative.image.render_intent),
      });
      creative.image.final_image_url = uploaded.previewUrl || null;
      creative.image.final_image_bucket = uploaded.bucket || null;
      creative.image.final_image_path = uploaded.path || null;
      creative.image.width = rendered.width || null;
      creative.image.height = rendered.height || null;
      creative.image.render_version = rendered.renderVersion || null;
    } catch (err) {
      creative.image.error = err?.message || "Render failed";
    }
  }

  return output;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  initTelemetry();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return serverError("Supabase env missing. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!process.env.OPENAI_API_KEY) {
    return badRequest("AI not configured. Set OPENAI_API_KEY in Netlify.", 400);
  }

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const entitlement = await requireActiveSubscription(userId);
  if (!entitlement.ok) return entitlement.response;

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const briefRaw = body?.brief;
  const hasImage = Boolean(body?.hasImage);
  const imagePath = body?.imagePath ? String(body.imagePath).trim() : null;
  const strategyId = body?.strategyId ? String(body.strategyId).trim() : null;
  const researchIds = safeArray(body?.researchIds);
  const preferences = {
    visual_style: body?.visual_style || null,
    cta_preference: body?.cta_preference || null,
  };

  const parsedBrief = NormalizedBriefSchema.safeParse(briefRaw);
  if (!parsedBrief.success) {
    return badRequest("Invalid brief JSON");
  }
  const brief = parsedBrief.data;

  if (imagePath && !imagePath.startsWith(`${userId}/`)) {
    return badRequest("Invalid image path");
  }

  let credits;
  try {
    credits = await assertAndConsumeCredits(userId, "creative_generate");
  } catch (err) {
    return badRequest(err?.message || "Insufficient credits", 402);
  }

  const [researchContext, strategyBlueprint] = await Promise.all([
    loadResearchContext(researchIds),
    loadStrategyBlueprint(strategyId),
  ]);

  const inputForLog = {
    brief,
    hasImage,
    imagePath,
    strategyId,
    researchIds,
    preferences,
  };

  let recordId = null;
  try {
    const { data: created, error: insertError } = await supabaseAdmin
      .from("generated_creatives")
      .insert({
        user_id: userId,
        inputs: inputForLog,
        outputs: null,
        status: "running",
        progress: 5,
        progress_meta: { stage: "start" },
        blueprint_id: strategyId || null,
      })
      .select("id")
      .single();
    if (insertError) {
      console.warn("[creative-generate] failed to insert placeholder:", insertError.message);
    } else {
      recordId = created?.id || null;
    }
  } catch (err) {
    console.warn("[creative-generate] placeholder insert crashed:", err?.message || err);
  }

  let output = null;
  let quality = null;
  let inputImage = null;
  let inputImageBase64 = null;

  try {
    if (imagePath) {
      const signedUrl = await getSignedInputUrl(imagePath);
      inputImage = { url: signedUrl, bucket: INPUT_BUCKET, path: imagePath };
      inputImageBase64 = await fetchAsBase64(signedUrl);
    }
  } catch (err) {
    console.warn("[creative-generate] input image fetch failed:", err?.message || err);
    inputImage = null;
    inputImageBase64 = null;
  }

  try {
    const prompt = buildGeneratePrompt(
      brief,
      hasImage && Boolean(inputImage),
      strategyBlueprint,
      researchContext,
      preferences,
      null,
    );

    const initial = await callOpenAiJson(prompt);
    const repaired = await parseWithRepair({
      schema: CreativeOutputSchema,
      initial,
      makeRequest: async (instruction) => callOpenAiJson(`${prompt}\n\n${instruction}`),
    });

    output = applySanityFilter(repaired.data);
    quality = avgScore(output.creatives);

    if (inputImage && Array.isArray(output.creatives)) {
      output.creatives.forEach((creative) => {
        creative.image = creative.image || {};
        creative.image.input_image_used = true;
        creative.image.input_image_url = inputImage.url;
        creative.image.input_image_bucket = inputImage.bucket;
        creative.image.input_image_path = inputImage.path;
        if (!creative.image.hero_image_url) {
          creative.image.hero_image_url = inputImage.url;
          creative.image.hero_image_bucket = inputImage.bucket;
          creative.image.hero_image_path = inputImage.path;
        }
      });
    }

    const rawTopN = process.env.CREATIVE_IMAGE_TOP_N;
    const parsedTopN = rawTopN === undefined || rawTopN === "" ? 1 : Number(rawTopN);
    const imageTopN = Number.isFinite(parsedTopN) ? Math.max(0, parsedTopN) : 1;
    if (imageTopN > 0) {
      output = await enrichImages({
        output,
        userId,
        inputImage,
        inputImageBase64,
        imageTopN,
      });
    }

    const thumbnail =
      output?.creatives?.[0]?.image?.final_image_url ||
      output?.creatives?.[0]?.image?.hero_image_url ||
      output?.creatives?.[0]?.image?.input_image_url ||
      null;

    if (recordId) {
      await supabaseAdmin
        .from("generated_creatives")
        .update({
          outputs: output,
          status: "complete",
          progress: 100,
          progress_meta: { stage: "complete" },
          score: typeof quality === "number" ? quality : null,
          thumbnail,
        })
        .eq("id", recordId)
        .eq("user_id", userId);
    }

    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "success",
      input: inputForLog,
      output,
      meta: { credits, quality, recordId },
    });

    return ok({
      output,
      credits,
      quality,
      jobId: recordId,
    });
  } catch (err) {
    if (recordId) {
      await supabaseAdmin
        .from("generated_creatives")
        .update({
          status: "error",
          progress: 100,
          progress_meta: { error: err?.message || "Generation failed" },
        })
        .eq("id", recordId)
        .eq("user_id", userId);
    }

    captureException(err, { function: "creative-generate" });
    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "error",
      input: inputForLog,
      errorMessage: err?.message || "Generation failed",
      meta: { recordId },
    });

    const fallback = buildFallbackOutput(brief, hasImage);
    return ok({
      output: fallback,
      credits,
      quality: avgScore(fallback.creatives),
      jobId: recordId,
      warning: "AI generation failed, returned fallback output.",
    });
  }
}
