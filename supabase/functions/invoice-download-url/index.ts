import { getAdminClient, json, corsHeaders } from "../_shared/supabase.ts";
import { requireUser, requireTenantRole } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const invoiceId = body.invoiceId as string;
    if (!invoiceId) return json({ error: "invoiceId required" }, 400);

    const admin = getAdminClient();

    // Read invoice
    const { data: inv, error } = await admin
      .from("platform_invoices")
      .select("id, workspace_id, pdf_path, invoice_number")
      .eq("id", invoiceId)
      .single();

    if (error || !inv) return json({ error: "Invoice not found" }, 404);

    // Auth: check user is owner/admin of the workspace
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    // Allow platform admins
    const { data: platformUser } = await admin
      .from("platform_users")
      .select("role")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    const isPlatformAdmin = platformUser && ["super_admin", "admin"].includes(platformUser.role);

    if (!isPlatformAdmin) {
      // Check workspace membership
      const perm = await requireTenantRole(inv.workspace_id, auth.user.id, ["owner", "admin"]);
      if (!perm.ok) return json({ error: perm.error }, 403);
    }

    // If no PDF yet, generate it first via invoice-generate-pdf
    if (!inv.pdf_path) {
      // Call the existing invoice-generate-pdf function
      const base = Deno.env.get("SUPABASE_URL")!;
      const genRes = await fetch(`${base}/functions/v1/invoice-generate-pdf`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": req.headers.get("Authorization") || "",
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!genRes.ok) {
        return json({ error: "Failed to generate invoice PDF" }, 500);
      }

      const genData = await genRes.json();
      if (genData.download_url) {
        return json({
          ok: true,
          url: genData.download_url,
          invoice_number: inv.invoice_number,
        });
      }
    }

    // Get signed URL for existing PDF
    const { data: signed, error: sErr } = await admin.storage
      .from("invoices")
      .createSignedUrl(inv.pdf_path, 60 * 10); // 10 minutes

    if (sErr) return json({ error: sErr.message }, 500);

    return json({
      ok: true,
      url: signed.signedUrl,
      invoice_number: inv.invoice_number,
    });
  } catch (e) {
    console.error("invoice-download-url error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
