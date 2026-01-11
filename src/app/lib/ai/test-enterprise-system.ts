/**
 * ENTERPRISE AD GENERATION TEST SUITE
 * Validates all components of the Layout Engine V2
 */

/* eslint-disable no-console */

import { composeAd, generateVariants } from './layout/layout-engine-v2';
import { scoreVisualBalance } from './quality/visual-balance';
import { validateContrast } from './color/contrast-validator';
import { findOptimalFontSize } from './typography/font-measurement';

console.log('🧪 Starting Enterprise Ad Generation Test Suite...\n');

// TEST 1: Grid System & Template Generation
console.log('=== TEST 1: Template Generation ===');
const testInput1 = {
    headline: 'Premium Wireless Headphones',
    description: 'Studio-quality sound meets unmatched comfort',
    ctaText: 'Shop Now',
    productName: 'AudioMax Pro',
    brandName: 'SoundTech',
    tone: 'minimal' as const,
    colors: {
        primary: '#000000',
        text: '#1A1A1A',
        background: '#FFFFFF',
        accent: '#3B82F6'
    }
};

composeAd(testInput1).then(result => {
    console.log(`✓ Template: ${result.metadata.template}`);
    console.log(`✓ Layers generated: ${result.adDocument.layers.length}`);
    console.log(`✓ Balance score: ${result.quality.balanceScore}/100`);
    console.log(`✓ Accessibility: ${result.quality.accessibilityPassed ? 'PASS' : 'FAIL'}`);

    if (result.quality.issues.length > 0) {
        console.log(`⚠️  Issues found:`);
        result.quality.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    console.log('');
});

// TEST 2: Font Measurement
console.log('=== TEST 2: Font Measurement ===');
const longHeadline = 'This is an extremely long headline that should trigger smart font scaling to prevent overflow issues in the layout';
const shortHeadline = 'Short Title';

const longMetrics = findOptimalFontSize(longHeadline, {
    maxWidth: 920,
    maxHeight: 200,
    minFontSize: 40,
    maxFontSize: 100
});

const shortMetrics = findOptimalFontSize(shortHeadline, {
    maxWidth: 920,
    maxHeight: 200,
    minFontSize: 40,
    maxFontSize: 100
});

console.log(`Long headline (${longHeadline.length} chars): ${longMetrics.fontSize}px`);
console.log(`Short headline (${shortHeadline.length} chars): ${shortMetrics.fontSize}px`);
console.log(`✓ Font scales correctly (long < short): ${longMetrics.fontSize < shortMetrics.fontSize}\n`);

// TEST 3: Accessibility (WCAG Contrast)
console.log('=== TEST 3: WCAG Contrast Validation ===');
const contrastTests = [
    { fg: '#FFFFFF', bg: '#000000', name: 'White on Black' },
    { fg: '#000000', bg: '#FFFFFF', name: 'Black on White' },
    { fg: '#888888', bg: '#AAAAAA', name: 'Gray on Gray (should fail)' },
    { fg: '#3B82F6', bg: '#FFFFFF', name: 'Blue on White' }
];

contrastTests.forEach(test => {
    const result = validateContrast(test.fg, test.bg, 16, 400);
    console.log(`${test.name}: ${result.ratio.toFixed(2)}:1 - ${result.passes.AA ? '✓ PASS' : '✗ FAIL'}`);
});
console.log('');

// TEST 4: A/B Variant Generation
console.log('=== TEST 4: A/B Variant Generation ===');
generateVariants(testInput1, 3).then(variants => {
    console.log(`✓ Generated ${variants.length} variants`);
    variants.forEach((variant, idx) => {
        console.log(`  Variant ${idx + 1}: ${variant.metadata.template} (score: ${variant.quality.balanceScore})`);
    });
    console.log('');

    // TEST 5: Visual Balance
    console.log('=== TEST 5: Visual Balance Scoring ===');
    variants.forEach((variant, idx) => {
        const balance = scoreVisualBalance(variant.adDocument.layers, 1080, 1080);
        console.log(`Variant ${idx + 1} Balance Breakdown:`);
        console.log(`  - Overall: ${balance.overall}/100`);
        console.log(`  - Horizontal: ${balance.breakdown.horizontalBalance}/100`);
        console.log(`  - Vertical: ${balance.breakdown.verticalBalance}/100`);
        console.log(`  - Spacing: ${balance.breakdown.spacing}/100`);
        console.log(`  - No Overlaps: ${balance.breakdown.overlapFree}/100`);
        console.log(`  - Whitespace: ${balance.breakdown.whitespace}/100`);
    });

    console.log('\n✅ All tests complete!');
});
