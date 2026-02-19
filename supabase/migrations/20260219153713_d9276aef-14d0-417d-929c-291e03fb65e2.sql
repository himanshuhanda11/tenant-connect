
-- Table to store WhatsApp Ice Breakers (message sequences) per phone number
CREATE TABLE public.message_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id UUID NOT NULL REFERENCES public.phone_numbers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_synced BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_message_sequences_phone ON public.message_sequences(phone_number_id);
CREATE INDEX idx_message_sequences_tenant ON public.message_sequences(tenant_id);

-- Updated_at trigger
CREATE TRIGGER update_message_sequences_updated_at
  BEFORE UPDATE ON public.message_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- Enable RLS
ALTER TABLE public.message_sequences ENABLE ROW LEVEL SECURITY;

-- RLS policies: workspace members can manage their own sequences
CREATE POLICY "Members can view message sequences"
  ON public.message_sequences FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can insert message sequences"
  ON public.message_sequences FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update message sequences"
  ON public.message_sequences FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can delete message sequences"
  ON public.message_sequences FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
