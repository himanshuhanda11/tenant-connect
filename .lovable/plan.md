# 24-Hour Launch Offer + Mandatory Plan Selection

A two-part feature: (1) a server-anchored 24-hour "1 month free" offer with sticky banner, popup, and floating widget, and (2) a mandatory "Choose Plan" step inserted into onboarding before workspace access.

---

## Part 1 — 24h Limited Offer System

### Database (migration)
New table `public.user_offers` (one row per user, created automatically on signup):
- `user_id` (uuid, PK, FK auth.users)
- `offer_started_at` (timestamptz, default now())
- `offer_expires_at` (timestamptz, default now() + 24h) — **server-computed, immutable**
- `offer_claimed` (boolean, default false)
- `claimed_plan_id` (text, nullable — references `platform_plans.id`)
- `claimed_at` (timestamptz, nullable)
- `subscription_id` (uuid, nullable)

**Triggers / functions:**
- Trigger `on_auth_user_created_offer` → inserts a row when a new auth user is created (via `handle_new_user_offer()` SECURITY DEFINER). Idempotent (`ON CONFLICT DO NOTHING`).
- Trigger `guard_user_offer_mutations()` BEFORE UPDATE → blocks any change to `offer_started_at` / `offer_expires_at`; only `offer_claimed`, `claimed_plan_id`, `claimed_at`, `subscription_id` may be updated, and only via SECURITY DEFINER claim function (raises if `current_setting('app.allow_offer_claim','t') <> 'on'`).
- Function `claim_launch_offer(plan_id text)` SECURITY DEFINER:
  - Verifies caller is the owner.
  - Verifies `offer_claimed = false`, `now() < offer_expires_at`, and user has no active paid subscription in `subscriptions`.
  - Inserts a 30-day trial entry into `subscriptions` (status `trialing`, plan = `plan_id`, trial_ends_at = now+30d).
  - Updates `user_offers` row (sets `offer_claimed`, `claimed_plan_id`, `claimed_at`, `subscription_id`).
  - Returns `{ ok, subscription_id, trial_ends_at }`.
- RLS:
  - SELECT: `auth.uid() = user_id`
  - INSERT/UPDATE/DELETE: blocked for end users (only the trigger and SECURITY DEFINER claim function may write).

### Edge function
`claim-launch-offer` — wraps `claim_launch_offer()` RPC, returns the new subscription. Validates JWT in code. No client-trusted timer values are accepted.

### Frontend hook `useLaunchOffer()`
- Reads `user_offers` row for current user.
- Computes `secondsLeft = max(0, offer_expires_at - now())` from the **server timestamp only**.
- `isActive = !offer_claimed && secondsLeft > 0 && !hasActivePaidSubscription`.
- Real-time `setInterval(1000)` for ticking the local display.
- Exposes `claim(planId)` which calls the edge function then invalidates `useSubscription` / `useEntitlements`.

### Components
- `src/components/offer/LaunchOfferProvider.tsx` — context that exposes offer state + dialog/widget triggers, mounts banner + popup + widget once.
- `src/components/offer/StickyOfferBanner.tsx` — fixed top bar, glassmorphism, animated gradient border, neon green accents, pulses red when `secondsLeft < 3h`. Hidden when not active. Buttons: **Claim Offer**, **View Plans**.
- `src/components/offer/LaunchOfferDialog.tsx` — premium modal (radix Dialog + framer-motion), backdrop blur, 3D glow, animated countdown, benefits list, **Start Free Month** + **Compare Plans** buttons. Cooldown (30 min) tracked in `sessionStorage` for re-popup, but never gates the actual offer (which lives server-side).
- `src/components/offer/FloatingOfferWidget.tsx` — bottom-right pulsing gift icon when banner/dialog dismissed, opens dialog on click.
- Mount `LaunchOfferProvider` inside `DashboardLayout` and on `/signup`, `/onboarding/*`, `/choose-plan`.

### Security guarantees
- Timer derived from `offer_expires_at` — **server-set, immutable** (trigger blocks changes).
- Claim only via SECURITY DEFINER function with full validation (ownership, not claimed, not expired, no existing paid sub).
- RLS prevents direct insert/update from clients; localStorage cannot affect anything visible to other users or to the server.
- Replays: `offer_claimed = true` permanently disables claim (UNIQUE on user_id).

---

## Part 2 — Mandatory "Choose Plan" Onboarding Step

### Routing flow
After signup → profile completion, route to **`/choose-plan`** before the workspace.

- Add route `/choose-plan` → new page `src/pages/onboarding/ChoosePlanPage.tsx`.
- Add a tiny `RequirePlanSelection` guard in `App.tsx` (or `DashboardLayout`): if user has `user_offers.offer_claimed = false` AND no active subscription AND offer still active → redirect dashboard hits to `/choose-plan`. If user already has a subscription (free or paid), allow through.
- Free users who skip explicitly can click "Continue with Free" — that calls `claim_launch_offer('free')` to mark the choice and unblock the dashboard.

### Page design (`ChoosePlanPage.tsx`)
- Full-screen premium layout, animated aurora background (reuse PricingHero gradients).
- Headline "🚀 Start Growing with Aireatro", live countdown component.
- 4 plan cards (reuse `pricingPlans` data) with **"FREE First Month"** badge on paid plans.
- Monthly/Yearly toggle.
- CTA per card: **Start Free Month** (paid plans) → calls `claim(plan.id)` → success animation (framer-motion + confetti via `canvas-confetti`) → navigate to `/dashboard`.
- Free plan CTA: **Continue with Free**.
- Social proof line "X users claimed today" — pulled from a lightweight `count(*) where claimed_at::date = today` via a SECURITY DEFINER `get_offer_claim_count_today()` function (no PII).
- Mobile: cards stack, sticky CTA at bottom.

### Success state
After claim succeeds:
- Show 1.5s success overlay "🎉 Your Free Month Has Started".
- Navigate to `/dashboard`. The banner/widget/popup self-hide because `offer_claimed = true`.

---

## Files

**New:**
- `supabase/migrations/<ts>_launch_offer_system.sql`
- `supabase/functions/claim-launch-offer/index.ts`
- `src/hooks/useLaunchOffer.ts`
- `src/components/offer/LaunchOfferProvider.tsx`
- `src/components/offer/StickyOfferBanner.tsx`
- `src/components/offer/LaunchOfferDialog.tsx`
- `src/components/offer/FloatingOfferWidget.tsx`
- `src/components/offer/CountdownPill.tsx` (shared)
- `src/pages/onboarding/ChoosePlanPage.tsx`
- `src/components/auth/RequirePlanSelection.tsx`

**Edited:**
- `src/App.tsx` — register `/choose-plan` route + `RequirePlanSelection` wrapper.
- `src/components/layout/DashboardLayout.tsx` — mount `LaunchOfferProvider`.
- `src/pages/onboarding/SignupPage.tsx` / profile page — redirect to `/choose-plan` after profile complete.
- `package.json` — add `canvas-confetti`.

## Out of scope (deferred unless asked)
- Super-admin UI to toggle offer / edit text / view analytics dashboard. (Add a feature flag `launch_offer_enabled` in `platform_settings` so it's togglable later.)
- Per-event analytics events table (popup impressions/closes/etc.). The data model supports it but the UI is a future pass.

Confirm to proceed.
