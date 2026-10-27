ALTER TABLE public.meta_ctwa_ads ADD COLUMN display_name text;

GRANT UPDATE (display_name, updated_at) ON public.meta_ctwa_ads TO authenticated;

CREATE POLICY "Workspace admins can rename WhatsApp ad sources"
ON public.meta_ctwa_ads FOR UPDATE TO authenticated
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));