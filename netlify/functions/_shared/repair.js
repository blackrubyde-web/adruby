function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(s.slice(first, last + 1));
      } catch {
        // ignore
      }
    }
    return null;
  }
}

export async function parseWithRepair({
  schema,
  makeRequest,
  initial,
  maxAttempts = 2,
}) {
  let raw = initial;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    const parsed = schema.safeParse(safeJsonParse(raw));
    if (parsed.success) return { data: parsed.data, raw, attempts: attempt };

    const issues = parsed.error.issues
      .map((i) => `- ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    const fixInstruction =
      `Your previous output was invalid JSON for the required schema.\n` +
      `Fix it and return ONLY valid JSON.\n\nSchema issues:\n${issues}\n\n` +
      `Rules:\n- Output MUST be a single JSON object\n- No markdown\n- No extra keys\n- Fill missing fields with safe defaults\n`;

    raw = await makeRequest(fixInstruction);
  }

  const final = schema.safeParse(safeJsonParse(raw));
  if (!final.success) {
    throw new Error("Failed to produce valid JSON after repair attempts.");
  }
  return { data: final.data, raw, attempts: maxAttempts + 1 };
}

