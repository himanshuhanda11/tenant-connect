-- Drop the overly permissive policy
DROP POLICY "Users can create tenants" ON public.tenants;

-- Create a more restrictive policy - any authenticated user can create a tenant
-- This is acceptable because creating a tenant is the first step for new users
CREATE POLICY "Authenticated users can create tenants"
ON public.tenants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);