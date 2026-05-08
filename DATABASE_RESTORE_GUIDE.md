# Aireatro – Database Restore Guide

Use this when you need to restore from a backup ZIP downloaded from **Super Admin → Backups**.

> Your live app keeps running on Lovable Cloud. This guide is for emergency recovery or migrating to your own Supabase.

---

## What's inside the ZIP

```
aireatro-backup-<timestamp>.zip
├── manifest.json                  metadata (timestamp, table count)
├── RESTORE_README.txt             quick steps
├── tables/
│   ├── csv/<table>.csv            one CSV per table
│   └── json/<table>.json          same data as JSON
└── storage/file_list.json         inventory of media files (NOT the binaries)
```

Schema SQL is **not in the ZIP** — it lives in the repo at `supabase/migrations/` and the combined `aireatro_full_schema.sql`.

---

## 1. Create a new Supabase project

1. https://supabase.com → New project. Strong DB password, region close to users.
2. Wait until **Healthy**.
3. From **Settings → API** copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (server only)

## 2. Run the schema

Open **SQL Editor** → paste the entire contents of `aireatro_full_schema.sql` from the repo → Run.

If extensions error, run first:
```sql
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
```

Verify ~203 tables exist in **Table Editor**.

## 3. Recreate storage buckets

```sql
insert into storage.buckets (id, name, public) values
  ('account-archives', 'account-archives', false),
  ('blog-media',       'blog-media',       true),
  ('invoices',         'invoices',         false),
  ('meta-ad-media',    'meta-ad-media',    true),
  ('wa-media',         'wa-media',         false),
  ('database-backups', 'database-backups', false)
on conflict (id) do nothing;
```

## 4. Import CSVs in this exact order

Foreign keys require this order. In Supabase: **Table → Insert → Import data from CSV**.

```
1.  profiles
2.  tenants
3.  tenant_members
4.  platform_admins
5.  platform_plans
6.  waba_accounts
7.  phone_numbers
8.  contacts
9.  conversations
10. messages
11. message_templates
12. message_credits, credit_transactions
13. leads, lead_forms
14. teams, team_members, agents, routing_rules
15. automation_workflows
16. campaigns, campaign_jobs
17. integrations
18. platform_subscriptions, platform_invoices
19. workspace_entitlements
```

If FK errors appear → wrong order → empty the table and redo.

Tip: temporarily disable triggers per table:
```sql
alter table public.<name> disable trigger user;
-- import
alter table public.<name> enable trigger user;
```

## 5. Restore storage media

The ZIP contains only the **inventory** (`storage/file_list.json`), not the binary files. Two options:

**Option A — accept new uploads only.** Most CRMs work fine without historical media. Skip.

**Option B — re-sync from Lovable Cloud while it's still up:**
```bash
# For each path in file_list.json:
curl -H "Authorization: Bearer $LOVABLE_SERVICE_KEY" \
  "$LOVABLE_URL/storage/v1/object/wa-media/<path>" -o /tmp/file
curl -X POST -H "Authorization: Bearer $OWN_SERVICE_KEY" \
  -H "Content-Type: <mime>" --data-binary @/tmp/file \
  "$OWN_URL/storage/v1/object/wa-media/<path>"
```

## 6. Switch environment variables

In **Vercel / Cloudflare Pages → Environment variables**:

| Variable | New value |
|----------|-----------|
| `VITE_SUPABASE_URL` | `https://<your-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon key |
| `VITE_SUPABASE_PROJECT_ID` | `<your-ref>` |

Redeploy. Lovable preview keeps using Lovable Cloud — the production deploy uses your Supabase.

## 7. Update webhook URLs

Replace `fygwjpdasnhaomoqdvcu.supabase.co` with your new project ref in:

| Service | Webhook |
|---------|---------|
| Meta App – WhatsApp | `…/functions/v1/whatsapp-webhook` |
| Meta App – Instagram | `…/functions/v1/instagram-webhook` |
| Meta App – Lead Ads | `…/functions/v1/meta-leadgen-webhook` |
| Razorpay | `…/functions/v1/razorpay-billing-webhook` |
| Stripe | `…/functions/v1/stripe-webhook` |
| Shopify (per store) | `…/functions/v1/shopify-webhook` |
| TikTok OAuth | `…/functions/v1/tiktok-oauth-callback` |

## 8. Deploy edge functions to your project

```bash
supabase login
supabase link --project-ref <YOUR_REF>
supabase functions deploy --no-verify-jwt
```

Set secrets in **your** project dashboard: `META_APP_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `WHATSAPP_SYSTEM_USER_TOKEN`, `RAZORPAY_*`, `RESEND_API_KEY`, `LOVABLE_API_KEY` (or replacement AI keys).

## 9. Realtime publications

```sql
alter publication supabase_realtime add table
  public.messages, public.conversations,
  public.smeksh_messages, public.instagram_messages,
  public.contact_inbox_summary;
```

## 10. Smoke tests after restore

| # | Test | Expected |
|---|------|----------|
| 1 | Sign up new user | Verification email arrives |
| 2 | Google sign-in | Lands on `/select-workspace` |
| 3 | Create workspace | Row appears in `tenants` |
| 4 | Invite team member | Invite email + accept works |
| 5 | Connect WhatsApp number | `phone_numbers` row, status connected |
| 6 | Send WhatsApp message | `messages` row, status sent → delivered |
| 7 | Receive inbound message | Conversation appears in Inbox |
| 8 | Run small campaign | `campaign_jobs` complete |
| 9 | Submit lead form | Row in `leads` + AI reply triggers |
| 10 | Open `/control` | Loads accounts, workspaces, plans |
| 11 | Change plan | `workspace_entitlements` updates |
| 12 | Upload media in chat | Appears in `wa-media` bucket |
| 13 | Logout / login | Session restored |

If any fail → check **Edge Function logs** in Supabase first.

---

## Optional: enable daily auto-backup on your own Supabase

The Backups page already runs **manual** backups on demand. To enable a daily 02:30 UTC schedule:

```sql
-- 1. Store service role key in Vault (one time)
select vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY_HERE',
  'service_role_key'
);

-- 2. Schedule daily backup
select cron.schedule(
  'aireatro-daily-backup',
  '30 2 * * *',
  $$
  select net.http_post(
    url := 'https://<YOUR_REF>.supabase.co/functions/v1/admin-backup/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1),
      'x-cron', '1'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Retention (last 30) runs automatically after each backup.

---

## Rollback plan

If your switch breaks within 24 hours:
1. Revert Vercel env vars back to the Lovable Cloud values.
2. Re-point webhooks back to `fygwjpdasnhaomoqdvcu.supabase.co`.
3. Lovable Cloud DB still has all original data — no data loss.

Keep both URL sets documented for at least 30 days post-switch.
