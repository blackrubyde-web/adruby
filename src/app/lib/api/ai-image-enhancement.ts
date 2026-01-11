import { invokeOpenAIProxy } from './proxyClient';

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

interface BackgroundResult {
    backgroundImageUrl: string;
    analysisNotes: string;
}

interface InvokeOptions {
    signal?: AbortSignal;
}

type ChatCompletionResponse = {
    choices: Array<{ message: { content: string } }>;
};

type ImageGenerationResponse = {
    data: Array<{ url?: string }>;
};

type UploadResponse = {
    publicUrl?: string;
};

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
 * BACKGROUND GENERATION PROMPT SYSTEM (Composite Strategy)
 * Generates an EMPTY scene for the product to be placed into.
 */
const generateBackgroundVisionPrompt = (req: EnhancementRequest): string => {
    return `You are an expert set designer for premium product photography.

YOUR MISSION: Analyze this product image and create a DALL-E 3 prompt to generate a PERFECT BACKGROUND SCENE for this specific product to be placed into later.

PRODUCT CONTEXT:
- Product: ${req.productName}
- Brand: ${req.brandName || 'N/A'}
- Tone: ${req.tone}

ANALYSIS:
1. Identify the optimal setting for this product (e.g., marble counter for cosmetics, tech desk for gadgets).
2. Determine the best lighting to match the product's likely perspective.
3. Choose colors that perfectly complement the product (complementary or monochromatic).

CRITICAL INSTRUCTION:
The generated image must be an EMPTY SCENE. Do NOT include the product. The product will be photoshopped in later.
- Center of the image must be "empty" or have a "landing spot" (podium, flat surface, open air) for the product.
- Perspective must match a standard product shot (front view or slight angle).

FORMAT YOUR RESPONSE AS JSON:
{
  "dallePrompt": "Detailed DALL-E 3 prompt for an EMPTY BACKGROUND SCENE...",
  "analysisNotes": "Brief strategy"
}`;
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
async function analyzeImageWithVision(
    req: EnhancementRequest,
    options?: InvokeOptions
): Promise<{ dallePrompt: string; analysisNotes: string }> {
    const { data, error } = await invokeOpenAIProxy<ChatCompletionResponse>({
        endpoint: 'chat/completions',
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: generateVisionAnalysisPrompt(req) },
                    {
                        type: 'image_url',
                        image_url: {
                            url: req.imageBase64.startsWith('data:') ? req.imageBase64 : `data:image/jpeg;base64,${req.imageBase64}`,
                            detail: 'high'
                        }
                    }
                ]
            }
        ],
        max_tokens: 1000,
        temperature: 0.7
    }, options);

    if (error) throw new Error(error.message);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response');

    try {
        return JSON.parse(content);
    } catch (e) {
        return { dallePrompt: content, analysisNotes: 'Auto-generated background' };
    }
}

/**
 * Analyze image to generate BACKGROUND ONLY prompt
 */
async function analyzeForBackground(
    req: EnhancementRequest,
    options?: InvokeOptions
): Promise<{ dallePrompt: string; analysisNotes: string }> {
    const { data, error } = await invokeOpenAIProxy<ChatCompletionResponse>({
        endpoint: 'chat/completions',
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: generateBackgroundVisionPrompt(req) },
                    {
                        type: 'image_url',
                        image_url: {
                            url: req.imageBase64.startsWith('data:') ? req.imageBase64 : `data:image/jpeg;base64,${req.imageBase64}`,
                            detail: 'low'
                        }
                    }
                ]
            }
        ],
        max_tokens: 1000,
        temperature: 0.7
    }, options);

    if (error) throw new Error(`GPT-4 Vision failed: ${error.message}`);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from GPT-4 Vision');

    try {
        return JSON.parse(content);
    } catch (e) {
        return { dallePrompt: content, analysisNotes: 'Background generation strategy' };
    }
}

/**
 * Generate enhanced image with DALL-E 3
 */
async function generateWithDALLE3(prompt: string, options?: InvokeOptions): Promise<string> {
    const { data, error } = await invokeOpenAIProxy<ImageGenerationResponse>({
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
    }, options);

    if (error) {
        throw new Error(`DALL-E 3 failed: ${error.message || 'Unknown error'}`);
    }

    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
        throw new Error('No image generated by DALL-E 3');
    }

    return imageUrl;
}

/**
 * MAIN EXPORT: Enhance product image to premium ad quality
 * Images are automatically uploaded to Supabase Storage for permanent access
 */
export async function enhanceProductImage(req: EnhancementRequest, options?: InvokeOptions): Promise<EnhancementResult> {
    // Step 1: Analyze with GPT-4 Vision
    const { dallePrompt, analysisNotes } = await analyzeImageWithVision(req, options);

    // Step 2: Generate with DALL-E 3
    const openAIImageUrl = await generateWithDALLE3(dallePrompt, options);

    // Step 3: Upload to Supabase Storage via Backend Edge Function (Solves CORS)
    // We use 'openai-proxy' because it's already deployed and we merged the logic there

    // Unified AI Service (Supabase Edge Function)
    const { data: uploadData, error: uploadError } = await invokeOpenAIProxy<UploadResponse>({
        processParams: {
            imageUrl: openAIImageUrl,
            productName: req.productName,
            // userId is handled by the Auth context in the Edge Function now
        }
    }, options);

    if (uploadError) throw new Error(uploadError.message || 'Image upload failed');

    if (!uploadData?.publicUrl) {
        throw new Error('Backend did not return public URL');
    }


    const permanentImageUrl = uploadData.publicUrl;
    return {
        enhancedImageUrl: permanentImageUrl,
        analysisNotes
    };
}

/**
 * Generate a BACKGROUND SCENE only (for composite ads)
 */
export async function generateBackgroundScene(req: EnhancementRequest, options?: InvokeOptions): Promise<BackgroundResult> {
    // 1. Analyze to get Background Prompt
    const { dallePrompt, analysisNotes } = await analyzeForBackground(req, options);

    // 2. Generate Background with DALL-E 3
    // Explicitly add negative prompt instruction in the prompt text itself as DALL-E 3 via API doesn't support neg parameters well
    const bgPrompt = `EMPTY BACKGROUND SCENE for product photography. ${dallePrompt}. NO TEXT. NO PRODUCTS. EMPTY CENTER.`;
    const openAIImageUrl = await generateWithDALLE3(bgPrompt, options);

    // 3. Upload
    // 3. Upload via Unified Service
    const { data: uploadData, error: uploadError } = await invokeOpenAIProxy<UploadResponse>({
        processParams: {
            imageUrl: openAIImageUrl,
            productName: `${req.productName}-bg`,
        }
    }, options);

    if (uploadError) throw new Error(uploadError.message || 'Background upload failed');

    if (!uploadData?.publicUrl) throw new Error('Backend did not return public URL');

    return {
        backgroundImageUrl: uploadData.publicUrl,
        analysisNotes
    };
}
