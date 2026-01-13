-- Create user_attributes table for custom contact attributes
CREATE TABLE IF NOT EXISTS public.user_attributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  action_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Enable RLS
ALTER TABLE public.user_attributes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view attributes in their tenant"
  ON public.user_attributes FOR SELECT
  USING (is_tenant_member(tenant_id));

CREATE POLICY "Admins can create attributes"
  ON public.user_attributes FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "Admins can update attributes"
  ON public.user_attributes FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "Admins can delete attributes"
  ON public.user_attributes FOR DELETE
  USING (is_tenant_member(tenant_id));

-- Create indexes
CREATE INDEX idx_user_attributes_tenant ON public.user_attributes(tenant_id);
CREATE INDEX idx_user_attributes_active ON public.user_attributes(tenant_id, is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_user_attributes_updated_at
  BEFORE UPDATE ON public.user_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();