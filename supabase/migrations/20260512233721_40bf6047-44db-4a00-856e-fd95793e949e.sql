
-- Trigger: link inbound replies to campaign jobs via context_message_id
CREATE OR REPLACE FUNCTION public.link_inbound_to_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
BEGIN
  IF NEW.direction <> 'inbound' OR NEW.context_message_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id, campaign_id, replied_at INTO v_job
  FROM public.campaign_jobs
  WHERE tenant_id = NEW.tenant_id
    AND wamid = NEW.context_message_id
  LIMIT 1;

  IF v_job.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Tag inbound message with campaign_id
  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object('campaign_id', v_job.campaign_id);

  IF v_job.replied_at IS NULL THEN
    UPDATE public.campaign_jobs
    SET replied_at = now(), status = 'replied'::smeksh_job_status, updated_at = now()
    WHERE id = v_job.id AND replied_at IS NULL;

    UPDATE public.campaigns
    SET replied_count = COALESCE(replied_count, 0) + 1, updated_at = now()
    WHERE id = v_job.campaign_id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block inbound message inserts
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_link_campaign ON public.messages;
CREATE TRIGGER trg_messages_link_campaign
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.link_inbound_to_campaign();

-- Helper: per-plan max recipients per single broadcast send
CREATE OR REPLACE FUNCTION public.get_broadcast_recipient_limit(p_tenant_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
BEGIN
  SELECT COALESCE(plan, 'free') INTO v_plan
  FROM public.workspace_entitlements
  WHERE workspace_id = p_tenant_id;

  RETURN CASE COALESCE(v_plan, 'free')
    WHEN 'free' THEN 100
    WHEN 'basic' THEN 5000
    WHEN 'pro' THEN 50000
    WHEN 'business' THEN 1000000
    ELSE 100
  END;
END;
$$;
