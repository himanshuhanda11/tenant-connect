-- =============================================
-- SMEKSH Team & Roles Module - Enhanced Schema
-- Works with existing teams, team_members, agents tables
-- =============================================

-- 1. Enum for custom roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'agent', 'analyst', 'billing', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Enum for permission categories
DO $$ BEGIN
  CREATE TYPE public.permission_category AS ENUM (
    'messaging', 'contacts', 'templates', 'campaigns', 
    'automation', 'integrations', 'billing', 'security', 
    'phone_numbers', 'team'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Enum for member status
DO $$ BEGIN
  CREATE TYPE public.member_status AS ENUM ('active', 'invited', 'suspended', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Enum for presence status  
DO $$ BEGIN
  CREATE TYPE public.presence_status AS ENUM ('online', 'offline', 'away', 'busy');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Enum for routing strategy
DO $$ BEGIN
  CREATE TYPE public.routing_strategy AS ENUM (
    'round_robin', 'least_busy', 'skill_based', 
    'vip_routing', 'manual', 'overflow'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Enum for audit action types
DO $$ BEGIN
  CREATE TYPE public.audit_action AS ENUM (
    'login', 'logout', 'invite_sent', 'invite_accepted', 
    'role_changed', 'permission_changed', 'member_disabled', 
    'member_enabled', 'team_created', 'team_updated', 
    'team_deleted', 'routing_changed', 'sla_changed',
    'template_submitted', 'template_approved', 'template_rejected',
    'automation_activated', 'automation_paused', 'automation_deleted',
    'tag_added', 'tag_removed', 'assignment_changed',
    'conversation_closed', 'conversation_reopened',
    'waba_connected', 'settings_changed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- ENHANCE EXISTING TEAMS TABLE
-- =============================================

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS team_lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS default_routing_strategy TEXT DEFAULT 'round_robin';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- =============================================
-- ENHANCE EXISTING AGENTS TABLE
-- =============================================

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS presence TEXT DEFAULT 'offline';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS max_open_chats INT DEFAULT 10;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- =============================================
-- ROLES & PERMISSIONS TABLES
-- =============================================

-- Roles table (custom roles per tenant)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  base_role TEXT NOT NULL DEFAULT 'agent',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_roles_tenant ON public.roles(tenant_id);

-- Permissions definition table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);

-- User roles assignment
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- =============================================
-- MEMBER INVITES
-- =============================================

CREATE TABLE IF NOT EXISTS public.member_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_ids UUID[] DEFAULT '{}',
  phone_number_ids UUID[] DEFAULT '{}',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_member_invites_tenant ON public.member_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_invites_token ON public.member_invites(token);

-- =============================================
-- WORKING HOURS & SLA
-- =============================================

CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_working_hours_tenant ON public.working_hours(tenant_id);

CREATE TABLE IF NOT EXISTS public.sla_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  first_response_minutes INT NOT NULL DEFAULT 15,
  follow_up_minutes INT NOT NULL DEFAULT 60,
  resolution_hours INT DEFAULT 24,
  escalate_on_breach BOOLEAN NOT NULL DEFAULT true,
  escalate_to_team_lead BOOLEAN NOT NULL DEFAULT true,
  after_hours_auto_reply BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sla_settings_tenant ON public.sla_settings(tenant_id);

-- =============================================
-- ROUTING RULES
-- =============================================

CREATE TABLE IF NOT EXISTS public.routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  condition_type TEXT NOT NULL,
  condition_config JSONB NOT NULL DEFAULT '{}',
  assign_to_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  assign_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  strategy TEXT NOT NULL DEFAULT 'round_robin',
  fallback_strategy TEXT DEFAULT 'least_busy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routing_rules_tenant ON public.routing_rules(tenant_id, priority);

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(tenant_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(tenant_id, action, created_at DESC);

-- =============================================
-- PERFORMANCE METRICS
-- =============================================

CREATE TABLE IF NOT EXISTS public.member_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  assigned_chats INT DEFAULT 0,
  resolved_chats INT DEFAULT 0,
  avg_response_time_seconds INT DEFAULT 0,
  avg_resolution_time_seconds INT DEFAULT 0,
  sla_breaches INT DEFAULT 0,
  csat_score NUMERIC(3,2),
  messages_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_member_performance_tenant ON public.member_performance(tenant_id, date DESC);

-- =============================================
-- SEED DEFAULT PERMISSIONS
-- =============================================

INSERT INTO public.permissions (key, name, description, category, sort_order) VALUES
-- Messaging
('messaging.view_inbox', 'View Inbox', 'View conversations in inbox', 'messaging', 1),
('messaging.reply', 'Reply to Messages', 'Send messages in conversations', 'messaging', 2),
('messaging.assign', 'Assign Conversations', 'Assign conversations to team members', 'messaging', 3),
('messaging.close', 'Close Conversations', 'Close and reopen conversations', 'messaging', 4),
('messaging.view_all', 'View All Conversations', 'View all team conversations', 'messaging', 5),
-- Contacts
('contacts.view', 'View Contacts', 'View contact list', 'contacts', 1),
('contacts.create', 'Create Contacts', 'Create new contacts', 'contacts', 2),
('contacts.edit', 'Edit Contacts', 'Edit contact details', 'contacts', 3),
('contacts.delete', 'Delete Contacts', 'Delete contacts', 'contacts', 4),
('contacts.import', 'Import Contacts', 'Bulk import contacts', 'contacts', 5),
('contacts.export', 'Export Contacts', 'Export contact data', 'contacts', 6),
-- Templates
('templates.view', 'View Templates', 'View message templates', 'templates', 1),
('templates.create', 'Create Templates', 'Create new templates', 'templates', 2),
('templates.submit', 'Submit Templates', 'Submit templates for approval', 'templates', 3),
('templates.approve', 'Approve Templates', 'Approve template submissions', 'templates', 4),
('templates.delete', 'Delete Templates', 'Delete templates', 'templates', 5),
-- Campaigns
('campaigns.view', 'View Campaigns', 'View campaign list', 'campaigns', 1),
('campaigns.create', 'Create Campaigns', 'Create new campaigns', 'campaigns', 2),
('campaigns.send', 'Send Campaigns', 'Send campaigns', 'campaigns', 3),
('campaigns.schedule', 'Schedule Campaigns', 'Schedule campaigns', 'campaigns', 4),
('campaigns.delete', 'Delete Campaigns', 'Delete campaigns', 'campaigns', 5),
-- Automation
('automation.view', 'View Automations', 'View automation workflows', 'automation', 1),
('automation.create', 'Create Automations', 'Create new automations', 'automation', 2),
('automation.edit', 'Edit Automations', 'Edit automation workflows', 'automation', 3),
('automation.activate', 'Activate Automations', 'Activate/pause automations', 'automation', 4),
('automation.delete', 'Delete Automations', 'Delete automations', 'automation', 5),
-- Integrations
('integrations.view', 'View Integrations', 'View connected integrations', 'integrations', 1),
('integrations.manage_webhooks', 'Manage Webhooks', 'Create and manage webhooks', 'integrations', 2),
('integrations.manage_api_keys', 'Manage API Keys', 'Create and manage API keys', 'integrations', 3),
-- Billing
('billing.view', 'View Billing', 'View invoices and plan', 'billing', 1),
('billing.manage', 'Manage Billing', 'Change plan and payment', 'billing', 2),
-- Security
('security.view_logs', 'View Audit Logs', 'View activity logs', 'security', 1),
('security.export_logs', 'Export Audit Logs', 'Export activity logs', 'security', 2),
('security.manage_access', 'Manage Access Controls', 'Manage security settings', 'security', 3),
-- Phone Numbers
('phone_numbers.view', 'View Phone Numbers', 'View connected numbers', 'phone_numbers', 1),
('phone_numbers.connect', 'Connect Phone Numbers', 'Connect new WABA numbers', 'phone_numbers', 2),
('phone_numbers.manage', 'Manage Phone Numbers', 'Edit phone number settings', 'phone_numbers', 3),
-- Team
('team.view', 'View Team', 'View team members', 'team', 1),
('team.invite', 'Invite Members', 'Invite new team members', 'team', 2),
('team.manage_roles', 'Manage Roles', 'Create and edit roles', 'team', 3),
('team.manage_teams', 'Manage Teams', 'Create and manage team groups', 'team', 4),
('team.manage_routing', 'Manage Routing', 'Configure routing rules', 'team', 5),
('team.manage_sla', 'Manage SLA', 'Configure SLA settings', 'team', 6)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id UUID, p_permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = p_user_id
      AND p.key = p_permission_key
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_name(p_tenant_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.base_role
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.tenant_id = p_tenant_id
    AND ur.user_id = p_user_id
  LIMIT 1
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_performance ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "roles_select_member" ON public.roles FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "roles_insert_admin" ON public.roles FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));
CREATE POLICY "roles_update_admin" ON public.roles FOR UPDATE USING (is_tenant_admin(tenant_id));
CREATE POLICY "roles_delete_owner" ON public.roles FOR DELETE USING (is_tenant_owner(tenant_id) AND NOT is_system);

-- Permissions are public read
CREATE POLICY "permissions_select_all" ON public.permissions FOR SELECT USING (true);

-- Role permissions
CREATE POLICY "role_perms_select" ON public.role_permissions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND is_tenant_member(r.tenant_id)));
CREATE POLICY "role_perms_manage" ON public.role_permissions FOR ALL 
  USING (EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND is_tenant_admin(r.tenant_id)));

-- User roles
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "user_roles_manage" ON public.user_roles FOR ALL USING (is_tenant_admin(tenant_id));

-- Member invites
CREATE POLICY "invites_select" ON public.member_invites FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "invites_manage" ON public.member_invites FOR ALL USING (is_tenant_admin(tenant_id));

-- Working hours
CREATE POLICY "wh_select" ON public.working_hours FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "wh_manage" ON public.working_hours FOR ALL USING (is_tenant_admin(tenant_id));

-- SLA settings
CREATE POLICY "sla_select" ON public.sla_settings FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "sla_manage" ON public.sla_settings FOR ALL USING (is_tenant_admin(tenant_id));

-- Routing rules
CREATE POLICY "rr_select" ON public.routing_rules FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "rr_manage" ON public.routing_rules FOR ALL USING (is_tenant_admin(tenant_id));

-- Audit logs
CREATE POLICY "logs_select" ON public.audit_logs FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "logs_insert" ON public.audit_logs FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

-- Member performance
CREATE POLICY "perf_select" ON public.member_performance FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "perf_manage" ON public.member_performance FOR ALL USING (is_tenant_admin(tenant_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;