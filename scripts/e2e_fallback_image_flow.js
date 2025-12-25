
import pkgOpenAi from "../netlify/functions/_shared/openai.js";
const { generateHeroImage } = pkgOpenAi;
import pkgPrompts from "../netlify/functions/_shared/creativePrompts.js";
const { buildPremiumDirectivePrompt } = pkgPrompts;

async function verify() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log("No API Key, skipping network part of test");
    }

    // 1. Verify Prompt Logic (no network needed)
    console.log("TEST 1: Prompt Injection");
    const brief = { industry: "dropshipping" };
    const creative = { copy: { hook: "H", primary_text: "T", cta: "C" } };
    const blueprint = { label: "Test", visual: { intent: "intent" } };
    const imageUrl = "https://example.com/my-fox.png";

    const prompt = buildPremiumDirectivePrompt({ brief, creative, blueprint, imageUrl });

    if (prompt.includes(imageUrl) && prompt.includes("PRODUCT_IMG")) {
        console.log("✅ Passed: Image URL is correctly injected into instructions.");
    } else {
        console.error("❌ Failed: Image URL missing from prompt.");
    }

    // 2. Verify Fallback (Network needed)
    if (apiKey) {
        console.log("\nTEST 2: Network Fallback");
        // We will call the internal generateHeroImage with a fake model to force fallback
        // WARNING: This assumes generateHeroImage reads env vars. 
        // We'll mock the internal call by setting the env var in this process.
        process.env.CREATIVE_IMAGE_MODEL = "gpt-image-fake-999";

        try {
            // This should fail on primary, then retry with dall-e-3
            console.log("Attempting generation with 'gpt-image-fake-999'...");
            const res = await generateHeroImage({
                prompt: "A simple red cube on white background",
                size: "1024x1024"
            });

            if (res.model === "dall-e-3") {
                console.log("✅ Passed: Fallback to dall-e-3 triggered successfully.");
                console.log("Result URL len:", (res.b64 || "").length);
            } else {
                console.error("❌ Failed: Model used was " + res.model);
            }

        } catch (e) {
            console.error("❌ Failed with error:", e.message);
        }
    }
}

verify();
