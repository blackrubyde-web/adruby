-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('creative-images', 'creative-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'creative-images' );

-- Policy to allow public to view images (needed for reading back the URL)
CREATE POLICY "Allow public select"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'creative-images' );

-- Policy to allow users to update their own images (optional but good practice)
CREATE POLICY "Allow individual update"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'creative-images' AND owner = auth.uid() );

-- Policy to allow users to delete their own images
CREATE POLICY "Allow individual delete"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'creative-images' AND owner = auth.uid() );
