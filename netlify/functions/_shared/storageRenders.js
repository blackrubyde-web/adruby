import crypto from "crypto";
import { supabaseAdmin } from "./clients.js";

function buildPath({ userId, prefix, ext }) {
  const id = crypto.randomUUID();
  const safePrefix = String(prefix || "render").replace(/[^a-z0-9_-]/gi, "");
  return `${userId}/${safePrefix}-${Date.now()}-${id}.${ext}`;
}

async function uploadBuffer({ bucket, path, buffer, contentType }) {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    const msg = error.message || "Upload failed";
    if (msg.toLowerCase().includes("bucket")) {
      const err = new Error(`Storage not configured. Create bucket ${bucket}.`);
      err.cause = error;
      throw err;
    }
    throw new Error(`Upload failed: ${msg}`);
  }
}

async function resolveUrl({ bucket, path }) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  if (data?.publicUrl) return data.publicUrl;

  const signed = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (signed.error) {
    throw new Error(`Signed URL failed: ${signed.error.message}`);
  }
  return signed.data.signedUrl;
}

async function uploadWithFallback({ bucket, fallbackBucket, path, buffer }) {
  try {
    await uploadBuffer({ bucket, path, buffer, contentType: "image/png" });
    return { bucket, path };
  } catch (err) {
    const msg = err?.message || "";
    if (
      fallbackBucket &&
      fallbackBucket !== bucket &&
      msg.toLowerCase().includes("storage not configured")
    ) {
      await uploadBuffer({ bucket: fallbackBucket, path, buffer, contentType: "image/png" });
      return { bucket: fallbackBucket, path };
    }
    throw err;
  }
}

export async function uploadHeroImage({ userId, buffer, promptHash }) {
  const bucket = process.env.CREATIVE_IMAGES_BUCKET || process.env.CREATIVE_RENDERS_BUCKET || "creative-renders";
  const fallbackBucket = process.env.CREATIVE_FALLBACK_BUCKET || "creative-inputs";
  const path = buildPath({ userId, prefix: `hero-${promptHash || "img"}`, ext: "png" });
  const upload = await uploadWithFallback({ bucket, fallbackBucket, path, buffer });
  const url = await resolveUrl({ bucket: upload.bucket, path: upload.path });
  return { path: upload.path, url, bucket: upload.bucket };
}

export async function uploadRenderedImage({ userId, buffer, promptHash }) {
  const bucket = process.env.CREATIVE_RENDERS_BUCKET || "creative-renders";
  const fallbackBucket = process.env.CREATIVE_FALLBACK_BUCKET || "creative-inputs";
  const path = buildPath({ userId, prefix: `render-${promptHash || "img"}`, ext: "png" });
  const upload = await uploadWithFallback({ bucket, fallbackBucket, path, buffer });
  const url = await resolveUrl({ bucket: upload.bucket, path: upload.path });
  return { path: upload.path, url, bucket: upload.bucket };
}
