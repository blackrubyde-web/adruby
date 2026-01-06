import { useEffect, useState } from "react";
import { AnalyticsData } from "../types/analytics";
import { apiClient } from "../utils/apiClient";
import { supabase } from "../lib/supabaseClient";
import { env } from "../lib/env";

export function useAnalyticsData(
  range: "7d" | "30d" | "90d" | "custom",
  compare: boolean,
  channel: string,
  refreshKey = 0
) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (env.demoMode) {
        const mockData: AnalyticsData = {
          range: "30d",
          compare: false,
          granularity: "day",
          summary: {
            spend: 8500,
            revenue: 32000,
            roas: 3.76,
            impressions: 450000,
            clicks: 9800,
            conversions: 120,
            ctr: 2.17,
            deltas: {
              spend: 0.05,
              revenue: 0.15,
              roas: 0.10
            }
          },
          timeseries: {
            current: Array.from({ length: 30 }, (_, i) => ({
              ts: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
              spend: 250 + Math.random() * 50,
              revenue: 900 + Math.random() * 300,
              roas: 3.5 + Math.random(),
              impressions: 15000 + Math.random() * 2000,
              clicks: 300 + Math.random() * 50,
              conversions: 4 + Math.random() * 2,
              ctr: 1.9 + Math.random() * 0.5
            }))
          },
          campaigns: [],
          breakdowns: {
            audience: {
              byAge: [],
              byGender: { male: 50, female: 50, other: 0 }
            },
            funnel: [],
            heatmap: []
          },
          performance: { score: 85, quality: 80, relevance: 90, engagement: 82 },
          budget: { total: 10000, spent: 8500, remaining: 1500, dailyAverage: 280, projectedEnd: new Date().toISOString() }
        };
        if (!cancelled) {
          setData(mockData);
          setLoading(false);
          setError(null);
        }
        return;
      }

      let userId = "anon";
      try {
        const { data: session } = await supabase.auth.getSession();
        userId = session.session?.user?.id || "anon";
      } catch {
        userId = "anon";
      }

      const cacheKey = `analytics:${userId}:${range}:${compare ? 1 : 0}:${channel}`;
      const cacheTtlMs = 1000 * 60 * 5;
      let hasCached = false;

      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { ts: number; data: AnalyticsData };
          if (parsed?.ts && Date.now() - parsed.ts < cacheTtlMs && parsed.data) {
            hasCached = true;
            setData(parsed.data);
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
        .get<AnalyticsData>(
          `/api/analytics?range=${range}&compare=${compare ? 1 : 0}&channel=${channel}`
        )
        .then((json) => {
          if (!cancelled) {
            setData(json);
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: json }));
            } catch {
              // ignore cache write issues
            }
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e?.message ?? "Failed");
            if (!hasCached) setData(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [range, compare, channel, refreshKey]);

  return { data, loading, error };
}
