# Aireatro – Migration Switch Plan

Use this when you decide to **cut over** from Lovable Cloud to your own Supabase project. Until then, do nothing — the live app works fine.

---

## 0. Pre-flight (do once, ahead of time)

- [ ] Backup is restored in your own Supabase per `SUPABASE_BACKUP_GUIDE.md`.
- [ ] Latest CSV data import done (within last 24h of switch).
- [ ] Storage buckets recreated.
- [ ] Edge functions deployed via `supabase functions deploy`.
- [ ] All secrets set in your Supabase project's Edge Function secrets dashboard:
      `META_APP_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN`,
      `WHATSAPP_SYSTEM_USER_TOKEN`, `RAZORPAY_*`, `RESEND_API_KEY`,
      `LOVABLE_API_KEY` (or replacement AI keys), `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.

---

## 1. Files / values that change

### A. Frontend Supabase client
`src/integrations/supabase/client.ts` reads from:
- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`

`.env` is **auto-managed by Lovable Cloud** and points at the Lovable Cloud project. You cannot edit it inside the Lovable editor.

**Switch path:** deploy the repo to **Vercel / Cloudflare Pages** and set these env vars there:

```
VITE_SUPABASE_URL              = https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY  = <your anon key>
VITE_SUPABASE_PROJECT_ID       = <your-ref>
```

The Vercel build will pick up YOUR values; Lovable preview will keep using Lovable Cloud — which is what you want during the transition.

### B. Edge Function URLs (webhooks)

Old (Lovable Cloud):
```
https://fygwjpdasnhaomoqdvcu.supabase.co/functions/v1/<name>
```
New (your project):
```
https://<your-ref>.supabase.co/functions/v1/<name>
```

Update these in third-party dashboards:

| Where | Webhook to update | New URL |
|-------|-------------------|---------|
| Meta App → WhatsApp → Webhooks | Callback URL | `…/functions/v1/whatsapp-webhook` |
| Meta App → Instagram → Webhooks | Callback URL | `…/functions/v1/instagram-webhook` |
| Meta App → Lead Ads → Webhooks | Callback URL | `…/functions/v1/meta-leadgen-webhook` |
| Razorpay → Webhooks | Endpoint | `…/functions/v1/razorpay-billing-webhook` |
| Stripe → Webhooks | Endpoint | `…/functions/v1/stripe-webhook` |
| Shopify (per store) | App webhooks | `…/functions/v1/shopify-webhook` |
| TikTok → OAuth redirect | Redirect URI | `…/functions/v1/tiktok-oauth-callback` |
| Custom domain DNS | If using `app.aireatro.com` | re-point to Vercel/CF |

### C. OAuth redirect URIs
Add the new domain(s) to:
- Meta App → App Domains and Valid OAuth Redirect URIs
- Google OAuth consent screen → Authorized redirect URIs
- Shopify Partner App → Allowed redirection URLs
- TikTok Developer App → Redirect URI

### D. Auth providers in your own Supabase
In **Authentication → Providers**:
- Enable **Email** (auto-confirm OFF — users must verify).
- Enable **Google** with your OAuth client ID/secret.
- Set **Site URL** to `https://aireatro.com`.
- Add **Redirect URLs**: `https://aireatro.com/**`, `https://app.aireatro.com/**`, your Vercel preview URLs.

### E. Realtime
After restore, run once in your project's SQL Editor:
```sql
alter publication supabase_realtime add table
  public.messages,
  public.conversations,
  public.smeksh_messages,
  public.instagram_messages,
  public.contact_inbox_summary;
```

---

## 2. Cut-over sequence (production day)

1. **Freeze Lovable Cloud writes** — put a maintenance banner up.
2. Final CSV delta export from Lovable Cloud (last hour of data).
3. Import deltas into your own Supabase.
4. Update all webhooks (section 1B) to point to new URLs.
5. Flip DNS / Vercel env to use new `VITE_SUPABASE_*` values → redeploy.
6. Clear browser localStorage on test devices (`whatsapp-isv-current-tenant`, supabase auth tokens).
7. Run smoke tests (section 3).
8. Remove maintenance banner.

Estimated downtime: **15–30 minutes** with prepared backups.

---

## 3. Smoke test checklist (post-switch)

| # | Test | Expected |
|---|------|----------|
| 1 | Sign up new user (email+password) | Verification email received from `admin@aireatro.com` |
| 2 | Sign in with Google | Redirects to `/select-workspace` |
| 3 | Create new workspace | Appears in `tenants` + `tenant_members` |
| 4 | Invite team member | Invite email sent, accept link works |
| 5 | Connect WhatsApp number (Embedded Signup) | Row in `phone_numbers`, status pending → connected |
| 6 | Send test WhatsApp message | Row in `messages`, status sent → delivered |
| 7 | Receive inbound message | Webhook fires, conversation appears in Inbox |
| 8 | Create + send campaign | `campaign_jobs` rows, sends complete |
| 9 | Create lead form, submit test lead | Row in `leads`, AI/auto-reply triggers |
| 10 | Open `/control` super admin | Loads accounts, workspaces, plans |
| 11 | Change plan in admin | `workspace_entitlements` updated |
| 12 | Upload media in chat composer | File appears in `wa-media` bucket |
| 13 | Logout → login again | Session restored, no infinite redirect |

If any item fails, check **Edge Function logs** in your Supabase dashboard first.

---

## 4. Rollback plan

If something breaks within 24 hours of switch:
1. Revert Vercel env vars back to the Lovable Cloud values (keep them stored).
2. Re-point all webhooks back to `fygwjpdasnhaomoqdvcu.supabase.co`.
3. Lovable Cloud DB still has all original data — no data loss.

Keep the old URLs documented for at least 30 days post-switch.

---

## 5. What stays in Lovable forever

- The codebase (Lovable continues as your code editor / design builder).
- Lovable AI Gateway is optional — if you want to remove it, replace `LOVABLE_API_KEY` usage with direct OpenAI/Google keys in edge functions.

