import { useEffect, useState } from "react";
import { AnalyticsData } from "../types/analytics";
import { apiClient } from "../utils/apiClient";
import { supabase } from "../lib/supabaseClient";

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
