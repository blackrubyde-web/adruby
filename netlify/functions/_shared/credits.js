import { supabaseAdmin } from "./clients.js";

/**
 * Centralized Credit Costs - Single Source of Truth
 */
export const CREDIT_COSTS = {
  ai_ad_generate: 10,
  ai_ad_generate_light: 2,
  creative_analyze: 1,
  creative_generate: 5,
};

// Legacy alias for backwards compatibility
const COST = CREDIT_COSTS;

/**
 * Rate Limits per action (per hour / per day)
 */
export const RATE_LIMITS = {
  ai_ad_generate: { maxPerHour: 20, maxPerDay: 50 },
  ai_ad_generate_light: { maxPerHour: 50, maxPerDay: 200 },
  creative_generate: { maxPerHour: 30, maxPerDay: 100 },
};

/**
 * Check rate limit for user
 * @param {string} userId 
 * @param {string} action 
 * @returns {{ ok: boolean, reason?: string, resetInSeconds?: number }}
 */
export async function checkRateLimit(userId, action) {
  const limits = RATE_LIMITS[action];
  if (!limits) return { ok: true };

  try {
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    const dayAgo = new Date(Date.now() - 86400000).toISOString();

    // Check hourly limit
    const { count: hourCount } = await supabaseAdmin
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', hourAgo);

    if (hourCount >= limits.maxPerHour) {
      return { ok: false, reason: 'hourly_limit', resetInSeconds: 3600 };
    }

    // Check daily limit
    const { count: dayCount } = await supabaseAdmin
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', dayAgo);

    if (dayCount >= limits.maxPerDay) {
      return { ok: false, reason: 'daily_limit', resetInSeconds: 86400 };
    }

    return { ok: true, hourlyUsed: hourCount, dailyUsed: dayCount };
  } catch (err) {
    console.warn('[RateLimit] Check failed, allowing request:', err.message);
    return { ok: true }; // Fail open
  }
}

/**
 * Reserve credits before expensive operation
 * Supports both RPC-based and direct table approach
 */
export async function reserveCredits(userId, action) {
  const cost = CREDIT_COSTS[action];
  if (!cost) throw new Error(`Unknown credit action: ${action}`);

  // First check if user has enough credits
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  if (profile.credits < cost) {
    throw new Error(`Insufficient credits: need ${cost}, have ${profile.credits}`);
  }

  // Deduct credits immediately (reservation = deduction)
  const { error: deductError } = await supabaseAdmin
    .from('user_profiles')
    .update({ credits: profile.credits - cost })
    .eq('id', userId);

  if (deductError) {
    throw new Error(`Credit reservation failed: ${deductError.message}`);
  }

  // Create reservation record for tracking
  const reservationId = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[Credits] Reserved ${cost} credits for ${action}, reservation: ${reservationId}`);

  return {
    id: reservationId,
    userId,
    action,
    cost,
    status: 'reserved',
    createdAt: new Date().toISOString()
  };
}

/**
 * Confirm credit reservation (no-op since we already deducted)
 */
export async function confirmCredits(reservation) {
  console.log(`[Credits] Confirmed reservation ${reservation.id}`);
  return { ok: true, reservation };
}

/**
 * Refund credits on failure
 */
export async function refundCredits(reservation) {
  if (!reservation) return { ok: false, reason: 'no_reservation' };

  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('credits')
      .eq('id', reservation.userId)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ credits: profile.credits + reservation.cost })
        .eq('id', reservation.userId);

      console.log(`[Credits] Refunded ${reservation.cost} credits for ${reservation.id}`);
    }

    return { ok: true, refunded: reservation.cost };
  } catch (err) {
    console.error('[Credits] Refund failed:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Legacy function - kept for backwards compatibility
 */
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
