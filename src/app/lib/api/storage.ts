import { supabase } from '../supabaseClient';

/**
 * Upload an image URL to Supabase Storage
 * Downloads the image from the URL and uploads it to the ad-images bucket
 * 
 * @param imageUrl - URL of the image to download (e.g., from OpenAI)
 * @param userId - User ID for organizing files
 * @returns Public URL of the uploaded image in Supabase Storage
 */
export async function uploadImageToStorage(
    imageUrl: string,
    userId?: string
): Promise<string> {
    try {
        // 1. Download image from URL
        console.log('📥 Downloading image from:', imageUrl);
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('✅ Image downloaded, size:', (blob.size / 1024).toFixed(2), 'KB');

        // 2. Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const extension = blob.type.split('/')[1] || 'png';
        const fileName = userId
            ? `${userId}/${timestamp}-${randomId}.${extension}`
            : `${timestamp}-${randomId}.${extension}`;

        // 3. Upload to Supabase Storage
        console.log('📤 Uploading to Supabase Storage:', fileName);
        const { data, error } = await supabase.storage
            .from('ad-images')
            .upload(fileName, blob, {
                contentType: blob.type,
                cacheControl: '31536000', // 1 year cache
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw new Error(`Failed to upload to storage: ${error.message}`);
        }

        // 4. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);

        console.log('✅ Image uploaded successfully:', publicUrl);

        return publicUrl;

    } catch (error) {
        console.error('Failed to upload image to storage:', error);
        throw error;
    }
}

/**
 * Delete an image from Supabase Storage
 * 
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
    try {
        // Extract file path from public URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/ad-images/');

        if (pathParts.length !== 2) {
            throw new Error('Invalid image URL format');
        }

        const filePath = pathParts[1];

        const { error } = await supabase.storage
            .from('ad-images')
            .remove([filePath]);

        if (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }

        console.log('✅ Image deleted from storage:', filePath);

    } catch (error) {
        console.error('Failed to delete image from storage:', error);
        throw error;
    }
}
