/**
 * ERROR RECOVERY SYSTEM
 * Graceful degradation with fallback strategies
 * 
 * Features:
 * - Template fallback chain
 * - Partial render recovery
 * - Error telemetry
 * - Retry with exponential backoff
 */

import type { AdDocument, StudioLayer } from '../../../types/studio';
import type { LayoutInput } from '../layout/layout-engine-v2';

export interface RecoveryResult {
    success: boolean;
    adDocument?: AdDocument;
    fallbackLevel: number;  // 0 = no fallback, 1 = template fallback, 2 = basic fallback, 3 = text-only
    errors: Array<{ stage: string; error: string }>;
    warnings: string[];
}

/**
 * Create basic fallback ad (text-only)
 */
function createTextOnlyFallback(input: LayoutInput): AdDocument {
    const timestamp = Date.now();
    const layers: StudioLayer[] = [];

    // Background
    layers.push({
        id: `bg-${timestamp}`,
        type: 'background',
        name: 'Background',
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        visible: true,
        locked: true,
        rotation: 0,
        opacity: 1,
        src: '',
        zIndex: 0
    } as any);

    // Simple headline
    layers.push({
        id: `headline-${timestamp}`,
        type: 'text',
        name: 'Headline',
        role: 'headline',
        x: 60,
        y: 400,
        width: 960,
        height: 200,
        visible: true,
        locked: false,
        rotation: 0,
        opacity: 1,
        text: input.headline,
        fontSize: 72,
        fontFamily: 'Inter',
        fontWeight: 800,
        align: 'center',
        color: '#000000',
        lineHeight: 1.2,
        zIndex: 1
    } as any);

    // Simple CTA
    layers.push({
        id: `cta-${timestamp}`,
        type: 'cta',
        name: 'CTA',
        role: 'cta',
        x: 315,
        y: 700,
        width: 450,
        height: 100,
        visible: true,
        locked: false,
        rotation: 0,
        opacity: 1,
        text: input.ctaText,
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#FFFFFF',
        bgColor: '#000000',
        radius: 50,
        zIndex: 2
    } as any);

    return {
        id: `fallback-ad-${timestamp}`,
        name: `${input.productName} - Fallback`,
        width: 1080,
        height: 1080,
        backgroundColor: '#FFFFFF',
        layers,
        createdAt: new Date().toISOString()
    };
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            const delay = baseDelay * Math.pow(2, i);
            console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Max retries exceeded');
}

/**
 * Recover from generation failure
 */
export async function recoverFromFailure(
    input: LayoutInput,
    originalError: Error,
    attemptedStage: string
): Promise<RecoveryResult> {
    const errors: Array<{ stage: string; error: string }> = [
        { stage: attemptedStage, error: originalError.message }
    ];
    const warnings: string[] = [];

    console.error(`❌ Generation failed at stage: ${attemptedStage}`, originalError);

    // Level 1: Try minimal template
    try {
        warnings.push('Attempting minimal template fallback...');

        const minimalInput: LayoutInput = {
            ...input,
            pattern: 'minimal',
            enforceAccessibility: false // Skip validation for speed
        };

        const { composeAd } = await import('../layout/layout-engine-v2');
        const result = await retryWithBackoff(() => composeAd(minimalInput), 2, 500);

        warnings.push('✓ Recovered using minimal template');
        return {
            success: true,
            adDocument: result.adDocument,
            fallbackLevel: 1,
            errors,
            warnings
        };

    } catch (minimalError: any) {
        errors.push({ stage: 'minimal-fallback', error: minimalError.message });
        warnings.push('✗ Minimal template failed');
    }

    // Level 2: Create text-only fallback
    try {
        warnings.push('Creating text-only fallback...');

        const fallbackDoc = createTextOnlyFallback(input);

        warnings.push('✓ Created text-only fallback');
        return {
            success: true,
            adDocument: fallbackDoc,
            fallbackLevel: 3,
            errors,
            warnings
        };

    } catch (fallbackError: any) {
        errors.push({ stage: 'text-fallback', error: fallbackError.message });
    }

    // Complete failure
    return {
        success: false,
        fallbackLevel: -1,
        errors,
        warnings: [...warnings, '✗ All recovery attempts failed']
    };
}

/**
 * Validate ad document structure
 */
export function validateAdDocument(doc: AdDocument): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!doc.id) issues.push('Missing document ID');
    if (!doc.width || doc.width <= 0) issues.push('Invalid width');
    if (!doc.height || doc.height <= 0) issues.push('Invalid height');
    if (!Array.isArray(doc.layers)) issues.push('Layers is not an array');
    if (doc.layers.length === 0) issues.push('No layers present');

    // Check for essential layers
    const hasBackground = doc.layers.some(l => l.type === 'background');
    const hasContent = doc.layers.some(l => l.type !== 'background');
    const hasCTA = doc.layers.some(l => l.type === 'cta' || l.role === 'cta');

    if (!hasBackground) issues.push('Missing background layer');
    if (!hasContent) issues.push('No content layers');
    if (!hasCTA) issues.push('Missing CTA');

    return {
        valid: issues.length === 0,
        issues
    };
}

/**
 * Repair corrupted ad document
 */
export function repairAdDocument(doc: AdDocument): { repaired: AdDocument; repairs: string[] } {
    const repaired = JSON.parse(JSON.stringify(doc)) as AdDocument;
    const repairs: string[] = [];

    // Ensure ID
    if (!repaired.id) {
        repaired.id = `repaired-ad-${Date.now()}`;
        repairs.push('Generated missing ID');
    }

    // Ensure dimensions
    if (!repaired.width || repaired.width <= 0) {
        repaired.width = 1080;
        repairs.push('Set default width: 1080');
    }
    if (!repaired.height || repaired.height <= 0) {
        repaired.height = 1080;
        repairs.push('Set default height: 1080');
    }

    // Ensure layers array
    if (!Array.isArray(repaired.layers)) {
        repaired.layers = [];
        repairs.push('Initialized layers array');
    }

    // Fix layer properties
    repaired.layers = repaired.layers.map(layer => {
        const fixed = { ...layer };

        if (typeof fixed.visible !== 'boolean') {
            fixed.visible = true;
            repairs.push(`Fixed visibility for layer: ${fixed.id}`);
        }
        if (typeof fixed.opacity !== 'number') {
            fixed.opacity = 1;
            repairs.push(`Fixed opacity for layer: ${fixed.id}`);
        }
        if (typeof fixed.rotation !== 'number') {
            fixed.rotation = 0;
            repairs.push(`Fixed rotation for layer: ${fixed.id}`);
        }

        return fixed;
    });

    return { repaired, repairs };
}
