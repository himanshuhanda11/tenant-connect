import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    header_text?: string[];
    header_handle?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

const META_TEMPLATE_PERMISSION_SUBCODE = 2388185;
const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const isHttpUrl = (value: unknown) => /^https?:\/\//i.test(String(value || '').trim());

const uploadTemplateSampleToMeta = async ({
  mediaUrl,
  accessToken,
  fallbackType,
}: {
  mediaUrl: string;
  accessToken: string;
  fallbackType: string;
}) => {
  const appId = Deno.env.get('META_APP_ID');
  if (!appId) {
    throw new Error('META_APP_ID is not configured for template media sample uploads.');
  }

  const mediaResponse = await fetch(mediaUrl);
  if (!mediaResponse.ok) {
    throw new Error('Could not download the uploaded header sample. Please upload the file again.');
  }

  const fileBytes = await mediaResponse.arrayBuffer();
  const mimeType = mediaResponse.headers.get('content-type')?.split(';')[0] || (
    fallbackType === 'image' ? 'image/jpeg' : fallbackType === 'video' ? 'video/mp4' : 'application/pdf'
  );

  const sessionRes = await fetch(
    `${WHATSAPP_API_BASE}/${appId}/uploads?file_length=${fileBytes.byteLength}&file_type=${encodeURIComponent(mimeType)}&access_token=${accessToken}`,
    { method: 'POST' },
  );
  const sessionData = await sessionRes.json();
  if (!sessionRes.ok || !sessionData.id) {
    throw new Error(sessionData?.error?.message || 'Meta could not start the sample media upload.');
  }

  const uploadRes = await fetch(`${WHATSAPP_API_BASE}/${sessionData.id}`, {
    method: 'POST',
    headers: { Authorization: `OAuth ${accessToken}`, file_offset: '0', 'Content-Type': mimeType },
    body: new Uint8Array(fileBytes),
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.h) {
    throw new Error(uploadData?.error?.message || 'Meta could not upload the sample media.');
  }

  return uploadData.h as string;
};

const getMetaPermissionGuidance = (metaError: any) => {
  const isPermissionSetupError = metaError?.code === 10 && metaError?.error_subcode === META_TEMPLATE_PERMISSION_SUBCODE;

  if (!isPermissionSetupError) return null;

  return {
    code: 'WABA_TEMPLATE_PERMISSION_DENIED',
    title: 'WhatsApp account cannot create templates yet',
    message: 'This WhatsApp Business Account does not currently allow template creation with the connected access token.',
    next_steps: [
      'Add or verify the payment method on the WhatsApp Business Account.',
      'Make sure the connected business/system user has full control of this WhatsApp account.',
      'Reconnect WhatsApp from Settings so the token is refreshed with whatsapp_business_management permission.',
    ],
  };
};

const getMetaErrorMessage = (metaError: any) =>
  metaError?.error_user_msg || metaError?.error_user_title || metaError?.message || 'Failed to submit template to Meta';

const isTemplateLanguageDeleting = (metaError: any) => Number(metaError?.error_subcode) === 2388023;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    const { template_id, version_id } = await req.json();

    if (!template_id || !version_id) {
      return new Response(JSON.stringify({ error: 'template_id and version_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Submitting template ${template_id} version ${version_id} to Meta`);

    // Get template with version
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select(`
        *,
        waba_accounts!inner(id, waba_id, encrypted_access_token)
      `)
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get version
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .select('*')
      .eq('id', version_id)
      .single();

    if (versionError || !version) {
      console.error('Version not found:', versionError);
      return new Response(JSON.stringify({ error: 'Template version not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-approve if still in draft (skip internal review for quick submission)
    if (template.internal_status !== 'approved') {
      await supabase
        .from('templates')
        .update({ internal_status: 'approved' })
        .eq('id', template_id);
    }

    // Get WABA access token
    const wabaId = template.waba_accounts.waba_id;
    const accessToken = template.waba_accounts.encrypted_access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No access token found for WABA account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Meta API payload
    const components: any[] = [];
    const isAuthentication = String(template.category || '').toUpperCase() === 'AUTHENTICATION';

    if (isAuthentication) {
      // AUTHENTICATION templates have a fixed structure — Meta auto-generates the body text.
      // BODY must NOT include `text`; instead it accepts `add_security_recommendation`.
      // FOOTER accepts `code_expiration_minutes`. BUTTONS must be a single OTP button.
      components.push({
        type: 'BODY',
        add_security_recommendation: true,
      });

      const expiryMatch = String(version.footer || '').match(/(\d+)/);
      const codeExpirationMinutes = expiryMatch ? Math.min(90, Math.max(1, parseInt(expiryMatch[1], 10))) : 5;
      components.push({
        type: 'FOOTER',
        code_expiration_minutes: codeExpirationMinutes,
      });

      components.push({
        type: 'BUTTONS',
        buttons: [
          {
            type: 'OTP',
            otp_type: 'COPY_CODE',
            text: 'Copy code',
          },
        ],
      });
    } else {
      // Header component
      if (version.header_type && version.header_type !== 'none') {
        const headerComponent: TemplateComponent = {
          type: 'HEADER',
        };

        if (version.header_type === 'text') {
          headerComponent.format = 'TEXT';
          headerComponent.text = version.header_content || '';

          const headerVars = (version.header_content || '').match(/\{\{(\d+)\}\}/g);
          if (headerVars && version.variable_samples) {
            const samples = version.variable_samples as Record<string, string>;
            headerComponent.example = {
              header_text: headerVars.map((v: string) => {
                const num = v.match(/\d+/)?.[0];
                return num ? (samples[`header_${num}`] || samples[num] || 'Sample') : 'Sample';
              }),
            };
          }
        } else if (['image', 'video', 'document'].includes(version.header_type)) {
          headerComponent.format = version.header_type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'DOCUMENT';
          const samples = (version.variable_samples || {}) as Record<string, string>;
          let handle = samples.header_handle || samples.header_media_handle;
          const sampleUrl = samples.header_media_url || version.header_content;
          if (!handle && isHttpUrl(sampleUrl)) {
            try {
              handle = await uploadTemplateSampleToMeta({
                mediaUrl: String(sampleUrl),
                accessToken,
                fallbackType: version.header_type,
              });
              await supabase
                .from('template_versions')
                .update({
                  variable_samples: {
                    ...samples,
                    header_handle: handle,
                    header_media_url: String(sampleUrl),
                  },
                })
                .eq('id', version_id);
            } catch (uploadError) {
              const message = uploadError instanceof Error ? uploadError.message : 'Sample media upload failed.';
              return new Response(JSON.stringify({
                success: false,
                error: message,
                code: 'MEDIA_HEADER_SAMPLE_UPLOAD_FAILED',
              }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
          if (!handle) {
            return new Response(JSON.stringify({
              success: false,
              error: `A sample ${version.header_type} is required for media headers. Please upload a sample file in the template builder before submitting.`,
              code: 'MEDIA_HEADER_SAMPLE_REQUIRED',
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          headerComponent.example = { header_handle: [handle] };
        }

        components.push(headerComponent);
      }

      // Body component (required)
      const bodyComponent: TemplateComponent = {
        type: 'BODY',
        text: version.body,
      };

      const bodyVars = version.body.match(/\{\{(\d+)\}\}/g);
      if (bodyVars && version.variable_samples) {
        const samples = version.variable_samples as Record<string, string>;
        bodyComponent.example = {
          body_text: [bodyVars.map((v: string) => {
            const num = v.match(/\d+/)?.[0];
            return num ? (samples[num] || `Sample ${num}`) : 'Sample';
          })],
        };
      }

      components.push(bodyComponent);

      // Footer component
      if (version.footer) {
        components.push({
          type: 'FOOTER',
          text: version.footer,
        });
      }

      // Buttons component
      const buttons = version.buttons as Array<{
        type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
        text: string;
        url?: string;
        phone_number?: string;
      }> | null;

      if (buttons && buttons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: buttons.map(btn => {
            if (btn.type === 'URL') {
              return { type: 'URL', text: btn.text, url: btn.url };
            } else if (btn.type === 'PHONE_NUMBER') {
              return { type: 'PHONE_NUMBER', text: btn.text, phone_number: btn.phone_number };
            } else {
              return { type: 'QUICK_REPLY', text: btn.text };
            }
          }),
        });
      }
    }


    // Meta requires template names to be lowercase letters, numbers, and underscores only
    const sanitizedName = String(template.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_\s-]/g, '')
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 512);

    const requestPayload = {
      name: sanitizedName,
      language: template.language,
      category: template.category,
      components,
    };

    console.log('Meta API payload:', JSON.stringify(requestPayload, null, 2));

    // If the template was previously REJECTED, Meta still has it occupying that
    // name+language slot. Trying to create again returns subcode 2388024 ("Content
    // in this language already exists") and we end up linking back to the old
    // REJECTED entry — so the UI keeps showing "Rejected". Delete the old Meta
    // template first so the new submission lands as PENDING.
    const wasRejected = String(template.status || '').toUpperCase() === 'REJECTED';
    if (wasRejected && sanitizedName) {
      try {
        const deleteUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?name=${encodeURIComponent(sanitizedName)}`;
        const delRes = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const delJson = await delRes.json().catch(() => ({}));
        console.log('Deleted previous rejected Meta template:', delRes.status, delJson);
      } catch (delErr) {
        console.error('Failed to delete previous rejected template (continuing):', delErr);
      }
    }

    // Submit to Meta
    const metaUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates`;

    const doMetaPost = () => fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    let metaResponse = await doMetaPost();

    const metaResult = await metaResponse.json();
    console.log('Meta API response:', metaResult);

    // Persist sanitized name back to template so the UI/DB stays consistent
    if (sanitizedName && sanitizedName !== template.name) {
      await supabase.from('templates').update({ name: sanitizedName }).eq('id', template_id);
    }

    // Create submission log
    const { data: submissionLog, error: logError } = await supabase
      .from('template_submission_logs')
      .insert({
        template_id,
        version_id,
        waba_account_id: template.waba_account_id,
        submitted_by: userId,
        tenant_id: template.tenant_id,
        request_payload: requestPayload,
        response_payload: metaResult,
        meta_template_id: metaResult.id || null,
        meta_status: metaResponse.ok ? 'pending' : 'rejected',
        rejection_reason: metaResult.error?.message || null,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating submission log:', logError);
    }

    if (!metaResponse.ok) {
      const permissionGuidance = getMetaPermissionGuidance(metaResult.error);

      if (permissionGuidance) {
        await supabase
          .from('templates')
          .update({
            rejection_reason: permissionGuidance.message,
          })
          .eq('id', template_id);

        return new Response(JSON.stringify({
          success: false,
          error: permissionGuidance.title,
          details: metaResult.error,
          guidance: permissionGuidance,
          submission_log_id: submissionLog?.id,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle "Content in this language already exists" (subcode 2388024)
      // The template already exists on Meta — link it back to our record instead of failing.
      if (metaResult.error?.error_subcode === 2388024) {
        try {
          const lookupUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?name=${encodeURIComponent(sanitizedName)}&limit=50`;
          const lookupRes = await fetch(lookupUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const lookupJson = await lookupRes.json();
          const match = Array.isArray(lookupJson?.data)
            ? lookupJson.data.find((t: any) => t.name === sanitizedName && t.language === template.language)
            : null;

          if (match?.id) {
            const linkedStatus = String(match.status || 'PENDING').toUpperCase();

            // If the existing Meta template is REJECTED, don't re-link to it —
            // delete it and retry the create so the resubmission is fresh.
            if (linkedStatus === 'REJECTED') {
              try {
                const deleteUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?name=${encodeURIComponent(sanitizedName)}`;
                await fetch(deleteUrl, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${accessToken}` },
                });
              } catch (delErr) {
                console.error('Failed to delete existing rejected template:', delErr);
              }

              const retryRes = await doMetaPost();
              const retryJson = await retryRes.json();
              if (retryRes.ok && retryJson?.id) {
                await supabase
                  .from('templates')
                  .update({
                    meta_template_id: retryJson.id,
                    status: 'PENDING',
                    current_version_id: version_id,
                    rejection_reason: null,
                  })
                  .eq('id', template_id);

                return new Response(JSON.stringify({
                  success: true,
                  meta_template_id: retryJson.id,
                  status: 'PENDING',
                  resubmitted_after_delete: true,
                  submission_log_id: submissionLog?.id,
                  message: 'Previous rejected template removed and resubmitted to Meta.',
                }), {
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              }

              if (isTemplateLanguageDeleting(retryJson?.error)) {
                const retryMessage = getMetaErrorMessage(retryJson.error);
                await supabase
                  .from('templates')
                  .update({
                    status: 'PENDING',
                    current_version_id: version_id,
                    rejection_reason: retryMessage,
                  })
                  .eq('id', template_id);

                return new Response(JSON.stringify({
                  success: true,
                  status: 'PENDING',
                  retry_after_seconds: 60,
                  submission_log_id: submissionLog?.id,
                  message: 'Meta is clearing the previous rejected version. The template is marked pending; try Sync from Meta shortly.',
                }), {
                  status: 200,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              }
            }

            await supabase
              .from('templates')
              .update({
                meta_template_id: match.id,
                status: linkedStatus === 'APPROVED' ? 'APPROVED' : linkedStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
                current_version_id: version_id,
                rejection_reason: null,
              })
              .eq('id', template_id);

            return new Response(JSON.stringify({
              success: true,
              meta_template_id: match.id,
              linked_existing: true,
              status: linkedStatus,
              message: 'This template already exists on Meta and has been linked to your draft.',
              submission_log_id: submissionLog?.id,
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (lookupErr) {
          console.error('Failed to lookup existing Meta template:', lookupErr);
        }

        return new Response(JSON.stringify({
          success: false,
          error: `A template named "${sanitizedName}" already exists on Meta for language "${template.language}". Please rename your template or delete the existing one in WhatsApp Manager.`,
          code: 'TEMPLATE_NAME_EXISTS',
          details: metaResult.error,
          submission_log_id: submissionLog?.id,
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (isTemplateLanguageDeleting(metaResult.error)) {
        const metaMessage = getMetaErrorMessage(metaResult.error);
        await supabase
          .from('templates')
          .update({
            status: 'PENDING',
            current_version_id: version_id,
            rejection_reason: metaMessage,
          })
          .eq('id', template_id);

        return new Response(JSON.stringify({
          success: true,
          status: 'PENDING',
          retry_after_seconds: 60,
          submission_log_id: submissionLog?.id,
          message: 'Meta is clearing the previous rejected version. The template is marked pending; try Sync from Meta shortly.',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update template status to reflect rejection
      await supabase
        .from('templates')
        .update({
          status: 'REJECTED',
          rejection_reason: metaResult.error?.message || 'Unknown error from Meta',
        })
        .eq('id', template_id);

      return new Response(JSON.stringify({
        success: false,
        error: metaResult.error?.message || 'Failed to submit template to Meta',
        details: metaResult.error,
        submission_log_id: submissionLog?.id,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    // Update template with Meta template ID and pending status
    await supabase
      .from('templates')
      .update({
        meta_template_id: metaResult.id,
        status: 'PENDING',
        current_version_id: version_id,
        rejection_reason: null,
      })
      .eq('id', template_id);

    console.log(`Template ${template_id} submitted successfully. Meta ID: ${metaResult.id}`);

    return new Response(JSON.stringify({
      success: true,
      meta_template_id: metaResult.id,
      status: 'PENDING',
      submission_log_id: submissionLog?.id,
      message: 'Template submitted to Meta for approval. Status will be updated automatically.',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

} catch (error: unknown) {
    console.error('Error submitting template to Meta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
