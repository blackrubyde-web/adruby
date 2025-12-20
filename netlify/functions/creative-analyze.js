import { badRequest, methodNotAllowed, ok, serverError, withCors } from "./utils/response.js";
import { initTelemetry, captureException } from "./utils/telemetry.js";
import { requireUserId } from "./_shared/auth.js";
import { assertAndConsumeCredits } from "./_shared/credits.js";
import { requireActiveSubscription } from "./_shared/entitlements.js";
import { uploadCreativeInputImage } from "./_shared/storage.js";
import { logAiAction } from "./_shared/aiLogging.js";
import { supabaseAdmin } from "./_shared/clients.js";
import { getOpenAiClient, getOpenAiModel } from "./_shared/openai.js";
import { buildAnalyzePrompt } from "./_shared/creativePrompts.js";
import { parseWithRepair } from "./_shared/repair.js";
import { NormalizedBriefSchema } from "./_shared/creativeSchemas.js";
import { parseMultipart } from "./utils/multipart.js";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const GOALS = new Set(["sales", "leads", "traffic", "app_installs"]);
const FUNNELS = new Set(["cold", "warm", "hot"]);
const LANGS = new Set(["de", "en"]);
const FORMATS = new Set(["1:1", "4:5", "9:16"]);
const TONES = new Set([
  "direct",
  "luxury",
  "playful",
  "minimal",
  "bold",
  "trustworthy",
]);

function inferImageType(filename) {
  const name = String(filename || "").toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return null;
}

