import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { imageUrl, productDescription } = JSON.parse(event.body);

        if (!imageUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing imageUrl' })
            };
        }

        const systemPrompt = `You are an expert marketing analyst. Analyze the product image and return a JSON object with:

{
    "productName": "Best guess product name",
    "productType": "physical" | "digital" | "service",
    "niche": "saas" | "ecommerce" | "coach" | "fitness" | "food" | "realestate" | "event" | "finance" | "craft" | "job",
    "targetAudience": "Brief description of ideal customer",
    "keyBenefits": ["benefit1", "benefit2", "benefit3"],
    "dominantColors": ["#hex1", "#hex2"],
    "mood": "luxury" | "playful" | "professional" | "bold" | "minimal" | "energetic",
    "suggestedTemplateStyles": ["ugc", "problem_solution", "feature_spotlight", "bold_headline", "social_proof", "flash_sale"],
    "hookIdeas": ["Hook 1", "Hook 2", "Hook 3"],
    "headlineIdeas": ["Headline 1", "Headline 2"],
    "ctaIdeas": ["CTA 1", "CTA 2"]
}

Be specific and creative. Base your analysis on visual elements and any context provided.`;

        const userPrompt = productDescription
            ? `Analyze this product image. Additional context: ${productDescription}`
            : 'Analyze this product image and provide marketing insights.';

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: userPrompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                analysis
            }),
        };
    } catch (error) {
        console.error('Image Analysis Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Image analysis failed'
            }),
        };
    }
};
