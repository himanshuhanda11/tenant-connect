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
// Edge functions have a hard ~256MB memory ceiling. Keep totals well below that
// so the in-memory ZIP build never OOMs. Larger files are listed in the
// inventory but their bytes are skipped (operator can re-upload from the live
// bucket during restore).
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_TOTAL_BYTES = 80 * 1024 * 1024; // 80 MB total bytes

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
  // Cron path: x-cron: 1 + matching token from platform_internal_settings
  if (req.headers.get("x-cron") === "1") {
    const token = req.headers.get("x-cron-token") || "";
    const sb = admin();
    const { data } = await sb
      .from("platform_internal_settings")
      .select("value")
      .eq("key", "backup_cron_token")
      .maybeSingle();
    if (token && data?.value && token === data.value) {
      return { userId: null, cron: true };
    }
  }
  // Service-role direct call (kept for emergencies)
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

// ===== Google Drive integration via Lovable connector gateway =====
const DRIVE_GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";
const DRIVE_UPLOAD = "https://connector-gateway.lovable.dev/google_drive/upload/drive/v3";
const DRIVE_FOLDER_NAME = "Aireatro Daily Backups";

function driveHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const drv = Deno.env.get("GOOGLE_DRIVE_API_KEY");
  if (!lov) throw new Error("LOVABLE_API_KEY missing");
  if (!drv) throw new Error("GOOGLE_DRIVE_API_KEY missing (Google Drive not connected)");
  return { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": drv };
}

