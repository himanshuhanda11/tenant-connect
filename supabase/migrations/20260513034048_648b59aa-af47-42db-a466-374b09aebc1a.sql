
CREATE OR REPLACE FUNCTION public.increment_campaign_credits(p_campaign_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.campaigns
     SET actual_credits_used = COALESCE(actual_credits_used, 0) + COALESCE(p_amount, 0),
         updated_at = now()
   WHERE id = p_campaign_id;
$$;

REVOKE ALL ON FUNCTION public.increment_campaign_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_campaign_credits(uuid, integer) TO service_role;
