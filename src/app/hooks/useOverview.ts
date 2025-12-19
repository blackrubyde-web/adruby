import { useEffect, useState } from 'react';
import { OverviewResponse } from '../types/overview';
import { apiClient } from '../utils/apiClient';

export function useOverview(range: 'today' | '7d' | '30d', channel: string) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient
      .get<OverviewResponse>(`/api/overview?range=${range}&channel=${channel}`)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load');
          setData(null);
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
