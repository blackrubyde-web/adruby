const OpenAI = require('openai');

let cachedClient = null;

function getOpenAIClient() {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[OpenAI] Missing OPENAI_API_KEY env var');
    throw new Error('OPENAI_API_KEY not set');
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

module.exports = { getOpenAIClient };
