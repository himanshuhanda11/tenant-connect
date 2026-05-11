# Plan: End-to-End Plan Enforcement

The platform already has the building blocks — `workspace_entitlements` table, `check_plan_access` RPC, `requirePlanAccess` edge helper, `usePlanAccess` / `usePlanGate` hooks, and `<PlanGate>` / `<UpgradePrompt>` components. The gap is that they aren't wired consistently and the `check_plan_access` RPC doesn't yet cover every feature key. This plan closes the gap rather than rebuilding from scratch.

## Current state for `paradise-migration-services`
- Plan: `free`, status `active`
- AI / Ads / Integrations / Autoforms: all disabled
- Limits: 100 conv/mo, 0 broadcasts, 5 templates, 0 flows, `team_member_limit` NULL (treated as unlimited — bug)

## 1. Database — single source of truth

Migration that:

1. **Backfill plan defaults** on every `workspace_entitlements` row based on `plan` (Free/Basic/Pro/Business) using a new `public.plan_defaults(plan)` SQL function. NULL limits get the plan's defaults; never NULL again.
2. **Extend `check_plan_access`** so every feature key the app uses is covered:
   - `team_member` (count vs `team_member_limit`)
   - `automation`, `flow`, `autoform`, `widget`, `integration`, `campaign`, `meta_ads`, `ai_*`
   - For each: returns `{allowed, reason, current_usage, plan_limit, current_plan, upgrade_to}`
3. **Add `enforce_plan_access(workspace_id, feature_key)`** SECURITY DEFINER trigger helper that raises on violation.
4. **Attach BEFORE INSERT triggers** that call `enforce_plan_access` on:
   `tenant_members`, `agents`, `automation_workflows`, `flows`, `forms` (autoforms), `widgets`, `integrations`, `campaigns`, `meta_ad_accounts`. This is the hard backstop — even raw SQL/API bypass is blocked.
5. **Tighten RLS** for INSERT on the same tables to additionally require `check_plan_access(...).allowed = true`.

## 2. Edge functions — server gate

Add `requirePlanAccess(tenantId, featureKey)` (already exists in `_shared/planAccess.ts`) at the top of these functions and return `402 plan_access_denied`:

- `create-team-member` (already has `invite_member` — switch to `team_member`)
- automation/flow create endpoints
- meta-ads connect/create
- widget create
- integrations connect (already partially present; standardize)
- broadcast/campaign send

## 3. Frontend hook — one entry point

Replace ad-hoc checks with one hook `useFeatureGate(featureKey)` returning `{allowed, loading, currentPlan, requiredPlan, currentUsage, planLimit, openUpgrade()}`. Internally calls `check_plan_access` RPC (server-authoritative) and pulls plan label.

Refactor `usePlanGate` and `usePlanAccess` callers to delegate to it.

## 4. Upgrade modal

New `<UpgradeModal>` (controlled via `UpgradeModalProvider` context) — premium UI with current vs required plan, feature list, comparison link, "Upgrade" CTA → `/pricing`. Triggered by `openUpgrade(featureKey)`.

Replace inline `<UpgradePrompt>` redirects with the modal where action-blocking is needed (button clicks).

## 5. Wire feature gates at click sites

Wrap or intercept the primary CTAs:
- Team → "Invite member" button & `InviteMemberModal`
- Automation → "Create workflow"
- Flows → "New flow"
- Auto-forms → "New form"
- Widgets → "Create widget"
- Integrations → connect buttons
- Meta Ads → connect / create campaign
- Campaigns → new campaign / send broadcast

Each calls `featureGate.check()` first; if denied, opens `<UpgradeModal>` and aborts.

For passive UX, keep `<PlanGate>` / Pro badges on cards (already exist) so users see the lock state.

## 6. Plan limits config

Centralize plan defaults in `src/data/plans.config.ts` (single source for UI labels) and mirror them in the SQL `plan_defaults` function so DB and UI agree:

| Plan | Members | Automations | Flows | Widgets | Integrations | Campaigns | Meta Ads | AI |
|---|---|---|---|---|---|---|---|---|
| Free | 1 | 1 | 0 | 1 | 0 | 1 | ✗ | ✗ |
| Basic | 5 | 5 | 3 | 3 | 2 | 5 | ✗ | basic |
| Pro | 10 | 25 | 15 | 10 | 10 | 25 | ✓ | full |
| Business | 25 | unlimited | unlimited | unlimited | unlimited | unlimited | ✓ | enterprise |

(Numbers are the proposed defaults; user can adjust before approval.)

## 7. Verification for `paradise-migration-services`

After deploy:
1. Confirm entitlement row has filled limits.
2. Hit `/team` → Invite → expect upgrade modal.
3. Hit `/automation` → New → expect upgrade modal once over limit.
4. Hit `/meta-ads` → Connect → expect modal (Pro required).
5. Call `create-team-member` edge function directly → expect `402`.
6. Try `INSERT INTO automation_workflows` via RPC → expect trigger rejection.

## Files to touch (high level)

- New migration (limits backfill, `plan_defaults`, expanded `check_plan_access`, `enforce_plan_access`, triggers, RLS tightening)
- `src/hooks/useFeatureGate.ts` (new)
- `src/components/billing/UpgradeModal.tsx` + `UpgradeModalProvider.tsx` (new)
- `src/data/plans.config.ts` (limits map)
- Edits to: `Team.tsx` / `InviteMemberModal.tsx`, `Automation.tsx`, flows pages, autoforms pages, widgets pages, `IntegrationsHub.tsx`, meta-ads pages, campaigns pages
- Edits to edge functions: `create-team-member`, automation/flow/widget/meta-ads/campaign creators

## Out of scope
- Building a new pricing/checkout flow (Stripe upgrade already wired via `/pricing`)
- Changing existing plan tiers/pricing
- Migrating existing data beyond limit backfill

Approve and I'll execute the migration first, then ship code in this order: hook → modal → click-site wiring → edge function gates.
