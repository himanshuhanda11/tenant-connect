## Goal
Build a complete, production-grade Flow execution engine (Steps 2 & 3 of the Flows rebuild) on top of the existing `flows`, `flow_nodes`, `flow_edges`, `flow_versions`, `flow_triggers`, `flow_sessions`, `flow_events`, `flow_templates`, `flow_diagnostics` tables — **without breaking any saved automation, existing webhook, or WhatsApp logic**.

The existing `automation_*` tables (Form Rules, Auto-Reply, Round-Robin etc.) stay **untouched**. The new engine runs *in parallel* to them, fired from the same `whatsapp-webhook` after current handlers (Form > AI > Form Rules > Auto-Reply per memory).

---

## Phase A — Audit + Safety Net (no behaviour change)

1. Read every flow-related file: `FlowBuilder.tsx`, `FlowsHub.tsx`, `whatsapp-webhook/index.ts` (form-rules section), `automation-event`, `automation-job-runner`.
2. Inventory current `flows` schema (already has versions, sessions, events, triggers, nodes, edges). Confirm no destructive migration is needed — only **additive**.
3. Add a kill-switch: `tenant_settings.flow_engine_enabled` (default false). New engine only runs for tenants where this is on. Existing form-rules + automations keep working as-is.

## Phase B — Additive Database (one migration, additive only)

New tables:
- `flow_runs` — one row per execution attempt (run_id, flow_id, version_id, contact_id, conversation_id, trigger_type, trigger_payload, status, started_at, ended_at, error)
- `flow_run_steps` — per-node execution log (run_id, node_key, node_type, status, input, output, started_at, ended_at, retry_count, error)
- `flow_errors` — surfaced errors with severity, node_key, message, stack, resolved
- `flow_analytics_daily` — materialised counts (flow_id, date, runs, completed, failed, dropoffs[], avg_duration_ms)
- `contact_flow_state` — current in-progress run per contact (unique on tenant+contact+flow), holds `waiting_for`, `variables jsonb`, `expires_at`
- `lead_custom_fields` — per-tenant field registry (key, label, type, options), used by Question nodes to map answers into `contacts.custom_data jsonb`
- `flow_scheduled_jobs` — delayed/follow-up queue (run_at, run_id, node_key, payload, status, attempts) — pg_cron polls every minute
- `flow_logs` — lightweight debug log (already partly covered by `flow_events`, extend if needed)

Each table: tenant_id NOT NULL, RLS via `is_tenant_member`, indexes on (tenant_id, flow_id), (status, run_at) where relevant. Add `tenant_settings.flow_engine_enabled boolean default false`.

## Phase C — Flow JSON Engine (shared lib)

`supabase/functions/_shared/flow-engine.ts` (ESM, esm.sh imports only):
- `loadPublishedFlow(flowId)` — pulls nodes+edges from `flow_versions.snapshot`
- `startRun(ctx)` — creates `flow_runs` row, calls `executeNode(startNode)`
- `executeNode(node, ctx)` — switch on node_type:
  - `send_message` (text/buttons/list/media/template) → calls existing `send-text-message` / `send-template-message`, respects 24h gate (memory: `messaging-gate-24h`), retries 3× on failure
  - `question` → sends prompt, sets `contact_flow_state.waiting_for = {node_key, expected_type, validation}`, suspends
  - `condition` → evaluates IF/ELSE branches (keyword, lead score, country, business hours, agent online)
  - `assign` → uses existing round-robin function (memory: `round-robin-system`) or specific agent
  - `delay` → enqueue into `flow_scheduled_jobs` with `run_at = now() + delay`
  - `webhook_call`, `set_field`, `add_tag`, `end`
- Loop guard: max 50 node hops per resume; duplicate trigger guard (idempotency key per wamid).

## Phase D — Trigger Dispatcher

`flow-trigger-dispatcher` edge function called from:
- `whatsapp-webhook` (after current handlers, only if no existing handler consumed the message)
- `meta-leadgen` (on new lead)
- `qr-scan` endpoint (already built per memory)
- public `flow-webhook/{flow_id}` (API/website form)
- manual button in UI → `POST /flows-run-test`

Dispatcher matches `flow_triggers` rows (trigger_type, keywords, source filters), checks tenant flag, checks duplicate guard, calls `startRun`.

## Phase E — Resume + Delay Workers

- `flow-message-resumer` — called from `whatsapp-webhook` when an inbound message arrives for a contact that has `contact_flow_state` waiting. Validates answer per question schema, writes to `contacts.custom_data` + `lead_custom_fields`, then `executeNode(next)`.
- `flow-scheduled-worker` — cron every 1 min, picks due `flow_scheduled_jobs`, resumes runs. Auto-stop if contact replied between schedule and run (configurable per delay node).

## Phase F — Frontend wiring (minimal, no UI rewrite)

- `FlowBuilder.tsx`: ensure publish writes a `flow_versions` snapshot (nodes+edges JSON) and flips `flows.status='published'`. Add Test button that calls `flows-run-test`.
- `FlowsHub.tsx`: add "Runs" tab per flow → lists `flow_runs` with status, contact, duration; click to see `flow_run_steps` timeline.
- New page `FlowAnalytics.tsx`: charts from `flow_analytics_daily` (runs, completion rate, drop-off per node, qualified leads).
- `FlowErrors.tsx` panel in builder header — count + drawer of unresolved `flow_errors`.

## Phase G — Security + Hardening

- All new tables RLS via `is_tenant_member` / `is_tenant_admin` for mutations.
- Webhook signature verified for inbound triggers (HMAC for public webhook trigger).
- Zod-validate every edge function body.
- Loop prevention (max hops), retry caps (3), node timeout (30s).
- ES256 manual JWT verify pattern for any function with `verify_jwt=false` (memory: `es256-edge-function-pattern`).

## Phase H — Testing checklist

Manual end-to-end:
- Create a flow → Publish → send WA message matching keyword → run starts → question asked → reply saved to `contacts.custom_data` → condition branches → assigned to agent → delay → follow-up sent → end. Verify `flow_runs.status='completed'`, analytics increments, no error rows.
- Negative: invalid answer → re-prompt; agent offline → overflow; outside 24h → template path; flow disabled → no run; duplicate wamid → single run.

## What is NOT touched

- `automation_*` tables, Form Rules engine, AI auto-reply, Round-Robin function (called, not modified), Meta Ads automations, WhatsApp send functions (called, not modified).
- Any existing edge function logic — only **additions**.

## Delivery order (one approval gates everything)

1. Migration (Phase B) — needs your approval prompt.
2. Shared engine + dispatcher + resumer + worker edge functions (Phase C-E).
3. Frontend Runs/Analytics/Errors panels (Phase F).
4. Verify with a real test flow.

Reply **"go"** to start with the migration.