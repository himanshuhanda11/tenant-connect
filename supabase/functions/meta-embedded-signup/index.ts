import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, tenantId, wabaId: clientWabaId, phoneNumberId: clientPhoneId, pin } = await req.json();

    // ── get_config (public) ──────────────────────────────────────────────
    if (action === 'get_config') {
      const appId = Deno.env.get('META_APP_ID');
      const configId = Deno.env.get('META_CONFIG_ID');
      if (!appId || !configId) {
        return new Response(JSON.stringify({ error: 'Meta configuration not available' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ appId, configId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── exchange_code (authenticated) ────────────────────────────────────
    if (action === 'exchange_code') {
      if (!code || !tenantId) {
        return new Response(JSON.stringify({ error: 'Missing code or tenantId' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Auth check
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const token = authHeader.replace('Bearer ', '');
      const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        console.error('Auth failed:', claimsError?.message);
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const user = { id: claimsData.claims.sub as string };

      // Tenant membership
      const { data: membership } = await supabase
        .from('tenant_members')
        .select('role')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return new Response(JSON.stringify({ error: 'Only admins can connect WhatsApp Business accounts' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const appId = Deno.env.get('META_APP_ID')!;
      const appSecret = Deno.env.get('META_APP_SECRET')!;
      if (!appId || !appSecret) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 1. Exchange code for short-lived token
      console.log('Exchanging code for access token...');
      const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code,
      });
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error('Token exchange error:', tokenData.error);
        return new Response(JSON.stringify({ error: tokenData.error.message || 'Failed to exchange code' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let accessToken = tokenData.access_token;
      console.log('Short-lived token obtained');

      // 2. Exchange for long-lived token (60 days)
      // 2. Exchange for long-lived token (60 days)
      // Use grant_type=fb_exchange_token with set_token_expires_in_60_days
      const llUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: accessToken,
        set_token_expires_in_60_days: 'true',
      });
      const llRes = await fetch(llUrl);
      const llData = await llRes.json();
      if (llData.access_token) {
        accessToken = llData.access_token;
        console.log('Long-lived token obtained');
      } else {
        console.warn('Could not get long-lived token, continuing with short-lived');
      }

      // 3. Validate token has required messaging permission
      const appAccessToken = `${appId}|${appSecret}`;
      const debugUrl = `${GRAPH_API_BASE}/debug_token?` + new URLSearchParams({
        input_token: accessToken,
        access_token: appAccessToken,
      });
      const debugRes = await fetch(debugUrl);
      const debugData = await debugRes.json();
      const grantedScopes = debugData.data?.scopes || [];
      const granularScopes = debugData.data?.granular_scopes || [];
      console.log('Token scopes:', grantedScopes);
      console.log('Token granular_scopes:', JSON.stringify(granularScopes));

      const hasMessagingPerm = grantedScopes.includes('whatsapp_business_messaging') ||
        granularScopes.some((s: any) => s.scope === 'whatsapp_business_messaging');

      if (!hasMessagingPerm) {
        console.error('Token missing whatsapp_business_messaging permission');
        return new Response(JSON.stringify({
          error: 'Missing messaging permission. The token does not include "whatsapp_business_messaging". Please ensure your Meta App has this permission in Advanced Access, then reconnect.',
          code: 'MISSING_MESSAGING_PERMISSION',
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Determine WABA IDs — prefer client-provided, fall back to debug_token
      let wabaIds: string[] = clientWabaId ? [clientWabaId] : [];

      if (wabaIds.length === 0) {
        console.log('No client WABA ID, using granular_scopes from debug...');
        const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');
        wabaIds = wabaScope?.target_ids || [];
        console.log('WABA IDs from debug_token:', wabaIds);
      }

      if (wabaIds.length === 0) {
        return new Response(JSON.stringify({ error: 'No WhatsApp Business Account found in response' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Process only the primary WABA and the single selected phone number
      const primaryWabaId = wabaIds[0];
      let connectedPhoneId: string | null = null;

      // Fetch WABA details
      const wabaRes = await fetch(
        `${GRAPH_API_BASE}/${primaryWabaId}?fields=id,name,currency,timezone_id,owner_business_info`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const wabaData = await wabaRes.json();
      if (wabaData.error) {
        console.error('WABA fetch error:', wabaData.error);
        return new Response(JSON.stringify({ error: 'Failed to fetch WABA details' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const businessId = wabaData.owner_business_info?.id || 'unknown';

      // Upsert WABA account
      const { data: existingWaba } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('waba_id', primaryWabaId)
        .maybeSingle();

      let wabaAccountId: string;
      if (existingWaba) {
        await supabase.from('waba_accounts').update({
          encrypted_access_token: accessToken,
          status: 'active',
          name: wabaData.name,
          business_id: businessId,
          updated_at: new Date().toISOString(),
        }).eq('id', existingWaba.id);
        wabaAccountId = existingWaba.id;
        console.log('Updated WABA:', wabaAccountId);
      } else {
        const { data: newWaba, error: insertErr } = await supabase.from('waba_accounts').insert({
          tenant_id: tenantId,
          waba_id: primaryWabaId,
          business_id: businessId,
          name: wabaData.name,
          encrypted_access_token: accessToken,
          status: 'active',
        }).select().single();
        if (insertErr) {
          console.error('WABA insert error:', insertErr);
          return new Response(JSON.stringify({ error: 'Failed to save WABA account' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        wabaAccountId = newWaba.id;
        console.log('Created WABA:', wabaAccountId);
      }

      // Only connect the single phone number selected in the popup
      if (clientPhoneId) {
        console.log('Connecting single phone:', clientPhoneId);

        // ── Enforce 1 phone per workspace ──
        // IMPORTANT: Do NOT delete existing phones until the new one is successfully saved.
        // Otherwise transient Meta API errors can leave the workspace with zero phones.
        const cleanupOtherPhones = async (keepPhoneDbId: string) => {
          try {
            await supabase
              .from('phone_numbers')
              .delete()
              .eq('tenant_id', tenantId)
              .neq('id', keepPhoneDbId);
          } catch (e) {
            console.warn('Failed to cleanup other phones (non-blocking):', e);
          }
        };

        const phoneRes = await fetch(
          `${GRAPH_API_BASE}/${clientPhoneId}?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const phoneData = await phoneRes.json();
        if (phoneData.error) {
          console.error('Phone fetch error:', phoneData.error);
          return new Response(JSON.stringify({ error: 'Failed to fetch phone number details from Meta' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const qualityRating = mapQuality(phoneData.quality_rating);
          const messagingLimit = mapMessagingLimit(phoneData.messaging_limit_tier);

          const { data: newPhone, error: phoneErr } = await supabase.from('phone_numbers').insert({
            tenant_id: tenantId,
            waba_account_id: wabaAccountId,
            phone_number_id: clientPhoneId,
            display_number: phoneData.display_phone_number,
            verified_name: phoneData.verified_name,
            quality_rating: qualityRating,
            messaging_limit: messagingLimit,
            status: 'connected',
          }).select().single();

          if (phoneErr) {
            console.error('Phone insert error:', phoneErr);
            return new Response(JSON.stringify({ error: 'Failed to save phone number' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          connectedPhoneId = newPhone.id;
          // Now that the new phone is saved, cleanup any previous phone records for this tenant.
          await cleanupOtherPhones(connectedPhoneId);

          // ── Register phone with Cloud API for messaging ──
          // Uses the user-provided 2-step verification PIN (defaults to 000000 if not set)
          const registrationPin = pin || '000000';
          try {
            const regRes = await fetch(`${GRAPH_API_BASE}/${clientPhoneId}/register`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messaging_product: 'whatsapp', pin: registrationPin }),
            });
            const regData = await regRes.json();
            console.log('Phone register result:', JSON.stringify(regData));
            if (regData.error) {
              console.warn('Phone registration warning:', regData.error.message);
              // If PIN mismatch, mark as needing re-registration but don't block connection
              if (regData.error.code === 133005) {
                console.warn('Two-step PIN mismatch. Phone connected but may need re-registration with correct PIN.');
              }
            }
          } catch (regErr) {
            console.warn('Phone registration attempt failed:', regErr);
          }

          // ── Verify token can send by checking phone messaging capability ──
          try {
            const capRes = await fetch(
              `${GRAPH_API_BASE}/${clientPhoneId}?fields=id,is_official_business_account,messaging_product,register_status`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const capData = await capRes.json();
            console.log('Phone capabilities:', JSON.stringify(capData));
          } catch (capErr) {
            console.warn('Capability check failed:', capErr);
          }
        }
      } else {
        console.warn('No phone_number_id from client, skipping phone connection');
      }

      // Auto-subscribe to webhooks
      try {
        const subRes = await fetch(`${GRAPH_API_BASE}/${primaryWabaId}/subscribed_apps`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const subData = await subRes.json();
        console.log('Webhook subscription:', subData.success ? 'OK' : 'FAILED');
      } catch (e) {
        console.error('Webhook subscription error:', e);
      }

      console.log('Embedded signup complete. Phone connected:', connectedPhoneId);

      return new Response(JSON.stringify({
        success: true,
        wabaId: primaryWabaId,
        wabaAccountId: wabaAccountId,
        phoneNumberId: connectedPhoneId,
        phoneCount: connectedPhoneId ? 1 : 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Embedded signup error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────
function mapQuality(rating?: string): string {
  if (!rating) return 'UNKNOWN';
  const r = rating.toUpperCase();
  if (['GREEN', 'YELLOW', 'RED'].includes(r)) return r;
  return 'UNKNOWN';
}

function mapMessagingLimit(tier?: string): string {
  if (!tier) return 'TIER_1K';
  const t = tier.toUpperCase();
  if (t.includes('1K')) return 'TIER_1K';
  if (t.includes('10K')) return 'TIER_10K';
  if (t.includes('100K')) return 'TIER_100K';
  if (t.includes('UNLIMITED')) return 'TIER_UNLIMITED';
  return 'TIER_1K';
}
