## Aireatro Plan & Access Control Hardening

A full server-side enforcement layer for plan/feature access. Frontend stays as UX only — backend is the source of truth.

### 1. Audit findings (to confirm before coding)

I'll start by auditing:
- `workspace_entitlements`, `tenants`, `platform_plans`, `subscriptions` tables + RLS
- All RLS policies on sensitive tables (profiles, tenants, tenant_members, conversations, contacts, campaigns, automations, messages, templates, whatsapp_phone_numbers, integrations, message_credits, user_roles)
- Edge functions that mutate plan/subscription state (look for any that trust client `plan` input)
- Webhook handlers (Razorpay/Stripe/Paddle) — signature verification + idempotency
- Frontend-only gates (`useGeoLocation`, `pricingPlans.ts` restrictions, plan-tier-mapping) — confirm none control real access

Deliverable: short audit report posted in chat with concrete findings before mutation.

### 2. Single backend authority: `check_plan_access`

New SECURITY DEFINER SQL function:

```text
check_plan_access(p_user_id uuid, p_tenant_id uuid, p_feature_key text, p_requested_amount int default 1)
returns jsonb { allowed, reason, plan, limit, used, upgrade_to }
```

Validates in order:
1. user is `tenant_members` of tenant
2. user role allows the feature (via existing `has_permission`)
3. tenant subscription is `active` or `trialing` and not past `current_period_end`
4. feature_key exists in `workspace_entitlements` for current plan
5. usage counter + requested_amount ≤ plan limit
6. logs failed checks to `access_denied_log`

Companion: `enforce_plan_access(...)` that RAISES on deny — used inside other SECURITY DEFINER RPCs.

### 3. Lock down mutation paths

- Add BEFORE UPDATE trigger on `tenants` and `subscriptions` blocking changes to `plan_id`, `status`, `current_period_end` unless `auth.uid()` is super_admin OR session has `request.jwt.claim.role = 'service_role'` (webhook).
- Revoke direct UPDATE on `workspace_entitlements` from authenticated; only updated via webhook RPC.
- Add `enforce_plan_access` calls inside server-side RPCs:
  - `send_campaign`, `connect_whatsapp_number`, `invite_member`, `create_automation`, `ai_reply_request`, `import_contacts`, `create_template`, `create_integration`
- Anti-abuse: tighten existing `check_workspace_creation_allowed` (already 2-per-owner) — keep as-is, add daily IP/email cap via `platform_risk_events`.

### 4. RLS sweep

For each sensitive table, ensure 4 policies (SELECT/INSERT/UPDATE/DELETE) all gated by `is_tenant_member(auth.uid(), tenant_id)`. Tables to verify and fix where missing:

```text
profiles, tenants, tenant_members, contacts, conversations,
messages, campaigns, campaign_jobs, automations,
automation_workflows, templates, whatsapp_phone_numbers,
integrations, message_credits, credit_transactions,
crm_deals/qualified_leads, usage_counters, subscriptions,
workspace_entitlements, platform_plans (read-only public)
```

Block client UPDATE on `subscriptions`, `workspace_entitlements`, `platform_plans`, `usage_counters`, `message_credits` (mutations only via SECURITY DEFINER RPCs).

### 5. Payment webhook hardening

- Verify HMAC signature on every webhook (Razorpay/Stripe/Paddle)
- Idempotency table `payment_webhook_events(provider, event_id PK, processed_at)` — reject duplicates
- Only webhook function (with service_role) updates `subscriptions` + `workspace_entitlements`
- On `payment_failed` / `subscription_cancelled` / `past_due`: set status, schedule grace period (3 days), then auto-downgrade `workspace_entitlements` to free tier
- Cron-like job (existing scheduled jobs) checks `current_period_end < now()` daily and downgrades

### 6. Audit logging

Use existing `audit_logs` + add `access_denied_log(tenant_id, user_id, feature_key, reason, ip, ua, created_at)`. Log:
- All plan/subscription changes (who/what/when)
- Every `check_plan_access` denial
- Admin overrides
- Webhook events processed
- Suspicious: rapid workspace creation, repeated denials, role escalation attempts

### 7. Frontend updates (UX only)

- Replace any client-only gating with calls to a new `usePlanAccess(featureKey)` hook that calls `check_plan_access` RPC
- Show premium "Upgrade to {plan}" dialog with reason returned from backend
- Hide locked CTAs, but always also call backend (defense in depth)
- Pricing page / billing already geo-aware — no changes

### 8. Test suite

Create `supabase/tests/plan_access.test.sql` (pgTAP-style or simple `do $$ begin assert ... end $$`):

```text
- free user → blocked from pro feature
- basic → blocked from business feature
- expired plan → blocked even if entitlement row exists
- direct UPDATE on subscriptions by authenticated → denied
- cross-tenant SELECT → denied by RLS
- webhook replay (same event_id) → no-op
- usage at limit → blocked; at limit-1 → allowed
- super_admin override → allowed + audit logged
- cancelled then grace period → allowed; after grace → blocked
```

Plus a frontend `vitest` file mocking the RPC to assert UI shows correct upgrade messaging.

### Technical notes

- All new SQL functions: `LANGUAGE plpgsql SECURITY DEFINER SET search_path = public`
- New tables: `payment_webhook_events`, `access_denied_log`, `feature_catalog(feature_key, min_plan, limit_field)`
- `feature_catalog` is the single source of truth mapping feature_key → required plan + which usage_counters column to check
- Migrations grouped: (a) catalog + log tables, (b) check/enforce functions, (c) triggers + revokes, (d) RLS policy patches, (e) webhook idempotency

### Rollout order

1. Audit (read-only) → post findings
2. Migration A: catalog/log tables + `check_plan_access` (non-breaking, additive)
3. Migration B: webhook idempotency + signature verification in edge functions
4. Migration C: RLS tightening + UPDATE revokes + triggers
5. Migration D: wire `enforce_plan_access` into existing RPCs
6. Frontend: `usePlanAccess` hook + upgrade dialogs
7. Tests + manual verification

Each migration shipped separately so we can verify nothing breaks existing flows.
