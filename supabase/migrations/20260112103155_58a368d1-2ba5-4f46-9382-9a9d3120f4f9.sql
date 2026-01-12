-- Create enum for tenant roles
CREATE TYPE public.tenant_role AS ENUM ('owner', 'admin', 'agent');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_members table (junction table for users and tenants)
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a member of a tenant
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;

-- Function to check if user has specific role in tenant
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id UUID, _tenant_id UUID, _roles tenant_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = _user_id 
    AND tenant_id = _tenant_id 
    AND role = ANY(_roles)
  )
$$;

-- RLS Policies for tenants
CREATE POLICY "Users can view tenants they belong to"
ON public.tenants FOR SELECT
TO authenticated
USING (public.is_tenant_member(auth.uid(), id));

CREATE POLICY "Users can create tenants"
ON public.tenants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only owner/admin can update tenant"
ON public.tenants FOR UPDATE
TO authenticated
USING (public.has_tenant_role(auth.uid(), id, ARRAY['owner', 'admin']::tenant_role[]));

CREATE POLICY "Only owner can delete tenant"
ON public.tenants FOR DELETE
TO authenticated
USING (public.has_tenant_role(auth.uid(), id, ARRAY['owner']::tenant_role[]));

-- RLS Policies for tenant_members
CREATE POLICY "Members can view other members in same tenant"
ON public.tenant_members FOR SELECT
TO authenticated
USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can add members"
ON public.tenant_members FOR INSERT
TO authenticated
WITH CHECK (
  public.has_tenant_role(auth.uid(), tenant_id, ARRAY['owner', 'admin']::tenant_role[])
  OR (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = tenant_members.tenant_id))
);

CREATE POLICY "Owner/Admin can update members"
ON public.tenant_members FOR UPDATE
TO authenticated
USING (public.has_tenant_role(auth.uid(), tenant_id, ARRAY['owner', 'admin']::tenant_role[]));

CREATE POLICY "Owner/Admin can remove members"
ON public.tenant_members FOR DELETE
TO authenticated
USING (public.has_tenant_role(auth.uid(), tenant_id, ARRAY['owner', 'admin']::tenant_role[]));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_members_updated_at
  BEFORE UPDATE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();