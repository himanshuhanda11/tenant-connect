// Verifies a WhatsApp OTP submitted by the authenticated user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || "").trim();
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please check and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select(
        "id, whatsapp_verified, otp_code_hash, otp_expires_at, otp_attempt_count",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.whatsapp_verified) {
      return new Response(
        JSON.stringify({ ok: true, alreadyVerified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!profile.otp_code_hash || !profile.otp_expires_at) {
      return new Response(
        JSON.stringify({ error: "No active OTP. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if ((profile.otp_attempt_count ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Request a new OTP." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (new Date(profile.otp_expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ error: "OTP expired. Please request a new code." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const hash = await sha256Hex(`${userId}:${code}`);
    if (hash !== profile.otp_code_hash) {
      await admin
        .from("profiles")
        .update({ otp_attempt_count: (profile.otp_attempt_count ?? 0) + 1 })
        .eq("id", userId);
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please check and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ✅ Success — mark verified and clear OTP fields
    const { error: updErr } = await admin
      .from("profiles")
      .update({
        whatsapp_verified: true,
        whatsapp_verified_at: new Date().toISOString(),
        otp_code_hash: null,
        otp_expires_at: null,
        otp_attempt_count: 0,
      })
      .eq("id", userId);

    if (updErr) {
      console.error("[whatsapp-otp-verify] update failed", updErr);
      return new Response(JSON.stringify({ error: "Could not mark verified" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[whatsapp-otp-verify] fatal", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
