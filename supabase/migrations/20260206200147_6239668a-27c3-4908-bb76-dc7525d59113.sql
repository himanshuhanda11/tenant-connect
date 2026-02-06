
-- Add convenience helper functions
CREATE OR REPLACE FUNCTION public.is_platform_user(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role::text = ANY(allowed_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_platform_user(ARRAY['super_admin'])
$$;

CREATE OR REPLACE FUNCTION public.is_support_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_platform_user(ARRAY['super_admin','support'])
$$;

-- Audit logs: make immutable (no update/delete)
CREATE POLICY "audit_no_update" ON public.admin_audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "audit_no_delete" ON public.admin_audit_logs
  FOR DELETE USING (false);

-- Platform admins: add update/delete policies for super_admin
DROP POLICY IF EXISTS "Platform admins can add new admins" ON public.platform_admins;
CREATE POLICY "platform_admins_insert_super_admin" ON public.platform_admins
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "platform_admins_update_super_admin" ON public.platform_admins
  FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "platform_admins_delete_super_admin" ON public.platform_admins
  FOR DELETE USING (public.is_super_admin());

-- Add platform admin read access to tenants (for admin views)
CREATE POLICY "tenants_platform_read" ON public.tenants
  FOR SELECT USING (public.is_support_or_admin());

CREATE POLICY "tenants_platform_update_super_admin" ON public.tenants
  FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Platform read for phone numbers 
CREATE POLICY "phone_platform_read" ON public.smeksh_phone_numbers
  FOR SELECT USING (public.is_support_or_admin());

-- Platform read for contacts/conversations (admin reporting)
CREATE POLICY "contacts_platform_read" ON public.contacts
  FOR SELECT USING (public.is_support_or_admin());

CREATE POLICY "conversations_platform_read" ON public.conversations
  FOR SELECT USING (public.is_support_or_admin());

-- Platform read for tenant_members
CREATE POLICY "tenant_members_platform_read" ON public.tenant_members
  FOR SELECT USING (public.is_support_or_admin());
