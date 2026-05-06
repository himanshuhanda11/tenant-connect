// Sends queued IG follow-ups whose send_at is due
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const GRAPH = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: due } = await sb
    .from("instagram_followups")
    .select("*, conversation:instagram_conversations(*, contact:instagram_contacts(*), account:instagram_accounts(*))")
    .eq("status", "queued")
    .lte("send_at", new Date().toISOString())
    .limit(100);

  let sent = 0, failed = 0;
  for (const f of due || []) {
    try {
      const conv = f.conversation;
      if (!conv) { failed++; continue; }
      const acc = conv.account, contact = conv.contact;
      const { data: tok } = await sb
        .from("instagram_tokens")
        .select("page_access_token, access_token")
        .eq("instagram_account_id", acc.id)
        .maybeSingle();
      const token = tok?.page_access_token || tok?.access_token;
      if (!token) throw new Error("no token");

      const r = await fetch(`${GRAPH}/${acc.facebook_page_id}/messages?access_token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: contact.ig_user_id },
          message: { text: f.text },
          messaging_type: "MESSAGE_TAG",
          tag: "ACCOUNT_UPDATE",
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || "send failed");

      const sentAt = new Date().toISOString();
      await sb.from("instagram_messages").insert({
        tenant_id: f.tenant_id, conversation_id: conv.id,
        mid: j.message_id, direction: "outbound", message_type: "text",
        text: f.text, sent_at: sentAt,
      });
      await sb.from("instagram_conversations").update({
        last_message_text: f.text, last_message_at: sentAt, last_outbound_at: sentAt,
      }).eq("id", conv.id);
      await sb.from("instagram_followups").update({
        status: "sent", sent_at: sentAt, attempts: (f.attempts || 0) + 1,
      }).eq("id", f.id);
      sent++;
    } catch (e) {
      const attempts = (f.attempts || 0) + 1;
      await sb.from("instagram_followups").update({
        status: attempts >= 3 ? "failed" : "queued",
        attempts,
        last_error: String(e),
        send_at: attempts >= 3 ? f.send_at : new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }).eq("id", f.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: (due || []).length, sent, failed }), { headers: corsHeaders });
});
