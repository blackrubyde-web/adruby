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
            }),
          })
          .strict(),
      )
      .min(2)
      .max(8),
  })
  .strict();

export type CreativeOutput = z.infer<typeof CreativeOutputSchema>;

