// netlify/functions/_shared/openaiClient.js

let cachedClient = null;

function getOpenAIClient() {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const OpenAI = require("openai");
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

module.exports = { getOpenAIClient };
