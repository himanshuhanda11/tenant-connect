// Resend inbound webhook receiver.
// Accepts `email.received` (and delivery status events) from Resend,
// verifies the Svix signature, then creates / appends to email_conversations.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  RESEND_INBOUND_DOMAIN,
  normalizeEmail,
  verifyResendWebhook,
} from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature, webhook-id, webhook-timestamp, webhook-signature",
};

interface ResendInboundEmail {
  from?: string;
  to?: string[] | string;
  cc?: string[] | string;
  bcc?: string[] | string;
  reply_to?: string[] | string;
  subject?: string;
  html?: string;
  text?: string;
  headers?: Array<{ name: string; value: string }> | Record<string, string>;
  message_id?: string;
  in_reply_to?: string;
  references?: string[] | string;
  attachments?: Array<{
    filename: string;
    content_type?: string;
    content?: string; // base64
    url?: string;
    size?: number;
    content_id?: string;
    disposition?: string;
  }>;
}

function parseAddress(raw: string): { email: string; name: string } {
  const s = (raw || "").trim();
  // "Name <email@x>" or "email@x"
  const m = s.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim(), email: normalizeEmail(m[2]) };
  return { name: "", email: normalizeEmail(s) };
}

function arr(x: unknown): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String);
  return [String(x)];
}

function headerValue(
  headers: ResendInboundEmail["headers"],
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const lname = name.toLowerCase();
  if (Array.isArray(headers)) {
    return headers.find((h) => h.name?.toLowerCase() === lname)?.value;
  }
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === lname) return headers[k];
  }
  return undefined;
}

