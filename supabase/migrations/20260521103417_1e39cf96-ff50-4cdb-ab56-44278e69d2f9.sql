
CREATE OR REPLACE FUNCTION public.increment_qr_lead(_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.qr_campaigns
    SET lead_count = COALESCE(lead_count, 0) + 1,
        updated_at = now()
    WHERE id = _campaign_id;
END;
$$;
