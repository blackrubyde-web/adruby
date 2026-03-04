import { supabaseAdmin } from "./clients.js";

/**
 * Centralized Credit Costs
 */
export const CREDIT_COSTS = {
  ai_ad_generate: 10,
  creative_analyze: 1,
  creative_generate: 5,
  // Video ad tiers (quality × duration) — expensive due to Veo 3.1 GPU costs
  video_ad_fast_short: 15,     // Fast, ≤6s
  video_ad_fast_long: 20,      // Fast, 8s
  video_ad_premium_short: 25,  // Premium, ≤6s
  video_ad_premium_long: 30,   // Premium, 8s
  video_ad_refine: 15,         // Re-generation
};

/**
 * Deduct credits from user_profiles table
 * Uses ATOMIC SQL pattern to prevent race conditions from parallel requests
 */
export async function assertAndConsumeCredits(userId, action) {
  const cost = CREDIT_COSTS[action];
  if (!cost) {
    console.warn(`[Credits] Unknown action: ${action}, defaulting to 10`);
  }
  const creditCost = cost || 10;

  // Use atomic RPC for credit deduction (prevents race conditions)
  const { data: result, error: rpcError } = await supabaseAdmin.rpc(
    "consume_credits_atomic",
    { p_user_id: userId, p_amount: creditCost }
  );

  // Fallback to manual approach if RPC doesn't exist
  if (rpcError?.code === "42883") { // Function not found
    console.warn("[Credits] RPC not found, using optimistic lock fallback");

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("[Credits] Failed to fetch profile:", fetchError.message);
      throw new Error("Failed to check credits");
    }

    const currentCredits = profile?.credits || 0;
    if (currentCredits < creditCost) {
      throw new Error(`Insufficient credits. You have ${currentCredits}, need ${creditCost}.`);
    }

    // Atomic update with optimistic locking (only succeeds if credits unchanged)
    const { data: locked, error: lockError } = await supabaseAdmin
      .from("user_profiles")
      .update({ credits: currentCredits - creditCost })
      .eq("id", userId)
      .eq("credits", currentCredits) // Optimistic lock
      .select("credits")
      .single();

    if (lockError || !locked) {
      console.error("[Credits] Concurrent modification detected");
      throw new Error("Credits were modified concurrently. Please try again.");
    }

    console.log(`[Credits] Deducted ${creditCost} from user ${userId}. Remaining: ${locked.credits}`);
    return { ok: true, cost: creditCost, before: currentCredits, after: locked.credits };
  }

  if (rpcError) {
    console.error("[Credits] RPC failed:", rpcError.message);
    throw new Error("Failed to deduct credits");
  }

  if (result === null || result < 0) {
    throw new Error(`Insufficient credits. Need ${creditCost}.`);
  }

  console.log(`[Credits] Deducted ${creditCost} from user ${userId}. Remaining: ${result}`);
  return { ok: true, cost: creditCost, before: result + creditCost, after: result };
}

/**
 * Refund credits to user when generation fails
 * Uses atomic RPC. Falls back to optimistic locking with manual review logging.
 */
export async function refundCredits(userId, action) {
  const cost = CREDIT_COSTS[action];
  if (!cost) {
    console.warn(`[Credits] Unknown action for refund: ${action}, defaulting to 10`);
  }
  const creditCost = cost || 10;

  try {
    // Try RPC first for atomic operation
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
      "add_credits_atomic",
      { p_user_id: userId, p_amount: creditCost }
    );

    // Fallback if RPC doesn't exist
    if (rpcError?.code === "42883") {
      console.warn("[Credits] Refund RPC not found, using optimistic lock fallback");

      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("user_profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("[Credits] Failed to fetch profile for refund:", fetchError.message);
        console.error(`[Credits] MANUAL_REFUND_NEEDED: user=${userId} amount=${creditCost} action=${action}`);
        return { ok: false, error: "Failed to refund credits" };
      }

      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + creditCost;

      // Use optimistic locking for refund too
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({ credits: newCredits })
        .eq("id", userId)
        .eq("credits", currentCredits)
        .select("credits")
        .single();

      if (updateError || !updated) {
        console.error("[Credits] Refund concurrent modification, logging for manual review");
        console.error(`[Credits] MANUAL_REFUND_NEEDED: user=${userId} amount=${creditCost} action=${action}`);
        return { ok: false, error: "Concurrent modification during refund" };
      }

      console.log(`[Credits] ✅ Refunded ${creditCost} to user ${userId}. New balance: ${updated.credits}`);
      return { ok: true, refunded: creditCost, newBalance: updated.credits };
    }

    if (rpcError) {
      // RPC exists but failed — log for manual intervention
      console.error("[Credits] RPC refund failed:", rpcError.message);
      console.error(`[Credits] MANUAL_REFUND_NEEDED: user=${userId} amount=${creditCost} action=${action}`);
      return { ok: false, error: rpcError.message };
    }

    console.log(`[Credits] ✅ Refunded ${creditCost} to user ${userId}. New balance: ${result}`);
    return { ok: true, refunded: creditCost, newBalance: result };

  } catch (error) {
    console.error("[Credits] Refund failed:", error.message);
    console.error(`[Credits] MANUAL_REFUND_NEEDED: user=${userId} amount=${creditCost} action=${action}`);
    return { ok: false, error: error.message };
  }
}
