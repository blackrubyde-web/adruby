export const initialAdBuilderState = {
  phase: 'briefing', // briefing | scraping | analyzing | results | error
  scrapedAds: [],
  generatedAds: [],
  error: null,
};

export function adBuilderReducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'scraping', error: null, scrapedAds: [], generatedAds: [] };
    case 'SCRAPE_SUCCESS':
      return { ...state, phase: 'analyzing', scrapedAds: action.payload || [], error: null };
    case 'SCRAPE_ERROR':
      return { ...state, phase: 'error', error: action.payload };
    case 'AI_SUCCESS':
      return { ...state, phase: 'results', generatedAds: action.payload || [], error: null };
    case 'AI_ERROR':
      return { ...state, phase: 'error', error: action.payload };
    case 'RESET':
      return initialAdBuilderState;
    default:
      return state;
  }
}
