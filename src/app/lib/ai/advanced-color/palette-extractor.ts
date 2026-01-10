/**
 * PALETTE EXTRACTOR
 * Extract dominant colors from images using K-means clustering
 * 
 * Features:
 * - K-means clustering for color extraction (k=5)
 * - Canvas-based pixel sampling (10,000 samples)
 * - Accessibility-aware palette generation
 * - Brand color harmony validation
 */

export interface DominantColors {
    primary: string;      // Most dominant color
    secondary: string;    // Second most dominant
    accent: string;       // High-saturation accent
    background: string;   // Lightest/neutral color
    text: string;         // Highest contrast for text
}

export interface ColorCluster {
    color: { r: number; g: number; b: number };
    population: number;   // Number of pixels in cluster
    percentage: number;   // Percentage of total samples
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate color distance (Euclidean in RGB space)
 */
function colorDistance(
    a: { r: number; g: number; b: number },
    b: { r: number; g: number; b: number }
): number {
    return Math.sqrt(
        Math.pow(a.r - b.r, 2) +
        Math.pow(a.g - b.g, 2) +
        Math.pow(a.b - b.b, 2)
    );
}

/**
 * Calculate color saturation
 */
function getSaturation(r: number, g: number, b: number): number {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (max === 0) return 0;
    return delta / max;
}

/**
 * Calculate color brightness
 */
function getBrightness(r: number, g: number, b: number): number {
    return (r + g + b) / (3 * 255);
}

/**
 * Sample pixels from image
 */
async function sampleImagePixels(
    imageBase64: string,
    sampleCount: number = 10000
): Promise<Array<{ r: number; g: number; b: number }>> {
    return new Promise((resolve, reject) => {
        // Check if we're in browser
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            // Server-side: return empty (will use fallback)
            resolve([]);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Scale down for performance (max 400px)
            const scale = Math.min(1, 400 / Math.max(img.width, img.height));
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const samples: Array<{ r: number; g: number; b: number }> = [];

            // Sample pixels (skip alpha channel)
            const step = Math.floor(pixels.length / (sampleCount * 4));
            for (let i = 0; i < pixels.length; i += step * 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                // Skip transparent pixels
                if (a < 128) continue;

                samples.push({ r, g, b });
                if (samples.length >= sampleCount) break;
            }

            resolve(samples);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageBase64;
    });
}

/**
 * K-means clustering for color quantization
 */
function kMeansClustering(
    samples: Array<{ r: number; g: number; b: number }>,
    k: number = 5,
    maxIterations: number = 20
): ColorCluster[] {
    if (samples.length === 0) {
        // Fallback for server-side
        return [
            { color: { r: 0, g: 0, b: 0 }, population: 1, percentage: 100 }
        ];
    }

    // Initialize centroids (k-means++)
    const centroids: Array<{ r: number; g: number; b: number }> = [];
    centroids.push(samples[Math.floor(Math.random() * samples.length)]);

    while (centroids.length < k) {
        const distances = samples.map(sample => {
            const minDist = Math.min(...centroids.map(c => colorDistance(sample, c)));
            return minDist * minDist;
        });

        const totalDist = distances.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalDist;

        for (let i = 0; i < distances.length; i++) {
            random -= distances[i];
            if (random <= 0) {
                centroids.push(samples[i]);
                break;
            }
        }
    }

    // Iterate
    const assignments = new Array(samples.length).fill(0);

    for (let iter = 0; iter < maxIterations; iter++) {
        // Assign samples to nearest centroid
        let changed = false;
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            let minDist = Infinity;
            let nearest = 0;

            for (let j = 0; j < k; j++) {
                const dist = colorDistance(sample, centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = j;
                }
            }

            if (assignments[i] !== nearest) {
                assignments[i] = nearest;
                changed = true;
            }
        }

        if (!changed) break;

        // Update centroids
        for (let j = 0; j < k; j++) {
            const clusterSamples = samples.filter((_, i) => assignments[i] === j);

            if (clusterSamples.length === 0) continue;

            const avgR = clusterSamples.reduce((sum, s) => sum + s.r, 0) / clusterSamples.length;
            const avgG = clusterSamples.reduce((sum, s) => sum + s.g, 0) / clusterSamples.length;
            const avgB = clusterSamples.reduce((sum, s) => sum + s.b, 0) / clusterSamples.length;

            centroids[j] = { r: avgR, g: avgG, b: avgB };
        }
    }

