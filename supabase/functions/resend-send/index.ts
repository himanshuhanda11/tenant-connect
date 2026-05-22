// Outbound email sender for the shared team inbox.
// Authenticated: caller must be a workspace member. We then send via Resend
// and log the message in email_messages.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  RESEND_FROM_DEFAULT,
  RESEND_REPLY_TO_DEFAULT,
  resendSend,
} from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendBody {
  conversation_id?: string;
  // New conversation:
  account_id?: string;
  to: string[] | string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
}

function arr(x: unknown): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String).filter(Boolean);
  return [String(x)].filter(Boolean);
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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userRes, error: userErr } = await userClient.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userErr || !userRes?.user?.id) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userRes.user.id;

  let body: SendBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const toList = arr(body.to);
  if (!toList.length || !body.subject || (!body.html && !body.text)) {
    return new Response(
      JSON.stringify({ error: "missing_fields", required: ["to", "subject", "html|text"] }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Admin client for writes scoped by us
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve conversation + tenant + account
  let conversationId = body.conversation_id || null;
  let tenantId: string | null = null;
  let accountId: string | null = body.account_id || null;
  let fromAddress = RESEND_FROM_DEFAULT;
  let replyToAddress = RESEND_REPLY_TO_DEFAULT;
  let inReplyTo: string | null = null;
  let referenceIds: string[] = [];
  let subject = body.subject;

  if (conversationId) {
    const { data: conv } = await admin
      .from("email_conversations")
      .select("id, tenant_id, account_id, subject, thread_key")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv) {
      return new Response(JSON.stringify({ error: "conversation_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    tenantId = conv.tenant_id;
    accountId = conv.account_id;
    subject = body.subject || conv.subject || "(no subject)";
    // pull last inbound message for threading headers
    const { data: lastInbound } = await admin
      .from("email_messages")
      .select("message_id, reference_ids")
      .eq("conversation_id", conversationId)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastInbound?.message_id) {
      inReplyTo = lastInbound.message_id;
      referenceIds = [...(lastInbound.reference_ids || []), lastInbound.message_id];
    }
  }

  if (!tenantId) {
    if (!accountId) {
      return new Response(JSON.stringify({ error: "account_id_required_for_new_thread" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: acc } = await admin
      .from("email_accounts")
      .select("id, tenant_id, address, display_name, signature_html")
      .eq("id", accountId)
      .maybeSingle();
    if (!acc) {
      return new Response(JSON.stringify({ error: "account_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    tenantId = acc.tenant_id;
    fromAddress = acc.display_name
      ? `${acc.display_name} <${acc.address}>`
      : acc.address;
    replyToAddress = acc.address;
  } else {
    const { data: acc } = await admin
      .from("email_accounts")
      .select("address, display_name")
      .eq("id", accountId)
      .maybeSingle();
    if (acc) {
      fromAddress = acc.display_name
        ? `${acc.display_name} <${acc.address}>`
        : acc.address;
      replyToAddress = acc.address;
    }
  }

  // Verify caller is a workspace member of this tenant OR a super admin
  const { data: memberCheck } = await admin
    .from("tenant_members")
    .select("user_id")
    .eq("tenant_id", tenantId!)
    .eq("user_id", userId)
    .maybeSingle();
  let isAllowed = !!memberCheck;
  if (!isAllowed) {
    const { data: pa } = await admin
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("role", ["super_admin"])
      .maybeSingle();
    isAllowed = !!pa;
  }
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create conversation if we don't have one
  if (!conversationId) {
    const { data: created, error: cErr } = await admin
      .from("email_conversations")
      .insert({
        tenant_id: tenantId,
        account_id: accountId,
        subject,
        from_email: replyToAddress,
        from_name: null,
        thread_key: `out:${crypto.randomUUID()}`,
        status: "open",
        priority: "normal",
        last_message_at: new Date().toISOString(),
        last_message_preview: snippet(body.html, body.text),
        message_count: 0,
        assigned_to: userId,
        assigned_at: new Date().toISOString(),
      })
      .select("id, thread_key")
      .single();
    if (cErr || !created) {
      return new Response(JSON.stringify({ error: "conv_create_failed", detail: cErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    conversationId = created.id;
  }

  // Build Message-ID + threading headers
  const messageId = `<${crypto.randomUUID()}@aireatro.com>`;
  const extraHeaders: Record<string, string> = { "Message-ID": messageId };
  if (inReplyTo) extraHeaders["In-Reply-To"] = inReplyTo;
  if (referenceIds.length) extraHeaders["References"] = referenceIds.join(" ");

  // Send via Resend
  const sendRes = await resendSend({
    from: fromAddress,
    to: toList,
    cc: body.cc,
    bcc: body.bcc,
    subject,
    html: body.html,
    text: body.text,
    reply_to: replyToAddress,
    headers: extraHeaders,
    tags: [
      { name: "tenant", value: String(tenantId) },
      { name: "conversation", value: String(conversationId) },
    ],
  });

  // Persist message (always — even on failure, with error_message)
  const { data: msg } = await admin
    .from("email_messages")
    .insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      account_id: accountId,
      direction: "outbound",
      status: sendRes.ok ? "sent" : "failed",
      message_id: messageId,
      in_reply_to: inReplyTo,
      reference_ids: referenceIds,
      from_email: replyToAddress,
      from_name: null,
      to_emails: toList,
      cc_emails: body.cc || [],
      bcc_emails: body.bcc || [],
      reply_to: replyToAddress,
      subject,
      body_html: body.html || null,
      body_text: body.text || null,
      snippet: snippet(body.html, body.text),
      resend_id: sendRes.id || null,
      resend_event: sendRes.raw as unknown,
      sent_by: userId,
      error_message: sendRes.ok ? null : sendRes.error || `HTTP ${sendRes.status}`,
    })
    .select("id")
    .single();

  // Touch conversation
  await admin
    .from("email_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: snippet(body.html, body.text),
      status: "open",
    })
    .eq("id", conversationId);

  // Audit event
  await admin.from("email_events").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    message_id: msg?.id || null,
    actor_id: userId,
    actor_type: "user",
    event_type: sendRes.ok ? "message_sent" : "message_send_failed",
    payload: { to: toList, error: sendRes.ok ? undefined : sendRes.error },
  });

  if (!sendRes.ok) {
    return new Response(
      JSON.stringify({ error: "resend_send_failed", detail: sendRes.error, status: sendRes.status }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      conversation_id: conversationId,
      message_id: msg?.id,
      resend_id: sendRes.id,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
