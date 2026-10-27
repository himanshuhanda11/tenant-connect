// Releases a WhatsApp number from Meta when a workspace disconnects it or
// switches to a different number (each workspace keeps one active number).
//
// "Release" = deregister the number from the WhatsApp Cloud API in Meta, and
// unsubscribe Aireatro from the WhatsApp Business Account's webhooks when no
// other active Aireatro number still uses that account. The phone row is kept
// (status "disconnected") so chat and campaign history is never deleted.

const GRAPH_API_BASE = 'https://graph.facebook.com/v24.0';

export interface ReleaseResult {
  phoneDbId: string;
  displayNumber: string | null;
  deregistered: boolean;
  deregisterError?: string;
  deregisterSkippedReason?: string;
  webhooksRemoved: boolean;
  coexistence: boolean;
}

// Tables whose rows follow the workspace's active number when it is replaced.
const MOVABLE_REFERENCES = ['conversations', 'flows', 'flow_triggers', 'lead_form_rules', 'message_sequences'];

async function graphCall(method: string, path: string, token: string, body?: Record<string, unknown>) {
  const res = await fetch(`${GRAPH_API_BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok && !data?.error, data };
}

async function moveReferences(supabase: any, fromPhoneDbId: string, toPhoneDbId: string) {
  for (const table of MOVABLE_REFERENCES) {
    const { error } = await supabase.from(table).update({ phone_number_id: toPhoneDbId }).eq('phone_number_id', fromPhoneDbId);
    if (error) console.warn(`[number-release] could not move ${table} to new number:`, error.message);
  }
}

export async function releasePhoneFromMeta(
  supabase: any,
  phoneDbId: string,
  opts: { movedToPhoneDbId?: string; reason: string },
): Promise<ReleaseResult> {
  const { data: phone, error } = await supabase
    .from('phone_numbers')
    .select('id, tenant_id, phone_number_id, display_number, waba_account_id, waba:waba_accounts(id, waba_id, encrypted_access_token, coexistence_enabled, onboarding_type, is_on_biz_app)')
    .eq('id', phoneDbId)
    .maybeSingle();
  if (error || !phone) throw new Error('Phone number not found');

  const waba = (phone as any).waba || null;
  const coexistence = !!(waba?.coexistence_enabled || waba?.onboarding_type === 'business_app_coexistence' || waba?.is_on_biz_app);
  const result: ReleaseResult = {
    phoneDbId,
    displayNumber: phone.display_number ?? null,
    deregistered: false,
    webhooksRemoved: false,
    coexistence,
  };

  const token: string | undefined = waba?.encrypted_access_token || (globalThis as any).Deno?.env?.get('META_SYSTEM_USER_TOKEN') || undefined;

  // Never deregister a number another Aireatro workspace is actively using.
  const { data: sameNumberElsewhere } = await supabase
    .from('phone_numbers')
    .select('id')
    .eq('phone_number_id', phone.phone_number_id)
    .neq('id', phoneDbId)
    .in('status', ['connected', 'pending'])
    .limit(1);

  if (sameNumberElsewhere?.length) {
    result.deregisterSkippedReason = 'in_use_elsewhere';
  } else if (!token) {
    result.deregisterSkippedReason = 'no_token';
  } else {
    const dereg = await graphCall('POST', `${phone.phone_number_id}/deregister`, token);
    if (dereg.ok) {
      result.deregistered = true;
    } else {
      result.deregisterError = dereg.data?.error?.error_user_msg || dereg.data?.error?.message || 'Meta refused to release this number';
      console.warn('[number-release] deregister failed:', JSON.stringify(dereg.data?.error || dereg.data));
    }
  }

  if (opts.movedToPhoneDbId) await moveReferences(supabase, phoneDbId, opts.movedToPhoneDbId);

  await supabase
    .from('phone_numbers')
    .update({ status: 'disconnected', is_default: false, updated_at: new Date().toISOString() })
    .eq('id', phoneDbId);

  // Unsubscribe from the WhatsApp Business Account only if no other active
  // Aireatro number (any workspace) still depends on it.
  if (waba?.waba_id && token) {
    const { data: wabaRows } = await supabase.from('waba_accounts').select('id').eq('waba_id', waba.waba_id);
    const wabaIds = (wabaRows || []).map((w: any) => w.id);
    const { data: stillActive } = wabaIds.length
      ? await supabase
          .from('phone_numbers')
          .select('id')
          .in('waba_account_id', wabaIds)
          .neq('id', phoneDbId)
          .in('status', ['connected', 'pending'])
          .limit(1)
      : { data: [] };
    if (!stillActive?.length) {
      const unsub = await graphCall('DELETE', `${waba.waba_id}/subscribed_apps`, token);
      result.webhooksRemoved = unsub.ok;
      if (!unsub.ok) console.warn('[number-release] unsubscribe failed:', JSON.stringify(unsub.data?.error || unsub.data));
      await supabase
        .from('waba_accounts')
        .update({ status: 'disconnected', disconnect_reason: opts.reason, updated_at: new Date().toISOString() })
        .eq('id', waba.id);
    }
  }

  console.log('[number-release]', JSON.stringify({ ...result, reason: opts.reason }));
  return result;
}

/** Keeps only `keepPhoneDbId` active in the workspace; releases every other active number. */
export async function keepOnlyPhone(supabase: any, tenantId: string, keepPhoneDbId: string): Promise<ReleaseResult[]> {
  const { data: keep } = await supabase.from('phone_numbers').select('id, phone_number_id').eq('id', keepPhoneDbId).maybeSingle();
  const { data: others } = await supabase
    .from('phone_numbers')
    .select('id, phone_number_id, display_number')
    .eq('tenant_id', tenantId)
    .neq('id', keepPhoneDbId);
  // Includes numbers already marked "disconnected" in Aireatro: older versions only
  // changed the label, so the number may still be registered in Meta.

  const results: ReleaseResult[] = [];
  for (const other of others || []) {
    if (keep && other.phone_number_id === keep.phone_number_id) {
      // Duplicate row for the same number: retire it without touching Meta.
      await moveReferences(supabase, other.id, keepPhoneDbId);
      await supabase.from('phone_numbers').update({ status: 'disconnected', is_default: false }).eq('id', other.id);
      continue;
    }
    try {
      results.push(await releasePhoneFromMeta(supabase, other.id, { movedToPhoneDbId: keepPhoneDbId, reason: 'replaced_by_new_number' }));
    } catch (e) {
      console.warn('[number-release] failed to release', other.id, e);
    }
  }
  return results;
}
