// Scheduled function: emails workspace owners when message-credit balance is low.
// Throttled via message_credits.low_balance_alert_sent_at (24h cooldown).
// Trigger via cron (e.g., daily) or manually by super admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOW_THRESHOLD = 50;
const COOLDOWN_HOURS = 24;
const APP_URL = Deno.env.get("APP_URL") || "https://aireatro.com";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("[low-balance] RESEND_API_KEY missing, skipping send", to);
    return false;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Aireatro <noreply@aireatro.com>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!r.ok) console.error("[low-balance] resend error", await r.text());
  return r.ok;
}

function buildHtml(workspaceName: string, balance: number) {
  const url = `${APP_URL}/billing?tab=credits`;
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F5F6FA;padding:40px 16px;color:#0B1020;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="560" style="max-width:560px;background:#fff;border-radius:16px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 8px;font-size:20px;">Low message credits</h1>
        <p style="color:#5B6478;font-size:14px;line-height:1.55;margin:0 0 20px;">
          Your workspace <strong>${workspaceName}</strong> has only
          <strong style="color:#B45309;">${balance} message credits</strong> remaining.
          Top up to keep your broadcasts and template messages running without interruption.
        </p>
        <a href="${url}" style="display:inline-block;background:#0B1020;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600;">Top up credits</a>
        <p style="color:#9AA3B7;font-size:12px;margin:24px 0 0;">You're receiving this because you own the workspace. We send at most one alert per day.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = admin();
    const cooldownIso = new Date(Date.now() - COOLDOWN_HOURS * 3600 * 1000).toISOString();

    const { data: wallets, error } = await sb
      .from("message_credits")
      .select("tenant_id, balance, low_balance_alert_sent_at, tenants:tenant_id(name, owner_user_id)")
      .lt("balance", LOW_THRESHOLD)
      .gt("balance", 0)
      .or(`low_balance_alert_sent_at.is.null,low_balance_alert_sent_at.lt.${cooldownIso}`);

    if (error) throw error;

    let sent = 0;
    for (const w of wallets || []) {
      const ownerId = (w as any).tenants?.owner_user_id;
      const wsName = (w as any).tenants?.name || "Your workspace";
      if (!ownerId) continue;
      const { data: u } = await sb.auth.admin.getUserById(ownerId);
      const email = u?.user?.email;
      if (!email) continue;
      const ok = await sendEmail(email, `Low message credits — ${wsName}`, buildHtml(wsName, w.balance));
      if (ok) {
        await sb.from("message_credits").update({ low_balance_alert_sent_at: new Date().toISOString() }).eq("tenant_id", w.tenant_id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ checked: wallets?.length || 0, sent }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[low-balance] error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
