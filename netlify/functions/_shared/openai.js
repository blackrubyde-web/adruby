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
  // gpt-image-1 has superior text rendering capabilities
  return process.env.CREATIVE_IMAGE_MODEL || "gpt-image-1";
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

  // Build params based on model
  const params = {
    model,
    prompt,
    n: 1,
  };

  // gpt-image-1 supports different sizes: 1024x1024, 1536x1024, 1024x1536, auto
  // dall-e-3 supports: 1024x1024, 1024x1792, 1792x1024
  if (model === "gpt-image-1" || model === "gpt-image-1.5") {
    // gpt-image-1 quality options: low, medium, high, auto
    const qualityMap = { hd: "high", standard: "medium" };
    params.quality = qualityMap[quality] || quality || "high";

    // Map size for gpt-image-1
    const sizeMap = {
      "1024x1024": "1024x1024",
      "1024x1792": "1024x1536",  // Portrait
      "1792x1024": "1536x1024",  // Landscape
    };
    params.size = sizeMap[size] || "1024x1024";

    // Request base64 output directly
    params.output_format = "png";
  } else if (model === "dall-e-3") {
    params.quality = quality === "hd" || quality === "high" ? "hd" : "standard";
    params.size = size;
    params.style = "vivid";
  } else {
    // Legacy models
    params.quality = "auto";
    params.size = "1024x1024";
  }

  // Timeout configuration
  const timeoutMs = Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 120000);

  let result;
  try {
    console.log(`[OpenAI] Generating image with model: ${model}, size: ${params.size}, quality: ${params.quality}`);
    result = await withTimeout(
      openai.images.generate(params),
      timeoutMs,
      "openai_image_generate_timeout",
    );
  } catch (err) {
    console.warn(`[OpenAI] Image generation with model '${model}' failed: ${err.message}. Retrying with fallback 'dall-e-3'...`);

    if (model === "dall-e-3") throw err;

    // Retry with DALL-E 3 as fallback
    params.model = "dall-e-3";
    params.quality = "standard";
    params.size = "1024x1024";
    params.style = "vivid";
    delete params.output_format;

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
