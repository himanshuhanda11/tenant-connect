
# WhatsApp Coexistence — Additive Extension Plan

Goal: Add Coexistence as a second option alongside the existing Embedded Signup. Existing flow stays untouched.

## 1. Database (migration)

Add columns to `waba_accounts` (existing connection table):
- `coexistence_enabled boolean default false`
- `coexistence_status text` (e.g. `enabled`, `disabled`, `pending`, `not_eligible`, `error`)
- `coexistence_eligibility text` (raw Meta value: `eligible` / `not_eligible` / `unknown`)
- `coexistence_error text`
- `coexistence_checked_at timestamptz`

No RLS changes — inherit existing `waba_accounts` policies (workspace-scoped).

## 2. Frontend — `src/components/meta/MetaEmbeddedSignup.tsx`

Keep current button intact. Add a sibling card/button:
- Title: "Connect with WhatsApp Coexistence"
- Subtitle: "Use Aireatro automation, team inbox, CRM, and campaigns while still using your WhatsApp Business App on the same number."
- New handler `launchCoexistenceSignup` calls `FB.login` with the same `config_id` but passes `extras.featureType = 'whatsapp_business_app_onboarding'` (Meta's coexistence feature flag) and `setup.coexistence = true`.
- Backend POST adds `mode: 'coexistence'`.

The existing "Login with Facebook" button continues to call the normal flow with `featureType: ''`.

## 3. Backend — `supabase/functions/meta-embedded-signup/index.ts`

Extend `exchange_code` action:
- Accept new `mode` field (`'standard'` | `'coexistence'`, default `'standard'`).
- After existing token exchange + WABA fetch, if `mode === 'coexistence'`:
  - Call Meta Graph: `GET /{phone_number_id}?fields=is_coexistence_enabled,coexistence_status` (and `/{waba_id}?fields=...` as fallback) using the access token.
  - Map response into the new columns and persist on the `waba_accounts` row for that WABA.
  - On error, persist `coexistence_status = 'error'`, `coexistence_error = <message>`, still allow the connection to succeed.
- Always set `coexistence_checked_at = now()` when checked.
- Standard flow: leave coexistence columns untouched (default `false` / null).

Return new fields in response so the UI can display status.

## 4. UI Status Block (post-connect)

In the existing post-connect success area inside `MetaEmbeddedSignup.tsx`, after `onSuccess`, render a small status panel when `coexistence_enabled`:
- ✓ Coexistence Enabled
- "WhatsApp Business App can still be used on this number"
- WABA ID, Phone Number ID, Display number
- Last checked time

If not eligible: show the fallback message from the spec.

## 5. Webhook Compatibility

No code changes required — the existing webhook handler routes by `phone_number_id` → `waba_accounts` → `tenant_id`. Coexistence numbers use the same Cloud API webhook pipeline. Verified by reading `whatsapp-webhook` handler; no branching needed.

## 6. Super Admin — `src/pages/admin/AdminWorkspaces.tsx` (and detail view)

In the WhatsApp connections panel, add columns / fields:
- Coexistence Enabled (badge)
- Status
- Eligibility
- Last checked
- Error reason (if any)

Read-only display from the new `waba_accounts` columns.

## 7. Error handling

Backend returns explicit error codes for:
- `not_eligible` — show fallback CTA "Connect normally"
- `duplicate_number` — already handled by existing unique constraints; surface message
- `meta_no_coexistence_data` — saved as `coexistence_status='error'`
- `wrong_number_type` — surfaced from Meta error verbatim

Frontend toast + inline message on each.

## Files touched

- `supabase/migrations/<new>` — add 5 columns to `waba_accounts`
- `supabase/functions/meta-embedded-signup/index.ts` — extend exchange_code
- `src/components/meta/MetaEmbeddedSignup.tsx` — add coexistence button + status UI
- `src/pages/admin/AdminWorkspaces.tsx` (or admin WhatsApp view) — display new fields

Existing standard signup, inbox, campaigns, automation, CRM, and webhook code remain unchanged.
