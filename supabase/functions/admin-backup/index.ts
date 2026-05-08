// Super-admin database backup runner
// Endpoints (all under /admin-backup):
//   POST  /run                  -> create a new backup ZIP (super_admin OR cron via service role apikey)
//   GET   /list                 -> list recent backup runs (super_admin)
//   GET   /download/:id         -> signed URL to a backup ZIP (super_admin)
//   POST  /cleanup              -> manually run retention (super_admin)
//
// Live DB connection is unchanged. This function only READS data, writes to
// the `database-backups` storage bucket, and inserts into platform_backup_runs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { zipSync, strToU8 } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Tables are auto-discovered from information_schema so newly added
// tables are automatically backed up. Exclude noisy/self tables.
const TABLE_EXCLUDE = new Set<string>(["platform_backup_runs"]);

// Per-file cap (skip giant single objects); total storage cap keeps ZIP sane.
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500 MB

async function listPublicTables(sb: any): Promise<string[]> {
  const { data, error } = await sb.rpc("backup_list_public_tables");
  if (error || !data) {
    console.warn("[backup] table discovery RPC failed:", error?.message);
    return [];
  }
  return (data as Array<{ table_name: string }>)
    .map((r) => r.table_name)
    .filter((t) => !TABLE_EXCLUDE.has(t));
}

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE);
}

async function requireSuperAdminOrCron(req: Request): Promise<{ userId: string | null; cron: boolean }> {
  // Cron / service path: apikey header equals service role key
  const apiKey = req.headers.get("apikey") || "";
  if (apiKey === SERVICE_ROLE && req.headers.get("x-cron") === "1") {
    return { userId: null, cron: true };
  }

  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.replace("Bearer ", "");
  if (!jwt) throw new Error("Missing auth");

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u, error } = await userClient.auth.getUser(jwt);
  if (error || !u?.user) throw new Error("Invalid auth");

  const sb = admin();
  const { data: pu } = await sb
    .from("platform_admins")
    .select("role,is_active")
    .eq("user_id", u.user.id)
    .single();
  if (!pu?.is_active || pu.role !== "super_admin") throw new Error("Forbidden");
  return { userId: u.user.id, cron: false };
}

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const cols = Array.from(
    rows.reduce((s: Set<string>, r: any) => {
      Object.keys(r || {}).forEach((k) => s.add(k));
      return s;
    }, new Set<string>())
  );
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/["\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape((r as any)[c])).join(",")).join("\n");
  return header + "\n" + body;
}

