
-- Contact Attributes (key/value store per contact)
CREATE TABLE IF NOT EXISTS public.contact_attributes (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, contact_id, key)
);

-- Index for fast filtering by key+value within a workspace
CREATE INDEX IF NOT EXISTS idx_attr_tenant_key_val
ON public.contact_attributes(tenant_id, key, value);

-- Enable RLS
ALTER TABLE public.contact_attributes ENABLE ROW LEVEL SECURITY;

-- Members can read attributes
CREATE POLICY "Members can read contact attributes"
ON public.contact_attributes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = contact_attributes.tenant_id
      AND tm.user_id = auth.uid()
  )
);

-- Members can insert attributes
CREATE POLICY "Members can insert contact attributes"
ON public.contact_attributes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = contact_attributes.tenant_id
      AND tm.user_id = auth.uid()
  )
);

-- Members can update attributes
CREATE POLICY "Members can update contact attributes"
ON public.contact_attributes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = contact_attributes.tenant_id
      AND tm.user_id = auth.uid()
  )
);

-- Members can delete attributes
CREATE POLICY "Members can delete contact attributes"
ON public.contact_attributes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = contact_attributes.tenant_id
      AND tm.user_id = auth.uid()
  )
);

-- Also add lead_state filter to contact_inbox_summary
-- Add last_replied_at column if missing (for replied time display)
ALTER TABLE public.contact_inbox_summary 
ADD COLUMN IF NOT EXISTS last_replied_at TIMESTAMPTZ;
