/**
 * PROFANITY FILTER
 * Content safety validation for ad copy
 * 
 * Features:
 * - Multilingual word blacklist
 * - Context-aware filtering
 * - Severity scoring
 * - Alternative suggestions
 */

export interface ProfanityCheckResult {
    clean: boolean;
    violations: Array<{
        word: string;
        position: number;
        severity: 'mild' | 'moderate' | 'severe';
        context: string;
    }>;
    score: number; // 0-100 (100 = completely clean)
    suggestions: string[];
}

/**
 * Profanity word list (simplified - production would use comprehensive list)
 */
const PROFANITY_LIST: Record<string, 'mild' | 'moderate' | 'severe'> = {
    // Mild
    'damn': 'mild',
    'hell': 'mild',
    'crap': 'mild',

    // Moderate
    'ass': 'moderate',
    'bitch': 'moderate',
    'bastard': 'moderate',

    // Severe
    'fuck': 'severe',
    'shit': 'severe',
    // ... (would include comprehensive list)
};

/**
 * False positives (allowed in certain contexts)
 */
const FALSE_POSITIVES: Record<string, string[]> = {
    'ass': ['class', 'glass', 'mass', 'pass', 'assess', 'assignment'],
    'hell': ['hello', 'shell', 'hellenic']
};

/**
 * Check if word is in false positive context
 */
function isFalsePositive(word: string, fullText: string, position: number): boolean {
    const lowerWord = word.toLowerCase();

    if (!FALSE_POSITIVES[lowerWord]) return false;

    // Check if word is part of a larger allowed word
    const allowedWords = FALSE_POSITIVES[lowerWord];

    for (const allowed of allowedWords) {
        const startPos = position - (allowed.indexOf(lowerWord));
        if (startPos >= 0 && startPos + allowed.length <= fullText.length) {
            const extractedWord = fullText.substring(startPos, startPos + allowed.length).toLowerCase();
            if (extractedWord === allowed) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check text for profanity
 */
export function checkProfanity(text: string): ProfanityCheckResult {
    if (!text || text.trim().length === 0) {
        return {
            clean: true,
            violations: [],
            score: 100,
            suggestions: []
        };
    }

    const violations: ProfanityCheckResult['violations'] = [];
    const lowerText = text.toLowerCase();
    let score = 100;

    // Check each word in the blacklist
    for (const [word, severity] of Object.entries(PROFANITY_LIST)) {
        let index = lowerText.indexOf(word);

        while (index !== -1) {
            // Check if it's a false positive
            if (!isFalsePositive(word, lowerText, index)) {
                // Extract context (20 chars before and after)
                const contextStart = Math.max(0, index - 20);
                const contextEnd = Math.min(text.length, index + word.length + 20);
                const context = text.substring(contextStart, contextEnd);

                violations.push({
                    word,
                    position: index,
                    severity,
                    context: `...${context}...`
                });

                // Deduct score based on severity
                if (severity === 'severe') score -= 30;
                else if (severity === 'moderate') score -= 20;
                else score -= 10;
            }

            index = lowerText.indexOf(word, index + 1);
        }
    }

    score = Math.max(0, score);

    // Generate suggestions
    const suggestions: string[] = [];

    if (violations.length > 0) {
        suggestions.push('Remove or replace inappropriate language to comply with advertising standards.');

        const severeViolations = violations.filter(v => v.severity === 'severe');
        if (severeViolations.length > 0) {
            suggestions.push('⚠️ SEVERE: Ad will be rejected by most platforms. Immediate revision required.');
        }
    }

    return {
        clean: violations.length === 0,
        violations,
        score,
        suggestions
    };
}

/**
 * Sanitize text by removing profanity
 */
export function sanitizeText(text: string, replacement: string = '***'): string {
    let sanitized = text;

    for (const word of Object.keys(PROFANITY_LIST)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        sanitized = sanitized.replace(regex, replacement);
    }

    return sanitized;
}

/**
 * Batch check multiple text fields
 */
export function checkAdCopy(copy: {
    headline?: string;
    description?: string;
    cta?: string;
}): {
    overall: ProfanityCheckResult;
    individual: Record<string, ProfanityCheckResult>;
} {
    const individual: Record<string, ProfanityCheckResult> = {};

    if (copy.headline) {
        individual.headline = checkProfanity(copy.headline);
    }
    if (copy.description) {
        individual.description = checkProfanity(copy.description);
    }
    if (copy.cta) {
        individual.cta = checkProfanity(copy.cta);
    }

    // Calculate overall
    const allViolations = Object.values(individual).flatMap(r => r.violations);
    const avgScore = Object.values(individual).reduce((sum, r) => sum + r.score, 0) / Object.values(individual).length;
    const allSuggestions = [...new Set(Object.values(individual).flatMap(r => r.suggestions))];

    return {
        overall: {
            clean: allViolations.length === 0,
            violations: allViolations,
            score: Math.round(avgScore),
            suggestions: allSuggestions
        },
        individual
    };
}
