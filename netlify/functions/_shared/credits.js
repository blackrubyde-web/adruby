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
 * This is the simple, direct approach that works with AdRuby's existing system
 */
export async function assertAndConsumeCredits(userId, action) {
  const cost = CREDIT_COSTS[action];
  if (!cost) {
    console.warn(`[Credits] Unknown action: ${action}, defaulting to 10`);
  }
  const creditCost = cost || 10;

  // 1. Get current credits
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("user_profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("[Credits] Failed to fetch user profile:", fetchError.message);
    throw new Error("Failed to check credits");
  }

  const currentCredits = profile?.credits || 0;

  // 2. Check if enough credits
  if (currentCredits < creditCost) {
    console.warn(`[Credits] Insufficient: user ${userId} has ${currentCredits}, needs ${creditCost}`);
    throw new Error(`Insufficient credits. You have ${currentCredits}, need ${creditCost}.`);
  }

  // 3. Deduct credits
  const newCredits = currentCredits - creditCost;
  const { error: updateError } = await supabaseAdmin
    .from("user_profiles")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (updateError) {
    console.error("[Credits] Failed to deduct credits:", updateError.message);
    throw new Error("Failed to deduct credits");
  }

  console.log(`[Credits] Deducted ${creditCost} from user ${userId}. Remaining: ${newCredits}`);

  return {
    ok: true,
    cost: creditCost,
    before: currentCredits,
    after: newCredits
  };
}
