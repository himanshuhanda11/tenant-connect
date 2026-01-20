-- Create platform_admins table for actual platform developers
-- This is completely separate from tenant roles
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Only platform admins can read this table (bootstrap problem solved by service role)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = _user_id
  )
$$;

-- Platform admins can view the table
CREATE POLICY "Platform admins can view admins"
ON public.platform_admins
FOR SELECT
TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- Only existing platform admins can add new ones
CREATE POLICY "Platform admins can add new admins"
ON public.platform_admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Update seo_meta policies to use platform_admins
DROP POLICY IF EXISTS "Admins can manage SEO meta" ON public.seo_meta;
CREATE POLICY "Platform admins can manage SEO meta"
ON public.seo_meta
FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Update seo_pages policies
DROP POLICY IF EXISTS "Admins can manage SEO pages" ON public.seo_pages;
CREATE POLICY "Platform admins can manage SEO pages"
ON public.seo_pages
FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));