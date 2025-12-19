import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`${filePath} not found`);
  const content = fs.readFileSync(abs, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1);
    // remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
}

(async () => {
  try {
    loadEnvFile('./.env.example');
    console.log('[Runner-env] Loaded env from .env.example (showing key presence):');
    ['APIFY_API_TOKEN','APIFY_AD_RESEARCH_ACTOR_ID','APIFY_FACEBOOK_ADS_ACTOR_ID','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'].forEach(k => console.log(` - ${k}: ${!!process.env[k]}`));

    const mod = await import('../netlify/functions/ad-research-start.js');
    const handler = mod.handler || mod.default?.handler;
    if (!handler) throw new Error('Handler not found in ad-research-start.js');

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ searchUrl: 'https://www.facebook.com/ads/library/?id=123', maxAds: 10 }),
      headers: {},
    };

    console.log('[Runner-env] Invoking ad-research-start handler (live)');
    const result = await handler(event);
    console.log('[Runner-env] Handler returned:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[Runner-env] Error invoking handler:', err);
    process.exitCode = 1;
  }
})();
