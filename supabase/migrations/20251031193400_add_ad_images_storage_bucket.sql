-- Migration: Add storage bucket for custom ad images
-- Description: Creates public storage bucket for user-uploaded ad images with appropriate RLS policies

-- Create storage bucket for ad images (public access for Facebook preview)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ad-images',
    'ad-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS Policy: Anyone can view uploaded ad images (public bucket)
CREATE POLICY "public_can_view_ad_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ad-images');

-- RLS Policy: Only authenticated users can upload ad images
CREATE POLICY "authenticated_users_upload_ad_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ad-images'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can update their own ad images
CREATE POLICY "users_update_own_ad_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ad-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'ad-images' AND owner = auth.uid());

-- RLS Policy: Users can delete their own ad images
CREATE POLICY "users_delete_own_ad_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ad-images' AND owner = auth.uid());