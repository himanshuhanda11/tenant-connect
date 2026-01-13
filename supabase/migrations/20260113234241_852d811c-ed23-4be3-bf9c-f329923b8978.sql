
-- =====================================================
-- SMEKSH Inbox / Live Chat Complete Schema
-- =====================================================

-- 0) Create enum types
DO $$ BEGIN
  CREATE TYPE smeksh_message_direction AS ENUM ('inbound','outbound');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_message_type AS ENUM ('text','image','video','audio','document','sticker','location','contact','interactive','template','system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_wa_status AS ENUM ('sent','delivered','read','failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_conversation_event_type AS ENUM (
    'conversation_created',
    'status_changed',
    'assigned',
    'unassigned',
    'tag_added',
    'tag_removed',
    'note_added',
    'automation_ran',
    'campaign_sent',
    'ctwa_attributed',
    'snoozed',
    'unsnoozed',
    'priority_changed',
    'intervened',
    'bot_resumed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_note_visibility AS ENUM ('internal','private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_typing_status AS ENUM ('typing','stopped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 1) smeksh_messages (inbound/outbound, media, template)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,

  direction smeksh_message_direction NOT NULL,
  message_type smeksh_message_type NOT NULL DEFAULT 'text',

  wa_message_id text,
  wa_context_id text,

  sent_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  body_text text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,

  media_bucket text,
  media_path text,
  media_url text,
  media_mime_type text,
  media_size_bytes bigint,

  template_name text,
  template_language text,
  template_category text,
  template_variables jsonb,

  latest_status smeksh_wa_status,
  latest_status_at timestamptz,

  is_failed boolean NOT NULL DEFAULT false,
  error_code text,
  error_message text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_messages_ws_conv_time_idx
  ON public.smeksh_messages(tenant_id, conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_messages_ws_wa_id_idx
  ON public.smeksh_messages(tenant_id, wa_message_id);

CREATE INDEX IF NOT EXISTS smeksh_messages_ws_contact_idx
  ON public.smeksh_messages(tenant_id, contact_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_smeksh_messages_touch ON public.smeksh_messages;
CREATE TRIGGER trg_smeksh_messages_touch
BEFORE UPDATE ON public.smeksh_messages
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_messages_all" ON public.smeksh_messages;
CREATE POLICY "smeksh_messages_all" ON public.smeksh_messages FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 2) smeksh_message_status_events (webhook statuses)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_message_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  message_id uuid REFERENCES public.smeksh_messages(id) ON DELETE SET NULL,
  wa_message_id text,

  status smeksh_wa_status NOT NULL,
  status_at timestamptz NOT NULL DEFAULT now(),

  recipient_wa_id text,
  phone_number_id text,
  waba_id text,

  error_code text,
  error_message text,

  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_msg_status_ws_time_idx
  ON public.smeksh_message_status_events(tenant_id, status_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_msg_status_ws_wa_idx
  ON public.smeksh_message_status_events(tenant_id, wa_message_id, status_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_msg_status_message_idx
  ON public.smeksh_message_status_events(message_id, status_at DESC);

ALTER TABLE public.smeksh_message_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_message_status_events_all" ON public.smeksh_message_status_events;
CREATE POLICY "smeksh_message_status_events_all" ON public.smeksh_message_status_events FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 3) smeksh_conversation_events (timeline)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_conversation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,

  event_type smeksh_conversation_event_type NOT NULL,

  actor_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_type text NOT NULL DEFAULT 'system',

  message_id uuid REFERENCES public.smeksh_messages(id) ON DELETE SET NULL,

  from_assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_id uuid,

  tag_id uuid,
  tag_name text,
  tag_reason text,

  automation_workflow_id text,
  campaign_id uuid,
  ctwa_lead_id uuid,

  old_value text,
  new_value text,

  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_conv_events_ws_conv_time_idx
  ON public.smeksh_conversation_events(tenant_id, conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_conv_events_ws_type_idx
  ON public.smeksh_conversation_events(tenant_id, event_type, created_at DESC);

ALTER TABLE public.smeksh_conversation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_conversation_events_all" ON public.smeksh_conversation_events;
CREATE POLICY "smeksh_conversation_events_all" ON public.smeksh_conversation_events FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 4) smeksh_conversation_snoozes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_conversation_snoozes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,

  snoozed_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  snooze_until timestamptz NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'active',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_snooze_ws_until_idx
  ON public.smeksh_conversation_snoozes(tenant_id, status, snooze_until);

CREATE INDEX IF NOT EXISTS smeksh_snooze_conv_idx
  ON public.smeksh_conversation_snoozes(conversation_id, status);

DROP TRIGGER IF EXISTS trg_smeksh_snoozes_touch ON public.smeksh_conversation_snoozes;
CREATE TRIGGER trg_smeksh_snoozes_touch
BEFORE UPDATE ON public.smeksh_conversation_snoozes
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_conversation_snoozes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_conversation_snoozes_all" ON public.smeksh_conversation_snoozes;
CREATE POLICY "smeksh_conversation_snoozes_all" ON public.smeksh_conversation_snoozes FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 5) smeksh_internal_notes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,

  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  visibility smeksh_note_visibility NOT NULL DEFAULT 'internal',
  body text NOT NULL,

  mentions_profile_ids uuid[] DEFAULT '{}'::uuid[],
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_notes_ws_conv_time_idx
  ON public.smeksh_internal_notes(tenant_id, conversation_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_smeksh_notes_touch ON public.smeksh_internal_notes;
CREATE TRIGGER trg_smeksh_notes_touch
BEFORE UPDATE ON public.smeksh_internal_notes
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_internal_notes_all" ON public.smeksh_internal_notes;
CREATE POLICY "smeksh_internal_notes_all" ON public.smeksh_internal_notes FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 6) smeksh_typing_state (ephemeral)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_typing_state (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status smeksh_typing_status NOT NULL DEFAULT 'typing',

  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, conversation_id, profile_id)
);

CREATE INDEX IF NOT EXISTS smeksh_typing_expires_idx
  ON public.smeksh_typing_state(tenant_id, expires_at);

ALTER TABLE public.smeksh_typing_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_typing_state_all" ON public.smeksh_typing_state;
CREATE POLICY "smeksh_typing_state_all" ON public.smeksh_typing_state FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 7) smeksh_conversation_reads (agent read receipts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_conversation_reads (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  last_read_message_id uuid REFERENCES public.smeksh_messages(id) ON DELETE SET NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (tenant_id, conversation_id, profile_id)
);

CREATE INDEX IF NOT EXISTS smeksh_conv_reads_ws_profile_idx
  ON public.smeksh_conversation_reads(tenant_id, profile_id, last_read_at DESC);

ALTER TABLE public.smeksh_conversation_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_conversation_reads_all" ON public.smeksh_conversation_reads;
CREATE POLICY "smeksh_conversation_reads_all" ON public.smeksh_conversation_reads FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 8) Add columns to conversations for inbox features
-- =====================================================
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
ADD COLUMN IF NOT EXISTS last_message_preview text,
ADD COLUMN IF NOT EXISTS last_message_id uuid,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS is_intervened boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS intervened_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS intervened_at timestamptz,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
ADD COLUMN IF NOT EXISTS sla_first_response_due timestamptz,
ADD COLUMN IF NOT EXISTS sla_breached boolean DEFAULT false;

-- =====================================================
-- 9) Helper Functions
-- =====================================================

-- Update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body_text, 100),
    last_message_id = NEW.id,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  -- Update unread count for inbound messages
  IF NEW.direction = 'inbound' THEN
    UPDATE public.conversations
    SET unread_count = unread_count + 1
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_conversation_last_message ON public.smeksh_messages;
CREATE TRIGGER trg_update_conversation_last_message
AFTER INSERT ON public.smeksh_messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_profile_id uuid
)
RETURNS void AS $$
DECLARE
  v_last_message_id uuid;
