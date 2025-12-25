import OpenAI from "openai";

let cached = null;

export function getOpenAiClient() {
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[OpenAI] Missing OPENAI_API_KEY env var");
    throw new Error("OPENAI_API_KEY not set");
  }

  cached = new OpenAI({ apiKey });
  return cached;
}

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL_TEXT || "gpt-4o";
}

export function getOpenAiImageModel() {
  return process.env.CREATIVE_IMAGE_MODEL || "dall-e-3";
}

async function fetchImageAsBase64(url) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_IMAGE_FETCH_TIMEOUT_MS || 25000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Image download failed: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } finally {
    clearTimeout(timeoutId);
  }
}

function withTimeout(promise, ms, label = "timeout") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label}: ${ms}ms`)), ms)),
  ]);
}

export async function generateHeroImage({
  prompt,
  size,
  quality = "auto",
  seed,
} = {}) {
  const openai = getOpenAiClient();
  const model = getOpenAiImageModel();
  if (!prompt || !size) {
    throw new Error("Missing prompt or size for image generation");
  }

  // DALL-E 3 supports "standard" or "hd" quality.
  // We map our internal quality settings to DALL-E 3 compatible ones.
  let safeQuality = "standard";
  if (model === "dall-e-3") {
    if (quality === "high" || quality === "hd") {
      safeQuality = "hd";
    } else {
      safeQuality = "standard";
    }
  } else {
    // Legacy models (dall-e-2)
    const allowedQuality = new Set(["low", "medium", "high", "auto"]);
    const normalizedQuality = quality === "standard" ? "medium" : quality;
    safeQuality = allowedQuality.has(normalizedQuality) ? normalizedQuality : "auto";
  }

  const params = {
    model,
    prompt,
    size,
    quality: safeQuality,
  };

  // DALL-E 3 does not strictly support 'seed' for deterministic generation in the same way 
  // as some other endpoints, but the API accepts it. Not strictly enforced.
  if (typeof seed === "number") {
    // params.seed = seed; // Uncomment if you want to pass it anyway
  }

  // DALL-E 3 requests often take longer, bump timeout default
  const timeoutMs = Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 120000);

  let result;
  try {
    result = await withTimeout(
      openai.images.generate(params),
      timeoutMs,
      "openai_image_generate_timeout",
    );
  } catch (err) {
    // FALLBACK LOGIC
    console.warn(`[OpenAI] Image generation with model '${model}' failed: ${err.message}. Retrying with fallback 'dall-e-3'...`);

    // If the primary model was already dall-e-3, re-throw to avoid infinite loop or useless retry
    if (model === "dall-e-3") throw err;

    // Retry with DALL-E 3
    params.model = "dall-e-3";
    // DALL-E 3 requires standard or hd quality
    params.quality = "standard";
    // DALL-E 3 sizes are strictly 1024x1024, 1024x1792, 1792x1024. 
    // If original size was invalid for D3 (e.g. 512x512), force 1024x1024.
    if (params.size !== "1024x1024" && params.size !== "1024x1792" && params.size !== "1792x1024") {
      params.size = "1024x1024";
    }

    result = await withTimeout(
      openai.images.generate(params),
      timeoutMs,
      "openai_image_generate_timeout_fallback",
    );
  }

  const item = result?.data?.[0];
  if (!item) {
    throw new Error("Image generation returned no data");
  }

  if (item.b64_json) {
    return { b64: item.b64_json, model: params.model, seed }; // Return actual model used
  }

  if (item.url) {
    const b64 = await fetchImageAsBase64(item.url);
    return { b64, model: params.model, seed };
  }

  throw new Error("Image generation returned no usable output");
}
