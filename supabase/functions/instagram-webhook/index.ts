// Instagram Messaging Webhook
// Handles GET verification + POST events (messages, reactions, reads, media)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") || "aireatro_verify";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function getAccountByPageId(pageId: string) {
  const { data } = await sb
    .from("instagram_accounts")
    .select("*")
    .eq("facebook_page_id", pageId)
    .maybeSingle();
  return data;
}

async function getAccountByIgId(igId: string) {
  const { data } = await sb
    .from("instagram_accounts")
    .select("*")
    .eq("instagram_user_id", igId)
    .maybeSingle();
  return data;
}

async function getPageToken(accountId: string) {
  const { data } = await sb
    .from("instagram_tokens")
    .select("page_access_token, access_token")
    .eq("instagram_account_id", accountId)
    .maybeSingle();
  return data?.page_access_token || data?.access_token;
}

async function fetchIgProfile(igUserId: string, token: string) {
  try {
    const r = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}?fields=name,username,profile_pic,follower_count,is_verified_user&access_token=${token}`
    );
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function upsertContact(account: any, igUserId: string) {
  const token = await getPageToken(account.id);
  let profile: any = {};
  if (token) profile = (await fetchIgProfile(igUserId, token)) || {};

  const { data: existing } = await sb
    .from("instagram_contacts")
    .select("*")
    .eq("instagram_account_id", account.id)
    .eq("ig_user_id", igUserId)
    .maybeSingle();

  if (existing) return existing;

  const { data: contact } = await sb
    .from("instagram_contacts")
    .insert({
      tenant_id: account.tenant_id,
      instagram_account_id: account.id,
      ig_user_id: igUserId,
      username: profile.username || null,
      name: profile.name || null,
      profile_pic_url: profile.profile_pic || null,
      follower_count: profile.follower_count ?? null,
      is_verified: !!profile.is_verified_user,
    })
    .select()
    .single();

  // Auto-create lead in CRM
  try {
    await sb.from("leads").insert({
      tenant_id: account.tenant_id,
      name: profile.name || profile.username || `IG ${igUserId.slice(-6)}`,
      source: "instagram",
      stage: "new",
      metadata: { ig_user_id: igUserId, ig_username: profile.username, ig_contact_id: contact?.id },
    });
  } catch (e) {
    console.warn("lead create failed:", e);
  }

  return contact;
}

async function getOrCreateConversation(account: any, contact: any) {
  const { data: existing } = await sb
    .from("instagram_conversations")
    .select("*")
    .eq("instagram_account_id", account.id)
    .eq("contact_id", contact.id)
    .maybeSingle();
  if (existing) return existing;

  const { data: conv } = await sb
    .from("instagram_conversations")
    .insert({
      tenant_id: account.tenant_id,
      instagram_account_id: account.id,
      contact_id: contact.id,
      status: "open",
    })
    .select()
    .single();
  return conv;
}

async function handleMessaging(account: any, m: any) {
  const senderId = m.sender?.id;
  const recipientId = m.recipient?.id;
  if (!senderId || !recipientId) return;

  // Determine direction: if sender == our IG account → outbound (echo), else inbound
  const isOutbound = senderId === account.instagram_user_id;
  const otherUserId = isOutbound ? recipientId : senderId;

  const contact = await upsertContact(account, otherUserId);
  if (!contact) return;
  const conv = await getOrCreateConversation(account, contact);
  if (!conv) return;

  // Reactions
  if (m.reaction) {
    await sb.from("instagram_messages").insert({
      tenant_id: account.tenant_id,
      conversation_id: conv.id,
      mid: m.reaction.mid,
      direction: isOutbound ? "outbound" : "inbound",
      message_type: "reaction",
      reaction: m.reaction.emoji || m.reaction.action || null,
      raw: m,
      sent_at: new Date(m.timestamp || Date.now()).toISOString(),
    });
    return;
  }

  // Read receipts
  if (m.read) {
    await sb
      .from("instagram_messages")
      .update({ is_read: true })
      .eq("conversation_id", conv.id)
      .eq("direction", "outbound")
      .lte("sent_at", new Date(m.read.watermark || Date.now()).toISOString());
    return;
  }

  // Message
  if (m.message) {
    if (m.message.is_echo && !isOutbound) return; // ignore echoes if not from us
    if (m.message.is_deleted) {
      if (m.message.mid) {
        await sb.from("instagram_messages").update({ is_deleted: true }).eq("mid", m.message.mid);
      }
      return;
    }

    const att = m.message.attachments?.[0];
    const mediaType = att?.type || null;
    const mediaUrl = att?.payload?.url || null;
    const text = m.message.text || null;

    const sentAt = new Date(m.timestamp || Date.now()).toISOString();

    await sb.from("instagram_messages").insert({
      tenant_id: account.tenant_id,
      conversation_id: conv.id,
      mid: m.message.mid,
      direction: isOutbound ? "outbound" : "inbound",
      message_type: mediaType ? "media" : "text",
      text,
      media_url: mediaUrl,
      media_type: mediaType,
      raw: m,
      sent_at: sentAt,
    });

    // Update conversation snapshot
    const updates: any = {
      last_message_text: text || (mediaType ? `[${mediaType}]` : ""),
      last_message_at: sentAt,
    };
    if (isOutbound) {
      updates.last_outbound_at = sentAt;
    } else {
      updates.last_inbound_at = sentAt;
      updates.unread_count = (conv.unread_count || 0) + 1;
      if (conv.status === "closed") updates.status = "open";
    }
    await sb.from("instagram_conversations").update(updates).eq("id", conv.id);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // GET → webhook verification
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge || "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("[ig-webhook] event:", JSON.stringify(body).slice(0, 500));

    if (body.object !== "instagram" && body.object !== "page") {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    for (const entry of body.entry || []) {
      // entry.id is page_id (page object) OR ig_business_id (instagram object)
      let account = await getAccountByIgId(entry.id);
      if (!account) account = await getAccountByPageId(entry.id);
      if (!account) {
        console.warn("[ig-webhook] no account for entry id:", entry.id);
        continue;
      }
      for (const m of entry.messaging || []) {
        await handleMessaging(account, m);
      }
    }
    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("[ig-webhook] error:", e);
    return new Response("error", { status: 200, headers: corsHeaders });
  }
});
