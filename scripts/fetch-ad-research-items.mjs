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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
}

(async () => {
  try {
    loadEnvFile('./.env.example');
    const mod = await import('../netlify/functions/_shared/apifyClientShim.js');
    const { runAdResearchActor } = mod;
    if (!runAdResearchActor) throw new Error('runAdResearchActor not found');
    console.log('[Fetch] Starting ad research via Apify shim');
    const result = await runAdResearchActor({ searchUrl: 'https://www.facebook.com/ads/library/?id=123', maxAds: 10 });
    const items = Array.isArray(result?.items) ? result.items : [];
    const out = path.resolve('scripts', 'ad-research-items.json');
    fs.writeFileSync(out, JSON.stringify({ meta: { run: result?.runId || null, datasetId: result?.defaultDatasetId || null }, count: items.length, items }, null, 2));
    console.log('[Fetch] Wrote', out, 'items:', items.length);
  } catch (err) {
    console.error('[Fetch] Error', err);
    process.exitCode = 1;
  }
})();
