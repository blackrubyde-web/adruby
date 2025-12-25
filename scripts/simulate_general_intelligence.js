
import OpenAI from "openai";

// --- MOCKED LOGIC (Using the new Prompt Strategy we just added) ---
function buildPremiumDirectivePrompt({ brief, creative, blueprint, imageUrl }) {
    // Simplified template list representing different styles
    const templatesBrief = [
        { id: "P20_B_DROP_VIRAL_COMPOSED", name: "Tech Feature (Dark)", bindings: ["FEATURE", "PRODUCT_IMG"] },
        { id: "P09_TRAVEL_IMMERSIVE", name: "Travel Vista", bindings: ["DESTINATION"] },
        { id: "P07_FASHION_ZINE", name: "Fashion Editorial", bindings: ["COLLECTION"] }
    ];

    const inputImageInstruction = imageUrl
        ? `IMPORTANT: The user has provided/generated a specific image asset: "${imageUrl}"
    
    *** SMART IMAGE ANALYSIS ***
    You must decide how best to utilize this image based on the industry and template style:
    
    STRATEGY A: FULL BACKGROUND (Best for Real Estate, Travel, Interior Design)
    - Use image as background. Set 'fit': 'cover'.
    
    STRATEGY B: CONTAINED PRODUCT (Best for Fashion, Art)
    - Use image in frame. Set 'fit': 'cover'.
    
    STRATEGY C: SMART CUTOUT / EXTRACTION (Best for Gadgets, Tech, E-Com)
    - Add { "type": "remove_background" } to effects.
    
    DECISION LOGIC:
    - Tech/Gadgets -> STRATEGY C
    - Fashion -> STRATEGY B
    - Travel/RealEstate -> STRATEGY A
    `
        : "No image provided.";

    return `
You are a generalized Ad Architect.
BRIEF INDUSTRY: ${brief.industry.join(", ")}
PRODUCT: ${brief.product.name}
INPUT IMAGE: ${imageUrl}

${inputImageInstruction}

TASK: Return a JSON with:
1. "selectedStrategy": "A" | "B" | "C"
2. "reasoning": "Why you chose this."
3. "imageLayerConfig": The JSON object for the image layer, including effects if needed.
`;
}

// Mock OpenAI Response Behavior based on prompt content
async function mockOpenAiResponse(prompt, brief) {
    // This is a "Smart Mock" that simulates what GPT-4 WOULD do given the instructions.
    // We parse the prompt string to see what industry was passed.

    let strategy = "A";
    let effects = [];
    let reason = "Default";

    // We look for the CONTEXT line at the end to determine the active industry
    const contextLine = prompt.split("CONTEXT:")[1] || "";

    if (contextLine.includes("gadgets") || contextLine.includes("Gaming")) {
        strategy = "C";
        effects = [{ type: "remove_background" }];
        reason = "Gadgets require extraction.";
    } else if (contextLine.includes("Fashion")) {
        strategy = "B";
        reason = "Fashion looks best contained/editorial.";
    } else if (contextLine.includes("Travel")) {
        strategy = "A";
        reason = "Travel needs immersive full background.";
    }

    // Safety Check Simulation
    if (brief.quality === "low") {
        strategy = "D";
        reason = "Detected low quality input. Engaging Safety Protocol (Blur Frame).";
    }

    return JSON.stringify({
        selectedStrategy: strategy,
        reasoning: reason,
        imageLayerConfig: {
            type: "image",
            src: "INPUT_URL",
            effects: effects
        }
    }, null, 2);
}

async function runTest(scenarioName, brief) {
    console.log(`\n🧪 TEST SCENARIO: ${scenarioName}`);
    console.log(`   Industry: ${brief.industry}`);
    console.log(`   Product: ${brief.product.name}`);

    const prompt = buildPremiumDirectivePrompt({
        brief,
        creative: {},
        blueprint: {},
        imageUrl: "http://img.com/source.jpg"
    });

    // We pass the prompt to our smart mock to see if the LOGIC holds
    const resultRaw = await mockOpenAiResponse(prompt + "\nCONTEXT: " + brief.industry.join(" "), brief);
    const result = JSON.parse(resultRaw);

    // --- THEME SIMULATION ---
    // Simulate what the AI would do: Select a Theme
    const themes = ["THEME_CYBER_NEON", "THEME_LUXURY_DARK", "THEME_ORGANIC_FRESH"];
    let selectedTheme = "THEME_MODERN_MINIMAL";

    if (result.selectedStrategy === "C") selectedTheme = "THEME_CYBER_NEON";
    if (result.selectedStrategy === "A") selectedTheme = "THEME_LUXURY_DARK";
    if (result.selectedStrategy === "B") selectedTheme = "THEME_GEN_Z_POP";

    console.log(`   👉 DECISION: Strategy ${result.selectedStrategy}`);
    console.log(`   👉 REASON: ${result.reasoning}`);
    console.log(`   🎨 THEME APPLIED: ${selectedTheme}`); // New Output
    const hasCutout = result.imageLayerConfig.effects?.some(e => e.type === "remove_background");
    console.log(`   👉 HAS CUTOUT: ${hasCutout ? "YES ✅" : "NO ❌"}`);
}

async function run() {
    await runTest("GADGET", { industry: ["gadgets", "Gaming"], product: { name: "CyberMouse" } });
    await runTest("TRAVEL", { industry: ["Travel", "Hospitality"], product: { name: "Bali Resort" } });
    await runTest("FASHION", { industry: ["Fashion", "Apparel"], product: { name: "Summer Dress" } });
    await runTest("AMATEUR UPLOAD", { industry: ["local_biz"], product: { name: "My Pizza" }, quality: "low" });
}

run();
