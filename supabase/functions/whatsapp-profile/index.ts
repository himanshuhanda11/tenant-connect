import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

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
        return new Response(JSON.stringify({ 
          error: 'Failed to set profile picture',
          details: profileData.error?.message || JSON.stringify(profileData)
        }), {
          status: profileRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
        error: 'WABA account not found or no access token',
        details: wabaError?.message 
      }), {
        status: 404,
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
      
      if (profile_data.about) updatePayload.about = profile_data.about;
      if (profile_data.address) updatePayload.address = profile_data.address;
      if (profile_data.description) updatePayload.description = profile_data.description;
      if (profile_data.email) updatePayload.email = profile_data.email;
      if (profile_data.websites && profile_data.websites.length > 0) {
        updatePayload.websites = profile_data.websites.filter((w: string) => w.trim());
      }
      if (profile_data.vertical) updatePayload.vertical = profile_data.vertical;

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
        return new Response(JSON.stringify({ 
          error: 'Failed to update profile',
          details: data.error?.message || 'Unknown error'
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Profile updated successfully' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "get" or "update"' }), {
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