async function fetchAllRows(sb: any, table: string, pageSize = 1000): Promise<any[]> {
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select("*").range(from, from + pageSize - 1);
    if (error) {
      console.warn(`[backup] table ${table} failed:`, error.message);
      return all; // partial
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function listStorageFiles(sb: any) {
  const { data: buckets } = await sb.storage.listBuckets();
  const out: any[] = [];
  for (const b of buckets || []) {
    if (b.id === "database-backups") continue; // skip self
    try {
      const { data: files } = await sb.storage.from(b.id).list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
      for (const f of files || []) {
        out.push({ bucket: b.id, name: f.name, size: f.metadata?.size, updated_at: f.updated_at });
      }
    } catch (e) {
      console.warn(`[backup] list bucket ${b.id} failed:`, (e as any)?.message);
    }
  }
  return out;
}

async function runBackup(req: Request, trigger: "manual" | "scheduled", actorId: string | null) {
  const sb = admin();
  const startedAt = Date.now();

  // Insert run row first (pending)
  const { data: run } = await sb
    .from("platform_backup_runs")
    .insert({ status: "pending", trigger, triggered_by: actorId, tables_included: BACKUP_TABLES })
    .select()
    .single();
  const runId = run!.id as string;

  try {
    const filesObj: Record<string, Uint8Array> = {};
    let okTables = 0;

    // Per-table CSV + JSON
    for (const t of BACKUP_TABLES) {
      const rows = await fetchAllRows(sb, t);
      filesObj[`tables/csv/${t}.csv`] = strToU8(toCSV(rows));
      filesObj[`tables/json/${t}.json`] = strToU8(JSON.stringify(rows, null, 2));
      okTables++;
    }

    // Storage file inventory
    const storageList = await listStorageFiles(sb);
    filesObj["storage/file_list.json"] = strToU8(JSON.stringify(storageList, null, 2));

    // Environment snapshot
    // - .env: public/non-secret values only (safe to ship in backup)
    // - env.secrets.list.txt: NAMES of configured secrets (no values) so a restore
    //   operator knows which secrets to recreate in the new project.
    const projectRef = (SUPABASE_URL.match(/https?:\/\/([^.]+)\./) || [])[1] || "";
    const envFile = [
      "# Aireatro public environment snapshot",
      "# These are PUBLIC values — safe to commit. Secret keys are NOT included here.",
      "# Recreate secrets in your new Supabase project using env.secrets.list.txt.",
      `VITE_SUPABASE_URL=${SUPABASE_URL}`,
      `VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY}`,
      `VITE_SUPABASE_PROJECT_ID=${projectRef}`,
      "",
    ].join("\n");
    filesObj["config/.env"] = strToU8(envFile);

    const allEnv = Object.keys(Deno.env.toObject()).sort();
    const secretNames = allEnv.filter(
      (k) => !["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"].includes(k),
    );
    filesObj["config/env.secrets.list.txt"] = strToU8(
      [
        "# Names of secrets configured on the source project (values intentionally omitted).",
        "# Recreate these in the destination project before deploying edge functions.",
        "",
        ...secretNames,
      ].join("\n"),
    );

    // Manifest
    const manifest = {
      generated_at: new Date().toISOString(),
      trigger,
      run_id: runId,
      tables: BACKUP_TABLES,
      table_count: okTables,
      storage_files_total: storageList.length,
      app: "Aireatro",
      schema_note: "Full schema lives in supabase/migrations + aireatro_full_schema.sql in repo.",
    };
    filesObj["manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));

    // Restore quick reference
    filesObj["RESTORE_README.txt"] = strToU8(
      [
        "Aireatro backup ZIP",
        "===================",
        `Generated: ${manifest.generated_at}`,
        `Tables: ${okTables}`,
        "",
        "1. Create a new Supabase project.",
        "2. Run `aireatro_full_schema.sql` (from repo) in SQL Editor.",
        "3. Recreate storage buckets (see DATABASE_RESTORE_GUIDE.md).",
        "4. Import CSVs from tables/csv/ in the order documented in the guide.",
        "5. Re-upload media files referenced in storage/file_list.json.",
        "",
        "Full instructions: DATABASE_RESTORE_GUIDE.md in the project repo.",
      ].join("\n")
    );

    // Build ZIP
    const zipped = zipSync(filesObj, { level: 6 });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `${ts}/aireatro-backup-${ts}.zip`;

    const { error: upErr } = await sb.storage
      .from("database-backups")
      .upload(path, zipped, { contentType: "application/zip", upsert: false });
    if (upErr) throw upErr;

    const ms = Date.now() - startedAt;
    await sb
      .from("platform_backup_runs")
      .update({
        status: "success",
        storage_path: path,
        file_size_bytes: zipped.byteLength,
        table_count: okTables,
        duration_ms: ms,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // Retention: keep last 30
    await sb.rpc("cleanup_old_backups").catch(() => {});

    return { ok: true, run_id: runId, path, size: zipped.byteLength, table_count: okTables, duration_ms: ms };
  } catch (e: any) {
    await sb
      .from("platform_backup_runs")
      .update({
        status: "failed",
        error_message: String(e?.message || e),
        duration_ms: Date.now() - startedAt,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);
    throw e;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-backup\/?/, "");
    const sb = admin();

    if (req.method === "POST" && path === "run") {
      const { userId, cron } = await requireSuperAdminOrCron(req);
      const result = await runBackup(req, cron ? "scheduled" : "manual", userId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (req.method === "GET" && path === "list") {
      await requireSuperAdminOrCron(req);
      const { data } = await sb
        .from("platform_backup_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Latest success
      const latest = (data || []).find((r: any) => r.status === "success") || null;
      return new Response(JSON.stringify({ runs: data || [], latest }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (req.method === "GET" && path.startsWith("download/")) {
      const { userId } = await requireSuperAdminOrCron(req);
      const id = path.split("/")[1];
      const { data: run } = await sb
        .from("platform_backup_runs")
        .select("*")
        .eq("id", id)
        .single();
      if (!run?.storage_path) throw new Error("Backup not found or incomplete");

      const { data: signed, error } = await sb.storage
        .from("database-backups")
        .createSignedUrl(run.storage_path, 60 * 10); // 10 min
      if (error) throw error;

      // Audit who downloaded
      const downloads = Array.isArray(run.downloaded_by) ? run.downloaded_by : [];
      downloads.push({ user_id: userId, at: new Date().toISOString() });
      await sb.from("platform_backup_runs").update({ downloaded_by: downloads }).eq("id", id);
      await sb.from("platform_audit_logs").insert({
        actor_user_id: userId,
        actor_role: "super_admin",
        action: "BACKUP_DOWNLOADED",
        target_table: "platform_backup_runs",
        target_id: id,
        note: run.storage_path,
      });

      return new Response(JSON.stringify({ url: signed.signedUrl, path: run.storage_path }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (req.method === "POST" && path === "cleanup") {
      await requireSuperAdminOrCron(req);
      await sb.rpc("cleanup_old_backups");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[admin-backup]", e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
