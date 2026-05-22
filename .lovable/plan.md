# Flow Builder Premium Redesign — Step 1 of 3

You asked for a complete UI/UX overhaul of `/flows` while preserving every existing feature, trigger, table, webhook, template, team-routing, and saved flow. This is a very large task touching 5,600+ lines across 10 files, plus mobile/tablet variants and a guided mode. To do this safely without breaking your live flows, I'll split it into 3 STEPS (you confirmed Step 1 first).

## Step 1 Scope (this approval)

### A. Audit & Safety (no behavior change)
- Inventory current files: `FlowBuilder.tsx` (1142), `FlowsHub.tsx` (745), `FlowStartPanel.tsx`, `NodeConfigPanel.tsx`, `WorkflowBuilder.tsx`, modals (Preview/Test/History/Analytics/AI).
- Map data flow: existing `automation_workflows`, `automation_nodes`, `automation_edges`, `automation_runs`, triggers (keyword/QR/tag/source/AI intent/scheduled/inbound), template send, team routing, webhook execution.
- Keep ALL existing types, hooks (`useAutomationWorkflows`, `useFormRules`, `useQrCampaigns`, `useTags`), and edge functions untouched.
- Add a `LegacyFlowBuilder` alias as a fallback toggle (env-flag) so any saved flow that doesn't load in the new UI can be opened in the old one. Zero data migration.

### B. New Premium Layout (visual + UX redesign only — same data model)
1. **Sticky Glass Header** — editable title, status badge (Draft/Published/Paused), auto-save indicator, last-edited timestamp, Undo/Redo, Save Draft, Test, Preview, Publish, Version History.
2. **Left Node Library** — grouped (Triggers, Messages, Questions, Conditions, CRM, Team, Delay, Webhook, End, Prebuilt), search, favorites (localStorage), drag-to-canvas + quick-add.
3. **Center Canvas** — refined React Flow canvas: soft grid, minimap, zoom controls, auto-arrange (dagre), snap, keyboard shortcuts (Del/Ctrl+Z/Ctrl+D/Space-pan), animated curved edges color-coded (success/fail/wait), node shapes by category (rect/diamond/circle/pill), inline "+" add-between-nodes, broken-connection warnings.
4. **Right Settings Panel** — per-node config with title, description, validated fields, Preview/Test/Duplicate/Delete/Save. Uses existing `NodeConfigPanel` logic refactored into a cleaner shell.
5. **Flow Health Score** — top-right pill showing % of nodes validly configured + connected.

### C. Guided Mode (new entry)
- "Create with Guide" button on `/flows` hub opens 7-step wizard (Goal → Trigger → Welcome → Questions → Conditions → Assign → Publish).
- Goal presets: Visa, Travel, Lead Qualification, Support, Appointment, Real Estate, Bulk Campaign.
- Wizard outputs a normal `automation_workflows` row + nodes/edges — fully compatible with existing executor.

### D. Mobile/Tablet
- ≥1024px: full canvas.
- 768–1023px: collapsed left panel as drawer, right panel as bottom sheet.
- <768px: **Step List mode** — vertical card list of nodes (no canvas), tap-to-edit in bottom sheet, reorder via drag-handle. Same underlying data.

### E. Performance
- React Flow `onlyRenderVisibleElements`, memoized node components, debounced auto-save (1.5s), lazy-load heavy modals.

## Out of scope for Step 1 (will be Steps 2 & 3)
- **Step 2**: New node types polish + AI suggestions + publish checklist + animations + empty/loading skeletons + flow analytics tab redesign.
- **Step 3**: Performance virtualization for 200+ node flows, version diff viewer, advanced testing simulator with WhatsApp mock + execution traces.

## Backward compatibility guarantees
- No schema changes in Step 1.
- No edge function changes.
- All existing nodes render & save with the same `config` JSON shape.
- Existing flows open identically; legacy fallback toggle available.
- Existing CRM/team/template/webhook routing unchanged.

## Files to be edited/created (Step 1)
- NEW: `src/components/flows/v2/FlowHeader.tsx`, `NodeLibrary.tsx`, `FlowCanvas.tsx`, `NodeInspector.tsx`, `FlowHealthPill.tsx`, `GuidedFlowWizard.tsx`, `MobileStepList.tsx`, `nodeRegistry.ts`, `nodeShapes.tsx`, `useFlowAutosave.ts`.
- EDITED: `src/pages/flows/FlowBuilder.tsx` (shell swap, legacy fallback), `src/pages/flows/FlowsHub.tsx` (Guided entry + premium polish).
- UNCHANGED: all hooks, types, edge functions, DB tables, existing modals (reused).

## Verification after Step 1
- Open an existing saved flow → renders & saves identically.
- Add/delete/connect/duplicate nodes, undo/redo, zoom, minimap.
- Save Draft + Publish + Test.
- Resize 1440 → 1024 → 768 → 390 (Step List).
- Run Guided Wizard → produces working flow that executes via existing engine.

Reply **approve** to start Step 1, or tell me what to adjust (e.g. skip Guided Mode, change mobile approach, defer fallback toggle).
