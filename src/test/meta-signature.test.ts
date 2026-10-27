import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { escapeUnicode, verifyMetaSignature } from '../../supabase/functions/_shared/metaSignature';

const SECRET = 'test-secret';
const sign = (body: string) => 'sha256=' + createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');

describe('Meta webhook signature', () => {
  it('accepts a body signed as delivered', async () => {
    const body = '{"text":"hello"}';
    expect(await verifyMetaSignature(body, sign(body), SECRET)).toBe('raw');
  });

  it('accepts emoji bodies signed over the escaped-unicode form', async () => {
    const body = '{"headline":"🇪🇺 Apply Now! ✈️"}';
    expect(await verifyMetaSignature(body, sign(escapeUnicode(body)), SECRET)).toBe('escaped');
  });

  it('rejects a body signed with another secret', async () => {
    const body = '{"headline":"🇪🇺"}';
    const other = 'sha256=' + createHmac('sha256', 'other').update(escapeUnicode(body)).digest('hex');
    expect(await verifyMetaSignature(body, other, SECRET)).toBeNull();
  });

  it('rejects a tampered body', async () => {
    expect(await verifyMetaSignature('{"text":"hi!"}', sign('{"text":"hi"}'), SECRET)).toBeNull();
  });

  it('rejects a missing signature', async () => {
    expect(await verifyMetaSignature('{}', null, SECRET)).toBeNull();
  });

  it('escapes non-ASCII as lowercase \\u codes', () => {
    expect(escapeUnicode('é✈')).toBe('\\u00e9\\u2708');
  });
});
