
-- 1. Extend agents table
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS availability_status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS pause_reason text,
  ADD COLUMN IF NOT EXISTS pause_custom_reason text,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS pause_until timestamptz,
  ADD COLUMN IF NOT EXISTS last_available_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS auto_resume_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS availability_updated_by uuid;

ALTER TABLE public.agents
  DROP CONSTRAINT IF EXISTS agents_availability_status_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_availability_status_check
  CHECK (availability_status IN ('available','paused','offline'));

CREATE INDEX IF NOT EXISTS agents_availability_idx
  ON public.agents (tenant_id, availability_status);
CREATE INDEX IF NOT EXISTS agents_pause_until_idx
  ON public.agents (pause_until) WHERE pause_until IS NOT NULL;

-- 2. History table
CREATE TABLE IF NOT EXISTS public.agent_availability_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_user_id uuid NOT NULL,
  status text NOT NULL,
  reason text,
  custom_reason text,
  paused_at timestamptz,
  pause_until timestamptz,
  changed_by uuid,
  is_admin_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agent_availability_history_tenant_idx
  ON public.agent_availability_history (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_availability_history_user_idx
  ON public.agent_availability_history (agent_user_id, created_at DESC);

ALTER TABLE public.agent_availability_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant members view availability history" ON public.agent_availability_history;
CREATE POLICY "Tenant members view availability history"
  ON public.agent_availability_history FOR SELECT
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant admins manage availability history" ON public.agent_availability_history;
CREATE POLICY "Tenant admins manage availability history"
  ON public.agent_availability_history FOR ALL
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

-- 3. Assignment logs
CREATE TABLE IF NOT EXISTS public.assignment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id uuid,
  team_id uuid,
  assigned_to_agent_id uuid,
  assignment_method text NOT NULL,
  skipped_agents jsonb NOT NULL DEFAULT '[]'::jsonb,
  assignment_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assignment_logs_tenant_idx
  ON public.assignment_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS assignment_logs_conv_idx
  ON public.assignment_logs (conversation_id);

ALTER TABLE public.assignment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant members view assignment logs" ON public.assignment_logs;
CREATE POLICY "Tenant members view assignment logs"
  ON public.assignment_logs FOR SELECT
  USING (is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant admins manage assignment logs" ON public.assignment_logs;
CREATE POLICY "Tenant admins manage assignment logs"
  ON public.assignment_logs FOR ALL
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

-- 4. Update round-robin to skip paused/offline agents and log skipped
CREATE OR REPLACE FUNCTION public.smeksh_pick_profile_round_robin(
  p_workspace_id uuid,
  p_team_id uuid,
  p_only_online boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_ids uuid[];
  skipped jsonb := '[]'::jsonb;
  n int;
  cur int;
  idx int;
  chosen uuid;
BEGIN
  -- Eligible agents: active + available + not paused (or pause expired)
  SELECT array_agg(a.user_id ORDER BY tm.created_at ASC)
  INTO profile_ids
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_workspace_id
    AND tm.is_active = true
    AND a.is_active = true
    AND COALESCE(a.status,'active') != 'suspended'
    AND a.user_id IS NOT NULL
    AND a.availability_status = 'available'
    AND (a.pause_until IS NULL OR a.pause_until <= now())
    AND (p_only_online = false OR a.is_online = true);

  -- Collect skipped (paused/offline/suspended) for logging
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'agent_user_id', a.user_id,
    'reason', CASE
      WHEN a.is_active = false THEN 'inactive'
      WHEN COALESCE(a.status,'active') = 'suspended' THEN 'suspended'
      WHEN a.availability_status = 'paused' THEN 'paused'
      WHEN a.availability_status = 'offline' THEN 'offline'
      ELSE 'other'
    END,
    'pause_until', a.pause_until
  )), '[]'::jsonb)
  INTO skipped
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_workspace_id
    AND tm.is_active = true
    AND a.user_id IS NOT NULL
    AND (
      a.is_active = false
      OR COALESCE(a.status,'active') = 'suspended'
      OR a.availability_status != 'available'
      OR (a.pause_until IS NOT NULL AND a.pause_until > now())
    );

  n := COALESCE(array_length(profile_ids, 1), 0);
  IF n = 0 THEN
    INSERT INTO assignment_logs(tenant_id, team_id, assignment_method, skipped_agents, assignment_reason)
    VALUES (p_workspace_id, p_team_id, 'unassigned_queue', skipped, 'no_available_agents');
    RETURN NULL;
  END IF;

  INSERT INTO round_robin_state(tenant_id, team_id, cursor)
  VALUES (p_workspace_id, p_team_id, 0)
  ON CONFLICT (tenant_id, team_id) DO NOTHING;

  SELECT cursor INTO cur
  FROM round_robin_state
  WHERE tenant_id = p_workspace_id AND team_id = p_team_id
  FOR UPDATE;

  idx := (cur % n) + 1;
  chosen := profile_ids[idx];

  UPDATE round_robin_state
  SET cursor = cur + 1, updated_at = now()
  WHERE tenant_id = p_workspace_id AND team_id = p_team_id;

  INSERT INTO assignment_logs(tenant_id, team_id, assigned_to_agent_id, assignment_method, skipped_agents, assignment_reason)
  VALUES (p_workspace_id, p_team_id, chosen, 'round_robin', skipped, 'eligible_agent_picked');

  RETURN chosen;
END;
$function$;

-- 5. Auto-resume function
CREATE OR REPLACE FUNCTION public.auto_resume_paused_agents()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  resumed_count int;
BEGIN
  WITH resumed AS (
    UPDATE public.agents
    SET availability_status = 'available',
        pause_until = NULL,
        paused_at = NULL,
        pause_reason = NULL,
        pause_custom_reason = NULL,
        last_available_at = now(),
        updated_at = now()
    WHERE availability_status = 'paused'
      AND auto_resume_enabled = true
      AND pause_until IS NOT NULL
      AND pause_until <= now()
    RETURNING id, tenant_id, user_id
  )
  INSERT INTO public.agent_availability_history(tenant_id, agent_user_id, status, reason, changed_by)
  SELECT tenant_id, user_id, 'available', 'auto_resume', NULL FROM resumed;

  GET DIAGNOSTICS resumed_count = ROW_COUNT;
  RETURN resumed_count;
END;
$$;

-- 6. Cron: every minute (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('agent-availability-auto-resume');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'agent-availability-auto-resume',
  '* * * * *',
  $$ SELECT public.auto_resume_paused_agents(); $$
);

-- 7. Realtime publication (already on agents per \d output, ensure history + logs)
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_availability_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_logs;
