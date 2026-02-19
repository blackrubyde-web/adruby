/**
 * Unit tests for Copy Pack Generator
 * Tests structure validation and auto-fix functionality.
 * (GPT-4o generation is mocked to avoid API calls in CI.)
 */

import { describe, it, expect } from 'vitest';
import { validateCopyPackStructure, autoFixCopyPack } from '../netlify/functions/_shared/adPack/copyPackGenerator.js';
import copyPackModule from '../netlify/functions/_shared/adPack/copyPackGenerator.js';

const HOOK_KEYS = copyPackModule?.HOOK_FRAMEWORKS
    ? Object.keys(copyPackModule.HOOK_FRAMEWORKS)
    : ['PAS', 'AIDA', 'STORY', 'QUESTION', 'STAT', 'COMPARISON', 'SOCIAL_PROOF', 'FEAR', 'CURIOSITY', 'BENEFIT', 'AUTHORITY', 'DIRECT'];

// ═══════════════════════════════════════════════════════════════
// FIXTURE: A valid copy pack
// ═══════════════════════════════════════════════════════════════

function makeValidPack() {
    const primaryTexts = Array.from({ length: 12 }, (_, i) => ({
        text: `Primary text variant ${i + 1} with meaningful content about the product.`,
        hookType: HOOK_KEYS[i % HOOK_KEYS.length],
        length: i < 4 ? 'short' : i < 8 ? 'medium' : 'long',
        persona: 'Test Persona',
        painPoint: 'Test pain',
        desire: 'Test desire',
        proofElement: '1000+ customers',
        objectionHandled: 'Price concern',
    }));

    const headlines = Array.from({ length: 12 }, (_, i) => ({
        text: `Headline variant ${i + 1}`,
        angle: ['benefit', 'curiosity', 'urgency', 'social_proof', 'fear', 'authority',
            'question', 'stat', 'comparison', 'exclusivity', 'transformation', 'simplicity'][i],
        charCount: 20,
    }));

    const descriptions = Array.from({ length: 12 }, (_, i) => ({
        text: `Description variant ${i + 1} with product benefits.`,
        focus: ['product_features', 'audience_pain', 'result_outcome', 'comparison',
            'social_proof', 'process_ease', 'risk_reversal', 'scarcity',
            'testimonial', 'expertise', 'lifestyle', 'value_stack'][i],
        charCount: 50,
    }));

    const ctas = Array.from({ length: 6 }, (_, i) => ({
        text: `CTA ${i + 1}`,
        type: ['action', 'value', 'urgency', 'curiosity', 'social', 'exclusive'][i],
        charCount: 8,
    }));

    const ugcVariants = Array.from({ length: 6 }, (_, i) => ({
        text: `UGC style review ${i + 1} — I love this product!`,
        style: 'testimonial',
        persona: 'Happy Customer',
    }));

    const drVariants = Array.from({ length: 6 }, (_, i) => ({
        text: `DR variant ${i + 1} — Data shows 3x better results.`,
        style: 'data_driven',
        persona: 'Expert',
    }));

    return { primaryTexts, headlines, descriptions, ctas, ugcVariants, drVariants };
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('Copy Pack Structure Validation', () => {
    it('should validate a correct pack as valid', () => {
        const pack = makeValidPack();
        const result = validateCopyPackStructure(pack);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject a pack with missing primaryTexts', () => {
        const pack = makeValidPack();
        delete pack.primaryTexts;
        const result = validateCopyPackStructure(pack);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing or non-array: primaryTexts');
    });

    it('should reject a pack with too few headlines', () => {
        const pack = makeValidPack();
        pack.headlines = pack.headlines.slice(0, 3); // Only 3, need at least 8
        const result = validateCopyPackStructure(pack);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('headlines'))).toBe(true);
    });

    it('should reject primaryTexts without text field', () => {
        const pack = makeValidPack();
        pack.primaryTexts[0] = { hookType: 'PAS' }; // missing text
        const result = validateCopyPackStructure(pack);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('primaryTexts[0]: missing text'))).toBe(true);
    });

    it('should accept a pack with exactly the minimum counts', () => {
        const pack = makeValidPack();
        pack.primaryTexts = pack.primaryTexts.slice(0, 8);
        pack.headlines = pack.headlines.slice(0, 8);
        pack.descriptions = pack.descriptions.slice(0, 8);
        pack.ctas = pack.ctas.slice(0, 4);
        pack.ugcVariants = pack.ugcVariants.slice(0, 4);
        pack.drVariants = pack.drVariants.slice(0, 4);
        const result = validateCopyPackStructure(pack);
        expect(result.valid).toBe(true);
    });
});

describe('Copy Pack Auto-Fix', () => {
    it('should add missing metadata to primaryTexts', () => {
        const pack = {
            primaryTexts: [{ text: 'Some ad text here' }],
            headlines: [{ text: 'Headline' }],
            descriptions: [{ text: 'Description text' }],
            ctas: [{ text: 'Buy Now' }],
            ugcVariants: [{ text: 'Great product!' }],
            drVariants: [{ text: 'Data shows...' }],
        };

        const { pack: fixed, fixCount } = autoFixCopyPack(pack);
        expect(fixed.primaryTexts[0].hookType).toBeDefined();
        expect(fixed.primaryTexts[0].length).toBeDefined();
        expect(fixed.primaryTexts[0].persona).toBe('General');
        expect(fixCount).toBeGreaterThan(0);
    });

    it('should create missing arrays', () => {
        const pack = { primaryTexts: [{ text: 'Test' }] };
        const { pack: fixed } = autoFixCopyPack(pack);
        expect(Array.isArray(fixed.headlines)).toBe(true);
        expect(Array.isArray(fixed.descriptions)).toBe(true);
        expect(Array.isArray(fixed.ctas)).toBe(true);
        expect(Array.isArray(fixed.ugcVariants)).toBe(true);
        expect(Array.isArray(fixed.drVariants)).toBe(true);
    });

    it('should add charCount to headlines', () => {
        const pack = makeValidPack();
        delete pack.headlines[0].charCount;
        const { pack: fixed } = autoFixCopyPack(pack);
        expect(fixed.headlines[0].charCount).toBe(fixed.headlines[0].text.length);
    });
});
