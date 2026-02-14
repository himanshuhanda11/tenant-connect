
-- =============================================
-- contacts_crm_search RPC
-- Adapted: workspace_id → tenant_id, workspace_members → tenant_members
-- contact_tags has no tenant_id column, contacts has no phone_e164
-- =============================================

create or replace function public.contacts_crm_search(
  p_tenant_id uuid,
  p_phone_number_id text default null,

  p_lead_states text[] default null,
  p_is_unreplied boolean default null,

  p_date_from timestamptz default null,
  p_date_to timestamptz default null,

  p_assigned_to uuid default null,
  p_claimed_by uuid default null,
  p_last_replied_by uuid default null,

  p_search text default null,
  p_tag_ids uuid[] default null,
  p_tag_match_all boolean default false,

  p_attributes jsonb default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tag_count int := coalesce(array_length(p_tag_ids, 1), 0);
  v_attr_count int := coalesce(jsonb_array_length(p_attributes), 0);
begin
  -- membership check (SECURITY DEFINER bypasses RLS)
  if not exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = v_user
  ) then
    raise exception 'not a tenant member';
  end if;

  return query
  with base as (
    select
      cis.tenant_id,
      cis.phone_number_id,
      cis.contact_id,
      cis.open_conversation_id,
      cis.lead_state,
      cis.is_unreplied,
      cis.last_message_at,
      cis.last_inbound_at,
      cis.last_outbound_at,
      cis.assigned_to,
      cis.assigned_at,
      cis.claimed_by,
      cis.claimed_at,
      cis.last_replied_by,
      cis.last_replied_at,

      c.name as contact_name,
      c.wa_id,
      c.first_name,
      c.profile_picture_url
    from public.contact_inbox_summary cis
    join public.contacts c
      on c.id = cis.contact_id
     and c.tenant_id = cis.tenant_id
    where cis.tenant_id = p_tenant_id
      and (p_phone_number_id is null or cis.phone_number_id = p_phone_number_id)

      and (p_lead_states is null or cis.lead_state = any(p_lead_states))
      and (p_is_unreplied is null or cis.is_unreplied = p_is_unreplied)

      and (p_date_from is null or cis.last_message_at >= p_date_from)
      and (p_date_to is null or cis.last_message_at <= p_date_to)

      and (p_assigned_to is null or cis.assigned_to = p_assigned_to)
      and (p_claimed_by is null or cis.claimed_by = p_claimed_by)
      and (p_last_replied_by is null or cis.last_replied_by = p_last_replied_by)

      and (
        p_search is null
        or c.name ilike ('%' || p_search || '%')
        or c.wa_id ilike ('%' || p_search || '%')
        or c.first_name ilike ('%' || p_search || '%')
      )
  ),

  -- TAG FILTER (ANY / ALL)
  tag_filtered as (
    select b.*
    from base b
    where
      p_tag_ids is null
      or v_tag_count = 0
      or (
        p_tag_match_all = false
        and exists (
          select 1
          from public.contact_tags ct
          where ct.contact_id = b.contact_id
            and ct.tag_id = any(p_tag_ids)
        )
      )
      or (
        p_tag_match_all = true
        and (
          select count(distinct ct.tag_id)
          from public.contact_tags ct
          where ct.contact_id = b.contact_id
            and ct.tag_id = any(p_tag_ids)
        ) = v_tag_count
      )
  ),

  -- ATTRIBUTE FILTER (ALL key/value pairs must match)
  attr_filtered as (
    select tf.*
    from tag_filtered tf
    where
      p_attributes is null
      or v_attr_count = 0
      or (
        select count(*)
        from jsonb_array_elements(p_attributes) as f(item)
        where exists (
          select 1
          from public.contact_attributes ca
          where ca.tenant_id = tf.tenant_id
            and ca.contact_id = tf.contact_id
            and ca.key = (f.item->>'key')
            and (
              (f.item->>'value') is null
              or (f.item->>'value') = ''
              or ca.value ilike ('%' || (f.item->>'value') || '%')
            )
        )
      ) = v_attr_count
  ),

  -- AGGREGATE TAGS for UI chips
  tags_agg as (
    select
      af.contact_id,
      jsonb_agg(
        jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)
        order by t.name
      ) filter (where t.id is not null) as tags
    from attr_filtered af
    left join public.contact_tags ct
      on ct.contact_id = af.contact_id
    left join public.tags t
      on t.id = ct.tag_id
     and t.tenant_id = af.tenant_id
    group by af.contact_id
  ),

  -- AGGREGATE ATTRIBUTES for UI chips
  attrs_agg as (
    select
      af.contact_id,
      coalesce(
        jsonb_object_agg(ca.key, ca.value) filter (where ca.key is not null),
        '{}'::jsonb
      ) as attributes
    from attr_filtered af
    left join public.contact_attributes ca
      on ca.tenant_id = af.tenant_id
     and ca.contact_id = af.contact_id
    group by af.contact_id
  )

  select
    af.tenant_id,
    af.phone_number_id,
    af.contact_id,
    af.open_conversation_id,

    af.lead_state,
    af.is_unreplied,
    af.last_message_at,
    af.last_inbound_at,
    af.last_outbound_at,

    af.assigned_to,
    af.assigned_at,
    af.claimed_by,
    af.claimed_at,
    af.last_replied_by,
    af.last_replied_at,

    af.contact_name,
    af.wa_id,
    af.first_name,
    af.profile_picture_url,

    coalesce(ta.tags, '[]'::jsonb) as tags,
    coalesce(aa.attributes, '{}'::jsonb) as attributes
  from attr_filtered af
  left join tags_agg ta
    on ta.contact_id = af.contact_id
  left join attrs_agg aa
    on aa.contact_id = af.contact_id
  order by af.last_message_at desc nulls last
  limit greatest(1, least(p_limit, 200))
  offset greatest(p_offset, 0);

end;
$$;

-- =============================================
-- Recommended indexes
-- =============================================

-- Summary table: core filtering
create index if not exists idx_cis_tenant_phone_last
on public.contact_inbox_summary(tenant_id, phone_number_id, last_message_at desc);

create index if not exists idx_cis_tenant_state_last
on public.contact_inbox_summary(tenant_id, lead_state, last_message_at desc);

create index if not exists idx_cis_tenant_agents
on public.contact_inbox_summary(tenant_id, assigned_to, claimed_by, last_replied_by);

-- Tags filter speed
create index if not exists idx_contact_tags_contact_tag
on public.contact_tags(contact_id, tag_id);

-- Attributes filter speed
create index if not exists idx_contact_attrs_tenant_contact_key_val
on public.contact_attributes(tenant_id, contact_id, key, value);
