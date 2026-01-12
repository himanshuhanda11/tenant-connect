-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy: users can view their own profile
-- OR profiles of users who are members of the same tenant
CREATE POLICY "Users can view profiles in same tenant" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.tenant_members tm1
    JOIN public.tenant_members tm2 ON tm1.tenant_id = tm2.tenant_id
    WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
  )
);