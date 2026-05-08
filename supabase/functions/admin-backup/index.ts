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
import { Zip, ZipPassThrough, strToU8 } from "https://esm.sh/fflate@0.8.2";

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
const STALE_PENDING_MS = 10 * 60 * 1000;
const STUCK_ZERO_PROGRESS_MS = 2 * 60 * 1000;
const EDGE_UNSAFE_TABLE_EXACT = new Set<string>([
  "messages",
  "smeksh_messages",
  "instagram_messages",
  "webhook_events",
  "shopify_webhook_events",
  "contact_inbox_summary",
  "smeksh_typing_state",
]);
const EDGE_UNSAFE_TABLE_SUFFIXES = ["_logs", "_events", "_jobs", "_sessions", "_analytics"];

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

function planEdgeSafeTables(tables: string[]) {
  const skipped: Array<{ table_name: string; reason: string }> = [];
  const exportTables = tables.filter((table) => {
    const unsafe = EDGE_UNSAFE_TABLE_EXACT.has(table) || EDGE_UNSAFE_TABLE_SUFFIXES.some((suffix) => table.endsWith(suffix));
    if (unsafe) {
      skipped.push({ table_name: table, reason: "Skipped in Edge backup because this table can exceed worker CPU/time limits; full DB backup must use pg_dump/PITR." });
      return false;
    }
    return true;
  });
  return { exportTables, skipped };
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

// Stream rows from a table page-by-page into a callback. Memory stays flat.
async function streamTableRows(
  sb: any,
  table: string,
  onPage: (rows: any[], pageIndex: number) => Promise<void> | void,
  pageSize = 500,
): Promise<{ total: number; error: string | null }> {
  let from = 0;
  let total = 0;
  let pageIndex = 0;
  while (true) {
    const { data, error } = await sb.from(table).select("*").range(from, from + pageSize - 1);
    if (error) {
      console.warn(`[backup] table ${table} failed:`, error.message);
      return { total, error: error.message };
    }
    if (!data || data.length === 0) break;
    await onPage(data, pageIndex++);
    total += data.length;
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return { total, error: null };
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

async function uploadToDriveStreamed(tmpPath: string, fileSize: number, fileName: string) {
  const folderId = await getOrCreateDriveFolder();
  const file = await Deno.open(tmpPath, { read: true });
  try {
    const upload = await fetch(`${DRIVE_UPLOAD}/files?uploadType=media&fields=id`, {
      method: "POST",
      headers: { ...driveHeaders(), "Content-Type": "application/zip", "Content-Length": String(fileSize) },
      body: file.readable,
      // @ts-ignore - Deno fetch supports duplex streaming
      duplex: "half",
    });
    if (!upload.ok) throw new Error(`Drive upload failed [${upload.status}]: ${await upload.text()}`);
    const { id: fileId } = await upload.json();
    const patch = await fetch(
      `${DRIVE_GATEWAY}/files/${fileId}?addParents=${folderId}&fields=id,webViewLink`,
      {
        method: "PATCH",
        headers: { ...driveHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: fileName }),
      },
    );
    if (!patch.ok) throw new Error(`Drive patch failed [${patch.status}]: ${await patch.text()}`);
    const j = await patch.json();
    return { ok: true as const, fileId: j.id, folderId, webLink: j.webViewLink };
  } finally {
    try { file.close(); } catch { /* already closed */ }
  }
}

// Stream a temp file directly to Supabase Storage REST (no in-memory buffer).
async function uploadFileToStorageStreamed(tmpPath: string, fileSize: number, bucketPath: string) {
  const file = await Deno.open(tmpPath, { read: true });
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/database-backups/${bucketPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/zip",
        "Content-Length": String(fileSize),
        "x-upsert": "false",
      },
      body: file.readable,
      // @ts-ignore - Deno fetch supports duplex streaming
      duplex: "half",
    });
    if (!r.ok) throw new Error(`Storage upload failed [${r.status}]: ${await r.text()}`);
  } finally {
    try { file.close(); } catch { /* already closed */ }
  }
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

