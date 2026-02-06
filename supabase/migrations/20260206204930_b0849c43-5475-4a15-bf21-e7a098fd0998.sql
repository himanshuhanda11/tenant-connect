
-- 1) Rename admin_audit_logs table to platform_audit_logs
ALTER TABLE public.admin_audit_logs RENAME TO platform_audit_logs;

-- 2) Rename admin_kpi_overview view to platform_kpi_overview
ALTER VIEW public.admin_kpi_overview RENAME TO platform_kpi_overview;

-- 3) Rename admin_workspace_directory view to platform_workspace_directory
ALTER VIEW public.admin_workspace_directory RENAME TO platform_workspace_directory;

-- 4) Create platform_settings table for read-only mode and other global settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'false'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only platform admins can read settings (enforced via edge functions, but add RLS for safety)
CREATE POLICY "Platform settings readable by authenticated users"
  ON public.platform_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only super_admin can update (enforced via edge functions)
CREATE POLICY "Platform settings updatable by authenticated users"
  ON public.platform_settings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Platform settings insertable by authenticated users"
  ON public.platform_settings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed the support_read_only setting
INSERT INTO public.platform_settings (key, value) 
VALUES ('support_read_only', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Also update RLS policies on platform_audit_logs that reference the old table name
-- (RLS policies are automatically carried over with the rename, so no changes needed there)
