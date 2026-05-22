
DO $$ BEGIN
  CREATE TYPE email_conversation_status AS ENUM ('open', 'pending', 'closed', 'spam');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_message_status AS ENUM ('received', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  address TEXT NOT NULL,
  display_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  signature_html TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (address)
);
CREATE INDEX IF NOT EXISTS idx_email_accounts_tenant ON public.email_accounts(tenant_id);

CREATE TABLE IF NOT EXISTS public.email_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
  contact_id UUID,
  subject TEXT,
  from_email TEXT,
  from_name TEXT,
  thread_key TEXT,
  status email_conversation_status NOT NULL DEFAULT 'open',
  priority email_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID,
  assigned_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  last_inbound_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_conv_tenant ON public.email_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_conv_thread ON public.email_conversations(tenant_id, thread_key);
CREATE INDEX IF NOT EXISTS idx_email_conv_assigned ON public.email_conversations(tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_email_conv_status ON public.email_conversations(tenant_id, status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
  direction email_direction NOT NULL,
  status email_message_status NOT NULL DEFAULT 'received',
  message_id TEXT,
  in_reply_to TEXT,
  reference_ids TEXT[],
  from_email TEXT,
  from_name TEXT,
  to_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] NOT NULL DEFAULT '{}',
  bcc_emails TEXT[] NOT NULL DEFAULT '{}',
  reply_to TEXT,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  snippet TEXT,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  resend_id TEXT,
  resend_event JSONB,
  sent_by UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_msg_conv ON public.email_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_email_msg_tenant ON public.email_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_msg_resend ON public.email_messages(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_msg_msgid ON public.email_messages(message_id);

CREATE TABLE IF NOT EXISTS public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_bucket TEXT NOT NULL DEFAULT 'email-attachments',
  storage_path TEXT NOT NULL,
  content_id TEXT,
  is_inline BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_att_msg ON public.email_attachments(message_id);

CREATE TABLE IF NOT EXISTS public.email_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  mentions UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_notes_conv ON public.email_notes(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.email_messages(id) ON DELETE SET NULL,
  actor_id UUID,
  actor_type TEXT NOT NULL DEFAULT 'user',
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_events_conv ON public.email_events(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS public.email_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.email_conversation_labels (
  conversation_id UUID NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.email_labels(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, label_id)
);

CREATE TRIGGER trg_email_accounts_updated BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_email_conv_updated BEFORE UPDATE ON public.email_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_email_msg_updated BEFORE UPDATE ON public.email_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_email_notes_updated BEFORE UPDATE ON public.email_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_conversation_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_accounts_select" ON public.email_accounts FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_accounts_insert" ON public.email_accounts FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "email_accounts_update" ON public.email_accounts FOR UPDATE
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_accounts_delete" ON public.email_accounts FOR DELETE
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "email_conv_select" ON public.email_conversations FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_conv_insert" ON public.email_conversations FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "email_conv_update" ON public.email_conversations FOR UPDATE
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_conv_delete" ON public.email_conversations FOR DELETE
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "email_msg_select" ON public.email_messages FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_msg_insert" ON public.email_messages FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY "email_msg_update" ON public.email_messages FOR UPDATE
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "email_att_select" ON public.email_attachments FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_att_insert" ON public.email_attachments FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "email_notes_select" ON public.email_notes FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_notes_insert" ON public.email_notes FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id) AND author_id = auth.uid());
CREATE POLICY "email_notes_update" ON public.email_notes FOR UPDATE
  USING (public.is_tenant_member(tenant_id) AND author_id = auth.uid());
CREATE POLICY "email_notes_delete" ON public.email_notes FOR DELETE
  USING (public.is_tenant_member(tenant_id) AND author_id = auth.uid());

CREATE POLICY "email_events_select" ON public.email_events FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_events_insert" ON public.email_events FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "email_labels_select" ON public.email_labels FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_labels_all" ON public.email_labels FOR ALL
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "email_conv_labels_select" ON public.email_conversation_labels FOR SELECT
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY "email_conv_labels_all" ON public.email_conversation_labels FOR ALL
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

ALTER TABLE public.email_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.email_messages REPLICA IDENTITY FULL;
ALTER TABLE public.email_notes REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_conversations;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_messages;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_notes;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('email-attachments', 'email-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "email_attachments_storage_select" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'email-attachments'
    AND public.is_tenant_member(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "email_attachments_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'email-attachments'
    AND public.is_tenant_member(((storage.foldername(name))[1])::uuid)
  );
