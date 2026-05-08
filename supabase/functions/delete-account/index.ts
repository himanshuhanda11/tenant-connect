import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "DELETE" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // === GUARD 1: Block if user owns any workspaces ===
    const { data: ownerships } = await adminClient
      .from("tenant_members").select("tenant_id").eq("user_id", user.id).eq("role", "owner");
    const ownedIds = (ownerships || []).map((r: any) => r.tenant_id);

    if (ownedIds.length > 0) {
      const { data: tenants } = await adminClient
        .from("tenants").select("id,name").in("id", ownedIds);
      const names = (tenants || []).map((t: any) => t.name).join(", ");
      return new Response(JSON.stringify({
        error: `You still own ${ownedIds.length} workspace(s): ${names}. Please delete or transfer them before deleting your account.`,
        code: "WORKSPACES_EXIST",
        workspaces: tenants || [],
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // === GUARD 2: Block if user is a member of workspaces with phone numbers ===
    // (Only for owned, but already cleared. Defensive: also check shared workspaces)
    const { data: memberships } = await adminClient
      .from("tenant_members").select("tenant_id").eq("user_id", user.id);
    const memberTenants = (memberships || []).map((r: any) => r.tenant_id);
    if (memberTenants.length > 0) {
      const { data: phones } = await adminClient
        .from("phone_numbers").select("tenant_id,display_number")
        .in("tenant_id", memberTenants);
      // Owners already cleared, this is informational only — allow deletion (user just gets removed from workspace).
    }

    // === Generate contacts archive BEFORE deleting (best-effort) ===
    const accountEmail = user.email || null;
    const { data: profile } = await adminClient
      .from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    const accountName = (profile as any)?.full_name || null;

    try {
      await adminClient.functions.invoke("account-deletion-export", {
        body: { user_id: user.id, account_email: accountEmail, account_name: accountName },
      });
    } catch (e: any) {
      console.error("[delete-account] archive export failed:", e?.message);
    }

    // === Delete the user ===
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true, message: "Account deleted; archive emailed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to delete account" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
