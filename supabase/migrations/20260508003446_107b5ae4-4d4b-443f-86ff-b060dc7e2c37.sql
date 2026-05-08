
ALTER TABLE public.workspace_entitlements
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS team_member_limit integer,
  ADD COLUMN IF NOT EXISTS campaign_limit integer,
  ADD COLUMN IF NOT EXISTS ai_usage_limit integer,
  ADD COLUMN IF NOT EXISTS internal_admin_note text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_entitlements_billing_cycle_chk') THEN
    ALTER TABLE public.workspace_entitlements
      ADD CONSTRAINT workspace_entitlements_billing_cycle_chk
      CHECK (billing_cycle IN ('monthly','quarterly','yearly','lifetime','trial'));
  END IF;
END $$;

CREATE OR REPLACE VIEW public.platform_account_health AS
WITH base AS (
  SELECT
    p.id AS user_id, p.email, p.full_name, p.created_at,
    u.last_sign_in_at, u.email_confirmed_at, u.banned_until,
    (SELECT COUNT(*) FROM public.tenant_members tm WHERE tm.user_id = p.id) AS workspace_count,
    (SELECT COUNT(*) FROM public.tenant_members tm
       JOIN public.phone_numbers ph ON ph.tenant_id = tm.tenant_id
      WHERE tm.user_id = p.id AND ph.status = 'connected') AS connected_phone_count,
    (SELECT COUNT(*) FROM public.tenant_members tm
       JOIN public.waba_accounts w ON w.tenant_id = tm.tenant_id
      WHERE tm.user_id = p.id AND w.status <> 'active') AS waba_issues,
    (SELECT COUNT(*) FROM public.tenant_members tm
       JOIN public.phone_numbers ph ON ph.tenant_id = tm.tenant_id
      WHERE tm.user_id = p.id AND ph.quality_rating IN ('YELLOW','RED')) AS low_quality_phones,
    (SELECT COUNT(*) FROM public.tenant_members tm
       JOIN public.workspace_entitlements e ON e.workspace_id = tm.tenant_id
      WHERE tm.user_id = p.id AND e.expires_at IS NOT NULL AND e.expires_at < now()) AS expired_plans
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
)
SELECT
  user_id, email, full_name, created_at, last_sign_in_at, email_confirmed_at, banned_until,
  workspace_count, connected_phone_count, waba_issues, low_quality_phones, expired_plans,
  GREATEST(0, LEAST(100,
    100
    - CASE WHEN email_confirmed_at IS NULL THEN 25 ELSE 0 END
    - CASE WHEN workspace_count = 0 THEN 25 ELSE 0 END
    - CASE WHEN workspace_count > 0 AND connected_phone_count = 0 THEN 20 ELSE 0 END
    - LEAST(20, waba_issues * 10)
    - LEAST(15, low_quality_phones * 5)
    - LEAST(20, expired_plans * 10)
    - CASE WHEN banned_until IS NOT NULL AND banned_until > now() THEN 30 ELSE 0 END
    - CASE WHEN last_sign_in_at IS NOT NULL AND last_sign_in_at < now() - interval '30 days' THEN 10 ELSE 0 END
  )) AS health_score
FROM base;

GRANT SELECT ON public.platform_account_health TO authenticated;
