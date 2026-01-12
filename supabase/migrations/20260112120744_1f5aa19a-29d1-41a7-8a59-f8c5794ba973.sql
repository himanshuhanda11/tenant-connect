-- Fix linter: keep extensions out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Some extensions (e.g. pg_net) cannot be moved with ALTER EXTENSION ... SET SCHEMA.
-- Recreate them in the dedicated schema.
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DROP EXTENSION IF EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Fix linter: set immutable search_path on function
CREATE OR REPLACE FUNCTION public.update_message_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'sent' AND OLD.status = 'pending' THEN
    NEW.sent_at = now();
  ELSIF NEW.status = 'delivered' AND OLD.status IN ('pending', 'sent') THEN
    NEW.delivered_at = now();
  ELSIF NEW.status = 'read' AND OLD.status IN ('pending', 'sent', 'delivered') THEN
    NEW.read_at = now();
  ELSIF NEW.status = 'failed' THEN
    NEW.failed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;