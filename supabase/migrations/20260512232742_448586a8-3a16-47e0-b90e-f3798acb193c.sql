-- 1. Idempotency: prevent duplicate jobs for same (campaign, contact)
CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_jobs_campaign_contact
  ON public.campaign_jobs (campaign_id, contact_id);

-- 2. Helper: mark campaign running (idempotent)
CREATE OR REPLACE FUNCTION public.mark_campaign_running(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.campaigns
     SET status = 'running'::campaign_status,
         started_at = COALESCE(started_at, now()),
         updated_at = now()
   WHERE id = p_campaign_id
     AND status IN ('draft'::campaign_status, 'scheduled'::campaign_status);
END;
$$;

-- 3. Helper: complete a campaign when no jobs are pending
CREATE OR REPLACE FUNCTION public.mark_campaign_completed_if_done(p_campaign_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining int;
BEGIN
  SELECT count(*) INTO v_remaining
    FROM public.campaign_jobs
   WHERE campaign_id = p_campaign_id
     AND status IN ('queued'::smeksh_job_status, 'processing'::smeksh_job_status);

  IF v_remaining = 0 THEN
    UPDATE public.campaigns
       SET status = 'completed'::campaign_status,
           completed_at = COALESCE(completed_at, now()),
           updated_at = now()
     WHERE id = p_campaign_id
       AND status IN ('running'::campaign_status, 'scheduled'::campaign_status);
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_campaign_running(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_campaign_completed_if_done(uuid) TO service_role;