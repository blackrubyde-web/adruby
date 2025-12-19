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

