import { getAdminClient, corsHeaders, json } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = getAdminClient();
    const { conversation_id, tenant_id, contact_email, contact_phone } = await req.json();

    if (!conversation_id || !tenant_id) {
      return json({ error: "conversation_id and tenant_id required" }, 400);
    }

    // Check if link already exists
    const { data: existing } = await admin
      .from("conversation_shopify_links")
      .select("id")
      .eq("conversation_id", conversation_id)
      .limit(1);

    if (existing?.length) {
      return json({ linked: true, existing: true, link_id: existing[0].id });
    }

    // Try matching by email first, then phone
    let matchQuery = admin
      .from("shopify_customers")
      .select("id, store_id, shopify_customer_id, email, phone")
      .eq("tenant_id", tenant_id);

    let matchSource = "email";
    let confidence = 0.9;

    if (contact_email) {
      matchQuery = matchQuery.eq("email", contact_email);
    } else if (contact_phone) {
      matchQuery = matchQuery.eq("phone", contact_phone);
      matchSource = "phone";
      confidence = 0.7;
    } else {
      return json({ linked: false, reason: "no_email_or_phone" });
    }

    const { data: customers } = await matchQuery.limit(1);
    const customer = customers?.[0];

    if (!customer) {
      return json({ linked: false, reason: "no_match" });
    }

    // Create the link
    const { data: link, error } = await admin
      .from("conversation_shopify_links")
      .insert({
        conversation_id,
        tenant_id,
        store_id: customer.store_id,
        shopify_customer_record_id: customer.id,
        match_source: matchSource,
        match_confidence: confidence,
      })
      .select()
      .single();

    if (error) {
      console.error("Link creation error:", error);
      return json({ error: error.message }, 500);
    }

    return json({ linked: true, link_id: link.id, match_source: matchSource, confidence });
  } catch (err) {
    console.error("Auto-link error:", err);
    return json({ error: err.message }, 500);
  }
});