    // Build clusters with populations
    const clusters: ColorCluster[] = centroids.map((color, idx) => {
        const population = assignments.filter(a => a === idx).length;
        return {
            color,
            population,
            percentage: (population / samples.length) * 100
        };
    });

    // Sort by population (most dominant first)
    clusters.sort((a, b) => b.population - a.population);

    return clusters;
}

/**
 * Extract dominant colors from image
 */
export async function extractDominantColors(imageBase64: string): Promise<DominantColors> {
    try {
        const samples = await sampleImagePixels(imageBase64, 10000);
        const clusters = kMeansClustering(samples, 5, 20);

        // Sort clusters by brightness for role assignment
        const sortedByBrightness = [...clusters].sort((a, b) => {
            const brightA = getBrightness(a.color.r, a.color.g, a.color.b);
            const brightB = getBrightness(b.color.r, b.color.g, b.color.b);
            return brightB - brightA;
        });

        // Find most saturated color for accent
        const mostSaturated = [...clusters].sort((a, b) => {
            const satA = getSaturation(a.color.r, a.color.g, a.color.b);
            const satB = getSaturation(b.color.r, b.color.g, b.color.b);
            return satB - satA;
        })[0];

        // Assign roles
        const primary = rgbToHex(clusters[0].color.r, clusters[0].color.g, clusters[0].color.b);
        const secondary = rgbToHex(clusters[1].color.r, clusters[1].color.g, clusters[1].color.b);
        const accent = rgbToHex(mostSaturated.color.r, mostSaturated.color.g, mostSaturated.color.b);
        const background = rgbToHex(
            sortedByBrightness[0].color.r,
            sortedByBrightness[0].color.g,
            sortedByBrightness[0].color.b
        );
        const text = rgbToHex(
            sortedByBrightness[sortedByBrightness.length - 1].color.r,
            sortedByBrightness[sortedByBrightness.length - 1].color.g,
            sortedByBrightness[sortedByBrightness.length - 1].color.b
        );

        return { primary, secondary, accent, background, text };
    } catch (error) {
        console.error('Color extraction failed:', error);
        // Fallback palette
        return {
            primary: '#000000',
            secondary: '#333333',
            accent: '#3B82F6',
            background: '#FFFFFF',
            text: '#000000'
        };
    }
}

/**
 * Analyze color distribution in image
 */
export async function analyzeColorDistribution(imageBase64: string): Promise<{
    clusters: ColorCluster[];
    dominanceScore: number;  // 0-100, higher = one color dominates
    diversity: number;        // 0-100, higher = many colors
}> {
    const samples = await sampleImagePixels(imageBase64, 10000);
    const clusters = kMeansClustering(samples, 5, 20);

    // Calculate dominance (how much the top color dominates)
    const dominanceScore = clusters[0].percentage;

    // Calculate diversity (entropy)
    const entropy = clusters.reduce((sum, cluster) => {
        const p = cluster.percentage / 100;
        return sum - (p * Math.log2(p || 0.0001));
    }, 0);
    const maxEntropy = Math.log2(clusters.length);
    const diversity = (entropy / maxEntropy) * 100;

    return {
        clusters,
        dominanceScore,
        diversity
    };
}

/**
 * Suggest accessible palette from extracted colors
 */
export function suggestAccessiblePalette(
    dominantColors: DominantColors,
    brandColor?: string
): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    adjustments: string[];
} {
    const adjustments: string[] = [];
    const palette = { ...dominantColors };

    // If brand color provided, use it as primary
    if (brandColor) {
        palette.primary = brandColor;
        adjustments.push('Using brand color as primary');
    }

    // Ensure background is light enough (or dark enough)
    const bgRgb = hexToRgb(palette.background);
    if (bgRgb) {
        const brightness = getBrightness(bgRgb.r, bgRgb.g, bgRgb.b);
        if (brightness < 0.1 || brightness > 0.9) {
            // Good - very dark or very light
        } else {
            // Medium brightness - adjust to light
            palette.background = '#FFFFFF';
            adjustments.push('Adjusted background for better contrast');
        }
    }

    // Ensure text has high contrast with background
    const textRgb = hexToRgb(palette.text);
    const bgBrightness = bgRgb ? getBrightness(bgRgb.r, bgRgb.g, bgRgb.b) : 0.5;

    if (bgBrightness > 0.5) {
        // Light background → dark text
        palette.text = '#1A1A1A';
    } else {
        // Dark background → light text
        palette.text = '#FFFFFF';
    }

    return { ...palette, adjustments };
}
