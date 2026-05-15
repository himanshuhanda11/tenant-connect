-- Add per-agent scoping
ALTER TABLE public.whatsapp_greeting_templates
  ADD COLUMN IF NOT EXISTS agent_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_whatsapp_greeting_templates_agent
  ON public.whatsapp_greeting_templates(tenant_id, agent_user_id);

-- Enable flag on agents
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS personal_greetings_enabled boolean NOT NULL DEFAULT false;

-- Enforce max 10 personal greetings per agent
CREATE OR REPLACE FUNCTION public.enforce_agent_greetings_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cnt int;
BEGIN
  IF NEW.agent_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO cnt
    FROM public.whatsapp_greeting_templates
    WHERE tenant_id = NEW.tenant_id
      AND agent_user_id = NEW.agent_user_id
      AND id <> COALESCE(NEW.id, gen_random_uuid());
  IF cnt >= 10 THEN
    RAISE EXCEPTION 'Each agent can have at most 10 personal greeting templates';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_agent_greetings_limit ON public.whatsapp_greeting_templates;
CREATE TRIGGER trg_agent_greetings_limit
  BEFORE INSERT ON public.whatsapp_greeting_templates
  FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_greetings_limit();

-- Refresh RLS so agents can manage their own rows
DROP POLICY IF EXISTS "greeting_templates_select" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "greeting_templates_insert" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "greeting_templates_update" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "greeting_templates_delete" ON public.whatsapp_greeting_templates;

CREATE POLICY "greeting_templates_select"
  ON public.whatsapp_greeting_templates FOR SELECT TO authenticated
  USING (is_tenant_member(tenant_id));

CREATE POLICY "greeting_templates_insert"
  ON public.whatsapp_greeting_templates FOR INSERT TO authenticated
  WITH CHECK (
    is_tenant_member(tenant_id)
    AND (agent_user_id IS NULL OR agent_user_id = auth.uid())
  );

CREATE POLICY "greeting_templates_update"
  ON public.whatsapp_greeting_templates FOR UPDATE TO authenticated
  USING (
    is_tenant_member(tenant_id)
    AND (agent_user_id IS NULL OR agent_user_id = auth.uid())
  );

CREATE POLICY "greeting_templates_delete"
  ON public.whatsapp_greeting_templates FOR DELETE TO authenticated
  USING (
    is_tenant_member(tenant_id)
    AND (agent_user_id IS NULL OR agent_user_id = auth.uid())
  );