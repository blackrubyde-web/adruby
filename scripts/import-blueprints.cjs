// scripts/import-blueprints.cjs
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load local .env so npm scripts have access to Supabase secrets outside of CI
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Diese ENV VARS kommen aus Netlify (UI -> Site settings -> Environment)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail-soft when env vars are missing (e.g. local/CI without secrets)
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Blueprint Import] Missing SUPABASE env vars - skipping import.');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Ordner mit deinen Monster-Strategien
const BLUEPRINT_DIR = path.join(__dirname, '..', 'strategy_blueprints_raw');

const categoryFromSlug = (slug) => {
  if (slug.startsWith('ecom_')) return 'ecommerce';
  if (slug.startsWith('b2b_')) return 'b2b_services';
  if (slug.startsWith('coaching_')) return 'coaching_education';
  if (slug.startsWith('saas_')) return 'saas_software';
  if (slug.startsWith('handwerk_')) return 'handwerk_local';
  if (slug.startsWith('local_')) return 'local_business';
  return 'other';
};

const titleFromSlug = (slug) =>
  slug
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

(async () => {
  try {
    if (!fs.existsSync(BLUEPRINT_DIR)) {
      console.warn('[Blueprint Import] Directory not found:', BLUEPRINT_DIR);
      process.exit(0);
    }

    const files = fs.readdirSync(BLUEPRINT_DIR).filter((f) => f.endsWith('.txt'));

    if (!files.length) {
      console.warn('[Blueprint Import] No .txt files found in', BLUEPRINT_DIR);
      process.exit(0);
    }

    console.log('[Blueprint Import] Found blueprints:', files);

    for (const file of files) {
      const slug = path.basename(file, '.txt'); // z.B. 'ecom_d2c'
      const filePath = path.join(BLUEPRINT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');

      const blueprint = {
        id: slug,
        category: categoryFromSlug(slug),
        title: titleFromSlug(slug),
        raw_content_markdown: raw,
      };

      console.log('[Blueprint Import] Upserting blueprint:', slug);

      const { error } = await supabase
        .from('strategy_blueprints')
        .upsert(blueprint, { onConflict: 'id' });

      if (error) {
        console.error('[Blueprint Import] Error upserting', slug, error.message);
        process.exitCode = 1;
      }
    }

    console.log('[Blueprint Import] Done importing blueprints.');
  } catch (err) {
    console.error('[Blueprint Import] Import failed:', err);
    process.exit(1);
  }
})();
