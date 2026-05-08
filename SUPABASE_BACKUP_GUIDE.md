# Aireatro – Supabase Backup Guide

This guide lets you keep a **fully restorable backup** of your Aireatro database in your **own Supabase project**, without disconnecting the live app from Lovable Cloud.

> Your live app keeps running on Lovable Cloud. This is a parallel backup only.

---

## 1. Create your own Supabase project

1. Go to https://supabase.com → New project.
2. Choose a strong DB password and a region close to your users (e.g. `ap-south-1` for India).
3. Wait until status is **Healthy**.
4. From **Project Settings → API** copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never in frontend)

---

## 2. Restore the schema

1. Open **SQL Editor** in your new Supabase project.
2. Open `aireatro_full_schema.sql` from this backup folder.
3. Paste the **entire file** into one SQL Editor tab and click **Run**.
   - It contains 164 migrations concatenated in chronological order.
   - All `CREATE TABLE`, indexes, triggers, functions, enums, and RLS policies are included.
   - Re-running is safe-ish: most statements use `IF NOT EXISTS` / `CREATE OR REPLACE`.
4. Verify in **Table Editor** → you should see ~203 tables in `public`.

If a statement fails on a missing extension, run this first:
```sql
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
```

---

## 3. Recreate storage buckets

Run this in SQL Editor:

```sql
insert into storage.buckets (id, name, public) values
  ('account-archives', 'account-archives', false),
  ('blog-media',       'blog-media',       true),
  ('invoices',         'invoices',         false),
  ('meta-ad-media',    'meta-ad-media',    true),
  ('wa-media',         'wa-media',         false)
on conflict (id) do nothing;
```

Storage RLS policies are included in the schema dump under the `storage.objects` policies.
If you re-run them manually, the names are:

- `Admins can delete blog media`, `Admins can upload blog media`, `Anyone can view blog media`
- `Public can read meta ad media`
- `Service role can update invoices`, `Service role can upload invoices`, `Workspace members can download invoices`
- `Service role manage account-archives`
- `Tenant members can {view,upload,delete} media` (wa-media)
- `Workspace members can {upload,update,delete} meta ad media`

---

## 4. Export data from Lovable Cloud

In the Lovable editor → **Cloud → Database → Table Editor**, open each table and click **Export → CSV**, OR ask the Lovable AI to export specific tables to `/mnt/documents/`.

### Recommended export priority (high-value tables)

**Tier 1 – Identity & tenancy** (must)
- `profiles`
- `tenants`
- `tenant_members`
- `platform_admins`
- `roles`, `permissions`, `role_permissions`, `user_roles`

**Tier 2 – WhatsApp & messaging**
- `waba_accounts`
- `phone_numbers`
- `contacts`
- `conversations`
- `messages`
- `message_templates`
- `message_credits`, `credit_transactions`

**Tier 3 – CRM & automation**
- `leads`
- `lead_forms`
- `automation_workflows`
- `routing_rules`, `teams`, `team_members`, `agents`

**Tier 4 – Campaigns & ads**
- `campaigns`, `campaign_jobs`
- `meta_ad_accounts`, `meta_campaigns`, `meta_ad_sets`, `meta_ads`
- `instagram_accounts`, `instagram_contacts`, `instagram_conversations`, `instagram_messages`

**Tier 5 – Billing**
- `platform_plans`
- `platform_subscriptions`
- `platform_invoices`
- `platform_payments`
- `workspace_entitlements`

**Tier 6 – Integrations**
- `shopify_stores`, `shopify_orders`, `shopify_customers`
- `integrations`, `integration_events`

---

## 5. Import CSV into your own Supabase

**Order matters** because of foreign keys. Import in this exact order:

