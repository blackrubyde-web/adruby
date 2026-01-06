import { useCallback, useEffect, useState } from 'react';
import { fetchMetaCampaigns } from '../lib/api/meta';
import { env } from '../lib/env';

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
      if (env.demoMode) {
        const mockCampaigns: MetaCampaign[] = [
          { id: 'mc-1', name: 'Performance Max - Winter', status: 'active', spend: 2500, revenue: 12000, roas: 4.8, ctr: 2.1, conversions: 85, impressions: 45000, clicks: 950 },
          { id: 'mc-2', name: 'Prospecting - Lookalikes', status: 'active', spend: 1500, revenue: 4500, roas: 3.0, ctr: 1.8, conversions: 35, impressions: 35000, clicks: 650 },
          { id: 'mc-3', name: 'Retargeting - Cart Abandoners', status: 'paused', spend: 500, revenue: 3500, roas: 7.0, ctr: 4.5, conversions: 25, impressions: 5000, clicks: 225 }
        ];
        setCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }
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
