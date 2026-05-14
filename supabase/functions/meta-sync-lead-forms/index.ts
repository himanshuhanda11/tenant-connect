import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GRAPH = 'https://graph.facebook.com/v21.0';

type MetaAccountRow = {
  id: string;
  meta_access_token: string | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  status: string | null;
  is_active: boolean | null;
  scopes_granted?: string[] | null;
};

type MetaPage = {
  id: string;
  name: string;
  access_token?: string;
};

function dedupePages(pages: MetaPage[]) {
  const mergedPages = new Map<string, MetaPage>();

  for (const page of pages) {
    if (!page?.id) continue;
    mergedPages.set(page.id, {
      id: page.id,
      name: page.name || mergedPages.get(page.id)?.name || 'Untitled Page',
      access_token: mergedPages.get(page.id)?.access_token || page.access_token,
    });
  }

  return Array.from(mergedPages.values());
}

function friendlyMetaPermissionError(errorMessage: string) {
  if (errorMessage.includes('leads_retrieval')) {
    return 'Missing leads_retrieval permission. Please reconnect Facebook from Meta Ads Setup and approve Lead Access / leads_retrieval permission.';
  }
  if (errorMessage.includes('pages_manage_ads')) {
    return 'Missing pages_manage_ads permission. Please reconnect Facebook from Meta Ads Setup and approve all requested permissions.';
  }
  if (errorMessage.includes('(#200)')) {
    return 'Insufficient Facebook Page permissions. Please reconnect from Meta Ads Setup and grant full Page + Lead Ads access.';
  }
  if (errorMessage.includes('OAuthException') && errorMessage.includes('expired')) {
    return 'Your Facebook token has expired. Please reconnect from Meta Ads Setup.';
  }
  return errorMessage;
}

