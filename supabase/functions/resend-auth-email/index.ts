// Supabase Auth "Send Email" hook — routes ALL auth emails through Resend.
//
// Setup (manual, one-time, in Lovable Cloud → Users → Auth Settings → "Send Email" hook):
//   URL:    https://<project-ref>.supabase.co/functions/v1/resend-auth-email
//   Secret: paste the webhook signing secret Supabase generates and
//           store it as SUPABASE_AUTH_HOOK_SECRET via the secret tool.
//
// Payload contract (Supabase docs):
//   { user, email_data: { token, token_hash, redirect_to, email_action_type, site_url, ... } }
//
// We also accept Resend webhook calls? No — this endpoint is auth-only.

import { resendSend, RESEND_FROM_DEFAULT, RESEND_REPLY_TO_DEFAULT } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

const SITE_NAME = "Aireatro";
const ROOT_URL = "https://aireatro.com";

interface AuthHookPayload {
  user?: { id?: string; email?: string };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
    new_email?: string;
  };
}

const SUBJECTS: Record<string, string> = {
  signup: "Confirm your email — Aireatro",
  invite: "You've been invited to Aireatro",
  magiclink: "Your Aireatro login link",
  recovery: "Reset your Aireatro password",
  email_change: "Confirm your new email — Aireatro",
  reauthentication: "Your Aireatro verification code",
};

function htmlShell(title: string, intro: string, ctaUrl: string, ctaLabel: string, footer: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F5F6FA;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,Arial,sans-serif;color:#0B1020;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6FA;padding:56px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding:0 0 28px;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-0.2px;color:#0B1020;">${SITE_NAME}</div>
        </td></tr>
        <tr><td style="background:#FFFFFF;border-radius:20px;border:1px solid #EDF0F6;padding:48px;">
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;letter-spacing:-0.6px;">${title}</h1>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#5B6478;">${intro}</p>
          <p style="margin:0 0 28px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#0B1020;color:#FFFFFF;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:600;font-size:15px;">${ctaLabel}</a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#9AA3B7;word-break:break-all;">If the button doesn't work, paste this link into your browser:<br/><a href="${ctaUrl}" style="color:#5B6478;">${ctaUrl}</a></p>
        </td></tr>
        <tr><td align="center" style="padding:24px 0 0;font-size:12px;color:#9AA3B7;line-height:1.6;">${footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildEmail(actionType: string, email: string, link: string, token: string): { subject: string; html: string; text: string } {
  const subject = SUBJECTS[actionType] || `${SITE_NAME} notification`;
  const footer = `© ${new Date().getFullYear()} Aireatro · You received this because someone (hopefully you) requested it for ${email}.`;

  if (actionType === "reauthentication") {
    const html = htmlShell(
      "Your verification code",
      `Use the code below to verify your identity. This code expires shortly.`,
      ROOT_URL,
      "Open Aireatro",
      footer,
    ).replace(
      "<p style=\"margin:0 0 28px;\">",
      `<div style="font-size:36px;font-weight:700;letter-spacing:6px;text-align:center;padding:18px;background:#F5F6FA;border-radius:12px;margin:0 0 28px;">${token}</div><p style="margin:0 0 28px;">`,
    );
    return { subject, html, text: `Your Aireatro verification code: ${token}` };
  }

  const intros: Record<string, string> = {
    signup: "Confirm your email to activate your Aireatro account.",
    invite: "You've been invited to join an Aireatro workspace.",
    magiclink: "Click the button below to sign in to Aireatro.",
    recovery: "Click the button below to set a new password.",
    email_change: "Confirm this new email address for your Aireatro account.",
  };
  const ctaLabel: Record<string, string> = {
    signup: "Confirm email",
    invite: "Accept invite",
    magiclink: "Sign in",
    recovery: "Reset password",
    email_change: "Confirm email",
  };

  const html = htmlShell(
    SUBJECTS[actionType] || `${SITE_NAME} notification`,
    intros[actionType] || "Tap the button below to continue.",
    link,
    ctaLabel[actionType] || "Continue",
    footer,
  );
  const text = `${intros[actionType] || "Continue"}\n\n${link}\n\n${footer}`;
  return { subject, html, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Supabase Auth Send Email Hook uses Svix-compatible signature headers
  // and the hook secret you configure in Auth Settings. Verifying here is
  // optional but recommended — store the hook secret as SUPABASE_AUTH_HOOK_SECRET.
  const rawBody = await req.text();

  const hookSecret = Deno.env.get("SUPABASE_AUTH_HOOK_SECRET");
  if (hookSecret) {
    try {
      const id = req.headers.get("webhook-id") || req.headers.get("svix-id");
      const ts = req.headers.get("webhook-timestamp") || req.headers.get("svix-timestamp");
      const sig = req.headers.get("webhook-signature") || req.headers.get("svix-signature");
      if (!id || !ts || !sig) throw new Error("missing_signature_headers");

      const raw = hookSecret.startsWith("v1,whsec_")
        ? hookSecret.slice(9)
        : hookSecret.startsWith("whsec_")
        ? hookSecret.slice(6)
        : hookSecret;
      let keyBytes: Uint8Array;
      try {
        keyBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      } catch {
        keyBytes = new TextEncoder().encode(raw);
      }
      const key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const macBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${rawBody}`));
      const expected = btoa(String.fromCharCode(...new Uint8Array(macBuf)));
      const provided = sig.split(" ").map((s) => s.split(",")[1]).filter(Boolean);
      const ok = provided.some((p) => p === expected);
      if (!ok) {
        console.error("[resend-auth-email] invalid signature");
        return new Response(JSON.stringify({ error: "invalid_signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      console.error("[resend-auth-email] sig verify error", e);
      return new Response(JSON.stringify({ error: "signature_error" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let payload: AuthHookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = payload.user?.email;
  const ed = payload.email_data || {};
  const actionType = ed.email_action_type || "signup";
  if (!email) {
    return new Response(JSON.stringify({ error: "missing_user_email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Build the verification link Supabase Auth would normally build itself.
  // For Send Email hooks, you must construct the URL using site_url + verify endpoint + token_hash.
  const siteUrl = (ed.site_url || ROOT_URL).replace(/\/$/, "");
  const tokenHash = ed.token_hash || "";
  const redirectTo = ed.redirect_to || `${siteUrl}/`;
  const link = `${siteUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(actionType)}&redirect_to=${encodeURIComponent(redirectTo)}`;

  const { subject, html, text } = buildEmail(actionType, email, link, ed.token || "");

  const send = await resendSend({
    from: RESEND_FROM_DEFAULT,
    to: email,
    reply_to: RESEND_REPLY_TO_DEFAULT,
    subject,
    html,
    text,
    tags: [
      { name: "kind", value: "auth" },
      { name: "action", value: actionType },
    ],
  });

  if (!send.ok) {
    console.error("[resend-auth-email] send failed", send.error);
    return new Response(
      JSON.stringify({ error: "send_failed", detail: send.error }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  console.log("[resend-auth-email] sent", { actionType, email, id: send.id });
  return new Response(JSON.stringify({ ok: true, id: send.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
