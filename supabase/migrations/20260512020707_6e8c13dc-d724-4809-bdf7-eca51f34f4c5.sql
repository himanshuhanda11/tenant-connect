-- Enums
CREATE TYPE public.contact_request_category AS ENUM (
  'live_chat','demo','technical','billing','whatsapp_api','meta_charges','payment_plans','account','feature_request','other'
);
CREATE TYPE public.contact_request_status AS ENUM (
  'new','open','in_progress','replied','closed','cancelled'
);
CREATE TYPE public.contact_request_priority AS ENUM (
  'low','medium','high','urgent'
);

-- Ticket id generator
CREATE OR REPLACE FUNCTION public.generate_contact_ticket_id()
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path = public AS $$
DECLARE
  v_id text;
  v_exists boolean;
  v_attempts int := 0;
BEGIN
  LOOP
    v_id := 'AIR-' || to_char(now(), 'YY') || '-' || upper(substring(replace(gen_random_uuid()::text,'-',''),1,6));
    SELECT EXISTS(SELECT 1 FROM public.contact_requests WHERE ticket_id = v_id) INTO v_exists;
    EXIT WHEN NOT v_exists OR v_attempts > 8;
    v_attempts := v_attempts + 1;
  END LOOP;
  RETURN v_id;
END;
$$;

-- Main table
CREATE TABLE public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text UNIQUE NOT NULL DEFAULT public.generate_contact_ticket_id(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  country text,
  category public.contact_request_category NOT NULL DEFAULT 'other',
  priority public.contact_request_priority NOT NULL DEFAULT 'medium',
  subject text,
  message text NOT NULL,
  status public.contact_request_status NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source_page text,
  attachment_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  CONSTRAINT contact_requests_email_chk CHECK (char_length(email) <= 320),
  CONSTRAINT contact_requests_message_chk CHECK (char_length(message) BETWEEN 1 AND 10000)
);

CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX idx_contact_requests_category ON public.contact_requests(category);
CREATE INDEX idx_contact_requests_priority ON public.contact_requests(priority);
CREATE INDEX idx_contact_requests_email ON public.contact_requests(lower(email));
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX idx_contact_requests_user_id ON public.contact_requests(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.contact_requests_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'closed' AND OLD.status IS DISTINCT FROM 'closed' THEN
    NEW.closed_at := COALESCE(NEW.closed_at, now());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW EXECUTE FUNCTION public.contact_requests_set_updated_at();

-- Replies table
CREATE TABLE public.contact_request_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_internal boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_request_replies_request ON public.contact_request_replies(request_id, created_at DESC);

-- RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_request_replies ENABLE ROW LEVEL SECURITY;

-- INSERT: public (anon + authenticated) can submit
CREATE POLICY "Anyone can submit a contact request"
ON public.contact_requests FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- SELECT: owner sees own; platform admins see all
CREATE POLICY "Owner can read own contact requests"
ON public.contact_requests FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can read all contact requests"
ON public.contact_requests FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update contact requests"
ON public.contact_requests FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete contact requests"
ON public.contact_requests FOR DELETE TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- Replies: only platform admins manage; owner can read non-internal
CREATE POLICY "Owner can read public replies"
ON public.contact_request_replies FOR SELECT TO authenticated
USING (
  is_internal = false AND EXISTS (
    SELECT 1 FROM public.contact_requests cr
    WHERE cr.id = request_id AND cr.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins manage replies"
ON public.contact_request_replies FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Storage bucket for attachments (public for simple read access via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-attachments', 'contact-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload contact attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'contact-attachments');

CREATE POLICY "Anyone can read contact attachments"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'contact-attachments');

CREATE POLICY "Platform admins can delete contact attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contact-attachments' AND public.is_platform_admin(auth.uid()));