-- =============================================
-- Fix 1: Secure site_content table
-- Keep SELECT public, remove write policies
-- =============================================

-- Drop existing permissive write policies
DROP POLICY IF EXISTS "Anyone can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can delete site content" ON public.site_content;

-- =============================================
-- Fix 2: Secure gallery table
-- Keep SELECT public, remove write policies
-- =============================================

-- Drop existing permissive write policies
DROP POLICY IF EXISTS "Anyone can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can delete gallery" ON public.gallery;

-- =============================================
-- Fix 3: Secure storage bucket
-- Remove public upload policy, keep public read
-- =============================================

-- Drop any existing permissive upload policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to gallery-images" ON storage.objects;

-- Ensure public read access remains (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for gallery-images'
  ) THEN
    CREATE POLICY "Public read access for gallery-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery-images');
  END IF;
END $$;