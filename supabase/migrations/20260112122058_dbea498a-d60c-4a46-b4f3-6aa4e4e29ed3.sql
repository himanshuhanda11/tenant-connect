-- Fix infinite recursion in tenant_members RLS policies
-- The issue: tenant_members_select_same_tenant queries tenant_members to check access to tenant_members

-- Drop the problematic policies
DROP POLICY IF EXISTS "tenant_members_select_same_tenant" ON public.tenant_members;
DROP POLICY IF EXISTS "tenant_members_select_own" ON public.tenant_members;

-- Create a single, non-recursive SELECT policy
-- Users can see their own memberships (simple auth.uid() check, no subquery on same table)
CREATE POLICY "tenant_members_select" ON public.tenant_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Fix profiles policy that references tenant_members (which causes cascade)
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON public.profiles;

-- Simple profile viewing - users can view their own profile
-- For viewing teammates, we'll use a security definer function
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Create a security definer function to check if users share a tenant
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.users_share_tenant(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM tenant_members tm1
    JOIN tenant_members tm2 ON tm1.tenant_id = tm2.tenant_id
    WHERE tm1.user_id = user_a AND tm2.user_id = user_b
  );
$$;

-- Policy for viewing teammate profiles using the security definer function
CREATE POLICY "Users can view teammate profiles" ON public.profiles
  FOR SELECT
  USING (public.users_share_tenant(auth.uid(), id));