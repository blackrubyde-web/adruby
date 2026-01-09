-- Migration: Create Supabase Storage buckets for creative inputs and renders
-- Description: Adds public buckets with authenticated upload/delete policies.

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('creative-renders', 'creative-renders', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('creative-inputs', 'creative-inputs', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read access
DROP POLICY IF EXISTS "Public read for creative-renders" ON storage.objects;
CREATE POLICY "Public read for creative-renders"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creative-renders');

DROP POLICY IF EXISTS "Public read for creative-inputs" ON storage.objects;
CREATE POLICY "Public read for creative-inputs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creative-inputs');

-- Authenticated uploads (scoped to user folder)
DROP POLICY IF EXISTS "Authenticated upload for creative-renders" ON storage.objects;
CREATE POLICY "Authenticated upload for creative-renders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'creative-renders'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated upload for creative-inputs" ON storage.objects;
CREATE POLICY "Authenticated upload for creative-inputs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'creative-inputs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated delete (own files)
DROP POLICY IF EXISTS "Authenticated delete for creative-renders" ON storage.objects;
CREATE POLICY "Authenticated delete for creative-renders"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'creative-renders'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated delete for creative-inputs" ON storage.objects;
CREATE POLICY "Authenticated delete for creative-inputs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'creative-inputs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
