import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const G = "https://graph.facebook.com/v21.0";

Deno.serve(async (req) => {
  const key = req.headers.get("x-diag-key");
  if (key !== "diag-7f3a91") return new Response("no", { status: 403 });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: w } = await admin.from("waba_accounts").select("waba_id, encrypted_access_token").eq("id", "714524cf-8620-423a-a315-1f7ae09ea662").single();
  const tok = w!.encrypted_access_token as string;
  const appTok = `${Deno.env.get("META_APP_ID")}|${Deno.env.get("META_APP_SECRET")}`;
  const get = async (p: string, t = tok) => {
    const r = await fetch(`${G}/${p}${p.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(t)}`);
    return await r.json();
  };
  const out: Record<string, unknown> = {};
  out.debug = await get(`debug_token?input_token=${encodeURIComponent(tok)}`, appTok);
  out.health_waba = await get(`${w!.waba_id}?fields=name,account_review_status,business_verification_status,owner_business_info,health_status,on_behalf_of_business_info`);
  out.health_phone = await get(`661674340360654?fields=display_phone_number,verified_name,status,code_verification_status,quality_rating,platform_type,throughput,name_status,health_status,account_mode`);
  out.subscribed = await get(`${w!.waba_id}/subscribed_apps`);
  out.phones = await get(`${w!.waba_id}/phone_numbers?fields=id,display_phone_number,status`);
  const pr = await fetch(`${G}/661674340360654/messages`, { method: "POST", headers: { Authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: "1", type: "text", text: { body: "x" } }) });
  out.probe_send = await pr.json();
  const sys = Deno.env.get("META_SYSTEM_USER_TOKEN");
  if (sys) {
    const pr2 = await fetch(`${G}/661674340360654/messages`, { method: "POST", headers: { Authorization: `Bearer ${sys}`, "content-type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: "1", type: "text", text: { body: "x" } }) });
    out.probe_sys = await pr2.json();
    const dbg2 = await get(`debug_token?input_token=${encodeURIComponent(sys)}`, appTok);
    out.sys_debug = { type: dbg2?.data?.type, valid: dbg2?.data?.is_valid, scopes: dbg2?.data?.granular_scopes };
  }
  out.app_perms = await get(`${Deno.env.get("META_APP_ID")}/permissions`, appTok);
  out.app_info = await get(`${Deno.env.get("META_APP_ID")}?fields=name,restrictions,business`, appTok);
  out.app_id = Deno.env.get("META_APP_ID");
  return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json" } });
});
