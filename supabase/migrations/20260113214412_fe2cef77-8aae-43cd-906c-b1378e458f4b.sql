-- Add scheduled jobs table for delays and business hours
CREATE TYPE public.scheduled_job_status AS ENUM ('queued', 'running', 'done', 'failed', 'cancelled');

CREATE TABLE public.automation_scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  node_id UUID REFERENCES public.automation_nodes(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  
  execute_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status scheduled_job_status NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for scheduled jobs
CREATE INDEX automation_jobs_due_idx ON public.automation_scheduled_jobs(status, execute_at) 
  WHERE status = 'queued';
CREATE INDEX automation_jobs_tenant_idx ON public.automation_scheduled_jobs(tenant_id, status, execute_at);
CREATE INDEX automation_jobs_workflow_idx ON public.automation_scheduled_jobs(workflow_id, status);
CREATE INDEX automation_jobs_run_idx ON public.automation_scheduled_jobs(run_id);

-- Enable RLS
ALTER TABLE public.automation_scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled jobs
CREATE POLICY "jobs_select_member" ON public.automation_scheduled_jobs
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "jobs_insert_system" ON public.automation_scheduled_jobs
  FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "jobs_update_system" ON public.automation_scheduled_jobs
  FOR UPDATE USING (is_tenant_member(tenant_id));

CREATE POLICY "jobs_delete_admin" ON public.automation_scheduled_jobs
  FOR DELETE USING (is_tenant_admin(tenant_id));

-- Trigger for updated_at
CREATE TRIGGER update_automation_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.automation_scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_automation_updated_at();

-- Enable Realtime for automation tables (for live debugging UI)
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_scheduled_jobs;

-- Create unique index for idempotency on runs (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS automation_runs_idempotency_idx 
  ON public.automation_runs(workflow_id, idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS automation_runs_tenant_workflow_idx ON public.automation_runs(tenant_id, workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS automation_runs_contact_idx ON public.automation_runs(contact_id, started_at DESC);
CREATE INDEX IF NOT EXISTS automation_steps_run_status_idx ON public.automation_steps(run_id, status);

-- Function to get pending scheduled jobs
CREATE OR REPLACE FUNCTION public.get_pending_automation_jobs(p_limit INTEGER DEFAULT 100)
RETURNS SETOF public.automation_scheduled_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.automation_scheduled_jobs
  SET status = 'running', updated_at = now(), attempts = attempts + 1
  WHERE id IN (
    SELECT id FROM public.automation_scheduled_jobs
    WHERE status = 'queued' AND execute_at <= now()
    ORDER BY execute_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

-- Function to complete a scheduled job
CREATE OR REPLACE FUNCTION public.complete_automation_job(
  p_job_id UUID,
  p_status scheduled_job_status,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.automation_scheduled_jobs
  SET 
    status = p_status,
    last_error = p_error,
    updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- Function to schedule a delayed action
CREATE OR REPLACE FUNCTION public.schedule_automation_job(
  p_tenant_id UUID,
  p_workflow_id UUID,
  p_run_id UUID,
  p_node_id UUID,
  p_contact_id UUID,
  p_conversation_id UUID,
  p_execute_at TIMESTAMP WITH TIME ZONE,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.automation_scheduled_jobs (
    tenant_id, workflow_id, run_id, node_id, contact_id, conversation_id, 
    execute_at, payload
  ) VALUES (
    p_tenant_id, p_workflow_id, p_run_id, p_node_id, p_contact_id, p_conversation_id,
    p_execute_at, p_payload
  )
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;