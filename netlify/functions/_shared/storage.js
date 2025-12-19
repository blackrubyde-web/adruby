import crypto from "crypto";
import { supabaseAdmin } from "./clients.js";

function fileExtension(filename) {
  const last = String(filename || "").split(".").pop();
  if (!last || last === filename) return "png";
  return String(last).toLowerCase();
}

export async function uploadCreativeInputImage({ userId, file }) {
  const ext = fileExtension(file.filename);
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("creative-inputs")
    .upload(path, file.buffer, {
      contentType: file.contentType,
      upsert: false,
    });

  if (error) {
    const msg = error.message || "Upload failed";
    if (msg.toLowerCase().includes("bucket")) {
      const err = new Error(
        "Storage not configured. Create bucket creative-inputs.",
      );
      err.cause = error;
      throw err;
    }
    throw new Error(`Upload failed: ${msg}`);
  }

  const signed = await supabaseAdmin.storage
    .from("creative-inputs")
    .createSignedUrl(path, 60 * 10);
  if (signed.error) {
    throw new Error(`Signed URL failed: ${signed.error.message}`);
  }

  return { path, signedUrl: signed.data.signedUrl };
}

