#!/usr/bin/env node
/**
 * Parse all TXT blueprints from strategy_blueprints_raw/ via OpenAI
 * and write structured JSON files into strategy_blueprints_json/.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/parse-blueprints.js
 *
 * Notes:
 * - Requires the OpenAI API key in OPENAI_API_KEY.
 * - Only writes JSON files by default. Extend the script if you also
 *   want to insert into Supabase (table: strategy_blueprints).
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const OpenAI = require("openai");

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const RAW_DIR = path.resolve(__dirname, "..", "strategy_blueprints_raw");
const OUT_DIR = path.resolve(__dirname, "..", "strategy_blueprints_json");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("[ParseBlueprints] Missing OPENAI_API_KEY - skipping parse.");
  process.exit(0);
}

const openai = new OpenAI({ apiKey });

function fileNameToKey(fileName) {
  return fileName
    .replace(/\.txt$/i, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

async function ensureOutDir() {
  try {
    await mkdir(OUT_DIR, { recursive: true });
  } catch (err) {
    console.error("[ParseBlueprints] Failed to create output directory", err);
    process.exit(1);
  }
}

async function parseBlueprintText({ key, content }) {
  const systemPrompt =
    "Du bist ein Senior Meta-Ads-Stratege. Du bekommst Rohtext eines Strategie-Blueprints " +
    "und wandelst ihn in ein strukturiertes JSON um.";

  const userPrompt = `
Rohtext (Blueprint):
${content}

Strukturiere in folgendem JSON-Format (antworte NUR mit JSON, keine Erklärungen):
{
  "key": "${key}",
  "name": "string",
  "industry": "ecommerce|saas|b2b_services|generic|...",
  "primary_goal": "sales|leads|brand|...",
  "chapters": [
    { "id": "string", "title": "string", "content": "string", "priority": 1 }
  ],
  "meta_ads_defaults": {
    "campaign_config": {},
    "adsets_config": [],
    "ads_config": [],
    "recommendations": {}
  }
}
`;

  const completion = await openai.responses.create({
    model: process.env.ADSTRATEGY_MODEL || "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_output_tokens: 2000,
  });

  const output = completion.output?.[0];
  const contentPart = output?.content?.[0];
  const raw = contentPart?.text || "{}";

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("[ParseBlueprints] Failed to parse JSON for key", key, raw.slice(0, 400));
    throw err;
  }
}

async function processFile(fileName) {
  const fullPath = path.join(RAW_DIR, fileName);
  const key = fileNameToKey(fileName);
  const content = await readFile(fullPath, "utf8");

  console.log(`[ParseBlueprints] Processing ${fileName} -> key ${key}`);
  const parsed = await parseBlueprintText({ key, content });

  const outPath = path.join(OUT_DIR, `${key}.json`);
  await writeFile(outPath, JSON.stringify(parsed, null, 2), "utf8");
  console.log(`[ParseBlueprints] Wrote ${outPath}`);
}

async function main() {
  await ensureOutDir();

  let files = [];
  try {
    files = await readDir(RAW_DIR);
  } catch (err) {
    console.error("[ParseBlueprints] Cannot read raw dir", RAW_DIR, err);
    process.exit(1);
  }

  const txtFiles = files.filter((f) => f.toLowerCase().endsWith(".txt"));
  if (txtFiles.length === 0) {
    console.warn("[ParseBlueprints] No .txt files found in", RAW_DIR);
    return;
  }

  for (const file of txtFiles) {
    try {
      await processFile(file);
    } catch (err) {
      console.error("[ParseBlueprints] Failed for file", file, err);
    }
  }
}

main();
