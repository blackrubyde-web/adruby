import fs from 'fs';
import path from 'path';

(async () => {
  try {
    const mod = await import('../netlify/functions/ad-research-start.js');
    const handler = mod.handler || mod.default?.handler;
    if (!handler) throw new Error('Handler not found in ad-research-start.js');

    // sample event body: replace or extend as needed
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ searchUrl: 'https://www.facebook.com/ads/library/?id=123', maxAds: 10 }),
      headers: {},
    };

    console.log('[Runner] Invoking ad-research-start handler (live)');
    const result = await handler(event);
    console.log('[Runner] Handler returned:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[Runner] Error invoking handler:', err);
    process.exitCode = 1;
  }
})();
