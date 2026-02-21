import { getAdminClient, getUserClient, corsHeaders, json } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the user's own token to verify identity (compatible with ES256 / Lovable Cloud)
    const userClient = getUserClient(req);
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Invalid token' }, 401);
    }

    const supabase = getAdminClient();

    const { accessToken, tenantId } = await req.json();

    if (!accessToken || !tenantId) {
      return json({ error: 'Missing accessToken or tenantId' }, 400);
    }

    // Verify tenant membership
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Only admins can connect Meta Ads' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');

    if (!appId || !appSecret) {
      return new Response(JSON.stringify({ error: 'Meta configuration not available' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange short-lived token for long-lived token
    const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
      console.error('Token exchange error:', exchangeData.error);
      return new Response(JSON.stringify({ error: `Token exchange failed: ${exchangeData.error.message}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const longLivedToken = exchangeData.access_token;

    // Fetch permissions, ad accounts, pages, businesses in parallel
    const [permsRes, adAccountsRes, pagesRes, businessesRes] = await Promise.all([
      fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${longLivedToken}`),
      fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${longLivedToken}`),
      fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${longLivedToken}`),
      fetch(`https://graph.facebook.com/v21.0/me/businesses?fields=id,name&access_token=${longLivedToken}`),
    ]);

    const [permsData, adAccountsData, pagesData, businessesData] = await Promise.all([
      permsRes.json(),
      adAccountsRes.json(),
      pagesRes.json(),
      businessesRes.json(),
    ]);

    console.log('Granted permissions:', JSON.stringify(permsData.data || []));

    if (adAccountsData.error) {
      console.error('Ad accounts fetch error:', adAccountsData.error);
      console.log('Continuing without ad accounts due to permission error');
    }

    if (pagesData.error) {
      console.error('Pages fetch error:', pagesData.error);
      return new Response(JSON.stringify({ error: `Failed to fetch pages: ${pagesData.error.message}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract Instagram accounts from pages
    const instagramAccounts: any[] = [];
    for (const page of (pagesData.data || [])) {
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        instagramAccounts.push({
          id: ig.id,
          username: ig.username || '',
          name: ig.name || '',
          profilePictureUrl: ig.profile_picture_url || '',
          linkedPageId: page.id,
          linkedPageName: page.name,
        });
      }
    }

    // Extract businesses
    const businesses = (businessesData.data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
    }));

    if (businessesData.error) {
      console.error('Businesses fetch error:', businessesData.error);
      // Non-fatal, continue
    }

    console.log(`FB Login: fetched ${adAccountsData.data?.length || 0} ad accounts, ${pagesData.data?.length || 0} pages, ${instagramAccounts.length} IG accounts, ${businesses.length} businesses for tenant ${tenantId}`);

    return new Response(JSON.stringify({
      longLivedToken,
      adAccounts: (adAccountsData.data || []).map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        status: acc.account_status,
        currency: acc.currency,
        timezone: acc.timezone_name,
      })),
      pages: (pagesData.data || []).map((page: any) => ({
        id: page.id,
        name: page.name,
        category: page.category,
        accessToken: page.access_token,
      })),
      instagramAccounts,
      businesses,
      permissions: permsData.data || [],
      adAccountsError: adAccountsData.error?.message || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('meta-ads-fb-login error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
