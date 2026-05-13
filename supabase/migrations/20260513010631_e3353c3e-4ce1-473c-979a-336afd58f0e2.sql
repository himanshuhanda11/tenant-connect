-- Extend contacts_crm_search to filter by conversations.crm_status (Inbox CRM stages)
CREATE OR REPLACE FUNCTION public.contacts_crm_search(
  p_tenant_id uuid,
  p_phone_number_id text DEFAULT NULL,
  p_lead_states text[] DEFAULT NULL,
  p_is_unreplied boolean DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_assigned_to uuid DEFAULT NULL,
  p_claimed_by uuid DEFAULT NULL,
  p_last_replied_by uuid DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_tag_ids uuid[] DEFAULT NULL,
  p_tag_match_all boolean DEFAULT false,
  p_attributes jsonb DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,
  p_crm_statuses text[] DEFAULT NULL
)
RETURNS TABLE (
  tenant_id uuid,
  phone_number_id text,
  contact_id uuid,
  open_conversation_id uuid,
  lead_state text,
  is_unreplied boolean,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  assigned_to uuid,
  assigned_at timestamptz,
  claimed_by uuid,
  claimed_at timestamptz,
  last_replied_by uuid,
  last_replied_at timestamptz,
  contact_name text,
  wa_id text,
  first_name text,
  profile_picture_url text,
  tags jsonb,
  attributes jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_tag_count int := COALESCE(array_length(p_tag_ids, 1), 0);
  v_attr_count int := COALESCE(jsonb_array_length(p_attributes), 0);
  v_crm_count int := COALESCE(array_length(p_crm_statuses, 1), 0);
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = p_tenant_id AND tm.user_id = v_user
  ) THEN
    RAISE EXCEPTION 'not a tenant member';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      cis.tenant_id, cis.phone_number_id, cis.contact_id, cis.open_conversation_id,
      cis.lead_state, cis.is_unreplied, cis.last_message_at, cis.last_inbound_at, cis.last_outbound_at,
      cis.assigned_to, cis.assigned_at, cis.claimed_by, cis.claimed_at, cis.last_replied_by, cis.last_replied_at,
      c.name AS contact_name, c.wa_id, c.first_name, c.profile_picture_url
    FROM public.contact_inbox_summary cis
    JOIN public.contacts c ON c.id = cis.contact_id AND c.tenant_id = cis.tenant_id
    WHERE cis.tenant_id = p_tenant_id
      AND (p_phone_number_id IS NULL OR cis.phone_number_id = p_phone_number_id)
      AND (p_lead_states IS NULL OR cis.lead_state = ANY(p_lead_states))
      AND (
        v_crm_count = 0
        OR EXISTS (
          SELECT 1 FROM public.conversations cv
          WHERE cv.tenant_id = cis.tenant_id
            AND cv.contact_id = cis.contact_id
            AND COALESCE(cv.crm_status, 'new') = ANY(p_crm_statuses)
        )
      )
      AND (p_is_unreplied IS NULL OR cis.is_unreplied = p_is_unreplied)
      AND (p_date_from IS NULL OR cis.last_message_at >= p_date_from)
      AND (p_date_to IS NULL OR cis.last_message_at <= p_date_to)
      AND (p_assigned_to IS NULL OR cis.assigned_to = p_assigned_to)
      AND (p_claimed_by IS NULL OR cis.claimed_by = p_claimed_by)
      AND (p_last_replied_by IS NULL OR cis.last_replied_by = p_last_replied_by)
      AND (
        p_search IS NULL
        OR c.name ILIKE ('%' || p_search || '%')
        OR c.wa_id ILIKE ('%' || p_search || '%')
        OR c.first_name ILIKE ('%' || p_search || '%')
      )
  ),
  tag_filtered AS (
    SELECT b.* FROM base b
    WHERE p_tag_ids IS NULL OR v_tag_count = 0
      OR (p_tag_match_all = false AND EXISTS (
        SELECT 1 FROM public.contact_tags ct
        WHERE ct.contact_id = b.contact_id AND ct.tag_id = ANY(p_tag_ids)
      ))
      OR (p_tag_match_all = true AND (
        SELECT COUNT(DISTINCT ct.tag_id) FROM public.contact_tags ct
        WHERE ct.contact_id = b.contact_id AND ct.tag_id = ANY(p_tag_ids)
      ) = v_tag_count)
  ),
  attr_filtered AS (
    SELECT tf.* FROM tag_filtered tf
    WHERE p_attributes IS NULL OR v_attr_count = 0
      OR (
        SELECT COUNT(*) FROM jsonb_array_elements(p_attributes) AS f(item)
        WHERE EXISTS (
          SELECT 1 FROM public.contact_attributes ca
          WHERE ca.tenant_id = tf.tenant_id
            AND ca.contact_id = tf.contact_id
            AND ca.key = (f.item->>'key')
            AND (
              (f.item->>'value') IS NULL
              OR (f.item->>'value') = ''
              OR ca.value ILIKE ('%' || (f.item->>'value') || '%')
            )
        )
      ) = v_attr_count
  ),
  tags_agg AS (
    SELECT af.contact_id,
      jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color) ORDER BY t.name)
        FILTER (WHERE t.id IS NOT NULL) AS tags
    FROM attr_filtered af
    LEFT JOIN public.contact_tags ct ON ct.contact_id = af.contact_id
    LEFT JOIN public.tags t ON t.id = ct.tag_id AND t.tenant_id = af.tenant_id
    GROUP BY af.contact_id
  ),
  attrs_agg AS (
    SELECT af.contact_id,
      COALESCE(jsonb_object_agg(ca.key, ca.value) FILTER (WHERE ca.key IS NOT NULL), '{}'::jsonb) AS attributes
    FROM attr_filtered af
    LEFT JOIN public.contact_attributes ca
      ON ca.tenant_id = af.tenant_id AND ca.contact_id = af.contact_id
    GROUP BY af.contact_id
  )
  SELECT
    af.tenant_id, af.phone_number_id, af.contact_id, af.open_conversation_id,
    af.lead_state, af.is_unreplied, af.last_message_at, af.last_inbound_at, af.last_outbound_at,
    af.assigned_to, af.assigned_at, af.claimed_by, af.claimed_at, af.last_replied_by, af.last_replied_at,
    af.contact_name, af.wa_id, af.first_name, af.profile_picture_url,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    COALESCE(aa.attributes, '{}'::jsonb) AS attributes
  FROM attr_filtered af
  LEFT JOIN tags_agg ta ON ta.contact_id = af.contact_id
  LEFT JOIN attrs_agg aa ON aa.contact_id = af.contact_id
  ORDER BY af.last_message_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(p_limit, 200))
  OFFSET GREATEST(p_offset, 0);
END;
$$;