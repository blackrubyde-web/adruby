import { useEffect, useState } from 'react';
import { OverviewResponse } from '../types/overview';
import { apiClient } from '../utils/apiClient';
import { supabase } from '../lib/supabaseClient';
import { env } from '../lib/env';

export function useOverview(range: 'today' | '7d' | '30d', channel: string) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (env.demoMode) {
        const mockData: OverviewResponse = {
          kpis: {
            spend: 12450.50,
            revenue: 45800.75,
            roas: 3.68,
            activeCampaigns: 12,
            spendChangePct: -12,
            revenueChangePct: 25,
            roasChangePct: 8
          },
          timeseries: Array.from({ length: 30 }, (_, i) => ({
            ts: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            spend: 400 + Math.random() * 100,
            revenue: 1400 + Math.random() * 400,
            roas: 3 + Math.random() * 1.5
          })),
          topCampaign: { id: 'c1', name: 'Winter Collection 2024', spend: 5000, revenue: 22000, roas: 4.4 },
          bestCreative: { id: 'cr1', name: 'AI Variation #4', aiScore: 92, ctr: 4.5, conversions: 120 },
          onboarding: {
            completedSteps: 2,
            totalSteps: 4,
            steps: [
              { id: 'connect-meta', title: 'Connect Meta', description: '...', completed: true, actionLabel: 'View' },
              { id: 'create-campaign', title: 'Create Campaign', description: '...', completed: true, actionLabel: 'View' },
              { id: 'generate-creatives', title: 'Generate Creatives', description: '...', completed: false, actionLabel: 'Generate' },
              { id: 'enable-optimization', title: 'Enable Optimization', description: '...', completed: false, actionLabel: 'Enable' }
            ]
          }
        };
        if (!cancelled) {
          setData(mockData);
          setLoading(false);
          setError(null);
        }
        return;
      }

      let userId = 'anon';
      try {
        const { data: session } = await supabase.auth.getSession();
        userId = session.session?.user?.id || 'anon';
      } catch {
        userId = 'anon';
      }

      const cacheKey = `overview:${userId}:${range}:${channel}`;
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

      if (!cancelled) {
        setLoading(!hasCached);
        setError(null);
      }

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
    };

    run();

    // Auto-refresh every 5 minutes (respects cache)
    const refreshInterval = setInterval(() => {
      run();
    }, 1000 * 60 * 5); // 5 minutes

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [range, channel]);

  return { data, loading, error };
}
