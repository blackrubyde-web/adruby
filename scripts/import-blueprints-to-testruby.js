#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const blueprintsDir =
  process.env.BLUEPRINTS_DIR ||
  path.resolve(process.cwd(), "../AdRuby/strategy_blueprints_raw");

if (!fs.existsSync(blueprintsDir)) {
  throw new Error(`Blueprints dir not found: ${blueprintsDir}`);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const files = fs
  .readdirSync(blueprintsDir)
  .filter((file) => file.endsWith(".txt"));

if (files.length === 0) {
  console.log("No blueprint files found.");
  process.exit(0);
}

const toTitle = (slug) =>
  slug
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

for (const file of files) {
  const slug = path.basename(file, ".txt");
  const raw = fs.readFileSync(path.join(blueprintsDir, file), "utf8");
  const category = slug.split("_")[0] || "general";

  const { error } = await supabaseAdmin.from("strategy_blueprints").upsert(
    {
      id: slug,
      title: toTitle(slug),
      category,
      raw_content_markdown: raw,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error(`Failed to import ${slug}: ${error.message}`);
  } else {
    console.log(`Imported ${slug}`);
  }
}
