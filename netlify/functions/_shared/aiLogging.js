import { supabaseAdmin } from "./clients.js";

export async function logAiAction(entry) {
  try {
    const { error } = await supabaseAdmin.from("ai_action_logs").insert({
      user_id: entry.userId,
      action_type: entry.actionType,
      status: entry.status,
      input: entry.input,
      output: entry.output ?? null,
      error_message: entry.errorMessage ?? null,
      meta: entry.meta ?? {},
    });

    if (error) console.warn("[ai log] insert failed:", error.message);
  } catch (e) {
    console.warn("[ai log] unexpected:", e);
  }
}

