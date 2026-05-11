# Stripe Subscription Lifecycle — Proper SaaS Billing

## Critical issue found first

`public.subscriptions.plan_id` is a **uuid** with FK to `public.plans` (UUIDs like `2f86…`, names "Free/Starter/Professional/Enterprise"). But every edge function (`stripe-webhook`, `change-workspace-plan`, `billing-create-checkout`, `get-workspace-billing-status`) writes/reads it as **text** `"plan_basic" / "plan_pro" / "plan_business" / "plan_free"`. The "real" plans live in `public.platform_plans` (text ids `free/basic/pro/business`).

Result: every `subscriptions` upsert from Stripe webhooks silently fails type-coercion. **This is the root cause** of "Stripe doesn't sync after plan change."

I'll fix the schema to match the code (drop the FK, switch `plan_id` to `text`, point conceptually at `platform_plans.id`).

## What I'll build

### 1. Schema migration (`subscriptions` table)
- Drop FK `subscriptions_plan_id_fkey` and convert `plan_id uuid` → `text` (preserving rows by best-effort name mapping; all current rows are 0 anyway).
- Add columns:
  - `pending_plan_id text` — plan scheduled to take effect at period end
  - `pending_billing_cycle text`
  - `scheduled_change_at timestamptz` — when the pending change applies
  - `last_plan_change_at timestamptz`
- Index on `stripe_customer_id`.

### 2. `change-workspace-plan` — full rewrite
Detect the four scenarios and behave correctly:

| From | To | Action |
|------|----|--------|
| Trial paid plan | Other paid plan | Stripe `subscriptions.update` swap price, `proration_behavior:'none'`, `trial_end:'unchanged'`. No checkout, no new card. |
| Trial paid plan | Free | `subscriptions.cancel(prorate:false)` immediately, mark workspace Free. |
| Active paid | Higher paid (upgrade) | `subscriptions.update` price, `proration_behavior:'always_invoice'`, immediate. |
| Active paid | Lower paid (downgrade) | Use **Stripe Subscription Schedule** so current item runs to `period_end` then switches to new price. Mirror in `pending_plan_id` + `scheduled_change_at`. |
| Active paid | Free | `subscriptions.update(cancel_at_period_end:true)`. Mirror as pending `free`. |
| No sub yet | Paid | Return `{action:'checkout_required'}` so frontend redirects to `billing-create-checkout`. |
| Same plan/cycle | — | Noop. |

All paths: optimistically update `subscriptions` row + call `compute_workspace_entitlements`.

### 3. `stripe-webhook` — fixes
- Fix the broken price→plan lookup: prefer `subscription.metadata.plan_id` first (it's always set on checkout/upgrade), fall back to env map. Also include region-suffixed env vars.
- On `customer.subscription.updated`: clear `pending_plan_id` if the active price now matches it.
- On `customer.subscription.deleted`: set `plan_id='free'`, clear stripe sub id, clear pending fields, recompute entitlements.
- On `invoice.payment_succeeded`: if there was a `pending_plan_id` and the invoice line price matches it, clear pending fields.

### 4. `get-workspace-billing-status` — extend response
Return `pending_plan_id`, `pending_billing_cycle`, `scheduled_change_at`, plus a derived `next_plan_message` like *"Your Business plan will downgrade to Pro on June 15"* or *"Your Pro plan will renew at ₹2,999/month on June 15"*.

### 5. Frontend (`ChangePlanDialog` + `BillingPanel`)
- When `has_subscription === true`, never redirect to Stripe Checkout for plan changes — always go through `change-workspace-plan` (it now handles every case, including trial swap and Free).
- If backend returns `action:'checkout_required'`, then (and only then) start checkout.
- Add three confirmation dialogs reusing existing `AlertDialog`:
  - **Upgrade**: "You'll be charged the prorated difference now and unlock {plan} immediately."
  - **Downgrade**: "You'll keep {currentPlan} until {periodEnd}, then move to {plan}."
  - **Switch to Free** (paid/trial): "Your subscription will be cancelled. {Trial → immediately. Paid → at period end on {date}.} You'll lose premium features."
- `BillingPanel`: surface pending change banner ("Downgrading to Pro on Jun 15 — Cancel scheduled change") with a button that calls `change-workspace-plan` with the *current* plan to undo.

### 6. Tests
Extend `src/test/billing-flow.test.tsx` with mocked scenarios for: trial→trial swap (no checkout), trial→free (cancel), paid upgrade (proration), paid downgrade (scheduled), paid→free (cancel_at_period_end), undo scheduled change.

## Out of scope
- I won't touch `billing-create-checkout` flow for first-time paid signup (already correct: collects card + 30-day trial).
- I won't migrate Razorpay code paths.
- I won't add new Stripe products/prices — assumes `STRIPE_PRICE_*` envs and/or `platform_plans.stripe_prices` are already set per region.

## Risk note
The schema migration is the only destructive piece. `subscriptions` currently has 0 rows (verified), so converting `plan_id` to `text` is safe. If any rows existed in production we'd map by joining `plans.name` → `platform_plans.id`.
