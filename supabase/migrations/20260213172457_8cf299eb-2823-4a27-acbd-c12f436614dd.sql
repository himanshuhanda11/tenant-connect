
-- Workspace appearance preferences (per workspace)
CREATE TABLE public.workspace_appearance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'default',
  mode TEXT NOT NULL DEFAULT 'system' CHECK (mode IN ('light', 'dark', 'system')),
  accent_color TEXT DEFAULT NULL,
  density TEXT NOT NULL DEFAULT 'comfortable' CHECK (density IN ('comfortable', 'compact')),
  border_radius TEXT NOT NULL DEFAULT 'medium' CHECK (border_radius IN ('small', 'medium', 'large')),
  reduce_motion BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE public.workspace_appearance ENABLE ROW LEVEL SECURITY;

-- Members can read their workspace appearance
CREATE POLICY "Members can read workspace appearance"
ON public.workspace_appearance FOR SELECT
USING (public.is_tenant_member(auth.uid(), workspace_id));

-- Owner/admin can update workspace appearance
CREATE POLICY "Owner/admin can insert workspace appearance"
ON public.workspace_appearance FOR INSERT
WITH CHECK (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

CREATE POLICY "Owner/admin can update workspace appearance"
ON public.workspace_appearance FOR UPDATE
USING (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

-- Auto-update timestamp
CREATE TRIGGER set_workspace_appearance_updated_at
BEFORE UPDATE ON public.workspace_appearance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
