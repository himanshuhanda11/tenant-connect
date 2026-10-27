CREATE TABLE public.meta_ctwa_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ad_id text NOT NULL,
  headline text,
  body text,
  source_url text,
  media_type text,
  image_url text,
  clicks_count integer NOT NULL DEFAULT 0,
  leads_count integer NOT NULL DEFAULT 0,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_lead_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ad_id)
);

GRANT SELECT ON public.meta_ctwa_ads TO authenticated;
GRANT ALL ON public.meta_ctwa_ads TO service_role;

ALTER TABLE public.meta_ctwa_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view WhatsApp ad sources"
ON public.meta_ctwa_ads FOR SELECT TO authenticated
USING (tenant_id IN (SELECT public.my_tenant_ids()));

CREATE INDEX meta_ctwa_ads_tenant_last_seen_idx ON public.meta_ctwa_ads (tenant_id, last_seen_at DESC);

CREATE OR REPLACE FUNCTION public.record_ctwa_ad_click(
  _tenant_id uuid,
  _ad_id text,
  _headline text,
  _body text,
  _source_url text,
  _media_type text,
  _image_url text,
  _is_new_lead boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _tenant_id IS NULL OR coalesce(btrim(_ad_id), '') = '' THEN
    RETURN;
  END IF;
  INSERT INTO public.meta_ctwa_ads AS a (tenant_id, ad_id, headline, body, source_url, media_type, image_url, clicks_count, leads_count, last_lead_at)
  VALUES (_tenant_id, left(btrim(_ad_id), 64), left(_headline, 500), left(_body, 2000), left(_source_url, 1000), left(_media_type, 32), left(_image_url, 2000), 1,
          CASE WHEN _is_new_lead THEN 1 ELSE 0 END, CASE WHEN _is_new_lead THEN now() END)
  ON CONFLICT (tenant_id, ad_id) DO UPDATE SET
    headline = coalesce(EXCLUDED.headline, a.headline),
    body = coalesce(EXCLUDED.body, a.body),
    source_url = coalesce(EXCLUDED.source_url, a.source_url),
    media_type = coalesce(EXCLUDED.media_type, a.media_type),
    image_url = coalesce(EXCLUDED.image_url, a.image_url),
    clicks_count = a.clicks_count + 1,
    leads_count = a.leads_count + CASE WHEN _is_new_lead THEN 1 ELSE 0 END,
    last_lead_at = CASE WHEN _is_new_lead THEN now() ELSE a.last_lead_at END,
    last_seen_at = now(),
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_ctwa_ad_click(uuid, text, text, text, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ctwa_ad_click(uuid, text, text, text, text, text, text, boolean) TO service_role;

-- Backfill from WhatsApp ad clicks already received
WITH refs AS (
  SELECT m.tenant_id, m.created_at,
         coalesce(m.raw->'referral', m.raw->'message'->'referral') AS r
  FROM public.messages m
  WHERE m.direction = 'inbound'
    AND (m.raw ? 'referral' OR m.raw->'message' ? 'referral')
), agg AS (
  SELECT tenant_id, r->>'source_id' AS ad_id,
         (array_agg(r->>'headline' ORDER BY created_at DESC) FILTER (WHERE r->>'headline' IS NOT NULL))[1] AS headline,
         (array_agg(r->>'body' ORDER BY created_at DESC) FILTER (WHERE r->>'body' IS NOT NULL))[1] AS body,
         (array_agg(r->>'source_url' ORDER BY created_at DESC) FILTER (WHERE r->>'source_url' IS NOT NULL))[1] AS source_url,
         (array_agg(r->>'media_type' ORDER BY created_at DESC) FILTER (WHERE r->>'media_type' IS NOT NULL))[1] AS media_type,
         (array_agg(r->>'image_url' ORDER BY created_at DESC) FILTER (WHERE r->>'image_url' IS NOT NULL))[1] AS image_url,
         count(*)::int AS clicks, min(created_at) AS first_seen, max(created_at) AS last_seen
  FROM refs
  WHERE coalesce(r->>'source_id', '') <> '' AND tenant_id IS NOT NULL
  GROUP BY 1, 2
), leads AS (
  SELECT tenant_id, campaign_source AS ad_id, count(*)::int AS n, max(created_at) AS last_lead
  FROM public.contacts
  WHERE source = 'meta_ads' AND coalesce(campaign_source, '') <> ''
  GROUP BY 1, 2
)
INSERT INTO public.meta_ctwa_ads (tenant_id, ad_id, headline, body, source_url, media_type, image_url, clicks_count, leads_count, first_seen_at, last_seen_at, last_lead_at)
SELECT a.tenant_id, left(a.ad_id, 64), left(a.headline, 500), left(a.body, 2000), left(a.source_url, 1000), left(a.media_type, 32), left(a.image_url, 2000),
       a.clicks, coalesce(l.n, 0), a.first_seen, a.last_seen, l.last_lead
FROM agg a
JOIN public.tenants t ON t.id = a.tenant_id
LEFT JOIN leads l ON l.tenant_id = a.tenant_id AND l.ad_id = a.ad_id
ON CONFLICT (tenant_id, ad_id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_ctwa_ads;