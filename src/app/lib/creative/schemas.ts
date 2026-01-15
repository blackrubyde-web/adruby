import { z } from "zod";

export const GoalEnum = z.enum(["sales", "leads", "traffic", "app_installs"]);
export const FunnelEnum = z.enum(["cold", "warm", "hot"]);
export const LangEnum = z.enum(["de", "en"]);
export const FormatEnum = z.enum(["1:1", "4:5", "9:16"]);
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
      url: z.string().nullable(),
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
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          why_it_fits: z.string().min(1),
        }),
      )
      .min(2),
    risk_flags: z
      .array(
        z.object({
          type: z.string().min(1),
          severity: z.enum(["low", "medium", "high"]),
          note: z.string().min(1),
        }),
      )
      .default([]),
  })
  .strict();

export type NormalizedBrief = z.infer<typeof NormalizedBriefSchema>;

export const CreativeOutputV1Schema = z
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
            copy: z.object({
              hook: z.string().min(1).max(80),
              primary_text: z.string().min(1).max(700),
              cta: z.string().min(1).max(30),
              bullets: z.array(z.string().min(1).max(90)).max(6).default([]),
            }),
            score: z.object({
              value: z.number().int().min(0).max(100),
              rationale: z.string().min(1).max(240),
            }),
            image: z.object({
              input_image_used: z.boolean(),
              render_intent: z.string().min(1).max(200),
              input_image_url: z.string().min(1).nullable().optional(),
              input_image_bucket: z.string().min(1).nullable().optional(),
              input_image_path: z.string().min(1).nullable().optional(),
              hero_image_url: z.string().min(1).nullable().optional(),
              hero_image_bucket: z.string().min(1).nullable().optional(),
              hero_image_path: z.string().min(1).nullable().optional(),
              final_image_url: z.string().min(1).nullable().optional(),
              final_image_bucket: z.string().min(1).nullable().optional(),
              final_image_path: z.string().min(1).nullable().optional(),
              width: z.number().int().nullable().optional(),
              height: z.number().int().nullable().optional(),
              model: z.string().min(1).nullable().optional(),
              seed: z.number().int().nullable().optional(),
              prompt_hash: z.string().min(6).nullable().optional(),
              render_version: z.string().min(1).nullable().optional(),
              error: z.string().nullable().optional(),
            }),
          })
          .strict(),
      )
      .min(2)
      .max(8),
  })
  .strict();

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
    issues: z.array(z.string()).default([]),
  })
  .strict();

export const CreativeVariantProSchema = z
  .object({
    id: z.string().min(1),
    platform: z.enum(["meta", "tiktok", "youtube_shorts", "linkedin"]).default("meta"),
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
        image_spec: z.unknown().nullable().optional(),
        image: z
          .object({
            input_image_used: z.boolean(),
            render_intent: z.string().min(1).max(200),
            hero_image_url: z.string().nullable(),
            hero_image_bucket: z.string().nullable().optional(),
            hero_image_path: z.string().nullable().optional(),
            final_image_url: z.string().nullable(),
            final_image_bucket: z.string().nullable().optional(),
            final_image_path: z.string().nullable().optional(),
            width: z.number().int().nullable(),
            height: z.number().int().nullable(),
            model: z.string().nullable(),
            seed: z.number().int().nullable(),
            prompt_hash: z.string().nullable(),
            render_version: z.string().nullable(),
            error: z.string().nullable().optional(),
          })
          .strict(),
      })
      .strict(),
    quality: QualityEvalProSchema,
    experiment: z
      .object({
        ab_tests: z.array(z.string()).default([]),
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
        platforms: z.array(z.string()).min(1),
        formats: z.array(z.string()).min(1),
        language: z.string().min(2),
      })
      .strict(),
    brand: z.object({ name: z.string().min(1) }).strict(),
    product: z
      .object({
        name: z.string().min(1),
        url: z.string().nullable(),
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
        constraints: z.array(z.string()).default([]),
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

export const CreativeOutputV2Schema = z
  .object({
    schema_version: z.literal("2.0"),
    style_mode: z.string().min(1),
    variants: z.array(z.unknown()).min(1),
  })
  .passthrough();

export const CreativeOutputSchema = z.union([
  CreativeOutputV1Schema,
  CreativeOutputProSchema,
  CreativeOutputV2Schema,
]);

export type CreativeOutput = z.infer<typeof CreativeOutputSchema>;
export type CreativeOutputV1 = z.infer<typeof CreativeOutputV1Schema>;
export type CreativeOutputPro = z.infer<typeof CreativeOutputProSchema>;
export type CreativeOutputV2 = z.infer<typeof CreativeOutputV2Schema>;
export type CreativeV2Variant = z.infer<typeof CreativeVariantProSchema>;
