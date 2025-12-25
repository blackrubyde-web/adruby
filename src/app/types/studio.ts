
// src/app/types/studio.ts

export type AdFormat = "1:1" | "4:5" | "9:16" | "300x250" | "728x90";

export type LayerType =
    | "background"
    | "product"
    | "overlay"
    | "text"
    | "cta"
    | "logo";

export type AiProvenance = {
    provider: "adcreative" | "openai" | "other";
    task: "generate_background" | "cutout" | "relight" | "shadow" | "copy";
    prompt?: string;
    negativePrompt?: string;
    seed?: string;
    createdAt: string;
};

export type LayerBase = {
    id: string;
    type: LayerType;
    name: string;
    visible: boolean;
    locked: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    ai?: AiProvenance;
};

export type ImageLayer = LayerBase & {
    type: "background" | "product" | "overlay" | "logo";
    src: string;              // url
    fit: "cover" | "contain";
    maskRadius?: number;      // for pill masks etc.
};

export type TextLayer = LayerBase & {
    type: "text";
    text: string;
    fontFamily: "Inter" | "Roboto" | "System" | "Playfair Display" | "Montserrat" | "Oswald" | "Pacifico" | "Outfit" | string;
    fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
    fontSize: number;
    fontStyle?: "normal" | "italic";
    lineHeight: number;
    letterSpacing: number;
    color: string;            // hex or token
    align: "left" | "center" | "right";
    maxChars?: number;

    // Shadow Props
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
};

export type CtaLayer = LayerBase & {
    type: "cta";
    text: string;
    fontFamily: "Inter" | "Roboto" | "System" | "Playfair Display" | string; // Added Playfair and string
    fontSize: number;
    fontWeight: number;
    fontStyle?: "normal" | "italic"; // Added
    lineHeight: number;
    letterSpacing?: number; // Added
    color: string; // Text color

    // Shadow Props
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;

    // Button specific
    bgColor?: string; // Optional for text-only
    borderColor?: string;
    borderWidth?: number;
    radius?: number;
    paddingX?: number;
    paddingY?: number;
};

export type StudioLayer = ImageLayer | TextLayer | CtaLayer;

export type AdDocument = {
    id: string;
    name: string;
    format: AdFormat;
    width: number;
    height: number;
    safeArea: { top: number; right: number; bottom: number; left: number };
    backgroundColor: string;
    layers: StudioLayer[];
    meta: {
        goal: "conversion" | "awareness" | "launch";
        contextPreset?: "gaming_desk" | "bedroom" | "studio" | "lifestyle";
        mood?: "cozy_warm" | "clean_neutral" | "dramatic" | "bright";
        benefitFocus?: "atmosphere" | "function" | "design" | "gift";
        textInImage?: "none" | "minimal" | "custom";
    };
};
