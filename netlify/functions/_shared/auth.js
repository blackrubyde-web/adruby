import { supabaseAdmin } from "./clients.js";
import { unauthorized } from "../utils/response.js";

export async function resolveUserFromAuthHeader(event) {
  const authHeader =
    event?.headers?.authorization || event?.headers?.Authorization || null;
  if (!authHeader?.startsWith("Bearer ")) {
    return { userId: null, userEmail: null, source: "none" };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return { userId: null, userEmail: null, source: "empty" };

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.warn("[Auth] Invalid bearer token", { message: error.message });
      return { userId: null, userEmail: null, source: "invalid" };
    }
    return {
      userId: data?.user?.id || null,
      userEmail: data?.user?.email || null,
      source: "supabase",
    };
  } catch (err) {
    console.error("[Auth] auth.getUser crashed", err);
    return { userId: null, userEmail: null, source: "crash" };
  }
}

export async function requireUserId(event) {
  const resolved = await resolveUserFromAuthHeader(event);
  if (!resolved.userId) return { ok: false, response: unauthorized() };
  return { ok: true, userId: resolved.userId, userEmail: resolved.userEmail };
}

/**
 * Get user profile with credits - for AI Ad Builder
 */
export async function getUserProfile(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      console.warn("[Auth] getUserProfile: Invalid token");
      return null;
    }

    const userId = authData.user.id;

    // Get profile with credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, credits, subscription_status")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.warn("[Auth] getUserProfile: Profile not found", profileError.message);
      return { id: userId, email: authData.user.email, credits: 0 };
    }

    return {
      id: userId,
      email: profile.email || authData.user.email,
      credits: profile.credits || 0,
      subscriptionStatus: profile.subscription_status,
    };
  } catch (err) {
    console.error("[Auth] getUserProfile error:", err);
    return null;
  }
}
