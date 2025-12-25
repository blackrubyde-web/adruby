
// src/app/types/studio.ts

export type AdFormat = "1:1" | "4:5" | "9:16" | "300x250" | "728x90";

export type LayerType =
    | "background"
    | "product"
    | "overlay"
    | "text"
    | "cta"
    | "logo"
    | "shape"; // Added shape

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
    zIndex?: number; // Optional
    ai?: AiProvenance;
};

export type ImageLayer = LayerBase & {
    type: "background" | "product" | "overlay" | "logo" | "image"; // Added image
    src: string;              // url
    fit?: "cover" | "contain"; // Optional
    maskRadius?: number;      // for pill masks etc.
    tint?: string;            // hex color for style adaptation
};

export type TextLayer = LayerBase & {
    type: "text";
    text: string;
    fontFamily: "Inter" | "Roboto" | "System" | "Playfair Display" | "Montserrat" | "Oswald" | "Pacifico" | "Outfit" | string;
    fontWeight: 400 | 500 | 600 | 700 | 800 | 900 | string; // Allow string for flexibility
    fontSize: number;
    fontStyle?: "normal" | "italic";
    lineHeight?: number;
    letterSpacing?: number;
    fill: string;            // hex or token (renamed from color to match Konva/common usage if needed, or keep color) - Adapter code uses fill
    color?: string;          // Compatibility alias
    textAlign?: "left" | "center" | "right"; // Renamed from align
    align?: "left" | "center" | "right"; // Compatibility alias
    maxChars?: number;

    // Shadow Props
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
};

export type ShapeLayer = LayerBase & {
    type: "shape";
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
}

export type CtaLayer = LayerBase & {
    type: "cta";
    text: string;
    fontFamily: "Inter" | "Roboto" | "System" | "Playfair Display" | string;
    fontSize: number;
    fontWeight: number;
    fontStyle?: "normal" | "italic";
    lineHeight: number;
    letterSpacing?: number;
    color: string;

    // Shadow Props
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;

    // Button specific
    bgColor?: string;
    borderColor?: string;
    borderWidth?: number;
    radius?: number;
    paddingX?: number;
    paddingY?: number;
};

export type StudioLayer = ImageLayer | TextLayer | CtaLayer | ShapeLayer;

export type BrandKit = {
    id: string;
    name: string;
    colors: { primary: string; secondary: string; accent: string;[key: string]: string };
    fonts: { heading: string; body: string;[key: string]: string };
    logo: string;
};

export type AdDocument = {
    id: string;
    name: string;
    format?: AdFormat; // Optional
    width: number;
    height: number;
    safeArea?: { top: number; right: number; bottom: number; left: number }; // Optional
    backgroundColor: string;
    layers: StudioLayer[];
    meta?: { // Optional
        goal: "conversion" | "awareness" | "launch";
        contextPreset?: "gaming_desk" | "bedroom" | "studio" | "lifestyle";
        mood?: "cozy_warm" | "clean_neutral" | "dramatic" | "bright";
        benefitFocus?: "atmosphere" | "function" | "design" | "gift";
        textInImage?: "none" | "minimal" | "custom";
    };
};
