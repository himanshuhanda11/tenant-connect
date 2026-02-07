import { getAdminClient, json, corsHeaders } from "../_shared/supabase.ts";
import { requireUser, requireTenantRole } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require logged-in user who is platform admin
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    const admin = getAdminClient();

    // Check platform_users for super_admin / admin role
    const { data: platformUser } = await admin
      .from("platform_users")
      .select("role")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (!platformUser || !["super_admin", "admin"].includes(platformUser.role)) {
      return json({ error: "Forbidden — platform admin required" }, 403);
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch daily revenue from the view
    const { data: daily } = await admin
      .from("platform_revenue_daily")
      .select("day, currency, gross, refunds, net, payments_count")
      .gte("day", since.split("T")[0])
      .order("day", { ascending: true });

    // Active subscriptions count
    const { count: activeSubs } = await admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // Total workspaces
    const { count: totalWorkspaces } = await admin
      .from("tenants")
      .select("id", { count: "exact", head: true });

    // Compute totals from daily data
    const totals = (daily || []).reduce(
      (acc: { gross: number; refunds: number; net: number; payments: number }, row: any) => {
        acc.gross += Number(row.gross || 0);
        acc.refunds += Number(row.refunds || 0);
        acc.net += Number(row.net || 0);
        acc.payments += Number(row.payments_count || 0);
        return acc;
      },
      { gross: 0, refunds: 0, net: 0, payments: 0 }
    );

    return json({
      ok: true,
      range_days: 30,
      totals,
      daily: daily || [],
      counts: {
        active_subscriptions: activeSubs ?? 0,
        total_workspaces: totalWorkspaces ?? 0,
      },
    });
  } catch (e) {
    console.error("platform-revenue-overview error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
