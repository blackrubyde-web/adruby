/**
 * Client-side Background Removal Service
 * Uses @imgly/background-removal via CDN to avoid npm dependency issues.
 * Runs entirely in the browser using WASM.
 */

// Define the interface for the library configuration if necessary
interface Config {
    publicPath?: string;
    debug?: boolean;
    device?: 'cpu' | 'gpu';
    proxyToWorker?: boolean;
    model?: 'small' | 'medium';
}

/**
 * Removes the background from an image file or URL.
 * @param imageSrc File object, Blob, or URL string of the image
 * @returns Promise<Blob> The processed image as a Blob (PNG with transparency)
 */
export async function removeBackground(imageSrc: File | Blob | string, onProgress?: (progress: number) => void): Promise<Blob> {
    console.log('🎭 Starting background removal...');

    try {
        // Dynamic import from CDN
        // validation for types is skipped as we are importing from a URL
        // @ts-ignore
        const imglyRemoveBackground = (await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.4/+esm')).default;

        // Configuration
        const config: Config = {
            // Point the public path to the CDN so it can load the WASM/ONNX files
            publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.4/dist/',
            debug: true,
            model: 'medium' // 'small' is faster, 'medium' is better quality
        };

        // We can't easily hook into the progress of this specific library version exposed via simple function,
        // but if it supports a progress callback in config, we would add it here.
        // Current documentation suggests generic progress tracking might be limited in the simple API,
        // so we'll simulate or just await.

        if (onProgress) onProgress(10); // Start

        const blob = await imglyRemoveBackground(imageSrc, {
            ...config,
            progress: (key: string, current: number, total: number) => {
                if (onProgress) {
                    const percent = Math.round((current / total) * 100);
                    onProgress(percent);
                }
            }
        });

        if (onProgress) onProgress(100); // Finish
        console.log('✅ Background removal complete');
        return blob;

    } catch (error) {
        console.error('❌ Background removal failed:', error);
        throw new Error('Failed to remove background. Please try again or use a different image.');
    }
}

/**
 * Helper to convert Blob to Base64 for display/state
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
