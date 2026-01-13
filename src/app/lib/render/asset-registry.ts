/**
 * ASSET REGISTRY
 * 
 * Central registry for all deterministic asset rendering.
 * Maps AssetRequirement types to their rendering functions.
 */

import type { AssetRequirement } from '../ai/creative/types';
import { renderBadge, renderOfferBadge, renderUrgencyBadge } from './cards/badge';
import { renderMessengerMock, renderWhatsAppFlowMock } from './mocks/messenger';
import { renderDashboardCard, renderStatsCard } from './mocks/dashboard';
import { renderTestimonialCard } from './cards/testimonial';

// ============================================================================
// ASSET RENDERING
// ============================================================================

/**
 * Render an asset based on its type and parameters
 * Returns data URL (base64 encoded image)
 */
export async function renderAsset(requirement: AssetRequirement): Promise<string> {
    const { type, params = {} } = requirement;

    switch (type) {
        // ========================================================================
        // BADGES
        // ========================================================================
        case 'offerBadge':
            return renderOfferBadge(
                params.text || '-20%',
                params
            );

        case 'discountBadge':
            return renderBadge({
                text: params.text || 'SALE',
                type: 'discount',
                ...params
            });

        case 'urgencyBadge':
            return renderUrgencyBadge(
                params.text || 'NUR HEUTE',
                params
            );

        // ========================================================================
        // SAAS MOCKS
        // ========================================================================
        case 'messengerMock':
            if (params.messages) {
                return renderMessengerMock(params);
            } else if (params.steps) {
                return renderWhatsAppFlowMock(params);
            }
            // Default example
            return renderMessengerMock({
                messages: [
                    { sender: 'bot', text: 'Hallo! Wie kann ich helfen?' },
                    { sender: 'user', text: 'Ich brauche eine Rechnung' },
                    { sender: 'bot', text: 'Kein Problem! Rechnung wird erstellt...' }
                ],
                title: params.title || 'Chat',
                theme: params.theme,
                width: params.width,
                height: params.height
            });

        case 'dashboardCard':
            if (params.metrics) {
                return renderDashboardCard(params);
            }
            // Default example
            return renderDashboardCard({
                title: params.title || 'Performance',
                metrics: [
                    { label: 'Umsatz', value: '€12.450', trend: 'up', trendValue: '+24%' },
                    { label: 'Bestellungen', value: '342', trend: 'up', trendValue: '+12%' }
                ],
                theme: params.theme,
                width: params.width,
                height: params.height
            });

        case 'invoicePreview':
            // Simplified invoice card (similar to dashboard card)
            return renderDashboardCard({
                title: 'Rechnung #1234',
                metrics: [
                    { label: 'Betrag', value: params.amount || '€299,00' },
                    { label: 'Status', value: params.status || 'Bezahlt' }
                ],
                theme: params.theme,
                width: params.width || 300,
                height: params.height || 200
            });

        // ========================================================================
        // SOCIAL PROOF
        // ========================================================================
        case 'testimonialCard':
            return renderTestimonialCard({
                quote: params.quote || 'Absolut begeistert! Genau das, was ich gesucht habe.',
                author: params.author || 'Max M.',
                title: params.title,
                rating: params.rating || 5,
                theme: params.theme,
                width: params.width,
                height: params.height
            });

        case 'reviewCard':
            // Alias for testimonialCard
            return renderAsset({ type: 'testimonialCard', params });

        // ========================================================================
        // LOCAL/GASTRO
        // ========================================================================
        case 'menuCard':
            // Simple menu list card
            const menuItems = params.items || [
                'Burger Classic - €12,90',
                'Pizza Margherita - €10,50',
                'Caesar Salad - €9,90'
            ];

            return renderSimpleListCard({
                title: params.title || 'Speisekarte',
                items: menuItems,
                width: params.width || 400,
                height: params.height || 300
            });

        case 'hoursCard':
            const hours = params.hours || [
                'Mo-Fr: 11:00 - 22:00',
                'Sa-So: 12:00 - 23:00'
            ];

            return renderSimpleListCard({
                title: 'Öffnungszeiten',
                items: hours,
                width: params.width || 300,
                height: params.height || 200
            });

        case 'mapCard':
            // Placeholder: would integrate with Google Maps Static API
            return renderPlaceholderCard({
                text: '📍 ' + (params.address || 'Hauptstraße 123, 10115 Berlin'),
                width: params.width || 400,
                height: params.height || 300
            });

        // ========================================================================
        // COACH/AGENCY
        // ========================================================================
        case 'resultsCard':
            return renderDashboardCard({
                title: params.title || 'Ergebnisse',
                metrics: params.metrics || [
                    { label: 'ROI', value: params.roi || '+240%', trend: 'up' },
                    { label: 'Leads', value: params.leads || '1.2K', trend: 'up', trendValue: '+89%' }
                ],
                theme: params.theme,
                width: params.width,
                height: params.height
            });

        case 'authoritySlide':
            // Placeholder for credentials/authority content
            return renderSimpleListCard({
                title: params.name || 'Expertise',
                items: params.credentials || [
                    '✓ 10+ Jahre Erfahrung',
                    '✓ 500+ Kunden betreut',
                    '✓ Zertifizierter Experte'
                ],
                width: params.width || 400,
                height: params.height || 300
            });

        // ========================================================================
        // UNIVERSAL
        // ========================================================================
        case 'comparisonTable':
            return renderComparisonTable(params);

        case 'benefitStack':
            const benefits = params.benefits || [
                '✓ Schnelle Lieferung',
                '✓ 30 Tage Rückgabe',
                '✓ Premium Qualität'
            ];

            return renderSimpleListCard({
                title: '',
                items: benefits,
                width: params.width || 350,
                height: params.height || 200
            });

        case 'featureChips':
            return renderFeatureChips(params);

        case 'statsCard':
            return renderStatsCard(params);

        // ========================================================================
        // PRODUCT (handled by image injection, not rendered here)
        // ========================================================================
        case 'productCutout':
            // Product images come from user upload or library
            // Return empty/placeholder if needed
            return '';

        case 'dishPhoto':
            // Food photos come from user upload or library
            return '';

        case 'portraitFrame':
            // Portrait photos come from user upload
            return '';

        // ========================================================================
        // CALENDAR (simple placeholder)
        // ========================================================================
        case 'calendarCard':
            return renderSimpleCard({
                icon: '📅',
                title: params.title || 'Termin buchen',
                text: params.text || 'Kostenloses Erstgespräch',
                width: params.width || 300,
                height: params.height || 150
            });

        default:
            console.warn(`Unknown asset type: ${type}`);
            return renderPlaceholderCard({ text: `Asset: ${type}` });
    }
}

