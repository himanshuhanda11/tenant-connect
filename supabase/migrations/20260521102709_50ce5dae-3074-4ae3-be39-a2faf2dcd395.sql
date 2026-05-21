
CREATE OR REPLACE FUNCTION public.increment_qr_scan(_campaign_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.qr_campaigns
  SET scan_count = scan_count + 1
  WHERE id = _campaign_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_qr_scan(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_qr_scan(UUID) TO service_role;