function buildFallbackBrief(input) {
  const safeGoal = GOALS.has(input.goal) ? input.goal : "sales";
  const safeFunnel = FUNNELS.has(input.funnel) ? input.funnel : "cold";
  const safeLang = LANGS.has(input.language) ? input.language : "de";
  const safeFormat = FORMATS.has(input.format) ? input.format : "4:5";
  const safeTone = TONES.has(input.tone) ? input.tone : "direct";
  const brandName = input.brandName || input.productName || "AdRuby";
  const productName = input.productName || brandName;
  const audienceSummary = input.audience || "General audience";
  const offerSummary = input.offer || null;
  const constraints = input.avoidClaims ? [input.avoidClaims] : [];

  return NormalizedBriefSchema.parse({
    brand: { name: brandName },
    product: {
      name: productName,
      url: input.productUrl || null,
      category: null,
    },
    goal: safeGoal,
    funnel_stage: safeFunnel,
    language: safeLang,
    format: safeFormat,
    audience: {
      summary: audienceSummary,
      segments: [audienceSummary],
    },
    offer: {
      summary: offerSummary,
      constraints,
    },
    tone: safeTone,
    angles: [
      {
        id: "benefit",
        label: "Key benefit",
        why_it_fits: "Highlights the main value proposition for the audience.",
      },
      {
        id: "proof",
        label: "Social proof",
        why_it_fits: "Builds trust with credible, simple proof points.",
      },
    ],
    risk_flags: [],
  });
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

  let fields;
  let files;
  try {
    const parsed = await parseMultipart(event, { maxFileSizeBytes: 10 * 1024 * 1024 });
    fields = parsed.fields;
    files = parsed.files;
  } catch (err) {
    return badRequest(err?.message || "Invalid multipart request");
  }

  const brandName = String(fields.brandName || "").trim();
  const productName = String(fields.productName || "").trim();
  const audience = String(fields.audience || "").trim();

  const tone = String(fields.tone || "direct").trim() || "direct";
  const goal = String(fields.goal || "sales").trim() || "sales";
  const funnel = String(fields.funnel || "cold").trim() || "cold";
  const language = String(fields.language || "de").trim() || "de";
  const format = String(fields.format || "1:1").trim() || "1:1";

  const productUrl = fields.productUrl ? String(fields.productUrl).trim() : null;
  const offer = fields.offer ? String(fields.offer).trim() : null;
  const inspiration = fields.inspiration ? String(fields.inspiration).trim() : null;
  const avoidClaims = fields.avoidClaims ? String(fields.avoidClaims).trim() : null;
  const strategyId = fields.strategyId ? String(fields.strategyId).trim() : null;

  if (!brandName || !productName || !audience) {
    return badRequest("Missing required fields (brandName, productName, audience).");
  }

  let imageMeta = null;
  let imageWarning = null;
  try {
    const file = files?.image;
    if (file && file.size > 0) {
      const inferred = inferImageType(file.filename);
      const contentType =
        !file.contentType || file.contentType === "application/octet-stream"
          ? inferred || file.contentType
          : file.contentType;
      if (!ALLOWED_TYPES.has(contentType)) {
        return badRequest("Unsupported image type. Use JPG, PNG or WebP.");
      }
      file.contentType = contentType;
      imageMeta = await uploadCreativeInputImage({ userId, file });
    }
  } catch (err) {
    const msg = String(err?.message || "");
    const lower = msg.toLowerCase();
    if (lower.includes("bucket") || lower.includes("storage not configured")) {
      imageWarning = msg || "Image storage not configured. Skipped image analysis.";
      imageMeta = null;
    } else {
      return serverError(err?.message || "Image upload failed");
    }
  }

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
    credits = await assertAndConsumeCredits(userId, "creative_analyze");
  } catch (err) {
    return badRequest(err?.message || "Insufficient credits", 402);
  }

  const prompt = buildAnalyzePrompt({
    brandName,
    productName,
    productUrl,
    offer,
    audience,
    tone,
    goal,
    funnel,
    language,
    format,
    inspiration,
    avoidClaims,
    strategyBlueprint,
  });

  const inputForLog = {
    brandName,
    productName,
    productUrl,
    offer,
    audience,
    tone,
    goal,
    funnel,
    language,
    format,
    inspiration,
    avoidClaims,
    strategyId,
    imagePath: imageMeta?.path ?? null,
    imageWarning,
  };

  try {
    const initial = await callOpenAiJson({
      prompt,
      imageUrl: imageMeta?.signedUrl ?? null,
    });

    const repaired = await parseWithRepair({
      schema: NormalizedBriefSchema,
      initial,
      makeRequest: async (instruction) =>
        callOpenAiJson({
          prompt: prompt + "\n\n" + instruction,
          imageUrl: imageMeta?.signedUrl ?? null,
        }),
    });

    await logAiAction({
      userId,
      actionType: "creative_analyze",
      status: "success",
      input: inputForLog,
      output: repaired.data,
      meta: { attempts: repaired.attempts, credits },
    });

    return ok({
      brief: repaired.data,
      image: imageMeta ? { path: imageMeta.path, signedUrl: imageMeta.signedUrl } : null,
      credits,
      warning: imageWarning || null,
    });
  } catch (err) {
    console.warn("[creative-analyze] fallback after JSON repair failure", err?.message || err);

    const fallback = buildFallbackBrief({
      brandName,
      productName,
      productUrl,
      offer,
      audience,
      tone,
      goal,
      funnel,
      language,
      format,
      avoidClaims,
    });

    await logAiAction({
      userId,
      actionType: "creative_analyze",
      status: "fallback",
      input: inputForLog,
      output: fallback,
      errorMessage: err?.message || "Invalid JSON",
      meta: { credits, fallback: true },
    });

    return ok({
      brief: fallback,
      image: imageMeta ? { path: imageMeta.path, signedUrl: imageMeta.signedUrl } : null,
      credits,
      warning: "AI response invalid. Returned a safe fallback brief.",
    });
  }
}

async function callOpenAiJson({ prompt, imageUrl }) {
  const openai = getOpenAiClient();
  const model = getOpenAiModel();

  const input = [
    {
      role: "system",
      content: "Return ONLY valid JSON. No markdown. Follow the schema strictly. Do not add extra keys.",
    },
    {
      role: "user",
      content: imageUrl
        ? [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageUrl },
          ]
        : [{ type: "input_text", text: prompt }],
    },
  ];

  const res = await openai.responses.create({
    model,
    input,
    // make the model deterministic for structured JSON output
    temperature: 0.0,
  });

  const text = String(res.output_text || "").trim();
  if (!text) throw new Error("Empty OpenAI response.");
  return text;
}
