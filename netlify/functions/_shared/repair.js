function safeJsonParse(s) {
  if (s == null) return null;
  // quick pass
  try {
    return JSON.parse(s);
  } catch (e) {
    // continue to heuristics
  }

  const asString = String(s || "");
  // 1) try to extract between first { and last }
  const first = asString.indexOf("{");
  const last = asString.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = asString.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // fallthrough to more heuristics
    }
  }

  // 2) try to fix common issues: single quotes -> double quotes, remove trailing commas
  let cleaned = asString
    .replace(/\r?\n/g, " ")
    .replace(/\t+/g, " ")
    // replace single quotes around keys/values heuristically
    .replace(/'([^']*)'/g, '"$1"')
    // remove trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // last ditch: try to find an array
    const arrFirst = asString.indexOf("[");
    const arrLast = asString.lastIndexOf("]");
    if (arrFirst >= 0 && arrLast > arrFirst) {
      const candidateArr = asString.slice(arrFirst, arrLast + 1).replace(/,\s*([\]}])/g, '$1');
      try {
        return JSON.parse(candidateArr);
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

export async function parseWithRepair({
  schema,
  makeRequest,
  initial,
  // increase attempts to give the model more chances to correct itself
  maxAttempts = 4,
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
      `Rules:\n- Output MUST be a single JSON object\n- No markdown\n- No extra keys\n- Fill missing fields with safe defaults\n` +
      `\nImportant: respond with only the JSON value, no explanations. If you cannot satisfy the schema exactly, still return the object and use safe defaults for missing values.`;

    raw = await makeRequest(fixInstruction);
  }

  const final = schema.safeParse(safeJsonParse(raw));
  if (!final.success) {
    throw new Error("Failed to produce valid JSON after repair attempts.");
  }
  return { data: final.data, raw, attempts: maxAttempts + 1 };
}

