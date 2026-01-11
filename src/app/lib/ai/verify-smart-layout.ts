/* eslint-disable no-console */
import { SmartLayoutEngine, type SmartLayoutInput } from './smart-layout-engine.ts';
import type { TextLayer } from '../../types/studio';

/**
 * VERIFICATION SCRIPT
 * Run this to verify that the Smart Ad Engine produces valid, dynamic layouts.
 * Usage: ts-node verify-smart-layout.ts
 */

const mockColors = {
    primary: '#FF0000',
    text: '#000000',
    background: '#FFFFFF',
    accent: '#00FF00'
};

const testCases: SmartLayoutInput[] = [
    {
        productName: 'Short Product',
        headline: 'SHORT HEADLINE',
        ctaText: 'BUY NOW',
        colors: mockColors,
        font: 'Inter',
        styleVibe: 'bold'
    },
    {
        productName: 'Long Product',
        headline: 'THIS IS A VERY LONG HEADLINE THAT SHOULD TRIGGER FONT SCALING LOGIC TO PREVENT OVERFLOW',
        ctaText: 'LEARN MORE',
        colors: mockColors,
        font: 'Inter',
        styleVibe: 'minimal'
    }
];

function runTests() {
    console.log('🧪 Starting Smart Layout Engine Tests...\n');

    testCases.forEach((input, index) => {
        console.log(`[Test Case ${index + 1}] Headline: "${input.headline.substring(0, 20)}..."`);

        try {
            const result = SmartLayoutEngine.compose(input);

            // 1. Check Document Structure
            if (result.width !== 1080 || result.height !== 1080) {
                console.error('FAIL: Invalid dimensions');
                return;
            }

            // 2. Check Headline Font Size logic
            const headlineLayer = result.layers.find(
                (l): l is TextLayer => l.name === 'Headline' && l.type === 'text'
            );
            if (!headlineLayer) {
                console.error('FAIL: No Headline layer found');
                return;
            }

            console.log(`   Headline Font Size: ${headlineLayer.fontSize}px`);

            // Verify logic: Long headline should have smaller font
            if (input.headline.length > 50 && headlineLayer.fontSize >= 120) {
                console.error('FAIL: Font size did not scale down for long text');
            } else if (input.headline.length < 20 && headlineLayer.fontSize < 120) {
                console.warn('WARN: Font size might be too small for short text');
            } else {
                console.log('   PASS: Font scaling looks correct');
            }

            // 3. Check CTA
            const ctaLayer = result.layers.find(l => l.type === 'cta');
            if (ctaLayer) {
                console.log('   PASS: CTA Layer present');
            } else {
                console.error('FAIL: CTA Missing');
            }

        } catch (e) {
            console.error('FAIL: Engine crashed', e);
        }
        console.log('-----------------------------------');
    });

    console.log('✅ Verification Complete.');
}

runTests();
