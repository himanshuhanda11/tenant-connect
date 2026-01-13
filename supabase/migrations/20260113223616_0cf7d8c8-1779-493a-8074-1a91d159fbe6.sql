-- Fix Security Definer View warnings by recreating views with SECURITY INVOKER

-- Drop and recreate all smeksh views with security_invoker = true

DROP VIEW IF EXISTS public.smeksh_workspace_members;
DROP VIEW IF EXISTS public.smeksh_teams;
DROP VIEW IF EXISTS public.smeksh_team_members;
DROP VIEW IF EXISTS public.smeksh_presence;
DROP VIEW IF EXISTS public.smeksh_routing_rules;
DROP VIEW IF EXISTS public.smeksh_round_robin_state;
DROP VIEW IF EXISTS public.smeksh_audit_logs;

-- 1. Recreate smeksh_workspace_members with security_invoker
CREATE VIEW public.smeksh_workspace_members 
WITH (security_invoker = true)
AS
SELECT 
  a.id,
  a.tenant_id AS workspace_id,
  a.user_id AS profile_id,
  COALESCE(a.display_name, p.full_name, p.email) AS display_name,
  p.email,
  a.role,
  a.status,
  a.is_active,
  a.is_online,
  a.presence,
  a.skills,
  a.languages,
  a.timezone,
  a.max_open_chats,
  a.weight,
  a.notes,
  a.last_active_at,
  a.created_at,
  a.updated_at
FROM agents a
LEFT JOIN profiles p ON p.id = a.user_id;

-- 2. Recreate smeksh_teams with security_invoker
CREATE VIEW public.smeksh_teams 
WITH (security_invoker = true)
AS
SELECT 
  t.id,
  t.tenant_id AS workspace_id,
  t.name,
  t.description,
  t.color,
  t.team_lead_id,
  t.default_routing_strategy,
  t.is_active,
  t.created_at,
  t.updated_at
FROM teams t;

-- 3. Recreate smeksh_team_members with security_invoker
CREATE VIEW public.smeksh_team_members 
WITH (security_invoker = true)
AS
SELECT 
  tm.id,
  tm.tenant_id AS workspace_id,
  tm.team_id,
  tm.agent_id AS member_id,
  a.user_id AS profile_id,
  tm.is_active,
  tm.created_at
FROM team_members tm
JOIN agents a ON a.id = tm.agent_id;

-- 4. Recreate smeksh_presence with security_invoker
CREATE VIEW public.smeksh_presence 
WITH (security_invoker = true)
AS
SELECT 
  a.id AS member_id,
  a.tenant_id AS workspace_id,
  a.user_id AS profile_id,
  CASE 
    WHEN a.is_online = true THEN 'ONLINE'
    WHEN a.presence = 'away' THEN 'AWAY'
    WHEN a.presence = 'busy' THEN 'BUSY'
    ELSE 'OFFLINE'
  END AS status,
  a.last_active_at,
  a.updated_at
FROM agents a;

-- 5. Recreate smeksh_routing_rules with security_invoker
CREATE VIEW public.smeksh_routing_rules 
WITH (security_invoker = true)
AS
SELECT 
  rr.id,
  rr.tenant_id AS workspace_id,
  rr.name,
  rr.description,
  rr.is_active,
  CASE WHEN rr.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END AS status,
  rr.priority,
  rr.condition_type AS trigger_event,
  rr.condition_config AS match_conditions,
  rr.strategy,
  rr.assign_to_team_id AS target_team_id,
  rr.assign_to_user_id AS target_member_id,
  rr.fallback_strategy,
  rr.created_at,
  rr.updated_at
FROM routing_rules rr;

-- 6. Recreate smeksh_round_robin_state with security_invoker
CREATE VIEW public.smeksh_round_robin_state 
WITH (security_invoker = true)
AS
SELECT 
  rrs.tenant_id AS workspace_id,
  rrs.team_id,
  rrs.cursor,
  rrs.updated_at
FROM round_robin_state rrs;

-- 7. Recreate smeksh_audit_logs with security_invoker
CREATE VIEW public.smeksh_audit_logs 
WITH (security_invoker = true)
AS
SELECT 
  al.id,
  al.tenant_id AS workspace_id,
  al.user_id AS actor_user_id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.ip_address,
  al.user_agent,
  al.created_at
FROM audit_logs al;