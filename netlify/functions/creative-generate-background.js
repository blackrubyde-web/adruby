import crypto from "crypto";
import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { assertAndConsumeCredits } from "./_shared/credits.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { logAiAction } from "./_shared/aiLogging.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel, generateHeroImage } from "./_shared/openai.js";
import {
  buildGeneratePrompt,
  buildImprovePrompt,
  buildQualityEvalPrompt,
  buildMentorUgcGeneratePrompt,
  buildQualityEvalPromptV2,
  buildImprovePromptDiagnosePlanRewrite,
  buildBatchQualityEvalPromptV2,
  buildImageSpecPrompt,
  buildImageSpecPromptPro,
  buildImagePromptFromSpec,
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
  ImageSpecSchema,
  AD_IMAGE_SPEC_JSON_SCHEMA,
} from "./_shared/creativeSchemas.js";
import { applySanityFilter } from "./_shared/creativeQuality.js";
import { renderAdImage } from "./_shared/renderAdImage.js";
import { uploadHeroImage, uploadRenderedImage } from "./_shared/storageRenders.js";

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
      "image",
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
      image: {
        type: "object",
        additionalProperties: false,
        required: [
          "input_image_used",
          "render_intent",
          "hero_image_url",
          "final_image_url",
          "width",
          "height",
          "model",
          "seed",
          "prompt_hash",
          "render_version",
        ],
        properties: {
          input_image_used: { type: "boolean" },
          render_intent: { type: "string", minLength: 1, maxLength: 200 },
          hero_image_url: { type: ["string", "null"] },
          final_image_url: { type: ["string", "null"] },
          width: { type: ["integer", "null"], minimum: 1 },
          height: { type: ["integer", "null"], minimum: 1 },
          model: { type: ["string", "null"], minLength: 1 },
          seed: { type: ["integer", "null"], minimum: 0 },
          prompt_hash: { type: ["string", "null"], minLength: 6 },
          render_version: { type: ["string", "null"], minLength: 1 },
        },
      },
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
        required: ["name", "voice"],
        properties: {
          name: { type: "string" },
          voice: { type: "array", items: { type: "string" }, default: [] },
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
              required: [
                "input_image_used",
                "render_intent",
                "hero_image_url",
                "final_image_url",
                "width",
                "height",
                "model",
                "seed",
                "prompt_hash",
                "render_version",
              ],
              properties: {
                input_image_used: { type: "boolean" },
                render_intent: { type: "string", minLength: 1, maxLength: 200 },
                hero_image_url: { type: ["string", "null"] },
                final_image_url: { type: ["string", "null"] },
                width: { type: ["integer", "null"], minimum: 1 },
                height: { type: ["integer", "null"], minimum: 1 },
                model: { type: ["string", "null"], minLength: 1 },
                seed: { type: ["integer", "null"], minimum: 0 },
                prompt_hash: { type: ["string", "null"], minLength: 6 },
                render_version: { type: ["string", "null"], minLength: 1 },
              },
            },
          },
        },
      },
    },
  },
};

