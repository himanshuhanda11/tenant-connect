CREATE OR REPLACE FUNCTION public.get_ad_agent_lead_breakdown(_tenant_id uuid, _since timestamptz DEFAULT NULL)
RETURNS TABLE(ad_id text, agent_id uuid, leads bigint, recent_leads bigint, last_lead_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_tenant_member(auth.uid(), _tenant_id) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  RETURN QUERY
  WITH ad_contacts AS (
    SELECT DISTINCT ON (c.id)
      c.campaign_source AS ad_id,
      cv.assigned_to AS agent_id,
      COALESCE(c.created_at, cv.created_at) AS lead_at
    FROM public.contacts c
    JOIN public.conversations cv ON cv.contact_id = c.id AND cv.tenant_id = _tenant_id
    WHERE c.tenant_id = _tenant_id
      AND c.source = 'meta_ads'
      AND c.campaign_source IS NOT NULL
    ORDER BY c.id, cv.last_message_at DESC NULLS LAST
  )
  SELECT a.ad_id,
         a.agent_id,
         count(*)::bigint,
         count(*) FILTER (WHERE _since IS NOT NULL AND a.lead_at >= _since)::bigint,
         max(a.lead_at)
  FROM ad_contacts a
  GROUP BY a.ad_id, a.agent_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_ad_agent_lead_breakdown(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ad_agent_lead_breakdown(uuid, timestamptz) TO authenticated, service_role;