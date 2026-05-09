## Goal
Refactor onboarding + subscriptions so plans attach to **workspaces** (not users), and enforce **one free paid trial per user** across all their workspaces. Payment gateway is not yet installed — paid plans for ineligible users open a "Contact Admin" popup.

## New Onboarding Flow
```
Signup → Login → /create-workspace → /select-workspace-plan → /dashboard
```
- Remove the immediate "choose plan after signup" step.
- After signup, route to a premium **Create Workspace** page (not the existing modal-only flow).
- After workspace creation, route to **Select Workspace Plan** (scoped to that workspace).

## Trial Eligibility Rule
- A user can claim **ONE** free 1-month paid trial across **all** their workspaces — ever.
- Tracked at user level (`profiles.has_used_trial`, `trial_workspace_id`, `trial_claimed_at`).
- Server-enforced inside `claim_launch_offer` RPC — frontend flags are advisory only.
- If already used: paid plan buttons open the **Contact Admin popup**; free plan stays selectable.

## Database Changes (migration)
1. `profiles` — add `has_used_trial boolean default false`, `trial_claimed_at timestamptz`, `trial_workspace_id uuid`.
2. `tenants` — add `business_name text`, `business_category text`, `country text`, `team_size text` (workspace creation fields). Slug + name + logo already exist.
3. Rewrite `claim_launch_offer(_plan_id, _workspace_id)`:
   - Require `_workspace_id` (caller chooses which workspace gets the trial).
   - Verify caller is owner/admin of that workspace.
   - Reject if `profiles.has_used_trial = true` → return `{ ok:false, reason:'trial_already_used' }`.
   - On success: write `subscriptions` + `workspace_entitlements` for that workspace, set `profiles.has_used_trial = true`, `trial_workspace_id`, `trial_claimed_at`. All in one transaction.
4. New RPC `is_trial_eligible()` → reads `profiles.has_used_trial` for the auth.uid().

## Frontend Changes
### New pages
- `src/pages/onboarding/CreateWorkspacePage.tsx` — premium full-page workspace creation form (name, slug auto-gen, business name, category dropdown, country, team size, logo upload). Uses existing `createTenant` RPC + new fields.
- `src/pages/onboarding/SelectWorkspacePlanPage.tsx` — premium pricing grid scoped to the workspace just created (or selected). Shows "🎁 1 Month FREE" badge for eligible users; "🔒 Contact Admin" for ineligible.

### New components
- `src/components/billing/ContactAdminDialog.tsx` — locked-paid-plan popup with email + WhatsApp + Telegram buttons.
- `src/components/billing/WorkspacePlanCard.tsx` — dashboard card showing current plan, status, trial badge, expiry countdown, Upgrade button.

### Updated files
- `src/hooks/useLaunchOffer.ts` — add `isEligible` (from `is_trial_eligible` RPC), update `claim` to take `{ planId, workspaceId }`.
- `src/components/auth/RequirePlanSelection.tsx` — redirect logic: no workspace → `/create-workspace`; workspace without plan → `/select-workspace-plan`.
- `src/pages/onboarding/SignupPage.tsx` / `ChoosePlanPage.tsx` — route signup → `/create-workspace` (not plan picker).
- `src/contexts/TenantContext.tsx` — pass new workspace fields through `createTenant`.

### Routing
Add routes in `src/App.tsx`:
- `/create-workspace` (auth required, no workspace required)
- `/select-workspace-plan` (auth + workspace required, no plan required)

## UI / Design
- Premium dark gradient hero, animated cards (`hover-scale`, `animate-fade-in`).
- Mobile-first: stacked cards, sticky bottom CTA, generous top/bottom padding.
- Reuse existing `LaunchOfferDialog` styling tokens for consistency.
- Free plan always shows green "Start Free"; paid plans show either gold "🎁 Start Free Month" or amber "🔒 Contact Admin".

## Security / Anti-Abuse
- All trial enforcement in `claim_launch_offer` (SECURITY DEFINER, server-side).
- RLS: `profiles.has_used_trial` writable only via the RPC (not direct update).
- Row-level guard on `subscriptions` insert via existing trigger.

## Out of Scope (this iteration)
- Payment gateway integration (Stripe/Razorpay) — popup is the substitute.
- Workspace switcher redesign — keep existing switcher.
- Invoice/billing history page — already exists.

## File Summary
**Migration (1):** profiles fields + tenants fields + rewritten `claim_launch_offer` + new `is_trial_eligible` RPC.
**New files (4):** CreateWorkspacePage, SelectWorkspacePlanPage, ContactAdminDialog, WorkspacePlanCard.
**Edited (~6):** useLaunchOffer, RequirePlanSelection, SignupPage, TenantContext, App.tsx routes, dashboard plan section.