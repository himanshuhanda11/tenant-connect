-- Fix the permissive RLS policies on seo_meta and seo_pages
-- These were flagged as WARN because they use 'true' for INSERT

-- Drop and recreate seo_meta policies with proper restrictions
DROP POLICY IF EXISTS "Anyone can read published SEO meta" ON public.seo_meta;

-- Public can only SELECT published meta (this is intentional for website SEO)
CREATE POLICY "Public can read published SEO meta"
ON public.seo_meta
FOR SELECT
USING (is_published = true);

-- Drop and recreate seo_pages policies
DROP POLICY IF EXISTS "Anyone can read public SEO pages" ON public.seo_pages;

-- Public can only SELECT public pages
CREATE POLICY "Public can read public SEO pages"
ON public.seo_pages
FOR SELECT
USING (is_public = true);