const { supabase: sharedSupabase, getSupabaseClient } = require("./supabaseClient");

const supabase = sharedSupabase || (typeof getSupabaseClient === "function" ? getSupabaseClient() : null);

function guardClient(fnName) {
  if (!supabase) {
    const error = new Error("Supabase client not initialized");
    console.error(`[Blueprints][${fnName}]`, error?.message);
    return { data: null, error };
  }
  return null;
}

async function getStrategyBlueprintById(blueprintId) {
  const guard = guardClient("getStrategyBlueprintById");
  if (guard) return guard;

  const { data, error } = await supabase
    .from("strategy_blueprints")
    .select("*")
    .eq("id", blueprintId)
    .single();

  if (error) {
    console.error("[Blueprints][getStrategyBlueprintById]", { blueprintId, error });
    return { data: null, error };
  }
  return { data, error: null };
}

async function getStrategyBlueprintByCategory(category) {
  const guard = guardClient("getStrategyBlueprintByCategory");
  if (guard) return guard;

  const { data, error } = await supabase
    .from("strategy_blueprints")
    .select("*")
    .eq("category", category)
    .limit(1)
    .single();

  if (error) {
    console.error("[Blueprints][getStrategyBlueprintByCategory]", { category, error });
    return { data: null, error };
  }

  if (!data) {
    console.warn("[Blueprints][getStrategyBlueprintByCategory] No blueprint found for category", category);
  }

  return { data, error: null };
}

async function getBlueprintSections(blueprintId) {
  const guard = guardClient("getBlueprintSections");
  if (guard) return guard;

  const { data, error } = await supabase
    .from("strategy_blueprint_sections")
    .select("*")
    .eq("blueprint_id", blueprintId)
    .order("order_index", { ascending: true })
    .order("chapter", { ascending: true });

  if (error) {
    console.error("[Blueprints][getBlueprintSections]", { blueprintId, error });
    return { data: null, error };
  }

  return { data, error: null };
}

module.exports = {
  getStrategyBlueprintById,
  getStrategyBlueprintByCategory,
  getBlueprintSections,
};
