import { badRequest, methodNotAllowed, ok, withCors } from "./utils/response.js";
import { requireUserId } from "./_shared/auth.js";
import { supabaseAdmin } from "./_shared/clients.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return withCors({ statusCode: 200 });
  if (event.httpMethod !== "POST") return methodNotAllowed("POST,OPTIONS");

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return badRequest("Invalid JSON body");
  }

  const bucket = typeof body?.bucket === "string" ? body.bucket.trim() : "";
  const path = typeof body?.path === "string" ? body.path.trim() : "";
  if (!bucket || !path) return badRequest("Missing bucket or path");
  if (!path.startsWith(`${auth.userId}/`)) return badRequest("Invalid path");

  if (process.env.CREATIVE_IMAGES_PUBLIC === "1") {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) return ok({ url: data.publicUrl });
  }

  const ttl = Number(process.env.CREATIVE_SIGNED_URL_TTL_SEC || 3600);
  const signed = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, ttl);
  if (signed.error || !signed.data?.signedUrl) {
    return badRequest(signed.error?.message || "Signed URL failed");
  }

  return ok({ url: signed.data.signedUrl });
}
