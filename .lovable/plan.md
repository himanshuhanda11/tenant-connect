
# Agent Availability / Pause Assignment System

Build a complete pause-new-chat system for agents in the Aireatro CRM, with backend validation, round-robin integration, realtime sync, admin override, and premium mobile-responsive UI.

## 1. Database Migration

**Extend `agents` table** (existing per memory):
- `availability_status` text default `'available'` — values: `available`, `paused`, `offline`
- `pause_reason` text nullable — `break`, `lunch`, `meeting`, `busy`, `leave`, `custom`, etc.
- `pause_custom_reason` text nullable
- `paused_at` timestamptz nullable
- `pause_until` timestamptz nullable
- `last_available_at` timestamptz nullable
- `auto_resume_enabled` boolean default `true`
- `availability_updated_by` uuid nullable

**New table `agent_availability_history`** for admin audit:
- workspace_id (tenant_id), agent_user_id, status, reason, paused_at, pause_until, changed_by, created_at

**Extend `assignment_logs`** (or create if missing):
- workspace_id, conversation_id, assigned_to_agent_id, assignment_method (`round_robin`, `manual`, `admin_override`, `unassigned_queue`), skipped_agents jsonb, assignment_reason text, created_at

**Indexes:** `(tenant_id, availability_status)`, `(tenant_id, pause_until)` on agents.

**RLS:**
- Agent: read/update own availability row only
- Admin/owner: manage any agent in their workspace
- History: admin/owner read-only

**Auto-resume function + cron:**
- Postgres function `auto_resume_paused_agents()` flips `availability_status = 'available'` where `pause_until <= now()` and `auto_resume_enabled = true`
- pg_cron job runs every 1 minute

## 2. Backend — Edge Functions

### `agent-availability` (new)
Endpoints:
- `POST /pause` — body: `{ duration_minutes, reason, custom_reason?, agent_user_id? }`
  - Verify JWT, get caller workspace + role
  - If `agent_user_id` differs from caller → require admin/owner
  - **Last available agent guard:** count active agents with `availability_status='available'` AND `is_active=true` AND not suspended. If `count <= 1` AND target is that agent:
    - If caller is admin/owner AND `body.force=true` → allow + log warning
    - Else → return 409 with `{ error: 'last_available_agent', available_count }`
  - Transaction: update agent row, insert history log
  - Return updated state
- `POST /resume` — set status available, clear pause fields, log history
- `GET /team` — list workspace team availability (admin/owner only)
- `POST /admin-override` — admin force-pause/force-available/manual reassign

### Update `whatsapp-webhook` round-robin block
Find current round-robin assignment logic. Update SQL/JS to:
- Filter eligible agents: `is_active=true AND availability_status='available' AND (pause_until IS NULL OR pause_until <= now()) AND status != 'suspended'`
- Atomically pick next agent using `FOR UPDATE SKIP LOCKED` on a pointer row, OR use `(last_assigned_at ASC NULLS FIRST)` strategy
- Insert into `assignment_logs` with skipped agents
- If zero eligible → set conversation to unassigned queue, notify admins via existing notification path
- Increment pointer only on successful assignment

Apply same filter in any other assignment paths (form-based assignment, AI handoff, manual reassignment fallback).

## 3. Frontend

### Hook `useAgentAvailability`
- Subscribe to Supabase realtime on `agents` row (own + team for admin)
- Returns `{ status, pauseUntil, reason, pause, resume, isLastAvailable }`
- Auto-refetch on visibility change + reconnect
- Invalidate React Query keys: `['agents']`, `['team']`, `['inbox-counts']`

### `AgentAvailabilityPill` (top-right header)
- Pill states: green Available / orange Paused (with countdown) / gray Offline
- Click → opens `AgentAvailabilityModal` (desktop dropdown popover) or `AgentAvailabilitySheet` (mobile bottom sheet)
- Mount in `DashboardLayout` header next to existing controls; on mobile mount in `MobileBottomNav` account area

### `AgentAvailabilityModal`
- Glassmorphism card, animated with framer-motion
- Title "Agent Availability" + subtitle
- Reason dropdown (optional) with custom text input when "Custom" picked
- Duration grid: 13 buttons (30m → 30d)
- Live countdown when paused
- Action buttons: "Pause" / "Resume now"
- Last-available-agent error modal:
  - Title "Can't pause right now" + message
  - Disabled duration buttons
  - Helper text + "Okay, stay available" / "View team availability" buttons
- Admin override warning modal: "All agents will become unavailable" + "Pause Anyway" / "Cancel"
- Toast on success

### `TeamAvailabilityPanel` (admin)
- New section in Team page: agent list with status badge, pause until + countdown, reason, assigned chats count, last seen
- Actions per row: Force Available, Force Pause (duration picker), Reassign Chats
- Realtime subscription on workspace agents

### Auto-resume on client
- Timer in hook flips local state when `pause_until` passes; backend cron is source of truth, client UI just animates state change

## 4. Realtime

- Enable realtime on `agents` table (publication add)
- Hook subscribes to `postgres_changes` filtered by `tenant_id` (admin) or `user_id` (agent)
- Invalidates inbox/team caches on change

## 5. Edge Cases Covered

- Pause during webhook → assignment SELECT re-checks DB, paused agent skipped before insert
- All paused → unassigned queue + admin notification
- Race conditions → DB-level locking + atomic pointer update
- Auto-resume → cron + client realtime
- Admin override → `force=true` flag with warning modal
- Suspended/inactive/deleted → already filtered via `is_active` & status
- Workspace switch → hook re-subscribes on workspace change
- Mobile refresh / reconnect → hook refetches on visibilitychange + supabase reconnect

## 6. Files

**Created:**
- `supabase/migrations/<ts>_agent_availability.sql`
- `supabase/functions/agent-availability/index.ts`
- `src/hooks/useAgentAvailability.ts`
- `src/components/availability/AgentAvailabilityPill.tsx`
- `src/components/availability/AgentAvailabilityModal.tsx`
- `src/components/availability/AgentAvailabilitySheet.tsx`
- `src/components/availability/TeamAvailabilityPanel.tsx`
- `src/lib/availability.ts` (duration options + helpers)

**Edited:**
- `supabase/functions/whatsapp-webhook/index.ts` — round-robin filter + assignment_logs
- Any other assignment edge function (round-robin / form rules) — same filter
- `src/components/layout/DashboardLayout.tsx` — mount pill
- `src/components/layout/MobileBottomNav.tsx` — mobile entry
- `src/pages/team/TeamMembers.tsx` (or Team.tsx) — admin panel section
- `supabase/config.toml` — register new function (if needed)

## 7. Testing checklist

After build I'll verify: migration applies cleanly, edge function deploys, pill renders desktop + mobile (909px viewport), pause flow works, last-available guard triggers, admin override modal appears, realtime updates propagate, round-robin skips paused agents in webhook code path.

This is a large build (~10 files, 1 migration, 2 edge function changes). Approve to proceed.
