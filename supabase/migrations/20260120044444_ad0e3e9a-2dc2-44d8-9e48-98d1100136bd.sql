-- Fix public SEO read errors: remove RLS policies that reference tenant_members (public role cannot select tenant_members)
-- Keep SEO editable by platform admins via existing is_platform_admin(auth.uid()) policies.

-- SEO PAGES
DROP POLICY IF EXISTS "Admins can insert seo_pages" ON public.seo_pages;
DROP POLICY IF EXISTS "Admins can update seo_pages" ON public.seo_pages;
DROP POLICY IF EXISTS "Admins can delete seo_pages" ON public.seo_pages;
DROP POLICY IF EXISTS "Anyone can read seo_pages" ON public.seo_pages;

-- Recreate minimal public read policy (only public pages)
DROP POLICY IF EXISTS "Public can read public SEO pages" ON public.seo_pages;
CREATE POLICY "Public can read public SEO pages"
ON public.seo_pages
FOR SELECT
TO public
USING (is_public = true);

-- SEO META
DROP POLICY IF EXISTS "Admins can read all seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Admins can insert seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Admins can update seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Admins can delete seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Anyone can read published seo_meta" ON public.seo_meta;
DROP POLICY IF EXISTS "Public can read published SEO meta" ON public.seo_meta;

-- Recreate minimal public read policy (only published)
CREATE POLICY "Public can read published SEO meta"
ON public.seo_meta
FOR SELECT
TO public
USING (is_published = true);

-- NOTE: Existing platform admin policies remain:
--  - "Platform admins can manage SEO pages" (authenticated)
--  - "Platform admins can manage SEO meta" (authenticated)