function isMissingLeadsRetrieval(errorMessage: string) {
  return errorMessage.includes('leads_retrieval');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Invalid token' }, 401);

    const { tenantId, action, pageId, formId, maxLeads } = await req.json();
    if (!tenantId) return json({ error: 'Missing tenantId' }, 400);

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).single();
    if (!membership) return json({ error: 'Not a member' }, 403);

    const { data: accounts, error: accountsError } = await supabase
      .from('smeksh_meta_ad_accounts')
      .select('id, meta_access_token, facebook_page_id, facebook_page_name, status, is_active, scopes_granted')
      .eq('workspace_id', tenantId)
      .eq('is_active', true);

    if (accountsError) {
      console.error('[meta-sync-lead-forms] Failed to load Meta accounts:', accountsError);
      return json({ error: 'Failed to load connected Meta accounts' }, 500);
    }

    const connectedAccounts = ((accounts || []) as MetaAccountRow[]).filter(
      (account) => account.status === 'connected'
    );

    const storedPages: MetaPage[] = connectedAccounts
      .filter((account) => account.facebook_page_id)
      .map((account) => ({
        id: account.facebook_page_id as string,
        name: account.facebook_page_name || 'Untitled Page',
        // Stored account tokens are user OAuth tokens, not Page tokens. Only /me/accounts tokens
        // can call /{page_id}/leadgen_forms or /{page_id}/subscribed_apps reliably.
        access_token: undefined,
      }));

    const systemUserToken = Deno.env.get('META_SYSTEM_USER_TOKEN') || null;
    // Use the user's OAuth token to call /me/accounts which returns PAGE-specific tokens
    // The user token itself cannot call /{page_id}/leadgen_forms — only page tokens can
    const userOAuthToken = connectedAccounts.find((account) => account.meta_access_token)?.meta_access_token || null;
    let accessToken = userOAuthToken || systemUserToken || null;
    if (!accessToken) return json({ error: 'No Meta access token configured' }, 400);

    async function refreshStoredScopes() {
      try {
        const permsRes = await fetch(`${GRAPH}/me/permissions?access_token=${accessToken}`);
        const permsData = await permsRes.json();
        if (!permsRes.ok || permsData?.error || !Array.isArray(permsData?.data)) return;

        const grantedScopes = permsData.data
          .filter((permission: any) => permission?.status === 'granted' && permission?.permission)
          .map((permission: any) => permission.permission);

        const currentScopes = connectedAccounts[0]?.scopes_granted || [];
        const scopesChanged = grantedScopes.length !== currentScopes.length || grantedScopes.some((scope: string) => !currentScopes.includes(scope));
        if (connectedAccounts[0]?.id && scopesChanged) {
          await supabase
            .from('smeksh_meta_ad_accounts')
            .update({ scopes_granted: grantedScopes })
            .eq('id', connectedAccounts[0].id)
            .eq('workspace_id', tenantId);
          connectedAccounts[0].scopes_granted = grantedScopes;
        }
      } catch (scopeError) {
        console.warn('[meta-sync-lead-forms] Failed to refresh stored permissions:', scopeError);
      }
    }

    if (action === 'refresh_permissions') {
      await refreshStoredScopes();
      return json({
        success: true,
        scopes_granted: connectedAccounts[0]?.scopes_granted || [],
      });
    }

    if (action === 'sync_forms') {
      await refreshStoredScopes();
      let pages: MetaPage[] = [];

      // CRITICAL: /me/accounts returns page-specific access tokens
      // These page tokens are required for /{page_id}/leadgen_forms
      try {
        const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();

        if (!pagesRes.ok || pagesData?.error) {
          console.error('[meta-sync-lead-forms] Failed to fetch /me/accounts:', pagesData?.error || pagesData);
          // Fall back to stored pages but they won't have page tokens
          pages = [...storedPages];
        } else if (Array.isArray(pagesData?.data)) {
          pages = pagesData.data.map((page: any) => ({
            id: page.id,
            name: page.name,
            access_token: page.access_token, // This is the PAGE token from Meta
          })).filter((p: MetaPage) => !!p.access_token);
          console.log(`[meta-sync-lead-forms] Got ${pages.length} pages with page tokens from /me/accounts`);
        }
      } catch (graphError) {
        console.error('[meta-sync-lead-forms] Error fetching pages from Meta:', graphError);
        pages = [...storedPages];
      }

      // Merge with stored pages (but prefer freshly fetched page tokens)
      pages = dedupePages([...pages, ...storedPages]);

      if (pages.length === 0) {
        return json({
          pages: [],
          forms: [],
          message: 'No connected Facebook pages found for this Meta account',
        });
      }

      const allForms: any[] = [];
      const pageErrors: Array<{ page_id: string; page_name: string; error: string }> = [];

      for (const page of pages) {
        // MUST use a page-specific token — user tokens cause #210 error
        const pageAccessToken = page.access_token;
        if (!pageAccessToken) {
          pageErrors.push({
            page_id: page.id,
            page_name: page.name,
            error: 'No page access token available. Please reconnect your Facebook account via Meta Ads Setup.',
          });
          continue;
        }
        
        try {
          const formsRes = await fetch(
            `${GRAPH}/${page.id}/leadgen_forms?fields=id,name,status,created_time,leads_count&access_token=${pageAccessToken}`
          );
          const formsData = await formsRes.json();

          if (!formsRes.ok || formsData?.error) {
            const errorMessage = formsData?.error?.message || `HTTP ${formsRes.status}`;
            console.error(`[meta-sync-lead-forms] Failed to fetch forms for page ${page.id}:`, formsData?.error || formsData);
            
            // Translate common Meta permission errors into friendly messages
            const friendlyError = friendlyMetaPermissionError(errorMessage);

            pageErrors.push({
              page_id: page.id,
              page_name: page.name,
              error: friendlyError,
            });
            continue;
          }

          const forms = formsData?.data || [];

          for (const form of forms) {
            // Upsert lead form record
            await supabase.from('meta_lead_forms').upsert({
              tenant_id: tenantId,
              page_id: page.id,
              page_name: page.name,
              form_id: form.id,
              form_name: form.name,
              status: form.status === 'ACTIVE' ? 'active' : 'paused',
              lead_count: form.leads_count || 0,
              last_sync_at: new Date().toISOString(),
            }, { onConflict: 'tenant_id,form_id' });

            allForms.push({
              form_id: form.id,
              form_name: form.name,
              page_id: page.id,
              page_name: page.name,
              status: form.status,
              leads_count: form.leads_count,
            });
          }

          // Upsert webhook subscription record
          await supabase.from('meta_webhook_subscriptions').upsert({
            tenant_id: tenantId,
            page_id: page.id,
            page_name: page.name,
          }, { onConflict: 'tenant_id,page_id' });

          // Auto-subscribe page to leadgen webhooks using the page token
          try {
            const subRes = await fetch(
              `${GRAPH}/${page.id}/subscribed_apps?subscribed_fields=leadgen&access_token=${pageAccessToken}`,
              { method: 'POST' }
            );
            const subData = await subRes.json();

            if (subRes.ok && subData.success) {
              console.log(`[meta-sync-lead-forms] Auto-subscribed page ${page.id} to leadgen webhooks`);
              await supabase.from('meta_webhook_subscriptions').upsert({
                tenant_id: tenantId,
                page_id: page.id,
                page_name: page.name,
                is_subscribed: true,
                subscribed_at: new Date().toISOString(),
              }, { onConflict: 'tenant_id,page_id' });

              await supabase.from('meta_lead_forms').update({
                is_webhook_subscribed: true,
              }).eq('tenant_id', tenantId).eq('page_id', page.id);
            } else {
              const errorMessage = subData?.error?.message || subData?.error || 'Subscription failed';
              console.warn(`[meta-sync-lead-forms] Failed to auto-subscribe page ${page.id}:`, subData?.error || subData);
              if (isMissingLeadsRetrieval(errorMessage)) {
                pageErrors.push({
                  page_id: page.id,
                  page_name: page.name,
                  error: friendlyMetaPermissionError(errorMessage),
                });
              }
            }
          } catch (subErr) {
            console.warn(`[meta-sync-lead-forms] Auto-subscribe error for page ${page.id}:`, subErr);
          }

        } catch (err) {
          console.error(`Failed to fetch forms for page ${page.id}:`, err);
          pageErrors.push({
            page_id: page.id,
            page_name: page.name,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      return json({
        pages: pages.map((p: MetaPage) => ({ id: p.id, name: p.name })),
        forms: allForms,
        errors: pageErrors,
      });
    }

    if (action === 'subscribe_all') {
      // Subscribe ALL pages that own lead forms in this workspace to leadgen webhooks
      const { data: formRows } = await supabase
        .from('meta_lead_forms')
        .select('page_id, page_name, is_webhook_subscribed')
        .eq('tenant_id', tenantId);

      const uniquePages = new Map<string, { page_id: string; page_name: string }>();
      for (const row of (formRows || [])) {
        if (row.page_id && !uniquePages.has(row.page_id)) {
          uniquePages.set(row.page_id, { page_id: row.page_id, page_name: row.page_name || 'Untitled' });
        }
      }

      // Fetch fresh page tokens from /me/accounts
      const pageTokens = new Map<string, string>();
      try {
        const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && Array.isArray(pagesData?.data)) {
          for (const p of pagesData.data) {
            if (p?.id && p?.access_token) pageTokens.set(p.id, p.access_token);
          }
        } else if (pagesData?.error) {
          return json({
            success: false,
            error: friendlyMetaPermissionError(pagesData.error.message || 'Failed to fetch pages'),
            reconnect: isMissingLeadsRetrieval(pagesData.error.message || ''),
          }, 400);
        }
      } catch (e) {
        console.error('[subscribe_all] /me/accounts error:', e);
      }

      const results: Array<{ page_id: string; page_name: string; success: boolean; error?: string }> = [];
      let succeeded = 0;
      let failed = 0;

      for (const page of uniquePages.values()) {
        const pageToken = pageTokens.get(page.page_id);
        if (!pageToken) {
          results.push({ ...page, success: false, error: 'No page access token (you may not be admin of this Page)' });
          failed++;
          continue;
        }
        try {
          const subRes = await fetch(
            `${GRAPH}/${page.page_id}/subscribed_apps?subscribed_fields=leadgen&access_token=${pageToken}`,
            { method: 'POST' }
          );
          const subData = await subRes.json();
          if (subRes.ok && subData.success) {
            await supabase.from('meta_webhook_subscriptions').upsert({
              tenant_id: tenantId,
              page_id: page.page_id,
              page_name: page.page_name,
              is_subscribed: true,
              subscribed_at: new Date().toISOString(),
            }, { onConflict: 'tenant_id,page_id' });
            await supabase.from('meta_lead_forms').update({
              is_webhook_subscribed: true,
            }).eq('tenant_id', tenantId).eq('page_id', page.page_id);
            results.push({ ...page, success: true });
            succeeded++;
          } else {
            const errorMessage = subData?.error?.message || 'Subscription failed';
            results.push({ ...page, success: false, error: friendlyMetaPermissionError(errorMessage) });
            failed++;
          }
        } catch (err) {
          results.push({ ...page, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
          failed++;
        }
      }

      return json({
        success: failed === 0,
        total: uniquePages.size,
        succeeded,
        failed,
        results,
      });
    }

    if (action === 'subscribe_webhook' && pageId) {
      // Subscribe to leadgen webhooks — MUST use a Page Access Token
      // First try fetching the page token from /me/accounts
      let pageToken: string | null = null;
      try {
        const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        if (pagesData?.data) {
          const matchedPage = pagesData.data.find((p: any) => p.id === pageId);
          if (matchedPage?.access_token) pageToken = matchedPage.access_token;
        }
      } catch (e) {
        console.warn('[meta-sync-lead-forms] Failed to fetch page token for subscribe:', e);
      }
      
      // Fallback to stored token (may not work if it's a user token)
      if (!pageToken) {
        const matchingAccount = connectedAccounts.find((account) => account.facebook_page_id === pageId);
        pageToken = matchingAccount?.meta_access_token || accessToken;
      }
      
      const subRes = await fetch(
        `${GRAPH}/${pageId}/subscribed_apps?subscribed_fields=leadgen&access_token=${pageToken}`,
        { method: 'POST' }
      );
      const subData = await subRes.json();

      if (subRes.ok && subData.success) {
        await supabase.from('meta_webhook_subscriptions').upsert({
          tenant_id: tenantId,
          page_id: pageId,
          is_subscribed: true,
          subscribed_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id,page_id' });

        await supabase.from('meta_lead_forms').update({
          is_webhook_subscribed: true,
        }).eq('tenant_id', tenantId).eq('page_id', pageId);

        return json({ success: true, message: 'Webhook subscribed' });
      } else {
        const errorMessage = subData?.error?.message || subData?.error || 'Subscription failed';
        return json({
          success: false,
          code: isMissingLeadsRetrieval(errorMessage) ? 'missing_leads_retrieval' : 'meta_subscription_failed',
          reconnect: isMissingLeadsRetrieval(errorMessage),
          error: friendlyMetaPermissionError(errorMessage),
        }, isMissingLeadsRetrieval(errorMessage) ? 200 : 400);
      }
    }

    if (action === 'verify_subscriptions') {
      // GET /{page-id}/subscribed_apps for each page that owns lead forms
      const { data: formRows } = await supabase
        .from('meta_lead_forms')
        .select('page_id, page_name')
        .eq('tenant_id', tenantId);

      const uniquePages = new Map<string, { page_id: string; page_name: string }>();
      for (const row of (formRows || [])) {
        if (row.page_id && !uniquePages.has(row.page_id)) {
          uniquePages.set(row.page_id, { page_id: row.page_id, page_name: row.page_name || 'Untitled' });
        }
      }

      // Fetch fresh page tokens
      const pageTokens = new Map<string, string>();
      try {
        const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && Array.isArray(pagesData?.data)) {
          for (const p of pagesData.data) {
            if (p?.id && p?.access_token) pageTokens.set(p.id, p.access_token);
          }
        }
      } catch (e) {
        console.error('[verify_subscriptions] /me/accounts error:', e);
      }

      const metaAppId = Deno.env.get('META_APP_ID') || '';
      const results: Array<{ page_id: string; page_name: string; subscribed: boolean; apps: any[]; error?: string }> = [];

      for (const page of uniquePages.values()) {
        const pageToken = pageTokens.get(page.page_id);
        if (!pageToken) {
          results.push({ ...page, subscribed: false, apps: [], error: 'No page access token (not an admin?)' });
          continue;
        }
        try {
          const r = await fetch(`${GRAPH}/${page.page_id}/subscribed_apps?access_token=${pageToken}`);
          const d = await r.json();
          if (!r.ok || d?.error) {
            results.push({ ...page, subscribed: false, apps: [], error: d?.error?.message || `HTTP ${r.status}` });
            continue;
          }
          const apps = Array.isArray(d?.data) ? d.data : [];
          const ourAppSubscribed = metaAppId
            ? apps.some((a: any) => String(a?.id) === String(metaAppId))
            : apps.length > 0;
          results.push({ ...page, subscribed: ourAppSubscribed, apps });

          // Reflect status in DB
          await supabase.from('meta_webhook_subscriptions').upsert({
            tenant_id: tenantId,
            page_id: page.page_id,
            page_name: page.page_name,
            is_subscribed: ourAppSubscribed,
            subscribed_at: ourAppSubscribed ? new Date().toISOString() : null,
            last_error: ourAppSubscribed ? null : 'App not installed on Page',
          }, { onConflict: 'tenant_id,page_id' });

          await supabase.from('meta_lead_forms').update({
            is_webhook_subscribed: ourAppSubscribed,
          }).eq('tenant_id', tenantId).eq('page_id', page.page_id);
        } catch (err) {
          results.push({ ...page, subscribed: false, apps: [], error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      return json({
        success: true,
        meta_app_id: metaAppId || null,
        total: uniquePages.size,
        subscribed: results.filter((r) => r.subscribed).length,
        results,
      });
    }

    if (action === 'backfill_form_leads') {
      // Pulls historical leads for one form (or all forms in tenant) from Meta Graph and
      // stores them into lead_events + smeksh_meta_ad_leads. Does NOT run lead-form rules
      // or auto-replies — avoids spamming old contacts. Existing leads are skipped (idempotent).
      const cap = Math.min(Number(maxLeads) || 1000, 5000);

      // Resolve target forms
      let formsQuery = supabase
        .from('meta_lead_forms')
        .select('form_id, form_name, page_id, page_name')
        .eq('tenant_id', tenantId);
      if (formId) formsQuery = formsQuery.eq('form_id', formId);
      const { data: targetForms } = await formsQuery;

      if (!targetForms || targetForms.length === 0) {
        return json({ success: false, error: 'No matching lead forms found' }, 404);
      }

      // Fetch fresh page tokens (one call, used for all pages)
      const pageTokens = new Map<string, string>();
      try {
        const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,access_token&access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && Array.isArray(pagesData?.data)) {
          for (const p of pagesData.data) {
            if (p?.id && p?.access_token) pageTokens.set(p.id, p.access_token);
          }
        } else if (pagesData?.error) {
          return json({
            success: false,
            error: friendlyMetaPermissionError(pagesData.error.message || 'Failed to fetch pages'),
            reconnect: isMissingLeadsRetrieval(pagesData.error.message || ''),
          }, 400);
        }
      } catch (e) {
        console.error('[backfill] /me/accounts error:', e);
        return json({ success: false, error: 'Failed to fetch Page tokens from Meta' }, 500);
      }

      // Workspace_id for smeksh_meta_ad_leads = tenantId in this codebase
      const workspaceId = tenantId;

      const summary: Array<{
        form_id: string; form_name: string; page_id: string;
        fetched: number; inserted: number; skipped: number; error?: string;
      }> = [];
      let totalInserted = 0;
      let totalFetched = 0;

      for (const form of targetForms) {
        const pageToken = pageTokens.get(form.page_id!);
        const row = {
          form_id: form.form_id!,
          form_name: form.form_name || '',
          page_id: form.page_id!,
          fetched: 0,
          inserted: 0,
          skipped: 0,
        } as any;

        if (!pageToken) {
          row.error = 'No Page Access Token (you must be admin of this Page)';
          summary.push(row);
          continue;
        }

        // Paginate /{form_id}/leads
        let next: string | null =
          `${GRAPH}/${form.form_id}/leads?fields=id,created_time,field_data,ad_id,adset_id,campaign_id,form_id&limit=100&access_token=${pageToken}`;
        let safety = 0;
        try {
          while (next && row.fetched < cap && safety < 200) {
            safety++;
            const r: Response = await fetch(next);
            const d: any = await r.json();
            if (!r.ok || d?.error) {
              row.error = friendlyMetaPermissionError(d?.error?.message || `HTTP ${r.status}`);
              break;
            }
            const leads = Array.isArray(d?.data) ? d.data : [];
            row.fetched += leads.length;
            totalFetched += leads.length;

            for (const lead of leads) {
              const leadIdStr = String(lead?.id || '');
              if (!leadIdStr) continue;

              // Idempotency: skip if we already have this lead_id for this tenant
              const { data: existing } = await supabase
                .from('lead_events')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('lead_id', leadIdStr)
                .limit(1)
                .maybeSingle();

              if (existing) {
                row.skipped++;
                continue;
              }

              // Normalize field_data into a flat object
              const normalized: Record<string, any> = {};
              for (const f of (lead?.field_data || [])) {
                const key = String(f?.name || '').toLowerCase();
                const val = Array.isArray(f?.values) ? (f.values.length === 1 ? f.values[0] : f.values) : null;
                if (key) normalized[key] = val;
              }
              normalized.created_time = lead?.created_time || null;
              normalized.ad_id = lead?.ad_id || null;
              normalized.adset_id = lead?.adset_id || null;
              normalized.campaign_id = lead?.campaign_id || null;

              // Insert lead_events row (audit trail / source of truth)
              await supabase.from('lead_events').insert({
                tenant_id: tenantId,
                form_id: form.form_id,
                lead_id: leadIdStr,
                page_id: form.page_id,
                ad_id: lead?.ad_id || null,
                raw_payload: lead,
                normalized_data: {
                  ...normalized,
                  note: 'Backfilled from Meta Graph (rules not executed)',
                },
                status: 'success',
              });

              // Try to derive a phone for ROI lead row
              const phoneCandidate =
                normalized.phone_number ||
                normalized.phone ||
                normalized.mobile ||
                normalized.whatsapp_number ||
                null;
              const phoneDigits = phoneCandidate ? String(phoneCandidate).replace(/[^\d+]/g, '') : null;

              await supabase.from('smeksh_meta_ad_leads').insert({
                workspace_id: workspaceId,
                phone_e164: phoneDigits,
                meta_lead_id: leadIdStr,
                meta_ad_id: lead?.ad_id || null,
                meta_adset_id: lead?.adset_id || null,
                meta_campaign_id: lead?.campaign_id || null,
                ad_clicked_at: lead?.created_time ? new Date(lead.created_time).toISOString() : null,
                attribution_source: 'meta_ads',
                raw_meta_data: lead,
              });

              row.inserted++;
              totalInserted++;
            }

            next = d?.paging?.next || null;
          }

          // Update the last_lead_at on the form
          if (row.inserted > 0) {
            await supabase
              .from('meta_lead_forms')
              .update({ last_lead_at: new Date().toISOString() })
              .eq('tenant_id', tenantId)
              .eq('form_id', form.form_id);
          }
        } catch (err) {
          row.error = err instanceof Error ? err.message : 'Unknown error';
        }
        summary.push(row);
      }

      return json({
        success: true,
        forms_processed: summary.length,
        total_fetched: totalFetched,
        total_inserted: totalInserted,
        results: summary,
      });
    }

    if (action === 'test_webhook') {
      // Simulate a lead submission for testing
      const testLead = {
        entry: [{
          id: pageId || 'test_page',
          changes: [{
            field: 'leadgen',
            value: {
              leadgen_id: `test_${Date.now()}`,
              form_id: 'test_form',
              page_id: pageId || 'test_page',
              created_time: Math.floor(Date.now() / 1000),
            }
          }]
        }]
      };

      // Insert test event
      await supabase.from('lead_events').insert({
        tenant_id: tenantId,
        form_id: 'test_form',
        lead_id: `test_${Date.now()}`,
        page_id: pageId || 'test_page',
        raw_payload: testLead,
        normalized_data: { note: 'Test webhook simulation (no real lead)' },
        status: 'success',
      });

      return json({ success: true, message: 'Test webhook event created' });
    }

    return json({ error: 'Unknown action' }, 400);

  } catch (err) {
    console.error('[meta-sync-lead-forms] Error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal error' }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    },
  });
}
