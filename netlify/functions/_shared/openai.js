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

export async function generateHeroImage({
  prompt,
  size,
  quality = "standard",
  seed,
} = {}) {
  const openai = getOpenAiClient();
  const model = getOpenAiImageModel();
  if (!prompt || !size) {
    throw new Error("Missing prompt or size for image generation");
  }

  const params = {
    model,
    prompt,
    size,
    quality,
    response_format: "b64_json",
  };
  if (typeof seed === "number") {
    params.seed = seed;
  }

  const result = await openai.images.generate(params);
  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("Image generation returned no data");
  }
  return { b64, model, seed };
}
