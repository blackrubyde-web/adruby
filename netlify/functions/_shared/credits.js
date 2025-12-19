import { supabaseAdmin } from "./clients.js";

const COST = {
  creative_analyze: 1,
  creative_generate: 2,
};

export async function assertAndConsumeCredits(userId, action) {
  const cost = COST[action];
  if (!cost) throw new Error(`Unknown credit action: ${action}`);

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
      throw new Error(
        `Credits enforcement unavailable (${result.error.message || "RPC missing"})`
      );
    }

    if (result.data?.success === false) {
      throw new Error(result.data?.error || "Insufficient credits");
    }

    return { ok: true, cost, mode: "rpc", data: result.data };
  } catch (err) {
    console.error("[credits] consume_credits failed:", err?.message || err);
    throw err;
  }
}
