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

// --- Premium Mentor UGC generator prompt builder ---
export function buildMentorUgcGeneratePrompt(brief, researchContext, options = {}) {
  const banned = [
    "Gamechanger",
    "revolutionär",
    "perfekt für dich",
    "garantiert",
    "100% sicher",
    "passives Einkommen",
    "in wenigen Minuten",
    "die beste Lösung",
  ];

  return `
You are a hands-on Creative Director specialized in Mentor-UGC and Authority Funnel ads.
STYLE MODE: mentor_ugc. Tone: raw, spoken, call-and-response, slightly repetitive, believable.
Return ONLY valid JSON (no markdown, no commentary). Follow the JSON schema exactly.

BLACKLIST: Avoid these phrases: ${JSON.stringify(banned)}.

TASK:
- Produce exactly 12 variants (diversity required). Each variant must include platform, language, tone, hook, proof_type, offer_type, on_screen_text, script (hook/problem/proof/offer/cta), cta.
- Diversity enforcement: produce 3 Hook Patterns × 2 Proof Types × 2 Offer Types × tonalities split across the 12 variants.
- No new unverifiable claims. No medical/financial guarantees. Keep it actionable and scriptable.

BRIEF:
${JSON.stringify(brief)}

RESEARCH_CONTEXT:
${JSON.stringify(researchContext || [])}

BRANCH-ADAPTER RULES:
- Extract industry/category, persona, pains, desired outcome, objections, offer, proof assets.
- Map to 2 Angles from: speed, trust, value, authority, convenience, risk_reversal.
- Hook patterns per industry (choose matching):
  - D2C: pattern_interrupt, before_after, listicle
  - SaaS B2B: pain-to-metric, contrarian, system/blueprint
  - Local Services: trust-first, guarantee/process, before-after
  - Coaching: identity_shift, contrarian_truth, case-study_teaser

OUTPUT JSON MUST MATCH:
{
  "schema_version":"2.0",
  "style_mode":"mentor_ugc",
  "variants": [ /* 12 items */ ]
}

Rules:
- Each variant must be short and production-ready for a 15-60s social creative.
- For each variant, mark proof_type and offer_type.
- For on_screen_text include 2-6 short captions that can be shown on-screen.
`;
}

export function buildQualityEvalPromptV2({ brief, variant, strategyBlueprint, researchContext }) {
  const researchBlock = renderResearchContext(researchContext);
  const strategyBlock = strategyBlueprint ? `\nStrategy: ${strategyBlueprint}` : "";

  return `
You are a strict creative reviewer. Return ONLY valid JSON matching the QualityEvalV2 schema.
Evaluate the single variant against the brief. Provide subscores 0-5 for hookPower, clarity, proof, offer, objectionHandling, platformFit, novelty.
Provide KO flags: complianceFail, genericBuzzwordFail. Provide issues array and weakest_dimensions ordered by priority.

BRIEF: ${JSON.stringify(brief)}
VARIANT: ${JSON.stringify(variant)}
${strategyBlock}
${researchBlock}
`;
}

export function buildBatchQualityEvalPromptV2({ brief, variants, strategyBlueprint, researchContext }) {
  const researchBlock = renderResearchContext(researchContext);
  const strategyBlock = strategyBlueprint ? `\nStrategy: ${strategyBlueprint}` : "";

  const variantsJson = JSON.stringify(
    variants.map((v, i) => ({ id: i, variant: v })),
    null,
    2,
  );

  return `
You are a strict creative reviewer. Return ONLY valid JSON matching the BatchQualityEvalV2 schema.
Your task is to evaluate a batch of creative variants against a single brief.
For each variant in the input array, provide a corresponding evaluation object in an "evaluations" array.
The order of evaluations in your output array MUST EXACTLY match the order of variants in the input array.

Respond with a single JSON object: { "evaluations": [ ... ] }

BRIEF: ${JSON.stringify(brief)}
VARIANTS: ${variantsJson}
${strategyBlock}
${researchBlock}
`;
}

export function buildImprovePromptDiagnosePlanRewrite({ brief, currentVariant, evalV2, targetDimensions = [] }) {
  return `
Return ONLY valid JSON.
You will improve ONE variant using: DIAGNOSE -> PLAN -> REWRITE.
1) diagnosis: 1-2 bullets with biggest weaknesses.
2) plan: 1-3 concrete edits targeting: ${JSON.stringify(targetDimensions)}
3) rewrite: full variant matching CreativeVariant schema. No new claims.

BRIEF: ${JSON.stringify(brief)}
CURRENT_VARIANT: ${JSON.stringify(currentVariant)}
EVAL: ${JSON.stringify(evalV2)}
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

