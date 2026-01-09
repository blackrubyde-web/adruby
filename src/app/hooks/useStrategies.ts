import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { env } from "../lib/env";

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

      if (env.demoMode) {
        const mockStrategies: StrategyBlueprint[] = [
          {
            id: 'demo-strat-1',
            title: 'Q1 Growth Engine',
            category: 'custom',
            raw_content_markdown: '# Growth Plan\nAccelerate your traffic.',
            metadata: {
              autopilot_config: {
                enabled: true,
                target_roas: 4.5,
                risk_tolerance: 'low',
                scale_speed: 'slow',
                max_daily_budget: 200
              },
              industry_type: 'ecommerce'
            },
            autopilot_config: { enabled: true, target_roas: 4.5, risk_tolerance: 'low', scale_speed: 'slow', max_daily_budget: 200 },
            industry_type: 'ecommerce',
            target_audience_definition: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-strat-2',
            title: 'Aggressive SaaS Scaling',
            category: 'custom',
            raw_content_markdown: '# Scale Plan\nHigh risk, high reward.',
            metadata: {
              autopilot_config: {
                enabled: true,
                target_roas: 2.1,
                risk_tolerance: 'high',
                scale_speed: 'aggressive',
                max_daily_budget: 1000
              },
              industry_type: 'saas'
            },
            autopilot_config: { enabled: true, target_roas: 2.1, risk_tolerance: 'high', scale_speed: 'aggressive', max_daily_budget: 1000 },
            industry_type: 'saas',
            target_audience_definition: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        if (active) {
          setStrategies(mockStrategies);
          setLoading(false);
        }
        return;
      }

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

  const saveStrategy = async (strategy: Partial<StrategyBlueprint>) => {
    if (env.demoMode) {
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Strategie erfolgreich gespeichert (Demo)");
      return { id: strategy.id || 'demo-new-id' };
    }
    // Real implementation would go here, currently useStrategies is read-only in this hook version
    toast.error("Speichern in Demo-Modus simuliert. Echt-Modus nicht verfügbar.");
    return null;
  };

  return { strategies, loading, error, refreshStrategies: () => window.location.reload(), saveStrategy };
}
