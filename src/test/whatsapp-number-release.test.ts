import { describe, it, expect, beforeEach, vi } from 'vitest';
import { keepOnlyPhone } from '../../supabase/functions/_shared/whatsappNumberRelease';

// Minimal in-memory stand-in for the database client used by the release helper.
type Row = Record<string, any>;
function fakeDb(tables: Record<string, Row[]>) {
  const from = (table: string) => {
    const filters: ((r: Row) => boolean)[] = [];
    let op: 'select' | 'update' = 'select';
    let payload: Row = {};
    let selectStr = '';
    let single = false;
    let limit: number | null = null;
    const q: any = {
      select(s = '*') { if (op === 'select') selectStr = s; return q; },
      eq(c: string, v: any) { filters.push((r) => r[c] === v); return q; },
      neq(c: string, v: any) { filters.push((r) => r[c] !== v); return q; },
      in(c: string, arr: any[]) { filters.push((r) => arr.includes(r[c])); return q; },
      order() { return q; },
      limit(n: number) { limit = n; return q; },
      update(p: Row) { op = 'update'; payload = p; return q; },
      maybeSingle() { single = true; return q; },
      single() { single = true; return q; },
      then(resolve: any) {
        const rows = (tables[table] ||= []).filter((r) => filters.every((f) => f(r)));
        if (op === 'update') {
          rows.forEach((r) => Object.assign(r, payload));
          return resolve({ data: rows, error: null });
        }
        let out = rows.map((r) => {
          if (table === 'phone_numbers' && selectStr.includes('waba:')) {
            return { ...r, waba: (tables.waba_accounts || []).find((w) => w.id === r.waba_account_id) || null };
          }
          return { ...r };
        });
        if (limit != null) out = out.slice(0, limit);
        return resolve({ data: single ? out[0] ?? null : out, error: null });
      },
    };
    return q;
  };
  return { from };
}

let calls: { method: string; url: string }[] = [];

beforeEach(() => {
  calls = [];
  (globalThis as any).Deno = { env: { get: () => undefined } };
  globalThis.fetch = vi.fn(async (url: any, init: any) => {
    calls.push({ method: init?.method || 'GET', url: String(url) });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }) as any;
});

const T = 'tenant-1';

describe('one WhatsApp number per workspace', () => {
  it('releases the old number from Meta when a new number is connected, and moves chats to the new number', async () => {
    const tables = {
      waba_accounts: [{ id: 'w1', waba_id: 'WABA1', encrypted_access_token: 'tok', status: 'active' }],
      phone_numbers: [
        { id: 'old', tenant_id: T, phone_number_id: 'P_OLD', display_number: '+971 56 000 0001', waba_account_id: 'w1', status: 'connected' },
        { id: 'new', tenant_id: T, phone_number_id: 'P_NEW', display_number: '+971 56 000 0002', waba_account_id: 'w1', status: 'pending' },
      ],
      conversations: [{ id: 'c1', phone_number_id: 'old' }],
    };
    const results = await keepOnlyPhone(fakeDb(tables), T, 'new');

    expect(results).toHaveLength(1);
    expect(results[0].deregistered).toBe(true);
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/P_OLD/deregister'))).toBe(true);
    expect(tables.phone_numbers.find((p) => p.id === 'old')!.status).toBe('disconnected');
    expect(tables.phone_numbers.filter((p) => p.status !== 'disconnected').map((p) => p.id)).toEqual(['new']);
    expect(tables.conversations[0].phone_number_id).toBe('new');
    // New number shares the WhatsApp account, so Aireatro must stay subscribed to it.
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('unsubscribes from the old WhatsApp account when no active number still uses it', async () => {
    const tables = {
      waba_accounts: [
        { id: 'w1', waba_id: 'WABA_OLD', encrypted_access_token: 'tok', status: 'active' },
        { id: 'w2', waba_id: 'WABA_NEW', encrypted_access_token: 'tok2', status: 'active' },
      ],
      phone_numbers: [
        { id: 'old', tenant_id: T, phone_number_id: 'P_OLD', waba_account_id: 'w1', status: 'connected' },
        { id: 'new', tenant_id: T, phone_number_id: 'P_NEW', waba_account_id: 'w2', status: 'pending' },
      ],
    };
    await keepOnlyPhone(fakeDb(tables), T, 'new');

    expect(calls.some((c) => c.method === 'DELETE' && c.url.endsWith('/WABA_OLD/subscribed_apps'))).toBe(true);
    expect(calls.some((c) => c.url.includes('WABA_NEW'))).toBe(false);
  });

  it('never releases a number that another workspace is actively using', async () => {
    const tables = {
      waba_accounts: [{ id: 'w1', waba_id: 'WABA1', encrypted_access_token: 'tok', status: 'active' }],
      phone_numbers: [
        { id: 'old', tenant_id: T, phone_number_id: 'P_SHARED', waba_account_id: 'w1', status: 'disconnected' },
        { id: 'other', tenant_id: 'tenant-2', phone_number_id: 'P_SHARED', waba_account_id: 'w1', status: 'connected' },
        { id: 'new', tenant_id: T, phone_number_id: 'P_NEW', waba_account_id: 'w1', status: 'pending' },
      ],
    };
    const results = await keepOnlyPhone(fakeDb(tables), T, 'new');

    expect(results[0].deregistered).toBe(false);
    expect(results[0].deregisterSkippedReason).toBe('in_use_elsewhere');
    expect(calls.some((c) => c.url.includes('/deregister'))).toBe(false);
  });
});
