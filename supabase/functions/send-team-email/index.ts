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

      const initial = (displayName.trim()[0] || "U").toUpperCase();
      const signupTime = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
      const year = new Date().getFullYear();

      // Shared design tokens
      const FONT = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;
      const INK = "#0B1020";
      const SUB = "#5B6478";
      const FAINT = "#9AA3B7";
      const HAIR = "#EDF0F6";
      const BG = "#F5F6FA";
      const ACCENT = "#0B1020";

      // ---------- CUSTOMER WELCOME ----------
      const customerHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Aireatro</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Aireatro account is ready — let's turn conversations into customers.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:56px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr><td align="center" style="padding:0 0 28px;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-0.2px;color:${INK};">Aireatro</div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#FFFFFF;border-radius:20px;border:1px solid ${HAIR};overflow:hidden;">
          
          <!-- Hero -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:56px 48px 40px;text-align:left;">
              <p style="margin:0 0 14px;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${FAINT};font-weight:600;">Welcome aboard</p>
              <h1 style="margin:0 0 16px;font-size:34px;font-weight:700;line-height:1.15;letter-spacing:-0.8px;color:${INK};">
                Hi ${displayName},<br/>your workspace is ready.
              </h1>
              <p style="margin:0;font-size:16px;line-height:1.65;color:${SUB};max-width:460px;">
                Aireatro turns WhatsApp into your most reliable revenue channel — shared inbox, automations, AI replies, and ad attribution in one calm workspace.
              </p>
            </td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 48px 44px;">
              <a href="${baseUrl}/dashboard" style="display:inline-block;background:${ACCENT};color:#FFFFFF;text-decoration:none;padding:15px 28px;border-radius:12px;font-weight:600;font-size:15px;letter-spacing:-0.1px;">
                Open dashboard
              </a>
              <a href="${baseUrl}/help" style="display:inline-block;margin-left:8px;color:${INK};text-decoration:none;padding:15px 20px;border-radius:12px;font-weight:600;font-size:15px;letter-spacing:-0.1px;border:1px solid ${HAIR};">
                Quick start
              </a>
            </td></tr>
          </table>

          <!-- Divider -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:0 48px;"><div style="height:1px;background:${HAIR};"></div></td></tr>
          </table>

          <!-- Steps -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 48px 12px;">
              <p style="margin:0 0 22px;font-size:13px;color:${FAINT};letter-spacing:1.6px;text-transform:uppercase;font-weight:600;">Three steps · &lt; 10 minutes</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="34" valign="top" style="padding:2px 0;"><div style="width:26px;height:26px;border-radius:50%;border:1.5px solid ${INK};color:${INK};text-align:center;line-height:23px;font-size:12px;font-weight:700;">1</div></td>
                  <td valign="top" style="padding:0 0 22px 14px;">
                    <div style="font-size:15px;font-weight:600;color:${INK};margin-bottom:4px;">Connect your WhatsApp number</div>
                    <div style="font-size:14px;color:${SUB};line-height:1.6;">Embedded signup in two minutes — no Meta paperwork.</div>
                  </td>
                </tr>
                <tr>
                  <td width="34" valign="top" style="padding:2px 0;"><div style="width:26px;height:26px;border-radius:50%;border:1.5px solid ${INK};color:${INK};text-align:center;line-height:23px;font-size:12px;font-weight:700;">2</div></td>
                  <td valign="top" style="padding:0 0 22px 14px;">
                    <div style="font-size:15px;font-weight:600;color:${INK};margin-bottom:4px;">Invite your team</div>
                    <div style="font-size:14px;color:${SUB};line-height:1.6;">Roles, routing, and a shared inbox that never drops a lead.</div>
                  </td>
                </tr>
                <tr>
                  <td width="34" valign="top" style="padding:2px 0;"><div style="width:26px;height:26px;border-radius:50%;border:1.5px solid ${INK};color:${INK};text-align:center;line-height:23px;font-size:12px;font-weight:700;">3</div></td>
                  <td valign="top" style="padding:0 0 8px 14px;">
                    <div style="font-size:15px;font-weight:600;color:${INK};margin-bottom:4px;">Launch your first campaign</div>
                    <div style="font-size:14px;color:${SUB};line-height:1.6;">Pre-built templates, automations, and AI auto-replies.</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Quote -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 48px 48px;">
              <div style="background:${BG};border-radius:14px;padding:22px 24px;">
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${INK};font-weight:500;">"We replied to leads in under 60 seconds — closed 38% more in week one."</p>
                <p style="margin:0;font-size:13px;color:${FAINT};">— Founder, Paradise Migration</p>
              </div>
            </td></tr>
          </table>

        </td></tr>

        <!-- Sub-footer -->
        <tr><td align="center" style="padding:28px 16px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:${SUB};">Need a hand? Reply to this email or write to <a href="mailto:${ADMIN_EMAIL}" style="color:${INK};text-decoration:none;font-weight:600;">${ADMIN_EMAIL}</a>.</p>
          <p style="margin:14px 0 0;font-size:12px;color:${FAINT};">© ${year} Aireatro · WhatsApp CRM, reimagined.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;

      // ---------- ADMIN NOTIFICATION ----------
      const adminHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New signup</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${displayName} (${customerEmail}) just created an Aireatro account.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:56px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Brand bar -->
        <tr><td style="padding:0 0 22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td align="left" style="font-size:14px;font-weight:700;color:${INK};letter-spacing:-0.1px;">Aireatro · Admin</td>
            <td align="right" style="font-size:12px;color:${FAINT};font-weight:500;">${signupTime}</td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#FFFFFF;border-radius:20px;border:1px solid ${HAIR};overflow:hidden;">

          <!-- Header -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 36px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0 0 14px;">
                  <span style="display:inline-block;background:#E8F7EE;color:#0F7B3B;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;padding:5px 10px;border-radius:999px;">● New signup</span>
                </td></tr>
              </table>
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:${INK};line-height:1.25;">A new customer just joined Aireatro</h1>
            </td></tr>
          </table>

          <!-- User row -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:14px;">
                <tr><td style="padding:18px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td width="56" valign="middle">
                      <div style="width:44px;height:44px;border-radius:50%;background:${INK};color:#FFFFFF;text-align:center;line-height:44px;font-size:16px;font-weight:700;letter-spacing:-0.3px;">${initial}</div>
                    </td>
                    <td valign="middle" style="padding-left:14px;">
                      <div style="font-size:15px;font-weight:600;color:${INK};letter-spacing:-0.1px;">${displayName}</div>
                      <div style="font-size:13px;color:${SUB};margin-top:2px;">
                        <a href="mailto:${customerEmail}" style="color:${SUB};text-decoration:none;">${customerEmail}</a>
                      </div>
                    </td>
                  </tr></table>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Meta grid -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 36px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top" style="padding:14px 8px 14px 0;border-bottom:1px solid ${HAIR};">
                    <div style="font-size:11px;color:${FAINT};letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Source</div>
                    <div style="font-size:14px;color:${INK};font-weight:500;">Public signup</div>
                  </td>
                  <td width="50%" valign="top" style="padding:14px 0 14px 8px;border-bottom:1px solid ${HAIR};">
                    <div style="font-size:11px;color:${FAINT};letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Plan</div>
                    <div style="font-size:14px;color:${INK};font-weight:500;">Free</div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding:14px 8px 14px 0;">
                    <div style="font-size:11px;color:${FAINT};letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Status</div>
                    <div style="font-size:14px;color:${INK};font-weight:500;">
                      <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;margin-right:6px;vertical-align:middle;"></span>Active
                    </div>
                  </td>
                  <td valign="top" style="padding:14px 0 14px 8px;">
                    <div style="font-size:11px;color:${FAINT};letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Signed up</div>
                    <div style="font-size:14px;color:${INK};font-weight:500;">${signupTime}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 36px 36px;">
              <a href="${baseUrl}/control" style="display:inline-block;background:${ACCENT};color:#FFFFFF;text-decoration:none;padding:13px 24px;border-radius:11px;font-weight:600;font-size:14px;letter-spacing:-0.1px;">
                View in Control Center
              </a>
              <a href="mailto:${customerEmail}" style="display:inline-block;margin-left:6px;color:${INK};text-decoration:none;padding:13px 20px;border-radius:11px;font-weight:600;font-size:14px;letter-spacing:-0.1px;border:1px solid ${HAIR};">
                Reply to ${displayName.split(' ')[0]}
              </a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:22px 16px 0;">
          <p style="margin:0;font-size:11px;color:${FAINT};letter-spacing:0.2px;">Internal notification · Aireatro Admin · © ${year}</p>
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
