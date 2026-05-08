import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function requirePlatformRole(req: Request, allowed: string[]) {
  const sb = adminClient();
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) throw new Error("Missing auth");

  // Use anon-key client with user's JWT so ES256 tokens are verified correctly
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error } = await userClient.auth.getUser(jwt);
  if (error || !userData?.user) {
    console.error("Auth verification failed:", error?.message);
    throw new Error("Invalid auth");
  }
  const userId = userData.user.id;
  const userEmail = userData.user.email as string;

  const { data: pu } = await sb
    .from("platform_admins")
    .select("role,is_active")
    .eq("user_id", userId)
    .single();

  if (!pu || !pu.is_active) throw new Error("Access denied");
  const role = pu.role as string;
  if (!allowed.includes(role)) throw new Error("Forbidden: insufficient role");

  // Check read-only mode for support on mutations
  if (role === "support" && req.method !== "GET") {
    const { data: setting } = await sb
      .from("platform_settings")
      .select("value")
      .eq("key", "support_read_only")
      .single();

    if (setting?.value === true) {
      throw new Error("Read-only mode is currently enabled for support. Mutations are disabled.");
    }
  }

  return { user: { id: userId, email: userEmail }, role };
}

async function logAction(sb: any, actor: any, action: string, details: any) {
  await sb.from("platform_audit_logs").insert({
    actor_user_id: actor.user.id,
    actor_role: actor.role,
    action,
    workspace_id: details.workspace_id || null,
    target_table: details.target_table || null,
    target_id: details.target_id || null,
    before_data: details.before || null,
    after_data: details.after || null,
    note: details.note || null,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-api\/?/, "");

    // GET /overview
    if (req.method === "GET" && path === "overview") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data: kpi } = await sb.from("platform_kpi_overview").select("*").single();
      return new Response(JSON.stringify({ kpi }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /dashboard-stats — rich super-admin analytics
    if (req.method === "GET" && path === "dashboard-stats") {
      await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();

      // Counts via auth.admin (source of truth for signups)
      const { data: authPage } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const allUsers = authPage?.users || [];
      const totalAccounts = allUsers.length;
      const confirmedAccounts = allUsers.filter((u: any) => !!u.email_confirmed_at).length;
      const incompleteAccounts = totalAccounts - confirmedAccounts;

      // Workspaces
      const { data: tenants } = await sb.from("tenants")
        .select("id, created_at, is_suspended");
      const totalWorkspaces = (tenants || []).length;
      const activeWorkspaces = (tenants || []).filter((t: any) => !t.is_suspended).length;
      const suspendedWorkspaces = totalWorkspaces - activeWorkspaces;

      // Phone connections
      const { data: phones } = await sb.from("phone_numbers")
        .select("tenant_id, status, created_at");
      const tenantsWithPhone = new Set((phones || []).filter((p: any) => p.status === "connected").map((p: any) => p.tenant_id));
      const workspacesWithPhone = tenantsWithPhone.size;
      const workspacesWithoutPhone = Math.max(0, totalWorkspaces - workspacesWithPhone);

      // Plans (from directory)
      const { data: dir } = await sb.from("platform_workspace_directory")
        .select("workspace_id, plan, plan_name, subscription_status, is_suspended");
      const planCounts: Record<string, number> = {};
      let activePaid = 0;
      let freeTrial = 0;
      for (const d of dir || []) {
        const planLabel = (d.plan_name || d.plan || "free").toString();
        planCounts[planLabel] = (planCounts[planLabel] || 0) + 1;
        const lower = planLabel.toLowerCase();
        if (["free", "trial", "starter"].includes(lower) || !d.subscription_status) freeTrial++;
        else activePaid++;
      }
      const planDistribution = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

      // Time-series helper: bucket by day for last 30 days
      const days = 30;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const series = Array.from({ length: days }, (_, i) => {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - (days - 1 - i));
        return { date: d.toISOString().slice(0, 10), accounts: 0, workspaces: 0, phones: 0 };
      });
      const indexFor = (iso: string) => {
        const d = iso.slice(0, 10);
        return series.findIndex((s) => s.date === d);
      };
      for (const u of allUsers) {
        const i = indexFor(u.created_at || "");
        if (i >= 0) series[i].accounts++;
      }
      for (const t of tenants || []) {
        const i = indexFor(t.created_at || "");
        if (i >= 0) series[i].workspaces++;
      }
      for (const p of phones || []) {
        const i = indexFor(p.created_at || "");
        if (i >= 0) series[i].phones++;
      }

      // Growth windows
      const now = Date.now();
      const within = (iso: string, ms: number) => iso && (now - new Date(iso).getTime()) <= ms;
      const DAY = 86400000;
      const accountsToday = allUsers.filter((u: any) => within(u.created_at, DAY)).length;
      const accountsWeek = allUsers.filter((u: any) => within(u.created_at, 7 * DAY)).length;
      const accountsMonth = allUsers.filter((u: any) => within(u.created_at, 30 * DAY)).length;
      const workspacesToday = (tenants || []).filter((t: any) => within(t.created_at, DAY)).length;
      const workspacesWeek = (tenants || []).filter((t: any) => within(t.created_at, 7 * DAY)).length;
      const workspacesMonth = (tenants || []).filter((t: any) => within(t.created_at, 30 * DAY)).length;

      // Recent activity (last 10 audit events)
      const { data: activity } = await sb.from("platform_audit_logs")
        .select("id, action, actor_role, created_at, note, target_table")
        .order("created_at", { ascending: false })
        .limit(10);

      // === Extended metrics ===
      // WABA accounts
      const { data: wabas } = await sb.from("waba_accounts").select("id, status, created_at");
      const totalWaba = (wabas || []).length;
      const activeWaba = (wabas || []).filter((w: any) => w.status === "active").length;
      const pendingWaba = (wabas || []).filter((w: any) => w.status === "pending").length;

      // Subscription / payments
      const { data: payments } = await sb.from("platform_payments")
        .select("amount, currency, status, created_at")
        .gte("created_at", new Date(now - 30 * DAY).toISOString());
      const paymentsSucceeded = (payments || []).filter((p: any) => ["succeeded", "captured", "paid"].includes(String(p.status))).length;
      const paymentsFailed = (payments || []).filter((p: any) => ["failed", "error"].includes(String(p.status))).length;
      const revenue30d = (payments || [])
        .filter((p: any) => ["succeeded", "captured", "paid"].includes(String(p.status)))
        .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);

      // Revenue trend by day (last 30d)
      const revenueSeries = series.map((s) => ({ date: s.date, label: s.date.slice(5), revenue: 0 }));
      for (const p of payments || []) {
        if (!["succeeded", "captured", "paid"].includes(String(p.status))) continue;
        const i = indexFor(p.created_at || "");
        if (i >= 0) revenueSeries[i].revenue += Number(p.amount) || 0;
      }

      // Subscriptions: expired / trial / paid
      let expiredPlans = 0;
      let trialPlans = 0;
      for (const d of dir || []) {
        const ss = String(d.subscription_status || "").toLowerCase();
        if (ss === "expired" || ss === "past_due" || ss === "cancelled") expiredPlans++;
        if (ss === "trialing" || ss === "trial") trialPlans++;
      }

      // Messages today
      const todayStart = new Date(today).toISOString();
      let messagesToday = 0;
      try {
        const { count } = await sb.from("messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart);
        messagesToday = count || 0;
      } catch { /* table may not exist in some envs */ }

      // Inactive users: confirmed but no sign-in in 30 days
      const inactiveAccounts = allUsers.filter((u: any) =>
        u.email_confirmed_at && (!u.last_sign_in_at || (now - new Date(u.last_sign_in_at).getTime()) > 30 * DAY)
      ).length;

      // WhatsApp connection success/failure breakdown
      const phoneStatusBreakdown: Record<string, number> = {};
      for (const p of phones || []) {
        const k = p.status || "unknown";
        phoneStatusBreakdown[k] = (phoneStatusBreakdown[k] || 0) + 1;
      }
      const phoneStatusDetail = Object.entries(phoneStatusBreakdown).map(([name, value]) => ({ name, value }));

      return new Response(JSON.stringify({
        totals: {
          totalAccounts, confirmedAccounts, incompleteAccounts,
          totalWorkspaces, activeWorkspaces, suspendedWorkspaces,
          workspacesWithPhone, workspacesWithoutPhone,
          activePaid, freeTrial,
          totalWaba, activeWaba, pendingWaba,
          expiredPlans, trialPlans,
          messagesToday, inactiveAccounts,
          revenue30d, paymentsSucceeded, paymentsFailed,
        },
        growth: {
          accountsToday, accountsWeek, accountsMonth,
          workspacesToday, workspacesWeek, workspacesMonth,
        },
        series,
        revenueSeries,
        planDistribution,
        phoneStatus: [
          { name: "Connected", value: workspacesWithPhone },
          { name: "No Number", value: workspacesWithoutPhone },
        ],
        phoneStatusDetail,
        recentActivity: activity || [],
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // GET /accounts — list ALL signups from auth.users (source of truth),
    // merged with profiles + owned workspaces + team-member sub-accounts.
    if (req.method === "GET" && path === "accounts") {
      await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const search = (url.searchParams.get("search") || "").toLowerCase().trim();
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;

      // 1) Pull a page of auth users (admin-listUsers paginates by 1000 max)
      const { data: authPage, error: authErr } = await sb.auth.admin.listUsers({
        page: 1, perPage: 1000,
      });
      if (authErr) throw new Error(authErr.message);
      let users = authPage?.users || [];

      // Search filter (email / name / phone)
      if (search) {
        users = users.filter((u: any) => {
          const meta = u.user_metadata || {};
          const hay = [
            u.email, u.phone, meta.full_name, meta.name, meta.company_name,
          ].filter(Boolean).join(" ").toLowerCase();
          return hay.includes(search);
        });
      }
      // Sort newest first
      users.sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""));

      const total = users.length;
      const offset = (page - 1) * limit;
      const slice = users.slice(offset, offset + limit);
      const userIds = slice.map((u: any) => u.id);

      // 2) Profiles for these users
      const profileMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profs } = await sb.from("profiles")
          .select("id, email, full_name, company_name, country, phone_number, timezone, onboarding_step, created_at, step_signup_at, step_org_done_at, step_password_done_at, step_workspace_created_at, step_completed_at")
          .in("id", userIds);
        for (const p of profs || []) profileMap[p.id] = p;
      }

      // 3) All tenant memberships for these users → find owned workspaces
      const wsByOwner: Record<string, any[]> = {};
      const allTenantIds = new Set<string>();
      if (userIds.length) {
        const { data: members } = await sb.from("tenant_members")
          .select("tenant_id, user_id, role")
          .in("user_id", userIds);
        for (const m of members || []) {
          if (!wsByOwner[m.user_id]) wsByOwner[m.user_id] = [];
          wsByOwner[m.user_id].push(m);
          allTenantIds.add(m.tenant_id);
        }
      }
      // Tenant directory
      const tenantMap: Record<string, any> = {};
      if (allTenantIds.size) {
        const { data: tenants } = await sb.from("platform_workspace_directory")
          .select("workspace_id, workspace_name, slug, plan, plan_name, is_suspended, sending_paused, members_count, contacts_count, conversations_count, created_at")
          .in("workspace_id", Array.from(allTenantIds));
        for (const t of tenants || []) tenantMap[t.workspace_id] = t;
      }
      // Phone numbers per tenant (any row = "phone connected")
      const tenantPhoneMap: Record<string, { display_number: string; status: string }> = {};
      if (allTenantIds.size) {
        const { data: phones } = await sb.from("phone_numbers")
          .select("tenant_id, display_number, status, is_default, created_at")
          .in("tenant_id", Array.from(allTenantIds))
          .order("is_default", { ascending: false });
        for (const ph of phones || []) {
          if (!tenantPhoneMap[ph.tenant_id]) {
            tenantPhoneMap[ph.tenant_id] = { display_number: ph.display_number, status: ph.status };
          }
        }
      }

      // 4) Team members (sub-accounts) for each owned tenant
      const tenantTeamMap: Record<string, any[]> = {};
      if (allTenantIds.size) {
        const { data: teamRows } = await sb.from("tenant_members")
          .select("tenant_id, user_id, role, created_at")
          .in("tenant_id", Array.from(allTenantIds));
        const teamUserIds = Array.from(new Set((teamRows || []).map((r: any) => r.user_id)));
        const teamProfMap: Record<string, any> = {};
        if (teamUserIds.length) {
          const { data: teamProfs } = await sb.from("profiles")
            .select("id, email, full_name")
            .in("id", teamUserIds);
          for (const p of teamProfs || []) teamProfMap[p.id] = p;
        }
        for (const m of teamRows || []) {
          if (!tenantTeamMap[m.tenant_id]) tenantTeamMap[m.tenant_id] = [];
          const p = teamProfMap[m.user_id];
          tenantTeamMap[m.tenant_id].push({
            user_id: m.user_id,
            role: m.role,
            email: p?.email || null,
            full_name: p?.full_name || null,
            joined_at: m.created_at,
          });
        }
      }

      // 5) Build account rows
      const accounts = slice.map((u: any) => {
        const meta = u.user_metadata || {};
        const p = profileMap[u.id];
        const memberships = wsByOwner[u.id] || [];
        const workspaces = memberships.map((m: any) => {
          const t = tenantMap[m.tenant_id];
          const ph = tenantPhoneMap[m.tenant_id];
          return {
            workspace_id: m.tenant_id,
            workspace_name: t?.workspace_name || "(Unnamed)",
            role: m.role,
            plan: t?.plan || "—",
            plan_name: t?.plan_name || null,
            is_suspended: t?.is_suspended || false,
            members_count: t?.members_count || 0,
            contacts_count: t?.contacts_count || 0,
            conversations_count: t?.conversations_count || 0,
            created_at: t?.created_at || null,
            phone_number: ph?.display_number || null,
            phone_status: ph?.status || null,
            sub_accounts: tenantTeamMap[m.tenant_id] || [],
          };
        });
        const hasWorkspace = workspaces.length > 0;
        const hasPhone = workspaces.some((w: any) => !!w.phone_number);
        const hasPaidPlan = workspaces.some((w: any) =>
          w.plan && !["free", "—", "trial"].includes(String(w.plan).toLowerCase()));
        // Highest stage reached (funnel is cumulative)
        const stage = hasPaidPlan ? 3 : hasPhone ? 2 : hasWorkspace ? 1 : 0;
        return {
          user_id: u.id,
          email: u.email || p?.email || null,
          phone: u.phone || p?.phone_number || null,
          full_name: p?.full_name || meta.full_name || meta.name || null,
          company_name: p?.company_name || meta.company_name || null,
          country: p?.country || null,
          timezone: p?.timezone || null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || null,
          email_confirmed_at: u.email_confirmed_at || null,
          provider: u.app_metadata?.provider || "email",
          has_profile: !!p,
          onboarding_step: p?.onboarding_step || (u.email_confirmed_at ? "signup" : "unconfirmed"),
          onboarding_timeline: {
            signup_at: p?.step_signup_at || u.created_at,
            org_done_at: p?.step_org_done_at,
            password_done_at: p?.step_password_done_at,
            workspace_created_at: p?.step_workspace_created_at,
            completed_at: p?.step_completed_at,
          },
          workspaces,
          stage,
          reached: { account: true, workspace: hasWorkspace, phone: hasPhone, plan: hasPaidPlan },
        };
      });

      return new Response(JSON.stringify({ accounts, total, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /workspaces
    if (req.method === "GET" && path === "workspaces") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const search = url.searchParams.get("search") || "";
      const view = url.searchParams.get("view") || "all";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 25;
      const offset = (page - 1) * limit;

      // Special view: recent signups (profiles directly, including users without workspaces)
      if (view === "recent-signups") {
        let pq: any = sb.from("profiles")
          .select("id, email, full_name, company_name, website_url, country, phone_number, industry, team_size, timezone, onboarding_step, created_at, step_signup_at, step_org_done_at, step_password_done_at, step_workspace_created_at, step_completed_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (search) pq = pq.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`);
        const { data: profiles, count: pCount } = await pq;
        const userIds = (profiles || []).map((p: any) => p.id);
        // Find their workspaces (if any)
        const memberMap: Record<string, any> = {};
        if (userIds.length) {
          const { data: members } = await sb.from("tenant_members")
            .select("tenant_id, user_id, role")
            .in("user_id", userIds);
          const tenantIds = Array.from(new Set((members || []).map((m: any) => m.tenant_id)));
          let tMap: Record<string, any> = {};
          if (tenantIds.length) {
            const { data: tenants } = await sb.from("platform_workspace_directory")
              .select("workspace_id, workspace_name, slug, plan, is_suspended, sending_paused, members_count, contacts_count, conversations_count, plan_name, created_at")
              .in("workspace_id", tenantIds);
            for (const t of tenants || []) tMap[t.workspace_id] = t;
          }
          for (const m of members || []) {
            if (!memberMap[m.user_id]) memberMap[m.user_id] = tMap[m.tenant_id];
          }
        }
        const enriched = (profiles || []).map((p: any) => {
          const t = memberMap[p.id];
          return {
            workspace_id: t?.workspace_id || `signup:${p.id}`,
            workspace_name: t?.workspace_name || (p.company_name || p.full_name || p.email || "(No workspace yet)"),
            slug: t?.slug || "—",
            created_at: t?.created_at || p.created_at,
            is_suspended: t?.is_suspended || false,
            plan: t?.plan || "—",
            sending_paused: t?.sending_paused || false,
            members_count: t?.members_count ?? 0,
            phone_numbers_count: 0,
            contacts_count: t?.contacts_count ?? 0,
            conversations_count: t?.conversations_count ?? 0,
            plan_name: t?.plan_name || null,
            owner_email: p.email,
            owner_full_name: p.full_name,
            owner_company_name: p.company_name,
            owner_website_url: p.website_url,
            owner_country: p.country,
            owner_phone: p.phone_number,
            owner_industry: p.industry,
            owner_team_size: p.team_size,
            owner_timezone: p.timezone,
            owner_signup_at: p.created_at,
            onboarding_step: p.onboarding_step,
            onboarding_timeline: {
              signup_at: p.step_signup_at || p.created_at,
              org_done_at: p.step_org_done_at,
              password_done_at: p.step_password_done_at,
              workspace_created_at: p.step_workspace_created_at,
              completed_at: p.step_completed_at,
            },
            phone_number: null, phone_status: null, phone_quality: null, phone_connected_at: null,
            waba_status: null, waba_name: null, waba_connected_at: null,
            no_workspace: !t,
          };
        });
        return new Response(JSON.stringify({ workspaces: enriched, total: pCount || 0, page, limit, counts: {} }), {
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      // Workspaces with at least one phone in 'pending' status (Meta review / not yet connected)
      const { data: pendingPhones } = await sb
        .from("phone_numbers")
        .select("tenant_id, status")
        .in("status", ["pending"]); // phone_status enum: pending | connected | disconnected | banned
      const pendingTenantIds = Array.from(
        new Set((pendingPhones || []).map((p: any) => p.tenant_id).filter(Boolean))
      );

      // Base builder so we apply the same filters to data + counts consistently
      const buildQuery = (selectExpr: string, opts: { count?: boolean } = {}) => {
        let q: any = opts.count
          ? sb.from("platform_workspace_directory").select(selectExpr, { count: "exact", head: true })
          : sb.from("platform_workspace_directory").select(selectExpr, { count: "exact" });
        if (search) q = q.or(`workspace_name.ilike.%${search}%,slug.ilike.%${search}%`);
        switch (view) {
          case "suspended":
            q = q.eq("is_suspended", true);
            break;
          case "pending-numbers":
            // Workspaces that have a phone whose Meta status is still pending review
            if (pendingTenantIds.length === 0) {
              q = q.eq("workspace_id", "00000000-0000-0000-0000-000000000000");
            } else {
              q = q.in("workspace_id", pendingTenantIds);
            }
            break;
          case "pro":
            q = q.eq("plan", "pro");
            break;
          case "high-revenue":
            q = q.in("plan", ["pro", "business"]);
            break;
          case "paused":
            q = q.eq("sending_paused", true);
            break;
          case "business":
            q = q.eq("plan", "business");
            break;
          case "free":
            q = q.eq("plan", "free");
            break;
          case "new-week": {
            const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            q = q.gte("created_at", since);
            break;
          }
          default:
            break;
        }
        return q;
      };

      const { data, count } = await buildQuery("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Compute filter chip counts (respect search but ignore current view)
      const buildCount = async (filterFn: (q: any) => any) => {
        let q: any = sb
          .from("platform_workspace_directory")
          .select("workspace_id", { count: "exact", head: true });
        if (search) q = q.or(`workspace_name.ilike.%${search}%,slug.ilike.%${search}%`);
        q = filterFn(q);
        const { count: c } = await q;
        return c || 0;
      };

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [
        countAll, countSuspended, countPending, countPro, countHigh,
        countPaused, countBusiness, countFree, countNewWeek, countSignups,
      ] = await Promise.all([
        buildCount((q) => q),
        buildCount((q) => q.eq("is_suspended", true)),
        pendingTenantIds.length
          ? buildCount((q) => q.in("workspace_id", pendingTenantIds))
          : Promise.resolve(0),
        buildCount((q) => q.eq("plan", "pro")),
        buildCount((q) => q.in("plan", ["pro", "business"])),
        buildCount((q) => q.eq("sending_paused", true)),
        buildCount((q) => q.eq("plan", "business")),
        buildCount((q) => q.eq("plan", "free")),
        buildCount((q) => q.gte("created_at", sevenDaysAgo)),
        sb.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo).then((r: any) => r.count || 0),
      ]);

      const counts = {
        all: countAll,
        suspended: countSuspended,
        "pending-numbers": countPending,
        pro: countPro,
        "high-revenue": countHigh,
        paused: countPaused,
        business: countBusiness,
        free: countFree,
        "new-week": countNewWeek,
        "recent-signups": countSignups,
      };

      // Enrich with owner email, phone number, WABA status
      const workspaceIds = (data || []).map((w: any) => w.workspace_id);
      
      // Owner profiles - manual join since no FK between tenant_members and profiles
      let ownerMap: Record<string, any> = {};
      if (workspaceIds.length > 0) {
        const { data: owners } = await sb.from("tenant_members")
          .select("tenant_id, user_id, role, created_at")
          .eq("role", "owner")
          .in("tenant_id", workspaceIds);
        const ownerUserIds = (owners || []).map((o: any) => o.user_id).filter(Boolean);
        let profileMap: Record<string, any> = {};
        if (ownerUserIds.length > 0) {
          const { data: profiles } = await sb.from("profiles")
            .select("id, email, full_name, company_name, website_url, country, phone_number, industry, team_size, timezone, created_at");
          for (const p of (profiles || []).filter((p: any) => ownerUserIds.includes(p.id))) {
            profileMap[p.id] = p;
          }
        }
        for (const o of owners || []) {
          if (!ownerMap[o.tenant_id]) ownerMap[o.tenant_id] = profileMap[o.user_id] || null;
        }
      }

      // Phone numbers (latest per tenant)
      let phoneMap: Record<string, any> = {};
      if (workspaceIds.length > 0) {
        const { data: phones } = await sb.from("phone_numbers")
          .select("tenant_id, display_number, created_at, status, quality_rating")
          .in("tenant_id", workspaceIds)
          .order("created_at", { ascending: false });
        for (const p of phones || []) {
          if (!phoneMap[p.tenant_id]) phoneMap[p.tenant_id] = p;
        }
      }

      // WABA status (latest per tenant) — gives WABA "connected" date
      let wabaMap: Record<string, any> = {};
      if (workspaceIds.length > 0) {
        const { data: wabas } = await sb.from("waba_accounts")
          .select("tenant_id, status, created_at, name")
          .in("tenant_id", workspaceIds)
          .order("created_at", { ascending: false });
        for (const w of wabas || []) {
          if (!wabaMap[w.tenant_id]) wabaMap[w.tenant_id] = w;
        }
      }

      const enriched = (data || []).map((w: any) => {
        const owner = ownerMap[w.workspace_id];
        const phone = phoneMap[w.workspace_id];
        const waba = wabaMap[w.workspace_id];
        return {
          ...w,
          owner_email: owner?.email || null,
          owner_full_name: owner?.full_name || null,
          owner_company_name: owner?.company_name || null,
          owner_website_url: owner?.website_url || null,
          owner_country: owner?.country || null,
          owner_phone: owner?.phone_number || null,
          owner_industry: owner?.industry || null,
          owner_team_size: owner?.team_size || null,
          owner_timezone: owner?.timezone || null,
          owner_signup_at: owner?.created_at || null,
          phone_number: phone?.display_number || null,
          phone_status: phone?.status || null,
          phone_quality: phone?.quality_rating || null,
          phone_connected_at: phone?.created_at || null,
          waba_status: waba?.status || null,
          waba_name: waba?.name || null,
          waba_connected_at: waba?.created_at || null,
        };
      });

      // For the default "all" view, also surface signups that have not yet
      // created a workspace so admins can see them on /control/workspaces.
      let merged = enriched;
      let mergedTotal = count || 0;
      if (view === "all" && page === 1) {
        // Find profiles with no tenant_members membership
        const { data: allProfiles } = await sb.from("profiles")
          .select("id, email, full_name, company_name, website_url, country, phone_number, industry, team_size, timezone, onboarding_step, created_at, step_signup_at, step_org_done_at, step_password_done_at, step_workspace_created_at, step_completed_at")
          .order("created_at", { ascending: false })
          .limit(100);
        const profileIds = (allProfiles || []).map((p: any) => p.id);
        let memberSet = new Set<string>();
        if (profileIds.length) {
          const { data: mems } = await sb.from("tenant_members")
            .select("user_id").in("user_id", profileIds);
          memberSet = new Set((mems || []).map((m: any) => m.user_id));
        }
        const orphans = (allProfiles || []).filter((p: any) => !memberSet.has(p.id));
        const orphanRows = orphans.map((p: any) => ({
          workspace_id: `signup:${p.id}`,
          workspace_name: p.company_name || p.full_name || p.email || "(No workspace yet)",
          slug: "—",
          created_at: p.created_at,
          is_suspended: false,
          plan: "—",
          sending_paused: false,
          members_count: 0,
          phone_numbers_count: 0,
          contacts_count: 0,
          conversations_count: 0,
          plan_name: null,
          owner_email: p.email,
          owner_full_name: p.full_name,
          owner_company_name: p.company_name,
          owner_website_url: p.website_url,
          owner_country: p.country,
          owner_phone: p.phone_number,
          owner_industry: p.industry,
          owner_team_size: p.team_size,
          owner_timezone: p.timezone,
          owner_signup_at: p.created_at,
          onboarding_step: p.onboarding_step,
          onboarding_timeline: {
            signup_at: p.step_signup_at || p.created_at,
            org_done_at: p.step_org_done_at,
            password_done_at: p.step_password_done_at,
            workspace_created_at: p.step_workspace_created_at,
            completed_at: p.step_completed_at,
          },
          phone_number: null, phone_status: null, phone_quality: null, phone_connected_at: null,
          waba_status: null, waba_name: null, waba_connected_at: null,
          no_workspace: true,
        }));
        merged = [...orphanRows, ...enriched].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        mergedTotal = (count || 0) + orphanRows.length;
      }

      return new Response(JSON.stringify({ workspaces: merged, total: mergedTotal, page, limit, counts }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /workspaces/:id
    if (req.method === "GET" && path.startsWith("workspaces/") && !path.includes("/", 11)) {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const workspaceId = path.replace("workspaces/", "");
      const [workspace, entitlements, members, phones, wsPhone, waba, ownerMember] = await Promise.all([
        sb.from("tenants").select("*").eq("id", workspaceId).single(),
        sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle(),
        sb.from("tenant_members").select("*, profiles(email, full_name, company_name, website_url, country, phone_number, industry, team_size, timezone, created_at)").eq("tenant_id", workspaceId),
        sb.from("phone_numbers").select("id,display_number,verified_name,phone_number_id,waba_account_id,quality_rating,status,messaging_limit,webhook_health,last_webhook_at,is_default,created_at,updated_at").eq("tenant_id", workspaceId).order("created_at", { ascending: false }),
        sb.from("workspace_phone_numbers").select("*").eq("workspace_id", workspaceId).maybeSingle(),
        sb.from("waba_accounts").select("id,waba_id,business_id,name,status,token_source,created_at,updated_at").eq("tenant_id", workspaceId).order("created_at", { ascending: false }).maybeSingle(),
        sb.from("tenant_members").select("user_id, created_at").eq("tenant_id", workspaceId).eq("role", "owner").order("created_at", { ascending: true }).maybeSingle(),
      ]);

      // Owner profile
      let ownerProfile: any = null;
      if (ownerMember.data?.user_id) {
        const { data: op } = await sb.from("profiles").select("*").eq("id", ownerMember.data.user_id).maybeSingle();
        ownerProfile = op;
      }

      return new Response(JSON.stringify({
        workspace: workspace.data,
        entitlements: entitlements.data,
        members: members.data,
        phones: phones.data,
        workspace_phone: wsPhone.data,
        waba: waba.data,
        owner: ownerProfile,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // Guard: any /workspaces/:id/* mutation on a synthetic "signup:<uuid>" row
    // (orphan signups with no tenant yet) — only the /delete handler knows how
    // to handle these. Reject everything else with a clear 400 so we never pass
    // the non-UUID into a UUID column and 500.
    {
      const m = path.match(/^workspaces\/([^/]+)\/([^/]+)$/);
      if (req.method === "POST" && m && m[1].startsWith("signup:") && m[2] !== "delete") {
        return new Response(
          JSON.stringify({ error: "This signup has no workspace yet — only delete/archive is supported." }),
          { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } },
        );
      }
    }

    // POST /workspaces/:id/update
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/update$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const SUPPORT_ALLOWED = new Set(["sending_paused", "enable_ai", "enable_ads", "enable_integrations", "enable_autoforms"]);
      const safeUpdates: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body.updates || body)) {
        if (k === 'note' || k === 'updates') continue;
        if (actor.role === "super_admin") safeUpdates[k] = v;
        else if (SUPPORT_ALLOWED.has(k)) safeUpdates[k] = v;
      }
      if (Object.keys(safeUpdates).length === 0) {
        return new Response(JSON.stringify({ error: "No permitted fields to update" }), {
          status: 403, headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      const { data: before } = await sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle();
      const { data: after, error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId, ...safeUpdates,
        updated_by: actor.user.id, updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" }).select().single();
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_WORKSPACE_UPDATE", {
        workspace_id: workspaceId, target_table: "workspace_entitlements", before, after, note: body.note || null,
      });
      return new Response(JSON.stringify({ success: true, data: after }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/suspend
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/suspend$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { error } = await sb.from("tenants").update({
        is_suspended: body.suspend ?? true,
        suspended_reason: body.reason || null,
        suspended_at: body.suspend ? new Date().toISOString() : null,
      }).eq("id", workspaceId);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, body.suspend ? "PLATFORM_WORKSPACE_SUSPEND" : "PLATFORM_WORKSPACE_UNSUSPEND", {
        workspace_id: workspaceId, note: body.reason,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/pause-sending
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/pause-sending$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId, sending_paused: body.paused ?? true,
        updated_by: actor.user.id, updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, body.paused ? "PLATFORM_SENDING_PAUSED" : "PLATFORM_SENDING_RESUMED", {
        workspace_id: workspaceId,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/change-plan
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/change-plan$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const planId = body.plan_id;
      if (!planId) throw new Error("plan_id required");

      // Verify plan exists
      const { data: plan } = await sb.from("platform_plans").select("id, name").eq("id", planId).single();
      if (!plan) throw new Error(`Plan '${planId}' not found`);

      // Get plan limits and features
      const { data: fullPlan } = await sb.from("platform_plans").select("*").eq("id", planId).single();
      const lim = fullPlan?.limits || {};
      const toInt = (v: any) => (v === 'unlimited' || v === null || v === undefined) ? -1 : (typeof v === 'number' ? v : parseInt(v) || -1);

      // Directly upsert workspace_entitlements with correct columns
      const { error: entError } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId,
        plan: planId,
        status: "active",
        monthly_conversation_limit: toInt(lim.monthly_messages),
        monthly_broadcast_limit: toInt(lim.monthly_broadcasts),
        monthly_template_limit: toInt(lim.monthly_templates),
        monthly_flow_limit: toInt(lim.flows),
        enable_ai: lim.ai_features !== 'none' && lim.ai_features !== false,
        enable_ads: Array.isArray(fullPlan?.features) && fullPlan.features.includes("ads_manager"),
        enable_integrations: Array.isArray(fullPlan?.features) && fullPlan.features.includes("integrations"),
        enable_autoforms: lim.autoforms === 'unlimited' || lim.autoforms === true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });

      if (entError) {
        console.error("Entitlements upsert error:", entError);
        throw new Error(`Failed to update entitlements: ${entError.message}`);
      }

      await logAction(sb, actor, "PLATFORM_PLAN_CHANGED", {
        workspace_id: workspaceId, after: { plan_id: planId, plan_name: plan.name },
        note: `Plan changed to ${plan.name}`,
      });

      return new Response(JSON.stringify({ success: true, plan: plan.name }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /audit-logs
    if (req.method === "GET" && path === "audit-logs") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;
      let query = sb.from("platform_audit_logs").select("*", { count: "exact" });
      const workspaceFilter = url.searchParams.get("workspace_id");
      if (workspaceFilter) query = query.eq("workspace_id", workspaceFilter);
      const actionFilter = url.searchParams.get("action");
      if (actionFilter) query = query.eq("action", actionFilter);
      const { data, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      return new Response(JSON.stringify({ logs: data, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /audit-logs/export
    if (req.method === "GET" && path === "audit-logs/export") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const format = url.searchParams.get("format") || "json";

      let query = sb.from("platform_audit_logs").select("*");
      const workspaceFilter = url.searchParams.get("workspace_id");
      if (workspaceFilter) query = query.eq("workspace_id", workspaceFilter);
      const actionFilter = url.searchParams.get("action");
      if (actionFilter) query = query.eq("action", actionFilter);

      const { data } = await query.order("created_at", { ascending: false }).limit(1000);

      await logAction(sb, actor, "PLATFORM_AUDIT_EXPORT", {
        note: `Exported ${data?.length || 0} audit logs as ${format}`,
      });

      if (format === "csv") {
        const headers = ["created_at", "actor_user_id", "actor_role", "action", "workspace_id", "target_table", "target_id", "note"];
        const csv = [
          headers.join(","),
          ...(data || []).map(row =>
            headers.map(h => `"${String((row as any)[h] ?? '').replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        return new Response(csv, {
          headers: {
            ...corsHeaders,
            "content-type": "text/csv",
            "content-disposition": `attachment; filename="audit-export-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }

      const exportData = {
        generated_at: new Date().toISOString(),
        generated_by: actor.user.email,
        total_events: data?.length || 0,
        events: data,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "content-disposition": `attachment; filename="audit-export-${new Date().toISOString().slice(0,10)}.json"`,
        },
      });
    }

    // GET /me
    if (req.method === "GET" && path === "me") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data: roSetting } = await sb.from("platform_settings").select("value").eq("key", "support_read_only").single();
      return new Response(JSON.stringify({
        role: actor.role, user_id: actor.user.id, email: actor.user.email,
        support_read_only: roSetting?.value === true,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // GET /settings
    if (req.method === "GET" && path === "settings") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_settings").select("*");
      return new Response(JSON.stringify({ settings: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /settings
    if (req.method === "POST" && path === "settings") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.key) throw new Error("Setting key required");
      const { data: before } = await sb.from("platform_settings").select("*").eq("key", body.key).maybeSingle();
      const { error } = await sb.from("platform_settings").upsert({
        key: body.key, value: body.value,
        updated_at: new Date().toISOString(), updated_by: actor.user.id,
      }, { onConflict: "key" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_SETTINGS_UPDATE", {
        target_table: "platform_settings", target_id: body.key,
        before: before ? { value: before.value } : null,
        after: { value: body.value }, note: body.note || `Updated ${body.key}`,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /incidents
    if (req.method === "GET" && path === "incidents") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_incidents").select("*").order("created_at", { ascending: false });
      return new Response(JSON.stringify({ incidents: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /incidents/:id/events
    if (req.method === "GET" && path.match(/^incidents\/[^/]+\/events$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_incident_events")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });
      return new Response(JSON.stringify({ events: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents - declare new incident
    if (req.method === "POST" && path === "incidents") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: incident, error } = await sb.from("platform_incidents").insert({
        title: body.title,
        description: body.description || null,
        severity: body.severity || 'medium',
        affected_systems: body.affected_systems || [],
        declared_by: actor.user.id,
      }).select().single();
      if (error) throw new Error(error.message);

      // Add initial event
      await sb.from("platform_incident_events").insert({
        incident_id: incident.id,
        event_type: 'declared',
        description: `Incident declared: ${body.title}`,
        actor_user_id: actor.user.id,
      });

      await logAction(sb, actor, "PLATFORM_INCIDENT_DECLARED", {
        target_table: "platform_incidents", target_id: incident.id,
        note: body.title,
      });

      return new Response(JSON.stringify({ success: true, incident }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents/:id/resolve
    if (req.method === "POST" && path.match(/^incidents\/[^/]+\/resolve$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();

      const { error } = await sb.from("platform_incidents").update({
        status: 'resolved',
        root_cause: body.root_cause || null,
        actions_taken: body.actions_taken || null,
        resolved_by: actor.user.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", incidentId);
      if (error) throw new Error(error.message);

      await sb.from("platform_incident_events").insert({
        incident_id: incidentId,
        event_type: 'resolved',
        description: `Incident resolved. Root cause: ${body.root_cause || 'N/A'}`,
        actor_user_id: actor.user.id,
      });

      await logAction(sb, actor, "PLATFORM_INCIDENT_RESOLVED", {
        target_table: "platform_incidents", target_id: incidentId,
        note: body.root_cause || 'Resolved',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /team
    if (req.method === "GET" && path === "team") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_admins").select("*").order("created_at", { ascending: false });
      const enriched = [];
      for (const pa of (data || [])) {
        const { data: { user } } = await sb.auth.admin.getUserById(pa.user_id);
        enriched.push({ ...pa, email: user?.email || "unknown" });
      }
      return new Response(JSON.stringify({ team: enriched }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /team/add
    if (req.method === "POST" && path === "team/add") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const email = body.email?.trim().toLowerCase();
      const role = body.role || "support";
      if (!email) throw new Error("Email required");
      if (!["super_admin", "support"].includes(role)) throw new Error("Invalid role");
      const { data: { users } } = await sb.auth.admin.listUsers();
      const targetUser = (users || []).find((u: any) => u.email?.toLowerCase() === email);
      if (!targetUser) throw new Error(`No user found with email: ${email}`);
      const { error } = await sb.from("platform_admins").upsert({
        user_id: targetUser.id, role, is_active: true,
      }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_TEAM_MEMBER_ADDED", { note: `Added ${email} as ${role}` });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /team/remove
    if (req.method === "POST" && path === "team/remove") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.user_id) throw new Error("user_id required");
      if (body.user_id === actor.user.id) throw new Error("Cannot remove yourself");
      const { error } = await sb.from("platform_admins").update({ is_active: false }).eq("user_id", body.user_id);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_TEAM_MEMBER_REMOVED", { note: `Deactivated ${body.user_id}` });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/reset-password
    if (req.method === "POST" && path.match(/^users\/[^/]+\/reset-password$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: { user } } = await sb.auth.admin.getUserById(userId);
      if (!user?.email) throw new Error("User not found or no email");
      const { data, error } = await sb.auth.admin.generateLink({ type: "recovery", email: user.email });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_PASSWORD_RESET", {
        target_table: "auth.users", target_id: userId, note: `Password reset for ${user.email}`,
      });
      return new Response(JSON.stringify({ success: true, email: user.email, reset_link: data?.properties?.action_link }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/update-email
    if (req.method === "POST" && path.match(/^users\/[^/]+\/update-email$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.email) throw new Error("New email required");
      const { data: { user: before } } = await sb.auth.admin.getUserById(userId);
      const { data: { user }, error } = await sb.auth.admin.updateUserById(userId, { email: body.email });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_USER_EMAIL_UPDATED", {
        target_table: "auth.users", target_id: userId,
        before: { email: before?.email }, after: { email: body.email },
      });
      return new Response(JSON.stringify({ success: true, email: user?.email }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/update-phone
    if (req.method === "POST" && path.match(/^users\/[^/]+\/update-phone$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.phone) throw new Error("New phone required");
      const { data: { user: before } } = await sb.auth.admin.getUserById(userId);
      const { data: { user }, error } = await sb.auth.admin.updateUserById(userId, { phone: body.phone });
      if (error) throw new Error(error.message);
      await sb.from("profiles").update({ phone: body.phone }).eq("id", userId);
      await logAction(sb, actor, "PLATFORM_USER_PHONE_UPDATED", {
        target_table: "auth.users", target_id: userId,
        before: { phone: before?.phone }, after: { phone: body.phone },
      });
      return new Response(JSON.stringify({ success: true, phone: user?.phone }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/delete — hard delete the signup (auth user + profile + owned workspaces)
    if (req.method === "POST" && path.match(/^users\/[^/]+\/delete$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json().catch(() => ({}));
      const reason = body.reason || null;

      const { data: owned } = await sb.from("tenant_members")
        .select("tenant_id").eq("user_id", userId).eq("role", "owner");
      const ownedIds = (owned || []).map((r: any) => r.tenant_id);

      const childTables = [
        "messages","conversations","contacts","campaigns","campaign_jobs","templates",
        "phone_numbers","waba_accounts","workspace_phone_numbers","workspace_entitlements",
        "tenant_members","audit_logs","onboarding_events","flow_sessions","flows",
        "automation_workflows","forms","form_submissions","tags","contact_tags",
      ];
      for (const tid of ownedIds) {
        for (const t of childTables) {
          try { await sb.from(t).delete().eq("tenant_id", tid); } catch (_) { /* ignore */ }
        }
        try { await sb.from("tenants").delete().eq("id", tid); } catch (_) { /* ignore */ }
      }

      await sb.from("onboarding_events").delete().eq("user_id", userId);
      await sb.from("profiles").delete().eq("id", userId);
      const { error: authErr } = await sb.auth.admin.deleteUser(userId);
      if (authErr) throw new Error(authErr.message);

      await logAction(sb, actor, "PLATFORM_USER_HARD_DELETE", {
        target_table: "auth.users", target_id: userId,
        note: reason || `Hard deleted user + ${ownedIds.length} workspace(s)`,
      });
      return new Response(JSON.stringify({ success: true, deleted_workspaces: ownedIds.length }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/suspend  { reason }
    if (req.method === "POST" && path.match(/^users\/[^/]+\/suspend$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json().catch(() => ({}));
      const reason = body.reason || "Suspended by admin";
      // Ban the user effectively forever (876000h ≈ 100y)
      const { error } = await sb.auth.admin.updateUserById(userId, { ban_duration: "876000h" } as any);
      if (error) throw new Error(error.message);
      // Also suspend any workspaces they own
      const { data: owned } = await sb.from("tenant_members").select("tenant_id").eq("user_id", userId).eq("role", "owner");
      const ownedIds = (owned || []).map((r: any) => r.tenant_id);
      if (ownedIds.length) {
        await sb.from("tenants").update({
          is_suspended: true, suspended_reason: reason, suspended_at: new Date().toISOString(),
        }).in("id", ownedIds);
      }
      await logAction(sb, actor, "PLATFORM_USER_SUSPENDED", {
        target_table: "auth.users", target_id: userId, note: reason,
      });
      return new Response(JSON.stringify({ success: true, suspended_workspaces: ownedIds.length }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/activate
    if (req.method === "POST" && path.match(/^users\/[^/]+\/activate$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { error } = await sb.auth.admin.updateUserById(userId, { ban_duration: "none" } as any);
      if (error) throw new Error(error.message);
      const { data: owned } = await sb.from("tenant_members").select("tenant_id").eq("user_id", userId).eq("role", "owner");
      const ownedIds = (owned || []).map((r: any) => r.tenant_id);
      if (ownedIds.length) {
        await sb.from("tenants").update({
          is_suspended: false, suspended_reason: null, suspended_at: null,
        }).in("id", ownedIds);
      }
      await logAction(sb, actor, "PLATFORM_USER_ACTIVATED", {
        target_table: "auth.users", target_id: userId, note: "Account reactivated",
      });
      return new Response(JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/set-password { password }
    if (req.method === "POST" && path.match(/^users\/[^/]+\/set-password$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.password || String(body.password).length < 8) throw new Error("Password must be ≥ 8 characters");
      const { error } = await sb.auth.admin.updateUserById(userId, { password: body.password });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_USER_PASSWORD_SET", {
        target_table: "auth.users", target_id: userId, note: "Password manually set by admin",
      });
      return new Response(JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/force-logout — invalidate all sessions
    if (req.method === "POST" && path.match(/^users\/[^/]+\/force-logout$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { error } = await sb.auth.admin.signOut(userId, "global" as any);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_USER_FORCE_LOGOUT", {
        target_table: "auth.users", target_id: userId, note: "All sessions revoked",
      });
      return new Response(JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/resend-verification
    if (req.method === "POST" && path.match(/^users\/[^/]+\/resend-verification$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: { user } } = await sb.auth.admin.getUserById(userId);
      if (!user?.email) throw new Error("User has no email");
      const { data, error } = await sb.auth.admin.generateLink({ type: "signup", email: user.email });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_USER_VERIFICATION_RESENT", {
        target_table: "auth.users", target_id: userId, note: `Verification regenerated for ${user.email}`,
      });
      return new Response(JSON.stringify({ success: true, link: data?.properties?.action_link }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/change-plan { plan, workspace_id? }
    if (req.method === "POST" && path.match(/^users\/[^/]+\/change-plan$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.plan) throw new Error("plan required");
      let tenantIds: string[] = [];
      if (body.workspace_id) tenantIds = [body.workspace_id];
      else {
        const { data: owned } = await sb.from("tenant_members").select("tenant_id").eq("user_id", userId).eq("role", "owner");
        tenantIds = (owned || []).map((r: any) => r.tenant_id);
      }
      if (!tenantIds.length) throw new Error("No workspaces to update");
      // Try update workspace_entitlements first
      for (const tid of tenantIds) {
        const { error: eErr } = await sb.from("workspace_entitlements")
          .upsert({ workspace_id: tid, plan: body.plan, updated_at: new Date().toISOString() }, { onConflict: "workspace_id" });
        if (eErr) console.warn("[change-plan] entitlements upsert", eErr.message);
      }
      await logAction(sb, actor, "PLATFORM_USER_PLAN_CHANGED", {
        target_table: "workspace_entitlements", target_id: userId,
        after: { plan: body.plan, workspaces: tenantIds }, note: `Plan changed to ${body.plan}`,
      });
      return new Response(JSON.stringify({ success: true, updated: tenantIds.length }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // GET /users/:id/details — full profile + workspaces + activity + notes
    if (req.method === "GET" && path.match(/^users\/[^/]+\/details$/)) {
      const userId = path.split("/")[1];
      await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data: { user } } = await sb.auth.admin.getUserById(userId);
      if (!user) throw new Error("User not found");
      const [{ data: profile }, { data: members }, { data: notes }, { data: activity }, { data: events }] = await Promise.all([
        sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
        sb.from("tenant_members").select("tenant_id, role, created_at").eq("user_id", userId),
        sb.from("admin_user_notes").select("id, note, created_at, author_user_id").eq("target_user_id", userId).order("created_at", { ascending: false }),
        sb.from("platform_audit_logs").select("id, action, actor_user_id, actor_role, note, created_at, target_table, target_id").or(`target_id.eq.${userId},workspace_id.in.(${(await sb.from("tenant_members").select("tenant_id").eq("user_id", userId)).data?.map((r: any) => r.tenant_id).join(",") || "00000000-0000-0000-0000-000000000000"})`).order("created_at", { ascending: false }).limit(30),
        sb.from("onboarding_events").select("event_type, created_at, metadata").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      ]);
      const tenantIds = (members || []).map((m: any) => m.tenant_id);
      let workspaces: any[] = [];
      let phones: any[] = [];
      let teamMembers: any[] = [];
      let wabas: any[] = [];
      let campaignsCount = 0;
      if (tenantIds.length) {
        const { data: ws } = await sb.from("platform_workspace_directory")
          .select("workspace_id, workspace_name, plan, plan_name, is_suspended, members_count, contacts_count, conversations_count, created_at, subscription_status")
          .in("workspace_id", tenantIds);
        workspaces = (ws || []).map((w: any) => ({
          ...w, role: members?.find((m: any) => m.tenant_id === w.workspace_id)?.role,
        }));
        const { data: ph } = await sb.from("phone_numbers")
          .select("id, tenant_id, phone_number_id, display_number, status, quality_rating, messaging_limit, webhook_health, last_webhook_at, created_at, updated_at, verified_name, waba_account_id").in("tenant_id", tenantIds);
        phones = ph || [];
        const { data: wb } = await sb.from("waba_accounts")
          .select("id, tenant_id, waba_id, business_id, name, status, token_source, created_at, updated_at").in("tenant_id", tenantIds);
        wabas = wb || [];
        const { count: cc } = await sb.from("campaigns").select("id", { count: "exact", head: true }).in("tenant_id", tenantIds);
        campaignsCount = cc || 0;
        const { data: tm } = await sb.from("tenant_members")
          .select("tenant_id, user_id, role, created_at").in("tenant_id", tenantIds).neq("user_id", userId);
        const subIds = Array.from(new Set((tm || []).map((m: any) => m.user_id)));
        let pmap: Record<string, any> = {};
        if (subIds.length) {
          const { data: profs } = await sb.from("profiles").select("id, email, full_name").in("id", subIds);
          for (const p of profs || []) pmap[p.id] = p;
        }
        teamMembers = (tm || []).map((m: any) => ({
          ...m, email: pmap[m.user_id]?.email, full_name: pmap[m.user_id]?.full_name,
        }));
      }
      // Resolve note authors
      const authorIds = Array.from(new Set((notes || []).map((n: any) => n.author_user_id)));
      let authorMap: Record<string, string> = {};
      if (authorIds.length) {
        const { data: authProfs } = await sb.from("profiles").select("id, email, full_name").in("id", authorIds);
        for (const a of authProfs || []) authorMap[a.id] = a.full_name || a.email || a.id.slice(0, 8);
      }
      const enrichedNotes = (notes || []).map((n: any) => ({
        ...n, author_name: authorMap[n.author_user_id] || "Admin",
      }));
      return new Response(JSON.stringify({
        user: {
          id: user.id, email: user.email, phone: user.phone,
          created_at: user.created_at, last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at, banned_until: (user as any).banned_until || null,
          provider: user.app_metadata?.provider || "email",
        },
        profile, workspaces, phones, wabas, team_members: teamMembers,
        campaigns_count: campaignsCount,
        activity: activity || [], onboarding_events: events || [], notes: enrichedNotes,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /users/:id/notes  { note }
    if (req.method === "POST" && path.match(/^users\/[^/]+\/notes$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.note) throw new Error("note required");
      const { data, error } = await sb.from("admin_user_notes").insert({
        target_user_id: userId, author_user_id: actor.user.id, note: body.note,
      }).select().single();
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_ADMIN_NOTE_ADDED", {
        target_table: "admin_user_notes", target_id: userId, note: body.note.slice(0, 200),
      });
      return new Response(JSON.stringify({ success: true, note: data }),
        { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /workspaces/:id/delete
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/delete$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const deleteType = body.type || 'soft';
      const reason = body.reason || '';

      // Orphan signup rows have synthetic IDs like "signup:<profile_uuid>" — they
      // are not tenants. Handle them by clearing the related profile data only.
      if (workspaceId.startsWith("signup:")) {
        const profileId = workspaceId.slice("signup:".length);
        if (deleteType === 'soft') {
          await sb.from("profiles").update({
            onboarding_step: 'archived',
          } as any).eq("id", profileId);
          await logAction(sb, actor, "PLATFORM_SIGNUP_ARCHIVED", {
            workspace_id: null, target_table: "profiles", target_id: profileId,
            note: reason || 'Signup archived',
          });
        } else {
          // Hard delete: remove onboarding events, profile, AND the auth user.
          await sb.from("onboarding_events").delete().eq("user_id", profileId);
          await sb.from("profiles").delete().eq("id", profileId);
          const { error: authDelErr } = await sb.auth.admin.deleteUser(profileId);
          if (authDelErr) console.error("[admin-api] auth.deleteUser failed:", authDelErr.message);
          await logAction(sb, actor, "PLATFORM_SIGNUP_DELETED", {
            workspace_id: null, target_table: "auth.users", target_id: profileId,
            note: reason || 'Signup permanently deleted (profile + auth user)',
          });
        }
        return new Response(JSON.stringify({ success: true, type: deleteType, signup: true }), {
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }


      if (deleteType === 'soft') {
        // Soft delete: suspend + mark as deleted
        const { error } = await sb.from("tenants").update({
          is_suspended: true,
          suspended_reason: `Archived by admin: ${reason}`.trim(),
          suspended_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        }).eq("id", workspaceId);
        if (error) throw new Error(error.message);
        await logAction(sb, actor, "PLATFORM_WORKSPACE_ARCHIVED", {
          workspace_id: workspaceId, note: reason || 'Soft deleted / archived',
        });
      } else {
        // Hard delete: remove workspace and all associated data
        // Delete in order to respect foreign keys
        const tables = [
          "campaign_jobs", "campaign_logs", "campaign_analytics", "campaign_audiences", "campaigns",
          "automation_steps", "automation_scheduled_jobs", "automation_runs",
          "automation_deadletters", "automation_cooldowns", "automation_rate_limits",
          "automation_loop_guards", "automation_edges", "automation_nodes", "automation_workflows",
          "messages", "conversations", "contact_tags", "contact_timeline", "contacts",
          "templates", "smeksh_phone_numbers", "agents",
          "workspace_entitlements", "tenant_members", "audit_logs",
        ];
        for (const table of tables) {
          await sb.from(table).delete().eq("tenant_id", workspaceId);
        }
        // Finally delete the tenant itself
        const { error } = await sb.from("tenants").delete().eq("id", workspaceId);
        if (error) throw new Error(error.message);
        await logAction(sb, actor, "PLATFORM_WORKSPACE_HARD_DELETED", {
          workspace_id: workspaceId, note: reason || 'Permanently deleted',
        });
      }

      return new Response(JSON.stringify({ success: true, type: deleteType }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents/:id/ai-summary
    if (req.method === "POST" && path.match(/^incidents\/[^/]+\/ai-summary$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      
      const [incidentRes, eventsRes, auditRes] = await Promise.all([
        sb.from("platform_incidents").select("*").eq("id", incidentId).single(),
        sb.from("platform_incident_events").select("*").eq("incident_id", incidentId).order("created_at", { ascending: true }),
        sb.from("platform_audit_logs").select("action,created_at,note").order("created_at", { ascending: false }).limit(20),
      ]);

      const incident = incidentRes.data;
      const events = eventsRes.data || [];

      const summaryParts = [
        `Incident: ${incident?.title || 'Unknown'}`,
        `Severity: ${incident?.severity || 'unknown'}`,
        `Status: ${incident?.status || 'unknown'}`,
        `Declared: ${incident?.created_at || 'N/A'}`,
        incident?.resolved_at ? `Resolved: ${incident.resolved_at}` : 'Still active',
        '',
        `Affected systems: ${(incident?.affected_systems || []).join(', ') || 'None specified'}`,
        '',
        'Timeline:',
        ...events.map((e: any) => `  • [${new Date(e.created_at).toLocaleString()}] ${e.event_type}: ${e.description}`),
        '',
        incident?.root_cause ? `Root Cause: ${incident.root_cause}` : '',
        incident?.actions_taken ? `Actions Taken: ${incident.actions_taken}` : '',
      ].filter(Boolean).join('\n');

      await logAction(sb, actor, "PLATFORM_AI_SUMMARY_GENERATED", {
        target_table: "platform_incidents", target_id: incidentId,
      });

      return new Response(JSON.stringify({ success: true, summary: summaryParts }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /phone-numbers
    if (req.method === "GET" && path === "phone-numbers") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const search = url.searchParams.get("search") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 25;
      const offset = (page - 1) * limit;

      let query = sb.from("phone_numbers").select("id, tenant_id, waba_account_id, phone_number_id, display_number, verified_name, quality_rating, status, messaging_limit, webhook_health, last_webhook_at, is_default, created_at, updated_at", { count: "exact" });
      if (search) {
        query = query.or(`display_number.ilike.%${search}%,verified_name.ilike.%${search}%`);
      }
      const { data: phones, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

      // Enrich with workspace names
      const tenantIds = [...new Set((phones || []).map((p: any) => p.tenant_id))];
      let tenantMap: Record<string, string> = {};
      if (tenantIds.length > 0) {
        const { data: tenants } = await sb.from("tenants").select("id, name").in("id", tenantIds);
        for (const t of tenants || []) tenantMap[t.id] = t.name;
      }

      // Enrich with WABA status
      const wabaIds = [...new Set((phones || []).filter((p: any) => p.waba_account_id).map((p: any) => p.waba_account_id))];
      let wabaMap: Record<string, any> = {};
      if (wabaIds.length > 0) {
        const { data: wabas } = await sb.from("waba_accounts").select("id, waba_id, status, name").in("id", wabaIds);
        for (const w of wabas || []) wabaMap[w.id] = w;
      }

      const enriched = (phones || []).map((p: any) => ({
        ...p,
        workspace_name: tenantMap[p.tenant_id] || null,
        waba: wabaMap[p.waba_account_id] || null,
      }));

      return new Response(JSON.stringify({ phones: enriched, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/update-status
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/update-status$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: before } = await sb.from("phone_numbers").select("*").eq("id", phoneId).single();
      const { error } = await sb.from("phone_numbers").update({
        status: body.status,
        updated_at: new Date().toISOString(),
      }).eq("id", phoneId);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_PHONE_STATUS_UPDATED", {
        target_table: "phone_numbers", target_id: phoneId,
        before: { status: before?.status }, after: { status: body.status },
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/delete
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/delete$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: phone } = await sb.from("phone_numbers").select("*").eq("id", phoneId).single();
      if (!phone) throw new Error("Phone number not found");

      // Remove from workspace_phone_numbers mapping
      await sb.from("workspace_phone_numbers").delete().eq("phone_e164", phone.display_number);

      // Delete the phone number record
      const { error } = await sb.from("phone_numbers").delete().eq("id", phoneId);
      if (error) throw new Error(error.message);

      await logAction(sb, actor, "PLATFORM_PHONE_DELETED", {
        workspace_id: phone.tenant_id, target_table: "phone_numbers", target_id: phoneId,
        note: `Deleted phone ${phone.display_number} from workspace`,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/toggle-waba
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/toggle-waba$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: phone } = await sb.from("phone_numbers").select("waba_account_id").eq("id", phoneId).single();
      if (!phone?.waba_account_id) throw new Error("No WABA account linked");
      const newStatus = body.enabled ? 'active' : 'disabled';
      const { error } = await sb.from("waba_accounts").update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq("id", phone.waba_account_id);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, body.enabled ? "PLATFORM_WABA_ENABLED" : "PLATFORM_WABA_DISABLED", {
        target_table: "waba_accounts", target_id: phone.waba_account_id,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /workspaces/:id/team-detail — full member info with last sign-in for accordion
    if (req.method === "GET" && path.match(/^workspaces\/[^/]+\/team-detail$/)) {
      await requirePlatformRole(req, ["super_admin", "support"]);
      const workspaceId = path.split("/")[1];
      const sb = adminClient();
      const { data: members } = await sb
        .from("tenant_members")
        .select("id, user_id, role, created_at, profiles(email, full_name, avatar_url, phone_number)")
        .eq("tenant_id", workspaceId);
      // last sign-in
      const ids = (members || []).map((m: any) => m.user_id);
      const lastSignIn: Record<string, string | null> = {};
      if (ids.length) {
        const { data: usersList } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
        for (const u of usersList?.users || []) {
          if (ids.includes(u.id)) lastSignIn[u.id] = (u as any).last_sign_in_at || null;
        }
      }
      return new Response(JSON.stringify({
        members: (members || []).map((m: any) => ({ ...m, last_sign_in_at: lastSignIn[m.user_id] || null })),
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /workspaces/:id/members/:memberId/remove
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/members\/[^/]+\/remove$/)) {
      const parts = path.split("/");
      const workspaceId = parts[1];
      const memberId = parts[3];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: m } = await sb.from("tenant_members").select("*").eq("id", memberId).single();
      if (!m) throw new Error("Member not found");
      if (m.role === "owner") throw new Error("Cannot remove the owner. Transfer ownership first.");
      const { error } = await sb.from("tenant_members").delete().eq("id", memberId);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_MEMBER_REMOVED", {
        workspace_id: workspaceId, target_table: "tenant_members", target_id: memberId,
        before: m, note: `Removed member ${m.user_id}`,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/members/:memberId/change-role { role }
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/members\/[^/]+\/change-role$/)) {
      const parts = path.split("/");
      const workspaceId = parts[1];
      const memberId = parts[3];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const newRole = String(body.role || "");
      if (!["owner", "admin", "agent"].includes(newRole)) throw new Error("Invalid role");
      const { data: before } = await sb.from("tenant_members").select("*").eq("id", memberId).single();
      if (!before) throw new Error("Member not found");
      if (before.role === "owner" && newRole !== "owner") {
        throw new Error("Cannot demote the owner. Transfer ownership first.");
      }
      const { error } = await sb.from("tenant_members").update({ role: newRole }).eq("id", memberId);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_MEMBER_ROLE_CHANGED", {
        workspace_id: workspaceId, target_table: "tenant_members", target_id: memberId,
        before: { role: before.role }, after: { role: newRole },
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/transfer-ownership { new_owner_user_id }
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/transfer-ownership$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const newOwnerId = String(body.new_owner_user_id || "");
      if (!newOwnerId) throw new Error("new_owner_user_id required");

      const { data: currentOwner } = await sb.from("tenant_members")
        .select("*").eq("tenant_id", workspaceId).eq("role", "owner").maybeSingle();
      const { data: target } = await sb.from("tenant_members")
        .select("*").eq("tenant_id", workspaceId).eq("user_id", newOwnerId).maybeSingle();
      if (!target) throw new Error("Target user is not a member of this workspace");

      // Demote current owner -> admin, promote target -> owner
      if (currentOwner && currentOwner.user_id !== newOwnerId) {
        await sb.from("tenant_members").update({ role: "admin" }).eq("id", currentOwner.id);
      }
      const { error } = await sb.from("tenant_members").update({ role: "owner" }).eq("id", target.id);
      if (error) throw new Error(error.message);

      await logAction(sb, actor, "PLATFORM_OWNERSHIP_TRANSFERRED", {
        workspace_id: workspaceId, target_table: "tenant_members", target_id: target.id,
        before: { owner: currentOwner?.user_id }, after: { owner: newOwnerId },
        note: body.reason || null,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/reset-settings — wipe entitlements back to defaults (free plan)
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/reset-settings$/)) {
      const workspaceId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: before } = await sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle();
      const { error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId,
        plan: "free",
        status: "active",
        sending_paused: false,
        enable_ai: false,
        enable_ads: false,
        enable_integrations: false,
        enable_autoforms: false,
        monthly_conversation_limit: 100,
        monthly_broadcast_limit: 0,
        monthly_template_limit: 5,
        monthly_flow_limit: 1,
        updated_by: actor.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_WORKSPACE_RESET", {
        workspace_id: workspaceId, target_table: "workspace_entitlements",
        before, note: "Reset to default free settings",
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/disconnect-whatsapp — disconnect all phone numbers
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/disconnect-whatsapp$/)) {
      const workspaceId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: phones } = await sb.from("phone_numbers").select("id, display_number").eq("tenant_id", workspaceId);
      for (const p of phones || []) {
        await sb.from("phone_numbers").update({ status: "disconnected", updated_at: new Date().toISOString() }).eq("id", p.id);
      }
      await sb.from("workspace_phone_numbers").delete().eq("workspace_id", workspaceId);
      await logAction(sb, actor, "PLATFORM_WHATSAPP_DISCONNECTED", {
        workspace_id: workspaceId, note: `Disconnected ${phones?.length || 0} phone(s)`,
      });
      return new Response(JSON.stringify({ success: true, disconnected: phones?.length || 0 }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e: any) {
    const msg = e.message || "";
    const status = msg.includes("Forbidden") ? 403
      : msg.includes("auth") || msg.includes("Access") || msg.includes("Read-only") ? 401
      : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
