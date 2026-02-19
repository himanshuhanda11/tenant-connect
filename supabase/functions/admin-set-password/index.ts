import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: corsHeaders });
    }

    // Verify caller identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { user_id, new_password, tenant_id } = await req.json();

    if (!user_id || !new_password || !tenant_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id, new_password, or tenant_id' }), { status: 400, headers: corsHeaders });
    }

    if (new_password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers: corsHeaders });
    }

    // Check caller is owner/admin of the tenant
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRole } = await adminClient
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', caller.id)
      .maybeSingle();

    if (!callerRole || !['owner', 'admin'].includes(callerRole.role)) {
      return new Response(JSON.stringify({ error: 'Only owners and admins can reset passwords' }), { status: 403, headers: corsHeaders });
    }

    // Verify target user is in same tenant
    const { data: targetMember } = await adminClient
      .from('tenant_members')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (!targetMember) {
      return new Response(JSON.stringify({ error: 'User not found in this workspace' }), { status: 404, headers: corsHeaders });
    }

    // Update password
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(user_id, {
      password: new_password,
    });

    if (updateErr) {
      console.error('Password update error:', updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: corsHeaders });
  }
});
