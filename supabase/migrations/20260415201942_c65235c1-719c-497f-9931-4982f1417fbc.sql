-- Add page_type column to seo_pages
ALTER TABLE public.seo_pages 
ADD COLUMN IF NOT EXISTS page_type text NOT NULL DEFAULT 'page';

-- Add constraint for valid types
ALTER TABLE public.seo_pages 
ADD CONSTRAINT seo_pages_page_type_check CHECK (page_type IN ('page', 'blog'));

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_seo_pages_page_type ON public.seo_pages(page_type);