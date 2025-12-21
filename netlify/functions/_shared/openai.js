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
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
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
  const safeQuality = allowedQuality.has(quality) ? quality : "auto";

  const params = {
    model,
    prompt,
    size,
    quality: safeQuality,
  };
  if (typeof seed === "number") {
    params.seed = seed;
  }

  const result = await openai.images.generate(params);
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
