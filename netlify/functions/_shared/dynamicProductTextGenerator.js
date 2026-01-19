/**
 * Dynamic Product Text Generator
 * 
 * Generates product-specific headlines, CTAs, and features using GPT-4
 * Ensures all text content is relevant to the ACTUAL product
 */

/**
 * Generate product-specific ad copy from description
 */
export async function generateProductCopy(openai, options) {
    const {
        productName,
        productDescription,
        visionDescription,
        targetAudience,
        tone = 'professional',
        language = 'de',
        goal = 'conversion',
        industry,
    } = options;

    const systemPrompt = `Du bist ein Elite-Werbetexter mit 15 Jahren Erfahrung.
Deine Aufgabe: Erstelle scroll-stoppende Ad-Texte für das gegebene Produkt.

REGELN:
1. Alle Texte müssen DIREKT zum Produkt passen
2. Kurz und prägnant (Headline: max 6 Wörter, CTA: max 4 Wörter)
3. Emotional ansprechend
4. ${language === 'de' ? 'Auf Deutsch' : 'In English'}
5. Zielgruppe: ${targetAudience || 'Allgemein'}
6. Ton: ${tone}

Antworte NUR im JSON Format.`;

    const userPrompt = `
PRODUKT: ${productName || 'Unbekannt'}

BESCHREIBUNG:
${productDescription || 'Keine Beschreibung'}

${visionDescription ? `VISUELLE ANALYSE:\n${visionDescription}` : ''}

BRANCHE: ${industry || 'Allgemein'}
ZIEL: ${goal}

WICHTIG: Wenn die Beschreibung bereits detaillierte Textelemente enthält (Headline, Subheadline, Features, CTA), 
übernimm diese EXAKT oder verbessere sie minimal. Der Benutzer hat sich Gedanken gemacht!

Generiere:
1. headline: Kurze, scroll-stoppende Headline (max 6 Wörter) - falls im Text vorhanden, diese übernehmen
2. subheadline: Unterstützende Zeile (max 10 Wörter) - falls im Text vorhanden, diese übernehmen  
3. cta: Call-to-Action (max 4 Wörter) - falls im Text vorhanden, diese übernehmen
4. badge: OPTIONAL Trust-Badge (NUR wenn passend, sonst leerer String "")
5. features: Array von 3-4 kurzen Feature-Texten (je max 4 Wörter)
6. hook: Scroll-stopping Hook für den Ad-Text

Antwort als JSON:
{
  "headline": "...",
  "subheadline": "...",
  "cta": "...",
  "badge": "",
  "features": ["...", "...", "..."],
  "hook": "..."
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);

        console.log('[DynamicTextGen] Generated product-specific copy:', parsed);

        return {
            success: true,
            headline: parsed.headline || productName,
            subheadline: parsed.subheadline || '',
            cta: parsed.cta || 'Jetzt entdecken',
            badge: parsed.badge || '',
            features: parsed.features || [],
            hook: parsed.hook || '',
        };
    } catch (error) {
        console.error('[DynamicTextGen] Failed to generate copy:', error);

        // Fallback to product name
        return {
            success: false,
            headline: productName || 'Entdecke jetzt',
            subheadline: '',
            cta: 'Jetzt ansehen',
            badge: '',
            features: [],
            hook: '',
        };
    }
}

/**
 * Generate context-aware features from product description
 */
export async function extractProductFeatures(openai, productDescription, visionDescription, language = 'de') {
    if (!productDescription && !visionDescription) {
        return [];
    }

    const prompt = `Analysiere dieses Produkt und extrahiere 3-4 Verkaufsargumente/Features.
Jedes Feature: Max 4 Wörter, prägnant, benefit-orientiert.

Produkt: ${productDescription || ''}
${visionDescription ? `Visuell: ${visionDescription}` : ''}

Antwort als JSON Array:
["Feature 1", "Feature 2", "Feature 3"]`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Handle both array and object responses
        const features = Array.isArray(parsed) ? parsed : (parsed.features || []);

        console.log('[DynamicTextGen] Extracted features:', features);
        return features.slice(0, 4);
    } catch (error) {
        console.error('[DynamicTextGen] Failed to extract features:', error);
        return [];
    }
}

/**
 * Generate headline specifically for the product
 */
export function generateFallbackHeadline(productName, productDescription, language = 'de') {
    // Extract key words from description
    const desc = (productDescription || productName || '').toLowerCase();

    // Gaming/Gamer products
    if (desc.includes('gaming') || desc.includes('gamer')) {
        return language === 'de'
            ? 'Level up dein Setup'
            : 'Level up your setup';
    }

    // Lamp/Light products
    if (desc.includes('lampe') || desc.includes('lamp') || desc.includes('licht') || desc.includes('light')) {
        return language === 'de'
            ? 'Atmosphäre, die begeistert'
            : 'Light up your space';
    }

    // Minecraft themed
    if (desc.includes('minecraft')) {
        return language === 'de'
            ? 'Dein Minecraft-Moment'
            : 'Your Minecraft moment';
    }

    // Kids/Children products
    if (desc.includes('kinder') || desc.includes('kids') || desc.includes('child')) {
        return language === 'de'
            ? 'Kinderaugen leuchten'
            : 'Made for kids';
    }

    // Default with product name
    if (productName) {
        return productName.length < 20 ? productName : productName.substring(0, 18) + '...';
    }

    return language === 'de' ? 'Entdecke jetzt' : 'Discover now';
}

export default {
    generateProductCopy,
    extractProductFeatures,
    generateFallbackHeadline,
};
