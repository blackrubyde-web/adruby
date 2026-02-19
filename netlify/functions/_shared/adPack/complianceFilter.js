/**
 * Meta Compliance Filter v1.0
 * 
 * Filters copy pack through Meta Advertising Standards:
 * - Blocks prohibited claims (income guarantees, health miracles)
 * - Niche-specific stricter rules for health, finance, dating
 * - Auto-replaces forbidden patterns with compliant alternatives
 * - Returns filtered pack with violation report
 * 
 * Reference: Meta Advertising Standards & Policies (2026)
 */

// ═══════════════════════════════════════════════════════════════
// FORBIDDEN PATTERNS (blocklisted phrases/regex)
// ═══════════════════════════════════════════════════════════════

const UNIVERSAL_BLOCKS = [
    // Income/earnings guarantees
    { pattern: /verdien[e|st|t|en]?\s+\d+.*€/gi, reason: 'Income guarantee claim', replacement: 'Erreiche deine finanziellen Ziele' },
    { pattern: /make\s+\$?\d+/gi, reason: 'Income guarantee claim', replacement: 'Grow your income potential' },
    { pattern: /earn\s+\$?\d+/gi, reason: 'Income guarantee claim', replacement: 'Build your revenue' },
    { pattern: /garantiert(er?|es?)?\s+(einkommen|verdienst|umsatz|gewinn)/gi, reason: 'Guaranteed income', replacement: 'mögliches Einkommen' },
    { pattern: /guaranteed\s+(income|earnings|revenue|profit)/gi, reason: 'Guaranteed income', replacement: 'potential income' },

    // "Get rich quick" indicators
    { pattern: /schnell\s+reich/gi, reason: 'Get rich quick claim', replacement: 'finanziell unabhängig' },
    { pattern: /get\s+rich\s+(quick|fast)/gi, reason: 'Get rich quick claim', replacement: 'build wealth' },
    { pattern: /passive[s]?\s+(einkommen|income)\s+ohne\s+(arbeit|effort)/gi, reason: 'Effortless income claim', replacement: 'passives Einkommen aufbauen' },

    // Unrealistic health claims
    { pattern: /verlier[e|st|t|en]?\s+\d+\s*(kg|kilo|lbs|pfund|pounds)/gi, reason: 'Weight loss guarantee', replacement: 'Unterstütze deine Gesundheitsziele' },
    { pattern: /lose\s+\d+\s*(kg|kilo|lbs|pounds)/gi, reason: 'Weight loss guarantee', replacement: 'Support your health goals' },
    { pattern: /heilt?\s+(krebs|cancer|diabetes|depression)/gi, reason: 'Disease cure claim', replacement: 'unterstützt das Wohlbefinden' },
    { pattern: /cure[s]?\s+(cancer|diabetes|depression|anxiety)/gi, reason: 'Disease cure claim', replacement: 'supports wellness' },
    { pattern: /100%\s*(heilung|cure|wirkung|effective)/gi, reason: 'Absolute efficacy claim', replacement: 'hohe Wirksamkeit' },

    // Personal attributes (Meta policy: no assumptions about personal characteristics)
    { pattern: /bist\s+du\s+(übergewichtig|einsam|pleite|krank|hässlich|dumm)/gi, reason: 'Personal attribute assumption', replacement: 'Möchtest du Veränderung?' },
    { pattern: /are\s+you\s+(overweight|lonely|broke|sick|ugly|stupid)/gi, reason: 'Personal attribute assumption', replacement: 'Ready for a change?' },

    // Misleading superlatives without qualification
    { pattern: /das\s+einzige\s+(produkt|mittel|lösung)/gi, reason: 'Exclusive claim without basis', replacement: 'eine führende Lösung' },
    { pattern: /the\s+only\s+(product|solution|cure)/gi, reason: 'Exclusive claim without basis', replacement: 'a leading solution' },

    // Prohibited content
    { pattern: /wunder(mittel|heilung|pille|diät)/gi, reason: 'Miracle claim', replacement: 'innovative Lösung' },
    { pattern: /miracle\s*(cure|pill|diet|solution)/gi, reason: 'Miracle claim', replacement: 'innovative solution' },
];

// ═══════════════════════════════════════════════════════════════
// NICHE-SPECIFIC BLOCKS
// ═══════════════════════════════════════════════════════════════