const IMAGE_SPEC_JSON_SCHEMA = {
  name: "image_spec_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "version",
      "format",
      "platform",
      "style",
      "scene",
      "brand_safety",
      "negative_prompt",
      "text_safe_area",
      "overlay_guidance",
    ],
    properties: {
      version: { type: "string", enum: ["1.0"] },
      format: { type: "string", enum: FORMATS },
      platform: { type: "string", enum: ["meta", "tiktok", "ytshorts", "linkedin"] },
      style: {
        type: "object",
        additionalProperties: false,
        required: ["mood", "lighting", "palette", "camera", "render_style", "realism_level"],
        properties: {
          mood: { type: "string", minLength: 1 },
          lighting: { type: "string", minLength: 1 },
          palette: { type: "array", minItems: 2, maxItems: 6, items: { type: "string", minLength: 1 } },
          camera: { type: "string", minLength: 1 },
          render_style: { type: "string", minLength: 1 },
          realism_level: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
      scene: {
        type: "object",
        additionalProperties: false,
        required: ["subject", "environment", "composition", "props", "wardrobe"],
        properties: {
          subject: { type: "string", minLength: 1 },
          environment: { type: "string", minLength: 1 },
          composition: { type: "string", minLength: 1 },
          props: { type: "array", minItems: 1, maxItems: 6, items: { type: "string", minLength: 1 } },
          wardrobe: { type: "array", maxItems: 6, items: { type: "string", minLength: 1 }, default: [] },
        },
      },
      brand_safety: {
        type: "object",
        additionalProperties: false,
        required: ["avoid"],
        properties: {
          avoid: { type: "array", items: { type: "string", minLength: 1 }, default: [] },
        },
      },
      negative_prompt: { type: "array", items: { type: "string", minLength: 1 }, default: [] },
      text_safe_area: {
        type: "object",
        additionalProperties: false,
        required: ["position", "margin"],
        properties: {
          position: { type: "string", enum: ["left", "right", "center"] },
          margin: { type: "string", enum: ["tight", "normal", "wide"] },
        },
      },
      overlay_guidance: {
        type: "object",
        additionalProperties: false,
        required: ["headline_max_chars", "cta_style", "badge_optional"],
        properties: {
          headline_max_chars: { type: "integer", minimum: 10, maximum: 90 },
          cta_style: { type: "string", enum: ["solid", "outline", "pill"] },
          badge_optional: { type: "boolean" },
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
  Number.parseInt(process.env.CREATIVE_MAX_DURATION_MS || "300000", 10),
  10000,
  600000,
);
const MAX_IMAGE_DURATION_MS = clampInt(
  Number.parseInt(process.env.CREATIVE_IMAGE_MAX_DURATION_MS || "240000", 10),
  10000,
  600000,
);
const IMAGE_TOP_N = clampInt(
  Number.parseInt(process.env.CREATIVE_IMAGE_TOP_N || "0", 10),
  0,
  12,
);

function hashPrompt(prompt) {
  return crypto.createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

function sizeForFormat(format) {
  switch (format) {
    case "9:16":
    case "4:5":
      return "1024x1536";
    case "1:1":
    default:
      return "1024x1024";
  }
}

async function resolveInputImageBase64(imagePath) {
  if (!imagePath) return null;
  try {
    const signed = await supabaseAdmin.storage
      .from("creative-inputs")
      .createSignedUrl(imagePath, 60 * 10);
    if (signed.error || !signed.data?.signedUrl) return null;
    const res = await fetch(signed.data.signedUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch {
    return null;
  }
}

function pickCreativesForImages(creatives) {
  if (!Array.isArray(creatives) || creatives.length === 0) return [];
  if (!IMAGE_TOP_N) return creatives.map((c, idx) => ({ index: idx, creative: c }));
  const ranked = creatives
    .map((creative, index) => ({ creative, index }))
    .sort((a, b) => (b.creative?.score?.value ?? 0) - (a.creative?.score?.value ?? 0));
  return ranked.slice(0, IMAGE_TOP_N);
}

function scoreToFive(score) {
  if (!Number.isFinite(score)) return 0;
  return clampInt(Math.round(score / 20), 0, 5);
}

function deriveVisualThumbStop(creative) {
  if (creative?.image?.final_image_url) return 5;
  if (creative?.image?.hero_image_url) return 4;
  return 2;
}

function buildProQuality(creative) {
  const base = scoreToFive(creative?.score?.value ?? 0);
  const visualThumbStop = deriveVisualThumbStop(creative);
  const scores = {
    hookPower: base,
    clarity: base,
    proof: Math.max(1, base - 1),
    offer: base,
    platformFit: base,
    objectionHandling: Math.max(1, base - 1),
    novelty: Math.max(1, base - 1),
    visualThumbStop,
  };
  const totalRaw =
    2 * scores.visualThumbStop +
    scores.hookPower +
    scores.clarity +
    scores.proof +
    scores.offer +
    scores.platformFit +
    scores.objectionHandling +
    scores.novelty;
  const total = clampInt(Math.round((totalRaw / 40) * 100), 0, 100);
  return {
    scores,
    total,
    ko: { complianceFail: false, genericBuzzwordFail: false },
    issues: [],
  };
}

function buildWinnerSelection(variants) {
  const scores = variants.map((v) => ({ id: v.id, total: v.quality.total }));
  const winner = scores.slice().sort((a, b) => b.total - a.total)[0];
  return {
    recommended_winner_id: winner?.id || variants[0]?.id || "unknown",
    rationale: "Highest weighted total score across copy + visual thumb-stop.",
    scores,
  };
}

function buildProOutputFromV1({
  output,
  brief,
  jobId,
  styleMode,
  platforms,
  formats,
  strategyId,
  strategyBlueprint,
  imageSpecsByIndex,
}) {
  const variants = output.creatives.map((creative, idx) => {
    const quality = buildProQuality(creative);
    return {
      id: creative.id,
      platform: "meta",
      format: creative.format,
      copy: {
        hook: creative.copy.hook,
        primary_text: creative.copy.primary_text,
        bullets: creative.copy.bullets ?? [],
        cta: creative.copy.cta,
        alt_hooks: [],
        on_screen_text: [creative.copy.hook].slice(0, 4),
      },
      visual: {
        image_spec: imageSpecsByIndex?.[idx] ?? null,
        image: {
          input_image_used: Boolean(creative.image?.input_image_used),
          render_intent: creative.image?.render_intent || "Hero image",
          hero_image_url: creative.image?.hero_image_url ?? null,
          final_image_url: creative.image?.final_image_url ?? null,
          width: creative.image?.width ?? null,
          height: creative.image?.height ?? null,
          model: creative.image?.model ?? null,
          seed: creative.image?.seed ?? null,
          prompt_hash: creative.image?.prompt_hash ?? null,
          render_version: creative.image?.render_version ?? null,
        },
      },
      quality,
      experiment: { ab_tests: [] },
    };
  });

  return {
    schema_version: "2.1-pro",
    job: {
      id: jobId,
      style_mode: styleMode,
      platforms: platforms.length ? platforms : ["meta"],
      formats: formats.length ? formats : [brief.format],
      language: brief.language,
    },
    brand: { name: brief.brand?.name || "AdRuby" },
    product: {
      name: brief.product?.name || "Product",
      url: brief.product?.url ?? null,
      category: brief.product?.category ?? null,
    },
    audience: {
      summary: brief.audience?.summary || "Audience",
      segments: brief.audience?.segments || [],
    },
    offer: {
      summary: brief.offer?.summary ?? null,
      constraints: brief.offer?.constraints || [],
    },
    strategy: {
      id: strategyId || null,
      blueprint: strategyBlueprint || null,
    },
    variants,
    winner_selection: buildWinnerSelection(variants),
    brief,
  };
}

function buildProOutputFromV2({
  output,
  brief,
  jobId,
  styleMode,
  platforms,
  formats,
  strategyId,
  strategyBlueprint,
  imageSpecsByIndex,
}) {
  const variants = output.variants.map((variant, idx) => {
    const creative = {
      score: { value: 80 },
      image: variant.image || {},
    };
    const quality = buildProQuality(creative);
    return {
      id: variant.id || `v${idx + 1}`,
      platform: variant.platform || "meta",
      format: variant.format || brief.format,
      copy: {
        hook: variant.hook || variant?.script?.hook || "Hook",
        primary_text:
          variant?.script?.offer ||
          variant?.script?.proof ||
          variant?.script?.problem ||
          "Primary text",
        bullets: [],
        cta: variant.cta || variant?.script?.cta || "Mehr erfahren",
        alt_hooks: [],
        on_screen_text: Array.isArray(variant.on_screen_text)
          ? variant.on_screen_text.slice(0, 6)
          : [],
      },
      visual: {
        image_spec: imageSpecsByIndex?.[idx] ?? null,
        image: {
          input_image_used: Boolean(variant?.image?.input_image_used),
          render_intent: variant?.image?.render_intent || "Hero image",
          hero_image_url: variant?.image?.hero_image_url ?? null,
          final_image_url: variant?.image?.final_image_url ?? null,
          width: variant?.image?.width ?? null,
          height: variant?.image?.height ?? null,
          model: variant?.image?.model ?? null,
          seed: variant?.image?.seed ?? null,
          prompt_hash: variant?.image?.prompt_hash ?? null,
          render_version: variant?.image?.render_version ?? null,
        },
      },
      quality,
      experiment: { ab_tests: [] },
    };
  });

  return {
    schema_version: "2.1-pro",
    job: {
      id: jobId,
      style_mode: styleMode,
      platforms: platforms.length ? platforms : ["meta"],
      formats: formats.length ? formats : [brief.format],
      language: brief.language,
    },
    brand: { name: brief.brand?.name || "AdRuby" },
    product: {
      name: brief.product?.name || "Product",
      url: brief.product?.url ?? null,
      category: brief.product?.category ?? null,
    },
    audience: {
      summary: brief.audience?.summary || "Audience",
      segments: brief.audience?.segments || [],
    },
    offer: {
      summary: brief.offer?.summary ?? null,
      constraints: brief.offer?.constraints || [],
    },
    strategy: {
      id: strategyId || null,
      blueprint: strategyBlueprint || null,
    },
    variants,
    winner_selection: buildWinnerSelection(variants),
    brief,
  };
}

function buildFallbackImageSpec(brief, creative) {
  const avoid = (brief?.risk_flags || []).map((f) => f?.note).filter(Boolean);
  const format = creative?.format || brief?.format || "4:5";
  return {
    version: "1.0",
    format,
    platform: "meta",
    style: {
      mood: "confident",
      lighting: "soft natural",
      palette: ["#ffffff", "#0f172a", "#e2e8f0"],
      camera: "35mm, shallow depth of field",
      render_style: "clean commercial",
      realism_level: "high",
    },
    scene: {
      subject: brief?.product?.name || "product in use",
      environment: "clean modern setting",
      composition: "centered hero with negative space for text overlay",
      props: ["product", "hands"],
      wardrobe: ["neutral tones"],
    },
    brand_safety: { avoid },
    negative_prompt: ["text", "watermark", "logo text"],
    text_safe_area: { position: "center", margin: "normal" },
    overlay_guidance: { headline_max_chars: 60, cta_style: "solid", badge_optional: true },
  };
}

function normalizeV1OutputImages(output, hasImage) {
  if (!output || !Array.isArray(output.creatives)) return output;
  return {
    ...output,
    creatives: output.creatives.map((creative) => {
      const image = creative?.image || {};
      return {
        ...creative,
        image: {
          input_image_used: Boolean(image.input_image_used ?? hasImage),
          render_intent: image.render_intent || "Hero image",
          hero_image_url: image.hero_image_url ?? null,
          final_image_url: image.final_image_url ?? null,
          width: image.width ?? null,
          height: image.height ?? null,
          model: image.model ?? null,
          seed: image.seed ?? null,
          prompt_hash: image.prompt_hash ?? null,
          render_version: image.render_version ?? null,
        },
      };
    }),
  };
}

function normalizeV2OutputImages(output, hasImage) {
  if (!output || !Array.isArray(output.variants)) return output;
  return {
    ...output,
    variants: output.variants.map((variant) => {
      const image = variant?.image || {};
      return {
        ...variant,
        image: {
          input_image_used: Boolean(image.input_image_used ?? hasImage),
          render_intent: image.render_intent || "Hero image",
          hero_image_url: image.hero_image_url ?? null,
          final_image_url: image.final_image_url ?? null,
          width: image.width ?? null,
          height: image.height ?? null,
          model: image.model ?? null,
          seed: image.seed ?? null,
          prompt_hash: image.prompt_hash ?? null,
          render_version: image.render_version ?? null,
        },
      };
    }),
  };
}

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
  const imagePath =
    typeof body?.imagePath === "string" && body.imagePath.trim()
      ? body.imagePath.trim()
      : null;
  const hasImage = Boolean(body?.hasImage || imagePath);
  let strategyId = typeof body?.strategyId === "string" ? body.strategyId.trim() : "";
  const strategyBlueprint = null;
  const outputModeRaw = typeof body?.outputMode === "string" ? body.outputMode.trim() : "";
  const outputMode = outputModeRaw === "pro" ? "pro" : "v1";
  const platforms = Array.isArray(body?.platforms)
    ? body.platforms.filter((p) => ["meta", "tiktok", "youtube_shorts", "linkedin"].includes(p))
    : [];
  const formats = Array.isArray(body?.formats)
    ? body.formats.filter((f) => FORMATS.includes(f))
    : [];

  let credits;
  try {
    credits = await assertAndConsumeCredits(userId, "creative_generate");
  } catch (err) {
    return badRequest(err?.message || "Insufficient credits", 402);
  }
  const inputForLog = { brief, hasImage, imagePath, strategyId: strategyId || null, outputMode };
  let placeholderId = "";
  const imageSpecsByIndex = {};

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
    placeholderId = typeof body?.jobId === 'string' ? body.jobId.trim() : '';
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
      if (strategyId) {
        try {
          const { data: existingInputs } = await supabaseAdmin
            .from('generated_creatives')
            .select('inputs')
            .eq('id', placeholderId)
            .single();
          const mergedInputs = {
            ...(existingInputs?.inputs && typeof existingInputs.inputs === 'object'
              ? existingInputs.inputs
              : {}),
            strategyId,
          };
          await supabaseAdmin
            .from('generated_creatives')
            .update({ blueprint_id: strategyId, inputs: mergedInputs })
            .eq('id', placeholderId);
        } catch (e) {
          console.warn('[creative-generate] failed to persist auto strategy', e?.message || e);
        }
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
    const visualStyle =
      typeof body?.visual_style === "string" && body.visual_style.trim()
        ? body.visual_style.trim()
        : null;
    const ctaPreference =
      typeof body?.cta_preference === "string" && body.cta_preference.trim()
        ? body.cta_preference.trim()
        : null;
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

        let v2output = repaired.data;
        v2output = normalizeV2OutputImages(v2output, hasImage);

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

        try {
          if (placeholderId) {
            const partialOutput =
              outputMode === "pro"
                ? buildProOutputFromV2({
                    output: v2output,
                    brief,
                    jobId: placeholderId,
                    styleMode,
                    platforms,
                    formats,
                    strategyId,
                    strategyBlueprint,
                    imageSpecsByIndex,
                  })
                : v2output;
            await supabaseAdmin
              .from("generated_creatives")
              .update({
                outputs: partialOutput,
                status: "in_progress",
                progress: 65,
                progress_meta: {
                  phase: "text_ready",
                  message: "Text-Varianten fertig. Bilder werden generiert…",
                },
              })
              .eq("id", placeholderId);
          }
        } catch (e) {
          logStep("mentor.partial.save.error", { jobId: placeholderId, error: e?.message || String(e) });
        }

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

        const scoredMap = new Map(scored.map((s) => [s.index, s.score]));
        const mentorTargets = IMAGE_TOP_N
          ? scored.slice(0, IMAGE_TOP_N).map((s) => ({ index: s.index, variant: s.variant }))
          : variants.map((variant, index) => ({ index, variant }));

        if (mentorTargets.length) {
          logStep("mentor.images.start", { jobId: placeholderId, count: mentorTargets.length });
          const imageQuality = process.env.CREATIVE_IMAGE_QUALITY || "auto";
          const inputImageBase64 = await resolveInputImageBase64(imagePath);
          try {
            if (placeholderId) {
              await supabaseAdmin
                .from("generated_creatives")
                .update({
                  progress: 92,
                  progress_meta: { phase: "gen_images", total: mentorTargets.length },
                })
                .eq("id", placeholderId);
            }
          } catch {
            /* ignore */
          }

          for (let i = 0; i < mentorTargets.length; i += 1) {
            const { variant, index } = mentorTargets[i];
            const renderCreative = {
              format: brief.format,
              copy: {
                hook: variant.hook || variant?.script?.hook || " ",
                primary_text:
                  variant?.script?.offer ||
                  variant?.script?.proof ||
                  variant?.script?.problem ||
                  " ",
                cta: variant.cta || variant?.script?.cta || "Mehr erfahren",
                bullets: [],
              },
              image: {
                input_image_used: hasImage,
                render_intent: variant.hook || "Hero image",
              },
            };

            let imageSpec = buildFallbackImageSpec(brief, renderCreative);
            try {
              const specPrompt =
                outputMode === "pro"
                  ? buildImageSpecPromptPro({
                      brief,
                      variant: renderCreative,
                      strategyBlueprint,
                      researchContext,
                    })
                  : buildImageSpecPrompt({
                      brief,
                      creative: renderCreative,
                      strategyBlueprint,
                      researchContext,
                    });
              const specSchema = outputMode === "pro" ? AD_IMAGE_SPEC_JSON_SCHEMA : IMAGE_SPEC_JSON_SCHEMA;
              const specRaw = await callOpenAiJson(specPrompt, {
                responseFormat: specSchema,
              });
              const specParsed = await parseWithRepair({
                schema: ImageSpecSchema,
                initial: specRaw,
                makeRequest: async (instruction) =>
                  callOpenAiJson(specPrompt + "\n\n" + instruction, {
                    responseFormat: specSchema,
                  }),
              });
              imageSpec = specParsed.data;
              imageSpecsByIndex[index] = imageSpec;
            } catch (err) {
              logStep("mentor.images.spec.error", {
                jobId: placeholderId,
                index,
                error: err?.message || String(err),
              });
            }
            imageSpecsByIndex[index] = imageSpec;

            const imagePrompt = buildImagePromptFromSpec(imageSpec);
            const promptHash = hashPrompt(imagePrompt);
            const format = imageSpec?.format || brief.format;
            const size = sizeForFormat(format);

            let heroB64 = null;
            let heroMeta = null;
            if (inputImageBase64) {
              heroB64 = inputImageBase64;
              heroMeta = { model: "user_upload" };
            } else {
              try {
                const hero = await generateHeroImage({
                  prompt: imagePrompt,
                  size,
                  quality: imageQuality,
                });
                heroB64 = hero.b64;
                heroMeta = hero;
              } catch (err) {
                logStep("mentor.images.hero.error", {
                  jobId: placeholderId,
                  index,
                  error: err?.message || String(err),
                });
              }
            }

            let heroUrl = null;
            if (heroB64) {
              try {
                const heroUpload = await uploadHeroImage({
                  userId,
                  buffer: Buffer.from(heroB64, "base64"),
                  promptHash,
                });
                heroUrl = heroUpload.url;
              } catch (err) {
                logStep("mentor.images.hero.upload.error", {
                  jobId: placeholderId,
                  index,
                  error: err?.message || String(err),
                });
              }
            }

            let finalUrl = null;
            let renderWidth = null;
            let renderHeight = null;
            let renderVersion = null;
            try {
              const rendered = await renderAdImage({
                creative: renderCreative,
                brief,
                format,
                heroBase64: heroB64,
              });
              renderWidth = rendered.width;
              renderHeight = rendered.height;
              renderVersion = rendered.renderVersion;
              const finalUpload = await uploadRenderedImage({
                userId,
                buffer: rendered.buffer,
                promptHash,
              });
              finalUrl = finalUpload.url;
            } catch (err) {
              logStep("mentor.images.render.error", {
                jobId: placeholderId,
                index,
                error: err?.message || String(err),
              });
            }

            variants[index] = {
              ...variant,
              image: {
                input_image_used: Boolean(hasImage),
                render_intent: renderCreative.image.render_intent || "Hero image",
                hero_image_url: heroUrl ?? null,
                final_image_url: finalUrl ?? null,
                width: renderWidth ?? null,
                height: renderHeight ?? null,
                model: heroMeta?.model ?? null,
                seed: heroMeta?.seed ?? null,
                prompt_hash: promptHash,
                render_version: renderVersion ?? null,
              },
            };

            try {
              if (placeholderId) {
                const pct = Math.min(99, 92 + Math.round(((i + 1) / mentorTargets.length) * 6));
                const progressOutput =
                  outputMode === "pro"
                    ? buildProOutputFromV2({
                        output: v2output,
                        brief,
                        jobId: placeholderId,
                        styleMode,
                        platforms,
                        formats,
                        strategyId,
                        strategyBlueprint,
                        imageSpecsByIndex,
                      })
                    : v2output;
                await supabaseAdmin
                  .from("generated_creatives")
                  .update({
                    outputs: progressOutput,
                    progress: pct,
                    progress_meta: {
                      phase: "images_progress",
                      message: `Bild ${i + 1}/${mentorTargets.length} fertig`,
                      done: i + 1,
                      total: mentorTargets.length,
                      lastVariantId: variant.id || null,
                    },
                  })
                  .eq("id", placeholderId);
              }
            } catch {
              /* ignore */
            }
          }
        }

        // finalize: persist outputs (store full v2 output but keep legacy outputs for compatibility)
        const finalOutput =
          outputMode === "pro"
            ? buildProOutputFromV2({
                output: { ...v2output, variants },
                brief,
                jobId: placeholderId,
                styleMode,
                platforms,
                formats,
                strategyId: strategyId || null,
                strategyBlueprint,
                imageSpecsByIndex,
              })
            : { ...v2output, variants };
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
    const isOverTimeBudget = () => Date.now() - startedAt > MAX_DURATION_MS;
    logStep("default.start", { jobId: placeholderId });
    const prompt = buildGeneratePrompt(brief, hasImage, strategyBlueprint, researchContext, {
      visual_style: visualStyle,
      cta_preference: ctaPreference,
    });

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
      if (isOverTimeBudget()) {
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
        preferences: { visual_style: visualStyle, cta_preference: ctaPreference },
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

    best = normalizeV1OutputImages(best, hasImage);
    const partialOutput =
      outputMode === "pro"
        ? buildProOutputFromV1({
            output: best,
            brief,
            jobId: placeholderId,
            styleMode,
            platforms,
            formats,
            strategyId: strategyId || null,
            strategyBlueprint,
            imageSpecsByIndex,
          })
        : best;
    try {
      if (placeholderId) {
        await supabaseAdmin
          .from("generated_creatives")
          .update({
            outputs: partialOutput,
            status: "in_progress",
            progress: 45,
            progress_meta: {
              phase: "text_ready",
              message: "Text-Varianten fertig. Bilder werden generiert…",
            },
          })
          .eq("id", placeholderId);
      }
    } catch {
      /* ignore */
    }

    const inputImageBase64 = await resolveInputImageBase64(imagePath);
    const imageTargets = pickCreativesForImages(best.creatives);
    if (imageTargets.length) {
      const imageStartedAt = Date.now();
      const isOverImageBudget = () => Date.now() - imageStartedAt > MAX_IMAGE_DURATION_MS;
      logStep("default.images.start", { jobId: placeholderId, count: imageTargets.length });
      const imageQuality = process.env.CREATIVE_IMAGE_QUALITY || "auto";
      try {
        if (placeholderId) {
          await supabaseAdmin
            .from("generated_creatives")
            .update({ progress: 92, progress_meta: { phase: "gen_images", total: imageTargets.length } })
            .eq("id", placeholderId);
        }
      } catch {
        /* ignore */
      }

      for (let i = 0; i < imageTargets.length; i += 1) {
        if (isOverImageBudget()) {
          logStep("default.timeout", {
            jobId: placeholderId,
            elapsedMs: Date.now() - startedAt,
            imageElapsedMs: Date.now() - imageStartedAt,
            attemptsUsed,
            phase: "images",
          });
          break;
        }
        const { creative, index } = imageTargets[i];
        let imageSpec = buildFallbackImageSpec(brief, creative);
        try {
          const specPrompt =
            outputMode === "pro"
              ? buildImageSpecPromptPro({
                  brief,
                  variant: creative,
                  strategyBlueprint,
                  researchContext,
                })
              : buildImageSpecPrompt({
                  brief,
                  creative,
                  strategyBlueprint,
                  researchContext,
                });
          const specSchema = outputMode === "pro" ? AD_IMAGE_SPEC_JSON_SCHEMA : IMAGE_SPEC_JSON_SCHEMA;
          const specRaw = await callOpenAiJson(specPrompt, {
            responseFormat: specSchema,
          });
          const specParsed = await parseWithRepair({
            schema: ImageSpecSchema,
            initial: specRaw,
            makeRequest: async (instruction) =>
              callOpenAiJson(specPrompt + "\n\n" + instruction, {
                responseFormat: specSchema,
              }),
          });
          imageSpec = specParsed.data;
          imageSpecsByIndex[index] = imageSpec;
        } catch (err) {
          logStep("default.images.spec.error", {
            jobId: placeholderId,
            index,
            error: err?.message || String(err),
          });
        }
        imageSpecsByIndex[index] = imageSpec;

        const imagePrompt = buildImagePromptFromSpec(imageSpec);
        const promptHash = hashPrompt(imagePrompt);
        const format = imageSpec?.format || creative?.format || brief.format;
        const size = sizeForFormat(format);

        let heroB64 = null;
        let heroMeta = null;
        if (inputImageBase64) {
          heroB64 = inputImageBase64;
          heroMeta = { model: "user_upload" };
        } else {
          try {
            const hero = await generateHeroImage({
              prompt: imagePrompt,
              size,
              quality: imageQuality,
            });
            heroB64 = hero.b64;
            heroMeta = hero;
          } catch (err) {
            logStep("default.images.hero.error", {
              jobId: placeholderId,
              index,
              error: err?.message || String(err),
            });
          }
        }

        let heroUrl = null;
        if (heroB64) {
          try {
            const heroUpload = await uploadHeroImage({
              userId,
              buffer: Buffer.from(heroB64, "base64"),
              promptHash,
            });
            heroUrl = heroUpload.url;
          } catch (err) {
            logStep("default.images.hero.upload.error", {
              jobId: placeholderId,
              index,
              error: err?.message || String(err),
            });
          }
        }

        let finalUrl = null;
        let renderWidth = null;
        let renderHeight = null;
        let renderVersion = null;
        try {
          const rendered = await renderAdImage({
            creative,
            brief,
            format,
            heroBase64: heroB64,
          });
          renderWidth = rendered.width;
          renderHeight = rendered.height;
          renderVersion = rendered.renderVersion;
          const finalUpload = await uploadRenderedImage({
            userId,
            buffer: rendered.buffer,
            promptHash,
          });
          finalUrl = finalUpload.url;
        } catch (err) {
          logStep("default.images.render.error", {
            jobId: placeholderId,
            index,
            error: err?.message || String(err),
          });
        }

        const updatedImage = {
          input_image_used: Boolean(creative.image?.input_image_used ?? hasImage),
          render_intent: creative.image?.render_intent || "Hero image",
          hero_image_url: heroUrl ?? null,
          final_image_url: finalUrl ?? null,
          width: renderWidth ?? null,
          height: renderHeight ?? null,
          model: heroMeta?.model ?? null,
          seed: heroMeta?.seed ?? null,
          prompt_hash: promptHash,
          render_version: renderVersion ?? null,
        };

        best.creatives[index] = {
          ...creative,
          image: updatedImage,
        };

        try {
          if (placeholderId) {
            const pct = Math.min(99, 92 + Math.round(((i + 1) / imageTargets.length) * 6));
            const progressOutput =
              outputMode === "pro"
                ? buildProOutputFromV1({
                    output: best,
                    brief,
                    jobId: placeholderId,
                    styleMode,
                    platforms,
                    formats,
                    strategyId: strategyId || null,
                    strategyBlueprint,
                    imageSpecsByIndex,
                  })
                : best;
            await supabaseAdmin
              .from("generated_creatives")
              .update({
                outputs: progressOutput,
                progress: pct,
                progress_meta: {
                  phase: "images_progress",
                  message: `Bild ${i + 1}/${imageTargets.length} fertig`,
                  done: i + 1,
                  total: imageTargets.length,
                  lastVariantId: creative?.id ?? null,
                },
              })
              .eq("id", placeholderId);
          }
        } catch {
          /* ignore */
        }
      }
    }

    const finalOutput =
      outputMode === "pro"
        ? buildProOutputFromV1({
            output: best,
            brief,
            jobId: placeholderId,
            styleMode,
            platforms,
            formats,
            strategyId: strategyId || null,
            strategyBlueprint,
            imageSpecsByIndex,
          })
        : best;

    const finalScore =
      outputMode === "pro"
        ? finalOutput?.winner_selection?.scores?.find(
            (s) => s.id === finalOutput?.winner_selection?.recommended_winner_id,
          )?.total ?? bestEval.satisfaction
        : bestEval.satisfaction;

    await logAiAction({
      userId,
      actionType: "creative_generate",
      status: "success",
      input: inputForLog,
      output: finalOutput,
      meta: { credits, quality: bestEval, strategyId: strategyId || null },
    });
    // finalize placeholder row with outputs/score/status
    try {
      if (placeholderId) {
        await supabaseAdmin
          .from('generated_creatives')
          .update({ outputs: finalOutput, score: finalScore, status: 'complete', progress: 100 })
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
      output: finalOutput,
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let openAiCooldownUntil = 0;
let openAiLastCallAt = 0;

function getOpenAiMinIntervalMs() {
  return clampInt(Number(process.env.OPENAI_MIN_INTERVAL_MS || 0), 0, 60000);
}

function getOpenAiRetryBufferMs() {
  return clampInt(Number(process.env.OPENAI_RETRY_BUFFER_MS || 5000), 0, 30000);
}

async function waitForOpenAiSlot() {
  const now = Date.now();
  const minIntervalMs = getOpenAiMinIntervalMs();
  const nextAllowed = Math.max(openAiCooldownUntil, openAiLastCallAt + minIntervalMs);
  if (nextAllowed > now) {
    await sleep(nextAllowed - now);
  }
  openAiLastCallAt = Date.now();
}

function isOpenAiTimeoutError(err) {
  const name = String(err?.name || "");
  const message = String(err?.message || "");
  return name.includes("Timeout") || message.toLowerCase().includes("timed out");
}

function isRetryableOpenAiError(err) {
  const status = Number(err?.status);
  if (status === 429 || status >= 500) return true;
  const name = String(err?.name || "");
  if (name.includes("APIConnection")) return true;
  return isOpenAiTimeoutError(err);
}

function parseRetryAfterMs(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return Math.ceil(numeric * 1000);
  const secondsMatch = trimmed.match(/([\d.]+)\s*s/i);
  if (secondsMatch) {
    const seconds = Number(secondsMatch[1]);
    if (Number.isFinite(seconds)) return Math.ceil(seconds * 1000);
  }
  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    const delta = dateMs - Date.now();
    if (delta > 0) return Math.ceil(delta);
  }
  return null;
}

function getRetryDelayMs(err, attempt) {
  const headers = err?.headers;
  let headerValue = null;
  if (headers && typeof headers.get === "function") {
    headerValue =
      headers.get("retry-after") ||
      headers.get("x-ratelimit-reset-tokens") ||
      headers.get("x-ratelimit-reset-requests");
  }
  const headerDelay = parseRetryAfterMs(headerValue) ?? 0;
  const message = String(err?.message || "");
  const msgMatch = message.match(/try again in ([\d.]+)s/i);
  const messageDelay = msgMatch ? Math.ceil(Number(msgMatch[1]) * 1000) : 0;
  const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
  const bufferMs = getOpenAiRetryBufferMs();
  return clampInt(Math.max(backoffMs, headerDelay, messageDelay) + bufferMs, 300, 120000);
}

async function callOpenAiJson(prompt, options = {}) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();
  const useSchema = process.env.USE_JSON_SCHEMA === "1";
  const responseFormat = options?.responseFormat;
  const baseTimeoutMs = clampInt(
    Number(process.env.OPENAI_TIMEOUT_MS || 120000),
    5000,
    180000,
  );
  const maxRetries = clampInt(Number(process.env.OPENAI_MAX_RETRIES || 2), 0, 4);

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const timeoutMs = clampInt(baseTimeoutMs + attempt * 5000, 5000, 180000);
    try {
      await waitForOpenAiSlot();
      const res = await openai.responses.create(
        {
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
        },
        {
          timeout: timeoutMs,
          maxRetries: 0,
        },
      );

      const text = String(res.output_text || "").trim();
      if (!text) throw new Error("Empty OpenAI response.");
      return text;
    } catch (err) {
      lastError = err;
      if (isOpenAiTimeoutError(err)) {
        console.error("[creative-generate] OpenAI request timed out", { timeoutMs, attempt });
      } else {
        console.error("[creative-generate] OpenAI request failed", err?.message || err);
      }

      if (attempt < maxRetries && isRetryableOpenAiError(err)) {
        const delayMs = getRetryDelayMs(err, attempt);
        if (Number(err?.status) === 429) {
          openAiCooldownUntil = Math.max(openAiCooldownUntil, Date.now() + delayMs);
        }
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("OpenAI request failed.");
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
