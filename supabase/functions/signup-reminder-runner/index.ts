// Cron-driven reminder runner. Sends:
//  - "complete-signup-reminder" to users whose email is unconfirmed at 1h/24h/3d after signup
//  - "create-workspace-reminder" to confirmed users with no workspace at 1h/24h/3d
// Idempotent via signup_reminder_log unique constraint.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGES = [
  { key: "1h",  minMin: 60,        maxMin: 60 * 6 },        // 1h..6h after eligible
  { key: "24h", minMin: 60 * 24,   maxMin: 60 * 30 },       // 24h..30h
  { key: "3d",  minMin: 60 * 24 * 3, maxMin: 60 * 24 * 5 }, // 3d..5d (final)
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const stats = { signup: 0, workspace: 0, errors: [] as string[] };
  const now = Date.now();

  try {
    // === 1. Incomplete signup (email NOT confirmed) ===
    // Iterate auth users in pages
    let page = 1;
    while (page <= 10) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = data?.users || [];
      if (!users.length) break;

      for (const u of users) {
        if (!u.email) continue;
        if (u.email_confirmed_at) continue; // they confirmed
        const created = new Date(u.created_at).getTime();
        const ageMin = (now - created) / 60000;

        const stage = STAGES.find(s => ageMin >= s.minMin && ageMin <= s.maxMin);
        if (!stage) continue;

        // Already sent?
        const { data: existing } = await sb.from("signup_reminder_log")
          .select("id").eq("user_id", u.id).eq("reminder_type", "signup")
          .eq("reminder_stage", stage.key).maybeSingle();
        if (existing) continue;

        const name = (u.user_metadata as any)?.full_name?.split(" ")?.[0] || null;
        try {
          await sb.functions.invoke("send-transactional-email", {
            body: {
              templateName: "complete-signup-reminder",
              recipientEmail: u.email,
              idempotencyKey: `signup-reminder-${u.id}-${stage.key}`,
              templateData: { name, resumeUrl: "https://aireatro.com/signup" },
            },
          });
          await sb.from("signup_reminder_log").insert({
            user_id: u.id, email: u.email, reminder_type: "signup", reminder_stage: stage.key,
          });
          stats.signup++;
        } catch (e: any) {
          stats.errors.push(`signup ${u.email}: ${e?.message}`);
        }
      }
      if (users.length < 200) break;
      page++;
    }

    // === 2. Confirmed users with no workspace ===
    page = 1;
    while (page <= 10) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = data?.users || [];
      if (!users.length) break;

      for (const u of users) {
        if (!u.email || !u.email_confirmed_at) continue;
        const confirmed = new Date(u.email_confirmed_at).getTime();
        const ageMin = (now - confirmed) / 60000;
        const stage = STAGES.find(s => ageMin >= s.minMin && ageMin <= s.maxMin);
        if (!stage) continue;

        // Has any workspace?
        const { count } = await sb.from("tenant_members")
          .select("tenant_id", { count: "exact", head: true }).eq("user_id", u.id);
        if ((count || 0) > 0) continue;

        const { data: existing } = await sb.from("signup_reminder_log")
          .select("id").eq("user_id", u.id).eq("reminder_type", "workspace")
          .eq("reminder_stage", stage.key).maybeSingle();
        if (existing) continue;

        const name = (u.user_metadata as any)?.full_name?.split(" ")?.[0] || null;
        try {
          await sb.functions.invoke("send-transactional-email", {
            body: {
              templateName: "create-workspace-reminder",
              recipientEmail: u.email,
              idempotencyKey: `workspace-reminder-${u.id}-${stage.key}`,
              templateData: { name, workspaceUrl: "https://app.aireatro.com/create-workspace" },
            },
          });
          await sb.from("signup_reminder_log").insert({
            user_id: u.id, email: u.email, reminder_type: "workspace", reminder_stage: stage.key,
          });
          stats.workspace++;
        } catch (e: any) {
          stats.errors.push(`workspace ${u.email}: ${e?.message}`);
        }
      }
      if (users.length < 200) break;
      page++;
    }

    return new Response(JSON.stringify({ success: true, ...stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message, stats }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