BEGIN
  SELECT id INTO v_last_message_id
  FROM public.smeksh_messages
  WHERE conversation_id = p_conversation_id
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO public.smeksh_conversation_reads (tenant_id, conversation_id, profile_id, last_read_message_id, last_read_at)
  VALUES (p_tenant_id, p_conversation_id, p_profile_id, v_last_message_id, now())
  ON CONFLICT (tenant_id, conversation_id, profile_id)
  DO UPDATE SET last_read_message_id = v_last_message_id, last_read_at = now();

  UPDATE public.conversations
  SET unread_count = 0
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Set intervene mode
CREATE OR REPLACE FUNCTION set_conversation_intervene(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_profile_id uuid,
  p_intervene boolean
)
RETURNS void AS $$
BEGIN
  UPDATE public.conversations
  SET 
    is_intervened = p_intervene,
    intervened_by = CASE WHEN p_intervene THEN p_profile_id ELSE NULL END,
    intervened_at = CASE WHEN p_intervene THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events (
    tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details
  ) VALUES (
    p_tenant_id, p_conversation_id,
    CASE WHEN p_intervene THEN 'intervened' ELSE 'bot_resumed' END,
    p_profile_id, 'agent',
    jsonb_build_object('intervened', p_intervene)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Snooze conversation
CREATE OR REPLACE FUNCTION snooze_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_profile_id uuid,
  p_snooze_until timestamptz,
  p_reason text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_snooze_id uuid;
BEGIN
  -- Cancel any existing active snoozes
  UPDATE public.smeksh_conversation_snoozes
  SET status = 'cancelled', updated_at = now()
  WHERE conversation_id = p_conversation_id AND status = 'active';

  INSERT INTO public.smeksh_conversation_snoozes (
    tenant_id, conversation_id, snoozed_by_profile_id, snooze_until, reason
  ) VALUES (
    p_tenant_id, p_conversation_id, p_profile_id, p_snooze_until, p_reason
  ) RETURNING id INTO v_snooze_id;

  INSERT INTO public.smeksh_conversation_events (
    tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details
  ) VALUES (
    p_tenant_id, p_conversation_id, 'snoozed', p_profile_id, 'agent',
    jsonb_build_object('snooze_until', p_snooze_until, 'reason', p_reason)
  );

  RETURN v_snooze_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cleanup expired typing states
CREATE OR REPLACE FUNCTION cleanup_expired_typing()
RETURNS void AS $$
BEGIN
  DELETE FROM public.smeksh_typing_state WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_typing_state;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_conversation_events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
