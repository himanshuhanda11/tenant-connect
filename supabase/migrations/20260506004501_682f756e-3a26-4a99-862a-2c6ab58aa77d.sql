
-- ============================================================
-- 1. Fix broken RLS on smeksh_* tables (correlated subquery bypass)
-- ============================================================

-- smeksh_campaigns
DROP POLICY IF EXISTS smeksh_campaigns_select ON public.smeksh_campaigns;
DROP POLICY IF EXISTS smeksh_campaigns_insert ON public.smeksh_campaigns;
DROP POLICY IF EXISTS smeksh_campaigns_update ON public.smeksh_campaigns;
DROP POLICY IF EXISTS smeksh_campaigns_delete ON public.smeksh_campaigns;
CREATE POLICY smeksh_campaigns_all ON public.smeksh_campaigns
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_messages
DROP POLICY IF EXISTS smeksh_messages_all ON public.smeksh_messages;
CREATE POLICY smeksh_messages_all ON public.smeksh_messages
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_campaign_audiences
DROP POLICY IF EXISTS smeksh_campaign_audiences_all ON public.smeksh_campaign_audiences;
CREATE POLICY smeksh_campaign_audiences_all ON public.smeksh_campaign_audiences
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_campaign_ab_tests
DROP POLICY IF EXISTS smeksh_campaign_ab_tests_all ON public.smeksh_campaign_ab_tests;
CREATE POLICY smeksh_campaign_ab_tests_all ON public.smeksh_campaign_ab_tests
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_campaign_events
DROP POLICY IF EXISTS smeksh_campaign_events_select ON public.smeksh_campaign_events;
DROP POLICY IF EXISTS smeksh_campaign_events_insert ON public.smeksh_campaign_events;
CREATE POLICY smeksh_campaign_events_select ON public.smeksh_campaign_events
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY smeksh_campaign_events_insert ON public.smeksh_campaign_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_campaign_jobs
DROP POLICY IF EXISTS smeksh_campaign_jobs_all ON public.smeksh_campaign_jobs;
CREATE POLICY smeksh_campaign_jobs_all ON public.smeksh_campaign_jobs
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_campaign_reports
DROP POLICY IF EXISTS smeksh_campaign_reports_all ON public.smeksh_campaign_reports;
CREATE POLICY smeksh_campaign_reports_all ON public.smeksh_campaign_reports
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_conversation_reads
DROP POLICY IF EXISTS smeksh_conversation_reads_all ON public.smeksh_conversation_reads;
CREATE POLICY smeksh_conversation_reads_all ON public.smeksh_conversation_reads
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_conversation_events
DROP POLICY IF EXISTS smeksh_conversation_events_all ON public.smeksh_conversation_events;
CREATE POLICY smeksh_conversation_events_all ON public.smeksh_conversation_events
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_conversation_snoozes
DROP POLICY IF EXISTS smeksh_conversation_snoozes_all ON public.smeksh_conversation_snoozes;
CREATE POLICY smeksh_conversation_snoozes_all ON public.smeksh_conversation_snoozes
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_internal_notes
DROP POLICY IF EXISTS smeksh_internal_notes_all ON public.smeksh_internal_notes;
CREATE POLICY smeksh_internal_notes_all ON public.smeksh_internal_notes
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_message_status_events
DROP POLICY IF EXISTS smeksh_message_status_events_all ON public.smeksh_message_status_events;
CREATE POLICY smeksh_message_status_events_all ON public.smeksh_message_status_events
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- smeksh_typing_state
DROP POLICY IF EXISTS smeksh_typing_state_all ON public.smeksh_typing_state;
CREATE POLICY smeksh_typing_state_all ON public.smeksh_typing_state
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================================
-- 2. workspace_credits — restrict ALL policy to service_role
-- ============================================================
DROP POLICY IF EXISTS "Service role manage credits" ON public.workspace_credits;
CREATE POLICY "Service role manage credits" ON public.workspace_credits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. platform_settings — admin only
-- ============================================================
DROP POLICY IF EXISTS "Platform settings readable by authenticated users" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform settings insertable by authenticated users" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform settings updatable by authenticated users" ON public.platform_settings;
CREATE POLICY platform_settings_admin_read ON public.platform_settings
  FOR SELECT TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']));
CREATE POLICY platform_settings_admin_write ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin']))
  WITH CHECK (public.is_platform_user(ARRAY['super_admin']));

-- ============================================================
-- 4. platform_incidents + events — admin/support only
-- ============================================================
DROP POLICY IF EXISTS "Platform incidents readable by platform users" ON public.platform_incidents;
DROP POLICY IF EXISTS "Platform incidents insertable by platform users" ON public.platform_incidents;
DROP POLICY IF EXISTS "Platform incidents updatable by platform users" ON public.platform_incidents;
CREATE POLICY platform_incidents_read ON public.platform_incidents
  FOR SELECT TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']));
CREATE POLICY platform_incidents_write ON public.platform_incidents
  FOR ALL TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']))
  WITH CHECK (public.is_platform_user(ARRAY['super_admin','support']));

DROP POLICY IF EXISTS "Incident events readable by platform users" ON public.platform_incident_events;
DROP POLICY IF EXISTS "Incident events insertable by platform users" ON public.platform_incident_events;
CREATE POLICY platform_incident_events_read ON public.platform_incident_events
  FOR SELECT TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']));
CREATE POLICY platform_incident_events_write ON public.platform_incident_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_user(ARRAY['super_admin','support']));

-- ============================================================
-- 5. member_invites — remove public read; add token-lookup function
-- ============================================================
DROP POLICY IF EXISTS public_invite_lookup_by_token ON public.member_invites;

CREATE OR REPLACE FUNCTION public.lookup_invite_by_token(p_token text)
RETURNS TABLE(
  id uuid,
  tenant_id uuid,
  email text,
  role_id uuid,
  team_ids uuid[],
  phone_number_ids uuid[],
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tenant_id, email, role_id, team_ids, phone_number_ids, expires_at, accepted_at
  FROM public.member_invites
  WHERE token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_invite_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_invite_by_token(text) TO anon, authenticated;

-- ============================================================
-- 6. Storage: invoices bucket — service role only writes
-- ============================================================
DROP POLICY IF EXISTS "Service role can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update invoices" ON storage.objects;
CREATE POLICY "Service role can upload invoices" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'invoices');
CREATE POLICY "Service role can update invoices" ON storage.objects
  FOR UPDATE TO service_role
  USING (bucket_id = 'invoices')
  WITH CHECK (bucket_id = 'invoices');

-- ============================================================
-- 7. Storage: meta-ad-media — workspace member ownership check
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload meta ad media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update meta ad media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete meta ad media" ON storage.objects;

CREATE POLICY "Workspace members can upload meta ad media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'meta-ad-media'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Workspace members can update meta ad media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'meta-ad-media'
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Workspace members can delete meta ad media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'meta-ad-media'
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- 8. smeksh_wabas — allow members to read
-- ============================================================
DROP POLICY IF EXISTS "Members can view tenant WABAs" ON public.smeksh_wabas;
CREATE POLICY "Members can view tenant WABAs" ON public.smeksh_wabas
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
