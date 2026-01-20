-- Remove overly permissive INSERT policies; backend services using service role bypass RLS anyway.
DROP POLICY IF EXISTS "System can insert quality history" ON public.smeksh_quality_history;
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.smeksh_webhook_delivery_logs;