const NICHE_BLOCKS = {
    health: [
        { pattern: /klinisch\s+(bewiesen|getestet)/gi, reason: 'Unverified clinical claim', replacement: 'nach wissenschaftlichen Standards entwickelt' },
        { pattern: /clinically\s+(proven|tested)/gi, reason: 'Unverified clinical claim', replacement: 'developed to scientific standards' },
        { pattern: /ärzt(lich|e)\s+(empfohlen|approved)/gi, reason: 'Unverified medical endorsement', replacement: 'von Experten geschätzt' },
        { pattern: /doctor\s+(recommended|approved)/gi, reason: 'Unverified medical endorsement', replacement: 'expert-recommended' },
        { pattern: /nebenwirkungsfrei/gi, reason: 'No side effects claim', replacement: 'gut verträglich' },
        { pattern: /no\s+side\s+effects/gi, reason: 'No side effects claim', replacement: 'well-tolerated' },
        { pattern: /\d+%\s*(weniger|less)\s*(schmerz|pain|symptom)/gi, reason: 'Quantified symptom reduction', replacement: 'kann Beschwerden lindern' },
        { pattern: /vorher[- ]nachher|before[- ]after/gi, reason: 'Before/after body transformation', replacement: 'Erfahrungsberichte' },
    ],
    finance: [
        { pattern: /rendite\s+von\s+\d+%/gi, reason: 'Specific return claim', replacement: 'attraktive Renditechancen' },
        { pattern: /\d+%\s*return/gi, reason: 'Specific return claim', replacement: 'attractive return potential' },
        { pattern: /risikofrei(es?)?\s*(investment|anlage|geldanlage)/gi, reason: 'Risk-free investment claim', replacement: 'durchdachte Anlagestrategie' },
        { pattern: /risk[- ]free\s*(investment|trading)/gi, reason: 'Risk-free investment claim', replacement: 'considered investment strategy' },
        { pattern: /finanzielle\s+freiheit\s+in\s+\d+/gi, reason: 'Financial freedom timeline', replacement: 'finanzielle Unabhängigkeit anstreben' },
        { pattern: /financial\s+freedom\s+in\s+\d+/gi, reason: 'Financial freedom timeline', replacement: 'work towards financial independence' },
    ],
    dating: [
        { pattern: /partner\s+garantiert/gi, reason: 'Guaranteed partner claim', replacement: 'deine Chancen erhöhen' },
        { pattern: /guaranteed\s+(match|partner|date)/gi, reason: 'Guaranteed match claim', replacement: 'improve your chances' },
        { pattern: /\d+\s*(dates?|matches)\s+(in|within)\s+\d+/gi, reason: 'Quantified dating results', replacement: 'meaningful connections' },
        { pattern: /einsam(keit)?\s+(beenden|überwinden|stoppen)/gi, reason: 'Loneliness assumption', replacement: 'Verbindungen aufbauen' },
    ],
};

// ═══════════════════════════════════════════════════════════════
// MAIN FILTER
// ═══════════════════════════════════════════════════════════════

/**
 * Filter a copy pack for Meta compliance.
 * 
 * @param {Object} copyPack - The copy pack from copyPackGenerator
 * @param {string} [niche='general'] - The niche (health, finance, dating, general)
 * @returns {{ passed: boolean, filtered: Object, violations: Object[], stats: Object }}
 */
export function filterForCompliance(copyPack, niche = 'general') {
    const violations = [];
    const stats = { totalChecked: 0, totalFiltered: 0, totalBlocked: 0 };

    // Build the combined blocklist
    const blocks = [...UNIVERSAL_BLOCKS];
    if (NICHE_BLOCKS[niche]) {
        blocks.push(...NICHE_BLOCKS[niche]);
    }

    const filtered = { ...copyPack };

    // Filter each text field in the copy pack
    const textArrays = ['primaryTexts', 'headlines', 'descriptions', 'ctas', 'ugcVariants', 'drVariants'];

    for (const arrayName of textArrays) {
        if (!Array.isArray(filtered[arrayName])) continue;

        filtered[arrayName] = filtered[arrayName].map((item, index) => {
            stats.totalChecked++;
            const result = filterText(item.text, blocks);

            if (result.violations.length > 0) {
                stats.totalFiltered++;
                for (const v of result.violations) {
                    violations.push({
                        field: arrayName,
                        index,
                        originalText: item.text.substring(0, 80) + (item.text.length > 80 ? '...' : ''),
                        ...v,
                    });
                }
                return { ...item, text: result.cleaned, _complianceEdited: true };
            }

            return item;
        });
    }

    const passed = violations.length === 0;

    console.log(`[ComplianceFilter] Niche: ${niche} | Checked: ${stats.totalChecked} | Filtered: ${stats.totalFiltered} | Violations: ${violations.length} | Passed: ${passed}`);

    return {
        passed,
        filtered,
        violations,
        stats: {
            ...stats,
            niche,
            violationCount: violations.length,
        },
    };
}

/**
 * Filter a single text string against blocklist.
 */
function filterText(text, blocks) {
    if (!text || typeof text !== 'string') return { cleaned: text || '', violations: [] };

    let cleaned = text;
    const violations = [];

    for (const block of blocks) {
        if (block.pattern.test(cleaned)) {
            violations.push({
                reason: block.reason,
                matched: cleaned.match(block.pattern)?.[0] || 'unknown',
                replacement: block.replacement,
            });
            // Reset lastIndex (global regex quirk)
            block.pattern.lastIndex = 0;
            cleaned = cleaned.replace(block.pattern, block.replacement);
        }
        // Reset lastIndex for next call
        block.pattern.lastIndex = 0;
    }

    return { cleaned, violations };
}

/**
 * Quick check if a single string has any compliance issues.
 * Useful for real-time validation in the UI.
 */
export function quickCheck(text, niche = 'general') {
    const blocks = [...UNIVERSAL_BLOCKS];
    if (NICHE_BLOCKS[niche]) {
        blocks.push(...NICHE_BLOCKS[niche]);
    }

    const result = filterText(text, blocks);
    return {
        clean: result.violations.length === 0,
        violations: result.violations,
    };
}

export default {
    filterForCompliance,
    quickCheck,
};
