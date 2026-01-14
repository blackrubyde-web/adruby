/**
 * CREATIVE SPEC PROMPTS
 * 
 * Master prompts and business-model-specific addenda for CreativeSpec generation.
 * These prompts drive the LLM to produce deterministic, structured blueprints.
 */

import type { BusinessModel, CreativeSpecRequest } from './types';

// ============================================================================
// MASTER PROMPT (UNIVERSAL)
// ============================================================================

export function buildMasterPrompt(request: CreativeSpecRequest): string {
  const {
    productName,
    brandName,
    userPrompt,
    tone,
    language = 'de',
    platform = 'meta_feed',
    ratio = '1:1',
    groundedFacts
  } = request;

  return `You are a performance marketer and creative strategist.
Return only valid JSON that matches the CreativeSpec schema.
You do not invent metrics, testimonials, or claims. Use grounded facts exactly as provided.

Create a CreativeSpec for an ad creative.

**Product/Service:** ${productName}
${brandName ? `**Brand:** ${brandName}` : ''}
**Description/Context:** ${userPrompt}
**Platform:** ${platform}
**Aspect Ratio:** ${ratio}
**Language:** ${language}
**Tone:** ${tone}

${groundedFacts?.offer ? `**Offer (GROUNDED FACT):** ${groundedFacts.offer}` : ''}
${groundedFacts?.proof ? `**Proof (GROUNDED FACT):** ${groundedFacts.proof}` : ''}
${groundedFacts?.painPoints?.length ? `**Pain Points (GROUNDED FACTS):** ${groundedFacts.painPoints.join(', ')}` : ''}
${groundedFacts?.features?.length ? `**Features (GROUNDED FACTS):** ${groundedFacts.features.join(', ')}` : ''}

**Rules:**
1. Mobile-first copy. Short, punchy, scannable.
2. No buzzwords like "revolutionary", "game-changing", "unlock".
3. NO fake "#1", NO fake reviews, NO fabricated results or testimonials.
4. Choose ONE primary angle and ONE creativePattern that best fits the inferred businessModel.
5. Include chips/bullets ONLY if it improves scan ability (max 3 each).
6. Define required assets (deterministic mocks/cards) based on creativePattern.
7. Provide constraints for headline/subheadline/cta lengths appropriate for ratio.
8. Specify "forbiddenStyles" appropriate for conversion (avoid clutter for most business models).
9. Return ONLY valid JSON matching this structure.

**Expected JSON Structure:**
\`\`\`json
{
  "businessModel": "ecommerce|saas|local|coach|agency|info",
  "niche": "specific niche/category",
  "platform": "${platform}",
  "ratio": "${ratio}",
  "language": "${language}",  // CRITICAL: Use exact ISO code ${language}, NOT full language name! Max 5 chars!
  "audience": {
    "persona": "target audience description",
    "sophistication": "unaware|problem_aware|solution_aware|product_aware",
    "objections": ["objection1", "objection2"]
  },
  "angle": "pain_relief|desire|social_proof|urgency|authority|gift|demo|before_after|comparison|price_anchor",
  "creativePattern": "pattern_from_businessModel",
  "copy": {
    "headline": "attention-grabbing headline",
    "subheadline": "supporting value proposition",
    "body": "optional supporting copy",
    "cta": "action verb",
    "bullets": ["benefit 1", "benefit 2"],
    "chips": ["feature 1", "feature 2"],
    "proofLine": "social proof if grounded fact provided"
  },
  "assets": {
    "required": [
      { "type": "assetType", "params": {}, "optional": false }
    ]
  },
  "constraints": {
    "maxChars": {
      "headline": 60,
      "subheadline": 100,
      "cta": 25
    },
    "maxLines": {
      "headline": 2,
      "subheadline": 2
    },
    "minFontSize": 18,
    "forbiddenStyles": ["illustrations"],
    "mustAvoidClaims": ["fabricated metrics"],
    "readabilityMin": 4.5
  },
  "style": {
    "palette": ["#hexcolor1", "#hexcolor2"],
    "textSafe": ["#hexcolor"],
    "forbiddenStyles": ["gradients"]
  },
  "templateHints": {
    "preferTextPlacement": "bottom",
    "preferHeroSize": "large",
    "preferHeroPosition": "center"
  }
}
\`\`\`

Return ONLY the JSON, no additional text.`;
}

