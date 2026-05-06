
-- Instagram contacts
CREATE TABLE public.instagram_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  instagram_account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  ig_user_id TEXT NOT NULL,
  username TEXT,
  name TEXT,
  profile_pic_url TEXT,
  follower_count INTEGER,
  is_verified BOOLEAN DEFAULT false,
  lead_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instagram_account_id, ig_user_id)
);
CREATE INDEX idx_ig_contacts_tenant ON public.instagram_contacts(tenant_id);

-- Conversations
CREATE TABLE public.instagram_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  instagram_account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.instagram_contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','closed','spam')),
  assigned_agent_id UUID,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_inbound_at TIMESTAMPTZ,
  last_outbound_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instagram_account_id, contact_id)
);
CREATE INDEX idx_ig_conv_tenant_status ON public.instagram_conversations(tenant_id, status, last_message_at DESC);
CREATE INDEX idx_ig_conv_assigned ON public.instagram_conversations(assigned_agent_id);

-- Messages
CREATE TABLE public.instagram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.instagram_conversations(id) ON DELETE CASCADE,
  mid TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type TEXT NOT NULL DEFAULT 'text',
  text TEXT,
  media_url TEXT,
  media_type TEXT,
  reaction TEXT,
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  agent_id UUID,
  raw JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, mid)
);
CREATE INDEX idx_ig_msg_conv ON public.instagram_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_ig_msg_tenant ON public.instagram_messages(tenant_id);

-- Assignments history (audit trail)
CREATE TABLE public.instagram_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.instagram_conversations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  assigned_by UUID,
  method TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ig_assign_conv ON public.instagram_assignments(conversation_id);

-- Enable RLS
ALTER TABLE public.instagram_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_assignments ENABLE ROW LEVEL SECURITY;

-- Helper: is tenant member (use existing function if present)
-- We assume public.is_tenant_member(uuid) exists; fallback to direct check.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname='is_tenant_member') THEN
    CREATE FUNCTION public.is_tenant_member(_tenant_id uuid)
    RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $f$
      SELECT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id=_tenant_id AND user_id=auth.uid());
    $f$;
  END IF;
END $$;

-- Policies (tenant members can read/write)
CREATE POLICY "ig_contacts_member_all" ON public.instagram_contacts
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "ig_conversations_member_all" ON public.instagram_conversations
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "ig_messages_member_all" ON public.instagram_messages
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "ig_assignments_member_all" ON public.instagram_assignments
  FOR ALL USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));

-- updated_at triggers
CREATE TRIGGER trg_ig_contacts_updated BEFORE UPDATE ON public.instagram_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ig_conv_updated BEFORE UPDATE ON public.instagram_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_messages;
ALTER TABLE public.instagram_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.instagram_messages REPLICA IDENTITY FULL;
