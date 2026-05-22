## Goal

Make the Auto-Form Rules feature fully functional end-to-end, with each trigger card properly configurable, integrated with the new QR Code Scan module, plus form preview + live testing and a premium UI. Add an in-app explainer for each step so you can teach customers.

---

## What I'll fix

### 1. WHEN step — every trigger card must collect its config

Today some cards (Scheduled, AI Intent, Tag Added, Traffic Source) jump to step 2 without asking for their trigger details. After selecting a card, an inline configuration panel will appear with the right inputs:

| Card | Config collected |
|---|---|
| First Message | (none — already works) |
| Keyword Match | keywords list + match type (contains / exact / starts-with / regex) |
| Meta Ad Click | Ad account + campaign / adset multi-select (from existing Meta Ads data) |
| QR Code Scan | dropdown of QR campaigns from the new `/qr-campaigns` module |
| Traffic Source | multi-select (organic, meta_ads, referral, qr, widget, api, import) |
| Tag Added | tag picker (from `tags` table) |
| Scheduled | mode picker — "After contact created" (delay value + unit: minutes/hours/days), OR "Recurring schedule" (cron + timezone) |
| AI Intent | intent text + sample utterances, confidence threshold |

The Next button stays disabled until the selected trigger's required config is valid.

### 2. QR Code Scan → connect to yesterday's QR module

- Reuse `useQrCampaigns` to populate the QR Code Scan dropdown.
- Save the picked `qr_campaign_id` into `trigger_config`.
- On the QR campaign detail page, show which Form Rules consume it (read-only badge).
- Webhook handler already reads `trigger_config.qr_campaign_id`; verify and patch if missing.

### 3. Form Preview + Live Test

In the THEN step and the rule detail dialog:

- **Preview tab** — WhatsApp-styled mock chat showing the template/form exactly as the contact will see it (header media, body with sample variables filled, buttons, fields).
- **Live Test tab** — pick a phone number you own → "Send test now" calls the existing `submit-template-to-meta` / send-template edge function with the rule's payload and shows delivery status inline (sent → delivered → read) using template_submission_logs-style polling.

### 4. UI/UX polish (premium)

- Replace the current step header with a sticky progress rail (matches the screenshot you shared but cleaner: gradient active state, completed checkmarks, click-to-jump for already-completed steps).
- Cards: consistent radius, hover lift, selected state uses gradient border + check badge, PRO badge stays on AI Intent.
- Inline config panel uses a soft card with the trigger's accent color.
- Mobile: cards become single column under 640 px, sticky bottom action bar with Back / Next / Save.
- Use semantic tokens from `index.css` only (no hardcoded `bg-blue-50` etc.). Move trigger color map to tokens (`--trigger-keyword`, `--trigger-qr`, …).

### 5. Verify every step works end-to-end

I'll smoke-test each step in the running preview:
1. WHEN — every card sets the right `trigger_type` + `trigger_config`.
2. IF — add / remove conditions, operator toggle, save round-trips.
3. THEN — form picker loads, template variables map, preview renders.
4. GUARD — cooldown / max-per-day / opt-in / business-hours all persist.
5. SAVE — review shows everything, create + edit both work, list refreshes.

Anything broken gets fixed in the same pass. I'll attach a short test-results note when done.

### 6. In-app explainer (so you can explain to customers)

A new "How Form Rules work" collapsible at the top of `/auto-forms/rules` plus a `?` help button on each step header. Each step gets a 2-3 line plain-English explanation:

- **WHEN** — the event that starts the rule (a new chat, a keyword, a QR scan, etc.).
- **IF** — extra checks before sending (has tag, came from a specific source, opted-in).
- **THEN** — which form/template gets sent and how variables are filled.
- **GUARD** — safety limits so the same contact isn't spammed (cooldown, daily cap, business hours).
- **SAVE** — review and activate.

I'll mirror this content in chat after the build so you have it in writing.

---

## Technical notes

- Files touched: `src/components/automation/CreateFormRuleModal.tsx`, `ViewFormRuleDialog.tsx`, `src/pages/auto-forms/AutoFormRulesPage.tsx`, `src/types/formRule.ts` (add `delay_value`, `delay_unit`, `schedule_mode` to `FormRuleTriggerConfig`), `src/hooks/useFormRules.ts` if needed, plus a new `src/components/automation/form-rule/` folder for the per-trigger config panels and the Preview/LiveTest tabs.
- No DB schema change required — `trigger_config` is JSONB and already stores arbitrary keys. Only adding new keys.
- Edge function `process-form-rule` (or equivalent): confirm it honors `schedule_mode='delay'` + `delay_value/unit` and `qr_campaign_id`; patch if missing.
- Reuses: `useQrCampaigns`, `useTags`, `useMetaAdAccounts`, `useTemplates`, existing template preview component.

---

## Out of scope (ask if you want these too)

- Building a brand-new form preview engine — I'll reuse the existing WhatsApp message preview.
- Changing the underlying form definitions or submission storage.
- Analytics on rule performance (a separate tab worth its own pass).

Approve and I'll start with the WHEN-step config panels + QR linking, then preview/test, then UI polish, then verify.