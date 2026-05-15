import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const metaErrorResponse = (fallbackError: string, data: any, action: string) => {
  const metaMessage = data?.error?.message || 'Unknown error';
  const metaCode = data?.error?.code;
  const isPermissionError = metaCode === 200 || /permission/i.test(metaMessage);

  return jsonResponse({
    success: false,
    error: isPermissionError
      ? 'Meta rejected this WhatsApp profile update because the connected number is missing profile update permission. Please reconnect this number from WhatsApp setup, then try again.'
      : fallbackError,
    code: isPermissionError ? 'meta_permission_required' : 'meta_api_error',
    details: metaMessage,
    action,
  });
};

const normalizeText = (value: unknown) => String(value ?? '').trim();

const normalizeWebsites = (value: unknown) => Array.isArray(value)
  ? value.map((site) => normalizeText(site)).filter(Boolean)
  : [];

const profileMatchesRequested = (currentProfile: any, requestedProfile: Record<string, any>) => {
  const textFields = ['about', 'address', 'description', 'email', 'vertical'];

  for (const field of textFields) {
    if (Object.prototype.hasOwnProperty.call(requestedProfile, field)) {
      if (normalizeText(currentProfile?.[field]) !== normalizeText(requestedProfile[field])) {
        return false;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestedProfile, 'websites')) {
    const currentWebsites = normalizeWebsites(currentProfile?.websites);
    const requestedWebsites = normalizeWebsites(requestedProfile.websites);
    if (currentWebsites.length !== requestedWebsites.length) return false;
    return currentWebsites.every((site, index) => site === requestedWebsites[index]);
  }

  return true;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const contentType = req.headers.get('content-type') || '';

    // Handle multipart form data for profile picture upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const phone_number_id = formData.get('phone_number_id') as string;
      const waba_account_id = formData.get('waba_account_id') as string;

      if (!file || !phone_number_id || !waba_account_id) {
        return new Response(JSON.stringify({ error: 'file, phone_number_id, and waba_account_id are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get access token
      const { data: wabaAccount, error: wabaError } = await supabase
        .from('waba_accounts')
        .select('encrypted_access_token, waba_id')
        .eq('id', waba_account_id)
        .single();

      if (wabaError || !wabaAccount?.encrypted_access_token) {
        return new Response(JSON.stringify({ error: 'WABA account not found or no access token' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const accessToken = wabaAccount.encrypted_access_token;
      const fileBytes = await file.arrayBuffer();
      const fileSize = fileBytes.byteLength;
      const mimeType = file.type || 'image/jpeg';

      console.log('Profile picture upload:', { phone_number_id, fileSize, mimeType });

      // Step 1: Create upload session
      const appId = Deno.env.get('META_APP_ID');
      if (!appId) {
        return new Response(JSON.stringify({ error: 'META_APP_ID not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sessionRes = await fetch(
        `${WHATSAPP_API_BASE}/${appId}/uploads?file_length=${fileSize}&file_type=${encodeURIComponent(mimeType)}&access_token=${accessToken}`,
        { method: 'POST' }
      );
      const sessionData = await sessionRes.json();
      console.log('Upload session response:', JSON.stringify(sessionData));

      if (!sessionRes.ok || !sessionData.id) {
        return new Response(JSON.stringify({ 
          error: 'Failed to create upload session',
          details: sessionData.error?.message || JSON.stringify(sessionData)
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const uploadSessionId = sessionData.id;

      // Step 2: Upload file data
      const uploadRes = await fetch(
        `${WHATSAPP_API_BASE}/${uploadSessionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${accessToken}`,
            'file_offset': '0',
            'Content-Type': mimeType,
          },
          body: new Uint8Array(fileBytes),
        }
      );
      const uploadData = await uploadRes.json();
      console.log('File upload response:', JSON.stringify(uploadData));

      if (!uploadRes.ok || !uploadData.h) {
        return new Response(JSON.stringify({ 
          error: 'Failed to upload file',
          details: uploadData.error?.message || JSON.stringify(uploadData)
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileHandle = uploadData.h;

      // Step 3: Update profile with the handle
      const profileRes = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            profile_picture_handle: fileHandle,
          }),
        }
      );
      const profileData = await profileRes.json();
      console.log('Profile picture update response:', JSON.stringify(profileData));

      if (!profileRes.ok) {
        return metaErrorResponse('Failed to set profile picture', profileData, 'upload_picture');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Profile picture updated successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle JSON requests (get/update profile)
    const body = await req.json();
    const { action, phone_number_id, waba_account_id, profile_data } = body;

    console.log('WhatsApp Profile action:', { action, phone_number_id, waba_account_id });

    if (!phone_number_id || !waba_account_id) {
      return new Response(JSON.stringify({ error: 'phone_number_id and waba_account_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get WABA account to retrieve access token
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('encrypted_access_token')
      .eq('id', waba_account_id)
      .single();

    if (wabaError || !wabaAccount?.encrypted_access_token) {
      return new Response(JSON.stringify({ 
        error: 'WhatsApp connection needs to be re-authorized. Please reconnect this number via WhatsApp setup.',
        code: 'reconnect_required',
        details: wabaError?.message 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = wabaAccount.encrypted_access_token;

    if (action === 'get') {
      const response = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      const data = await response.json();
      console.log('Profile GET response:', JSON.stringify(data));

      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch profile',
          details: data.error?.message || 'Unknown error'
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        profile: data.data?.[0] || {} 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'update') {
      if (!profile_data) {
        return new Response(JSON.stringify({ error: 'profile_data is required for update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updatePayload: Record<string, any> = { messaging_product: 'whatsapp' };
      
      if (profile_data.about !== undefined) updatePayload.about = normalizeText(profile_data.about);
      if (profile_data.address !== undefined) updatePayload.address = normalizeText(profile_data.address);
      if (profile_data.description !== undefined) updatePayload.description = normalizeText(profile_data.description);
      if (profile_data.email !== undefined) updatePayload.email = normalizeText(profile_data.email);
      if (profile_data.websites && profile_data.websites.length > 0) {
        updatePayload.websites = profile_data.websites.filter((w: string) => w.trim());
      }
      if (profile_data.vertical !== undefined) updatePayload.vertical = normalizeText(profile_data.vertical);

      console.log('Profile UPDATE payload:', JSON.stringify(updatePayload));

      const response = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        }
      );

      const data = await response.json();
      console.log('Profile UPDATE response:', JSON.stringify(data));

      if (!response.ok) {
        const isPermissionError = data?.error?.code === 200 || /permission/i.test(data?.error?.message || '');
        if (isPermissionError) {
          const verifyRes = await fetch(
            `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile?fields=about,address,description,email,websites,vertical`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const verifyData = await verifyRes.json();
          const currentProfile = verifyData?.data?.[0] || {};

          if (verifyRes.ok && profileMatchesRequested(currentProfile, updatePayload)) {
            console.log('Meta returned permission error, but profile already matches requested values. Treating as success.');
            return new Response(JSON.stringify({ 
              success: true,
              already_synced: true,
              message: 'Profile already matches the requested details'
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        return metaErrorResponse('Failed to update profile', data, 'update');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Profile updated successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_ice_breakers') {
      // Fetch current ice breakers from WhatsApp Business Profile
      const response = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile?fields=ice_breakers`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      const data = await response.json();
      console.log('Ice breakers GET response:', JSON.stringify(data));

      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch ice breakers',
          details: data.error?.message || 'Unknown error'
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const profile = data.data?.[0] || {};
      return new Response(JSON.stringify({ 
        success: true, 
        ice_breakers: profile.ice_breakers || [] 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'set_ice_breakers') {
      // Set ice breakers on WhatsApp Business Profile
      const { ice_breakers } = body;
      
      if (!Array.isArray(ice_breakers)) {
        return new Response(JSON.stringify({ error: 'ice_breakers array is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // WhatsApp allows up to 4 ice breakers
      if (ice_breakers.length > 4) {
        return new Response(JSON.stringify({ error: 'Maximum 4 ice breakers allowed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = {
        messaging_product: 'whatsapp',
        ice_breakers: ice_breakers.map((ib: { title: string; message: string }) => ({
          call_to_actions: [{
            type: 'TEXT',
            title: ib.title,
            // The message the user sends when tapping
          }],
          // Simplified format - title is what user sees, message is auto-reply context
        })),
      };

      // Use the simpler ice_breakers format
      const simplePayload = {
        messaging_product: 'whatsapp',
        ice_breakers: ice_breakers.map((ib: { title: string }) => ib.title),
      };

      console.log('Ice breakers SET payload:', JSON.stringify(simplePayload));

      const response = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simplePayload)
        }
      );

      const data = await response.json();
      console.log('Ice breakers SET response:', JSON.stringify(data));

      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: 'Failed to set ice breakers',
          details: data.error?.message || 'Unknown error'
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Ice breakers updated on Meta successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "get", "update", "get_ice_breakers", or "set_ice_breakers"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Error in whatsapp-profile:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
