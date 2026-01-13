-- Fix function search_path warnings by recreating functions with explicit search_path

-- Fix update_automation_updated_at function
DROP FUNCTION IF EXISTS public.update_automation_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_automation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON public.automation_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_automation_updated_at();

CREATE TRIGGER update_automation_nodes_updated_at
  BEFORE UPDATE ON public.automation_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_automation_updated_at();