/**
 * Unit tests for Meta Compliance Filter
 * Tests universal blocks, niche-specific blocks, and auto-replacement.
 */

import { describe, it, expect } from 'vitest';
import { filterForCompliance, quickCheck } from '../netlify/functions/_shared/adPack/complianceFilter.js';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function makeCopyPack(overrides = {}) {
    return {
        primaryTexts: overrides.primaryTexts || [{ text: 'Clean primary text about a great product.', hookType: 'BENEFIT' }],
        headlines: overrides.headlines || [{ text: 'A Great Product', angle: 'benefit' }],
        descriptions: overrides.descriptions || [{ text: 'Discover our innovative solution.', focus: 'product' }],
        ctas: overrides.ctas || [{ text: 'Jetzt entdecken', type: 'action' }],
        ugcVariants: overrides.ugcVariants || [{ text: 'Love this product!', style: 'testimonial' }],
        drVariants: overrides.drVariants || [{ text: 'Data shows better results.', style: 'data_driven' }],
    };
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL BLOCKS
// ═══════════════════════════════════════════════════════════════

describe('Universal Compliance Blocks', () => {
    it('should pass clean copy without violations', () => {
        const pack = makeCopyPack();
        const result = filterForCompliance(pack);
        expect(result.passed).toBe(true);
        expect(result.violations).toHaveLength(0);
    });

    it('should block income guarantee claims (German)', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Verdiene 5000€ pro Monat mit unserem System!', hookType: 'STAT' }],
        });
        const result = filterForCompliance(pack);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0].reason).toContain('Income guarantee');
    });

    it('should block income guarantee claims (English)', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Make $10000 per month easily with our program.', hookType: 'STAT' }],
        });
        const result = filterForCompliance(pack);
        expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should block weight loss guarantees', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Verliere 10 kg in nur 2 Wochen!', hookType: 'STAT' }],
        });
        const result = filterForCompliance(pack);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0].reason).toContain('Weight loss');
    });

    it('should block miracle claims', () => {
        const pack = makeCopyPack({
            descriptions: [{ text: 'Unsere Wunderheilung löst all deine Probleme.', focus: 'product' }],
        });
        const result = filterForCompliance(pack);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0].reason).toContain('Miracle');
    });

    it('should block personal attribute assumptions', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Bist du übergewichtig? Wir haben die Lösung.', hookType: 'QUESTION' }],
        });
        const result = filterForCompliance(pack);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0].reason).toContain('Personal attribute');
    });

    it('should auto-replace blocked content with compliant alternative', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Verdiene 5000€ pro Monat garantiert!', hookType: 'STAT' }],
        });
        const result = filterForCompliance(pack);
        expect(result.filtered.primaryTexts[0].text).not.toContain('Verdiene 5000€');
        expect(result.filtered.primaryTexts[0]._complianceEdited).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// NICHE-SPECIFIC BLOCKS
// ═══════════════════════════════════════════════════════════════

describe('Health Niche Compliance', () => {
    it('should block unverified clinical claims in health niche', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Klinisch bewiesen: Unsere Creme wirkt in 3 Tagen.', hookType: 'AUTHORITY' }],
        });
        const result = filterForCompliance(pack, 'health');
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0].reason).toContain('clinical');
    });

    it('should not block clinical claims in general niche', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Klinisch bewiesen: Unsere Software ist schneller.', hookType: 'AUTHORITY' }],
        });
        const result = filterForCompliance(pack, 'general');
        // "klinisch bewiesen" is only blocked in health niche
        expect(result.violations).toHaveLength(0);
    });
});

describe('Finance Niche Compliance', () => {
    it('should block specific return claims in finance niche', () => {
        const pack = makeCopyPack({
            primaryTexts: [{ text: 'Rendite von 25% garantiert mit unserem Fund.', hookType: 'STAT' }],
        });
        const result = filterForCompliance(pack, 'finance');
        expect(result.violations.length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════
// QUICK CHECK
// ═══════════════════════════════════════════════════════════════

describe('Quick Check', () => {
    it('should return clean for compliant text', () => {
        const result = quickCheck('Entdecke unsere innovative Lösung für bessere Ergebnisse.');
        expect(result.clean).toBe(true);
    });

    it('should flag non-compliant text', () => {
        const result = quickCheck('Verdiene 10000€ pro Monat!');
        expect(result.clean).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
    });
});
