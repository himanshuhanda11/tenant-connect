## Goal
Unify plan/pricing data across the public Pricing page, Onboarding Step 1 (Choose Plan), Billing section, and upgrade/change-plan modals — driven by ONE config — and make Stripe Checkout work identically from every entry point.

## Single Source of Truth

Create `src/data/plans.config.ts` exporting `PLANS` with everything UI + checkout needs:

```ts
type Region = 'IN' | 'GULF' | 'OTHER';
type Currency = 'INR' | 'AED' | 'USD';

export interface PlanConfig {
  id: 'free' | 'basic' | 'pro' | 'business';
  name: string;
  tagline: string;
  badge?: string;       // "Most Popular"
  highlight: boolean;
  cta: { free: string; paid: string };
  trialDays: number;    // 30 for paid, 0 for free
  // Region pricing — display values
  pricing: Record<Region, {
    currency: Currency;
    symbol: string;
    monthly: number;          // per month
    yearlyPerMonth: number;   // per month when paid yearly (20% off)
  }>;
  // Stripe price IDs per region/cycle
  stripePriceIds: Record<Region, { monthly: string; yearly: string }>;
  features: string[];
  limits: { team_members; phone_numbers; contacts; flows; autoforms; automations; ai_features };
}
```

Currently we only have AED Stripe Price IDs (the 6 you provided). All three regions in `stripePriceIds` will map to those AED IDs for now (matches the current "AED for everyone" decision in memory). When you create INR/USD prices in Stripe later, only this file changes.

Helpers in same file:
- `regionFromCountry(countryCode)` → `IN | GULF | OTHER`
- `getPlan(id)`, `getPriceForRegion(plan, region, cycle)`, `formatPlanPrice(plan, region, cycle)`

Delete/replace the duplicated price maps:
- `PLAN_PRICES_AED` in `SelectWorkspacePlanPage.tsx`
- INR maps in `useGeoLocation` consumers (`UpgradePlanDialog`, `PricingCards`)
- `src/data/pricingPlans.ts` (migrate consumers, then remove)

## Shared UI Component

Create `src/components/billing/PlanCardsGrid.tsx` — one premium plan-cards grid used in all 4 places. Props:

```ts
{
  region: Region;
  currentPlanId?: string;          // highlights current plan in Billing
  showFree?: boolean;              // true on onboarding/pricing, false on upgrade
  cycle: 'monthly' | 'yearly';
  onSelect: (planId, cycle) => void;
  loadingPlanId?: string;
  variant?: 'dark' | 'light';      // dark = onboarding aurora bg, light = billing/pricing
}
```

Cycle toggle (`MonthlyYearlyToggle`) extracted as well.

## Stripe Checkout — Single Path

Keep ONE shared mutation `useStartCheckout` (already in `useWorkspaceBilling.ts`) hitting the `billing-create-checkout` edge function. Verify it accepts `{ workspaceId, planId, billingCycle, region, country }` and resolves the right Stripe Price ID via `resolveStripePriceId` (already region-aware in `_shared/stripe.ts`).

Refactor:
1. `SelectWorkspacePlanPage` — already uses `useStartCheckout`. Switch its plan source + price display to `PLANS` + `regionFromCountry(tenant.country)`. Remove hardcoded `region: 'GULF'`.
2. `UpgradePlanDialog` — remove the Razorpay/Stripe radio + Razorpay path entirely (we are Stripe-only per your decision), remove `usePlatformPlans`, drive cards from `PLANS`, and call `useStartCheckout` (same hook as onboarding).
3. `ChangePlanDialog` — same swap to `PLANS` + `useStartCheckout` / `useChangePlan`.
4. Public `PricingCards` — drive from `PLANS`, with a region switcher (auto-detected, manually overridable).

## Onboarding Flow Fix

In `SelectWorkspacePlanPage`:
- **Free** → no Stripe → `claim()` → navigate to `/dashboard` (existing behavior, kept).
- **Paid** → `useStartCheckout` returns `checkout_url` → `window.location.href = checkout_url`.
- Success URL: `/onboarding/billing-return?session_id={CHECKOUT_SESSION_ID}` → existing `BillingReturnPage` polls billing status then routes to dashboard / next onboarding step.
- Cancel URL: `/onboarding/plan?payment=cancelled` → show toast "Payment setup was cancelled. Please choose a plan to continue."

Add a `?payment=cancelled` toast handler on mount.

Workspace already exists by the time the user hits Step 1 (CreateWorkspace flow ran first), so the "create in pending_payment then redirect" sub-step from your spec is unnecessary in our app. The webhook (`stripe-webhook`) already flips status to `trialing`/`active`.

## Region Detection

`tenants.country` already exists. Resolve region with `regionFromCountry(country)`. Onboarding passes that region+country into `useStartCheckout` so the edge function can pick the right Price ID via `platform_plans.stripe_prices[region][cycle]`.

(Today all 3 region columns hold the AED price IDs — see "Single Source of Truth" above. Switching to true regional pricing later is a config-only change.)

## Files Touched

New:
- `src/data/plans.config.ts`
- `src/components/billing/PlanCardsGrid.tsx`
- `src/components/billing/MonthlyYearlyToggle.tsx`

Edited:
- `src/pages/onboarding/SelectWorkspacePlanPage.tsx` — render via `PlanCardsGrid`, region-aware prices, cancel toast
- `src/components/billing/UpgradePlanDialog.tsx` — strip Razorpay, render via `PlanCardsGrid`, use `useStartCheckout`
- `src/components/billing/ChangePlanDialog.tsx` — same shared grid + `useChangePlan`
- `src/components/pricing/PricingCards.tsx` — render via `PlanCardsGrid` + region switcher
- `src/pages/onboarding/BillingReturnPage.tsx` — verify success/cancel handling matches new redirect URLs

Removed/Deprecated:
- `src/data/pricingPlans.ts` (after migration)
- Razorpay code path in `UpgradePlanDialog`

No DB or edge-function changes needed — `billing-create-checkout`, `stripe-webhook`, `get-workspace-billing-status`, `change-workspace-plan`, and `_shared/stripe.ts` already support region-aware Stripe lookup.

## Out of Scope
- Creating real INR/USD Stripe Prices (you've only provided AED IDs; everywhere will keep using those until you add more).
- Changes to webhook handling (already verified working).