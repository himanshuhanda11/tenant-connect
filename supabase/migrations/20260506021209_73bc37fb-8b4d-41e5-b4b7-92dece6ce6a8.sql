
-- Rules
CREATE TABLE public.instagram_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'new_message','first_message','keyword','no_reply',
    'returning_customer','outside_business_hours','story_reply'
  )),
  -- trigger config: { keywords:[], match:'any|all', no_reply_minutes:int, ... }
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- actions: ordered array [{type:'send_text',text:''},{type:'assign_team',team_id:''},{type:'ai_intent'},{type:'qualify_lead',fields:[]},{type:'handoff'},{type:'tag',tags:[]},{type:'schedule_followup',minutes:5,text:''}]
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  run_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ig_rules_tenant_active ON public.instagram_automation_rules(tenant_id, is_active, priority);

-- Canned replies
CREATE TABLE public.instagram_canned_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  shortcut TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, shortcut)
);

-- Business hours (one per tenant)
CREATE TABLE public.instagram_business_hours (
  tenant_id UUID PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  -- weekly: { mon:{open:'09:00',close:'18:00',enabled:true}, ... }
  weekly JSONB NOT NULL DEFAULT '{}'::jsonb,
  away_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Follow-ups (scheduled outbound messages)
CREATE TABLE public.instagram_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.instagram_conversations(id) ON DELETE CASCADE,
  rule_id UUID,
  text TEXT NOT NULL,
  send_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','cancelled','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  cancel_on_reply BOOLEAN NOT NULL DEFAULT true,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ig_followups_due ON public.instagram_followups(status, send_at);
CREATE INDEX idx_ig_followups_conv ON public.instagram_followups(conversation_id);

-- Execution logs
CREATE TABLE public.instagram_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  rule_id UUID,
  conversation_id UUID,
  message_id UUID,
  trigger_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('matched','executed','skipped','failed')),
  detail JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ig_logs_tenant_created ON public.instagram_automation_logs(tenant_id, created_at DESC);

-- Lead qualification answers
CREATE TABLE public.instagram_lead_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.instagram_conversations(id) ON DELETE CASCADE,
  contact_id UUID,
  name TEXT,
  phone TEXT,
  email TEXT,
  business_type TEXT,
  intent TEXT,           -- sales|support|complaint|high_intent|other
  confidence NUMERIC,
  raw JSONB,
  current_step TEXT,     -- which field we're collecting next
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','complete','abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id)
);

-- RLS
ALTER TABLE public.instagram_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_canned_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_lead_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ig_rules_member" ON public.instagram_automation_rules
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "ig_canned_member" ON public.instagram_canned_replies
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "ig_bh_member" ON public.instagram_business_hours
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "ig_followups_member" ON public.instagram_followups
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "ig_logs_member_select" ON public.instagram_automation_logs
  FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY "ig_qual_member" ON public.instagram_lead_qualifications
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));

-- updated_at triggers
CREATE TRIGGER trg_ig_rules_updated BEFORE UPDATE ON public.instagram_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ig_canned_updated BEFORE UPDATE ON public.instagram_canned_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ig_followups_updated BEFORE UPDATE ON public.instagram_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ig_qual_updated BEFORE UPDATE ON public.instagram_lead_qualifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
