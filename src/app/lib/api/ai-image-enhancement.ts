/**
 * AI IMAGE ENHANCEMENT SERVICE
 * Premium-Level Image Processing using GPT-4 Vision + DALL-E 3
 * 
 * This is not your average image processor. This is PREMIUM.
 */

interface EnhancementRequest {
    imageBase64: string;
    userPrompt: string;
    productName: string;
    brandName?: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
}

interface EnhancementResult {
    enhancedImageUrl: string;
    analysisNotes: string;
}

/**
 * MASTER PROMPT SYSTEM
 * This prompt is engineered to extract MAXIMUM quality from GPT-4 Vision
 */
const generateVisionAnalysisPrompt = (req: EnhancementRequest): string => {
    return `You are an ELITE creative director and product photographer specializing in premium advertising visuals.

YOUR MISSION: Analyze this product image and create a MASTERCLASS DALL-E 3 prompt that will generate a magazine-quality, conversion-optimized advertisement background.

PRODUCT CONTEXT:
- Product: ${req.productName}
${req.brandName ? `- Brand: ${req.brandName}` : ''}
- Target Tone: ${req.tone}
- User Enhancement Request: "${req.userPrompt}"

ANALYSIS FRAMEWORK - Execute with SURGICAL PRECISION:

1. CURRENT IMAGE ANALYSIS:
   - Identify the product's key visual assets (shape, color, texture, unique features)
   - Analyze current lighting quality (harsh shadows? flat lighting? optimal?)
   - Detect background elements (cluttered? distracting? professional?)
   - Assess composition (rule of thirds? golden ratio? needs reframing?)
   - Note color palette and contrast levels

2. PREMIUM AD REQUIREMENTS:
   - Background: Must be STUNNING yet non-distracting (think Apple, Nike, luxury brands)
   - Lighting: Studio-grade with subtle depth and dimension
   - Color Grading: Cohesive palette that amplifies the product's appeal
   - Composition: Product hero placement with negative space mastery
   - Mood: Align with ${req.tone} tone while maintaining premium feel

3. TECHNICAL SPECIFICATIONS:
   - Resolution: Imply 4K-quality textures and sharp details
   - Lighting Setup: Describe specific light sources (key, fill, rim lights)
   - Post-Processing: Color grading style (matte, vibrant, cinematic)
   - Background Type: Based on tone - ${getToneBackgroundGuidance(req.tone)}

4. BRAND PSYCHOLOGY:
   - What emotions should this evoke? (desire, trust, excitement, exclusivity)
   - How do we position this product as PREMIUM and IRRESISTIBLE?

NOW, CREATE THE ULTIMATE DALL-E 3 PROMPT:

FORMAT YOUR RESPONSE AS:
{
  "dallePrompt": "Your meticulously crafted DALL-E 3 prompt here - be EXTREMELY detailed with lighting, materials, composition, mood. Reference high-end photography techniques. Think Annie Leibovitz meets Apple's ad team.",
  "analysisNotes": "Brief 2-3 sentence summary of your enhancement strategy"
}

CRITICAL REQUIREMENTS:
- NO generic stock photo vibes
- NO cluttered backgrounds
- NO amateur lighting
- YES to museum-quality aesthetics
- YES to conversion-optimized composition
- YES to brand-aligned sophistication

Your prompt should be so detailed that DALL-E 3 has NO CHOICE but to generate a MASTERPIECE.`;
};

/**
 * Tone-specific background guidance (PREMIUM LEVEL)
 */
const getToneBackgroundGuidance = (tone: string): string => {
    const guidance: Record<string, string> = {
        professional: "Clean, modern studio environment with sophisticated gradients. Think: Bloomberg, McKinsey, premium SaaS. Subtle depth with elegant shadows. Monochromatic or complementary color schemes.",
        playful: "Vibrant, energetic setting with dynamic elements. Confetti, bokeh, or geometric shapes. Think: Spotify, Slack, creative agencies. Bold colors with high contrast.",
        bold: "Dramatic, high-impact visuals with strong contrasts. Dark backgrounds with explosive color accents. Think: Nike, Red Bull, sports brands. Powerful, confident energy.",
        luxury: "Opulent, refined environment. Marble, gold accents, soft fabrics. Think: Rolex, Chanel, Range Rover. Understated elegance with premium materials.",
        minimal: "Ultra-clean, Scandinavian simplicity. Pure white or subtle gradients. Maximum negative space. Think: Apple, Muji, Kinfolk. Zen-like serenity."
    };
    return guidance[tone] || guidance.professional;
};

/**
 * Call GPT-4 Vision to analyze image and generate DALL-E prompt
 */
async function analyzeImageWithVision(req: EnhancementRequest): Promise<{ dallePrompt: string; analysisNotes: string }> {
    const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: 'chat/completions',
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: generateVisionAnalysisPrompt(req)
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: req.imageBase64.startsWith('data:')
                                    ? req.imageBase64
                                    : `data:image/jpeg;base64,${req.imageBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`GPT-4 Vision failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No response from GPT-4 Vision');
    }

    // Parse JSON response
    try {
        const parsed = JSON.parse(content);
        return {
            dallePrompt: parsed.dallePrompt,
            analysisNotes: parsed.analysisNotes
        };
    } catch (e) {
        // Fallback if GPT didn't return JSON
        return {
            dallePrompt: content,
            analysisNotes: 'AI-enhanced product visualization'
        };
    }
}

/**
 * Generate enhanced image with DALL-E 3
 */
async function generateWithDALLE3(prompt: string): Promise<string> {
    const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: 'images/generations',
            model: 'dall-e-3',
            prompt: `PREMIUM ADVERTISING PRODUCT PHOTOGRAPHY: ${prompt}
            
CRITICAL TECHNICAL REQUIREMENTS:
- Ultra-high quality, professional studio photography
- Perfect lighting with subtle shadows and highlights
- Sharp focus on product with beautiful bokeh/background blur where appropriate
- Color-graded for maximum visual impact
- Composition optimized for social media advertising
- No text, logos, or watermarks
- Clean, distraction-free background that complements the product`,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'vivid'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`DALL-E 3 failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
        throw new Error('No image generated by DALL-E 3');
    }

    return imageUrl;
}

/**
 * MAIN EXPORT: Enhance product image to premium ad quality
 */
export async function enhanceProductImage(req: EnhancementRequest): Promise<EnhancementResult> {
    console.log('🎨 Starting PREMIUM image enhancement pipeline...');

    // Step 1: Analyze with GPT-4 Vision
    console.log('📸 Analyzing image with GPT-4 Vision...');
    const { dallePrompt, analysisNotes } = await analyzeImageWithVision(req);
    console.log('✅ Vision analysis complete:', analysisNotes);

    // Step 2: Generate with DALL-E 3
    console.log('🖼️ Generating premium image with DALL-E 3...');
    const enhancedImageUrl = await generateWithDALLE3(dallePrompt);
    console.log('✅ Premium image generated!');

    return {
        enhancedImageUrl,
        analysisNotes
    };
}