async function runBackup(reqUrl: string, trigger: "manual" | "scheduled", actorId: string | null, existingRunId?: string) {
  const sb = admin();
  const startedAt = Date.now();
  const allTables = await listPublicTables(sb);
  const { exportTables: tables, skipped: skippedTables } = planEdgeSafeTables(allTables);

  let runId: string;
  if (existingRunId) {
    runId = existingRunId;
    await sb.from("platform_backup_runs").update({
      tables_included: tables,
      tables_total: tables.length,
      tables_done: 0,
      progress_percent: 2,
      current_step: `Preparing edge-safe snapshot: ${tables.length}/${allTables.length} tables…`,
      started_at: new Date().toISOString(),
    }).eq("id", runId);
  } else {
    const { data: run } = await sb
      .from("platform_backup_runs")
      .insert({
        status: "pending", trigger, triggered_by: actorId, tables_included: tables,
        tables_total: tables.length, progress_percent: 2,
        current_step: `Preparing edge-safe snapshot: ${tables.length}/${allTables.length} tables…`,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    runId = run!.id as string;
  }

  // Throttled progress writer (avoid hammering DB)
  let lastProgressWrite = 0;
  const writeProgress = async (patch: Record<string, unknown>, force = false) => {
    const now = Date.now();
    if (!force && now - lastProgressWrite < 1500) return;
    lastProgressWrite = now;
    await sb.from("platform_backup_runs").update(patch).eq("id", runId).then(() => {}, () => {});
  };

  // ====== Streaming ZIP to a temp file (memory stays flat) ======
  const tmpPath = await Deno.makeTempFile({ prefix: "aireatro-backup-", suffix: ".zip" });
  const tmpFile = await Deno.open(tmpPath, { write: true, create: true, truncate: true });
  const writer = tmpFile.writable.getWriter();
  const pendingWrites: Promise<unknown>[] = [];

  const zip = new Zip();
  zip.ondata = (err, chunk, _final) => {
    if (err) {
      console.error("[backup] zip error:", err);
      return;
    }
    if (chunk && chunk.length) pendingWrites.push(writer.write(chunk));
  };

  const addFile = (name: string, bytes: Uint8Array) => {
    const entry = new ZipPassThrough(name);
    zip.add(entry);
    entry.push(bytes, true);
  };

  let okTables = 0;
  const tableErrors: Record<string, string> = {};
  const tableCounts: Record<string, number> = {};

  try {
    // Tables phase = 0% → 80% of overall progress
    let idx = 0;
    for (const t of tables) {
      idx++;
      await writeProgress({
        current_step: `Exporting table ${idx}/${tables.length}: ${t}`,
        tables_done: idx - 1,
        progress_percent: Math.min(80, Math.round((idx - 1) / Math.max(1, tables.length) * 80) + 2),
      });
      const entry = new ZipPassThrough(`tables/json/${t}.jsonl`);
      zip.add(entry);
      const { total, error } = await streamTableRows(sb, t, (rows) => {
        const chunk = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
        entry.push(strToU8(chunk), false);
      });
      entry.push(new Uint8Array(0), true);
      tableCounts[t] = total;
      if (error) tableErrors[t] = error;
      else okTables++;
      if (pendingWrites.length) {
        await Promise.all(pendingWrites.splice(0));
      }
    }
    await writeProgress({ tables_done: tables.length, progress_percent: 80, current_step: "Indexing storage files…" }, true);

    // ===== Storage: inventory only (file bytes opt-in via ?include_storage=1) =====
    const url = new URL(reqUrl);
    const includeStorageBytes = url.searchParams.get("include_storage") === "1";
    const { data: buckets } = await sb.storage.listBuckets();
    const storageInventory: any[] = [];
    const storageDownloaded: any[] = [];
    const storageSkipped: any[] = [];
    let totalBytes = 0;

    for (const b of buckets || []) {
      if (b.id === "database-backups") continue;
      const objects = await walkBucket(sb, b.id);
      for (const obj of objects) {
        storageInventory.push({ bucket: b.id, ...obj });
        if (!includeStorageBytes) continue;
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
          addFile(`storage/files/${b.id}/${obj.name}`, bytes);
          totalBytes += bytes.byteLength;
          storageDownloaded.push({ bucket: b.id, name: obj.name, size: bytes.byteLength });
        } catch (e: any) {
          storageSkipped.push({ bucket: b.id, name: obj.name, reason: String(e?.message || e) });
        }
      }
    }
    addFile("storage/file_list.json", strToU8(JSON.stringify(storageInventory)));
    addFile("storage/_downloaded.json", strToU8(JSON.stringify(storageDownloaded)));
    addFile("storage/_skipped.json", strToU8(JSON.stringify(storageSkipped)));
    addFile("storage/_mode.txt", strToU8(includeStorageBytes ? "bytes_included" : "inventory_only"));

    // Env snapshot
    const projectRef = (SUPABASE_URL.match(/https?:\/\/([^.]+)\./) || [])[1] || "";
    addFile(
      "config/.env",
      strToU8(
        [
          "# Aireatro public environment snapshot",
          "# These are PUBLIC values — safe to commit. Secret keys are NOT included here.",
          "# Recreate secrets in your new Supabase project using env.secrets.list.txt.",
          `VITE_SUPABASE_URL=${SUPABASE_URL}`,
          `VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY}`,
          `VITE_SUPABASE_PROJECT_ID=${projectRef}`,
          "",
        ].join("\n"),
      ),
    );
    const allEnv = Object.keys(Deno.env.toObject()).sort();
    const secretNames = allEnv.filter(
      (k) => !["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"].includes(k),
    );
    addFile(
      "config/env.secrets.list.txt",
      strToU8(
        [
          "# Names of secrets configured on the source project (values intentionally omitted).",
          "# Recreate these in the destination project before deploying edge functions.",
          "",
          ...secretNames,
        ].join("\n"),
      ),
    );

    const manifest = {
      generated_at: new Date().toISOString(),
      trigger,
      run_id: runId,
      app: "Aireatro",
      tables,
      table_count: okTables,
      table_row_counts: tableCounts,
      table_errors: tableErrors,
      skipped_tables: skippedTables,
      skipped_table_count: skippedTables.length,
      buckets: (buckets || []).map((b: any) => ({ id: b.id, public: b.public })),
      storage_files_total: storageInventory.length,
      storage_files_downloaded: storageDownloaded.length,
      storage_files_skipped: storageSkipped.length,
      storage_bytes_downloaded: totalBytes,
      schema_note: "Full schema + edge functions + frontend live in GitHub repo.",
      full_backup_note: "This in-app Edge backup intentionally skips high-volume operational tables. Disaster recovery/full exports should use Lovable Cloud PITR or the GitHub Actions pg_dump workflow.",
      format_note: "Each tables/json/<name>.jsonl is newline-delimited JSON (one row per line).",
    };
    addFile("manifest.json", strToU8(JSON.stringify(manifest, null, 2)));

    addFile(
      "RESTORE_README.txt",
      strToU8(
        [
          "Aireatro full backup",
          "====================",
          `Generated: ${manifest.generated_at}`,
          `Tables exported: ${okTables} / ${tables.length}`,
          `Tables skipped for Edge safety: ${skippedTables.length}`,
          `Storage files: ${storageDownloaded.length} downloaded, ${storageSkipped.length} skipped (mode: ${includeStorageBytes ? "bytes_included" : "inventory_only"})`,
          "",
          "Important:",
          "  This ZIP is an edge-safe admin snapshot, not the full disaster-recovery backup.",
          "  Large messages/events/logs/jobs tables are skipped to avoid Edge Function CPU limits.",
          "  Use Lovable Cloud PITR or the GitHub Actions pg_dump workflow for full database restore.",
          "",
          "Restore order:",
          "  1. Create a new Supabase project.",
          "  2. Run `aireatro_full_schema.sql` in SQL Editor (from GitHub repo).",
          "  3. Recreate buckets listed in manifest.json -> buckets.",
          "  4. Re-upload files from storage/files/<bucket>/... (or re-download from the live source bucket using storage/file_list.json if mode=inventory_only).",
          "  5. Import tables/json/*.jsonl in FK-safe order (each line = one row; see DATABASE_RESTORE_GUIDE.md).",
          "  6. Recreate secrets listed in config/env.secrets.list.txt.",
          "  7. Deploy edge functions from GitHub repo (`supabase functions deploy`).",
          "  8. Update VITE_SUPABASE_URL/KEY in frontend deploy env.",
          "",
          "Frontend code, migrations and edge functions are NOT included here —",
          "they live in the GitHub repository connected to this project.",
        ].join("\n"),
      ),
    );

    // Finalize ZIP
    await writeProgress({ progress_percent: 88, current_step: "Finalizing ZIP archive…" }, true);
    zip.end();
    await Promise.all(pendingWrites);
    await writer.close();

    const stat = await Deno.stat(tmpPath);
    const fileSize = stat.size;

    // Stream temp file directly to Supabase Storage (no in-memory buffer).
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `aireatro-backup-${ts}.zip`;
    const path = `${ts}/${fileName}`;

    await writeProgress({ progress_percent: 92, current_step: "Uploading backup to cloud storage…" }, true);
    await uploadFileToStorageStreamed(tmpPath, fileSize, path);

    const ms = Date.now() - startedAt;
    await sb
      .from("platform_backup_runs")
      .update({
        status: "success",
        storage_path: path,
        file_size_bytes: fileSize,
        table_count: okTables,
        duration_ms: ms,
        completed_at: new Date().toISOString(),
        progress_percent: 96,
        current_step: "Uploading to Google Drive…",
        error_message: Object.keys(tableErrors).length
          ? `partial: ${Object.keys(tableErrors).length} table(s) failed`
          : null,
      })
      .eq("id", runId);

    // Stream temp file to Google Drive (best-effort)
    const driveResult = await uploadToDriveStreamed(tmpPath, fileSize, fileName).catch((e: any) => ({
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
        progress_percent: 100,
        current_step: driveResult.ok ? "Completed" : "Completed (Drive upload failed)",
      })
      .eq("id", runId);

    await sb.rpc("cleanup_old_backups").catch(() => {});
    if (driveResult.ok) {
      await cleanupDriveOldBackups((driveResult as any).folderId).catch((e: any) =>
        console.warn("[backup] drive cleanup failed:", e?.message),
      );
    }

    try { await Deno.remove(tmpPath); } catch { /* ignore */ }

    return {
      ok: true,
      run_id: runId,
      path,
      size: fileSize,
      table_count: okTables,
      table_errors: tableErrors,
      duration_ms: ms,
      drive: driveResult,
    };
  } catch (e: any) {
    try { await writer.close(); } catch { /* ignore */ }
    try { await Deno.remove(tmpPath); } catch { /* ignore */ }
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

async function failStaleBackupRuns(sb: any) {
  const now = new Date().toISOString();
  await sb
    .from("platform_backup_runs")
    .update({
      status: "failed",
      error_message: "Auto-failed: backup worker did not report progress within 2 minutes",
      completed_at: now,
    })
    .eq("status", "pending")
    .lte("progress_percent", 0)
    .lt("created_at", new Date(Date.now() - STUCK_ZERO_PROGRESS_MS).toISOString());

  await sb
    .from("platform_backup_runs")
    .update({
      status: "failed",
      error_message: "Auto-failed: backup worker did not finish within 10 minutes",
      completed_at: now,
    })
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - STALE_PENDING_MS).toISOString());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-backup\/?/, "");
    const sb = admin();

    if (req.method === "POST" && path === "run") {
      const { userId, cron } = await requireSuperAdminOrCron(req);

      await failStaleBackupRuns(sb);

      // Pre-create a pending run row, fully initialized so the UI shows progress
      // immediately even before the background worker writes its first update.
      const { data: tables } = await sb.rpc("backup_list_public_tables");
      const allTableList = (tables || []).map((r: any) => r.table_name).filter((t: string) => !TABLE_EXCLUDE.has(t));
      const { exportTables: tableList } = planEdgeSafeTables(allTableList);

      const { data: activeRun } = await sb
        .from("platform_backup_runs")
        .select("id,status,progress_percent,current_step,tables_done,tables_total,started_at,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (activeRun) {
        const normalizedRun = {
          ...activeRun,
          progress_percent: Math.max(1, Number(activeRun.progress_percent || 0)),
          current_step: activeRun.current_step || "Queued — waiting for backup worker…",
          started_at: activeRun.started_at || activeRun.created_at,
          tables_total: Number(activeRun.tables_total || 0) || tableList.length,
        };
        return new Response(
          JSON.stringify({ ok: true, run_id: activeRun.id, status: "pending", message: "Backup already running. Tracking existing progress.", run: normalizedRun }),
          { status: 202, headers: { ...corsHeaders, "content-type": "application/json" } },
        );
      }
      const { data: run } = await sb
        .from("platform_backup_runs")
        .insert({
          status: "pending",
          trigger: cron ? "scheduled" : "manual",
          triggered_by: userId,
          tables_included: tableList,
          tables_total: tableList.length,
          tables_done: 0,
          progress_percent: 1,
          current_step: `Queued — starting edge-safe snapshot (${tableList.length}/${allTableList.length} tables)…`,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      const runId = run!.id as string;

      // Capture URL string (req object becomes invalid after response returns).
      const reqUrl = req.url;
      // Offload the heavy work — avoids CPU/wall-time limits on the request.
      // @ts-ignore EdgeRuntime is provided by the Supabase edge runtime
      EdgeRuntime.waitUntil(
        runBackup(reqUrl, cron ? "scheduled" : "manual", userId, runId).catch(async (e: any) => {
          console.error("[backup] background run failed:", e?.message || e);
          await sb
            .from("platform_backup_runs")
            .update({
              status: "failed",
              error_message: String(e?.message || e),
              completed_at: new Date().toISOString(),
            })
            .eq("id", runId);
        }),
      );

      return new Response(
        JSON.stringify({ ok: true, run_id: runId, status: "pending", message: "Backup started in background. Tracking progress live." }),
        { status: 202, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    if (req.method === "GET" && path === "list") {
      await requireSuperAdminOrCron(req);

      await failStaleBackupRuns(sb);

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
