import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RazorpayConnectRequest {
  tenantId: string;
  keyId: string;
  keySecret: string;
  autoCreateWebhook: boolean;
}

// Verify Razorpay credentials by calling their API
async function verifyRazorpayCredentials(keyId: string, keySecret: string): Promise<boolean> {
  try {
    const authHeader = btoa(`${keyId}:${keySecret}`);
    
    // Try to fetch account details to verify credentials
    const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });
    
    // 200 or 401/403 tells us if credentials are valid
    if (response.status === 200) {
      return true;
    }
    
    if (response.status === 401 || response.status === 403) {
      return false;
    }
    
    // For other statuses, try another endpoint
    const accountResponse = await fetch('https://api.razorpay.com/v1/accounts', {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });
    
    return accountResponse.ok || accountResponse.status === 404; // 404 means auth worked but no accounts
  } catch (error) {
    console.error('Error verifying Razorpay credentials:', error);
    return false;
  }
}

// Create webhook in Razorpay
async function createRazorpayWebhook(
  keyId: string, 
  keySecret: string, 
  webhookUrl: string, 
  webhookSecret: string
): Promise<{ success: boolean; webhookId?: string; error?: string }> {
  try {
    const authHeader = btoa(`${keyId}:${keySecret}`);
    
    const webhookPayload = {
      url: webhookUrl,
      alert_email: '', // Optional
      secret: webhookSecret,
      events: [
        'payment.authorized',
        'payment.captured',
        'payment.failed',
        'payment_link.paid',
        'payment_link.partially_paid',
        'payment_link.expired',
        'payment_link.cancelled',
        'invoice.paid',
        'invoice.partially_paid',
        'invoice.expired',
        'order.paid',
        'refund.created',
        'refund.processed',
        'refund.failed',
      ],
      active: true,
    };
    
    console.log('Creating Razorpay webhook:', { url: webhookUrl, events: webhookPayload.events.length });
    
    const response = await fetch('https://api.razorpay.com/v1/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });
    
    const responseText = await response.text();
    console.log('Razorpay webhook response:', response.status, responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      return { success: true, webhookId: data.id };
    }
    
    // Parse error response
    let errorMessage = 'Failed to create webhook';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error?.description || errorData.message || errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  } catch (error: any) {
    console.error('Error creating Razorpay webhook:', error);
    return { success: false, error: error.message || 'Network error creating webhook' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const body: RazorpayConnectRequest = await req.json();
    const { tenantId, keyId, keySecret, autoCreateWebhook } = body;
    
    console.log('Razorpay connect request:', { tenantId, keyIdPrefix: keyId?.slice(0, 10), autoCreateWebhook });
    
    // Validate required fields
    if (!tenantId || !keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tenantId, keyId, keySecret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify credentials
    console.log('Verifying Razorpay credentials...');
    const isValid = await verifyRazorpayCredentials(keyId, keySecret);
    
    if (!isValid) {
      console.log('Invalid Razorpay credentials');
      return new Response(
        JSON.stringify({ error: 'Invalid Razorpay credentials. Please check your Key ID and Key Secret.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Razorpay credentials verified successfully');
    
    // Generate webhook URL and secret
    const webhookSecret = crypto.randomUUID().replace(/-/g, '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookUrl = `${supabaseUrl}/functions/v1/integration-webhook/${tenantId}/razorpay`;
    
    let razorpayWebhookId: string | undefined;
    
    // Auto-create webhook if requested
    if (autoCreateWebhook) {
      console.log('Auto-creating webhook in Razorpay...');
      const webhookResult = await createRazorpayWebhook(keyId, keySecret, webhookUrl, webhookSecret);
      
      if (!webhookResult.success) {
        console.log('Failed to auto-create webhook:', webhookResult.error);
        // Don't fail the whole connection, just log the error
        // User can still set up webhook manually
      } else {
        razorpayWebhookId = webhookResult.webhookId;
        console.log('Webhook created successfully:', razorpayWebhookId);
      }
    }
    
    // Save integration to database
    console.log('Saving integration to database...');
    const { data: integration, error: upsertError } = await supabase
      .from('tenant_integrations')
      .upsert({
        tenant_id: tenantId,
        integration_key: 'razorpay',
        status: 'connected',
        credentials: {
          key_id: keyId,
          // Note: In production, encrypt the key_secret
          razorpay_webhook_id: razorpayWebhookId,
        },
        config: {
          setupMode: autoCreateWebhook ? 'one-click' : 'manual',
          autoWebhookCreated: !!razorpayWebhookId,
        },
        webhook_url: webhookUrl,
        webhook_secret: webhookSecret,
        connected_at: new Date().toISOString(),
        health_status: 'healthy',
      } as any, {
        onConflict: 'tenant_id,integration_key',
      })
      .select()
      .single();
    
    if (upsertError) {
      console.error('Database error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save integration: ' + upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Razorpay integration saved successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        integrationId: integration?.id,
        webhookUrl,
        webhookSecret,
        razorpayWebhookId,
        autoWebhookCreated: !!razorpayWebhookId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Razorpay connect error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
