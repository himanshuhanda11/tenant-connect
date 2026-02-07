
-- Create invoices storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Only workspace members can download their invoices
CREATE POLICY "Workspace members can download invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices'
  AND public.is_tenant_member((storage.foldername(name))[1]::uuid)
);

-- Service role can upload invoices (edge function uses service role)
CREATE POLICY "Service role can upload invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "Service role can update invoices"
ON storage.objects FOR UPDATE
USING (bucket_id = 'invoices');
