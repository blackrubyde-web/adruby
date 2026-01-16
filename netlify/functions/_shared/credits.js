import { supabaseAdmin } from "./clients.js";

/**
 * Centralized Credit Costs
 */
export const CREDIT_COSTS = {
  ai_ad_generate: 10,
  creative_analyze: 1,
  creative_generate: 5,
};

/**
 * Deduct credits using the existing AdRuby RPC system
 * Works with both consume_credits and deduct_credits RPCs
 */
export async function assertAndConsumeCredits(userId, action) {
  const cost = CREDIT_COSTS[action];
  if (!cost) throw new Error(`Unknown credit action: ${action}`);

  // Try consume_credits RPC first, fallback to deduct_credits
  const tryRpc = async (fn) => {
    const payload =
      fn === "deduct_credits"
        ? {
          p_user_id: userId,
          p_action_type: action,
          p_credits_to_deduct: cost,
          p_description: action,
        }
        : {
          p_user_id: userId,
          p_amount: cost,
          p_reason: action,
        };

    const { data, error } = await supabaseAdmin.rpc(fn, payload);
    return { data, error };
  };

  try {
    let result = await tryRpc("consume_credits");
    if (result.error) {
      result = await tryRpc("deduct_credits");
    }

    if (result.error) {
      throw new Error(`Credits RPC failed: ${result.error.message}`);
    }

    if (result.data?.success === false) {
      throw new Error(result.data?.error || "Insufficient credits");
    }

    console.log(`[Credits] Deducted ${cost} for ${action} from user ${userId}`);
    return { ok: true, cost, data: result.data };
  } catch (err) {
    console.error("[Credits] assertAndConsumeCredits failed:", err?.message);
    throw err;
  }
}
