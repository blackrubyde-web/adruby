const EN_CTA = ["Shop Now", "Learn More", "Get Offer"];
const DE_CTA = ["Jetzt kaufen", "Mehr erfahren", "Angebot sichern"];

const FORBIDDEN_TOKENS = [
  "100%",
  "guarantee",
  "guaranteed",
  "garantie",
  "garantiert",
  "geld zurück",
  "money back",
];

function clampInt(n, min, max) {
  const v = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, v));
}

function pickAllowedCta(language, cta) {
  const allowed = language === "de" ? DE_CTA : EN_CTA;
  const normalized = String(cta || "").trim();
  if (allowed.includes(normalized)) return normalized;
  return allowed[0];
}

function includesForbidden(text) {
  const t = String(text || "").toLowerCase();
  return FORBIDDEN_TOKENS.some((tok) => t.includes(tok));
}

function hasHighRiskFlag(brief, needle) {
  const flags = Array.isArray(brief?.risk_flags) ? brief.risk_flags : [];
  return flags.some(
    (f) =>
      String(f?.severity) === "high" &&
      String(f?.type || "").toLowerCase().includes(needle),
  );
}

function appendRationale(rationale, extra) {
  const base = String(rationale || "").trim();
  const merged = base ? `${base} ${extra}` : extra;
  return merged.slice(0, 240);
}

export function applySanityFilter(output) {
  const brief = output?.brief;
  const angleIds = new Set((brief?.angles || []).map((a) => a.id));
  const language = brief?.language || "de";

  const guaranteeRisk = hasHighRiskFlag(brief, "guarantee") || hasHighRiskFlag(brief, "garantie");
  const medicalRisk = hasHighRiskFlag(brief, "medical") || hasHighRiskFlag(brief, "health");

  for (const creative of output?.creatives || []) {
    if (!angleIds.has(creative.angle_id)) {
      creative.angle_id = (brief?.angles?.[0]?.id || creative.angle_id || "angle-1");
    }

    creative.copy.cta = pickAllowedCta(language, creative.copy?.cta);
    creative.score.value = clampInt(creative.score?.value, 0, 100);

    const combined = `${creative.copy?.hook || ""}\n${creative.copy?.primary_text || ""}`;
    const forbidden = includesForbidden(combined);

    if (forbidden && (guaranteeRisk || medicalRisk)) {
      creative.score.value = clampInt(creative.score.value - 12, 0, 100);
      creative.score.rationale = appendRationale(
        creative.score.rationale,
        "Adjusted: toned down due to risky/guarantee-like language.",
      );
    }

    if (forbidden && !(guaranteeRisk || medicalRisk)) {
      creative.score.value = clampInt(creative.score.value - 6, 0, 100);
      creative.score.rationale = appendRationale(
        creative.score.rationale,
        "Adjusted: removed points for absolute/guarantee language.",
      );
    }
  }

  return output;
}

