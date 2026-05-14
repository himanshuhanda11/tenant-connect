import { corsHeaders, json, getAdminClient } from "../_shared/supabase.ts";

// Verified Lovable Emails sender (Mailgun via update.aireatro.com).
// We route ALL transactional notifications through the Lovable Emails queue
// because aireatro.com apex is not verified in Resend (only Google Workspace
// MX exists), which caused admin notifications for demo/signup/invite to
// silently bounce. update.aireatro.com is delegated to Lovable's NS, has
// SPF + DKIM, and has proven delivery in email_send_log.
const SENDER_DOMAIN = "update.aireatro.com";
const FROM_ADDRESS = "Aireatro <noreply@update.aireatro.com>";

// Strip diacritics + drop non-ASCII so subject lines never break headers
function asciiSafe(s: string): string {
  return (s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function genToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const __body = await req.json();
    (req as any).__parsed = __body;
    const { type, to, inviteeName, workspaceName, token, appUrl, fullName, email: userEmail } = __body;

    if (!type) {
      return json({ error: "Missing required field: type" }, 400);
    }
    if (type !== "signup_welcome" && type !== "demo_request" && type !== "contact_request" && !to) {
      return json({ error: "Missing required field: to" }, 400);
    }

    const baseUrl = appUrl || Deno.env.get("APP_URL") || "https://aireatro.com";
    const ADMIN_EMAIL = "admin@aireatro.com";

    const supabase = getAdminClient();

    // Enqueue an email through Lovable's pgmq queue → process-email-queue
    // → Mailgun. Mirrors the payload contract used by send-transactional-email.
    const sendOne = async (
      toAddr: string,
      subj: string,
      body: string,
      replyTo?: string,
      _attachments?: Array<{ filename: string; content: string }>,
    ) => {
      const recipient = String(toAddr || "").trim().toLowerCase();
      if (!recipient) return { ok: false, data: { error: "missing recipient" } };

      const messageId = crypto.randomUUID();
      const cleanSubject = asciiSafe(subj) || "Aireatro";

      // Suppression check (fail-closed)
      const { data: suppressed } = await supabase
        .from("suppressed_emails")
        .select("id")
        .eq("email", recipient)
        .maybeSingle();

      if (suppressed) {
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: `team-email:${type}`,
          recipient_email: recipient,
          status: "suppressed",
        });
        console.log(`enqueue skip (suppressed) → ${recipient}`);
        return { ok: true, data: { id: messageId, suppressed: true } };
      }

      // Get-or-create unsubscribe token (one per address)
      let unsubToken: string | null = null;
      const { data: existingTok } = await supabase
        .from("email_unsubscribe_tokens")
        .select("token, used_at")
        .eq("email", recipient)
        .maybeSingle();

      if (existingTok && !existingTok.used_at) {
        unsubToken = existingTok.token;
      } else if (!existingTok) {
        const t = genToken();
        await supabase
          .from("email_unsubscribe_tokens")
          .upsert({ token: t, email: recipient }, { onConflict: "email", ignoreDuplicates: true });
        const { data: stored } = await supabase
          .from("email_unsubscribe_tokens")
          .select("token")
          .eq("email", recipient)
          .maybeSingle();
        unsubToken = stored?.token ?? t;
      }

      // Pre-log pending so we have an audit row even if enqueue throws
      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: `team-email:${type}`,
        recipient_email: recipient,
        status: "pending",
      });

      const idempotencyKey = `team-email:${type}:${messageId}`;

      const { error: enqErr } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          to: recipient,
          from: FROM_ADDRESS,
          sender_domain: SENDER_DOMAIN,
          subject: cleanSubject,
          html: body,
          text: body.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          purpose: "transactional",
          label: `team-email:${type}`,
          idempotency_key: idempotencyKey,
          unsubscribe_token: unsubToken,
          reply_to: replyTo || undefined,
          queued_at: new Date().toISOString(),
        },
      });

      if (enqErr) {
        console.error(`enqueue failed → ${recipient}`, enqErr);
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: `team-email:${type}`,
          recipient_email: recipient,
          status: "failed",
          error_message: `enqueue failed: ${enqErr.message}`,
        });
        return { ok: false, data: { error: enqErr.message } };
      }

      console.log(`enqueued → ${recipient} | id=${messageId} | type=${type}`);
      return { ok: true, data: { id: messageId, queued: true } };
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

    // Demo booking request -> email customer + admin with premium templates
    if (type === "demo_request") {
      const payload: any = (req as any).__parsed || {};
      const fullNameD = payload.fullName || fullName || "there";
      const workEmailD = payload.workEmail || userEmail || to;
      const phoneD = payload.phone || "";
      const companyD = payload.company || "";
      const websiteD = payload.website || "";
      const teamSizeD = payload.teamSize || "";
      const industryD = payload.industry || "";
      const useCaseD = payload.useCase || "";
      const preferredDateD = payload.preferredDate || "";
      const preferredTimeD = payload.preferredTime || "";
      const timezoneD = payload.timezone || "UTC";
      const notesD = payload.notes || "";

      if (!workEmailD) return json({ error: "Missing workEmail for demo_request" }, 400);

      const initial = (fullNameD.trim()[0] || "U").toUpperCase();
      const year = new Date().getFullYear();
      const submittedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

      // ---- Build calendar timestamps ----
      // preferredDateD likely "MMM dd, yyyy" or similar; preferredTimeD like "04:00 PM"
      const parseToUtc = (dateStr: string, timeStr: string, tz: string): Date | null => {
        try {
          const d = new Date(`${dateStr} ${timeStr}`);
          if (isNaN(d.getTime())) return null;
          // Treat parsed as local-to-tz. Approximation: get tz offset for that instant.
          const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
          const parts = fmt.formatToParts(d).find(p => p.type === "timeZoneName")?.value || "GMT+0";
          const m = parts.match(/GMT([+-]\d+)(?::(\d+))?/);
          const offH = m ? parseInt(m[1], 10) : 0;
          const offM = m && m[2] ? parseInt(m[2], 10) : 0;
          const offsetMin = offH * 60 + (offH < 0 ? -offM : offM);
          // d was parsed as local browser time. Re-create as if components are in tz:
          const utcMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()) - offsetMin * 60_000;
          return new Date(utcMs);
        } catch { return null; }
      };
      const startUtc = parseToUtc(preferredDateD, preferredTimeD, timezoneD);
      const endUtc = startUtc ? new Date(startUtc.getTime() + 25 * 60_000) : null;
      const toIcsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      let googleCalUrl = "#";
      let outlookCalUrl = "#";
      let icsBase64 = "";
      if (startUtc && endUtc) {
        const s = toIcsStamp(startUtc);
        const e = toIcsStamp(endUtc);
        const title = encodeURIComponent("Aireatro Demo");
        const details = encodeURIComponent(`Live demo with the Aireatro team.\nTimezone: ${timezoneD}\nContact: +971 58 658 5863`);
        const loc = encodeURIComponent("Google Meet / Zoom (link will be sent)");
        googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${s}/${e}&details=${details}&location=${loc}`;
        outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${details}&location=${loc}&startdt=${startUtc.toISOString()}&enddt=${endUtc.toISOString()}`;
        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Aireatro//Demo//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "BEGIN:VEVENT",
          `UID:${crypto.randomUUID()}@aireatro.com`,
          `DTSTAMP:${toIcsStamp(new Date())}`,
          `DTSTART:${s}`,
          `DTEND:${e}`,
          "SUMMARY:Aireatro Demo",
          `DESCRIPTION:Live demo with the Aireatro team. Timezone: ${timezoneD}`,
          "LOCATION:Google Meet / Zoom (link will be sent)",
          `ORGANIZER;CN=Aireatro:mailto:admin@aireatro.com`,
          `ATTENDEE;CN=${fullNameD}:mailto:${workEmailD}`,
          "STATUS:CONFIRMED",
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");
        // Base64 encode (Deno)
        icsBase64 = btoa(unescape(encodeURIComponent(ics)));
      }

      const FONT = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
      const INK = "#0B1020";
      const SUB = "#5B6478";
      const FAINT = "#9AA3B7";
      const HAIR = "#EDF0F6";
      const BG = "#F5F6FA";
      const PRIMARY = "#16A34A";
      const PRIMARY_DARK = "#0F7A35";

      const trustChip = (label: string) =>
        `<td align="center" style="padding:10px 6px;"><div style="font-size:11px;font-weight:600;color:${INK};background:#F1F5F9;border:1px solid ${HAIR};border-radius:999px;padding:8px 12px;display:inline-block;">${label}</div></td>`;

      const customerHtml = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your Aireatro demo is confirmed</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Aireatro demo for ${preferredDateD} at ${preferredTimeD} (${timezoneD}) is confirmed.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">
        <tr><td align="center" style="padding:0 0 24px;">
          <div style="font-size:18px;font-weight:700;letter-spacing:-0.2px;color:${INK};">Aireatro</div>
        </td></tr>
        <tr><td style="background:#FFFFFF;border-radius:22px;border:1px solid ${HAIR};overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,0.06);">

          <!-- Hero gradient strip -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,#16A34A 0%,#0EA5E9 100%);padding:40px 44px;color:#fff;">
              <div style="font-size:11px;letter-spacing:2.4px;text-transform:uppercase;opacity:0.85;font-weight:600;">Demo Confirmation</div>
              <h1 style="margin:10px 0 8px;font-size:30px;font-weight:700;line-height:1.2;letter-spacing:-0.6px;">You're on the calendar, ${fullNameD.split(' ')[0]} 🚀</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;opacity:0.92;max-width:480px;">Thanks for booking a demo with Aireatro. Our specialist will connect with you at your selected time to show how Aireatro automates your business with WhatsApp API + CRM.</p>
            </td></tr>
          </table>

          <!-- Calendar summary card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:32px 44px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:16px;overflow:hidden;">
                <tr>
                  <td width="92" style="background:linear-gradient(180deg,#16A34A,#0F7A35);color:#fff;text-align:center;padding:18px 0;vertical-align:middle;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;opacity:0.85;font-weight:600;">Demo</div>
                    <div style="font-size:26px;font-weight:700;line-height:1.1;margin-top:4px;">${preferredTimeD.split(' ')[0] || '—'}</div>
                    <div style="font-size:11px;opacity:0.85;margin-top:2px;">${preferredTimeD.split(' ')[1] || ''}</div>
                  </td>
                  <td style="padding:18px 22px;background:#FBFCFE;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.4px;color:${SUB};font-weight:600;margin-bottom:6px;">Your scheduled session</div>
                    <div style="font-size:18px;font-weight:700;color:${INK};">${preferredDateD}</div>
                    <div style="font-size:13px;color:${SUB};margin-top:4px;">${preferredTimeD} · ${timezoneD}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Detail grid -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:18px 44px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:14px;">
                <tr>
                  <td style="padding:14px 16px;border-right:1px solid ${HAIR};border-bottom:1px solid ${HAIR};width:50%;">
                    <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">Name</div>
                    <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${fullNameD}</div>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid ${HAIR};">
                    <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">Business</div>
                    <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${companyD || "—"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-right:1px solid ${HAIR};">
                    <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">Meeting Type</div>
                    <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${useCaseD || "Live product demo"}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">Contact</div>
                    <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${phoneD || workEmailD}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Add to calendar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 44px 0;">
              <div style="font-size:13px;font-weight:600;color:${INK};margin-bottom:10px;">📅 Add to your calendar</div>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:8px;"><a href="${googleCalUrl}" style="display:inline-block;background:#FFFFFF;border:1px solid ${HAIR};color:${INK};text-decoration:none;font-weight:600;font-size:13px;padding:10px 16px;border-radius:10px;">Google Calendar</a></td>
                  <td style="padding-right:8px;"><a href="${outlookCalUrl}" style="display:inline-block;background:#FFFFFF;border:1px solid ${HAIR};color:${INK};text-decoration:none;font-weight:600;font-size:13px;padding:10px 16px;border-radius:10px;">Outlook</a></td>
                  <td><span style="font-size:12px;color:${SUB};">.ics file attached</span></td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Agenda -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:28px 44px 0;">
              <div style="font-size:13px;font-weight:600;color:${INK};margin-bottom:10px;">What we'll cover (25 min)</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${INK};line-height:1.75;">
                <tr><td style="padding:3px 0;">✓ Walk through your business use case</td></tr>
                <tr><td style="padding:3px 0;">✓ Live tour of inbox, automation & AI</td></tr>
                <tr><td style="padding:3px 0;">✓ Meta Ads → WhatsApp attribution demo</td></tr>
                <tr><td style="padding:3px 0;">✓ Pricing, onboarding & open Q&A</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- CTAs -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:30px 44px 0;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;">
                  <a href="${baseUrl}/signup" style="display:inline-block;background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(22,163,74,0.32);">Start Free →</a>
                </td>
                <td>
                  <a href="https://wa.me/971586585863" style="display:inline-block;background:#FFFFFF;border:1px solid ${HAIR};color:${INK};text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:12px;">WhatsApp Support</a>
                </td>
              </tr></table>
            </td></tr>
          </table>

          <!-- Trust strip -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:28px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                ${trustChip("Official WhatsApp API")}
                ${trustChip("< 10 min Setup")}
                ${trustChip("AI Automation")}
                ${trustChip("Team Inbox")}
              </tr></table>
            </td></tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 44px 36px;">
              <hr style="border:none;border-top:1px solid ${HAIR};margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;color:${SUB};line-height:1.6;">Need to reschedule? Reply to this email or WhatsApp us at +971 58 658 5863.</p>
              <p style="margin:8px 0 0;font-size:11px;color:${FAINT};">© ${year} Aireatro · aireatro.com</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

      const safeNotes = String(notesD).replace(/[<>]/g, "");
      const adminHtml = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New demo booking</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid ${HAIR};box-shadow:0 8px 28px rgba(15,23,42,0.06);">
        <tr><td style="background:linear-gradient(135deg,#0B1020,#1E293B);padding:24px 32px;">
          <table role="presentation" width="100%"><tr>
            <td style="font-weight:700;font-size:15px;color:#fff;letter-spacing:-0.2px;">Aireatro · Control Center</td>
            <td align="right"><span style="display:inline-block;background:#FCD34D;color:#78350F;font-size:10px;font-weight:700;padding:5px 11px;border-radius:999px;letter-spacing:0.6px;text-transform:uppercase;">New Demo Booking</span></td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:26px 32px 8px;">
          <table role="presentation" width="100%"><tr>
            <td width="56" style="vertical-align:top;">
              <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,${PRIMARY},#0EA5E9);color:#fff;font-size:20px;font-weight:700;text-align:center;line-height:48px;">${initial}</div>
            </td>
            <td style="padding-left:14px;">
              <div style="font-size:18px;font-weight:700;color:${INK};">${fullNameD}</div>
              <div style="font-size:13px;color:${SUB};">${workEmailD}${phoneD ? ` · ${phoneD}` : ""}</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Slot highlight -->
        <tr><td style="padding:18px 32px 0;">
          <div style="border:1px solid ${HAIR};border-left:4px solid ${PRIMARY};border-radius:12px;padding:14px 16px;background:#F0FDF4;">
            <div style="font-size:10px;color:${SUB};text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">Requested Slot</div>
            <div style="font-size:16px;font-weight:700;color:${INK};margin-top:3px;">${preferredDateD} · ${preferredTimeD} <span style="color:${SUB};font-weight:500;font-size:13px;">(${timezoneD})</span></div>
          </div>
        </td></tr>

        <tr><td style="padding:18px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:12px;">
            <tr>
              <td style="padding:13px 16px;border-right:1px solid ${HAIR};border-bottom:1px solid ${HAIR};width:50%;">
                <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Company</div>
                <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${companyD || "—"}</div>
              </td>
              <td style="padding:13px 16px;border-bottom:1px solid ${HAIR};">
                <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Website</div>
                <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${websiteD || "—"}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:13px 16px;border-right:1px solid ${HAIR};border-bottom:1px solid ${HAIR};">
                <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Team Size</div>
                <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${teamSizeD || "—"}</div>
              </td>
              <td style="padding:13px 16px;border-bottom:1px solid ${HAIR};">
                <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Industry</div>
                <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${industryD || "—"}</div>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:13px 16px;">
                <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Primary Use Case</div>
                <div style="font-size:14px;font-weight:600;color:${INK};margin-top:3px;">${useCaseD || "—"}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        ${safeNotes ? `<tr><td style="padding:16px 32px 0;">
          <div style="font-size:10px;color:${FAINT};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px;">Notes</div>
          <div style="font-size:14px;color:${INK};line-height:1.6;background:#FBFCFE;border:1px solid ${HAIR};border-radius:10px;padding:12px 14px;">${safeNotes}</div>
        </td></tr>` : ""}

        <!-- Quick actions -->
        <tr><td style="padding:24px 32px 8px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:8px;"><a href="mailto:${workEmailD}?subject=Re:%20Your%20Aireatro%20Demo" style="display:inline-block;background:${INK};color:#fff;text-decoration:none;font-weight:600;font-size:13px;padding:11px 18px;border-radius:10px;">✉ Reply</a></td>
            ${phoneD ? `<td style="padding-right:8px;"><a href="https://wa.me/${phoneD.replace(/\D/g,'')}" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;font-size:13px;padding:11px 18px;border-radius:10px;">💬 WhatsApp</a></td>` : ""}
            <td><a href="${baseUrl}/admin/leads" style="display:inline-block;background:#FFFFFF;border:1px solid ${HAIR};color:${INK};text-decoration:none;font-weight:600;font-size:13px;padding:10px 18px;border-radius:10px;">Open CRM</a></td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:22px 32px 28px;">
          <hr style="border:none;border-top:1px solid ${HAIR};margin:0 0 12px;" />
          <p style="margin:0;font-size:11px;color:${FAINT};">Submitted ${submittedAt} · Aireatro Control Center</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

      const customerAttachments = icsBase64
        ? [{ filename: "aireatro-demo.ics", content: icsBase64 }]
        : undefined;

      const [c, a] = await Promise.all([
        sendOne(workEmailD, "Your Aireatro Demo Session is Confirmed 🚀", customerHtml, undefined, customerAttachments),
        sendOne(ADMIN_EMAIL, `🎯 New demo booking: ${fullNameD}${companyD ? ` (${companyD})` : ""}`, adminHtml, workEmailD),
      ]);
      return json({ success: c.ok && a.ok, customer: c.data, admin: a.data });
    }


    if (type === "contact_request") {
      const p = (req as any).__parsed;
      const cName = String(p.fullName || "there");
      const cEmail = String(p.email || "");
      const subj = String(p.subject || "general");
      const msg = String(p.message || "");
      const phone = p.phone ? String(p.phone) : "";
      const company = p.company ? String(p.company) : "";
      if (!cEmail) return json({ error: "Missing email for contact_request" }, 400);

      const customerHtml = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7fb;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;box-shadow:0 6px 24px rgba(0,0,0,.06);">
          <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Thanks ${cName.split(' ')[0]} 👋</h1>
          <p style="color:#475569;line-height:1.6;margin:0 0 16px;">We received your message and our team will reply within 24 hours (often much sooner).</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;color:#334155;font-size:14px;">
            <strong>Your message:</strong><br/>${msg.replace(/</g,'&lt;').replace(/\n/g,'<br/>')}
          </div>
          <p style="color:#64748b;font-size:12px;margin-top:20px;">— Team Aireatro</p>
        </div></body></html>`;
      const adminHtml = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7fb;padding:24px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;padding:24px;">
          <h2 style="margin:0 0 12px;color:#0f172a;">📩 New contact form submission</h2>
          <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse;">
            <tr><td style="padding:6px 0;width:140px;color:#64748b;">Name</td><td>${cName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Email</td><td><a href="mailto:${cEmail}">${cEmail}</a></td></tr>
            ${phone ? `<tr><td style="padding:6px 0;color:#64748b;">Phone</td><td>${phone}</td></tr>` : ""}
            ${company ? `<tr><td style="padding:6px 0;color:#64748b;">Company</td><td>${company}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#64748b;">Subject</td><td>${subj}</td></tr>
          </table>
          <div style="margin-top:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;color:#0f172a;font-size:14px;">
            ${msg.replace(/</g,'&lt;').replace(/\n/g,'<br/>')}
          </div>
        </div></body></html>`;

      const [c, a] = await Promise.all([
        sendOne(cEmail, "We received your message ✅", customerHtml),
        sendOne(ADMIN_EMAIL, `📩 Contact: ${cName}${company ? ` (${company})` : ""}`, adminHtml, cEmail),
      ]);
      return json({ success: c.ok && a.ok });
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