// ============================================================================
// BUSINESS MODEL ADDENDA
// ============================================================================

export function getBusinessModelAddendum(businessModel: BusinessModel): string {
  const addenda: Record<BusinessModel, string> = {
    ecommerce: `
**E-COMMERCE CREATIVE STRATEGY:**

**Preferred Patterns:**
- ecommerce_product_focus: Hero product + benefits
- ecommerce_offer_burst: Discount/offer emphasis
- ecommerce_ugc_frame: User-generated content style (still image frame, not video)
- ecommerce_giftable: Gift angle ("Perfect for...")
- ecommerce_benefit_stack: Product + benefit bullets
- ecommerce_comparison: Before/after or vs alternative
- ecommerce_feature_stack: High-density feature layout (scattered/exploded) - BEST FOR: complex products, tech, supplements

**Copy Guidelines:**
- Emphasize: benefit, use case, offer (if real), shipping clarity (only if provided)
- Use giftable angle for seasonal/holidays if appropriate
- Address objections: quality, delivery time, returns
- Avoid: generic "premium quality", "amazing", "must-have"

**Assets to Define:**
- productCutout (required in most patterns)
- offerBadge (ONLY if real offer provided in groundedFacts)
- reviewCard or testimonialCard (ONLY if proof provided in groundedFacts)
- backgroundPolicy: specify if plain/gradient/lifestyle

**Constraints:**
- headline: 40-60 chars (mobile thumb-scroll test)
- CTA: specific action verb ("Jetzt ansehen", "In den Korb", NOT generic "Click here")
`,

    saas: `
**SAAS / APP CREATIVE STRATEGY:**

**Preferred Patterns:**
- saas_ui_proof: Hero UI screenshot + key benefit
- saas_time_saving: "Save X hours" angle
- saas_workflow_steps: 1-2-3 step visualization
- saas_feature_grid: 4-Step Grid / Feature Matrix - BEST FOR: describing workflows or complex value props
- saas_lead_capture: E-book / Whitepaper / Trial magnet
- saas_whatsapp_flow: Chat interface simulation (if applicable)

**Copy Guidelines:**
- Be pragmatic, not aspirational: "automatisch", "direkt", "weniger manuell"
- Quantify time/money saved ONLY if grounded in features
- Address objections: setup complexity, integration, learning curve
- Avoid: "AI-powered", "revolutionary", "next-gen" unless core to product

**Assets to Define:**
- messengerMock (generic, NOT WhatsApp trademark) for communication flows
- dashboardCard for analytics/results
- invoicePreview for billing/invoicing products
- featureChips like "OEM erkannt", "Rechnung erstellt" ONLY if grounded in actual features

**Constraints:**
- headline: focus on outcome, not feature list
- proofLine: use real customer count or usage stat if provided, else omit
`,

    local: `
**LOCAL/GASTRO CREATIVE STRATEGY:**

**Preferred Patterns:**
- local_menu_feature: Highlight specific dish/service
- local_offer_coupon: Discount or special
- local_map_hours: Show location/hours (trust signal)
- local_social_proof: Reviews/testimonials if available

**Copy Guidelines:**
- Location-specific: include city/neighborhood if relevant
- Action-oriented: "Jetzt reservieren", "Heute bestellen"
- Emphasize: proximity, hours, parking, special offers
- Avoid: generic "best in town" without proof

**Assets to Define:**
- menuCard: 3-item menu card for restaurants
- mapCard: map pin + address for location-based
- hoursCard: opening hours
- dishPhoto (policy: use real photos if available, avoid AI-generated food)
- offerBadge ONLY if real offer

**Constraints:**
- Keep copy local and immediate: "5 Minuten entfernt", "Heute geöffnet bis 22 Uhr"
`,

    coach: `
**COACH/EXPERT CREATIVE STRATEGY:**

**Preferred Patterns:**
- coach_authority_slide: Position as authority
- coach_transformation: Before/after outcomes (non-numeric unless grounded)
- coach_testimonial: Social proof IF provided

**Copy Guidelines:**
- Claims must be soft and realistic
- NO "10k in 7 days", NO income guarantees
- Focus on: expertise, methodology, support, community
- Address objections: time commitment, results timeline, cost

**Assets to Define:**
- authoritySlide: credentials, media features (only if grounded)
- testimonialCard: ONLY if real testimonial provided in groundedFacts
- portraitFrame: optional professional headshot frame
- calendarCard: for booking/webinar CTAs

**Constraints:**
- Avoid superlatives
- proofLine: "X coached", "X years experience" ONLY if grounded
- CTA: "Kostenloses Erstgespräch", "Webinar ansehen", "Mehr erfahren"
`,

    agency: `
**AGENCY/B2B SERVICES CREATIVE STRATEGY:**

**Preferred Patterns:**
- agency_results_card: Show case study results (only if grounded)
- agency_case_study: Highlight specific client win
- agency_offer_audit: Free audit/consultation hook

**Copy Guidelines:**
- If NO grounded results: use "Audit", "Kostenloses Erstgespräch", "Case Study ansehen" WITHOUT numbers
- If grounded results: specific % or $ improvement for named client
- Address objections: ROI, timeline, trust
- Avoid: "we're the best", "#1 agency"

**Assets to Define:**
- resultsCard: ONLY if real results provided, otherwise omit
- calendarCard: for booking
- processSteps: 3-step process visualization

**Constraints:**
- headline: problem → solution angle
- CTA: "Audit buchen", "Case Study ansehen", "Gespräch vereinbaren"
`,

    info: `
**INFO/EDUCATION CREATIVE STRATEGY:**

**Preferred Patterns:**
- info_curriculum: Show course structure
- info_outcomes: Focus on learning outcomes
- info_webinar: Webinar/workshop hook

**Copy Guidelines:**
- Focus on: what they'll learn, format, time commitment
- NO income promises or "get rich" angles
- Outcomes: skills, knowledge, certifications
- Address objections: time, relevance, difficulty level

**Assets to Define:**
- curriculumCard: module list
- outcomesCard: learning outcomes (non-numeric benefits)
- webinarCard: for live/recorded webinars

**Constraints:**
- CTA: "Jetzt ansehen", "Webinar sichern", "Inhalte anschauen", "Kurs starten"
- Avoid: over-promising results
`
  };

  return addenda[businessModel] || '';
}