// ============================================================================
// HELPER RENDERERS
// ============================================================================

function renderSimpleListCard(params: {
    title: string;
    items: string[];
    width: number;
    height: number;
}): string {
    const { title, items, width, height } = params;

    const itemsMarkup = items.map((item, index) => `
    <text 
      x="20" 
      y="${60 + (index * 30)}" 
      font-family="Inter, Arial, sans-serif" 
      font-size="14" 
      fill="#000000"
    >${escapeXml(item)}</text>
  `).join('');

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="12" fill="#FFFFFF" stroke="#E9ECEF" stroke-width="1"/>
  ${title ? `<text x="20" y="35" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="#000000">${escapeXml(title)}</text>` : ''}
  ${itemsMarkup}
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function renderSimpleCard(params: {
    icon: string;
    title: string;
    text: string;
    width: number;
    height: number;
}): string {
    const { icon, title, text, width, height } = params;

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="12" fill="#FFFFFF" stroke="#E9ECEF" stroke-width="1"/>
  <text x="${width / 2}" y="40" font-size="36" text-anchor="middle">${icon}</text>
  <text x="${width / 2}" y="80" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="#000000" text-anchor="middle">${escapeXml(title)}</text>
  <text x="${width / 2}" y="105" font-family="Inter, Arial, sans-serif" font-size="13" fill="#6C757D" text-anchor="middle">${escapeXml(text)}</text>
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function renderPlaceholderCard(params: { text: string; width?: number; height?: number }): string {
    const { text, width = 400, height = 300 } = params;

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" rx="12" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="1" stroke-dasharray="4"/>
  <text x="${width / 2}" y="${height / 2}" font-family="Inter, Arial, sans-serif" font-size="14" fill="#6C757D" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function renderComparisonTable(params: any): string {
    // Simplified comparison - would be more sophisticated in production
    return renderSimpleListCard({
        title: 'Vorher vs. Nachher',
        items: [
            '❌ Alt: Manuell → ✅ Neu: Automatisch',
            '❌ Alt: 2h Zeit → ✅ Neu: 5min',
            '❌ Alt: Fehleranfällig → ✅ Neu: Zuverlässig'
        ],
        width: params.width || 400,
        height: params.height || 250
    });
}

function renderFeatureChips(params: any): string {
    const chips = params.chips || ['Feature 1', 'Feature 2', 'Feature 3'];

    return renderSimpleListCard({
        title: '',
        items: chips.map((chip: string) => `◆ ${chip}`),
        width: params.width || 400,
        height: params.height || 150
    });
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================================================
// BATCH RENDERING
// ============================================================================

/**
 * Render multiple assets in parallel
 */
export async function renderAssets(
    requirements: AssetRequirement[]
): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const req of requirements) {
        try {
            const dataUrl = await renderAsset(req);
            results[req.type] = dataUrl;
        } catch (error) {
            console.error(`Failed to render asset ${req.type}:`, error);
            results[req.type] = renderPlaceholderCard({ text: `Error: ${req.type}` });
        }
    }

    return results;
}
