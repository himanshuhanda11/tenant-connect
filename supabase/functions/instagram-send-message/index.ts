// Send Instagram DM via Meta Graph API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: claims, error: cErr } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub;

    const { conversationId, text } = await req.json();
    if (!conversationId || !text) {
      return new Response(JSON.stringify({ error: "Missing conversationId or text" }), { status: 400, headers: corsHeaders });
    }

    // Load conversation + verify access
    const { data: conv } = await sb
      .from("instagram_conversations")
      .select("*, contact:instagram_contacts(*), account:instagram_accounts(*)")
      .eq("id", conversationId)
      .maybeSingle();

    if (!conv) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404, headers: corsHeaders });
    }

    // Page token
    const { data: tok } = await svc
      .from("instagram_tokens")
      .select("page_access_token, access_token")
      .eq("instagram_account_id", conv.account.id)
      .maybeSingle();

    const pageToken = tok?.page_access_token || tok?.access_token;
    if (!pageToken) {
      return new Response(JSON.stringify({ error: "No access token for IG account" }), { status: 400, headers: corsHeaders });
    }

    // Send via Instagram Graph API (Instagram Login for Business)
    const sendRes = await fetch(
      `https://graph.instagram.com/v21.0/${conv.account.instagram_user_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pageToken}`,
        },
        body: JSON.stringify({
          recipient: { id: conv.contact.ig_user_id },
          message: { text },
        }),
      }
    );
    const sendJson = await sendRes.json();
    if (!sendRes.ok) {
      console.error("IG send failed:", sendJson);
      return new Response(JSON.stringify({ error: sendJson.error?.message || "Send failed", detail: sendJson }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const sentAt = new Date().toISOString();
    await svc.from("instagram_messages").insert({
      tenant_id: conv.tenant_id,
      conversation_id: conv.id,
      mid: sendJson.message_id,
      direction: "outbound",
      message_type: "text",
      text,
      agent_id: userId,
      sent_at: sentAt,
    });

    await svc
      .from("instagram_conversations")
      .update({
        last_message_text: text,
        last_message_at: sentAt,
        last_outbound_at: sentAt,
        unread_count: 0,
      })
      .eq("id", conv.id);

    return new Response(JSON.stringify({ success: true, message_id: sendJson.message_id }), { headers: corsHeaders });
  } catch (e) {
    console.error("instagram-send-message error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