// ============================================================================
// TIGHTEN COPY PROMPT
// ============================================================================

export interface TightenCopyRequest {
  copy: {
    headline: string;
    subheadline?: string;
    body?: string;
    cta: string;
    bullets?: string[];
    chips?: string[];
  };
  constraints: {
    headline_max_chars: number;
    subheadline_max_chars?: number;
    cta_max_chars: number;
    max_bullets?: number;
  };
  language: string;
  tone: string;
}

export function buildTightenCopyPrompt(request: TightenCopyRequest): string {
  const { copy, constraints, language, tone } = request;

  return `You compress ad copy to fit strict character/line limits while keeping meaning and tone.
Return JSON only. No new claims.

**Given Copy:**
\`\`\`json
${JSON.stringify(copy, null, 2)}
\`\`\`

**Constraints:**
- headline_max_chars: ${constraints.headline_max_chars}
${constraints.subheadline_max_chars ? `- subheadline_max_chars: ${constraints.subheadline_max_chars}` : ''}
- cta_max_chars: ${constraints.cta_max_chars}
${constraints.max_bullets ? `- max_bullets: ${constraints.max_bullets}` : ''}
- language: ${language}
- tone: ${tone}

**Rules:**
1. Keep meaning, remove fluff words
2. Do NOT invent proof, numbers, or offers
3. Preserve tone (${tone})
4. Ensure character limits are met
5. Bullets: compress or merge if needed

**Return ONLY this JSON structure:**
\`\`\`json
{
  "headline": "compressed headline within limit",
  "subheadline": "compressed subheadline",
  "body": "compressed body if present",
  "cta": "compressed cta",
  "bullets": ["compressed bullet 1", "compressed bullet 2"],
  "chips": ["compressed chip 1"]
}
\`\`\`

Return ONLY the JSON, no additional text.`;
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

/**
 * Build complete prompt for CreativeSpec generation
 */
export function buildCreativeSpecPrompt(
  request: CreativeSpecRequest,
  businessModel?: BusinessModel
): string {
  const masterPrompt = buildMasterPrompt(request);

  // If businessModel is known, append specific addendum
  if (businessModel) {
    const addendum = getBusinessModelAddendum(businessModel);
    return `${masterPrompt}\n\n${addendum}`;
  }

  return masterPrompt;
}
