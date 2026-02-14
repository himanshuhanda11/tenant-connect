
-- Contact Inbox Summary: fast pre-computed view for Lead CRM
CREATE TABLE IF NOT EXISTS public.contact_inbox_summary (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL,

  -- ownership / handling
  assigned_to uuid REFERENCES public.profiles(id),
  assigned_at timestamptz,
  claimed_by uuid REFERENCES public.profiles(id),
  claimed_at timestamptz,

  -- activity
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  last_replied_by uuid REFERENCES public.profiles(id),
  last_replied_at timestamptz,
  last_message_at timestamptz,
  open_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,

  -- computed flags (for fast filters)
  is_unreplied boolean NOT NULL DEFAULT false,
  lead_state text NOT NULL DEFAULT 'new',
  -- lead_state: new | assigned_pending | claimed | unreplied | closed

  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, contact_id, phone_number_id)
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_cis_tenant_state_time
ON public.contact_inbox_summary(tenant_id, lead_state, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_cis_tenant_agent
ON public.contact_inbox_summary(tenant_id, assigned_to, claimed_by, last_replied_by);

CREATE INDEX IF NOT EXISTS idx_cis_tenant_unreplied
ON public.contact_inbox_summary(tenant_id, is_unreplied) WHERE is_unreplied = true;

-- RLS
ALTER TABLE public.contact_inbox_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read contact inbox summary"
ON public.contact_inbox_summary FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = contact_inbox_summary.tenant_id
      AND tm.user_id = auth.uid()
  )
);

-- Only system/service role should write to this table
CREATE POLICY "Service role can manage contact inbox summary"
ON public.contact_inbox_summary FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_inbox_summary;
