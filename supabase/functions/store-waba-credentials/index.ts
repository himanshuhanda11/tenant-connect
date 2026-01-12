import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's auth token for verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { tenantId, businessId, wabaId, phoneNumberId, displayNumber, accessToken } = await req.json();

    // Validate required fields
    if (!tenantId || !businessId || !wabaId || !phoneNumberId || !displayNumber || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin/owner of the tenant
    const { data: membership, error: membershipError } = await adminClient
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      console.error("Membership check failed:", membershipError);
      return new Response(
        JSON.stringify({ error: "Not a member of this tenant" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only owners and admins can connect phone numbers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing WABA account
    const { data: existingWaba } = await adminClient
      .from("waba_accounts")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("waba_id", wabaId)
      .maybeSingle();

    let wabaAccountId: string;

    if (existingWaba) {
      wabaAccountId = existingWaba.id;
      // Update access token using service role (never exposed to client)
      const { error: updateError } = await adminClient
        .from("waba_accounts")
        .update({ 
          encrypted_access_token: accessToken, 
          status: "active" 
        })
        .eq("id", wabaAccountId);

      if (updateError) {
        console.error("Error updating WABA account:", updateError);
        throw updateError;
      }
    } else {
      // Create new WABA account using service role
      const { data: newWaba, error: wabaError } = await adminClient
        .from("waba_accounts")
        .insert({
          tenant_id: tenantId,
          business_id: businessId,
          waba_id: wabaId,
          encrypted_access_token: accessToken,
          status: "active",
        })
        .select("id")
        .single();

      if (wabaError) {
        console.error("Error creating WABA account:", wabaError);
        throw wabaError;
      }
      wabaAccountId = newWaba.id;
    }

    // Check for existing phone number
    const { data: existingPhone } = await adminClient
      .from("phone_numbers")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("phone_number_id", phoneNumberId)
      .maybeSingle();

    if (existingPhone) {
      return new Response(
        JSON.stringify({ error: "This phone number is already connected" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create phone number record
    const { error: phoneError } = await adminClient
      .from("phone_numbers")
      .insert({
        tenant_id: tenantId,
        waba_account_id: wabaAccountId,
        phone_number_id: phoneNumberId,
        display_number: displayNumber,
        status: "connected",
      });

    if (phoneError) {
      console.error("Error creating phone number:", phoneError);
      throw phoneError;
    }

    console.log(`WABA credentials stored successfully for tenant ${tenantId}`);

    return new Response(
      JSON.stringify({ success: true, wabaAccountId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error storing WABA credentials:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to store credentials" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
