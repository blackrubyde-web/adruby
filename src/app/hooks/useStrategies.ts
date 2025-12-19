import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type StrategyBlueprint = {
  id: string;
  title: string;
  category: string | null;
  raw_content_markdown: string;
  metadata: Record<string, unknown> | null;
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
        .select("id,title,category,raw_content_markdown,metadata,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setError(error.message);
        setStrategies([]);
      } else {
        setStrategies((data || []) as StrategyBlueprint[]);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { strategies, loading, error };
}
