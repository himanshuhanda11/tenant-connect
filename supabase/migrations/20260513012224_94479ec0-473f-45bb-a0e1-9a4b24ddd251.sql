
-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_source ON public.contacts(tenant_id, source);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_assigned ON public.contacts(tenant_id, assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_created ON public.contacts(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_last_active ON public.contacts(tenant_id, last_active_date);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_segment ON public.contacts(tenant_id, segment);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_optout ON public.contacts(tenant_id, opt_out);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_contact_crm ON public.conversations(tenant_id, contact_id, crm_status);
CREATE INDEX IF NOT EXISTS idx_contact_inbox_summary_tenant_assigned ON public.contact_inbox_summary(tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_inbox_summary_tenant_lastmsg ON public.contact_inbox_summary(tenant_id, last_message_at);
CREATE INDEX IF NOT EXISTS idx_contact_attributes_tenant_key ON public.contact_attributes(tenant_id, key);

DROP FUNCTION IF EXISTS public.campaign_audience_estimate(uuid, uuid, boolean, text[], text[], uuid[], uuid[], boolean, text[], text[], text, text, timestamptz, timestamptz, timestamptz, timestamptz, jsonb, boolean, integer, boolean, boolean, integer);

CREATE OR REPLACE FUNCTION public.campaign_audience_estimate(
  p_tenant_id uuid,
  p_assigned_agent uuid DEFAULT NULL,
  p_unassigned_only boolean DEFAULT false,
  p_lead_statuses text[] DEFAULT NULL,
  p_contact_sources text[] DEFAULT NULL,
  p_include_tag_ids uuid[] DEFAULT NULL,
  p_exclude_tag_ids uuid[] DEFAULT NULL,
  p_tag_match_all boolean DEFAULT false,
  p_include_segment_names text[] DEFAULT NULL,
  p_exclude_segment_names text[] DEFAULT NULL,
  p_flow_id text DEFAULT NULL,
  p_meta_campaign_id text DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_last_active_from timestamptz DEFAULT NULL,
  p_last_active_to timestamptz DEFAULT NULL,
  p_attributes jsonb DEFAULT NULL,
  p_is_unreplied boolean DEFAULT NULL,
  p_exclude_recent_days integer DEFAULT 0,
  p_opt_in_only boolean DEFAULT true,
  p_exclude_blocked boolean DEFAULT true,
  p_sample_limit integer DEFAULT 25
)
RETURNS TABLE(total bigint, sample_ids uuid[])
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attr_count int := 0;
  v_recent_cutoff timestamptz;
BEGIN
  IF NOT public.is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'Access denied to tenant %', p_tenant_id USING ERRCODE = '42501';
  END IF;

  IF p_attributes IS NOT NULL THEN
    v_attr_count := jsonb_array_length(p_attributes);
  END IF;

  IF p_exclude_recent_days > 0 THEN
    v_recent_cutoff := now() - make_interval(days => p_exclude_recent_days);
  END IF;

  RETURN QUERY
  WITH matched AS (
    SELECT c.id
    FROM public.contacts c
    WHERE c.tenant_id = p_tenant_id
      AND (NOT p_opt_in_only OR c.opt_out IS NOT TRUE)
      AND (NOT p_exclude_blocked OR c.blocked_by_user IS NOT TRUE)
      AND (NOT p_unassigned_only OR c.assigned_agent_id IS NULL)
      AND (p_contact_sources IS NULL OR array_length(p_contact_sources,1) IS NULL OR c.source = ANY(p_contact_sources))
      AND (p_flow_id IS NULL OR c.automation_flow = p_flow_id)
      AND (p_meta_campaign_id IS NULL OR c.campaign_source = p_meta_campaign_id)
      AND (p_date_from IS NULL OR c.created_at >= p_date_from)
      AND (p_date_to IS NULL OR c.created_at < p_date_to)
      AND (p_last_active_from IS NULL OR c.last_active_date >= p_last_active_from::date)
      AND (p_last_active_to IS NULL OR c.last_active_date < p_last_active_to::date)
      AND (p_include_segment_names IS NULL OR array_length(p_include_segment_names,1) IS NULL OR c.segment = ANY(p_include_segment_names))
      AND (p_exclude_segment_names IS NULL OR array_length(p_exclude_segment_names,1) IS NULL OR c.segment IS NULL OR NOT (c.segment = ANY(p_exclude_segment_names)))
      -- Specific assigned agent: contact-level OR conversation-level
      AND (
        p_assigned_agent IS NULL OR (
          c.assigned_agent_id = p_assigned_agent
          OR EXISTS (
            SELECT 1 FROM public.contact_inbox_summary s
            WHERE s.tenant_id = p_tenant_id AND s.contact_id = c.id AND s.assigned_to = p_assigned_agent
          )
        )
      )
      -- Lead statuses (Inbox CRM)
      AND (
        p_lead_statuses IS NULL OR array_length(p_lead_statuses,1) IS NULL OR EXISTS (
          SELECT 1 FROM public.conversations cv
          WHERE cv.tenant_id = p_tenant_id AND cv.contact_id = c.id
            AND cv.crm_status::text = ANY(p_lead_statuses)
        )
      )
      -- Include tags (OR)
      AND (
        p_include_tag_ids IS NULL OR array_length(p_include_tag_ids,1) IS NULL OR p_tag_match_all OR EXISTS (
          SELECT 1 FROM public.contact_tags ct
          WHERE ct.contact_id = c.id AND ct.tag_id = ANY(p_include_tag_ids)
        )
      )
      -- Include tags (AND / match-all)
      AND (
        NOT p_tag_match_all OR p_include_tag_ids IS NULL OR array_length(p_include_tag_ids,1) IS NULL OR (
          (SELECT count(DISTINCT ct.tag_id) FROM public.contact_tags ct
           WHERE ct.contact_id = c.id AND ct.tag_id = ANY(p_include_tag_ids))
          = array_length(p_include_tag_ids, 1)
        )
      )
      -- Exclude tags
      AND (
        p_exclude_tag_ids IS NULL OR array_length(p_exclude_tag_ids,1) IS NULL OR NOT EXISTS (
          SELECT 1 FROM public.contact_tags ct
          WHERE ct.contact_id = c.id AND ct.tag_id = ANY(p_exclude_tag_ids)
        )
      )
      -- Attributes (each must match)
      AND (
        v_attr_count = 0 OR (
          SELECT count(*) FROM (
            SELECT 1
            FROM jsonb_array_elements(p_attributes) AS a
            WHERE EXISTS (
              SELECT 1 FROM public.contact_attributes ca
              WHERE ca.tenant_id = p_tenant_id
                AND ca.contact_id = c.id
                AND ca.key = (a->>'key')
                AND ca.value ILIKE '%' || (a->>'value') || '%'
            )
          ) hits
        ) = v_attr_count
      )
      -- Inbox summary based: is_unreplied + exclude recently contacted
      AND (
        p_is_unreplied IS NULL OR EXISTS (
          SELECT 1 FROM public.contact_inbox_summary s
          WHERE s.tenant_id = p_tenant_id AND s.contact_id = c.id AND s.is_unreplied = p_is_unreplied
        )
      )
      AND (
        p_exclude_recent_days <= 0 OR NOT EXISTS (
          SELECT 1 FROM public.contact_inbox_summary s
          WHERE s.tenant_id = p_tenant_id AND s.contact_id = c.id
            AND s.last_message_at IS NOT NULL
            AND s.last_message_at >= v_recent_cutoff
        )
      )
  )
  SELECT
    (SELECT count(*) FROM matched)::bigint AS total,
    COALESCE((SELECT array_agg(id) FROM (SELECT id FROM matched LIMIT GREATEST(p_sample_limit,0)) s), ARRAY[]::uuid[]) AS sample_ids;
END;
$$;

GRANT EXECUTE ON FUNCTION public.campaign_audience_estimate(uuid, uuid, boolean, text[], text[], uuid[], uuid[], boolean, text[], text[], text, text, timestamptz, timestamptz, timestamptz, timestamptz, jsonb, boolean, integer, boolean, boolean, integer) TO authenticated;
