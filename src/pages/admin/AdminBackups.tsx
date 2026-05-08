import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Database, Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock,
  HardDrive, FileArchive, BookOpen, Calendar, Cloud, ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-backup`;

async function call(path: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`${FN_URL}/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(init.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

interface BackupRun {
  id: string;
  status: 'pending' | 'success' | 'failed';
  trigger: 'manual' | 'scheduled';
  storage_path: string | null;
  file_size_bytes: number | null;
  table_count: number | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
  downloaded_by: any[];
  drive_status: 'uploaded' | 'failed' | null;
  drive_file_id: string | null;
  drive_web_link: string | null;
  drive_error: string | null;
}

function fmtBytes(n: number | null | undefined) {
  if (!n) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}

export default function AdminBackups() {
  const { toast } = useToast();
  const [runs, setRuns] = useState<BackupRun[]>([]);
  const [latest, setLatest] = useState<BackupRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await call('list');
      setRuns(data.runs || []);
      setLatest(data.latest || null);
    } catch (e: any) {
      toast({ title: 'Failed to load backups', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const runBackup = async () => {
    setRunning(true);
    toast({ title: 'Backup started', description: 'This typically takes 30–90 seconds…' });
    try {
      const r = await call('run', { method: 'POST', body: '{}' });
      toast({
        title: 'Backup complete',
        description: `${r.table_count} tables · ${fmtBytes(r.size)} · ${(r.duration_ms / 1000).toFixed(1)}s`,
      });
      await refresh();
    } catch (e: any) {
      toast({ title: 'Backup failed', description: e.message, variant: 'destructive' });
      await refresh();
    } finally {
      setRunning(false);
    }
  };

  const downloadBackup = async (id: string) => {
    setDownloadingId(id);
    try {
      const r = await call(`download/${id}`);
      window.open(r.url, '_blank');
    } catch (e: any) {
      toast({ title: 'Download failed', description: e.message, variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  const successCount = runs.filter(r => r.status === 'success').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Database Backups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Export everything to a portable ZIP. Last 30 backups are kept automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://github.com/' /* fallback */, '_blank')}
            asChild
          >
            <a
              href="/DATABASE_RESTORE_GUIDE.md"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Restore guide
            </a>
          </Button>
          <Button onClick={runBackup} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
            {running ? 'Backing up…' : 'Run backup now'}
          </Button>
        </div>
      </div>

      {/* Health cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last backup</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold mt-2">
              {latest ? formatDistanceToNow(new Date(latest.created_at), { addSuffix: true }) : 'Never'}
            </p>
            {latest && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(latest.created_at), 'PPp')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              {latest?.status === 'success'
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : latest?.status === 'failed'
                  ? <XCircle className="h-4 w-4 text-destructive" />
                  : <Clock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-lg font-semibold mt-2 capitalize">
              {latest?.status || '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {latest?.trigger === 'scheduled' ? 'Auto-scheduled' : 'Manual'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Size</p>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold mt-2">{fmtBytes(latest?.file_size_bytes)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {latest?.table_count ?? 0} tables included
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">History</p>
              <FileArchive className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold mt-2">{successCount} / 30</p>
            <p className="text-xs text-muted-foreground mt-0.5">Successful backups stored</p>
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup history</CardTitle>
          <CardDescription>Most recent 50 runs. Older successful backups are auto-pruned beyond 30.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-12">
              <FileArchive className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No backups yet. Click "Run backup now" to create your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left py-2 px-2 font-medium">When</th>
                    <th className="text-left py-2 px-2 font-medium">Status</th>
                    <th className="text-left py-2 px-2 font-medium">Trigger</th>
                    <th className="text-left py-2 px-2 font-medium">Tables</th>
                    <th className="text-left py-2 px-2 font-medium">Size</th>
                    <th className="text-left py-2 px-2 font-medium">Duration</th>
                    <th className="text-left py-2 px-2 font-medium">Downloads</th>
                    <th className="text-right py-2 px-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2">
                        <div className="font-medium">{format(new Date(r.created_at), 'MMM d, HH:mm')}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        {r.status === 'success' && <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-400">Success</Badge>}
                        {r.status === 'failed' && <Badge variant="destructive">Failed</Badge>}
                        {r.status === 'pending' && <Badge variant="outline">Running…</Badge>}
                        {r.error_message && <div className="text-xs text-destructive mt-1 max-w-xs truncate" title={r.error_message}>{r.error_message}</div>}
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-xs">
                          {r.trigger === 'scheduled' ? <Calendar className="h-3 w-3 mr-1" /> : null}
                          {r.trigger}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">{r.table_count ?? '—'}</td>
                      <td className="py-2 px-2">{fmtBytes(r.file_size_bytes)}</td>
                      <td className="py-2 px-2">
                        {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : '—'}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {Array.isArray(r.downloaded_by) ? r.downloaded_by.length : 0}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {r.status === 'success' && r.storage_path ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackup(r.id)}
                            disabled={downloadingId === r.id}
                          >
                            {downloadingId === r.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help footer */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-5 text-sm space-y-2">
          <p className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> What's inside each ZIP?
          </p>
          <ul className="text-muted-foreground text-xs space-y-1 ml-6 list-disc">
            <li><code>tables/csv/</code> — every important table as CSV (Excel-friendly).</li>
            <li><code>tables/json/</code> — same data as JSON.</li>
            <li><code>storage/file_list.json</code> — inventory of all media files in storage buckets.</li>
            <li><code>manifest.json</code> + <code>RESTORE_README.txt</code> — what's included and quick restore steps.</li>
          </ul>
          <p className="text-xs text-muted-foreground pt-2">
            Schema SQL lives in your repo at <code>supabase/migrations/</code> and the combined
            <code> aireatro_full_schema.sql</code>. Use the restore guide to rebuild a fresh Supabase project from a ZIP.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
