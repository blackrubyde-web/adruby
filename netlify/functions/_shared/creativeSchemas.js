import { z } from "zod";

export const GoalEnum = z.enum(["sales", "leads", "traffic", "app_installs"]);
export const FunnelEnum = z.enum(["cold", "warm", "hot"]);
export const LangEnum = z.enum(["de", "en"]);
export const FormatEnum = z.enum(["1:1", "4:5", "9:16"]);
export const PlatformEnum = z.enum(["meta", "tiktok", "ytshorts", "linkedin"]);
export const ToneEnum = z.enum([
  "direct",
  "luxury",
  "playful",
  "minimal",
  "bold",
  "trustworthy",
]);

export const NormalizedBriefSchema = z
  .object({
    brand: z.object({ name: z.string().min(1) }),
    product: z.object({
      name: z.string().min(1),
      url: z.string().url().nullable(),
      category: z.string().nullable(),
    }),
    goal: GoalEnum,
    funnel_stage: FunnelEnum,
    language: LangEnum,
    format: FormatEnum,
    audience: z.object({
      summary: z.string().min(1),
      segments: z.array(z.string().min(1)).min(1),
    }),
    offer: z.object({
      summary: z.string().nullable(),
      constraints: z.array(z.string().min(1)).default([]),
    }),
    tone: ToneEnum,
    angles: z
      .array(
        z
          .object({
            id: z.string().min(1),
            label: z.string().min(1),
            why_it_fits: z.string().min(1),
          })
          .strict(),
      )
      .min(2),
    risk_flags: z
      .array(
        z
          .object({
            type: z.string().min(1),
            severity: z.enum(["low", "medium", "high"]),
            note: z.string().min(1),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

export const CreativeOutputSchema = z
  .object({
    version: z.literal("1.0"),
    brief: NormalizedBriefSchema,
    creatives: z
      .array(
        z
          .object({
            id: z.string().min(1),
            angle_id: z.string().min(1),
            format: FormatEnum,
            copy: z
              .object({
                hook: z.string().min(1).max(80),
                primary_text: z.string().min(1).max(700),
                cta: z.string().min(1).max(30),
                bullets: z.array(z.string().min(1).max(90)).max(6).default([]),
              })
              .strict(),
            score: z
              .object({
                value: z.number().int().min(0).max(100),
                rationale: z.string().min(1).max(240),
              })
              .strict(),
            image: z
              .object({
                input_image_used: z.boolean(),
                render_intent: z.string().min(1).max(200),
                hero_image_url: z.string().min(1).nullable().optional(),
                final_image_url: z.string().min(1).nullable().optional(),
                width: z.number().int().nullable().optional(),
                height: z.number().int().nullable().optional(),
                model: z.string().min(1).nullable().optional(),
                seed: z.number().int().nullable().optional(),
                prompt_hash: z.string().min(6).nullable().optional(),
                render_version: z.string().min(1).nullable().optional(),
              })
              .strict(),
          })
          .strict(),
      )
      .min(2)
      .max(8),
  })
  .strict();

export const QualityEvalSchema = z
  .object({
    satisfaction: z.number().int().min(0).max(100),
    issues: z
      .array(
        z
          .object({
            type: z.enum([
              "hook",
              "compliance",
              "clarity",
              "cta",
              "repetition",
              "format",
              "length",
            ]),
            severity: z.enum(["low", "medium", "high"]),
            note: z.string().min(1).max(240),
          })
          .strict(),
      )
      .default([]),
    best_practices: z.array(z.string().min(1).max(140)).default([]),
  })
  .strict();

export const ImageSpecSchema = z
  .object({
    version: z.literal("1.0"),
    format: FormatEnum,
    platform: PlatformEnum.default("meta"),
    style: z
      .object({
        mood: z.string().min(1),
        lighting: z.string().min(1),
        palette: z.array(z.string().min(1)).min(2).max(6),
        camera: z.string().min(1),
        render_style: z.string().min(1),
        realism_level: z.enum(["low", "medium", "high"]),
      })
      .strict(),
    scene: z
      .object({
        subject: z.string().min(1),
        environment: z.string().min(1),
        composition: z.string().min(1),
        props: z.array(z.string().min(1)).min(1).max(6),
        wardrobe: z.array(z.string().min(1)).max(6).default([]),
      })
      .strict(),
    brand_safety: z
      .object({
        avoid: z.array(z.string().min(1)).default([]),
      })
      .strict(),
    negative_prompt: z.array(z.string().min(1)).default([]),
    text_safe_area: z
      .object({
        position: z.enum(["left", "right", "center"]),
        margin: z.enum(["tight", "normal", "wide"]),
      })
      .strict(),
    overlay_guidance: z
      .object({
        headline_max_chars: z.number().int().min(10).max(90),
        cta_style: z.enum(["solid", "outline", "pill"]),
        badge_optional: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const ImageSpecSchemaV1 = ImageSpecSchema;

// --- V2 schemas for premium generator ---
export const QualityEvalV2Schema = z.object({
  subscores: z.object({
    hookPower: z.number().int().min(0).max(5),
    clarity: z.number().int().min(0).max(5),
    proof: z.number().int().min(0).max(5),
    offer: z.number().int().min(0).max(5),
    objectionHandling: z.number().int().min(0).max(5),
    platformFit: z.number().int().min(0).max(5),
    novelty: z.number().int().min(0).max(5),
  }),
  ko: z.object({
    complianceFail: z.boolean(),
    genericBuzzwordFail: z.boolean(),
  }),
  issues: z.array(z.string()).default([]),
  weakest_dimensions: z
    .array(
      z.enum([
        "hookPower",
        "clarity",
        "proof",
        "offer",
        "objectionHandling",
        "platformFit",
        "novelty",
      ]),
    )
    .default([]),
});

export const BatchQualityEvalV2Schema = z.object({
  evaluations: z.array(QualityEvalV2Schema).min(1),
});

export const CreativeVariantSchema = z.object({
  platform: z.enum(["meta", "tiktok", "youtube_shorts", "linkedin"]).default("meta"),
  language: z.string().default("de-DE"),
  tone: z.enum(["raw", "premium", "direct", "empathetic"]).default("raw"),
  hook: z.string().min(1),
  proof_type: z.enum(["demo", "social", "authority", "mechanism"]),
  offer_type: z.enum(["trial", "discount", "lead", "bundle", "risk_reversal", "none"]),
  on_screen_text: z.array(z.string()).min(2).max(8),
  script: z
    .object({
      hook: z.string().min(1),
      problem: z.string().min(1),
      proof: z.string().min(1),
      offer: z.string().min(1),
      cta: z.string().min(1),
    })
    .strict(),
  cta: z.string().min(1),
  image: z
    .object({
      input_image_used: z.boolean().optional(),
      render_intent: z.string().min(1).max(200).optional(),
      hero_image_url: z.string().min(1).nullable().optional(),
      final_image_url: z.string().min(1).nullable().optional(),
      width: z.number().int().nullable().optional(),
      height: z.number().int().nullable().optional(),
      model: z.string().min(1).nullable().optional(),
      seed: z.number().int().nullable().optional(),
      prompt_hash: z.string().min(6).nullable().optional(),
      render_version: z.string().min(1).nullable().optional(),
    })
    .optional(),
});

export const CreativeOutputSchemaV2 = z.object({
  schema_version: z.literal("2.0"),
  style_mode: z.enum(["default", "mentor_ugc", "brand_direct", "ugc_demo"]).default("default"),
  brand: z
    .object({
      name: z.string().optional(),
      voice: z.array(z.string()).optional(),
    })
    .optional(),
  variants: z.array(CreativeVariantSchema).min(6).max(12),
  quality_eval: QualityEvalV2Schema.optional(),
});

export const QualityEvalProSchema = z
  .object({
    scores: z
      .object({
        hookPower: z.number().int().min(0).max(5),
        clarity: z.number().int().min(0).max(5),
        proof: z.number().int().min(0).max(5),
        offer: z.number().int().min(0).max(5),
        platformFit: z.number().int().min(0).max(5),
        objectionHandling: z.number().int().min(0).max(5),
        novelty: z.number().int().min(0).max(5),
        visualThumbStop: z.number().int().min(0).max(5),
      })
      .strict(),
    total: z.number().int().min(0).max(100),
    ko: z
      .object({
        complianceFail: z.boolean(),
        genericBuzzwordFail: z.boolean(),
      })
      .strict(),
    issues: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const CreativeVariantProSchema = z
  .object({
    id: z.string().min(1),
    platform: PlatformEnum.default("meta"),
    format: FormatEnum,
    copy: z
      .object({
        hook: z.string().min(1).max(80),
        primary_text: z.string().min(1).max(700),
        bullets: z.array(z.string().min(1).max(90)).max(6).default([]),
        cta: z.string().min(1).max(30),
        alt_hooks: z.array(z.string().min(1).max(90)).max(6).default([]),
        on_screen_text: z.array(z.string().min(1).max(90)).max(8).default([]),
      })
      .strict(),
    visual: z
      .object({
        image_spec: ImageSpecSchema.nullable().optional(),
        image: z
          .object({
            input_image_used: z.boolean(),
            render_intent: z.string().min(1).max(200),
            hero_image_url: z.string().nullable(),
            final_image_url: z.string().nullable(),
            width: z.number().int().nullable(),
            height: z.number().int().nullable(),
            model: z.string().nullable(),
            seed: z.number().int().nullable(),
            prompt_hash: z.string().nullable(),
            render_version: z.string().nullable(),
          })
          .strict(),
      })
      .strict(),
    quality: QualityEvalProSchema,
    experiment: z
      .object({
        ab_tests: z.array(z.string().min(1)).default([]),
      })
      .strict()
      .default({ ab_tests: [] }),
  })
  .strict();

export const CreativeOutputProSchema = z
  .object({
    schema_version: z.literal("2.1-pro"),
    job: z
      .object({
        id: z.string().min(1),
        style_mode: z.string().min(1),
        platforms: z.array(PlatformEnum).min(1),
        formats: z.array(FormatEnum).min(1),
        language: LangEnum,
      })
      .strict(),
    brand: z.object({ name: z.string().min(1) }).strict(),
    product: z
      .object({
        name: z.string().min(1),
        url: z.string().url().nullable(),
        category: z.string().nullable(),
      })
      .strict(),
    audience: z
      .object({
        summary: z.string().min(1),
        segments: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    offer: z
      .object({
        summary: z.string().nullable(),
        constraints: z.array(z.string().min(1)).default([]),
      })
      .strict(),
    strategy: z
      .object({
        id: z.string().nullable(),
        blueprint: z.string().nullable(),
      })
      .strict(),
    variants: z.array(CreativeVariantProSchema).min(6).max(12),
    winner_selection: z
      .object({
        recommended_winner_id: z.string().min(1),
        rationale: z.string().min(1),
        scores: z
          .array(
            z
              .object({
                id: z.string().min(1),
                total: z.number().int().min(0).max(100),
              })
              .strict(),
          )
          .default([]),
      })
      .strict(),
    brief: NormalizedBriefSchema.optional(),
  })
  .strict();

export const CreativeOutputAnySchema = z.union([
  CreativeOutputSchema,
  CreativeOutputSchemaV2,
  CreativeOutputProSchema,
]);

export const StrategyPlanSchema = z
  .object({
    schema_version: z.literal("1.0"),
    name: z.string().min(1),
    summary: z.string().min(1),
    confidence: z.number().int().min(0).max(100),
    recommendations: z.array(z.string().min(1)).min(6),
    blueprint: z
      .object({
        id: z.string().nullable(),
        title: z.string().nullable(),
      })
      .strict(),
    product_focus: z
      .object({
        positioning: z.string().min(1),
        usp: z.string().min(1),
        offer: z.string().min(1),
        proof_points: z.array(z.string().min(1)).min(3),
        objections: z.array(z.string().min(1)).min(3),
        voice: z.string().min(1),
        value_props: z.array(z.string().min(1)).min(4),
      })
      .strict(),
    audience: z
      .object({
        core: z.string().min(1),
        segments: z.array(z.string().min(1)).min(3),
        pains: z.array(z.string().min(1)).min(3),
        desires: z.array(z.string().min(1)).min(3),
        objections: z.array(z.string().min(1)).min(3),
        language: z.string().min(2),
        region: z.string().nullable(),
      })
      .strict(),
    messaging: z
      .object({
        key_messages: z.array(z.string().min(1)).min(5),
        angles: z.array(z.string().min(1)).min(5),
        hooks: z.array(z.string().min(1)).min(7),
        cta_guidance: z.array(z.string().min(1)).min(3),
        compliance_notes: z.array(z.string().min(1)).min(2),
      })
      .strict(),
    creative_system: z
      .object({
        formats: z.array(z.string().min(1)).min(2),
        visual_style: z
          .object({
            mood: z.string().min(1),
            palette: z.array(z.string().min(1)).min(2),
            photography_style: z.string().min(1),
            do: z.array(z.string().min(1)).min(2),
            dont: z.array(z.string().min(1)).min(2),
          })
          .strict(),
        ad_examples: z
          .array(
            z
              .object({
                hook: z.string().min(1),
                primary_text: z.string().min(1),
                cta: z.string().min(1),
                render_intent: z.string().min(1),
              })
              .strict(),
          )
          .min(4),
      })
      .strict(),
    funnel: z
      .object({
        stages: z
          .array(
            z
              .object({
                stage: z.string().min(1),
                goal: z.string().min(1),
                message: z.string().min(1),
                kpi: z.string().min(1),
              })
              .strict(),
          )
          .min(4),
      })
      .strict(),
    testing_plan: z
      .object({
        hypotheses: z.array(z.string().min(1)).min(4),
        experiments: z.array(z.string().min(1)).min(4),
        timeline: z.string().min(1),
        success_metrics: z.array(z.string().min(1)).min(3),
      })
      .strict(),
    budget: z
      .object({
        daily: z.string().min(1),
        monthly: z.string().min(1),
        scaling: z.string().min(1),
        allocation: z
          .object({
            testing: z.number().int().min(0).max(100),
            scaling: z.number().int().min(0).max(100),
          })
          .strict(),
        guardrails: z.array(z.string().min(1)).min(3),
      })
      .strict(),
    targeting: z
      .object({
        age: z.string().min(1),
        gender: z.string().min(1),
        locations: z.array(z.string().min(1)).min(1),
        interests: z.array(z.string().min(1)).min(5),
        behaviors: z.array(z.string().min(1)).min(3),
        lookalikes: z.array(z.string().min(1)).min(1),
        exclusions: z.array(z.string().min(1)).min(1),
        placements: z.array(z.string().min(1)).min(5),
      })
      .strict(),
    meta_setup: z
      .object({
        campaign: z
          .object({
            name: z.string().min(1),
            objective: z.string().min(1),
            budget_type: z.string().min(1),
            daily_budget: z.string().min(1),
            bid_strategy: z.string().min(1),
            optimization_goal: z.string().min(1),
            attribution: z.string().min(1),
            special_ad_categories: z.array(z.string().min(1)).min(1),
          })
          .strict(),
        ad_sets: z
          .array(
            z
              .object({
                name: z.string().min(1),
                budget: z.string().min(1),
                schedule: z.string().min(1),
                optimization_goal: z.string().min(1),
                audience: z
                  .object({
                    locations: z.array(z.string().min(1)).min(1),
                    age: z.string().min(1),
                    gender: z.string().min(1),
                    interests: z.array(z.string().min(1)).min(2),
                    lookalikes: z.array(z.string().min(1)).min(1),
                    exclusions: z.array(z.string().min(1)).min(1),
                  })
                  .strict(),
                placements: z.array(z.string().min(1)).min(3),
              })
              .strict(),
          )
          .min(1),
        ads: z
          .array(
            z
              .object({
                name: z.string().min(1),
                primary_text: z.string().min(1),
                headline: z.string().min(1),
                description: z.string().min(1),
                cta: z.string().min(1),
                format: z.string().min(1),
                creative_notes: z.string().min(1),
              })
              .strict(),
          )
          .min(1),
        tracking: z
          .object({
            pixel: z.string().min(1),
            conversion_api: z.string().min(1),
            utm_template: z.string().min(1),
          })
          .strict(),
      })
      .strict(),
    execution_checklist: z.array(z.string().min(1)).min(5),
    long_form: z.string().min(800),
  })
  .strict();

export const AD_IMAGE_SPEC_JSON_SCHEMA = {
  name: "ad_image_spec_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "version",
      "platform",
      "format",
      "style",
      "scene",
      "text_safe_area",
      "brand_safety",
      "negative_prompt",
    ],
    properties: {
      version: { type: "string", enum: ["1.0"] },
      platform: { type: "string", enum: ["meta", "tiktok", "youtube_shorts", "linkedin"] },
      format: { type: "string", enum: ["1:1", "4:5", "9:16"] },
      style: {
        type: "object",
        additionalProperties: false,
        required: ["mood", "lighting", "palette", "camera", "render_style", "realism_level"],
        properties: {
          mood: { type: "string", minLength: 1 },
          lighting: { type: "string", minLength: 1 },
          palette: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          camera: { type: "string", minLength: 1 },
          render_style: { type: "string", minLength: 1 },
          realism_level: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
      scene: {
        type: "object",
        additionalProperties: false,
        required: ["subject", "environment", "composition", "props", "wardrobe"],
        properties: {
          subject: { type: "string", minLength: 1 },
          environment: { type: "string", minLength: 1 },
          composition: { type: "string", minLength: 1 },
          props: { type: "array", items: { type: "string", minLength: 1 }, default: [] },
          wardrobe: { type: "array", items: { type: "string", minLength: 1 }, default: [] },
        },
      },
      text_safe_area: {
        type: "object",
        additionalProperties: false,
        required: ["position", "margin", "notes"],
        properties: {
          position: {
            type: "string",
            enum: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
          },
          margin: { type: "string", enum: ["tight", "normal", "wide"] },
          notes: { type: "string", minLength: 1 },
        },
      },
      brand_safety: {
        type: "object",
        additionalProperties: false,
        required: ["avoid_claims", "notes"],
        properties: {
          avoid_claims: { type: "array", items: { type: "string", minLength: 1 }, default: [] },
          notes: { type: "string", minLength: 1 },
        },
      },
      negative_prompt: { type: "array", items: { type: "string", minLength: 1 }, minItems: 4 },
    },
  },
};

export const CREATIVE_OUTPUT_PRO_JSON_SCHEMA = {
  name: "creative_output_pro_v2",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "schema_version",
      "job",
      "brand",
      "product",
      "audience",
      "offer",
      "strategy",
      "variants",
      "winner_selection",
      "brief",
    ],
    properties: {
      schema_version: { type: "string", enum: ["2.1-pro"] },
      job: {
        type: "object",
        additionalProperties: false,
        required: ["id", "style_mode", "platforms", "formats", "language"],
        properties: {
          id: { type: "string", minLength: 1 },
          style_mode: { type: "string", minLength: 1 },
          platforms: { type: "array", minItems: 1, items: { type: "string" } },
          formats: { type: "array", minItems: 1, items: { type: "string" } },
          language: { type: "string", minLength: 2 },
        },
      },
      brand: {
        type: "object",
        additionalProperties: false,
        required: ["name"],
        properties: { name: { type: "string", minLength: 1 } },
      },
      product: {
        type: "object",
        additionalProperties: false,
        required: ["name", "url", "category"],
        properties: {
          name: { type: "string", minLength: 1 },
          url: { type: ["string", "null"] },
          category: { type: ["string", "null"] },
        },
      },
      audience: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "segments"],
        properties: {
          summary: { type: "string", minLength: 1 },
          segments: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
        },
      },
      offer: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "constraints"],
        properties: {
          summary: { type: ["string", "null"] },
          constraints: { type: "array", items: { type: "string", minLength: 1 } },
        },
      },
      strategy: {
        type: "object",
        additionalProperties: false,
        required: ["id", "blueprint"],
        properties: {
          id: { type: ["string", "null"] },
          blueprint: { type: ["string", "null"] },
        },
      },
      variants: {
        type: "array",
        minItems: 6,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "platform", "format", "copy", "visual", "quality", "experiment"],
          properties: {
            id: { type: "string", minLength: 1 },
            platform: { type: "string", minLength: 1 },
            format: { type: "string", minLength: 1 },
            copy: {
              type: "object",
              additionalProperties: false,
              required: ["hook", "primary_text", "bullets", "cta", "alt_hooks", "on_screen_text"],
              properties: {
                hook: { type: "string", minLength: 1 },
                primary_text: { type: "string", minLength: 1 },
                bullets: { type: "array", items: { type: "string", minLength: 1 } },
                cta: { type: "string", minLength: 1 },
                alt_hooks: { type: "array", items: { type: "string", minLength: 1 } },
                on_screen_text: { type: "array", items: { type: "string", minLength: 1 } },
              },
            },
            visual: {
              type: "object",
              additionalProperties: false,
              required: ["image_spec", "image"],
              properties: {
                image_spec: { type: ["object", "null"] },
                image: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "input_image_used",
                    "render_intent",
                    "hero_image_url",
                    "final_image_url",
                    "width",
                    "height",
                    "model",
                    "seed",
                    "prompt_hash",
                    "render_version",
                  ],
                  properties: {
                    input_image_used: { type: "boolean" },
                    render_intent: { type: "string", minLength: 1 },
                    hero_image_url: { type: ["string", "null"] },
                    final_image_url: { type: ["string", "null"] },
                    width: { type: ["integer", "null"] },
                    height: { type: ["integer", "null"] },
                    model: { type: ["string", "null"] },
                    seed: { type: ["integer", "null"] },
                    prompt_hash: { type: ["string", "null"] },
                    render_version: { type: ["string", "null"] },
                  },
                },
              },
            },
            quality: {
              type: "object",
              additionalProperties: false,
              required: ["scores", "total", "ko", "issues"],
              properties: {
                scores: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "hookPower",
                    "clarity",
                    "proof",
                    "offer",
                    "platformFit",
                    "objectionHandling",
                    "novelty",
                    "visualThumbStop",
                  ],
                  properties: {
                    hookPower: { type: "integer", minimum: 0, maximum: 5 },
                    clarity: { type: "integer", minimum: 0, maximum: 5 },
                    proof: { type: "integer", minimum: 0, maximum: 5 },
                    offer: { type: "integer", minimum: 0, maximum: 5 },
                    platformFit: { type: "integer", minimum: 0, maximum: 5 },
                    objectionHandling: { type: "integer", minimum: 0, maximum: 5 },
                    novelty: { type: "integer", minimum: 0, maximum: 5 },
                    visualThumbStop: { type: "integer", minimum: 0, maximum: 5 },
                  },
                },
                total: { type: "integer", minimum: 0, maximum: 100 },
                ko: {
                  type: "object",
                  additionalProperties: false,
                  required: ["complianceFail", "genericBuzzwordFail"],
                  properties: {
                    complianceFail: { type: "boolean" },
                    genericBuzzwordFail: { type: "boolean" },
                  },
                },
                issues: { type: "array", items: { type: "string", minLength: 1 } },
              },
            },
            experiment: {
              type: "object",
              additionalProperties: false,
              required: ["ab_tests"],
              properties: {
                ab_tests: { type: "array", items: { type: "string", minLength: 1 } },
              },
            },
          },
        },
      },
      winner_selection: {
        type: "object",
        additionalProperties: false,
        required: ["recommended_winner_id", "rationale", "scores"],
        properties: {
          recommended_winner_id: { type: "string", minLength: 1 },
          rationale: { type: "string", minLength: 1 },
          scores: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "total"],
              properties: {
                id: { type: "string", minLength: 1 },
                total: { type: "integer", minimum: 0, maximum: 100 },
              },
            },
          },
        },
      },
      brief: { type: "object", additionalProperties: true },
    },
  },
};

