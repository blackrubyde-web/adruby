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
  return process.env.OPENAI_MODEL_TEXT || "gpt-4.1-mini";
}

export function getOpenAiImageModel() {
  return process.env.CREATIVE_IMAGE_MODEL || "gpt-image-1";
}

async function fetchImageAsBase64(url) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_IMAGE_FETCH_TIMEOUT_MS || 15000);
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

  const allowedQuality = new Set(["low", "medium", "high", "auto"]);
  const normalizedQuality = quality === "standard" ? "medium" : quality;
  const safeQuality = allowedQuality.has(normalizedQuality) ? normalizedQuality : "auto";

  const params = {
    model,
    prompt,
    size,
    quality: safeQuality,
  };
  if (typeof seed === "number") {
    params.seed = seed;
  }

  const timeoutMs = Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 90000);
  const result = await withTimeout(
    openai.images.generate(params),
    timeoutMs,
    "openai_image_generate_timeout",
  );
  const item = result?.data?.[0];
  if (!item) {
    throw new Error("Image generation returned no data");
  }

  if (item.b64_json) {
    return { b64: item.b64_json, model, seed };
  }

  if (item.url) {
    const b64 = await fetchImageAsBase64(item.url);
    return { b64, model, seed };
  }

  throw new Error("Image generation returned no usable output");
}
