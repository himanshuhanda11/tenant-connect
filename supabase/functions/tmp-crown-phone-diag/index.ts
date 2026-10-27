import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Temporary read-only diagnostic. Delete after use.
Deno.serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: w } = await supabase
    .from("waba_accounts")
    .select("waba_id, encrypted_access_token")
    .eq("tenant_id", "b021a0ac-093a-4e73-8ae1-8115f97bc785")
    .maybeSingle();
  if (!w) return new Response("no waba", { status: 404 });
  const token = w.encrypted_access_token;
  const g = async (path: string) => {
    const r = await fetch(`https://graph.facebook.com/v21.0/${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return await r.json();
  };
  const phones = await g(`${w.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,code_verification_status,status,name_status,platform_type,quality_rating,is_on_biz_app,account_mode,last_onboarded_time`);
  const waba = await g(`${w.waba_id}?fields=id,name,account_review_status,business_verification_status,ownership_type,health_status`);
  const dbg = await g(`debug_token?input_token=${token}`);
  return new Response(JSON.stringify({ waba, phones, token_valid: dbg?.data?.is_valid, token_scopes: dbg?.data?.scopes, token_error: dbg?.error }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
