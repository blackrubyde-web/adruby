
export const BLUEPRINTS = [
    {
        id: "native_ugc",
        label: "Native UGC",
        description: "Authentic, 'shot on phone' look. Best for building trust.",
        best_for: ["cold", "retargeting", "service", "d2c"],
        visual: {
            intent: "Photo of product in real life setting, slightly imperfect lighting to look like User Generated Content (UGC). Shot on iPhone.",
            negative_prompt: ["text", "studio lighting", "professional", "bokeh", "blur"],
        },
        copy_structure: "Hook (Pattern Interrupt) -> Relatable Problem -> Product as Solution -> Soft CTA",
        on_screen_text_guidance: "Minimal or none. Maybe a simple 'Review' star sticker."
    },
    {
        id: "headline_hero",
        label: "Headline Hero",
        description: "High quality product shot with clear negative space for a headline.",
        best_for: ["awareness", "branding", "launch"],
        visual: {
            intent: "Cinematic product shot, 40% negative space at top or bottom specifically for text overlay. High contrast.",
            negative_prompt: ["text", "cluttered", "busy"],
        },
        copy_structure: "Hook (Big Benefit) -> Feature -> Proof -> Direct CTA",
        on_screen_text_guidance: "Short punchy headline in the negative space. e.g. '50% OFF'."
    },
    {
        id: "split_problem_solution",
        label: "Split Problem/Solution",
        description: "Visual contrast between problem and solution idea.",
        best_for: ["problem_aware", "cold"],
        visual: {
            intent: "Split composition. One side moody/darker (representing the problem), other side bright/clean (representing solution with product).",
            negative_prompt: ["text"],
        },
        copy_structure: "Hook (Question) -> Agitate Problem -> Introduce Solution -> CTA",
        on_screen_text_guidance: "Labels like 'Before / After' or 'Others / Us'."
    }
];

export function selectBlueprint(brief) {
    // Basic logic to pick a blueprint. 
    // In the future, this could be an LLM call or more complex logic.
    const funnel = brief.funnel_stage || "cold";

    if (funnel === "cold") {
        // Randomize between problem/solution and headline hero for cold traffic
        return Math.random() > 0.5 ? BLUEPRINTS[2] : BLUEPRINTS[1];
    }

    if (funnel === "retargeting" || funnel === "hot") {
        return BLUEPRINTS[0]; // UGC works well for retargeting
    }

    // Default random
    return BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)];
}
