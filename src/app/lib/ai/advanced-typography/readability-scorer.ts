/**
 * READABILITY SCORER
 * Comprehensive readability analysis using multiple metrics
 * 
 * Features:
 * - Flesch-Kincaid Grade Level
 * - Average sentence length
 * - Syllable count analysis
 * - Visual complexity score
 * - Reading time estimation
 */

export interface ReadabilityScore {
    grade: number;           // Reading grade level (1-16+)
    flesch: number;          // Flesch Reading Ease (0-100, higher = easier)
    avgSentenceLength: number;
    avgSyllablesPerWord: number;
    readingTimeSeconds: number;
    visualComplexity: number; // 0-100
    overallScore: number;    // 0-100 (100 = perfect)
    recommendations: string[];
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;

    // Remove non-letters
    word = word.replace(/[^a-z]/g, '');

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 0;

    // Adjust for common patterns
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    if (count === 0) count = 1;

    return count;
}

/**
 * Calculate Flesch Reading Ease
 * Formula: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
 * Score: 0-100 (higher = easier)
 */
function calculateFleschReadingEase(
    totalWords: number,
    totalSentences: number,
    totalSyllables: number
): number {
    if (totalWords === 0 || totalSentences === 0) return 0;

    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
 */
function calculateGradeLevel(
    totalWords: number,
    totalSentences: number,
    totalSyllables: number
): number {
    if (totalWords === 0 || totalSentences === 0) return 0;

    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;

    const grade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
    return Math.max(1, Math.min(16, grade));
}

/**
 * Estimate reading time (assuming 200 WPM)
 */
function estimateReadingTime(wordCount: number): number {
    const wordsPerSecond = 200 / 60; // 200 WPM
    return Math.ceil(wordCount / wordsPerSecond);
}

/**
 * Score text readability
 */
export function scoreReadability(text: string): ReadabilityScore {
    if (!text || text.trim().length === 0) {
        return {
            grade: 0,
            flesch: 0,
            avgSentenceLength: 0,
            avgSyllablesPerWord: 0,
            readingTimeSeconds: 0,
            visualComplexity: 0,
            overallScore: 0,
            recommendations: ['No text to analyze']
        };
    }

    // Tokenize
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);

    const totalSentences = Math.max(1, sentences.length);
    const totalWords = words.length;
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

    // Calculate metrics
    const flesch = calculateFleschReadingEase(totalWords, totalSentences, totalSyllables);
    const grade = calculateGradeLevel(totalWords, totalSentences, totalSyllables);
    const avgSentenceLength = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;
    const readingTimeSeconds = estimateReadingTime(totalWords);

    // Visual complexity (based on text density)
    const visualComplexity = Math.min(100, (totalWords / 10) * 10); // Dense text = high complexity

    // Overall score (prefer grade 6-8 for ads)
    let overallScore = 0;

    if (grade >= 6 && grade <= 8) {
        overallScore += 40; // Ideal grade level
    } else if (grade < 6) {
        overallScore += 35; // Too simple
    } else {
        overallScore += 20; // Too complex
    }

    if (flesch >= 60) {
        overallScore += 30; // Good readability
    } else if (flesch >= 50) {
        overallScore += 20;
    }

    if (totalWords <= 30) {
        overallScore += 30; // Concise
    } else if (totalWords <= 50) {
        overallScore += 20;
    }

    // Recommendations
    const recommendations: string[] = [];

    if (grade > 10) {
        recommendations.push('Text is too complex. Simplify vocabulary and shorten sentences.');
    }
    if (grade < 5) {
        recommendations.push('Text may be too simple. Add more descriptive language.');
    }
    if (avgSentenceLength > 20) {
        recommendations.push('Sentences are too long. Aim for 10-15 words per sentence.');
    }
    if (totalWords > 50) {
        recommendations.push('Text is too long for an ad. Aim for under 30 words.');
    }
    if (flesch < 60) {
        recommendations.push('Improve readability by using shorter words and sentences.');
    }

    return {
        grade: Math.round(grade * 10) / 10,
        flesch: Math.round(flesch),
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
        readingTimeSeconds,
        visualComplexity: Math.round(visualComplexity),
        overallScore: Math.round(overallScore),
        recommendations
    };
}

/**
 * Score multiple text elements (combined)
 */
export function scoreCombinedReadability(texts: Record<string, string>): {
    individual: Record<string, ReadabilityScore>;
    combined: ReadabilityScore;
} {
    const individual: Record<string, ReadabilityScore> = {};

    for (const [key, text] of Object.entries(texts)) {
        individual[key] = scoreReadability(text);
    }

    // Combined text
    const combinedText = Object.values(texts).join(' ');
    const combined = scoreReadability(combinedText);

    return { individual, combined };
}
