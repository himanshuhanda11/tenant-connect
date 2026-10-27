// Meta webhook signature verification (X-Hub-Signature-256).
//
// Meta documents that the signature is generated over an *escaped unicode*
// version of the payload (non-ASCII as \uXXXX with lowercase hex). When the
// delivered body contains raw UTF-8 (emoji, Arabic, Malayalam...), hashing the
// raw bytes gives a different result, so we also try the escaped form.
// Every candidate is still an HMAC with our own app secret — nothing is relaxed.

export function escapeUnicode(body: string): string {
  return body.replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

export function signatureCandidates(rawBody: string): Array<{ label: string; body: string }> {
  const escaped = escapeUnicode(rawBody);
  const escapedSlashes = escaped.replace(/\//g, '\\/');
  const out = [{ label: 'raw', body: rawBody }];
  if (escaped !== rawBody) out.push({ label: 'escaped', body: escaped });
  if (escapedSlashes !== escaped) out.push({ label: 'escaped_slashes', body: escapedSlashes });
  return out;
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns which body form matched ('raw' | 'escaped' | 'escaped_slashes'), or null. */
export async function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): Promise<string | null> {
  if (!signatureHeader) return null;
  const [algo, ...rest] = signatureHeader.split('=');
  const theirSig = rest.join('=').toLowerCase();
  if (algo !== 'sha256' || !theirSig) return null;
  for (const c of signatureCandidates(rawBody)) {
    if (safeEqual(await hmacHex(appSecret, c.body), theirSig)) return c.label;
  }
  return null;
}
