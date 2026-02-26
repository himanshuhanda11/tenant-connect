
-- Add CRM fields to conversations table
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS crm_status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_notes text,
  ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS country_interest text,
  ADD COLUMN IF NOT EXISTS junk_reason text;

-- Create indexes for CRM queries
CREATE INDEX IF NOT EXISTS idx_conversations_crm_status ON public.conversations(tenant_id, crm_status);
CREATE INDEX IF NOT EXISTS idx_conversations_next_followup ON public.conversations(tenant_id, next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(tenant_id, created_at);

-- Create inbox_activity_logs table for tracking all CRM actions
CREATE TABLE IF NOT EXISTS public.inbox_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id),
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  old_value text,
  new_value text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inbox_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view activity logs" ON public.inbox_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm 
      WHERE tm.tenant_id = inbox_activity_logs.tenant_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert activity logs" ON public.inbox_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm 
      WHERE tm.tenant_id = inbox_activity_logs.tenant_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE INDEX idx_activity_logs_conversation ON public.inbox_activity_logs(conversation_id, created_at DESC);
CREATE INDEX idx_activity_logs_tenant ON public.inbox_activity_logs(tenant_id, created_at DESC);

-- Enable realtime for activity logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_activity_logs;

-- Create RPC for updating CRM status with activity logging
CREATE OR REPLACE FUNCTION public.update_crm_status(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_new_status text,
  p_junk_reason text DEFAULT NULL,
  p_followup_at timestamptz DEFAULT NULL,
  p_followup_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_old_status text;
BEGIN
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT crm_status INTO v_old_status
  FROM conversations WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  UPDATE conversations
  SET crm_status = p_new_status,
      junk_reason = CASE WHEN p_new_status = 'junk' THEN p_junk_reason ELSE junk_reason END,
      next_followup_at = CASE 
        WHEN p_new_status = 'follow_up_required' THEN p_followup_at
        WHEN p_new_status IN ('converted', 'junk', 'not_interested') THEN NULL
        ELSE next_followup_at
      END,
      followup_notes = CASE WHEN p_new_status = 'follow_up_required' THEN p_followup_notes ELSE followup_notes END,
      last_contacted_at = CASE WHEN p_new_status = 'contacted' THEN now() ELSE last_contacted_at END,
      updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO inbox_activity_logs (tenant_id, conversation_id, actor_id, action, old_value, new_value, details)
  VALUES (p_tenant_id, p_conversation_id, v_user, 'status_changed', v_old_status, p_new_status,
    jsonb_build_object('junk_reason', p_junk_reason, 'followup_at', p_followup_at, 'followup_notes', p_followup_notes));

  RETURN jsonb_build_object('ok', true, 'old_status', v_old_status, 'new_status', p_new_status);
END;
$$;

-- Create RPC for inbox CRM dashboard stats
CREATE OR REPLACE FUNCTION public.inbox_crm_dashboard_stats(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT jsonb_build_object(
    'new_today', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status = 'new' AND created_at >= CURRENT_DATE),
    'followup_today', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND next_followup_at IS NOT NULL AND next_followup_at::date = CURRENT_DATE AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'overdue', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND next_followup_at IS NOT NULL AND next_followup_at < now() AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'converted_month', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status = 'converted' AND updated_at >= date_trunc('month', CURRENT_DATE)),
    'total_open', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'unassigned', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND assigned_to IS NULL AND crm_status NOT IN ('converted', 'junk', 'not_interested'))
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Create RPC for agent performance stats
CREATE OR REPLACE FUNCTION public.inbox_agent_performance(p_tenant_id uuid)
RETURNS TABLE(agent_id uuid, agent_name text, assigned_count bigint, converted_count bigint, pending_count bigint, overdue_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.id AS agent_id,
    COALESCE(p.full_name, p.email) AS agent_name,
    COUNT(c.id) AS assigned_count,
    COUNT(c.id) FILTER (WHERE c.crm_status = 'converted') AS converted_count,
    COUNT(c.id) FILTER (WHERE c.crm_status NOT IN ('converted', 'junk', 'not_interested')) AS pending_count,
    COUNT(c.id) FILTER (WHERE c.next_followup_at IS NOT NULL AND c.next_followup_at < now() AND c.crm_status NOT IN ('converted', 'junk', 'not_interested')) AS overdue_count
  FROM profiles p
  JOIN tenant_members tm ON tm.user_id = p.id AND tm.tenant_id = p_tenant_id
  LEFT JOIN conversations c ON c.assigned_to = p.id AND c.tenant_id = p_tenant_id
  GROUP BY p.id, p.full_name, p.email
  ORDER BY assigned_count DESC;
END;
$$;
