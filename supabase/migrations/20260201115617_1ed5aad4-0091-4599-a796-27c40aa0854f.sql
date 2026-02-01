
-- Add unique constraint on section_key if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'site_content_section_key_unique'
  ) THEN
    ALTER TABLE public.site_content ADD CONSTRAINT site_content_section_key_unique UNIQUE (section_key);
  END IF;
END $$;
