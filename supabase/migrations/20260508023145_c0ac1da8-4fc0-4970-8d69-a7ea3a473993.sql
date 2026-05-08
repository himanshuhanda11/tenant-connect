
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_role ON public.tenant_members (tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_created_at ON public.marketing_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_status ON public.marketing_leads (status);
