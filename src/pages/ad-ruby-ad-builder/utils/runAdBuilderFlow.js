export function runAdBuilderFlow({ inputs, onPhase, onScrapeItems, onResults, onError }) {
  const controller = new AbortController();
  const { searchUrl, product, goal, market, language } = inputs;

  (async () => {
    try {
      onPhase?.('scraping');
      const scrapeRes = await fetch('/api/ad-research-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchUrl,
          maxAds: 30,
        }),
        signal: controller.signal,
      });
      const scrapeData = await scrapeRes.json().catch(() => ({}));
      const items = Array.isArray(scrapeData.items) ? scrapeData.items : [];
      if (!scrapeRes.ok || !items.length) {
        throw new Error(scrapeData?.message || `Scraping failed${scrapeRes.status ? ` (${scrapeRes.status})` : ''}`);
      }
      onScrapeItems?.(items);

      onPhase?.('analyzing');
      const aiRes = await fetch('/api/ai-ad-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userBriefing: { product, goal, market, language },
          scrapedAds: items,
        }),
        signal: controller.signal,
      });
      const aiData = await aiRes.json().catch(() => ({}));
      const ads = Array.isArray(aiData.ads) ? aiData.ads : Array.isArray(aiData.results) ? aiData.results : [];
      if (!aiRes.ok || !ads.length) {
        throw new Error(aiData?.message || `AI returned no ads${aiRes.status ? ` (${aiRes.status})` : ''}`);
      }
      onResults?.(ads);
    } catch (e) {
      if (e.name === 'AbortError') return;
      onError?.(e.message || 'Unknown error');
    }
  })();

  return {
    abort: () => controller.abort(),
  };
}
