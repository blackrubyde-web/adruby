/**
 * NanoBanana Creative Engine v5.0 — Unit Tests
 * Tests pure functions: resolveIndustry, buildCreativePrompt, getVariationSeeds
 */

import { describe, it, expect } from 'vitest';
import { resolveIndustry, buildCreativePrompt, CONCEPT_TYPES, META_FORMATS } from '../netlify/functions/_shared/adPack/nanoBananaCreativeEngine.js';

// ═══════════════════════════════════════════════════════════════
// resolveIndustry()
// ═══════════════════════════════════════════════════════════════

describe('resolveIndustry', () => {
    it('resolves exact preset keys', () => {
        expect(resolveIndustry('tech_electronics')).toBe('tech_electronics');
        expect(resolveIndustry('food_restaurant')).toBe('food_restaurant');
        expect(resolveIndustry('fashion_beauty')).toBe('fashion_beauty');
        expect(resolveIndustry('fitness_health')).toBe('fitness_health');
        expect(resolveIndustry('home_interior')).toBe('home_interior');
    });

    it('resolves common aliases', () => {
        expect(resolveIndustry('tech')).toBe('tech_electronics');
        expect(resolveIndustry('food')).toBe('food_restaurant');
        expect(resolveIndustry('fashion')).toBe('fashion_beauty');
        expect(resolveIndustry('beauty')).toBe('fashion_beauty');
        expect(resolveIndustry('fitness')).toBe('fitness_health');
        expect(resolveIndustry('health')).toBe('fitness_health');
        expect(resolveIndustry('sport')).toBe('fitness_health');
        expect(resolveIndustry('home')).toBe('home_interior');
        expect(resolveIndustry('furniture')).toBe('home_interior');
    });

    it('returns default for unknown industries', () => {
        expect(resolveIndustry('alien_tech')).toBe('default');
        expect(resolveIndustry('zzzz')).toBe('default');
        expect(resolveIndustry('')).toBe('default');
    });

    it('returns default for null/undefined', () => {
        expect(resolveIndustry(null)).toBe('default');
        expect(resolveIndustry(undefined)).toBe('default');
    });

    it('is case-insensitive', () => {
        expect(resolveIndustry('TECH')).toBe('tech_electronics');
        expect(resolveIndustry('Fashion')).toBe('fashion_beauty');
        expect(resolveIndustry('FOOD')).toBe('food_restaurant');
    });
});

// ═══════════════════════════════════════════════════════════════
// buildCreativePrompt()
// ═══════════════════════════════════════════════════════════════

describe('buildCreativePrompt', () => {
    const baseBrief = {
        scene: 'A woman checking her smartwatch while jogging through Central Park at sunrise.',
        camera: 'Shot with 35mm lens at f/2.8, low angle, motion captured',
        lighting: 'Golden hour sidelight, warm fill from ground reflection',
        mood: 'Empowering and motivating. The viewer feels inspired to move.',
        colorPalette: '#FF6B6B, #2563EB, #F5F5F5',
        textPlacement: 'Headline top-left on sky area, CTA bottom-center',
        ctaStyle: 'Rounded pill, coral #FF6B6B, energetic',
        colorTemp: '5500K warm',
    };

    const baseAdSpec = {
        productName: 'Smartwatch X Pro',
        offer: 'Premium Fitness Tracker mit GPS',
        audience: 'Fitness-bewusste Millennials',
        industry: 'fitness',
        headline: 'Dein Workout. Dein Level.',
        cta: 'Jetzt starten',
    };

    it('includes product name in the prompt', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('Smartwatch X Pro');
    });

    it('includes AI-generated scene from brief', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('Central Park at sunrise');
        expect(prompt).toContain('35mm lens');
    });

    it('includes headline and CTA text', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('Dein Workout. Dein Level.');
        expect(prompt).toContain('Jetzt starten');
    });

    it('uses fallback preset when brief is null', () => {
        const fallbackPreset = {
            scene: 'Product in energetic context with natural golden light.',
            camera: 'Shot with 50mm lens at f/2.8',
            lighting: 'Bright natural light',
            mood: 'Motivating and empowering',
            ctaStyle: 'Rounded pill, coral',
            colorTemp: '5500K',
        };
        const prompt = buildCreativePrompt({
            brief: null,
            fallbackPreset,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('energetic context');
        expect(prompt).not.toContain('Central Park');
    });

    it('does NOT force CTA default for German when cta is undefined (AI decides)', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: { ...baseAdSpec, cta: undefined, language: 'de' },
            brandKit: {},
        });
        // CTA is now optional — AI Creative Brief decides, no forced default
        expect(prompt).not.toContain('Jetzt entdecken');
    });

    it('does NOT force CTA default for English when cta is undefined (AI decides)', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: { ...baseAdSpec, cta: undefined, language: 'en' },
            brandKit: {},
        });
        // CTA is now optional — AI Creative Brief decides, no forced default
        expect(prompt).not.toContain('Discover Now');
    });

    it('includes safe zone note for story format', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'story',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('SAFE ZONES');
        expect(prompt).toContain('center 72%');
    });

    it('does NOT include safe zone for square format', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).not.toContain('SAFE ZONES');
    });

    it('includes brand colors when provided', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: baseAdSpec,
            brandKit: { palette: ['#FF0000', '#00FF00'] },
        });
        expect(prompt).toContain('#FF0000');
        expect(prompt).toContain('#00FF00');
    });

    it('includes format dimensions', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'portrait',
            adSpec: baseAdSpec,
            brandKit: {},
        });
        expect(prompt).toContain('4:5');
        expect(prompt).toContain('1080×1350');
    });

    it('uses text-free space when no headline is provided', () => {
        const prompt = buildCreativePrompt({
            brief: baseBrief,
            format: 'square',
            adSpec: { ...baseAdSpec, headline: '', productName: '' },
            brandKit: {},
        });
        expect(prompt).toContain('negative space');
    });
});

// ═══════════════════════════════════════════════════════════════
// CONCEPT_TYPES & META_FORMATS constants
// ═══════════════════════════════════════════════════════════════

describe('Constants', () => {
    it('has 72 archetypes (9 categories)', () => {
        expect(CONCEPT_TYPES.length).toBe(72);
    });

    it('each concept type has required fields', () => {
        for (const ct of CONCEPT_TYPES) {
            expect(ct.key).toBeDefined();
            expect(ct.name).toBeDefined();
            expect(ct.briefDirection).toBeDefined();
            expect(ct.briefDirection.length).toBeGreaterThan(20);
        }
    });

    it('has 3 Meta formats', () => {
        expect(Object.keys(META_FORMATS)).toEqual(['square', 'portrait', 'story']);
    });

    it('each format has correct specs', () => {
        expect(META_FORMATS.square.width).toBe(1080);
        expect(META_FORMATS.square.height).toBe(1080);
        expect(META_FORMATS.portrait.ratio).toBe('4:5');
        expect(META_FORMATS.story.ratio).toBe('9:16');
    });
});
