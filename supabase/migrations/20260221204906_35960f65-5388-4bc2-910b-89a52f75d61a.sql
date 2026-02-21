
-- Create storage bucket for meta ad media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('meta-ad-media', 'meta-ad-media', true, 26214400)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload meta ad media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meta-ad-media' AND auth.role() = 'authenticated');

-- Allow public read access (Meta needs public URLs)
CREATE POLICY "Public can read meta ad media"
ON storage.objects FOR SELECT
USING (bucket_id = 'meta-ad-media');

-- Allow users to update their uploads
CREATE POLICY "Authenticated users can update meta ad media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'meta-ad-media' AND auth.role() = 'authenticated');

-- Allow users to delete their uploads
CREATE POLICY "Authenticated users can delete meta ad media"
ON storage.objects FOR DELETE
USING (bucket_id = 'meta-ad-media' AND auth.role() = 'authenticated');