async function getOrCreateDriveFolder(): Promise<string> {
  const q = encodeURIComponent(
    `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const r = await fetch(`${DRIVE_GATEWAY}/files?q=${q}&fields=files(id,name)&pageSize=10`, {
    headers: driveHeaders(),
  });
  if (!r.ok) throw new Error(`Drive search failed [${r.status}]: ${await r.text()}`);
  const j = await r.json();
  if (j.files?.length) return j.files[0].id;

  const create = await fetch(`${DRIVE_GATEWAY}/files?fields=id`, {
    method: "POST",
    headers: { ...driveHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!create.ok) throw new Error(`Drive folder create failed [${create.status}]: ${await create.text()}`);
  return (await create.json()).id;
}

async function uploadToDrive(zipped: Uint8Array, fileName: string) {
  const folderId = await getOrCreateDriveFolder();
  const boundary = "lovable_backup_" + crypto.randomUUID();
  const meta = JSON.stringify({ name: fileName, parents: [folderId] });
  const enc = new TextEncoder();
  const head = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: application/zip\r\n\r\n`,
  );
  const tail = enc.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(head.length + zipped.length + tail.length);
  body.set(head, 0);
  body.set(zipped, head.length);
  body.set(tail, head.length + zipped.length);

  const r = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,webViewLink,size`, {
    method: "POST",
    headers: { ...driveHeaders(), "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`Drive upload failed [${r.status}]: ${await r.text()}`);
  const j = await r.json();
  return { ok: true as const, fileId: j.id, folderId, webLink: j.webViewLink };
}

async function cleanupDriveOldBackups(folderId: string, keep = 7) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const r = await fetch(
    `${DRIVE_GATEWAY}/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime)&pageSize=100`,
    { headers: driveHeaders() },
  );
  if (!r.ok) return;
  const { files = [] } = await r.json();
  for (const f of files.slice(keep)) {
    await fetch(`${DRIVE_GATEWAY}/files/${f.id}`, { method: "DELETE", headers: driveHeaders() }).catch(() => {});
  }
}

// Recursively walk a bucket and return every object path.
async function walkBucket(sb: any, bucket: string, prefix = ""): Promise<Array<{ name: string; size: number; updated_at: string | null }>> {
  const out: Array<{ name: string; size: number; updated_at: string | null }> = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error || !data) break;
    for (const f of data) {
      const full = prefix ? `${prefix}/${f.name}` : f.name;
      // Folders have no metadata.size; recurse into them
      if (!f.metadata) {
        const sub = await walkBucket(sb, bucket, full);
        out.push(...sub);
      } else {
        out.push({ name: full, size: Number(f.metadata?.size || 0), updated_at: f.updated_at });
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function runBackup(req: Request, trigger: "manual" | "scheduled", actorId: string | null) {
  const sb = admin();
  const startedAt = Date.now();
  const tables = await listPublicTables(sb);

  // Insert run row first (pending)
  const { data: run } = await sb
    .from("platform_backup_runs")
    .insert({ status: "pending", trigger, triggered_by: actorId, tables_included: tables })
    .select()
    .single();
  const runId = run!.id as string;

  try {
    const filesObj: Record<string, Uint8Array> = {};
    let okTables = 0;
    const tableErrors: Record<string, string> = {};

    // Per-table CSV + JSON (auto-discovered)
    for (const t of tables) {
      try {
        const rows = await fetchAllRows(sb, t);
        filesObj[`tables/csv/${t}.csv`] = strToU8(toCSV(rows));
        filesObj[`tables/json/${t}.json`] = strToU8(JSON.stringify(rows, null, 2));
        okTables++;
      } catch (e: any) {
        tableErrors[t] = String(e?.message || e);
      }
    }

    // ===== Storage: inventory + actual file bytes =====
    const { data: buckets } = await sb.storage.listBuckets();
    const storageInventory: any[] = [];
    const storageDownloaded: any[] = [];
    const storageSkipped: any[] = [];
    let totalBytes = 0;

    for (const b of buckets || []) {
      if (b.id === "database-backups") continue; // skip self
      const objects = await walkBucket(sb, b.id);
      for (const obj of objects) {
        storageInventory.push({ bucket: b.id, ...obj });
        if (obj.size > MAX_FILE_BYTES) {
          storageSkipped.push({ bucket: b.id, name: obj.name, size: obj.size, reason: "exceeds_per_file_cap" });
          continue;
        }
        if (totalBytes + obj.size > MAX_TOTAL_BYTES) {
          storageSkipped.push({ bucket: b.id, name: obj.name, size: obj.size, reason: "total_cap_reached" });
          continue;
        }
        try {
          const { data: blob, error } = await sb.storage.from(b.id).download(obj.name);
          if (error || !blob) {
            storageSkipped.push({ bucket: b.id, name: obj.name, reason: error?.message || "download_failed" });
            continue;
          }
          const bytes = new Uint8Array(await blob.arrayBuffer());
          filesObj[`storage/files/${b.id}/${obj.name}`] = bytes;
          totalBytes += bytes.byteLength;
          storageDownloaded.push({ bucket: b.id, name: obj.name, size: bytes.byteLength });
        } catch (e: any) {
          storageSkipped.push({ bucket: b.id, name: obj.name, reason: String(e?.message || e) });
        }
      }
    }
    filesObj["storage/file_list.json"] = strToU8(JSON.stringify(storageInventory, null, 2));
    filesObj["storage/_downloaded.json"] = strToU8(JSON.stringify(storageDownloaded, null, 2));
    filesObj["storage/_skipped.json"] = strToU8(JSON.stringify(storageSkipped, null, 2));

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
      app: "Aireatro",
      tables,
      table_count: okTables,
      table_errors: tableErrors,
      buckets: (buckets || []).map((b: any) => ({ id: b.id, public: b.public })),
      storage_files_total: storageInventory.length,
      storage_files_downloaded: storageDownloaded.length,
      storage_files_skipped: storageSkipped.length,
      storage_bytes_downloaded: totalBytes,
      schema_note: "Full schema + edge functions + frontend live in GitHub repo.",
    };
    filesObj["manifest.json"] = strToU8(JSON.stringify(manifest, null, 2));

    filesObj["RESTORE_README.txt"] = strToU8(
      [
        "Aireatro full backup",
        "====================",
        `Generated: ${manifest.generated_at}`,
        `Tables: ${okTables} / ${tables.length}`,
        `Storage files: ${storageDownloaded.length} downloaded, ${storageSkipped.length} skipped`,
        `Total storage bytes: ${totalBytes}`,
        "",
        "Restore order:",
        "  1. Create a new Supabase project.",
        "  2. Run `aireatro_full_schema.sql` in SQL Editor (from GitHub repo).",
        "  3. Recreate buckets listed in manifest.json -> buckets.",
        "  4. Re-upload files from storage/files/<bucket>/... to matching buckets.",
        "  5. Import tables/csv/*.csv in FK-safe order (see DATABASE_RESTORE_GUIDE.md).",
        "  6. Recreate secrets listed in config/env.secrets.list.txt.",
        "  7. Deploy edge functions from GitHub repo (`supabase functions deploy`).",
        "  8. Update VITE_SUPABASE_URL/KEY in frontend deploy env.",
        "",
        "Frontend code, migrations and edge functions are NOT included here —",
        "they live in the GitHub repository connected to this project.",
      ].join("\n")
    );

    // Build ZIP
    const zipped = zipSync(filesObj, { level: 6 });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `aireatro-backup-${ts}.zip`;
    const path = `${ts}/${fileName}`;

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

    // Upload to Google Drive (best-effort: errors are recorded but don't fail the run)
    const driveResult = await uploadToDrive(zipped, fileName).catch((e: any) => ({
      ok: false,
      error: String(e?.message || e),
    }));
    await sb
      .from("platform_backup_runs")
      .update({
        drive_status: driveResult.ok ? "uploaded" : "failed",
        drive_file_id: (driveResult as any).fileId || null,
        drive_folder_id: (driveResult as any).folderId || null,
        drive_web_link: (driveResult as any).webLink || null,
        drive_error: (driveResult as any).error || null,
      })
      .eq("id", runId);

    // Retention: keep last 7 (Supabase + Google Drive)
    await sb.rpc("cleanup_old_backups").catch(() => {});
    if (driveResult.ok) {
      await cleanupDriveOldBackups((driveResult as any).folderId).catch((e: any) =>
        console.warn("[backup] drive cleanup failed:", e?.message),
      );
    }

    return {
      ok: true,
      run_id: runId,
      path,
      size: zipped.byteLength,
      table_count: okTables,
      duration_ms: ms,
      drive: driveResult,
    };
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
