// netlify/functions/ai-product-copy.js
// AI-powered ad copy generation for scraped products
// Uses GPT-4 to generate hooks, headlines, CTAs

import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { withCors, ok, badRequest, serverError, methodNotAllowed } from './utils/response.js';
import { checkRateLimit } from './_shared/rateLimiter.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * Generate ad copy for a single product
 */
async function generateProductCopy(product) {
    if (!openai) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const hasDiscount = product.compareAtPrice &&
        parseFloat(product.compareAtPrice) > parseFloat(product.price);

    const discountPercent = hasDiscount
        ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)
        : 0;

    const prompt = `Du bist ein Elite-Werbetexter für E-Commerce Facebook/Instagram Ads.

PRODUKT:
Titel: ${product.title}
Beschreibung: ${product.description?.slice(0, 500) || 'Keine Beschreibung'}
Preis: €${product.price}${hasDiscount ? ` (Vorher: €${product.compareAtPrice}, ${discountPercent}% Rabatt)` : ''}
Kategorie: ${product.productType || 'Allgemein'}
Tags: ${product.tags?.slice(0, 5).join(', ') || 'Keine'}

AUFGABE:
Generiere überzeugende Ad-Copy auf Deutsch:

1. 3 HOOKS (Scroll-Stopper, max 10 Wörter, mit Emoji am Anfang)
   - Emotional, neugierig machend, problemlösend
   
2. 3 HEADLINES (Nutzen-fokussiert, max 15 Wörter)
   - Betone den Hauptvorteil des Produkts
   
3. 3 CTAs (Call-to-Action für Ads)
   - Dringlichkeit erzeugen, direkt ansprechen

4. 1 PRIMÄRTEXT (Für Facebook Ad, 2-3 Sätze)
   - Hook → Benefit → CTA

Antworte NUR im folgenden JSON-Format:
{
  "hooks": ["...", "...", "..."],
  "headlines": ["...", "...", "..."],
  "ctas": ["...", "...", "..."],
  "primaryText": "..."
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Du bist ein deutscher E-Commerce Werbetexter. Antworte nur mit validem JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 800
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        return JSON.parse(content);
    } catch (error) {
        console.error('[AI Copy] Error:', error);
        // Return fallback copy
        return {
            hooks: [
                `🔥 ${product.title} - Jetzt entdecken!`,
                `⭐ Das musst du sehen: ${product.title}`,
                `💡 Schluss mit dem Suchen - ${product.title}`
            ],
            headlines: [
                `${product.title} - Premium Qualität zum besten Preis`,
                `Entdecke ${product.title} und überzeuge dich selbst`,
                `${product.title}: Die Lösung die du gesucht hast`
            ],
            ctas: [
                'Jetzt sichern →',
                'Mehr erfahren',
                'Zum Shop'
            ],
            primaryText: `Entdecke ${product.title} - Qualität die überzeugt. Jetzt im Shop verfügbar!`
        };
    }
}

/**
 * Generate copy for multiple products (batch)
 */
async function generateBatchCopy(products, maxConcurrent = 3) {
    const results = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < products.length; i += maxConcurrent) {
        const batch = products.slice(i, i + maxConcurrent);
        const batchResults = await Promise.all(
            batch.map(async (product) => {
                const copy = await generateProductCopy(product);
                return {
                    productId: product.id,
                    productTitle: product.title,
                    ...copy
                };
            })
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Main handler
 */
async function handleRequest(event) {
    const body = JSON.parse(event.body || '{}');
    const { products, mode = 'single' } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return badRequest('products array is required');
    }

    if (!openai) {
        return serverError('OPENAI_API_KEY not configured');
    }

    try {
        console.log(`[AI Copy] Generating copy for ${products.length} products`);

        if (mode === 'batch' || products.length > 1) {
            const copies = await generateBatchCopy(products);
            return ok({
                success: true,
                copies,
                generatedAt: new Date().toISOString()
            });
        } else {
            const copy = await generateProductCopy(products[0]);
            return ok({
                success: true,
                productId: products[0].id,
                productTitle: products[0].title,
                ...copy,
                generatedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('[AI Copy] Handler error:', error);
        return serverError('Failed to generate copy');
    }
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204 });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    // Auth guard — require authenticated user
    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;

    // Rate limit — prevent OpenAI cost abuse
    const rateCheck = await checkRateLimit(auth.userId, 'ai_product_copy');
    if (!rateCheck.allowed) {
        return badRequest('Rate limit exceeded. Try again later.', 429);
    }

    return handleRequest(event);
}