export const STRATEGY_PLAN_JSON_SCHEMA = {
  name: "strategy_plan_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "schema_version",
      "name",
      "summary",
      "confidence",
      "recommendations",
      "blueprint",
      "product_focus",
      "audience",
      "messaging",
      "creative_system",
      "funnel",
      "testing_plan",
      "budget",
      "targeting",
      "meta_setup",
      "execution_checklist",
      "long_form",
    ],
    properties: {
      schema_version: { type: "string", enum: ["1.0"] },
      name: { type: "string", minLength: 1 },
      summary: { type: "string", minLength: 1 },
      confidence: { type: "integer", minimum: 0, maximum: 100 },
      recommendations: {
        type: "array",
        minItems: 6,
        items: { type: "string", minLength: 1 },
      },
      blueprint: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title"],
        properties: {
          id: { type: ["string", "null"] },
          title: { type: ["string", "null"] },
        },
      },
      product_focus: {
        type: "object",
        additionalProperties: false,
        required: [
          "positioning",
          "usp",
          "offer",
          "proof_points",
          "objections",
          "voice",
          "value_props",
        ],
        properties: {
          positioning: { type: "string", minLength: 1 },
          usp: { type: "string", minLength: 1 },
          offer: { type: "string", minLength: 1 },
          proof_points: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          objections: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          voice: { type: "string", minLength: 1 },
          value_props: { type: "array", minItems: 4, items: { type: "string", minLength: 1 } },
        },
      },
      audience: {
        type: "object",
        additionalProperties: false,
        required: ["core", "segments", "pains", "desires", "objections", "language", "region"],
        properties: {
          core: { type: "string", minLength: 1 },
          segments: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          pains: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          desires: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          objections: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          language: { type: "string", minLength: 2 },
          region: { type: ["string", "null"] },
        },
      },
      messaging: {
        type: "object",
        additionalProperties: false,
        required: ["key_messages", "angles", "hooks", "cta_guidance", "compliance_notes"],
        properties: {
          key_messages: { type: "array", minItems: 5, items: { type: "string", minLength: 1 } },
          angles: { type: "array", minItems: 5, items: { type: "string", minLength: 1 } },
          hooks: { type: "array", minItems: 7, items: { type: "string", minLength: 1 } },
          cta_guidance: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          compliance_notes: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
        },
      },
      creative_system: {
        type: "object",
        additionalProperties: false,
        required: ["formats", "visual_style", "ad_examples"],
        properties: {
          formats: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
          visual_style: {
            type: "object",
            additionalProperties: false,
            required: ["mood", "palette", "photography_style", "do", "dont"],
            properties: {
              mood: { type: "string", minLength: 1 },
              palette: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
              photography_style: { type: "string", minLength: 1 },
              do: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
              dont: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
            },
          },
          ad_examples: {
            type: "array",
            minItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["hook", "primary_text", "cta", "render_intent"],
              properties: {
                hook: { type: "string", minLength: 1 },
                primary_text: { type: "string", minLength: 1 },
                cta: { type: "string", minLength: 1 },
                render_intent: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
      funnel: {
        type: "object",
        additionalProperties: false,
        required: ["stages"],
        properties: {
          stages: {
            type: "array",
            minItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["stage", "goal", "message", "kpi"],
              properties: {
                stage: { type: "string", minLength: 1 },
                goal: { type: "string", minLength: 1 },
                message: { type: "string", minLength: 1 },
                kpi: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
      testing_plan: {
        type: "object",
        additionalProperties: false,
        required: ["hypotheses", "experiments", "timeline", "success_metrics"],
        properties: {
          hypotheses: { type: "array", minItems: 4, items: { type: "string", minLength: 1 } },
          experiments: { type: "array", minItems: 4, items: { type: "string", minLength: 1 } },
          timeline: { type: "string", minLength: 1 },
          success_metrics: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
        },
      },
      budget: {
        type: "object",
        additionalProperties: false,
        required: ["daily", "monthly", "scaling", "allocation", "guardrails"],
        properties: {
          daily: { type: "string", minLength: 1 },
          monthly: { type: "string", minLength: 1 },
          scaling: { type: "string", minLength: 1 },
          allocation: {
            type: "object",
            additionalProperties: false,
            required: ["testing", "scaling"],
            properties: {
              testing: { type: "integer", minimum: 0, maximum: 100 },
              scaling: { type: "integer", minimum: 0, maximum: 100 },
            },
          },
          guardrails: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
        },
      },
      targeting: {
        type: "object",
        additionalProperties: false,
        required: [
          "age",
          "gender",
          "locations",
          "interests",
          "behaviors",
          "lookalikes",
          "exclusions",
          "placements",
        ],
        properties: {
          age: { type: "string", minLength: 1 },
          gender: { type: "string", minLength: 1 },
          locations: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          interests: { type: "array", minItems: 5, items: { type: "string", minLength: 1 } },
          behaviors: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
          lookalikes: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          exclusions: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          placements: { type: "array", minItems: 5, items: { type: "string", minLength: 1 } },
        },
      },
      meta_setup: {
        type: "object",
        additionalProperties: false,
        required: ["campaign", "ad_sets", "ads", "tracking"],
        properties: {
          campaign: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "objective",
              "budget_type",
              "daily_budget",
              "bid_strategy",
              "optimization_goal",
              "attribution",
              "special_ad_categories",
            ],
            properties: {
              name: { type: "string", minLength: 1 },
              objective: { type: "string", minLength: 1 },
              budget_type: { type: "string", minLength: 1 },
              daily_budget: { type: "string", minLength: 1 },
              bid_strategy: { type: "string", minLength: 1 },
              optimization_goal: { type: "string", minLength: 1 },
              attribution: { type: "string", minLength: 1 },
              special_ad_categories: {
                type: "array",
                minItems: 1,
                items: { type: "string", minLength: 1 },
              },
            },
          },
          ad_sets: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "budget",
                "schedule",
                "optimization_goal",
                "audience",
                "placements",
              ],
              properties: {
                name: { type: "string", minLength: 1 },
                budget: { type: "string", minLength: 1 },
                schedule: { type: "string", minLength: 1 },
                optimization_goal: { type: "string", minLength: 1 },
                audience: {
                  type: "object",
                  additionalProperties: false,
                  required: ["locations", "age", "gender", "interests", "lookalikes", "exclusions"],
                  properties: {
                    locations: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
                    age: { type: "string", minLength: 1 },
                    gender: { type: "string", minLength: 1 },
                    interests: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
                    lookalikes: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
                    exclusions: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
                  },
                },
                placements: { type: "array", minItems: 3, items: { type: "string", minLength: 1 } },
              },
            },
          },
          ads: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "primary_text", "headline", "description", "cta", "format", "creative_notes"],
              properties: {
                name: { type: "string", minLength: 1 },
                primary_text: { type: "string", minLength: 1 },
                headline: { type: "string", minLength: 1 },
                description: { type: "string", minLength: 1 },
                cta: { type: "string", minLength: 1 },
                format: { type: "string", minLength: 1 },
                creative_notes: { type: "string", minLength: 1 },
              },
            },
          },
          tracking: {
            type: "object",
            additionalProperties: false,
            required: ["pixel", "conversion_api", "utm_template"],
            properties: {
              pixel: { type: "string", minLength: 1 },
              conversion_api: { type: "string", minLength: 1 },
              utm_template: { type: "string", minLength: 1 },
            },
          },
        },
      },
      execution_checklist: { type: "array", minItems: 8, items: { type: "string", minLength: 1 } },
      long_form: { type: "string", minLength: 800 },
    },
  },
};
