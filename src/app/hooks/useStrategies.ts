import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type StrategyBlueprint = {
  id: string;
  title: string;
  category: string | null;
  raw_content_markdown: string;
  metadata: Record<string, unknown> | null;
  autopilot_config: Record<string, unknown> | null;
  industry_type: string | null;
  target_audience_definition: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

export function useStrategies() {
  const [strategies, setStrategies] = useState<StrategyBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("strategy_blueprints")
        .select(`
          id,
          title,
          category,
          raw_content_markdown,
          metadata,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        console.error("Strategy load error:", error);
        setError(error.message);
        setStrategies([]);
      } else {
        // Map metadata fields to top-level properties to satisfy the type definition
        // and handle the schema mismatch safely.
        const mappedStrategies: StrategyBlueprint[] = (data || []).map((item) => ({
          ...item,
          autopilot_config: item.metadata?.autopilot_config || {
            enabled: true,
            risk_tolerance: 'medium',
            scale_speed: 'standard',
            target_roas: 3.0
          },
          industry_type: item.metadata?.industry_type || 'General',
          target_audience_definition: item.metadata?.target_audience_definition || {},
        })) as StrategyBlueprint[];

        setStrategies(mappedStrategies);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { strategies, loading, error, refreshStrategies: () => window.location.reload() };
}
