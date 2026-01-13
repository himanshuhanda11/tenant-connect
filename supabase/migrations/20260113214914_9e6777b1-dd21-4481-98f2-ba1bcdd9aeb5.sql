-- Drop old automation_scheduled_jobs if exists and recreate with pro features
DROP TABLE IF EXISTS public.automation_scheduled_jobs CASCADE;

-- Create pro scheduled jobs table
CREATE TABLE public.automation_scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  workflow_id uuid NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  node_id uuid REFERENCES public.automation_nodes(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  execute_at timestamptz NOT NULL,
  status scheduled_job_status NOT NULL DEFAULT 'queued',
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error text,
  locked_at timestamptz,
  locked_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for job runner
CREATE INDEX automation_jobs_due_idx ON public.automation_scheduled_jobs(status, execute_at);
CREATE INDEX automation_jobs_tenant_due_idx ON public.automation_scheduled_jobs(tenant_id, status, execute_at);
CREATE INDEX automation_jobs_conv_idx ON public.automation_scheduled_jobs(tenant_id, conversation_id, status, execute_at);

-- Prevent duplicates: only 1 queued job per (run, node, execute_at)
CREATE UNIQUE INDEX automation_jobs_run_node_time_uidx 
  ON public.automation_scheduled_jobs(run_id, node_id, execute_at)
  WHERE run_id IS NOT NULL AND node_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.automation_scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view scheduled jobs"
  ON public.automation_scheduled_jobs FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage scheduled jobs"
  ON public.automation_scheduled_jobs FOR ALL
  USING (public.is_tenant_admin(tenant_id));

-- Create agents table for round robin
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text,
  role text DEFAULT 'agent',
  is_active boolean NOT NULL DEFAULT true,
  is_online boolean NOT NULL DEFAULT false,
  weight int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX agents_tenant_active_idx ON public.agents(tenant_id, is_active);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view agents"
  ON public.agents FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage agents"
  ON public.agents FOR ALL
  USING (public.is_tenant_admin(tenant_id));

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view teams"
  ON public.teams FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage teams"
  ON public.teams FOR ALL
  USING (public.is_tenant_admin(tenant_id));

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, agent_id)
);

CREATE INDEX team_members_team_idx ON public.team_members(team_id, is_active);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view team members"
  ON public.team_members FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage team members"
  ON public.team_members FOR ALL
  USING (public.is_tenant_admin(tenant_id));

-- Create round robin state table
CREATE TABLE IF NOT EXISTS public.round_robin_state (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  cursor int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, team_id)
);

ALTER TABLE public.round_robin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view round robin state"
  ON public.round_robin_state FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can manage round robin state"
  ON public.round_robin_state FOR ALL
  USING (public.is_tenant_admin(tenant_id));

-- Function to pick next agent using round robin
CREATE OR REPLACE FUNCTION public.pick_agent_round_robin(
  p_tenant_id uuid,
  p_team_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_ids uuid[];
  member_count int;
  current_cursor int;
  selected_index int;
  selected_agent uuid;
BEGIN
  SELECT array_agg(tm.agent_id ORDER BY tm.created_at ASC)
  INTO member_ids
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_tenant_id
    AND tm.is_active = true
    AND a.is_active = true;

  member_count := COALESCE(array_length(member_ids, 1), 0);
  IF member_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Lock state row (upsert)
  INSERT INTO round_robin_state(tenant_id, team_id, cursor)
  VALUES (p_tenant_id, p_team_id, 0)
  ON CONFLICT (tenant_id, team_id) DO NOTHING;

  SELECT cursor INTO current_cursor
  FROM round_robin_state
  WHERE tenant_id = p_tenant_id AND team_id = p_team_id
  FOR UPDATE;

  selected_index := (current_cursor % member_count) + 1;
  selected_agent := member_ids[selected_index];

  UPDATE round_robin_state
  SET cursor = current_cursor + 1,
      updated_at = now()
  WHERE tenant_id = p_tenant_id AND team_id = p_team_id;

  RETURN selected_agent;
END;
$$;

-- Function to cancel queued jobs for a conversation
CREATE OR REPLACE FUNCTION public.cancel_conversation_jobs(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_only_stop_on_reply boolean DEFAULT false
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cancelled_count int;
BEGIN
  IF p_only_stop_on_reply THEN
    UPDATE automation_scheduled_jobs j
    SET status = 'cancelled', updated_at = now()
    FROM automation_workflows w
    WHERE j.tenant_id = p_tenant_id
      AND j.conversation_id = p_conversation_id
      AND j.status = 'queued'
      AND j.workflow_id = w.id
      AND w.stop_on_customer_reply = true;
  ELSE
    UPDATE automation_scheduled_jobs
    SET status = 'cancelled', updated_at = now()
    WHERE tenant_id = p_tenant_id
      AND conversation_id = p_conversation_id
      AND status = 'queued';
  END IF;
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$;

-- Function to cancel queued jobs when workflow is paused
CREATE OR REPLACE FUNCTION public.cancel_workflow_jobs(
  p_tenant_id uuid,
  p_workflow_id uuid
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cancelled_count int;
BEGIN
  UPDATE automation_scheduled_jobs
  SET status = 'cancelled', updated_at = now()
  WHERE tenant_id = p_tenant_id
    AND workflow_id = p_workflow_id
    AND status = 'queued';
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$;

-- Function to lock and fetch due jobs atomically
CREATE OR REPLACE FUNCTION public.lock_due_automation_jobs(
  p_limit int DEFAULT 50,
  p_locked_by text DEFAULT 'job-runner'
)
RETURNS SETOF automation_scheduled_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM automation_scheduled_jobs
    WHERE status = 'queued'
      AND execute_at <= now()
    ORDER BY execute_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE automation_scheduled_jobs j
  SET status = 'running',
      locked_at = now(),
      locked_by = p_locked_by,
      attempts = attempts + 1,
      updated_at = now()
  FROM due
  WHERE j.id = due.id
  RETURNING j.*;
END;
$$;

-- Function to complete a job with status
CREATE OR REPLACE FUNCTION public.complete_automation_job_v2(
  p_job_id uuid,
  p_status scheduled_job_status,
  p_error text DEFAULT NULL,
  p_retry_delay_seconds int DEFAULT 30
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job automation_scheduled_jobs;
BEGIN
  SELECT * INTO v_job FROM automation_scheduled_jobs WHERE id = p_job_id;
  
  IF v_job IS NULL THEN
    RETURN;
  END IF;
  
  IF p_status = 'failed' AND v_job.attempts < v_job.max_attempts THEN
    -- Retry with exponential backoff
    UPDATE automation_scheduled_jobs
    SET status = 'queued',
        execute_at = now() + (p_retry_delay_seconds * power(2, v_job.attempts - 1)) * interval '1 second',
        last_error = p_error,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = now()
    WHERE id = p_job_id;
  ELSE
    -- Final status
    UPDATE automation_scheduled_jobs
    SET status = p_status,
        last_error = CASE WHEN p_status = 'failed' THEN p_error ELSE last_error END,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = now()
    WHERE id = p_job_id;
  END IF;
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_scheduled_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;