DROP VIEW IF EXISTS public.platform_workspace_directory;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_id DROP DEFAULT,
  ALTER COLUMN plan_id DROP NOT NULL;

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_id TYPE text USING 'free';

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_id SET DEFAULT 'free';

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS pending_plan_id text,
  ADD COLUMN IF NOT EXISTS pending_billing_cycle text,
  ADD COLUMN IF NOT EXISTS scheduled_change_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_plan_change_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id);

CREATE OR REPLACE VIEW public.platform_workspace_directory AS
SELECT t.id AS workspace_id,
   t.name AS workspace_name,
   t.slug,
   t.created_at,
   t.is_suspended,
   t.suspended_reason,
   COALESCE(e.plan, 'free'::text) AS plan,
   COALESCE(e.status, 'active'::text) AS entitlement_status,
   COALESCE(e.sending_paused, false) AS sending_paused,
   (( SELECT count(*) FROM tenant_members m WHERE m.tenant_id = t.id))::integer AS members_count,
   (( SELECT count(*) FROM smeksh_phone_numbers p WHERE p.tenant_id = t.id))::integer AS phone_numbers_count,
   (( SELECT count(*) FROM contacts c WHERE c.tenant_id = t.id))::integer AS contacts_count,
   (( SELECT count(*) FROM conversations cv WHERE cv.tenant_id = t.id))::integer AS conversations_count,
   s.status AS subscription_status,
   pl.name AS plan_name
  FROM tenants t
    LEFT JOIN workspace_entitlements e ON e.workspace_id = t.id
    LEFT JOIN subscriptions s ON s.tenant_id = t.id
    LEFT JOIN platform_plans pl ON pl.id = s.plan_id;