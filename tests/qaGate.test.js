/**
 * Unit tests for QA Gate
 * Tests image asset validation, copy length validation, and overall QA scoring.
 */

import { describe, it, expect } from 'vitest';
import { validateImageAsset, validateCopyItems, runQAGate } from '../netlify/functions/_shared/adPack/qaGate.js';

// ═══════════════════════════════════════════════════════════════
// IMAGE VALIDATION
// ═══════════════════════════════════════════════════════════════

describe('Image Asset Validation', () => {
    it('should pass a valid square image', () => {
        const asset = {
            buffer: Buffer.alloc(100000), // 100KB
            width: 1080,
            height: 1080,
        };
        const result = validateImageAsset(asset, 'square');
        expect(result.passed).toBe(true);
        expect(result.results.every(r => r.passed)).toBe(true);
    });

    it('should pass a valid portrait image', () => {
        const asset = {
            buffer: Buffer.alloc(200000),
            width: 1080,
            height: 1350,
        };
        const result = validateImageAsset(asset, 'portrait');
        expect(result.passed).toBe(true);
    });

    it('should pass a valid story image', () => {
        const asset = {
            buffer: Buffer.alloc(300000),
            width: 1080,
            height: 1920,
        };
        const result = validateImageAsset(asset, 'story');
        expect(result.passed).toBe(true);
    });

    it('should fail an empty buffer', () => {
        const asset = {
            buffer: Buffer.alloc(0),
            width: 1080,
            height: 1080,
        };
        const result = validateImageAsset(asset, 'square');
        expect(result.passed).toBe(false);
    });

    it('should fail a null buffer', () => {
        const asset = { buffer: null, width: 1080, height: 1080 };
        const result = validateImageAsset(asset, 'square');
        expect(result.passed).toBe(false);
    });

    it('should fail an undersized image', () => {
        const asset = {
            buffer: Buffer.alloc(50000),
            width: 500,
            height: 500,
        };
        const result = validateImageAsset(asset, 'square');
        expect(result.passed).toBe(false);
        expect(result.results.some(r => r.check === 'resolution' && !r.passed)).toBe(true);
    });

    it('should fail a wrong aspect ratio', () => {
        const asset = {
            buffer: Buffer.alloc(100000),
            width: 1080,
            height: 1080,
        };
        // Claiming it's a story (9:16) but it's actually 1:1
        const result = validateImageAsset(asset, 'story');
        expect(result.passed).toBe(false);
        expect(result.results.some(r => r.check === 'aspect_ratio' && !r.passed)).toBe(true);
    });

    it('should fail an oversized file (>5MB)', () => {
        const asset = {
            buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
            width: 1080,
            height: 1080,
        };
        const result = validateImageAsset(asset, 'square');
        expect(result.passed).toBe(false);
        expect(result.results.some(r => r.check === 'file_size' && !r.passed)).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// COPY VALIDATION
// ═══════════════════════════════════════════════════════════════

describe('Copy Length Validation', () => {
    it('should pass copy within limits', () => {
        const copyPack = {
            primaryTexts: [{ text: 'Short primary text.' }],
            headlines: [{ text: 'Good Headline' }],
            descriptions: [{ text: 'A reasonable description.' }],
            ctas: [{ text: 'Buy Now' }],
        };
        const result = validateCopyItems(copyPack);
        expect(result.passed).toBe(true);
    });

    it('should auto-trim headlines over 60 chars', () => {
        const longHeadline = 'A'.repeat(80);
        const copyPack = {
            headlines: [{ text: longHeadline, angle: 'benefit' }],
        };
        const result = validateCopyItems(copyPack);
        expect(result.trimmedCopyPack.headlines[0].text.length).toBeLessThanOrEqual(60);
        expect(result.trimmedCopyPack.headlines[0]._trimmed).toBe(true);
    });

    it('should auto-trim descriptions over 200 chars', () => {
        const longDesc = 'B'.repeat(250);
        const copyPack = {
            descriptions: [{ text: longDesc, focus: 'product' }],
        };
        const result = validateCopyItems(copyPack);
        expect(result.trimmedCopyPack.descriptions[0].text.length).toBeLessThanOrEqual(200);
    });

    it('should auto-trim CTAs over 25 chars', () => {
        const longCta = 'Jetzt sofort kaufen und profitieren heute';
        const copyPack = {
            ctas: [{ text: longCta, type: 'action' }],
        };
        const result = validateCopyItems(copyPack);
        expect(result.trimmedCopyPack.ctas[0].text.length).toBeLessThanOrEqual(25);
    });
});

// ═══════════════════════════════════════════════════════════════
// FULL QA GATE
// ═══════════════════════════════════════════════════════════════

describe('Full QA Gate', () => {
    it('should pass with all valid assets', () => {
        const creativePack = {
            concepts: [{
                name: 'UGC Lifestyle',
                key: 'ugc_lifestyle',
                formats: {
                    square: { buffer: Buffer.alloc(100000), width: 1080, height: 1080 },
                    portrait: { buffer: Buffer.alloc(100000), width: 1080, height: 1350 },
                    story: { buffer: Buffer.alloc(100000), width: 1080, height: 1920 },
                },
            }],
            stats: { total: 3, generated: 3, failed: 0 },
        };

        const copyPack = {
            primaryTexts: [{ text: 'Good text.' }],
            headlines: [{ text: 'Good Headline' }],
            descriptions: [{ text: 'Good description here.' }],
            ctas: [{ text: 'Buy Now' }],
        };

        const result = runQAGate(creativePack, copyPack);
        expect(result.passed).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(7);
    });

    it('should fail with too many failed images', () => {
        const creativePack = {
            concepts: [{
                name: 'Test',
                key: 'test',
                formats: {
                    square: { error: 'Failed to generate' },
                    portrait: { error: 'Failed to generate' },
                    story: { error: 'Failed to generate' },
                },
            }],
            stats: { total: 3, generated: 0, failed: 3 },
        };

        const copyPack = {
            primaryTexts: [{ text: 'Good text.' }],
            headlines: [{ text: 'Good Headline' }],
        };

        const result = runQAGate(creativePack, copyPack);
        expect(result.passed).toBe(false);
    });

    it('should include trimmed copy in result', () => {
        const creativePack = {
            concepts: [],
            stats: { total: 0, generated: 0, failed: 0 },
        };
        const copyPack = {
            headlines: [{ text: 'X'.repeat(80), angle: 'benefit' }],
        };

        const result = runQAGate(creativePack, copyPack);
        expect(result.trimmedCopyPack.headlines[0].text.length).toBeLessThanOrEqual(60);
    });
});
