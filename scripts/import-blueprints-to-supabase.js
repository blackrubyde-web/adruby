#!/usr/bin/env node
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-blueprints-to-supabase.js

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importBlueprints() {
  const dir = path.join(__dirname, "..", "Strategy-Blueprints-JSON");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  console.log("[ImportBlueprints] Found files:", files);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("[ImportBlueprints] Failed to parse JSON for", file, err);
      continue;
    }

    const payload = {
      key: parsed.key,
      name: parsed.name,
      industry: parsed.industry || "generic",
      primary_goal: parsed.primary_goal || "sales",
      blueprint_json: parsed.blueprint_json || parsed,
    };

    console.log("[ImportBlueprints] Upserting blueprint", payload.key);

    const { error } = await supabase
      .from("strategy_blueprints")
      .upsert(payload, { onConflict: "key" });

    if (error) {
      console.error("[ImportBlueprints] Upsert error for", payload.key, error);
    } else {
      console.log("[ImportBlueprints] Upsert OK for", payload.key);
    }
  }
}

importBlueprints()
  .then(() => {
    console.log("[ImportBlueprints] Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[ImportBlueprints] Fatal error", err);
    process.exit(1);
  });
