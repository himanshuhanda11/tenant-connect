
# WhatsApp Business App Coexistence — Full Meta v4 Spec

Builds on the earlier Coexistence scaffolding (already added: `onboarding_type`, `coexistence_enabled`, `coexistence_status`, `coexistence_eligibility`, `coexistence_error`, `coexistence_checked_at` columns + UI cards + admin badges). This pass completes Meta's full "Onboard WhatsApp Business app users" flow.

## 1. Database migration (additive)

`waba_accounts`:
- `is_on_biz_app boolean`
- `platform_type text`
- `contacts_sync_request_id text`, `history_sync_request_id text`
- `contacts_sync_status text`, `history_sync_status text`
- `history_sync_progress int default 0`
- `history_sharing_enabled boolean`
- `last_smb_echo_at timestamptz`
- `disconnect_reason text`

`messages`:
- `source text default 'cloud_api'` (`cloud_api` | `whatsapp_business_app` | `history_sync`)
- `is_echo boolean default false`
- `original_message_id text`
- `revoked_at timestamptz`
- `edited_at timestamptz`
- `history_status text`

No RLS changes — inherit existing policies.

## 2. Frontend — `src/components/meta/MetaEmbeddedSignup.tsx`

- Coexistence card already exists. Update copy to spec ("Keep using your WhatsApp Business App while Aireatro powers API messaging…").
- The MessageEvent listener already handles standard `WA_EMBEDDED_SIGNUP` events. Add detection for `event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'` (Meta sends this for coexistence) and for `event === 'FINISH'` with the same shape — both populate `sessionDataRef`.
- The launch already passes `featureType: 'whatsapp_business_app_onboarding'` for coexistence — keep as-is. Bump `sessionInfoVersion` to `'3'` (already set).
- After backend returns success, render a **sync progress panel** (contacts + history phases, 0–100%, throughput 20 mps badge, plus "WhatsApp Business App is still active" callout and offboarding instructions).

## 3. Backend — `supabase/functions/meta-embedded-signup/index.ts`

In `exchange_code` when `mode === 'coexistence'`:
- After WABA + phone save, **skip phone `/register` call** (already only runs for clientPhoneId path — gate the registration block on `!isCoexistence`).
- Replace eligibility probe with the spec call: `GET /{phone_number_id}?fields=is_on_biz_app,platform_type`. Persist:
  - `coexistence_enabled = is_on_biz_app && platform_type === 'CLOUD_API'`
  - `is_on_biz_app`, `platform_type`
  - `coexistence_status = 'active' | 'pending' | 'error'`
  - `coexistence_checked_at`
- Subscribe to webhook fields explicitly via `POST /{waba_id}/subscribed_apps` with extended `subscribed_fields=messages,message_template_status_update,phone_number_name_update,phone_number_quality_update,account_update,history,smb_app_state_sync,smb_message_echoes` (Meta uses this on the WABA-level subscription).
- Trigger sync requests:
  - `POST /{phone_number_id}/smb_app_data` body `{ messaging_product: 'whatsapp', sync_type: 'smb_app_state_sync' }` → save `contacts_sync_request_id`, `contacts_sync_status='requested'`.
  - Same with `sync_type: 'history'` → save `history_sync_request_id`, `history_sync_status='requested'`, `history_sync_progress=0`.
- Return all fields in response so UI can render the sync panel.

## 4. Webhook handler — `supabase/functions/whatsapp-webhook/index.ts`

Add new field handlers (do not touch existing message logic):

- **history**: iterate messages array. Insert into `messages` with `source='history_sync'`, `direction` from payload, `wamid`, `text/media`, `created_at` from history timestamp. Update `waba_accounts.history_sync_status` from `phase` and bump `history_sync_progress`. On `errors[].code === 2593109`, set `history_sharing_enabled=false`, `history_sync_status='declined'`.
- **smb_app_state_sync**: iterate contacts array. Upsert into `contacts` table (existing schema) keyed on `(tenant_id, wa_id)`. Honor `action: 'add' | 'remove'` (remove → soft delete via existing pattern, or skip if not supported). Update `contacts_sync_status`.
- **smb_message_echoes**: insert into `messages` with `direction='outbound'`, `is_echo=true`, `source='whatsapp_business_app'`. Match conversation by `(tenant_id, contact wa_id)`. Update `last_smb_echo_at`.
- **messages edits/revokes** (`messages[].type === 'message_edit'` / `'message_revoke'` or sibling `edits`/`revokes` arrays): look up by `original_message_id` (wamid) and update existing row (`edited_at`, new text) or set `revoked_at`. Ignore unsupported error 131060 silently.
- **account_update**: handle `event` values:
  - `PARTNER_REMOVED` → set `waba_accounts.status='disconnected'`, `disconnect_reason='partner_removed'`.
  - `ACCOUNT_OFFBOARDED` → same with `'account_offboarded'`.
  - `ACCOUNT_RECONNECTED` → set `status='active'`, clear `disconnect_reason`.

Tenant resolution stays via existing `phone_number_id → phone_numbers → tenant_id` lookup (works identically for coexistence numbers).

## 5. Admin status panel — `WhatsAppConnectionStatus.tsx`

Extend existing Coexistence block with:
- `is_on_biz_app` / `platform_type` rows
- Contacts sync: status badge
- History sync: status + progress bar (0–100%)
- Throughput badge (20 mps for coexistence)
- Last SMB echo timestamp
- Disconnect reason (when set)

## 6. Customer-facing connection result panel

In `MetaEmbeddedSignup.tsx` post-connect, when `coexistence_enabled`:
- "✓ Connected with WhatsApp Business App Coexistence"
- "WhatsApp Business App is still active · Aireatro API is active"
- WABA ID, Phone Number ID, display number
- Sync progress block (contacts + history phases)
- Throughput: 20 mps
- Offboarding note: "To disconnect Cloud API, open WhatsApp Business App → Settings → Account → Business Platform → Disconnect Account." (do NOT call Deregister API)

When not eligible / error: existing fallback message stays.

## Files touched

- migration (new) — additive columns on `waba_accounts` and `messages`
- `supabase/functions/meta-embedded-signup/index.ts` — skip register, add status probe, subscribed_fields, sync triggers
- `supabase/functions/whatsapp-webhook/index.ts` — new field handlers (history / smb_app_state_sync / smb_message_echoes / account_update / edits & revokes)
- `supabase/functions/admin-api/index.ts` — include new columns in waba select
- `src/components/meta/MetaEmbeddedSignup.tsx` — new post-connect panel + finish event detection
- `src/components/admin/workspace-detail/WhatsAppConnectionStatus.tsx` — extended badges

Existing standard signup, inbox, campaigns, automation, CRM, and webhook code remain unchanged — all new logic is gated on coexistence-only fields/events.
