import { supabaseAdmin } from "./clients.js";
import { badRequest } from "../utils/response.js";

function isTrialActive(trialEndsAt) {
  if (!trialEndsAt) return false;
  const t = new Date(trialEndsAt).getTime();
  return Number.isFinite(t) && t > Date.now();
}

export async function requireActiveSubscription(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select(
      "payment_verified,onboarding_completed,trial_status,trial_expires_at,trial_ends_at"
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { ok: false, response: badRequest("Subscription check failed", 402) };
  }

  const trialEndsAt = data.trial_expires_at || data.trial_ends_at || null;
  const trialOk = data.trial_status === "active" && isTrialActive(trialEndsAt);
  const paid = Boolean(data.payment_verified);
  const onboardingComplete = Boolean(data.onboarding_completed);

  if (!paid && !trialOk && !onboardingComplete) {
    return { ok: false, response: badRequest("Subscription required", 402) };
  }

  return { ok: true, profile: data };
}
