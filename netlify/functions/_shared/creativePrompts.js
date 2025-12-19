export function buildAnalyzePrompt(input) {
  const strategyBlock = input.strategyBlueprint
    ? `\nStrategy blueprint (follow if relevant):\n${input.strategyBlueprint}\n`
    : "";
  return `
You are AdRuby Creative Strategist.
Task: Normalize a creative brief for Meta ads and propose strong angles.
Return ONLY valid JSON matching the NormalizedBrief schema. No markdown.

Hard rules:
- Output MUST be a single JSON object (not an array).
- No extra keys. Use null for unknown optional fields.
- Angles: 3-6. Each angle needs: id, label, why_it_fits.
- Audience.segments must be specific and actionable (min 3 segments if possible).
- Risk flags: list potential compliance issues (guarantees, medical claims, misleading results). If none, empty array.

Input:
brandName: ${input.brandName}
productName: ${input.productName}
productUrl: ${input.productUrl ?? "null"}
offer: ${input.offer ?? "null"}
audience: ${input.audience}
tone: ${input.tone}
goal: ${input.goal}
funnel_stage: ${input.funnel}
language: ${input.language}
format: ${input.format}
inspiration: ${input.inspiration ?? "null"}
claims_to_avoid: ${input.avoidClaims ?? "null"}
${strategyBlock}
`;
}

export function buildGeneratePrompt(brief, hasImage, strategyBlueprint, researchContext) {
  const strategyBlock = strategyBlueprint
    ? `\nStrategy blueprint (apply it carefully and stay compliant):\n${strategyBlueprint}\n`
    : "";
  return `
You are AdRuby Performance Copywriter for Meta ads.
Generate high-performing ad copy variations, structured and compliant.
Return ONLY valid JSON matching CreativeOutput schema. No markdown.

Constraints:
- Output 4-6 creatives (diverse angles, not repetitive).
- Hooks max 80 chars. CTA max 30 chars.
- Primary text: clear benefit + proof style + CTA. Avoid spam, avoid unrealistic promises.
- Respect funnel stage:
  - cold: curiosity + problem/solution + light proof
  - warm: clearer offer + differentiators + trust
  - hot: direct offer + urgency + risk reversal (avoid "guarantee" if risky)
- Language must match brief.language.
- If risk_flags include high severity, tone down claims.

Image usage:
- input_image_used: ${hasImage ? "true" : "false"}
- render_intent: describe what the image generator should create/edit (short, concrete, non-artsy).

Scoring:
- value 0-100. Be strict. 70+ only if genuinely strong.
- rationale: 1-2 short sentences, concrete reason.

Brief JSON:
${JSON.stringify(brief)}
${strategyBlock}
`;
}

function renderResearchContext(ctx) {
  if (!ctx || !Array.isArray(ctx) || ctx.length === 0) return '';
  const items = ctx.slice(0, 8).map((i, idx) => {
    return `\n[${idx + 1}] page: ${i.page_name || 'unknown'}\nheadline: ${i.headline || 'null'}\nprimary_text: ${i.primary_text || 'null'}\ndescription: ${i.description || 'null'}\nimage_url: ${i.image_url || 'null'}`;
  });
  return `\nResearch context (examples of recent ads scraped from Ad Library):\n${items.join('\n')}`;
}

export function buildQualityEvalPrompt({ brief, output, strategyBlueprint, researchContext }) {
  const researchBlock = renderResearchContext(researchContext);
  const strategyBlock = strategyBlueprint
    ? `\nStrategy blueprint reference:\n${strategyBlueprint}\n`
    : "";

  return `
You are an expert Meta Ads creative reviewer.
Evaluate quality and compliance of the provided CreativeOutput against the brief.
Return ONLY valid JSON (no markdown) matching:
{
  "satisfaction": 0-100,
  "issues": [
    { "type": "hook"|"compliance"|"clarity"|"cta"|"repetition"|"format"|"length", "severity": "low"|"medium"|"high", "note": "..." }
  ],
  "best_practices": ["..."]
}

Scoring rubric (be strict):
- 95+ only if truly excellent, compliant, and diverse.
- Penalize: spammy wording, unrealistic promises, vague benefits, missing CTA, repetitive angles, ignoring funnel stage, violating risk flags.

Brief JSON:
${JSON.stringify(brief)}
${strategyBlock}
${researchBlock}

CreativeOutput JSON:
${JSON.stringify(output)}
`;
}

export function buildImprovePrompt({ brief, priorOutput, issues, strategyBlueprint, researchContext }) {
  const issueText =
    issues?.length > 0
      ? issues.map((i) => `- [${i.severity}] ${i.type}: ${i.note}`).join("\n")
      : "- No issues provided";
  const strategyBlock = strategyBlueprint
    ? `\nStrategy blueprint (apply it carefully and stay compliant):\n${strategyBlueprint}\n`
    : "";

  return `
You are AdRuby Performance Copywriter.
Your previous CreativeOutput is not good enough. Improve it.
Return ONLY valid JSON matching CreativeOutput schema. No markdown.

Fix these issues:
${issueText}

Rules:
- Keep 4-6 creatives.
- Increase diversity across angles and hooks.
- Keep claims compliant given brief.risk_flags.
- Ensure CTA is strong and appropriate for language.
- No extra keys.

Brief JSON:
${JSON.stringify(brief)}
${strategyBlock}

Previous CreativeOutput JSON:
${JSON.stringify(priorOutput)}
`;
}

