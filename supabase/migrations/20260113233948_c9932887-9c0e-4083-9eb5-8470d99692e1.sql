
-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION smeksh_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION pause_smeksh_campaign(p_campaign_id uuid, p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.smeksh_campaigns
  SET status = 'paused'
  WHERE id = p_campaign_id AND tenant_id = p_tenant_id;

  UPDATE public.smeksh_campaign_jobs
  SET status = 'cancelled', updated_at = now()
  WHERE campaign_id = p_campaign_id AND tenant_id = p_tenant_id AND status = 'queued';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION cancel_smeksh_campaign(p_campaign_id uuid, p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.smeksh_campaigns
  SET status = 'cancelled'
  WHERE id = p_campaign_id AND tenant_id = p_tenant_id;

  UPDATE public.smeksh_campaign_jobs
  SET status = 'cancelled', updated_at = now()
  WHERE campaign_id = p_campaign_id AND tenant_id = p_tenant_id AND status IN ('queued', 'processing');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION lock_smeksh_campaign_jobs(p_worker_id text, p_limit int DEFAULT 50)
RETURNS SETOF public.smeksh_campaign_jobs AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.smeksh_campaign_jobs
    WHERE status = 'queued'
      AND execute_at <= now()
    ORDER BY execute_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.smeksh_campaign_jobs j
  SET status = 'processing', locked_at = now(), locked_by = p_worker_id
  FROM due
  WHERE j.id = due.id
  RETURNING j.*;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION complete_smeksh_campaign_job(
  p_job_id uuid,
  p_status smeksh_job_status,
  p_wa_message_id text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_campaign_id uuid;
  v_tenant_id uuid;
BEGIN
  SELECT campaign_id, tenant_id INTO v_campaign_id, v_tenant_id
  FROM public.smeksh_campaign_jobs WHERE id = p_job_id;

  UPDATE public.smeksh_campaign_jobs
  SET 
    status = p_status,
    wa_message_id = COALESCE(p_wa_message_id, wa_message_id),
    error_code = p_error_code,
    error_message = p_error_message,
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
  WHERE id = p_job_id;

  IF p_status = 'sent' THEN
    UPDATE public.smeksh_campaigns SET sent_count = sent_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'delivered' THEN
    UPDATE public.smeksh_campaigns SET delivered_count = delivered_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'read' THEN
    UPDATE public.smeksh_campaigns SET read_count = read_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'replied' THEN
    UPDATE public.smeksh_campaigns SET replied_count = replied_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'failed' THEN
    UPDATE public.smeksh_campaigns SET failed_count = failed_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'skipped' THEN
    UPDATE public.smeksh_campaigns SET skipped_count = skipped_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'cancelled' THEN
    UPDATE public.smeksh_campaigns SET cancelled_count = cancelled_count + 1 WHERE id = v_campaign_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
