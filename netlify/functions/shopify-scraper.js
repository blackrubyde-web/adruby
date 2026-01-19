// netlify/functions/shopify-scraper.js
// Shopify Store Scraper using ScraperAPI Pro
// Extracts products, images, descriptions, prices, and reviews

import { createClient } from '@supabase/supabase-js';

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

/**
 * Extract base store URL from any Shopify URL
 */
function extractStoreUrl(url) {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.hostname}`;
    } catch {
        return null;
    }
}

/**
 * Fetch Shopify products via native /products.json endpoint
 * This works for ~80% of Shopify stores
 */
async function fetchProductsJson(storeUrl, maxProducts = 50) {
    const products = [];
    let page = 1;
    const limit = 250; // Shopify max per page

    while (products.length < maxProducts) {
        const url = `${storeUrl}/products.json?limit=${limit}&page=${page}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                console.log(`[Shopify] products.json blocked (${response.status}), need ScraperAPI`);
                return null; // Signal to use ScraperAPI fallback
            }

            const data = await response.json();

            if (!data.products || data.products.length === 0) break;

            products.push(...data.products);

            if (data.products.length < limit) break; // No more pages
            page++;
        } catch (error) {
            console.error('[Shopify] JSON fetch error:', error);
            return null;
        }
    }

    return products.slice(0, maxProducts);
}

/**
 * Fetch with ScraperAPI for blocked stores
 */
async function fetchWithScraperApi(url) {
    if (!SCRAPER_API_KEY) {
        throw new Error('SCRAPER_API_KEY not configured');
    }

    const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true`;

    const response = await fetch(scraperUrl);

    if (!response.ok) {
        throw new Error(`ScraperAPI error: ${response.status}`);
    }

    return response.text();
}

/**
 * Parse Shopify product from JSON
 */
function parseProduct(product) {
    return {
        id: product.id?.toString() || `product-${Date.now()}`,
        handle: product.handle || '',
        title: product.title || 'Untitled Product',
        description: stripHtml(product.body_html || ''),
        descriptionHtml: product.body_html || '',
        vendor: product.vendor || '',
        productType: product.product_type || '',
        tags: product.tags || [],
        images: (product.images || []).map(img => ({
            id: img.id?.toString(),
            src: img.src,
            alt: img.alt || product.title,
            width: img.width,
            height: img.height
        })),
        variants: (product.variants || []).map(v => ({
            id: v.id?.toString(),
            title: v.title,
            price: v.price,
            compareAtPrice: v.compare_at_price,
            sku: v.sku,
            available: v.available !== false
        })),
        price: product.variants?.[0]?.price || '0.00',
        compareAtPrice: product.variants?.[0]?.compare_at_price || null,
        available: product.variants?.some(v => v.available !== false) ?? true,
        createdAt: product.created_at,
        updatedAt: product.updated_at
    };
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Try to fetch store metadata
 */
async function fetchStoreInfo(storeUrl) {
    try {
        // Try to get shop.json (sometimes available)
        const response = await fetch(`${storeUrl}/meta.json`);
        if (response.ok) {
            const data = await response.json();
            return {
                name: data.name || extractStoreName(storeUrl),
                description: data.description || '',
                logo: data.logo || null
            };
        }
    } catch {
        // Ignore
    }

    // Fallback: extract from URL
    return {
        name: extractStoreName(storeUrl),
        description: '',
        logo: null
    };
}

function extractStoreName(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname
            .replace('.myshopify.com', '')
            .replace('www.', '')
            .split('.')[0]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
        return 'Unknown Store';
    }
}

/**
 * Main scraping handler
 */
async function handleScrape(event) {
    const body = JSON.parse(event.body || '{}');
    const { storeUrl: inputUrl, maxProducts = 50 } = body;

    if (!inputUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'storeUrl is required' })
        };
    }

    const storeUrl = extractStoreUrl(inputUrl);
    if (!storeUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid URL format' })
        };
    }

    console.log(`[Shopify Scraper] Scraping ${storeUrl}, max ${maxProducts} products`);

    try {
        // Step 1: Try native JSON endpoint
        let rawProducts = await fetchProductsJson(storeUrl, maxProducts);
        let source = 'json';

        // Step 2: Fallback to ScraperAPI if JSON blocked
        if (!rawProducts && SCRAPER_API_KEY) {
            console.log('[Shopify] Using ScraperAPI fallback...');
            const html = await fetchWithScraperApi(`${storeUrl}/collections/all`);

            // Parse product links from HTML and fetch each product's JSON
            const productLinks = extractProductLinksFromHtml(html);
            rawProducts = [];

            for (const link of productLinks.slice(0, maxProducts)) {
                try {
                    const productUrl = `${storeUrl}${link}.json`;
                    const productHtml = await fetchWithScraperApi(productUrl);
                    const productData = JSON.parse(productHtml);
                    if (productData.product) {
                        rawProducts.push(productData.product);
                    }
                } catch (e) {
                    console.warn(`[Shopify] Failed to fetch product: ${link}`);
                }
            }
            source = 'scraperapi';
        }

        if (!rawProducts || rawProducts.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'No products found. Make sure this is a valid Shopify store URL.',
                    storeUrl
                })
            };
        }

        // Parse products
        const products = rawProducts.map(parseProduct);

        // Get store info
        const storeInfo = await fetchStoreInfo(storeUrl);

        // Log scrape for analytics
        if (supabase) {
            await supabase.from('store_scrapes').insert({
                store_url: storeUrl,
                store_name: storeInfo.name,
                product_count: products.length,
                source,
                created_at: new Date().toISOString()
            }).catch(() => { }); // Silent fail
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                store: storeInfo,
                products,
                source,
                scrapedAt: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('[Shopify Scraper] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to scrape store',
                message: error.message
            })
        };
    }
}

/**
 * Extract product links from HTML (for ScraperAPI fallback)
 */
function extractProductLinksFromHtml(html) {
    const matches = html.match(/href="\/products\/[^"]+"/g) || [];
    const links = [...new Set(
        matches.map(m => m.replace('href="', '').replace('"', '').split('?')[0])
    )];
    return links;
}

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return handleScrape(event);
}
