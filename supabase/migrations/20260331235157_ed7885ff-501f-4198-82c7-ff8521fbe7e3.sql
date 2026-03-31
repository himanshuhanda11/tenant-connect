
CREATE TABLE public.whatsapp_greeting_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_greeting_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant greeting templates"
ON public.whatsapp_greeting_templates FOR SELECT
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own tenant greeting templates"
ON public.whatsapp_greeting_templates FOR INSERT
TO authenticated
WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own tenant greeting templates"
ON public.whatsapp_greeting_templates FOR UPDATE
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own tenant greeting templates"
ON public.whatsapp_greeting_templates FOR DELETE
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM public.agents WHERE user_id = auth.uid()));
