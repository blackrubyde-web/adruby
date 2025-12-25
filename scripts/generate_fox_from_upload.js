
import OpenAI from "openai";
import pkg from "../netlify/functions/_shared/creativePrompts.js";
const { buildPremiumDirectivePrompt } = pkg;
import pkgSchemas from "../netlify/functions/_shared/creativeSchemas.js";
const { PremiumAdSchema } = pkgSchemas;
// We don't need parseWithRepair for this simple script, we can just use JSON.parse and trust the mocked AI for the demo
// import { parseWithRepair } from "../netlify/functions/_shared/repair.js";

// Mock callOpenAiJson function 
async function callOpenAiJson(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey });

    // We force the AI to return JSON
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview", // or whatever model is available
        messages: [{ role: "system", content: prompt + "\n\nRETURN JSON ONLY." }],
        response_format: { type: "json_object" }
    });
    return response.choices[0].message.content;
}

// Mock parseWithRepair basics if needed, or import real one (we imported real one above)
// But real one needs 'makeRequest' callback.

async function run() {
    console.log("🚀 Starting LED Fox Ad Generation (User Upload)...");

    // 1. Inputs
    const inputImagePath = "/Users/home/.gemini/antigravity/brain/c49f8301-5d0c-499f-8511-124d0f49b91d/uploaded_image_1766551526947.jpg";
    const brief = {
        industry: ["gaming", "decor"],
        product: { name: "LED Fox Lamp" },
        audience: { summary: "Gamers, Streamers, Minecraft fans" },
        offer: { summary: "50% OFF Limited Time" }
    };
    const creative = {
        copy: {
            hook: "Level Up Your Setup 🦊✨",
            primary_text: "The ultimate cozy companion for late night gaming sessions. Glows softly, looks pixel-perfect.",
            cta: "Shop Now"
        }
    };
    const blueprint = {
        label: "Viral Gadget",
        visual: { intent: "Show the product glowing in a dark room" },
        render_mode: "premium"
    };

    console.log("📸 Input Image:", inputImagePath);

    // 2. Build Prompt with Image Injection
    console.log("🔧 Building Premium Directive Prompt...");
    // Using file protocol for display purposes, in real app this would be a https url
    const imageUrlForDirective = "file://" + inputImagePath;

    const prompt = buildPremiumDirectivePrompt({
        brief,
        creative,
        blueprint,
        imageUrl: imageUrlForDirective
    });

    // 3. Generate JSON
    console.log("🧠 Sending to AI...");
    try {
        const jsonRaw = await callOpenAiJson(prompt);
        // Simplify repair for script
        const jsonParsed = JSON.parse(jsonRaw);

        console.log("\n✅ Generated Premium Ad Directive:");
        console.log(JSON.stringify(jsonParsed, null, 2));

        // Validation Step
        if (jsonParsed.resolvedValues && jsonParsed.resolvedValues.PRODUCT_IMG === imageUrlForDirective) {
            console.log("\n✨ SUCCESS: User image was correctly bound to PRODUCT_IMG.");
        } else {
            console.warn("\n⚠️ WARNING: PRODUCT_IMG does not match input. Got: " + jsonParsed.resolvedValues?.PRODUCT_IMG);
        }

    } catch (err) {
        console.error("❌ Generation Failed:", err);
    }
}

run();
