// Sends a WhatsApp OTP to the authenticated user.
// MODULAR PROVIDER: replace `sendViaProvider()` with real Meta WhatsApp Cloud API
// once AIREATRO_WABA_PHONE_NUMBER_ID + AIREATRO_WABA_ACCESS_TOKEN are configured.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WABA_PHONE_NUMBER_ID = Deno.env.get("AIREATRO_WABA_PHONE_NUMBER_ID");
const WABA_ACCESS_TOKEN = Deno.env.get("AIREATRO_WABA_ACCESS_TOKEN");
const WABA_TEMPLATE_NAME = Deno.env.get("AIREATRO_WABA_OTP_TEMPLATE") || "otp_verification";
const WABA_TEMPLATE_LANG = Deno.env.get("AIREATRO_WABA_OTP_TEMPLATE_LANG") || "en_US";

const RESEND_BLOCKLIST = (Deno.env.get("EMAIL_BLOCKLIST") || "").toLowerCase();
const ADMIN_NOTIFY = "admin@aireatro.com";

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS_RESET_ON_SEND = true;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateOtp(): string {
  // Cryptographically random 6-digit code, leading zeros preserved
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 1_000_000).toString().padStart(6, "0");
}

function normalizeE164(countryCode: string, number: string): string | null {
  const cc = (countryCode || "").trim().replace(/[^\d+]/g, "");
  const num = (number || "").trim().replace(/[^\d]/g, "");
  if (!cc || !num) return null;
  const cleanCc = cc.startsWith("+") ? cc : `+${cc}`;
  const e164 = `${cleanCc}${num}`;
  // Loose E.164 check: + then 8..16 digits
  if (!/^\+\d{8,16}$/.test(e164)) return null;
  return e164;
}

async function notifyAdminOtp(e164: string, otp: string, userEmail: string) {
  // For testing only: emails admin@aireatro.com so the team can confirm delivery
  // until the real WhatsApp template is approved. Safe — no secret leaks to client.
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aireatro <admin@aireatro.com>",
        to: [ADMIN_NOTIFY],
        subject: `[OTP TEST] ${otp} → ${e164}`,
        text: `OTP for ${userEmail} (${e164}): ${otp}\n\nThis email is sent only because no production WhatsApp sender is configured yet.`,
      }),
    });
  } catch (_err) {
    // Non-fatal: admin notification only.
  }
}

async function sendViaProvider(e164: string, otp: string): Promise<{
  ok: boolean;
  provider: "meta_cloud_api" | "stub";
  error?: string;
}> {
  // ===== Real Meta WhatsApp Cloud API path =====
  // TODO: Provide AIREATRO_WABA_PHONE_NUMBER_ID and AIREATRO_WABA_ACCESS_TOKEN secrets,
  // and create an approved "authentication" template (default name: otp_verification)
  // with a single body variable {{1}} = the 6-digit code.
  if (WABA_PHONE_NUMBER_ID && WABA_ACCESS_TOKEN) {
    try {
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${WABA_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WABA_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: e164.replace(/^\+/, ""),
            type: "template",
            template: {
              name: WABA_TEMPLATE_NAME,
              language: { code: WABA_TEMPLATE_LANG },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otp }],
                },
                {
                  type: "button",
                  sub_type: "url",
                  index: "0",
                  parameters: [{ type: "text", text: otp }],
                },
              ],
            },
          }),
        },
      );
      if (!resp.ok) {
        const body = await resp.text();
        return { ok: false, provider: "meta_cloud_api", error: body };
      }
      return { ok: true, provider: "meta_cloud_api" };
    } catch (err) {
      return { ok: false, provider: "meta_cloud_api", error: String(err) };
    }
  }

  // ===== Stub provider (development) =====
  console.log(`[whatsapp-otp-send][STUB] would send to ${e164}: ${otp}`);
  return { ok: true, provider: "stub" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email || "";

    const body = await req.json().catch(() => ({}));
    const { country_code, number } = body || {};
    const e164 = normalizeE164(country_code, number);
    if (!e164) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid WhatsApp number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Check resend cooldown
    const { data: profile } = await admin
      .from("profiles")
      .select(
        "id, whatsapp_verified, otp_last_sent_at",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profile?.whatsapp_verified) {
      return new Response(
        JSON.stringify({ ok: true, alreadyVerified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (profile?.otp_last_sent_at) {
      const last = new Date(profile.otp_last_sent_at).getTime();
      const diff = (Date.now() - last) / 1000;
      if (diff < RESEND_COOLDOWN_SECONDS) {
        const waitSec = Math.ceil(RESEND_COOLDOWN_SECONDS - diff);
        return new Response(
          JSON.stringify({
            error: `Please wait ${waitSec}s before requesting a new code.`,
            cooldownSeconds: waitSec,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const otp = generateOtp();
    const hash = await sha256Hex(`${userId}:${otp}`);
    const expires = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

    const { error: updErr } = await admin
      .from("profiles")
      .update({
        whatsapp_number: number,
        whatsapp_country_code: country_code,
        whatsapp_e164: e164,
        otp_code_hash: hash,
        otp_expires_at: expires,
        otp_attempt_count: MAX_ATTEMPTS_RESET_ON_SEND ? 0 : undefined,
        otp_last_sent_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (updErr) {
      console.error("[whatsapp-otp-send] profile update failed", updErr);
      return new Response(JSON.stringify({ error: "Failed to issue OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const send = await sendViaProvider(e164, otp);
    if (!send.ok) {
      console.error("[whatsapp-otp-send] provider failed", send.error);
      return new Response(
        JSON.stringify({ error: "Could not deliver OTP. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // For testing only — mirrors OTP to admin email until production WhatsApp template is live.
    if (send.provider === "stub") {
      await notifyAdminOtp(e164, otp, userEmail);
    }

    return new Response(
      JSON.stringify({ ok: true, provider: send.provider, expiresInSeconds: OTP_TTL_SECONDS }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[whatsapp-otp-send] fatal", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
