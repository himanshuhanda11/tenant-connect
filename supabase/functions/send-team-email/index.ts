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

    const sendOne = async (toAddr: string, subj: string, body: string, replyTo?: string) => {
      const payload: Record<string, unknown> = {
        from: "Aireatro <noreply@aireatro.com>",
        to: [toAddr],
        subject: subj,
        html: body,
        headers: {
          "List-Unsubscribe": "<mailto:admin@aireatro.com>",
        },
      };
      if (replyTo) payload.reply_to = replyTo;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      console.log(`Resend send → ${toAddr} | ok=${r.ok} | id=${(d as any)?.id || 'none'}`);
      if (!r.ok) console.error("Resend error:", d);
      return { ok: r.ok, data: d };
    };

    // New customer signup -> send to both customer and admin
    if (type === "signup_welcome") {
      const displayName = fullName || (userEmail || to || "").split("@")[0] || "there";
      const customerEmail = userEmail || to;
      if (!customerEmail) return json({ error: "Missing email for signup_welcome" }, 400);

      const customerHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Brand -->
        <tr><td align="center" style="padding-bottom:28px;">
          <div style="font-size:30px;font-weight:800;letter-spacing:-0.6px;color:#0f172a;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);vertical-align:middle;margin-right:10px;"></span>Aireatro
          </div>
        </td></tr>

        <!-- Hero card -->
        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);border-radius:20px 20px 0 0;padding:40px 36px 56px;text-align:center;color:#ffffff;">
          <div style="font-size:44px;line-height:1;margin-bottom:14px;">🎉</div>
          <p style="margin:0 0 6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;font-weight:600;">Welcome aboard</p>
          <h1 style="margin:0;font-size:30px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">Hi ${displayName}, you're in.</h1>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:40px 36px;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
          <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">
            Welcome to <strong style="color:#0f172a;">Aireatro</strong> — the WhatsApp CRM that turns conversations into customers. Your account is ready and you can be live in <strong>under 10 minutes</strong>.
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px;">
            <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <table width="100%"><tr>
                <td width="36" style="vertical-align:middle;"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;text-align:center;line-height:32px;font-size:14px;">1</div></td>
                <td style="padding-left:14px;"><div style="font-size:14px;font-weight:600;color:#0f172a;">Create your workspace</div><div style="font-size:13px;color:#64748b;margin-top:2px;">Pick a name and connect your WhatsApp number.</div></td>
              </tr></table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <table width="100%"><tr>
                <td width="36" style="vertical-align:middle;"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;font-weight:700;text-align:center;line-height:32px;font-size:14px;">2</div></td>
                <td style="padding-left:14px;"><div style="font-size:14px;font-weight:600;color:#0f172a;">Invite your team</div><div style="font-size:13px;color:#64748b;margin-top:2px;">Roles, permissions, and shared inbox in one click.</div></td>
              </tr></table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:14px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <table width="100%"><tr>
                <td width="36" style="vertical-align:middle;"><div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff;font-weight:700;text-align:center;line-height:32px;font-size:14px;">3</div></td>
                <td style="padding-left:14px;"><div style="font-size:14px;font-weight:600;color:#0f172a;">Launch your first campaign</div><div style="font-size:13px;color:#64748b;margin-top:2px;">Templates, automations, and AI replies — ready to go.</div></td>
              </tr></table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%"><tr><td align="center" style="padding:8px 0 4px;">
            <a href="${baseUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:14px;font-weight:700;font-size:15px;letter-spacing:0.2px;box-shadow:0 10px 24px rgba(99,102,241,0.35);">
              Open your dashboard →
            </a>
          </td></tr></table>

          <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
            Questions? Just reply to this email or reach us at<br/>
            <a href="mailto:${ADMIN_EMAIL}" style="color:#6366f1;text-decoration:none;font-weight:600;">${ADMIN_EMAIL}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:24px 16px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Aireatro — WhatsApp CRM, reimagined.</p>
          <p style="margin:0;font-size:11px;color:#cbd5e1;">© ${new Date().getFullYear()} Aireatro. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

      const initial = (displayName.trim()[0] || "U").toUpperCase();
      const signupTime = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
      const adminHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Brand -->
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);vertical-align:middle;margin-right:8px;"></span>Aireatro · Admin
          </div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
          <!-- Top accent -->
          <div style="height:4px;background:linear-gradient(90deg,#10b981 0%,#06b6d4 50%,#6366f1 100%);"></div>

          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:36px 36px 8px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#10b981;font-weight:700;">● New Signup</p>
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">A new customer just joined</h1>
            <p style="margin:0;font-size:14px;color:#64748b;">${signupTime}</p>
          </td></tr></table>

          <!-- User block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;"><tr><td style="padding:24px 0 8px;">
            <table width="100%" style="background:linear-gradient(135deg,#f8fafc,#eef2ff);border:1px solid #e2e8f0;border-radius:14px;">
              <tr><td style="padding:20px 22px;">
                <table width="100%"><tr>
                  <td width="56" style="vertical-align:middle;">
                    <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;text-align:center;line-height:48px;font-size:18px;">${initial}</div>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <div style="font-size:16px;font-weight:700;color:#0f172a;">${displayName}</div>
                    <div style="font-size:13px;color:#64748b;margin-top:2px;">${customerEmail}</div>
                  </td>
                </tr></table>
              </td></tr>
            </table>
          </td></tr></table>

          <!-- Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:8px 36px 28px;"><tr><td>
            <table width="100%" style="border-collapse:separate;border-spacing:0 6px;">
              <tr>
                <td style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;width:120px;padding:6px 0;">Source</td>
                <td style="font-size:14px;color:#0f172a;font-weight:500;">Public signup</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;padding:6px 0;">Status</td>
                <td><span style="display:inline-block;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">Active</span></td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;padding:6px 0;">Plan</td>
                <td style="font-size:14px;color:#0f172a;font-weight:500;">Free</td>
              </tr>
            </table>
          </td></tr></table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px 36px;"><tr><td align="center">
            <a href="${baseUrl}/control" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.2px;">
              View in Control Center →
            </a>
          </td></tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:24px 16px 0;">
          <p style="margin:0;font-size:11px;color:#cbd5e1;">Internal notification · Aireatro Admin</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

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
