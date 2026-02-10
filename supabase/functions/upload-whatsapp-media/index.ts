import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const tenantId = formData.get('tenant_id') as string | null;
    const contactWaId = formData.get('contact_wa_id') as string | null;
    const conversationId = formData.get('conversation_id') as string | null;
    const caption = formData.get('caption') as string | null;

    if (!file || !tenantId) {
      return new Response(JSON.stringify({ error: 'file and tenant_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Uploading media:', { tenantId, contactWaId, fileName: file.name, mimeType: file.type, size: file.size });

    // Verify tenant membership
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Access denied - not a tenant member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/3gpp',
      'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: `File type ${file.type} not allowed` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File size exceeds 50MB limit' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate file path
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const contactFolder = contactWaId ? contactWaId.replace(/[^0-9]/g, '') : 'general';
    const filePath = `${tenantId}/${contactFolder}/${timestamp}-${safeFileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wa-media')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload file: ' + uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate signed URL (7 days expiry - long enough for WhatsApp to download)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('wa-media')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return new Response(JSON.stringify({ error: 'Failed to generate signed URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine media type for WhatsApp
    let mediaType = 'document';
    if (file.type.startsWith('image/')) mediaType = 'image';
    else if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';

    console.log('Upload successful:', { filePath, mediaType });

    const mediaUrl = signedUrlData.signedUrl;

    // If conversation_id provided, send the message directly (combined upload+send)
    if (conversationId) {
      try {
        // Get conversation with phone number and contact
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            phone_number:phone_numbers!inner(
              id, phone_number_id, status,
              waba_account:waba_accounts!inner(id, encrypted_access_token)
            ),
            contact:contacts!inner(wa_id)
          `)
          .eq('id', conversationId)
          .single();

        if (convError || !conversation) {
          console.error('Conversation not found for send:', convError);
          return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: false, error: 'Conversation not found' }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const phoneNumber = conversation.phone_number;

        if (phoneNumber.status === 'disconnected') {
          return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: false, error: 'Phone number is disconnected' }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const accessToken = phoneNumber.waba_account.encrypted_access_token;

        // Build WhatsApp API payload
        const messagePayload: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: conversation.contact.wa_id,
          type: mediaType,
          [mediaType]: { link: mediaUrl },
        };
        if (caption) messagePayload[mediaType].caption = caption;

        // Insert message in DB
        const { data: dbMsg, error: msgErr } = await supabase
          .from('messages')
          .insert({
            tenant_id: conversation.tenant_id,
            conversation_id: conversationId,
            direction: 'outbound',
            type: mediaType,
            text: caption || null,
            media_url: mediaUrl,
            media_bucket: 'wa-media',
            media_path: filePath,
            media_filename: file.name,
            media_size_bytes: file.size,
            media_mime_type: file.type,
            status: 'pending',
          })
          .select()
          .single();

        if (msgErr) {
          console.error('Failed to create message:', msgErr);
          return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: false, error: 'DB insert failed' }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Send to WhatsApp API
        const waResponse = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumber.phone_number_id}/messages`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload),
          }
        );
        const waResult = await waResponse.json();

        if (!waResponse.ok) {
          await supabase.from('messages').update({
            status: 'failed', error_code: waResult.error?.code?.toString(), error_message: waResult.error?.message,
          }).eq('id', dbMsg.id);
          return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: false, error: waResult.error?.message }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const wamid = waResult.messages?.[0]?.id;
        await supabase.from('messages').update({ wamid, status: 'sent' }).eq('id', dbMsg.id);
        const preview = caption ? `📎 ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}: ${caption}` : `📎 ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`;
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: preview }).eq('id', conversationId);

        console.log('Media uploaded and sent:', { mediaType, wamid });
        return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: true, message_id: dbMsg.id, wamid }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (sendErr: any) {
        console.error('Send after upload error:', sendErr);
        return new Response(JSON.stringify({ ok: true, url: mediaUrl, mediaType, sent: false, error: sendErr.message }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      url: mediaUrl,
      path: filePath,
      mimeType: file.type,
      mediaType,
      size: file.size,
      fileName: file.name,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in upload-whatsapp-media:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
