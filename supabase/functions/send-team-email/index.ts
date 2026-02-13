import { corsHeaders, json, getAdminClient } from "../_shared/supabase.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }

    const { type, to, inviterName, workspaceName, token, appUrl } = await req.json();

    if (!to || !type) {
      return json({ error: "Missing required fields: to, type" }, 400);
    }

    const baseUrl = appUrl || Deno.env.get("APP_URL") || "https://smeksh.lovable.app";

    let subject: string;
    let html: string;

    if (type === "invite") {
      const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;
      subject = `You're invited to join ${workspaceName || "the team"}`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">You're Invited! 🎉</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Hi there,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              <strong>${inviterName || "A team member"}</strong> has invited you to join 
              <strong>${workspaceName || "their workspace"}</strong>.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${acceptUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 24px 0 0;">
              This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by ${workspaceName || "Smeksh"}
          </p>
        </div>
      `;
    } else if (type === "password_reset") {
      subject = "Reset your password";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Password Reset 🔐</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Hi there,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              A password reset was requested for your account. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${baseUrl}/reset-password?token=${token}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 24px 0 0;">
              If you didn't request this, you can safely ignore it.
            </p>
          </div>
        </div>
      `;
    } else {
      return json({ error: "Unknown email type" }, 400);
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Smeksh <noreply@aireatro.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return json({ error: "Failed to send email", details: resendData }, 500);
    }

    return json({ success: true, id: resendData.id });
  } catch (err) {
    console.error("send-team-email error:", err);
    return json({ error: err.message }, 500);
  }
});
