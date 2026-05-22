// Shared Resend HTTP helper. We intentionally do NOT use any SDK so we
// stay aligned with the project rule (esm.sh only, no node deps).
//
// Single source of truth for sender identity and Resend API access.

export const RESEND_FROM_DEFAULT = "Aireatro <noreply@aireatro.com>";
export const RESEND_REPLY_TO_DEFAULT = "info@aireatro.com";
export const RESEND_INBOUND_DOMAIN = "inbox.aireatro.com";
export const RESEND_API_BASE = "https://api.resend.com";

export interface ResendSendInput {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    content_type?: string;
  }>;
  tags?: Array<{ name: string; value: string }>;
}

export interface ResendSendResult {
  ok: boolean;
  id?: string;
  error?: string;
  status: number;
  raw?: unknown;
}

export async function resendSend(input: ResendSendInput): Promise<ResendSendResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { ok: false, status: 500, error: "RESEND_API_KEY not configured" };
  }

  const body = {
    from: input.from || RESEND_FROM_DEFAULT,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.reply_to,
    cc: input.cc,
    bcc: input.bcc,
    headers: input.headers,
    attachments: input.attachments,
    tags: input.tags,
  };

  // Strip undefined keys for a clean API payload
  for (const k of Object.keys(body)) {
    // deno-lint-ignore no-explicit-any
    if ((body as any)[k] === undefined) delete (body as any)[k];
  }

  try {
    const res = await fetch(`${RESEND_API_BASE}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: (raw as { message?: string })?.message || `Resend HTTP ${res.status}`,
        raw,
      };
    }
    return { ok: true, status: res.status, id: (raw as { id?: string })?.id, raw };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Verify a Resend / Svix-style webhook signature.
 * Resend uses the Svix signature scheme:
 *   svix-id, svix-timestamp, svix-signature headers
 *   signature = base64(HMAC-SHA256(`${id}.${timestamp}.${rawBody}`, secret))
 */
export async function verifyResendWebhook(
  req: Request,
  rawBody: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) return { ok: false, reason: "no_secret" };

  const id = req.headers.get("svix-id") || req.headers.get("webhook-id");
  const timestamp = req.headers.get("svix-timestamp") || req.headers.get("webhook-timestamp");
  const sigHeader = req.headers.get("svix-signature") || req.headers.get("webhook-signature");

  if (!id || !timestamp || !sigHeader) return { ok: false, reason: "missing_headers" };

  // Reject stale (>5 min)
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  if (Math.abs(Date.now() / 1000 - ts) > 5 * 60) return { ok: false, reason: "stale_timestamp" };

  // Strip the `whsec_` prefix and base64-decode the key.
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
  } catch {
    // Some setups pass raw secret — fall back to utf-8 bytes
    keyBytes = new TextEncoder().encode(rawSecret);
  }

  const signedPayload = `${id}.${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const macBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(macBuf)));

  // sigHeader may contain space-separated entries like `v1,<sig> v1,<sig2>`
  const candidates = sigHeader.split(" ").map((s) => s.split(",")[1]).filter(Boolean);
  const match = candidates.some((sig) => safeEqual(sig, expected));
  return match ? { ok: true } : { ok: false, reason: "bad_signature" };
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function normalizeEmail(addr: string): string {
  return (addr || "").trim().toLowerCase();
}

export function buildThreadKey(messageIds: string[]): string {
  // Use the OLDEST referenced Message-ID as the canonical thread key.
  // If none, return empty string and let caller fall back to in_reply_to or subject.
  const sorted = messageIds.filter(Boolean).slice().sort();
  return sorted[0] || "";
}
