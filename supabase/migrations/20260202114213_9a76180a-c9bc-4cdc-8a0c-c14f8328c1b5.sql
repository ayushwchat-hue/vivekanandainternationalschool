-- Add media_type column to gallery table to support videos
ALTER TABLE public.gallery 
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

-- Add comment for clarity
COMMENT ON COLUMN public.gallery.media_type IS 'Type of media: image or video';