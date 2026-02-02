-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Create policy for public read access
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- Create policy for anyone to upload (since admin auth is custom)
CREATE POLICY "Anyone can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery-images');

-- Create policy for anyone to update gallery images
CREATE POLICY "Anyone can update gallery images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery-images');

-- Create policy for anyone to delete gallery images
CREATE POLICY "Anyone can delete gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery-images');