
CREATE OR REPLACE FUNCTION public.submit_contact_request(
  p_full_name text,
  p_email text,
  p_phone text,
  p_business_name text,
  p_country text,
  p_category public.contact_request_category,
  p_priority public.contact_request_priority,
  p_subject text,
  p_message text,
  p_source_page text,
  p_metadata jsonb,
  p_attachment_url text DEFAULT NULL
)
RETURNS TABLE(id uuid, ticket_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ticket text;
BEGIN
  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_full_name';
  END IF;
  IF p_email IS NULL OR p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF p_message IS NULL OR length(trim(p_message)) < 10 THEN
    RAISE EXCEPTION 'invalid_message';
  END IF;

  INSERT INTO public.contact_requests (
    user_id, full_name, email, phone, business_name, country,
    category, priority, subject, message, source_page, metadata, attachment_url
  ) VALUES (
    auth.uid(),
    left(trim(p_full_name), 80),
    left(trim(p_email), 160),
    NULLIF(left(trim(coalesce(p_phone,'')), 32), ''),
    NULLIF(left(trim(coalesce(p_business_name,'')), 120), ''),
    NULLIF(left(trim(coalesce(p_country,'')), 80), ''),
    coalesce(p_category, 'other'::public.contact_request_category),
    coalesce(p_priority, 'medium'::public.contact_request_priority),
    NULLIF(left(trim(coalesce(p_subject,'')), 200), ''),
    left(trim(p_message), 4000),
    NULLIF(left(coalesce(p_source_page,''), 200), ''),
    coalesce(p_metadata, '{}'::jsonb),
    p_attachment_url
  )
  RETURNING contact_requests.id, contact_requests.ticket_id INTO v_id, v_ticket;

  RETURN QUERY SELECT v_id, v_ticket;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_contact_request(text, text, text, text, text, public.contact_request_category, public.contact_request_priority, text, text, text, jsonb, text) TO anon, authenticated;
