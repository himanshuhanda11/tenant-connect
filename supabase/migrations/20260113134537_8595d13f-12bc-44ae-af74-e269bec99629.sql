-- Add comprehensive contact attributes to contacts table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS campaign_source TEXT,
ADD COLUMN IF NOT EXISTS first_message TEXT,
ADD COLUMN IF NOT EXISTS first_message_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS entry_point TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS segment TEXT,
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS deal_stage TEXT,
ADD COLUMN IF NOT EXISTS closed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_reason TEXT,
ADD COLUMN IF NOT EXISTS closure_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS request_type TEXT,
ADD COLUMN IF NOT EXISTS request_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mau_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS whatsapp_quality_rating TEXT,
ADD COLUMN IF NOT EXISTS pricing_category TEXT,
ADD COLUMN IF NOT EXISTS blocked_by_user BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bot_handled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS automation_flow TEXT,
ADD COLUMN IF NOT EXISTS ai_intent_detected TEXT,
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS followup_due TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_timer TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_best_action TEXT,
ADD COLUMN IF NOT EXISTS opt_in_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_in_source TEXT,
ADD COLUMN IF NOT EXISTS opt_in_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_out_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_deletion_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS intervened BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS intervened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS intervened_by UUID REFERENCES public.profiles(id);

-- Create contact_timeline table for tracking all contact events
CREATE TABLE IF NOT EXISTS public.contact_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'message', 'status_change', 'intervention', 'tag_added', 'tag_removed', 'attribute_update', 'agent_assigned', 'note_added'
  event_data JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES public.profiles(id),
  actor_type TEXT DEFAULT 'system', -- 'user', 'system', 'bot', 'automation'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_timeline
ALTER TABLE public.contact_timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_timeline
CREATE POLICY "contact_timeline_select_member" ON public.contact_timeline
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "contact_timeline_insert_member" ON public.contact_timeline
FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "contact_timeline_delete_admin" ON public.contact_timeline
FOR DELETE USING (is_tenant_admin(tenant_id));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_lead_status ON public.contacts(tenant_id, lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_priority ON public.contacts(tenant_id, priority_level);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_segment ON public.contacts(tenant_id, segment);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_mau ON public.contacts(tenant_id, mau_status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_agent ON public.contacts(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_contact_timeline_contact ON public.contact_timeline(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_timeline_tenant ON public.contact_timeline(tenant_id);

-- Create enum-like check constraints for controlled values
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_priority_level_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_priority_level_check 
  CHECK (priority_level IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_lead_status_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_lead_status_check 
  CHECK (lead_status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'));

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_mau_status_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_mau_status_check 
  CHECK (mau_status IN ('active', 'inactive', 'churned'));