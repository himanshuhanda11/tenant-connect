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
    body_text?: string[][];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

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

    // Check internal approval status
    if (template.internal_status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Template must be internally approved before submitting to Meta' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    const components: TemplateComponent[] = [];

    // Header component
    if (version.header_type && version.header_type !== 'none') {
      const headerComponent: TemplateComponent = {
        type: 'HEADER',
      };

      if (version.header_type === 'text') {
        headerComponent.format = 'TEXT';
        headerComponent.text = version.header_content || '';
        
// Check for variables in header
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
      }

      components.push(headerComponent);
    }

    // Body component (required)
    const bodyComponent: TemplateComponent = {
      type: 'BODY',
      text: version.body,
    };

// Check for variables in body
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
            return {
              type: 'URL',
              text: btn.text,
              url: btn.url,
            };
          } else if (btn.type === 'PHONE_NUMBER') {
            return {
              type: 'PHONE_NUMBER',
              text: btn.text,
              phone_number: btn.phone_number,
            };
          } else {
            return {
              type: 'QUICK_REPLY',
              text: btn.text,
            };
          }
        }),
      });
    }

    const requestPayload = {
      name: template.name,
      language: template.language,
      category: template.category,
      components,
    };

    console.log('Meta API payload:', JSON.stringify(requestPayload, null, 2));

    // Submit to Meta
    const metaUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates`;
    
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const metaResult = await metaResponse.json();
    console.log('Meta API response:', metaResult);

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
        meta_status: metaResponse.ok ? 'PENDING' : 'FAILED',
        rejection_reason: metaResult.error?.message || null,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating submission log:', logError);
    }

    if (!metaResponse.ok) {
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
