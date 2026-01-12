-- Create an atomic tenant creation function that also inserts the owner membership.
-- This avoids failing INSERT ... RETURNING due to SELECT RLS (user isn't a member until after membership insert).

CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(_name text, _slug text)
RETURNS public.tenants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant public.tenants;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.tenants (name, slug)
  VALUES (_name, _slug)
  RETURNING * INTO new_tenant;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (new_tenant.id, auth.uid(), 'owner');

  RETURN new_tenant;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_tenant_with_owner(text, text) TO authenticated;