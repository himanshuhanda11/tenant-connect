
-- ============ email_conversations additive columns ============
ALTER TABLE public.email_conversations
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS is_spam boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid;

CREATE INDEX IF NOT EXISTS idx_email_conv_snooze
  ON public.email_conversations(snoozed_until)
  WHERE snoozed_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_conv_tags
  ON public.email_conversations USING GIN(tags);

-- ============ email_drafts (per-user autosave) ============
CREATE TABLE IF NOT EXISTS public.email_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body_html text,
  body_text text,
  cc_emails text[] NOT NULL DEFAULT '{}',
  bcc_emails text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_drafts_user ON public.email_drafts(user_id, updated_at DESC);

DROP POLICY IF EXISTS email_drafts_select ON public.email_drafts;
CREATE POLICY email_drafts_select ON public.email_drafts FOR SELECT
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS email_drafts_insert ON public.email_drafts;
CREATE POLICY email_drafts_insert ON public.email_drafts FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS email_drafts_update ON public.email_drafts;
CREATE POLICY email_drafts_update ON public.email_drafts FOR UPDATE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS email_drafts_delete ON public.email_drafts;
CREATE POLICY email_drafts_delete ON public.email_drafts FOR DELETE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());

CREATE TRIGGER trg_email_drafts_updated
  BEFORE UPDATE ON public.email_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ email_conversation_viewers (collision presence) ============
CREATE TABLE IF NOT EXISTS public.email_conversation_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_typing boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
ALTER TABLE public.email_conversation_viewers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_viewers_conv ON public.email_conversation_viewers(conversation_id, last_seen_at DESC);

DROP POLICY IF EXISTS viewers_select ON public.email_conversation_viewers;
CREATE POLICY viewers_select ON public.email_conversation_viewers FOR SELECT
  USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS viewers_upsert ON public.email_conversation_viewers;
CREATE POLICY viewers_upsert ON public.email_conversation_viewers FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS viewers_update ON public.email_conversation_viewers;
CREATE POLICY viewers_update ON public.email_conversation_viewers FOR UPDATE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS viewers_delete ON public.email_conversation_viewers;
CREATE POLICY viewers_delete ON public.email_conversation_viewers FOR DELETE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.email_conversation_viewers;

-- ============ email_templates ============
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  subject text,
  body_html text,
  body_text text,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_shared boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON public.email_templates(tenant_id);

DROP POLICY IF EXISTS templates_select ON public.email_templates;
CREATE POLICY templates_select ON public.email_templates FOR SELECT
  USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS templates_insert ON public.email_templates;
CREATE POLICY templates_insert ON public.email_templates FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS templates_update ON public.email_templates;
CREATE POLICY templates_update ON public.email_templates FOR UPDATE
  USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS templates_delete ON public.email_templates;
CREATE POLICY templates_delete ON public.email_templates FOR DELETE
  USING (is_tenant_member(tenant_id));

CREATE TRIGGER trg_email_templates_updated
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ email_signatures ============
CREATE TABLE IF NOT EXISTS public.email_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  html text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_sigs_user ON public.email_signatures(user_id);

DROP POLICY IF EXISTS sigs_select ON public.email_signatures;
CREATE POLICY sigs_select ON public.email_signatures FOR SELECT
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS sigs_insert ON public.email_signatures;
CREATE POLICY sigs_insert ON public.email_signatures FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS sigs_update ON public.email_signatures;
CREATE POLICY sigs_update ON public.email_signatures FOR UPDATE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());
DROP POLICY IF EXISTS sigs_delete ON public.email_signatures;
CREATE POLICY sigs_delete ON public.email_signatures FOR DELETE
  USING (is_tenant_member(tenant_id) AND user_id = auth.uid());

CREATE TRIGGER trg_email_sigs_updated
  BEFORE UPDATE ON public.email_signatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ Full-text search index on messages ============
CREATE INDEX IF NOT EXISTS idx_email_msg_fts
  ON public.email_messages
  USING GIN (to_tsvector('simple',
    coalesce(subject,'') || ' ' || coalesce(body_text,'') || ' ' || coalesce(from_email,'')
  ));
