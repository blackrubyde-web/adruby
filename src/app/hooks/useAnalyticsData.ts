import { useEffect, useState } from "react";
import { AnalyticsData } from "../types/analytics";
import { apiClient } from "../utils/apiClient";

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
    setLoading(true);
    setError(null);

    apiClient
      .get<AnalyticsData>(
        `/api/analytics?range=${range}&compare=${compare ? 1 : 0}&channel=${channel}`
      )
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? "Failed");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, compare, channel, refreshKey]);

  return { data, loading, error };
}
