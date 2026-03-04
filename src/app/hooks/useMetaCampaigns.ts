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
          { id: 'mc-1', name: 'Performance Max - Winter', status: 'active', spend: 2500, revenue: 4500, roas: 1.8, ctr: 1.4, conversions: 32, impressions: 45000, clicks: 630 },
          { id: 'mc-2', name: 'Prospecting - Lookalikes', status: 'active', spend: 1500, revenue: 1800, roas: 1.2, ctr: 0.9, conversions: 12, impressions: 35000, clicks: 315 },
          { id: 'mc-3', name: 'Retargeting - Cart Abandoners', status: 'paused', spend: 800, revenue: 2000, roas: 2.5, ctr: 2.8, conversions: 18, impressions: 8000, clicks: 224 }
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
