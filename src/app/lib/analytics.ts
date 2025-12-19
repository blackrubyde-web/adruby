import { apiClient } from '../utils/apiClient';

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
};

export async function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  if (!name) return;

  const payload: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString()
  };

  try {
    if (navigator?.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/.netlify/functions/analytics', blob);
      return;
    }
  } catch {
    // fallback to fetch
  }

  try {
    await apiClient.post('/api/analytics', payload);
  } catch {
    // Non-blocking analytics: ignore errors
  }
}
