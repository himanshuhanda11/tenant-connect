-- =======================
-- ENUMS
-- =======================

CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived');

CREATE TYPE automation_node_type AS ENUM ('trigger', 'condition', 'action', 'delay', 'branch', 'stop');

CREATE TYPE extended_trigger_type AS ENUM (
  'new_contact_created',
  'first_inbound_message',
  'inbound_message',
  'outbound_message',
  'keyword_received',
  'tag_added',
  'tag_removed',
  'scheduled_time',
  'inactivity_no_reply',
  'conversation_opened',
  'conversation_closed',
  'agent_intervened',
  'button_clicked',
  'template_delivered',
  'template_read',
  'contact_updated'
);

CREATE TYPE extended_condition_type AS ENUM (
  'contact_has_tag',
  'contact_not_has_tag',
  'contact_attr_eq',
  'contact_attr_contains',
  'contact_source_in',
  'opt_in_required',
  'time_window',
  'conversation_status_in',
  'assigned_agent_exists',
  'last_message_direction',
  'mau_status',
  'regex_match'
);

CREATE TYPE extended_action_type AS ENUM (
  'send_template',
  'send_interactive',
  'add_tag',
  'remove_tag',
  'assign_agent',
  'set_priority',
  'set_status',
  'update_contact_attr',
  'add_internal_note',
  'create_task',
  'call_webhook',
  'stop_workflow'
);

CREATE TYPE workflow_run_status AS ENUM ('running', 'success', 'failed', 'skipped', 'cancelled');

CREATE TYPE workflow_step_status AS ENUM ('started', 'success', 'failed', 'skipped');

CREATE TYPE rate_limit_scope AS ENUM (
  'workflow_per_contact',
  'workflow_per_workspace',
  'action_per_contact',
  'action_per_workspace',
  'global_per_contact'
);

CREATE TYPE cooldown_scope AS ENUM ('workflow', 'node', 'action');

-- =======================
-- AUTOMATION WORKFLOWS (Main)
-- =======================

CREATE TABLE public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  status workflow_status NOT NULL DEFAULT 'draft',
  
  -- Main trigger definition
  trigger_type extended_trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  
  -- Safety & behavior guardrails
  enforce_opt_in_for_marketing BOOLEAN NOT NULL DEFAULT true,
  max_messages_per_contact_per_day INTEGER,
  cooldown_seconds INTEGER,
  timezone TEXT DEFAULT 'UTC',
  business_hours_config JSONB,
  stop_on_customer_reply BOOLEAN NOT NULL DEFAULT true,
  stop_on_conversation_closed BOOLEAN NOT NULL DEFAULT true,
  
  -- Anti-spam / rate limits at workflow level
  max_messages_per_hour INTEGER DEFAULT 10,
  max_runs_per_contact_per_day INTEGER DEFAULT 5,
  
  -- Builder metadata
  version INTEGER NOT NULL DEFAULT 1,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, name)
);

-- Indexes for workflows
CREATE INDEX idx_workflows_tenant_status ON public.automation_workflows(tenant_id, status);
CREATE INDEX idx_workflows_tenant_trigger ON public.automation_workflows(tenant_id, trigger_type);
CREATE INDEX idx_workflows_tenant_updated ON public.automation_workflows(tenant_id, updated_at DESC);

-- =======================
-- AUTOMATION NODES (Visual Builder)
-- =======================

CREATE TABLE public.automation_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  
  type automation_node_type NOT NULL,
  node_key TEXT NOT NULL,  -- Stable key for UI, e.g., "node_1"
  name TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- UI layout positions
  position_x FLOAT,
  position_y FLOAT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(workflow_id, node_key)
);

CREATE INDEX idx_nodes_workflow ON public.automation_nodes(workflow_id);
CREATE INDEX idx_nodes_workflow_type ON public.automation_nodes(workflow_id, type);

-- =======================
-- AUTOMATION EDGES (Connections between nodes)
-- =======================

CREATE TABLE public.automation_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  from_node_id UUID NOT NULL REFERENCES public.automation_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES public.automation_nodes(id) ON DELETE CASCADE,
  
  -- For branching: "true"/"false" or "pathA", "pathB"
  label TEXT,
  condition JSONB,  -- Optional extra edge condition
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_edges_workflow ON public.automation_edges(workflow_id);
CREATE INDEX idx_edges_from_node ON public.automation_edges(from_node_id);
CREATE INDEX idx_edges_to_node ON public.automation_edges(to_node_id);