```
1.  profiles
2.  tenants
3.  tenant_members
4.  roles → permissions → role_permissions → user_roles
5.  platform_admins, platform_plans
6.  waba_accounts → phone_numbers
7.  contacts
8.  conversations
9.  messages
10. message_templates, message_credits, credit_transactions
11. leads, lead_forms
12. teams → team_members → agents → routing_rules
13. automation_workflows → automation_scheduled_jobs
14. campaigns → campaign_jobs
15. meta_ad_accounts → meta_campaigns → meta_ad_sets → meta_ads
16. instagram_accounts → instagram_contacts → instagram_conversations → instagram_messages
17. shopify_stores → shopify_customers → shopify_orders
18. platform_subscriptions → platform_invoices → platform_payments
19. workspace_entitlements
20. integrations, integration_events
21. audit_logs (optional, large)
```

For each table:
1. Supabase Table Editor → table → **Insert → Import data from CSV**.
2. Map columns 1:1 (Supabase auto-matches by name).
3. If FK errors appear, you imported out of order — clear the table and redo in order.

> Tip: temporarily disable triggers during bulk import:
> ```sql
> alter table public.<name> disable trigger user;
> -- import
> alter table public.<name> enable trigger user;
> ```

---

## 6. Re-upload media files

Storage objects are NOT in the SQL dump (they are binary). Options:

**Option A — Manual (small volumes)**
Lovable Cloud → Storage → bucket → Download each file → Upload to your Supabase bucket of the same name.

**Option B — Script (recommended for `wa-media`, `meta-ad-media`)**
Use the Supabase Storage API:

```bash
# 1. List & download from source
curl -H "Authorization: Bearer $LOVABLE_SERVICE_KEY" \
  "$LOVABLE_URL/storage/v1/object/list/wa-media" -d '{"limit":1000}'

# 2. For each path, download then re-upload to your project:
curl -H "Authorization: Bearer $LOVABLE_SERVICE_KEY" \
  "$LOVABLE_URL/storage/v1/object/wa-media/<path>" -o /tmp/file

curl -X POST -H "Authorization: Bearer $OWN_SERVICE_KEY" \
  -H "Content-Type: <mime>" --data-binary @/tmp/file \
  "$OWN_URL/storage/v1/object/wa-media/<path>"
```

If you don't need historical media (only future uploads matter), **skip this step** — buckets will populate naturally once you switch.

---

## 7. Edge functions

The following 80 Edge Functions live in `supabase/functions/`. They are auto-deployed to **Lovable Cloud** today. To deploy them to your own Supabase later you will need the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref <YOUR_OWN_REF>
supabase functions deploy --no-verify-jwt
```

All function source code stays in this repo, so nothing extra to back up.

---

## 8. Keep the backup updated weekly

Recommended cadence:

| What | How | Frequency |
|------|-----|-----------|
| Schema | Re-run latest combined `aireatro_full_schema.sql` (idempotent — only new migrations apply) | Whenever you ship DB changes |
| Hot data (contacts, messages, leads, conversations) | CSV export + import | Weekly |
| Cold data (audit_logs, platform_billing_events) | CSV export + import | Monthly |
| Storage media | Sync script | Monthly |

Set a Sunday calendar reminder. Each refresh takes ~15 minutes for a typical workspace.

---

## 9. Verification checklist

After restoring into your own Supabase, run these in SQL Editor:

```sql
-- Tables present
select count(*) from pg_tables where schemaname='public'; -- expect ~203

-- RLS enabled
select count(*) from pg_tables where schemaname='public' and rowsecurity = true;

-- Buckets
select id, public from storage.buckets;

-- Critical functions exist
select count(*) from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public'
    and p.proname in ('handle_new_user','is_tenant_member','has_role','create_tenant_with_owner');
```

If all return non-zero, your backup is restore-ready.

---

## 10. What is NOT backed up here

- `auth.users` rows (Supabase Auth) — handled separately via Supabase's built-in user export, OR users can re-signup.
- Realtime publications — recreate with `alter publication supabase_realtime add table public.messages, public.conversations;` after restore.
- Active sessions / refresh tokens — users will need to log in again.
- Lovable AI Gateway state (`LOVABLE_API_KEY`) — this is a Lovable-managed secret, not in Supabase.

