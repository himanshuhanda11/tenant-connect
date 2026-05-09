CREATE OR REPLACE FUNCTION public.guard_entitlement_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
  v_grant text := current_setting('app.in_offer_grant', true);
  v_db_role text := current_user;
BEGIN
  -- PostgREST / service-role calls
  IF v_role = 'service_role' THEN RETURN COALESCE(NEW, OLD); END IF;

  -- SECURITY DEFINER offer-grant flag
  IF v_grant = 'on' THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Privileged DB roles (cascade deletes from auth.admin.deleteUser run as
  -- supabase_auth_admin; superuser/postgres for migrations & maintenance)
  IF v_db_role IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'supabase_storage_admin', 'service_role') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Platform super admins
  IF auth.uid() IS NOT NULL AND public.is_super_admin() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  RAISE EXCEPTION 'Workspace entitlements can only be changed by verified payment webhooks or platform admins';
END;
$$;