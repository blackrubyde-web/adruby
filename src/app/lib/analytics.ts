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

  // Use apiClient to ensure authentication headers are sent.
  // We use the non-blocking nature of the async function, but we can't easily use keepalive with apiClient wrapper
  // unless we extend it. For now, relying on apiClient is better than failing auth.
  try {
    await apiClient.post('/api/analytics', payload);
  } catch {
    // Non-blocking analytics: ignore errors
  }


}
