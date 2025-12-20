import { useEffect, useState } from 'react';
import { OverviewResponse } from '../types/overview';
import { apiClient } from '../utils/apiClient';

export function useOverview(range: 'today' | '7d' | '30d', channel: string) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `overview:${range}:${channel}`;
    const cacheTtlMs = 1000 * 60 * 5;
    let hasCached = false;

    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; data: OverviewResponse };
        if (parsed?.ts && Date.now() - parsed.ts < cacheTtlMs && parsed.data) {
          hasCached = true;
          setData(parsed.data);
          setError(null);
        }
      }
    } catch {
      hasCached = false;
    }

    setLoading(!hasCached);
    setError(null);

    apiClient
      .get<OverviewResponse>(`/api/overview?range=${range}&channel=${channel}`)
      .then((json) => {
        if (!cancelled) {
          setData(json);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: json }));
          } catch {
            // Ignore cache write issues
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load');
          if (!hasCached) setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, channel]);

  return { data, loading, error };
}
