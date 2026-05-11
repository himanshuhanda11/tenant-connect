## Goal

Make every plan-selection surface in the app behave the same:

- **Free** → instant, no card, no Stripe call.
- **Basic / Pro / Business** → Stripe Checkout opens, card is captured, 30-day trial starts, Stripe auto-charges after day 30, webhook keeps `subscriptions` + `workspace_entitlements` in sync.

## Root cause of "trial started without card"

The DB function `claim_launch_offer(_plan_id, _workspace_id)` calls `apply_launch_offer_to_tenant`, which **inserts a `trialing` subscription and `active` entitlement for paid plans without ever touching Stripe**. That's why Pro/Business trials activated with no card. The Stripe checkout edge function is already correct (`payment_method_collection: always`, `trial_period_days: 30`, `missing_payment_method: cancel`). The launch-offer RPC is the bypass.

## Backend changes (one migration)

1. **`apply_launch_offer_to_tenant`** — only apply the FREE plan. For paid plans return `{ok:false, reason:'requires_checkout'}` without writing anything.
2. **`claim_launch_offer(_plan_id)` (1-arg)** and **`claim_launch_offer(_plan_id, _workspace_id)` (2-arg)** — for paid plans, do **not** mark `has_used_trial`, do **not** call apply, and return `{ok:false, reason:'requires_checkout', plan_id, workspace_id}`. Free plans keep current behavior.

This way the trial flag is only consumed once Stripe confirms the subscription via webhook (separate already-tracked logic).

## Edge function audit

- `billing-create-checkout` — already correct (free → instant via `billing-apply-plan`; paid → Stripe Checkout with trial + card). No change.
- `stripe-webhook` — verify it handles `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, mapping to `trialing` / `active` / `past_due` / `canceled` on `subscriptions` and `workspace_entitlements`. Add any missing event handlers.

## Frontend changes

1. **`useLaunchOffer.claim`** — when RPC returns `reason:'requires_checkout'`, throw a typed error so callers route to Stripe checkout instead of showing success.
2. **`SelectWorkspacePlanPage` & `ChangePlanDialog`** — remove the "claim then apply" branch for paid plans entirely; paid always goes via `startCheckout` → `window.location = checkout_url`. Free still uses claim/apply-plan path.
3. **`LaunchOfferDialog`** — rename CTA from "Claim Free Access" to **"Start 30-Day Free Trial"**, add subtext: *"Card required for paid plans · Free plan needs no card"*. Add a small secondary "Start Free Plan" link that routes free.
4. **`PlanCardsGrid` / `PricingCards` / pricing page / billing dialogs** — unify CTA labels and trust microcopy:
   - Free card: button **"Start Free"**, badge **"No card required"**.
   - Paid cards: button **"Start 30-Day Free Trial"**, badge **"Card required · Cancel anytime"**.
5. **Billing dashboard (`Billing.tsx`)** — surface trial days left, next billing date, saved card brand/last4, and "Update payment method" link (Stripe customer portal already available via existing `subscription-update` function — wire the button if not already).

## What this does NOT change

- Region/currency selection (already correct).
- Stripe price ID resolution (already correct).
- The free-plan instant activation path.
- Existing webhook security & idempotency.

## Files to touch

- New migration replacing the two `claim_launch_offer` overloads + `apply_launch_offer_to_tenant`.
- `src/hooks/useLaunchOffer.ts`
- `src/components/billing/ChangePlanDialog.tsx`
- `src/pages/onboarding/SelectWorkspacePlanPage.tsx`
- `src/components/offer/LaunchOfferDialog.tsx`
- `src/components/billing/PlanCardsGrid.tsx`
- `src/components/pricing/PricingCards.tsx`
- `src/pages/Billing.tsx` (display-only additions)
- `supabase/functions/stripe-webhook/index.ts` (only if missing event handlers)

## Verification

- Free plan from onboarding/pricing/billing → no Stripe redirect, workspace usable instantly.
- Paid plan from any surface → Stripe Checkout opens, card required, returns to `/billing?status=success`, webhook flips status to `trialing` with `trial_ends_at = now()+30d`.
- Calling old `claim_launch_offer('pro', <ws>)` directly → returns `requires_checkout`, no DB writes.
- Stripe test card `4000000000000341` (charge fails) at trial end → webhook flips to `past_due`.