function snippet(html?: string, text?: string): string {
  const s = (text || (html || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return s.slice(0, 280);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  // Verify signature (required in production; allow bypass only with explicit flag)
  const skipVerify = Deno.env.get("RESEND_WEBHOOK_SKIP_VERIFY") === "true";
  if (!skipVerify) {
    const v = await verifyResendWebhook(req, rawBody);
    if (!v.ok) {
      console.error("[resend-inbound] signature verify failed", v.reason);
      return new Response(JSON.stringify({ error: "invalid_signature", reason: v.reason }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let evt: { type?: string; data?: ResendInboundEmail & Record<string, unknown> };
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const type = evt?.type || "";
  const data = evt?.data || {};
  console.log("[resend-inbound] event", { type });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Handle delivery status events for OUTBOUND emails (update email_messages by resend_id)
  if (type.startsWith("email.") && type !== "email.received" && type !== "email.delivered_to_inbox") {
    const resendId = (data as { email_id?: string; id?: string }).email_id ||
      (data as { id?: string }).id;
    if (resendId) {
      const statusMap: Record<string, string> = {
        "email.sent": "sent",
        "email.delivered": "delivered",
        "email.opened": "opened",
        "email.clicked": "clicked",
        "email.bounced": "bounced",
        "email.complained": "complained",
        "email.failed": "failed",
      };
      const newStatus = statusMap[type];
      if (newStatus) {
        await supabase
          .from("email_messages")
          .update({
            status: newStatus,
            resend_event: evt as unknown,
          })
          .eq("resend_id", resendId);
      }
    }
    return new Response(JSON.stringify({ ok: true, handled: type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (type !== "email.received" && type !== "email.delivered_to_inbox") {
    // Unknown event — ack to prevent retries.
    return new Response(JSON.stringify({ ok: true, ignored: type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // INBOUND email
  const toList = arr(data.to);
  const ccList = arr(data.cc);
  const bccList = arr(data.bcc);

  // Match recipient to a workspace inbox (email_accounts.address).
  // Pick the FIRST recipient whose domain matches our inbound domain.
  const allRecipients = [...toList, ...ccList, ...bccList]
    .map((s) => parseAddress(s).email)
    .filter(Boolean);
  const matchedAddress =
    allRecipients.find((e) => e.endsWith(`@${RESEND_INBOUND_DOMAIN}`)) ||
    allRecipients[0];

  if (!matchedAddress) {
    console.warn("[resend-inbound] no recipient found");
    return new Response(JSON.stringify({ ok: true, skipped: "no_recipient" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: account, error: accErr } = await supabase
    .from("email_accounts")
    .select("id, tenant_id, address")
    .ilike("address", matchedAddress)
    .maybeSingle();

  if (accErr) {
    console.error("[resend-inbound] account lookup error", accErr);
  }

  if (!account) {
    console.warn("[resend-inbound] no matching inbox for", matchedAddress);
    return new Response(JSON.stringify({ ok: true, skipped: "no_inbox", address: matchedAddress }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fromParsed = parseAddress(String(data.from || ""));
  const subject = (data.subject || "(no subject)").toString();
  const messageId = data.message_id ||
    headerValue(data.headers, "message-id") ||
    `<${crypto.randomUUID()}@inbound>`;
  const inReplyTo = data.in_reply_to || headerValue(data.headers, "in-reply-to") || null;
  const refsRaw = data.references || headerValue(data.headers, "references") || "";
  const referenceIds = (Array.isArray(refsRaw) ? refsRaw.join(" ") : String(refsRaw))
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Thread resolution: oldest reference, then in_reply_to, then subject-normalized.
  const threadAnchor =
    referenceIds[0] || inReplyTo || `subject:${subject.replace(/^(Re:|Fwd?:)\s*/gi, "").trim().toLowerCase()}`;

  // Find existing conversation
  let conversationId: string | null = null;
  {
    const { data: existing } = await supabase
      .from("email_conversations")
      .select("id")
      .eq("tenant_id", account.tenant_id)
      .eq("thread_key", threadAnchor)
      .maybeSingle();
    if (existing) conversationId = existing.id;
  }

  const previewText = snippet(data.html, data.text);

  if (!conversationId) {
    const { data: created, error: cErr } = await supabase
      .from("email_conversations")
      .insert({
        tenant_id: account.tenant_id,
        account_id: account.id,
        subject,
        from_email: fromParsed.email,
        from_name: fromParsed.name,
        thread_key: threadAnchor,
        status: "open",
        priority: "normal",
        last_message_at: new Date().toISOString(),
        last_inbound_at: new Date().toISOString(),
        last_message_preview: previewText,
        unread_count: 1,
        message_count: 1,
        has_attachments: (data.attachments || []).length > 0,
      })
      .select("id")
      .single();
    if (cErr || !created) {
      console.error("[resend-inbound] insert conversation failed", cErr);
      return new Response(JSON.stringify({ error: "conv_insert_failed", detail: cErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    conversationId = created.id;
  } else {
    // Touch existing conversation
    await supabase
      .from("email_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_inbound_at: new Date().toISOString(),
        last_message_preview: previewText,
        unread_count: 1,
        status: "open",
        has_attachments: (data.attachments || []).length > 0,
      })
      .eq("id", conversationId);
    await supabase.rpc("noop").catch(() => undefined); // ignore — placeholder
  }

  // Insert message
  const { data: msg, error: mErr } = await supabase
    .from("email_messages")
    .insert({
      tenant_id: account.tenant_id,
      conversation_id: conversationId,
      account_id: account.id,
      direction: "inbound",
      status: "received",
      message_id: messageId,
      in_reply_to: inReplyTo,
      reference_ids: referenceIds,
      from_email: fromParsed.email,
      from_name: fromParsed.name,
      to_emails: toList.map((s) => parseAddress(s).email),
      cc_emails: ccList.map((s) => parseAddress(s).email),
      bcc_emails: bccList.map((s) => parseAddress(s).email),
      reply_to: arr(data.reply_to)[0] || null,
      subject,
      body_html: data.html || null,
      body_text: data.text || null,
      snippet: previewText,
      has_attachments: (data.attachments || []).length > 0,
      resend_event: evt as unknown,
    })
    .select("id")
    .single();

  if (mErr || !msg) {
    console.error("[resend-inbound] insert message failed", mErr);
    return new Response(JSON.stringify({ error: "msg_insert_failed", detail: mErr?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Attachments — store metadata only (file content is referenced by Resend URL or base64 we drop)
  if (Array.isArray(data.attachments) && data.attachments.length > 0) {
    const rows = data.attachments.map((a) => ({
      tenant_id: account.tenant_id,
      message_id: msg.id,
      filename: a.filename || "attachment",
      mime_type: a.content_type || null,
      size_bytes: a.size || null,
      storage_bucket: "email-attachments",
      storage_path: a.url ||
        `${account.tenant_id}/${conversationId}/${msg.id}/${a.filename || "attachment"}`,
      content_id: a.content_id || null,
      is_inline: a.disposition === "inline",
    }));
    await supabase.from("email_attachments").insert(rows);
  }

  // Audit event
  await supabase.from("email_events").insert({
    tenant_id: account.tenant_id,
    conversation_id: conversationId,
    message_id: msg.id,
    actor_type: "system",
    event_type: "message_received",
    payload: { from: fromParsed.email, subject },
  // Fire automation runner (don't block on it)
  try {
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/email-automation-runner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        tenant_id: account.tenant_id,
        conversation_id: conversationId,
        message_id: msg.id,
        trigger_type: "message_received",
      }),
    }).catch((e) => console.error("[automation-runner]", e));

    // Fire AI classify async (no await)
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/email-ai-classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ conversation_id: conversationId, message_id: msg.id }),
    }).catch((e) => console.error("[ai-classify]", e));
  } catch (e) {
    console.error("[resend-inbound] post-hooks failed", e);
  }


  return new Response(JSON.stringify({ ok: true, conversation_id: conversationId, message_id: msg.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
