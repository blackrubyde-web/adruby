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
    console.warn("[Credits] RPC not found, using fallback (less safe)");

    // Get current credits
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

    // Update with optimistic locking (check credits again in WHERE)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({ credits: currentCredits - creditCost })
      .eq("id", userId)
      .eq("credits", currentCredits) // Optimistic lock: only if credits unchanged
      .select("credits")
      .single();

    if (updateError || !updated) {
      console.error("[Credits] Concurrent modification detected, retrying...");
      throw new Error("Credits were modified. Please try again.");
    }

    console.log(`[Credits] Deducted ${creditCost} from user ${userId}. Remaining: ${updated.credits}`);
    return { ok: true, cost: creditCost, before: currentCredits, after: updated.credits };
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
 * This resolves the race condition where users lose credits without getting a result
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
      console.warn("[Credits] Refund RPC not found, using fallback");

      // Get current credits
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("user_profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("[Credits] Failed to fetch profile for refund:", fetchError.message);
        throw new Error("Failed to refund credits");
      }

      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + creditCost;

      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (updateError) {
        console.error("[Credits] Failed to refund credits:", updateError.message);
        throw new Error("Failed to refund credits");
      }

      console.log(`[Credits] ✅ Refunded ${creditCost} to user ${userId}. New balance: ${newCredits}`);
      return { ok: true, refunded: creditCost, newBalance: newCredits };
    }

    if (rpcError) {
      // If RPC exists but failed, try manual fallback
      console.warn("[Credits] RPC refund failed, trying fallback:", rpcError.message);

      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + creditCost;

      await supabaseAdmin
        .from("user_profiles")
        .update({ credits: newCredits })
        .eq("id", userId);

      console.log(`[Credits] ✅ Refunded ${creditCost} to user ${userId}. New balance: ${newCredits}`);
      return { ok: true, refunded: creditCost, newBalance: newCredits };
    }

    console.log(`[Credits] ✅ Refunded ${creditCost} to user ${userId}. New balance: ${result}`);
    return { ok: true, refunded: creditCost, newBalance: result };

  } catch (error) {
    console.error("[Credits] Refund failed:", error.message);
    // Log for manual intervention but don't throw - we don't want to hide the original error
    return { ok: false, error: error.message };
  }
}
