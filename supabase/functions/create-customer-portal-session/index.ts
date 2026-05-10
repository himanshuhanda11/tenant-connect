// Returns a Stripe Customer Portal session URL for the given workspace.
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  assertWorkspaceAdmin, appUrl,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { workspaceId, returnUrl } = await req.json().catch(() => ({}));
    if (!workspaceId) return json({ error: "workspaceId required" }, 400);

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();
    if (!(await assertWorkspaceAdmin(service, workspaceId, user.id))) {
      return json({ error: "Only workspace admins can manage billing" }, 403);
    }

    const { data: sub } = await service.from("subscriptions")
      .select("stripe_customer_id").eq("tenant_id", workspaceId).maybeSingle();
    if (!sub?.stripe_customer_id) {
      return json({ error: "No Stripe customer for this workspace yet — start a paid subscription first." }, 400);
    }

    const stripe = await getStripe();
    const origin = req.headers.get("origin") || appUrl();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl || `${origin}/billing`,
    });
    return json({ portal_url: portal.url });
  } catch (err: any) {
    console.error("portal error:", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
