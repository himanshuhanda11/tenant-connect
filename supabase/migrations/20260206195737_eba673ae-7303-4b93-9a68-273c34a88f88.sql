
-- Platform roles enum
DO $$ BEGIN
  CREATE TYPE public.platform_role AS ENUM ('super_admin', 'support');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Upgrade platform_admins to support roles
ALTER TABLE public.platform_admins 
  ADD COLUMN IF NOT EXISTS role platform_role NOT NULL DEFAULT 'super_admin',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Admin audit logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id),
  actor_role text NOT NULL,
  action text NOT NULL,
  workspace_id uuid,
  target_table text,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  note text,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON public.admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_workspace ON public.admin_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read admin audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert admin audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Workspace entitlements
CREATE TABLE IF NOT EXISTS public.workspace_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  sending_paused boolean NOT NULL DEFAULT false,
  monthly_conversation_limit int DEFAULT 1000,
  monthly_broadcast_limit int DEFAULT 10,
  monthly_template_limit int DEFAULT 50,
  monthly_flow_limit int DEFAULT 10,
  enable_ai boolean NOT NULL DEFAULT true,
  enable_ads boolean NOT NULL DEFAULT true,
  enable_integrations boolean NOT NULL DEFAULT true,
  enable_autoforms boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_entitlements_status ON public.workspace_entitlements(status);

ALTER TABLE public.workspace_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read entitlements"
  ON public.workspace_entitlements FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage entitlements"
  ON public.workspace_entitlements FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Helper function to check platform role
CREATE OR REPLACE FUNCTION public.get_platform_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.platform_admins 
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- KPI overview view
CREATE OR REPLACE VIEW public.admin_kpi_overview AS
SELECT
  (SELECT count(*)::int FROM public.tenants) AS total_workspaces,
  (SELECT count(*)::int FROM public.tenants WHERE is_suspended = false) AS active_workspaces,
  (SELECT count(*)::int FROM public.tenants WHERE is_suspended = true) AS suspended_workspaces,
  (SELECT count(*)::int FROM public.smeksh_phone_numbers) AS total_phone_numbers,
  (SELECT count(*)::int FROM public.smeksh_phone_numbers WHERE status = 'connected') AS connected_phone_numbers,
  (SELECT count(DISTINCT user_id)::int FROM public.tenant_members) AS total_users,
  (SELECT count(*)::int FROM public.contacts) AS total_contacts,
  (SELECT count(*)::int FROM public.conversations) AS total_conversations;

-- Workspace directory view
CREATE OR REPLACE VIEW public.admin_workspace_directory AS
SELECT
  t.id AS workspace_id,
  t.name AS workspace_name,
  t.slug,
  t.created_at,
  t.is_suspended,
  t.suspended_reason,
  COALESCE(e.plan, 'free') AS plan,
  COALESCE(e.status, 'active') AS entitlement_status,
  COALESCE(e.sending_paused, false) AS sending_paused,
  (SELECT count(*) FROM public.tenant_members m WHERE m.tenant_id = t.id)::int AS members_count,
  (SELECT count(*) FROM public.smeksh_phone_numbers p WHERE p.tenant_id = t.id)::int AS phone_numbers_count,
  (SELECT count(*) FROM public.contacts c WHERE c.tenant_id = t.id)::int AS contacts_count,
  (SELECT count(*) FROM public.conversations cv WHERE cv.tenant_id = t.id)::int AS conversations_count,
  s.status AS subscription_status,
  pl.name AS plan_name
FROM public.tenants t
LEFT JOIN public.workspace_entitlements e ON e.workspace_id = t.id
LEFT JOIN public.subscriptions s ON s.tenant_id = t.id
LEFT JOIN public.plans pl ON pl.id = s.plan_id;
