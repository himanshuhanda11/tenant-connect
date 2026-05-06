import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Users, Send, AlertTriangle, Clock, RefreshCw, Eye, ScrollText, Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  workspaceId: string;
  onSyncComplete?: () => void;
}

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  campaign_name: string | null;
  form_name: string | null;
  message_status: string;
  crm_contact_id: string | null;
  synced_at: string;
}

interface LogRow {
  id: string;
  status: string;
  message: string | null;
  leads_fetched: number;
  leads_created: number;
  messages_sent: number;
  created_at: string;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  lastSync: string | null;
}

export function TikTokSyncDashboard({ workspaceId, onSyncComplete }: Props) {
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, failed: 0, lastSync: null });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: l }, totalRes, sentRes, failedRes, settingRes] = await Promise.all([
      supabase
        .from('tiktok_leads')
        .select('id,name,phone,campaign_name,form_name,message_status,crm_contact_id,synced_at')
        .eq('workspace_id', workspaceId)
        .order('synced_at', { ascending: false })
        .limit(20),
      supabase.from('tiktok_leads').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
      supabase.from('tiktok_leads').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('message_status', 'sent'),
      supabase.from('tiktok_leads').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).ilike('message_status', 'failed%'),
      supabase
        .from('tiktok_lead_sync_settings' as any)
        .select('last_sync_at')
        .eq('workspace_id', workspaceId)
        .order('last_sync_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setLeads((l as any) || []);
    setStats({
      total: totalRes.count || 0,
      sent: sentRes.count || 0,
      failed: failedRes.count || 0,
      lastSync: (settingRes.data as any)?.last_sync_at ?? null,
    });
    setLoading(false);
  }, [workspaceId]);

  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from('tiktok_sync_logs' as any)
      .select('id,status,message,leads_fetched,leads_created,messages_sent,created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs((data as any) || []);
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-tiktok-leads', {
        body: { workspace_id: workspaceId },
      });
      if (error) throw error;
      toast({ title: 'Sync complete', description: 'Latest TikTok leads have been pulled in.' });
      await load();
      onSyncComplete?.();
    } catch (e: any) {
      toast({ title: 'Sync failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'sent') return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border">Sent</Badge>;
    if (s.startsWith('failed')) return <Badge className="bg-red-500/15 text-red-600 border-red-500/30 border">Failed</Badge>;
    if (s === 'no_phone') return <Badge variant="outline">No phone</Badge>;
    if (s === 'skipped') return <Badge variant="outline">Skipped</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  const KPI = ({ icon: Icon, label, value, accent }: any) => (
    <Card className="rounded-2xl border-border/60 hover:border-primary/40 transition-colors">
      <CardContent className="p-4 sm:p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="text-xl sm:text-2xl font-bold mt-0.5 truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-2xl" />)
        ) : (
          <>
            <KPI icon={Users} label="Leads Synced" value={stats.total} accent="bg-fuchsia-500/15 text-fuchsia-600" />
            <KPI icon={Send} label="Messages Sent" value={stats.sent} accent="bg-emerald-500/15 text-emerald-600" />
            <KPI icon={AlertTriangle} label="Failed" value={stats.failed} accent="bg-red-500/15 text-red-600" />
            <KPI
              icon={Clock}
              label="Last Sync"
              value={stats.lastSync ? formatDistanceToNow(new Date(stats.lastSync), { addSuffix: true }) : '—'}
              accent="bg-cyan-500/15 text-cyan-600"
            />
          </>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSyncNow} disabled={syncing} className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white hover:opacity-95">
          {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Sync Now
        </Button>

        <Sheet onOpenChange={(o) => o && loadLogs()}>
          <SheetTrigger asChild>
            <Button variant="outline"><ScrollText className="h-4 w-4 mr-2" /> View Logs</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader><SheetTitle>TikTok Sync Logs</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-2">
              {logs.length === 0 && <p className="text-sm text-muted-foreground">No sync runs yet.</p>}
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border border-border bg-muted/30 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>{log.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-foreground">{log.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Fetched {log.leads_fetched} · Created {log.leads_created} · Sent {log.messages_sent}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> View Leads</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
            <SheetHeader><SheetTitle>All TikTok Leads</SheetTitle></SheetHeader>
            <div className="mt-4">
              <RecentLeadsTable leads={leads} statusBadge={statusBadge} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Recent leads table */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent TikTok Leads</CardTitle>
          <CardDescription>Most recent leads pulled from TikTok lead forms.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No leads yet. New TikTok leads will appear here within 2 minutes of submission.
            </div>
          ) : (
            <RecentLeadsTable leads={leads} statusBadge={statusBadge} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentLeadsTable({
  leads,
  statusBadge,
}: {
  leads: Lead[];
  statusBadge: (s: string) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="hidden md:table-cell">Campaign</TableHead>
            <TableHead className="hidden md:table-cell">Form</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>CRM</TableHead>
            <TableHead className="hidden sm:table-cell">Synced</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.name || '—'}</TableCell>
              <TableCell className="font-mono text-xs">{l.phone || '—'}</TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{l.campaign_name || '—'}</TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{l.form_name || '—'}</TableCell>
              <TableCell>{statusBadge(l.message_status)}</TableCell>
              <TableCell>
                {l.crm_contact_id
                  ? <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border">In CRM</Badge>
                  : <Badge variant="outline">—</Badge>}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(l.synced_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
