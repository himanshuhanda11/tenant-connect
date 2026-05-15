// Agent Availability edge function
// Endpoints:
//   POST { action: 'pause', duration_minutes, reason?, custom_reason?, agent_user_id?, force? }
//   POST { action: 'resume', agent_user_id? }
//   POST { action: 'list_team' }   (admin/owner)
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_DURATIONS = new Set([30, 60, 120, 240, 480, 720, 1440, 2880, 4320, 5760, 10080, 21600, 43200, 86400, 129600]);
const ALLOWED_REASONS = new Set(['break', 'lunch', 'meeting', 'busy', 'leave', 'custom']);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401);
    const callerId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');

    // Find caller's tenant + agent record
    const { data: callerAgent } = await admin
      .from('agents')
      .select('id, tenant_id, role, user_id')
      .eq('user_id', callerId)
      .maybeSingle();

    if (!callerAgent) return json({ error: 'no_agent_record' }, 403);

    const tenantId = callerAgent.tenant_id;
    const callerIsAdmin = ['owner', 'admin', 'manager'].includes((callerAgent.role || '').toLowerCase());

    const targetUserId: string = body.agent_user_id || callerId;

    if (targetUserId !== callerId && !callerIsAdmin) {
      return json({ error: 'forbidden' }, 403);
    }

    // Load target agent (must be in same tenant)
    const { data: targetAgent } = await admin
      .from('agents')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (!targetAgent) return json({ error: 'agent_not_found' }, 404);

    if (action === 'list_team') {
      if (!callerIsAdmin) return json({ error: 'forbidden' }, 403);
      const { data: agents } = await admin
        .from('agents')
        .select('id, user_id, display_name, role, is_active, status, availability_status, pause_reason, pause_custom_reason, paused_at, pause_until, last_active_at, last_available_at')
        .eq('tenant_id', tenantId)
        .order('display_name', { ascending: true });
      return json({ agents: agents || [] });
    }

    if (action === 'resume') {
      const { error } = await admin
        .from('agents')
        .update({
          availability_status: 'available',
          pause_until: null,
          paused_at: null,
          pause_reason: null,
          pause_custom_reason: null,
          last_available_at: new Date().toISOString(),
          availability_updated_by: callerId,
        })
        .eq('id', targetAgent.id);
      if (error) return json({ error: error.message }, 500);

      await admin.from('agent_availability_history').insert({
        tenant_id: tenantId,
        agent_user_id: targetUserId,
        status: 'available',
        reason: 'manual_resume',
        changed_by: callerId,
        is_admin_override: targetUserId !== callerId,
      });
      return json({ ok: true, status: 'available' });
    }

    if (action === 'pause') {
      const duration = Number(body.duration_minutes);
      if (!ALLOWED_DURATIONS.has(duration)) return json({ error: 'invalid_duration' }, 400);

      const reason = body.reason ? String(body.reason).toLowerCase() : null;
      if (reason && !ALLOWED_REASONS.has(reason)) return json({ error: 'invalid_reason' }, 400);
      const customReason = reason === 'custom' ? String(body.custom_reason || '').slice(0, 200) : null;

      // Last-available-agent guard
      const { data: availableAgents } = await admin
        .from('agents')
        .select('id, user_id, availability_status, pause_until, status, is_active')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .neq('status', 'suspended')
        .eq('availability_status', 'available');

      const trulyAvailable = (availableAgents || []).filter(
        (a) => !a.pause_until || new Date(a.pause_until).getTime() <= Date.now()
      );

      const targetCurrentlyAvailable =
        targetAgent.availability_status === 'available' &&
        (!targetAgent.pause_until || new Date(targetAgent.pause_until).getTime() <= Date.now());

      const isLastAvailable = targetCurrentlyAvailable && trulyAvailable.length <= 1;

      if (isLastAvailable && !(callerIsAdmin && body.force === true)) {
        return json({
          error: 'last_available_agent',
          available_count: trulyAvailable.length,
          can_admin_override: callerIsAdmin,
        }, 409);
      }

      const now = new Date();
      const until = new Date(now.getTime() + duration * 60_000);

      const { error } = await admin
        .from('agents')
        .update({
          availability_status: 'paused',
          paused_at: now.toISOString(),
          pause_until: until.toISOString(),
          pause_reason: reason,
          pause_custom_reason: customReason,
          auto_resume_enabled: true,
          availability_updated_by: callerId,
        })
        .eq('id', targetAgent.id);

      if (error) return json({ error: error.message }, 500);

      await admin.from('agent_availability_history').insert({
        tenant_id: tenantId,
        agent_user_id: targetUserId,
        status: 'paused',
        reason,
        custom_reason: customReason,
        paused_at: now.toISOString(),
        pause_until: until.toISOString(),
        changed_by: callerId,
        is_admin_override: targetUserId !== callerId || (isLastAvailable && body.force === true),
      });

      return json({ ok: true, status: 'paused', pause_until: until.toISOString() });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    console.error('agent-availability error', e);
    return json({ error: (e as Error).message || 'internal_error' }, 500);
  }
});
