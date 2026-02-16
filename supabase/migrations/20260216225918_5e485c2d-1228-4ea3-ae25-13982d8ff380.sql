
-- Auto-reply settings per tenant
CREATE TABLE public.auto_reply_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- General settings
  business_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  business_hours_message TEXT NOT NULL DEFAULT 'Thank you for contacting us! We''ve received your message and will respond shortly. ⏱️',
  after_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  after_hours_message TEXT NOT NULL DEFAULT 'Thanks for reaching out! We''re currently offline. Our business hours are Mon-Fri 9AM-6PM. We''ll get back to you as soon as we''re back! 🌙',
  business_hours_start TEXT NOT NULL DEFAULT '09:00',
  business_hours_end TEXT NOT NULL DEFAULT '18:00',
  timezone TEXT NOT NULL DEFAULT 'UTC+5.5',
  
  -- Advanced options
  first_message_only BOOLEAN NOT NULL DEFAULT true,
  cooldown_hours INTEGER NOT NULL DEFAULT 24,
  delay_seconds INTEGER NOT NULL DEFAULT 3,
  exclude_assigned BOOLEAN NOT NULL DEFAULT true,
  
  -- Keywords
  keywords_enabled BOOLEAN NOT NULL DEFAULT false,
  keyword_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- AI settings
  ai_enabled BOOLEAN NOT NULL DEFAULT false,
  ai_tone TEXT NOT NULL DEFAULT 'professional',
  ai_knowledge_base TEXT,
  ai_response_length TEXT NOT NULL DEFAULT 'medium',
  ai_require_approval BOOLEAN NOT NULL DEFAULT true,
  ai_fallback_template BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.auto_reply_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view auto-reply settings"
ON public.auto_reply_settings FOR SELECT
USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert auto-reply settings"
ON public.auto_reply_settings FOR INSERT
WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update auto-reply settings"
ON public.auto_reply_settings FOR UPDATE
USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- Auto-update timestamp trigger
CREATE TRIGGER update_auto_reply_settings_updated_at
BEFORE UPDATE ON public.auto_reply_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_wa_updated_at();