-- =======================
-- AUTOMATION RUNS (Execution logs)
-- =======================

CREATE TABLE public.automation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  
  status workflow_run_status NOT NULL DEFAULT 'running',
  trigger_type extended_trigger_type NOT NULL,
  trigger_payload JSONB,  -- Snapshot of event that caused run
  
  -- Target references
  contact_id UUID REFERENCES public.contacts(id),
  conversation_id UUID REFERENCES public.conversations(id),
  message_id UUID REFERENCES public.messages(id),
  
  -- Safety / idempotency
  idempotency_key TEXT,  -- Unique per event+workflow+target
  
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  
  error TEXT,
  error_details JSONB,
  
  -- Stats
  steps_total INTEGER DEFAULT 0,
  steps_completed INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  
  UNIQUE(workflow_id, idempotency_key)
);

CREATE INDEX idx_runs_tenant_workflow ON public.automation_runs(tenant_id, workflow_id);
CREATE INDEX idx_runs_tenant_status ON public.automation_runs(tenant_id, status);
CREATE INDEX idx_runs_tenant_started ON public.automation_runs(tenant_id, started_at DESC);
CREATE INDEX idx_runs_contact ON public.automation_runs(contact_id);
CREATE INDEX idx_runs_workflow_contact ON public.automation_runs(workflow_id, contact_id);

-- =======================
-- AUTOMATION STEPS (Step-by-step execution log)
-- =======================

CREATE TABLE public.automation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.automation_nodes(id) ON DELETE CASCADE,
  
  node_type automation_node_type NOT NULL,
  node_name TEXT,
  status workflow_step_status NOT NULL DEFAULT 'started',
  
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Evaluation results
  input_data JSONB,
  output_data JSONB,
  error TEXT,
  error_details JSONB
);

CREATE INDEX idx_steps_run ON public.automation_steps(run_id);
CREATE INDEX idx_steps_run_status ON public.automation_steps(run_id, status);
CREATE INDEX idx_steps_node ON public.automation_steps(node_id);

-- =======================
-- RATE LIMIT COUNTERS (Anti-spam)
-- =======================

CREATE TABLE public.automation_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope rate_limit_scope NOT NULL,
  
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  node_id UUID REFERENCES public.automation_nodes(id) ON DELETE CASCADE,
  action_type extended_action_type,
  
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  
  bucket_start TIMESTAMP WITH TIME ZONE NOT NULL,
  bucket_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  count INTEGER NOT NULL DEFAULT 0,
  limit_value INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, scope, workflow_id, node_id, action_type, contact_id, bucket_start)
);

CREATE INDEX idx_rate_limits_tenant ON public.automation_rate_limits(tenant_id, scope);
CREATE INDEX idx_rate_limits_bucket ON public.automation_rate_limits(tenant_id, bucket_start);
CREATE INDEX idx_rate_limits_workflow_contact ON public.automation_rate_limits(workflow_id, contact_id, bucket_start);

-- =======================
-- COOLDOWNS (Idempotency / Repeat Protection)
-- =======================

CREATE TABLE public.automation_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope cooldown_scope NOT NULL,
  
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  node_id UUID REFERENCES public.automation_nodes(id) ON DELETE CASCADE,
  action_type extended_action_type,
  
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Unique key for quick lookup
  cooldown_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, cooldown_key)
);

CREATE INDEX idx_cooldowns_tenant ON public.automation_cooldowns(tenant_id);
CREATE INDEX idx_cooldowns_expires ON public.automation_cooldowns(tenant_id, expires_at);
CREATE INDEX idx_cooldowns_workflow_contact ON public.automation_cooldowns(workflow_id, contact_id);

-- =======================
-- DEADLETTER QUEUE (Failed async actions)
-- =======================

CREATE TABLE public.automation_deadletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE SET NULL,
  run_id UUID REFERENCES public.automation_runs(id) ON DELETE SET NULL,
  
  error_type TEXT NOT NULL,  -- e.g., "WEBHOOK_FAILED", "SEND_TEMPLATE_FAILED"
  payload JSONB NOT NULL,
  error TEXT,
  error_details JSONB,
  
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_deadletters_tenant ON public.automation_deadletters(tenant_id);
CREATE INDEX idx_deadletters_retry ON public.automation_deadletters(tenant_id, next_retry_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_deadletters_workflow ON public.automation_deadletters(workflow_id);

-- =======================
-- LOOP DETECTION REGISTRY (Prevent circular triggers)
-- =======================

CREATE TABLE public.automation_loop_guards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Track what triggered what to detect loops
  source_workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  target_workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  chain_depth INTEGER NOT NULL DEFAULT 1,
  chain_path TEXT[],  -- Array of workflow IDs in trigger chain
  
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, source_workflow_id, target_workflow_id, contact_id, conversation_id)
);

