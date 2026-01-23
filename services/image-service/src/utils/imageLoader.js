/**
 * Image Loader - Fetch and validate product images
 */

/**
 * Fetch product image from URL
 */
export async function fetchProductImage(url) {
    console.log('[ImageLoader] Fetching product image...');

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('[ImageLoader] ✅ Image loaded:', buffer.length, 'bytes');
        return buffer;

    } catch (error) {
        console.error('[ImageLoader] ❌ Failed:', error.message);
        throw error;
    }
}

export default { fetchProductImage };
