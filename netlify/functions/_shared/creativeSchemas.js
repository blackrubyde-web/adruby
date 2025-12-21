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
                hero_image_url: z.string().min(1).optional(),
                final_image_url: z.string().min(1).optional(),
                width: z.number().int().optional(),
                height: z.number().int().optional(),
                model: z.string().min(1).optional(),
                seed: z.number().int().optional(),
                prompt_hash: z.string().min(6).optional(),
                render_version: z.string().min(1).optional(),
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
        wardrobe: z.array(z.string().min(1)).max(6).optional(),
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
      hero_image_url: z.string().min(1).optional(),
      final_image_url: z.string().min(1).optional(),
      width: z.number().int().optional(),
      height: z.number().int().optional(),
      model: z.string().min(1).optional(),
      seed: z.number().int().optional(),
      prompt_hash: z.string().min(6).optional(),
      render_version: z.string().min(1).optional(),
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
