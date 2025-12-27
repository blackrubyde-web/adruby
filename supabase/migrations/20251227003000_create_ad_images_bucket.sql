-- Migration: Create Supabase Storage Bucket for Ad Images
-- Description: Creates a public storage bucket for storing AI-generated images

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload ad images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-images');

-- Allow public read access
CREATE POLICY "Public can read ad images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own ad images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
