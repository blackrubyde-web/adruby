
// creativeThemes.js - The "Skin" for our Ad Templates
// These tokens overlay the structural templates to create infinite variations.

export const PREMIUM_THEMES = [
    {
        id: "THEME_MODERN_MINIMAL",
        name: "Modern Minimal (SaaS / Tech)",
        tags: ["clean", "tech", "saas", "corporate"],
        tokens: {
            colors: { bg: "#FFFFFF", surface: "#F3F4F6", text: "#111827", muted: "#6B7280", accent: "#2563EB", border: "#E5E7EB" },
            radius: { card: 12, button: 8, pill: 99 },
            type: { fontFamily: "Inter", h1: { weight: 800, tracking: -0.05 }, body: { weight: 400 } },
            shadow: { card: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", button: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }
        }
    },
    {
        id: "THEME_LUXURY_DARK",
        name: "Luxury Dark (High-End / Fashion)",
        tags: ["luxury", "fashion", "jewelry", "automotive"],
        tokens: {
            colors: { bg: "#0F0F0F", surface: "#1A1A1A", text: "#FFFFFF", muted: "#A3A3A3", accent: "#D4AF37", border: "#333333" },
            radius: { card: 0, button: 0, pill: 0 },
            type: { fontFamily: "Playfair Display", h1: { weight: 400, tracking: 0.05 }, body: { weight: 300 } },
            shadow: { card: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", button: "none" }
        }
    },
    {
        id: "THEME_CYBER_NEON",
        name: "Cyber Neon (Gaming / Gadgets)",
        tags: ["gaming", "crypto", "gadgets", "energy"],
        tokens: {
            colors: { bg: "#050510", surface: "rgba(255, 0, 255, 0.05)", text: "#FFFFFF", muted: "#94A3B8", accent: "#00FF99", border: "#BD00FF" },
            radius: { card: 4, button: 2, pill: 4 },
            type: { fontFamily: "Orbitron", h1: { weight: 900, tracking: 0.1 }, body: { weight: 500 } },
            shadow: { card: "0 0 20px rgba(189, 0, 255, 0.3)", button: "0 0 15px rgba(0, 255, 153, 0.6)" }
        }
    },
    {
        id: "THEME_ORGANIC_FRESH",
        name: "Organic Fresh (Food / Eco)",
        tags: ["food", "eco", "health", "beauty"],
        tokens: {
            colors: { bg: "#FFFBEB", surface: "#FFFFFF", text: "#422006", muted: "#92400E", accent: "#84CC16", border: "#FEF3C7" },
            radius: { card: 24, button: 99, pill: 99 },
            type: { fontFamily: "Outfit", h1: { weight: 800, tracking: -0.02 }, body: { weight: 500 } },
            shadow: { card: "0 10px 15px -3px rgba(132, 204, 22, 0.1)", button: "0 4px 6px -1px rgba(132, 204, 22, 0.2)" }
        }
    },
    {
        id: "THEME_GEN_Z_POP",
        name: "Gen Z Pop (Social / Apps)",
        tags: ["social", "app", "youth", "trends"],
        tokens: {
            colors: { bg: "#FFDEE9", surface: "#FFFFFF", text: "#000000", muted: "#4B5563", accent: "#FF0080", border: "#000000" },
            radius: { card: 20, button: 12, pill: 50 },
            type: { fontFamily: "Syne", h1: { weight: 800, tracking: -0.05 }, body: { weight: 700 } },
            shadow: { card: "8px 8px 0px #000000", button: "4px 4px 0px #000000" }
        }
    },
    {
        id: "THEME_BOLD_EDITORIAL",
        name: "Bold Editorial (News / Media)",
        tags: ["news", "media", "blog", "consulting"],
        tokens: {
            colors: { bg: "#F3F4F6", surface: "#FFFFFF", text: "#000000", muted: "#374151", accent: "#DC2626", border: "#000000" },
            radius: { card: 0, button: 0, pill: 0 },
            type: { fontFamily: "Anton", h1: { weight: 400, tracking: 0 }, body: { weight: 400 } },
            shadow: { card: "none", button: "none" }
        }
    }
];

export function selectThemeForIndustry(industry) {
    // Simple matching logic (can be upgraded to AI later)
    // ... implementation to follow ...
    // For now, this file is just the library definition.
}
