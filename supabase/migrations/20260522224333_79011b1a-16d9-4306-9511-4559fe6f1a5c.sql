INSERT INTO public.platform_admins (user_id, role, is_active)
VALUES ('738cd2cc-253b-4caa-bb70-ea006fabf6af', 'super_admin', true)
ON CONFLICT (user_id) DO UPDATE
  SET role = 'super_admin', is_active = true;