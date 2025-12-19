// Lightweight shim that delegates to the real apifyClient implementation at runtime.
// Tests can mock this module to avoid requiring the `apify-client` package.
export async function runAdResearchActor(params) {
  const mod = await import('./apifyClient.js');
  return mod.runAdResearchActor(params);
}

export default { runAdResearchActor };
