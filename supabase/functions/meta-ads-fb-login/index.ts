import { getAdminClient, getUserClient, corsHeaders, json } from '../_shared/supabase.ts';
import { requirePlanAccess } from '../_shared/planAccess.ts';
import { diagnoseMetaConnection, type GraphError } from '../_shared/metaAdsDiagnosis.ts';

// Facebook connection for a workspace.
// Actions:
//   discover — exchange the customer's short-lived login token, keep it server-side, return assets + diagnosis
//   refresh  — re-check the workspace's saved connection (token never leaves the server)
//   save     — store the admin's chosen ad account / Page, validated against what this login can access
// Tokens (user and Page) are never returned to the browser or logged.

const GRAPH = 'https://graph.facebook.com/v21.0';
const MAX_PAGES = 5;

type Admin = ReturnType<typeof getAdminClient>;

async function graphGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(path.startsWith('http') ? path : `${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (token && !url.searchParams.has('access_token')) url.searchParams.set('access_token', token);
  try {
    const res = await fetch(url.toString());
    return await res.json();
  } catch (e) {
    return { error: { message: (e as Error).message || 'Network error' } };
  }
}

async function graphList(path: string, token: string, params: Record<string, string>) {
  const items: any[] = [];
  let data = await graphGet(path, token, { limit: '100', ...params });
  let error: GraphError | null = data?.error || null;
  let pages = 0;
  while (!error && Array.isArray(data?.data)) {
    items.push(...data.data);
    pages++;
    const next = data?.paging?.next;
    if (!next || pages >= MAX_PAGES) break;
    data = await graphGet(next, token); // next already carries the token
    error = data?.error || null;
  }
  return { items, error };
}

async function inspectToken(_admin: Admin, token: string, appId: string, appSecret: string) {
  const appToken = `${appId}|${appSecret}`;
  const [debug, perms, appPerms, me, adAccounts, pages, businesses] = await Promise.all([
    graphGet('debug_token', appToken, { input_token: token }),
    graphGet('me/permissions', token),
    graphGet(`${appId}/permissions`, appToken),
    graphGet('me', token, { fields: 'id,name' }),
    graphList('me/adaccounts', token, { fields: 'id,name,account_status,currency,timezone_name,business{id,name}' }),
    graphList('me/accounts', token, { fields: 'id,name,category,instagram_business_account{id,username,name,profile_picture_url}' }),
    graphList('me/businesses', token, { fields: 'id,name' }),
  ]);

  const tokenData = debug?.data || {};
  const tokenFromOtherApp = tokenData.app_id && String(tokenData.app_id) !== String(appId);
  const tokenValid = debug?.error ? null : tokenFromOtherApp ? false : tokenData.is_valid ?? null;
  const userPermissions = Array.isArray(perms?.data) ? perms.data : [];
  const appLivePermissions = Array.isArray(appPerms?.data)
    ? appPerms.data.filter((p: any) => p.status === 'live').map((p: any) => p.permission)
    : null;

  const instagramAccounts = pages.items
    .filter((p: any) => p.instagram_business_account)
    .map((p: any) => ({
      id: p.instagram_business_account.id,
      username: p.instagram_business_account.username || '',
      name: p.instagram_business_account.name || '',
      profilePictureUrl: p.instagram_business_account.profile_picture_url || '',
      linkedPageId: p.id,
      linkedPageName: p.name,
    }));

  const diagnosis = diagnoseMetaConnection({
    tokenValid,
    tokenError: perms?.error || me?.error || null,
    userPermissions,
    appLivePermissions,
    adAccounts: { count: adAccounts.items.length, error: adAccounts.error },
    pagesCount: pages.items.length,
  });

  // Safe server log: no tokens, only counts and codes
  console.log(`[meta-ads-fb-login] diagnosis=${diagnosis.code} adAccounts=${adAccounts.items.length} pages=${pages.items.length} missing=${diagnosis.missingPermissions.join('|') || '-'} appApprovalKnown=${appLivePermissions !== null}`);

  return {
    tokenFromOtherApp,
    expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : null,
    metaUser: { id: me?.id || tokenData.user_id || null, name: me?.name || null },
    grantedScopes: userPermissions.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) as string[],
    permissions: userPermissions,
    adAccounts: adAccounts.items.map((a: any) => ({
      id: a.id, name: a.name, status: a.account_status, currency: a.currency, timezone: a.timezone_name,
      businessId: a.business?.id || null, businessName: a.business?.name || null,
    })),
    pages: pages.items.map((p: any) => ({ id: p.id, name: p.name, category: p.category })),
    instagramAccounts,
    businesses: businesses.items.map((b: any) => ({ id: b.id, name: b.name })),
    diagnosis,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const userClient = getUserClient(req);
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'Invalid token' }, 401);

    const body = await req.json().catch(() => ({}));
    const tenantId = typeof body?.tenantId === 'string' ? body.tenantId : '';
    const action: string = body?.action || (body?.accessToken ? 'discover' : '');
    if (!/^[0-9a-f-]{36}$/i.test(tenantId)) return json({ error: 'Missing or invalid tenantId' }, 400);
    if (!['discover', 'refresh', 'save'].includes(action)) return json({ error: 'Unknown action' }, 400);

    const admin = getAdminClient();
    const { data: membership } = await admin
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).maybeSingle();
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return json({ error: 'Only workspace owners and admins can manage the Facebook connection' }, 403);
    }

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');
    if (!appId || !appSecret) return json({ error: 'Meta configuration not available' }, 500);

    // ---------- DISCOVER ----------
    if (action === 'discover') {
      const gate = await requirePlanAccess(tenantId, 'create_meta_ad_account', req);
      if (!gate.ok) return gate.res;

      const shortToken = typeof body.accessToken === 'string' ? body.accessToken.trim() : '';
      if (!shortToken || shortToken.length > 1000) return json({ error: 'Missing Facebook login token' }, 400);

      // Exchange only succeeds for tokens issued to Aireatro's own Meta app
      const exchange = await graphGet('oauth/access_token', '', {
        grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken,
      });
      if (exchange?.error || !exchange?.access_token) {
        console.error('[meta-ads-fb-login] token exchange failed:', exchange?.error?.code, exchange?.error?.message);
        return json({ error: `Facebook login could not be verified: ${exchange?.error?.message || 'unknown error'}. Please sign in again.` }, 400);
      }
      const longToken: string = exchange.access_token;
      const info = await inspectToken(admin, longToken, appId, appSecret);
      if (info.tokenFromOtherApp) return json({ error: 'This Facebook token was not issued for Aireatro.' }, 400);
      const expiresAt = info.expiresAt || (exchange.expires_in ? new Date(Date.now() + exchange.expires_in * 1000).toISOString() : null);

      await admin.from('meta_oauth_pending').delete().lt('expires_at', new Date().toISOString());
      await admin.from('meta_oauth_pending').delete().eq('tenant_id', tenantId).eq('user_id', user.id);
      const { data: pending, error: pendErr } = await admin.from('meta_oauth_pending').insert({
        tenant_id: tenantId,
        user_id: user.id,
        access_token: longToken,
        token_expires_at: expiresAt,
        meta_user_id: info.metaUser.id,
        meta_user_name: info.metaUser.name,
        granted_scopes: info.grantedScopes,
        ad_account_ids: info.adAccounts.map((a) => a.id),
        page_ids: info.pages.map((p) => p.id),
        instagram_ids: info.instagramAccounts.map((i) => i.id),
        business_ids: info.businesses.map((b) => b.id),
      }).select('id').single();
      if (pendErr) throw pendErr;

      // Reconnect: refresh the saved connection's login + permissions in place (assets unchanged)
      let reauthorized = false;
      if (body.applyToExisting === true && info.diagnosis.code !== 'token_invalid') {
        const { data: updated } = await admin.from('smeksh_meta_ad_accounts')
          .update({
            meta_access_token: longToken,
            token_expires_at: expiresAt,
            scopes_granted: info.grantedScopes,
            meta_user_id: info.metaUser.id,
            meta_user_name: info.metaUser.name,
            status: 'connected',
            sync_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('workspace_id', tenantId).eq('is_active', true)
          .select('id');
        reauthorized = (updated?.length || 0) > 0;
      }

      return json({ pendingId: pending.id, reauthorized, ...stripInternal(info) });
    }

    // ---------- REFRESH ----------
    if (action === 'refresh') {
      const { data: account } = await admin.from('smeksh_meta_ad_accounts')
        .select('id, meta_access_token')
        .eq('workspace_id', tenantId).eq('is_active', true)
        .not('meta_access_token', 'is', null)
        .order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (!account?.meta_access_token) return json({ error: 'No saved Facebook login for this workspace. Please connect Facebook.' }, 404);

      const info = await inspectToken(admin, account.meta_access_token, appId, appSecret);
      await admin.from('smeksh_meta_ad_accounts').update({
        scopes_granted: info.grantedScopes,
        ...(info.expiresAt ? { token_expires_at: info.expiresAt } : {}),
        ...(info.diagnosis.code === 'token_invalid' ? { status: 'expired', sync_error: info.diagnosis.message } : {}),
        updated_at: new Date().toISOString(),
      }).eq('id', account.id).eq('workspace_id', tenantId);

      return json(stripInternal(info));
    }

    // ---------- SAVE ----------
    const sel = body?.selection || {};
    const str = (v: unknown, max = 200) => (typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : null);
    const pendingId = str(body.pendingId, 64);
    const adAccountId = str(sel.adAccountId, 40);
    if (!pendingId) return json({ error: 'Your Facebook login session expired. Please click Continue with Facebook again.' }, 400);
    if (!adAccountId || !/^act_\d{3,30}$/.test(adAccountId)) return json({ error: 'Choose a valid ad account (format act_123456789).' }, 400);

    const { data: pending } = await admin.from('meta_oauth_pending')
      .select('*').eq('id', pendingId).eq('tenant_id', tenantId).eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString()).maybeSingle();
    if (!pending) return json({ error: 'Your Facebook login session expired. Please click Continue with Facebook again.' }, 400);

    if (pending.ad_account_ids.length > 0 && !pending.ad_account_ids.includes(adAccountId)) {
      return json({ error: 'That ad account is not accessible with this Facebook login.' }, 400);
    }
    const pageId = str(sel.pageId, 40);
    if (pageId && !pending.page_ids.includes(pageId)) {
      return json({ error: 'That Facebook Page is not managed by this Facebook login. Pick one of the listed Pages.' }, 400);
    }
    const igId = str(sel.instagramAccountId, 40);
    if (igId && !pending.instagram_ids.includes(igId)) return json({ error: 'That Instagram account is not linked to your Pages.' }, 400);
    const businessId = str(sel.businessId, 40);
    if (businessId && pending.business_ids.length > 0 && !pending.business_ids.includes(businessId)) {
      return json({ error: 'That business is not accessible with this Facebook login.' }, 400);
    }
    const phoneNumberId = str(sel.phoneNumberId, 64);
    if (phoneNumberId) {
      const { data: phone } = await admin.from('phone_numbers').select('id').eq('id', phoneNumberId).eq('tenant_id', tenantId).maybeSingle();
      if (!phone) return json({ error: 'That WhatsApp number does not belong to this workspace.' }, 400);
    }

    const { error: upsertErr } = await admin.from('smeksh_meta_ad_accounts').upsert({
      workspace_id: tenantId,
      meta_account_id: adAccountId,
      meta_account_name: str(sel.adAccountName),
      facebook_page_id: pageId,
      facebook_page_name: pageId ? str(sel.pageName) : null,
      whatsapp_phone_number_id: phoneNumberId,
      whatsapp_display_number: phoneNumberId ? str(sel.phoneDisplay, 40) : null,
      instagram_account_id: igId,
      instagram_username: igId ? str(sel.instagramUsername) : null,
      pixel_id: str(sel.pixelId, 40),
      pixel_name: str(sel.pixelName),
      business_id: businessId,
      business_name: businessId ? str(sel.businessName) : null,
      meta_access_token: pending.access_token,
      token_expires_at: pending.token_expires_at,
      meta_user_id: pending.meta_user_id,
      meta_user_name: pending.meta_user_name,
      scopes_granted: pending.granted_scopes,
      status: 'connected',
      is_active: true,
      sync_error: null,
      connected_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,meta_account_id' });
    if (upsertErr) throw upsertErr;

    await admin.from('meta_oauth_pending').delete().eq('id', pending.id);
    return json({ success: true });
  } catch (error: any) {
    console.error('[meta-ads-fb-login] error:', error?.message || error);
    return json({ error: error?.message || 'Internal server error' }, 500);
  }
});

function stripInternal(info: Awaited<ReturnType<typeof inspectToken>>) {
  const { tokenFromOtherApp: _a, expiresAt, metaUser, grantedScopes: _g, ...rest } = info;
  return {
    ...rest,
    tokenExpiresAt: expiresAt,
    metaUserName: metaUser.name,
    adAccountsError: info.diagnosis.code === 'ok' ? null : info.diagnosis.message,
  };
}
