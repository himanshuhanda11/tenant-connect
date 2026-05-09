## Goal

Transform `/dashboard` first-time experience into a guided 3-step premium onboarding (Select Plan → Connect WhatsApp → Complete Profile), hide all secondary widgets/CTAs until onboarding is done, and default the app to light theme.

## Onboarding state model (per workspace)

Add 3 derived booleans to a new `useOnboardingProgress(tenantId)` hook:

- `planSelected` — `tenants.plan_id` exists AND a row exists in `workspace_entitlements` for the tenant (already source of truth per project memory). Free plan counts as selected.
- `whatsappConnected` — at least one row in `phone_numbers` for tenant with `status = 'connected'`/active.
- `profileCompleted` — WhatsApp Business profile has `profile_picture_url`, `description`, `websites`, `email`, `address` populated (read via existing profile read function or cached column).

Persist a small per-tenant flag `onboarding_dismissed_at` in `tenants` (or localStorage keyed by tenant id) so the modal does not auto-reopen if the user explicitly closes it after step 1 — but the step bar stays visible until all 3 are done.

## UI components (new)

```
src/components/onboarding/
  OnboardingStepBar.tsx       // sticky top stepper (1-2-3) with gradient progress
  OnboardingGate.tsx          // wraps dashboard; decides what to render
  PlanSelectionModal.tsx      // step 1, blurred backdrop, premium pricing cards
  ConnectWhatsAppCard.tsx     // step 2, compact reminder card / modal
  CompleteProfileCard.tsx     // step 3, compact reminder card
  useOnboardingProgress.ts    // hook
```

### Step bar
Compact horizontal stepper, gradient connector line, states: ✅ done / ⏳ active / 🔒 locked. Mobile: stack as 3 chips with current step highlighted.

### Plan selection modal (Step 1)
- Auto-opens on dashboard mount when `!planSelected`.
- Backdrop: `backdrop-blur-md` over dashboard.
- Two premium cards: **Free Lifetime** and **Paid (most popular)** with monthly/yearly toggle reused from existing pricing page.
- Buttons: "Free Lifetime" / "Start 1 Month Free".
- Cannot be dismissed (no close X). User must pick.

### Step 2 / Step 3 cards
Compact gradient cards on dashboard top after step 1 done. Single primary CTA each. No giant alert banners.

## Dashboard cleanup (`src/pages/Dashboard.tsx`)

Wrap dashboard body in `<OnboardingGate>`:

1. **Before plan selected** → Render only: workspace header (logo + name) + blurred ghost of dashboard + `PlanSelectionModal`. Hide: plan badge, change-plan, upgrade/downgrade, billing status banner, connect-WhatsApp banner, all KPI/widget sections.
2. **Plan selected, WhatsApp not connected** → Render: step bar + current plan card (compact, no upgrade buttons yet) + `ConnectWhatsAppCard` + nothing else.
3. **WhatsApp connected, profile incomplete** → Render: step bar + plan card + `CompleteProfileCard` + nothing else.
4. **All done** → Render full dashboard. Step bar disappears.

### Plan card visibility rules (after onboarding)

Show upgrade/downgrade conditionally based on plan tier (existing `plan-tier-mapping` memory):

- Free → only **Upgrade**
- Basic / Pro → **Change Plan**, **Upgrade**, **Downgrade**
- Business (top tier) → **Change Plan**, **Downgrade** only (respects existing top-tier UX rule)

## Light theme default

Update theme bootstrap (likely `src/components/ThemeProvider` or similar) so:
- Default theme = `light` (not `system`).
- Only honor stored user preference from settings; never read `prefers-color-scheme` on first load.

## Mobile

- Plan modal becomes full-screen sheet on `<sm`.
- Step bar becomes compact 3-dot progress with current label.
- Step 2/3 cards stack full-width with sticky CTA.

## Files touched

- New: 6 files in `src/components/onboarding/`
- Edit: `src/pages/Dashboard.tsx` (wrap with gate, remove always-on banners)
- Edit: theme provider for light-default
- Possibly small migration: add `tenants.onboarding_dismissed_at timestamptz` (optional — can use localStorage instead to avoid a migration)

## Out of scope (this pass)

- Actual payment flow for paid plan (uses existing pricing/checkout).
- Redesign of the full unlocked dashboard (only cleanup of pre-onboarding clutter).
- Backend changes to entitlements (already in place).

## Open questions

1. **Plan modal dismissibility**: spec says user "MUST select" before continuing — confirm modal has no close button (recommended) vs. allowing "Decide later" that keeps dashboard fully locked.
2. **Top-tier plan**: confirm the highest plan is named "Business" (per memory) so the Upgrade-hiding rule keys off the right name.
3. **Profile completeness**: which fields are mandatory to count Step 3 as done? Current proposal: photo + description + email + website + address + working hours (all 6).
4. **Onboarding state storage**: localStorage per-tenant (zero migration) vs. a real `tenants.onboarding_dismissed_at` column (survives device changes). Recommend localStorage for speed; switch later if needed.
