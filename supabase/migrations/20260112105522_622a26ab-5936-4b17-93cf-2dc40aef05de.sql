-- Ensure API roles have the base privileges; RLS will enforce access.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tenant_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- (optional) allow read access where appropriate via RLS; keep anon with no table privileges
REVOKE ALL ON TABLE public.tenants FROM anon;
REVOKE ALL ON TABLE public.tenant_members FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;