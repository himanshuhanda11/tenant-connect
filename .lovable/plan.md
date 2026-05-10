# Stripe Workspace Billing — Implementation Plan

A complete BYOK Stripe subscription system for Aireatro, billed **per workspace**, with 30-day trial on paid plans, secure webhook-driven updates, and a premium UI.

## 1. Secrets to add (you'll be prompted)

Stripe credentials:
- `STRIPE_SECRET_KEY` — `sk_test_...` or `sk_live_...`
- `STRIPE_WEBHOOK_SECRET` — `whsec_...` (shown after we create the webhook endpoint)

Stripe Price IDs (6 total — create monthly + yearly products in Stripe first):
- `STRIPE_PRICE_BASIC_MONTHLY`, `STRIPE_PRICE_BASIC_YEARLY`
- `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_BUSINESS_MONTHLY`, `STRIPE_PRICE_BUSINESS_YEARLY`

You won't paste the values in chat — Lovable will request them via a secure form.

## 2. Database (per-workspace billing)

New tables (all RLS-protected, member-readonly, backend-only writes):

- **workspace_billing** (1 row per workspace)
  `workspace_id, user_id, plan_name, plan_type, billing_cycle, billing_status, trial_status, trial_start, trial_end, stripe_customer_id, stripe_subscription_id, stripe_price_id, current_period_start, current_period_end, cancel_at_period_end, last_payment_status`

- **billing_events** — raw webhook log, dedup on `stripe_event_id`

- **invoices** — mirrored Stripe invoices: `stripe_invoice_id, amount_paid, amount_due, currency, status, hosted_invoice_url, invoice_pdf, billing_reason`

- **plan_limits** — seeded with Free / Basic / Pro / Business limits (sourced from existing `workspace_entitlements` mapping)

RLS:
- Members of a workspace can `SELECT` their billing/invoices.
- No client `INSERT/UPDATE/DELETE` — all writes via edge functions (service role).
- `has_workspace_role(user, workspace, 'owner'|'admin')` helper used by checkout/portal/change-plan endpoints.

## 3. Edge functions

| Function | Purpose | JWT |
|---|---|---|
| `create-checkout-session` | Free plan → activates instantly. Paid → creates Stripe customer (if missing), Checkout Session in `subscription` mode with 30-day `trial_period_days`, metadata `{workspace_id, user_id, plan_name, billing_cycle}`. Returns `checkout_url` or `{free: true}`. | required |
| `create-customer-portal-session` | Returns Stripe billing portal URL for current workspace. | required |
| `stripe-webhook` | `verify_jwt = false`. Verifies `Stripe-Signature`, dedupes via `stripe_event_id`, processes events listed below, updates `workspace_billing` + `invoices`. | none |
| `get-workspace-billing-status` | Returns plan, status, trial days left, next invoice date, payment status, computed feature limits. | required |
| `change-workspace-plan` | Upgrades (immediate + proration) or schedules downgrade at period end. Updates Stripe subscription items. | required |

Webhook events handled: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed/finalized`, `payment_method.attached`.

Stripe stub via `npm:stripe@^17` in Deno edge runtime.

## 4. Onboarding flow changes

Step 1 = **Select Plan** (existing pricing page reused, deduped to one source of truth).
- "Start Free" → calls `create-checkout-session` with `plan_name=free` → workspace marked active → router pushes Step 2.
- "Start 30-Day Free Trial" (Basic/Pro/Business) → opens Stripe Checkout → `success_url` returns to `/onboarding/step-2?session_id=...` → frontend polls `get-workspace-billing-status` until `trialing|active`.
- Step 2 = Connect WhatsApp API (existing). Step 3 = Complete profile (existing).

## 5. Workspace Settings → Billing tab

Premium card layout showing:
- Current plan + status badge (Free / Trial Active / Active / Past Due / Canceled / Payment Failed / Upgrade Required)
- Trial countdown ("12 days left" with progress ring)
- Next billing date + amount
- Payment method status pill
- **Manage Billing** → Stripe portal
- **Upgrade / Downgrade** modal (uses `change-workspace-plan`)
- **Cancel Subscription** (cancel at period end with reactivation banner)
- Invoice history table with PDF download links
- Past-due alert banner with "Update Payment Method" CTA

## 6. Plan limit enforcement

`useWorkspaceBilling()` hook returns `{plan, status, limits, isFeatureAllowed(key), isWithinLimit(key, current)}`.

Backed by existing `workspace_entitlements` (kept as source of truth) + new `plan_limits` table for hard caps. When a user hits a cap, an `<UpgradeModal>` opens with the specific reason and plan recommendation.

Hide upgrade prompts entirely on Business tier (per existing `plan-tier-ux-constraints-v1` memory).

## 7. Security guardrails

- Workspace ownership/admin role verified server-side on every billing call.
- Frontend can only read; all status mutations go through Stripe → webhook.
- `stripe_event_id` UNIQUE constraint prevents replay.
- Service-role client only inside edge functions; anon client never touches billing tables.
- No Stripe keys in client bundle.

## 8. Files to create / edit

**New**
- migration: 4 tables + RLS + plan_limits seed
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/create-customer-portal-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts` (+ config.toml `verify_jwt = false`)
- `supabase/functions/get-workspace-billing-status/index.ts`
- `supabase/functions/change-workspace-plan/index.ts`
- `src/hooks/useWorkspaceBilling.ts`
- `src/components/billing/PlanCard.tsx`, `BillingStatusBadge.tsx`, `TrialCountdown.tsx`, `UpgradeModal.tsx`, `PaymentFailedBanner.tsx`, `InvoiceTable.tsx`
- `src/pages/billing/WorkspaceBilling.tsx` (Settings → Billing)
- `src/pages/onboarding/SelectPlan.tsx` (refactored from existing pricing)

**Edited**
- existing pricing page → wire CTAs to `create-checkout-session`
- onboarding router → enforce plan-selected gate before Step 2
- workspace settings nav → add Billing tab
- App.tsx routes for billing return URLs

## 9. Order of execution

1. Run DB migration (you approve).
2. Prompt for the 8 Stripe secrets.
3. Build edge functions + deploy.
4. Build hooks + UI components.
5. Wire onboarding + settings.
6. Smoke test with `STRIPE_SECRET_KEY=sk_test_...` using Stripe test cards.

Once you approve, I'll start with the migration.
