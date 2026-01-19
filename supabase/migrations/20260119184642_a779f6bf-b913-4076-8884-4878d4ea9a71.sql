-- Create form_rules table for workspace-level auto-form automation
CREATE TABLE IF NOT EXISTS public.form_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Form configuration
  form_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  form_template_name TEXT,
  form_language TEXT DEFAULT 'en',
  form_variables JSONB DEFAULT '{}'::jsonb,
  
  -- Trigger configuration
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('first_message', 'keyword', 'ad_click', 'qr_scan', 'source', 'tag_added', 'scheduled')),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Conditions (optional)
  conditions JSONB DEFAULT '[]'::jsonb,
  
  -- Guardrails
  cooldown_minutes INTEGER DEFAULT 60,
  max_sends_per_contact_per_day INTEGER DEFAULT 1,
  require_opt_in BOOLEAN DEFAULT true,
  business_hours_only BOOLEAN DEFAULT false,
  
  -- Priority and status
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_rule_logs for tracking executions
CREATE TABLE IF NOT EXISTS public.form_rule_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.form_rules(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  
  status TEXT NOT NULL CHECK (status IN ('triggered', 'sent', 'delivered', 'failed', 'skipped')),
  skip_reason TEXT,
  error_message TEXT,
  
  trigger_data JSONB,
  message_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_rule_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_rules
CREATE POLICY "form_rules_select_member" ON public.form_rules
FOR SELECT USING (public.is_tenant_member(tenant_id));

CREATE POLICY "form_rules_insert_admin" ON public.form_rules
FOR INSERT WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "form_rules_update_admin" ON public.form_rules
FOR UPDATE USING (public.is_tenant_admin(tenant_id)) WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "form_rules_delete_admin" ON public.form_rules
FOR DELETE USING (public.is_tenant_admin(tenant_id));

-- RLS policies for form_rule_logs
CREATE POLICY "form_rule_logs_select_member" ON public.form_rule_logs
FOR SELECT USING (public.is_tenant_member(tenant_id));

CREATE POLICY "form_rule_logs_insert_system" ON public.form_rule_logs
FOR INSERT WITH CHECK (public.is_tenant_member(tenant_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_rules_tenant ON public.form_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_rules_active ON public.form_rules(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_form_rules_trigger ON public.form_rules(tenant_id, trigger_type);
CREATE INDEX IF NOT EXISTS idx_form_rule_logs_rule ON public.form_rule_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_form_rule_logs_contact ON public.form_rule_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_form_rule_logs_created ON public.form_rule_logs(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_form_rules_updated_at
BEFORE UPDATE ON public.form_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();