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

    const { type, to, inviteeName, workspaceName, token, appUrl, fullName, email: userEmail } = await req.json();

    if (!type) {
      return json({ error: "Missing required field: type" }, 400);
    }
    if (type !== "signup_welcome" && !to) {
      return json({ error: "Missing required field: to" }, 400);
    }

    const baseUrl = appUrl || Deno.env.get("APP_URL") || "https://aireatro.com";
    const ADMIN_EMAIL = "admin@aireatro.com";

    const sendOne = async (toAddr: string, subj: string, body: string) => {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Aireatro <noreply@aireatro.com>",
          to: [toAddr],
          subject: subj,
          html: body,
        }),
      });
      const d = await r.json();
      if (!r.ok) console.error("Resend error:", d);
      return { ok: r.ok, data: d };
    };

    // New customer signup -> send to both customer and admin
    if (type === "signup_welcome") {
      const displayName = fullName || (userEmail || to || "").split("@")[0] || "there";
      const customerEmail = userEmail || to;
      if (!customerEmail) return json({ error: "Missing email for signup_welcome" }, 400);

      const customerHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
          <table width="520" style="max-width:520px;width:100%;">
            <tr><td align="center" style="padding-bottom:32px;"><div style="font-size:28px;font-weight:800;color:#0f172a;"><span style="color:#6366f1;">●</span> Aireatro</div></td></tr>
            <tr><td><table width="100%" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.04);">
              <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa);"></td></tr>
              <tr><td style="padding:40px 36px;">
                <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Welcome</p>
                <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#0f172a;">Hi ${displayName} 👋</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">Welcome to <strong>Aireatro</strong> — your WhatsApp CRM is ready. Set up your workspace in under 10 minutes and start converting conversations into customers.</p>
                <table width="100%"><tr><td align="center" style="padding:4px 0;"><a href="${baseUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:600;">Open Dashboard →</a></td></tr></table>
                <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">Need help? Reply to this email or contact ${ADMIN_EMAIL}.</p>
              </td></tr>
            </table></td></tr>
          </table>
        </td></tr></table></body></html>`;

      const adminHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
          <table width="520" style="max-width:520px;width:100%;">
            <tr><td align="center" style="padding-bottom:24px;"><div style="font-size:24px;font-weight:800;color:#0f172a;"><span style="color:#10b981;">●</span> New Signup</div></td></tr>
            <tr><td><table width="100%" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.04);">
              <tr><td style="padding:32px 36px;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">New customer registered</h1>
                <table width="100%" style="background:#f8fafc;border-radius:10px;"><tr><td style="padding:16px 20px;font-size:14px;color:#475569;line-height:1.8;">
                  <strong>Name:</strong> ${displayName}<br/>
                  <strong>Email:</strong> ${customerEmail}<br/>
                  <strong>Time:</strong> ${new Date().toISOString()}
                </td></tr></table>
              </td></tr>
            </table></td></tr>
          </table>
        </td></tr></table></body></html>`;

      const [c, a] = await Promise.all([
        sendOne(customerEmail, "Welcome to Aireatro 🎉", customerHtml),
        sendOne(ADMIN_EMAIL, `New signup: ${displayName} (${customerEmail})`, adminHtml),
      ]);
      return json({ success: c.ok && a.ok, customer: c.data, admin: a.data });
    }

    let subject: string;
    let html: string;

    if (type === "invite") {
      const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;
      const displayWorkspace = workspaceName || "Aireatro";
      const displayName = inviteeName || "there";
      subject = `${displayWorkspace} invited you to join on Aireatro`;
      html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        
        <!-- Logo / Brand -->
        <tr><td align="center" style="padding-bottom:32px;">
          <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;">
            <span style="color:#6366f1;">●</span> Aireatro
          </div>
        </td></tr>

        <!-- Main Card -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 30px rgba(0,0,0,0.04);">
            
            <!-- Header accent bar -->
            <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%);"></td></tr>
            
            <!-- Content -->
            <tr><td style="padding:40px 36px 36px;">
              
              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Team Invitation</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#0f172a;line-height:1.3;">
                Hi ${displayName} 👋
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                You've been invited to join <strong>${displayWorkspace}</strong> on Aireatro. Accept the invitation below to get started.
              </p>
              
              <!-- Workspace info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:28px;">
                <tr><td style="padding:20px 24px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;text-align:center;vertical-align:middle;">
                        <span style="color:#ffffff;font-size:18px;font-weight:700;">${displayWorkspace.charAt(0).toUpperCase()}</span>
                      </td>
                      <td style="padding-left:16px;">
                        <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${displayWorkspace}</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#64748b;">invited you to join the team</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:4px 0 8px;">
                  <a href="${acceptUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:600;font-size:16px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">
                    Accept Invitation →
                  </a>
                </td></tr>
              </table>

              <!-- Alternative link -->
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                Or copy this link: <br/>
                <a href="${acceptUrl}" style="color:#6366f1;word-break:break-all;">${acceptUrl}</a>
              </p>

            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:28px 0 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
            This invitation expires in 7 days
          </p>
          <p style="margin:0;font-size:11px;color:#cbd5e1;">
            Sent by Aireatro · If you didn't expect this, you can safely ignore it.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `;
    } else if (type === "password_reset") {
      subject = "Reset your Aireatro password";
      html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        
        <tr><td align="center" style="padding-bottom:32px;">
          <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;">
            <span style="color:#6366f1;">●</span> Aireatro
          </div>
        </td></tr>

        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 30px rgba(0,0,0,0.04);">
            <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%);"></td></tr>
            <tr><td style="padding:40px 36px 36px;">
              
              <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Security</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0f172a;line-height:1.3;">
                Reset your password
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
                We received a request to reset the password for your account. Click the button below to choose a new password.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:4px 0 8px;">
                  <a href="${baseUrl}/reset-password?token=${token}" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">
                    Reset Password
                  </a>
                </td></tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
                If you didn't request this, you can safely ignore this email.
              </p>

            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px 0 0;text-align:center;">
          <p style="margin:0;font-size:11px;color:#cbd5e1;">
            Sent by Aireatro
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
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
        from: "Aireatro <noreply@aireatro.com>",
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
