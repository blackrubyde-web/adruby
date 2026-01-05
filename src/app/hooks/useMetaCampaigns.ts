import { useCallback, useEffect, useState } from 'react';
import { fetchMetaCampaigns } from '../lib/api/meta';

export type MetaCampaign = {
  id: string;
  name: string;
  status: string;
  strategyId?: string | null;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  conversions: number;
  impressions: number;
  clicks: number;
};

export function useMetaCampaigns() {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMetaCampaigns();
      setCampaigns(data.campaigns || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return { campaigns, loading, error, refresh };
}
