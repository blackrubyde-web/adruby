
import { z } from 'zod';
import { CreativeSpecSchema } from '../src/app/lib/ai/creative/types';

async function runStressTest() {
    console.log('🔥 Starting Zod Stress Test...');

    // 1. BEHAVIOR CHECK: What does Zod say for regex fail?
    try {
        console.log('Checking Zod regex error message format...');
        z.string().regex(/^abc$/).parse("def");
    } catch (e: any) {
        if (e instanceof z.ZodError) {
            console.log('Zod Regex Error Message:', e.errors[0].message);
            if (e.errors[0].message === "String did not match the expected pattern") {
                console.log('🚨 CONFIRMED: "String did not match..." IS the default Zod regex error here.');
            } else {
                console.log('ℹ️ Default message is:', e.errors[0].message);
            }
        }
    }

    // 2. FUZZ TEST CreativeSpecSchema
    const baseSpec = {
        productName: "Stress Test Product",
        businessModel: "ecommerce",
        niche: "Beauty",
        platform: "meta_feed",
        ratio: "4:5",
        language: "de", // min 2 max 5
        audience: {
            persona: "Mom",
            sophistication: "problem_aware",
            objections: []
        },
        angle: "pain_relief",
        creativePattern: "ecommerce_product_focus",
        copy: {
            headline: "Test Headline",
            subheadline: "Test Sub",
            cta: "Shop Now",
            body: "Test Body"
        },
        assets: {
            required: [
                { type: "productCutout", optional: false }
            ]
        },
        constraints: {
            maxChars: {
                headline: 50,
                cta: 20
            }
        },
        templateHints: {},
        style: {
            // TEST TARGET: Bad colors (should be filtered now)
            palette: ["#FFF", "rgb(0,0,0)", "invalid", "#FF0000"],
            textSafe: ["#000000"]
        }
    };

    console.log('\nRunning Schema Validation on dirty spec...');
    const result = CreativeSpecSchema.safeParse(baseSpec);

    if (result.success) {
        console.log('✅ Validation PASSED! (Dirty colors were filtered)');
        console.log('Result palette:', result.data.style?.palette);
        // 3. FETCH HEADER TEST (Hypothesis: Invalid API Key format)
        if (typeof fetch !== 'undefined') {
            console.log('\nTesting Fetch Header Validation...');
            try {
                await fetch('https://example.com', {
                    headers: {
                        'Authorization': 'Bearer sk-invalid\n' // Newline injection
                    }
                });
            } catch (e: any) {
                console.log('Fetch Error Message:', e.message);
                if (e.message.includes("did not match the expected pattern") || e.message.includes("Invalid character in header content")) {
                    console.log('🚨 REPRODUCTION CONFIRMED: Invalid Header triggered default validation error!');
                }
            }
        } else {
            console.log('Skipping fetch test (fetch not defined in this env)');
        }
    }
}

runStressTest();
