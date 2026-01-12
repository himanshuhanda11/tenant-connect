-- Create storage bucket for WhatsApp media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wa-media', 
  'wa-media', 
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/3gpp', 'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for wa-media bucket
-- Tenant members can upload to their tenant folder
CREATE POLICY "Tenant members can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wa-media' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.tenant_id::text = (storage.foldername(name))[1]
  )
);

-- Tenant members can view their tenant's media
CREATE POLICY "Tenant members can view media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wa-media' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.tenant_id::text = (storage.foldername(name))[1]
  )
);

-- Tenant members can delete their tenant's media
CREATE POLICY "Tenant members can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wa-media' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.tenant_id::text = (storage.foldername(name))[1]
  )
);

-- Create rate limiting table for anti-spam
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'send_message',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient rate limit queries
CREATE INDEX idx_rate_limit_tenant_time ON public.rate_limit_logs(tenant_id, created_at DESC);

-- Auto-cleanup old rate limit logs (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limit_logs WHERE created_at < now() - interval '1 hour';
END;
$$;

-- Enable RLS on rate_limit_logs (server-only access)
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limit logs
CREATE POLICY "Service role manages rate limits"
ON public.rate_limit_logs FOR ALL
USING (false)
WITH CHECK (false);