CREATE INDEX idx_loop_guards_expires ON public.automation_loop_guards(expires_at);
CREATE INDEX idx_loop_guards_workflow ON public.automation_loop_guards(tenant_id, target_workflow_id);

-- =======================
-- ENABLE RLS
-- =======================

ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_deadletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_loop_guards ENABLE ROW LEVEL SECURITY;

-- =======================
-- RLS POLICIES: automation_workflows
-- =======================

CREATE POLICY "workflows_select_member" ON public.automation_workflows
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "workflows_insert_admin" ON public.automation_workflows
  FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "workflows_update_admin" ON public.automation_workflows
  FOR UPDATE USING (is_tenant_admin(tenant_id)) WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "workflows_delete_owner" ON public.automation_workflows
  FOR DELETE USING (is_tenant_owner(tenant_id));

-- =======================
-- RLS POLICIES: automation_nodes
-- =======================

CREATE POLICY "nodes_select_member" ON public.automation_nodes
  FOR SELECT USING (
    is_tenant_member((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "nodes_insert_admin" ON public.automation_nodes
  FOR INSERT WITH CHECK (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "nodes_update_admin" ON public.automation_nodes
  FOR UPDATE USING (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "nodes_delete_admin" ON public.automation_nodes
  FOR DELETE USING (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

-- =======================
-- RLS POLICIES: automation_edges
-- =======================

CREATE POLICY "edges_select_member" ON public.automation_edges
  FOR SELECT USING (
    is_tenant_member((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "edges_insert_admin" ON public.automation_edges
  FOR INSERT WITH CHECK (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "edges_update_admin" ON public.automation_edges
  FOR UPDATE USING (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

CREATE POLICY "edges_delete_admin" ON public.automation_edges
  FOR DELETE USING (
    is_tenant_admin((SELECT tenant_id FROM automation_workflows WHERE id = workflow_id))
  );

-- =======================
-- RLS POLICIES: automation_runs
-- =======================

CREATE POLICY "runs_select_member" ON public.automation_runs
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "runs_insert_system" ON public.automation_runs
  FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "runs_update_system" ON public.automation_runs
  FOR UPDATE USING (is_tenant_member(tenant_id));

CREATE POLICY "runs_delete_admin" ON public.automation_runs
  FOR DELETE USING (is_tenant_admin(tenant_id));

-- =======================
-- RLS POLICIES: automation_steps
-- =======================

CREATE POLICY "steps_select_member" ON public.automation_steps
  FOR SELECT USING (
    is_tenant_member((SELECT tenant_id FROM automation_runs WHERE id = run_id))
  );

CREATE POLICY "steps_insert_system" ON public.automation_steps
  FOR INSERT WITH CHECK (
    is_tenant_member((SELECT tenant_id FROM automation_runs WHERE id = run_id))
  );

CREATE POLICY "steps_update_system" ON public.automation_steps
  FOR UPDATE USING (
    is_tenant_member((SELECT tenant_id FROM automation_runs WHERE id = run_id))
  );

CREATE POLICY "steps_delete_admin" ON public.automation_steps
  FOR DELETE USING (
    is_tenant_admin((SELECT tenant_id FROM automation_runs WHERE id = run_id))
  );

-- =======================
-- RLS POLICIES: Rate limits, cooldowns, deadletters (system-managed)
-- =======================

CREATE POLICY "rate_limits_select_member" ON public.automation_rate_limits
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "rate_limits_manage_system" ON public.automation_rate_limits
  FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "cooldowns_select_member" ON public.automation_cooldowns
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "cooldowns_manage_system" ON public.automation_cooldowns
  FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "deadletters_select_admin" ON public.automation_deadletters
  FOR SELECT USING (is_tenant_admin(tenant_id));

CREATE POLICY "deadletters_manage_admin" ON public.automation_deadletters
  FOR ALL USING (is_tenant_admin(tenant_id)) WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "loop_guards_select_member" ON public.automation_loop_guards
  FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "loop_guards_manage_system" ON public.automation_loop_guards
  FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

-- =======================
-- HELPER FUNCTIONS
-- =======================

-- Function to check if a workflow can run (not rate limited)
CREATE OR REPLACE FUNCTION public.check_automation_rate_limit(
  p_tenant_id UUID,
  p_workflow_id UUID,
  p_contact_id UUID,
  p_scope rate_limit_scope DEFAULT 'workflow_per_contact'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_bucket_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current hour bucket
  v_bucket_start := date_trunc('hour', now());
  
  SELECT count, limit_value INTO v_count, v_limit
  FROM automation_rate_limits
  WHERE tenant_id = p_tenant_id
    AND scope = p_scope
    AND workflow_id = p_workflow_id
    AND contact_id = p_contact_id
    AND bucket_start = v_bucket_start;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- No limit record yet
  END IF;
  
  RETURN v_count < v_limit;
END;
$$;

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_automation_rate_limit(
  p_tenant_id UUID,
  p_workflow_id UUID,
  p_contact_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_scope rate_limit_scope DEFAULT 'workflow_per_contact'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bucket_start TIMESTAMP WITH TIME ZONE;
  v_bucket_end TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_bucket_start := date_trunc('hour', now());
  v_bucket_end := v_bucket_start + interval '1 hour';
  
  INSERT INTO automation_rate_limits (tenant_id, scope, workflow_id, contact_id, bucket_start, bucket_end, count, limit_value)
  VALUES (p_tenant_id, p_scope, p_workflow_id, p_contact_id, v_bucket_start, v_bucket_end, 1, p_limit)
  ON CONFLICT (tenant_id, scope, workflow_id, node_id, action_type, contact_id, bucket_start)
  DO UPDATE SET count = automation_rate_limits.count + 1, updated_at = now()
  RETURNING count INTO v_current_count;
  
  RETURN v_current_count <= p_limit;
END;
$$;

-- Function to check cooldown
CREATE OR REPLACE FUNCTION public.check_automation_cooldown(
  p_tenant_id UUID,
  p_cooldown_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM automation_cooldowns
    WHERE tenant_id = p_tenant_id
      AND cooldown_key = p_cooldown_key
      AND expires_at > now()
  );
END;
$$;

-- Function to set cooldown
CREATE OR REPLACE FUNCTION public.set_automation_cooldown(
  p_tenant_id UUID,
  p_cooldown_key TEXT,
  p_seconds INTEGER,
  p_scope cooldown_scope DEFAULT 'workflow',
  p_workflow_id UUID DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO automation_cooldowns (tenant_id, scope, workflow_id, contact_id, cooldown_key, expires_at)
  VALUES (p_tenant_id, p_scope, p_workflow_id, p_contact_id, p_cooldown_key, now() + (p_seconds || ' seconds')::interval)
  ON CONFLICT (tenant_id, cooldown_key)
  DO UPDATE SET expires_at = now() + (p_seconds || ' seconds')::interval;
END;
$$;

-- Function to detect loops
CREATE OR REPLACE FUNCTION public.check_automation_loop(
  p_tenant_id UUID,
  p_source_workflow_id UUID,
  p_target_workflow_id UUID,
  p_contact_id UUID,
  p_max_depth INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_depth INTEGER;
BEGIN
  -- Check if this chain already exists and is too deep
  SELECT chain_depth INTO v_depth
  FROM automation_loop_guards
  WHERE tenant_id = p_tenant_id
    AND target_workflow_id = p_target_workflow_id
    AND contact_id = p_contact_id
    AND expires_at > now()
  ORDER BY chain_depth DESC
  LIMIT 1;
  
  IF FOUND AND v_depth >= p_max_depth THEN
    RETURN FALSE; -- Loop detected
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Cleanup function for expired records
CREATE OR REPLACE FUNCTION public.cleanup_automation_expired_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean expired cooldowns
  DELETE FROM automation_cooldowns WHERE expires_at < now();
  
  -- Clean expired loop guards
  DELETE FROM automation_loop_guards WHERE expires_at < now();
  
  -- Clean old rate limit buckets (keep last 24 hours)
  DELETE FROM automation_rate_limits WHERE bucket_end < now() - interval '24 hours';
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_automation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON public.automation_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_automation_updated_at();

CREATE TRIGGER update_automation_nodes_updated_at
  BEFORE UPDATE ON public.automation_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_automation_updated_at();