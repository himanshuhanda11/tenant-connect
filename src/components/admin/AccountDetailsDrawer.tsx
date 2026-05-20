import React, { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Loader2, UserCircle2, Mail, Phone, Globe2, Building2, CreditCard,
  CheckCircle2, ShieldAlert, Activity, StickyNote, Users, Send, Search,
  XCircle, Clock, Shield, LogOut, KeyRound, Trash2, PauseCircle, PlayCircle,
  PowerOff, Plug, RefreshCw, ArrowRightLeft, RotateCcw, Filter, MessageSquare,
  Wifi, AlertTriangle,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { adminCachePeek } from '@/hooks/useAdminQuery';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlanChangeModal } from './PlanChangeModal';
import { ProfileEditModal } from './ProfileEditModal';

interface Props { userId: string | null; onClose: () => void; }

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtShort = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

type DangerAction = {
  key: string; title: string; description: string; confirmLabel: string; destructive?: boolean;
  run: () => Promise<any>; successMsg: string;
} | null;

export function AccountDetailsDrawer({ userId, onClose }: Props) {
  const { get, post } = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<DangerAction>(null);
  const [activityFilter, setActivityFilter] = useState('');
  const [activityType, setActivityType] = useState<string>('all');
  const [planModalWs, setPlanModalWs] = useState<{ id: string; name: string } | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const load = async (silent = false) => {
    if (!userId) return;
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const fresh = await get(`users/${userId}/details`);
      setData(fresh);
      // Cache for instant re-open
      try { (window as any).__adminUserCache ||= new Map(); (window as any).__adminUserCache.set(userId, fresh); } catch {}
    } catch (e: any) {
      toast({ title: 'Failed to load', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    if (!userId) { setData(null); return; }
    // Show cached data instantly while we refresh in background
    const cached = (window as any).__adminUserCache?.get(userId);
    if (cached) { setData(cached); setLoading(false); load(true); }
    else { load(false); }
  }, [userId]);

  const runAction = async (key: string, fn: () => Promise<any>, successMsg: string) => {
    setPending(key);
    try {
      await fn();
      toast({ title: successMsg });
      await load(true);
    } catch (e: any) {
      toast({ title: 'Action failed', description: e.message, variant: 'destructive' });
    } finally { setPending(null); }
  };

  const addNote = async () => {
    if (!newNote.trim() || !userId) return;
    setSavingNote(true);
    try {
      await post(`users/${userId}/notes`, { note: newNote.trim() });
      setNewNote('');
      await load(true);
      toast({ title: 'Note added' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setSavingNote(false); }
  };

  const u = data?.user;
  const p = data?.profile;
  const initials = (p?.full_name || u?.email || '?')
    .split(/\s+|@/).filter(Boolean).slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase()).join('');

  // ─────────── Onboarding tracker (8 steps) ───────────
  const workspaces = data?.workspaces || [];
  const phones = data?.phones || [];
  const wabas = data?.wabas || [];
  const teamMembers = data?.team_members || [];
  const activeWaba = wabas.find((w: any) => w.status === 'active' || w.status === 'verified');
  const verifiedPhone = phones.find((ph: any) => ph.status === 'connected' || ph.status === 'verified');
  const activeWs = workspaces.find((w: any) =>
    w.subscription_status === 'active' && (w.plan || '').toLowerCase() !== 'free' && (w.plan || '').toLowerCase() !== 'trial');

  const tracker = [
    { label: 'Account created', status: u?.created_at ? 'done' : 'pending', at: u?.created_at },
    { label: 'Email verified', status: u?.email_confirmed_at ? 'done' : (u?.created_at ? 'pending' : 'pending'), at: u?.email_confirmed_at },
    { label: 'Workspace created', status: workspaces.length > 0 ? 'done' : 'pending', at: workspaces[0]?.created_at },
    { label: 'Team invited', status: teamMembers.length > 0 ? 'done' : 'pending', at: teamMembers[0]?.created_at },
    { label: 'WhatsApp connected', status: verifiedPhone ? 'done' : (wabas.length > 0 ? 'pending' : 'pending'), at: verifiedPhone?.created_at },
    { label: 'WABA verified', status: activeWaba ? 'done' : (wabas.length > 0 ? 'pending' : 'pending'), at: activeWaba?.updated_at, reason: !activeWaba && wabas[0] ? `Status: ${wabas[0].status}` : null },
    { label: 'Plan activated', status: activeWs ? 'done' : (workspaces.length > 0 ? 'pending' : 'pending'), at: activeWs?.created_at },
    { label: 'Campaign started', status: (data?.campaigns_count || 0) > 0 ? 'done' : 'pending' },
  ];
  const doneCount = tracker.filter((s) => s.status === 'done').length;
  const pct = (doneCount / tracker.length) * 100;

  // ─────────── Activity merging + filters ───────────
  const allActivity = useMemo(() => {
    const merged = [
      ...(data?.activity || []).map((a: any) => ({ ...a, _kind: 'admin' })),
      ...(data?.onboarding_events || []).map((e: any) => ({
        action: e.event_type, created_at: e.created_at,
        note: e.metadata ? JSON.stringify(e.metadata).slice(0, 100) : null, _kind: 'system',
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged;
  }, [data]);

  const filteredActivity = useMemo(() => {
    return allActivity.filter((a: any) => {
      if (activityType !== 'all' && a._kind !== activityType) return false;
      if (activityFilter && !`${a.action} ${a.note || ''}`.toLowerCase().includes(activityFilter.toLowerCase())) return false;
      return true;
    });
  }, [allActivity, activityFilter, activityType]);

  const isSuspended = u?.banned_until && new Date(u.banned_until) > new Date();

  // ─────────── Quick admin action helpers ───────────
  const askConfirm = (a: NonNullable<DangerAction>) => setConfirm(a);

  if (!userId) return null;

  return (
    <Sheet open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 overflow-y-auto">
        {loading || !data ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ──────── Header / Section 1 summary ──────── */}
            <SheetHeader className="p-6 pb-4 bg-gradient-to-br from-primary/5 via-background to-background border-b sticky top-0 z-10 backdrop-blur">
              <SheetTitle className="sr-only">Account details</SheetTitle>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0 border border-primary/20">
                  {initials || <UserCircle2 className="h-7 w-7" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold tracking-tight truncate">
                      {p?.full_name || p?.company_name || u?.email || 'Unknown'}
                    </h2>
                    {isSuspended ? (
                      <Badge variant="destructive" className="rounded-full text-[10px]">Suspended</Badge>
                    ) : u?.email_confirmed_at ? (
                      <Badge className="rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700">
                        <ShieldAlert className="h-3 w-3 mr-0.5" /> Unconfirmed
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{u?.provider}</Badge>
                    {refreshing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                    <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {u?.email || '—'}</div>
                    {u?.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {u.phone}</div>}
                    {p?.country && <div className="flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> {p.country}</div>}
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last login {fmtShort(u?.last_sign_in_at)}</div>
                  </div>
                </div>
              </div>

              {/* Onboarding tracker */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium">Onboarding progress</span>
                  <span className="text-muted-foreground tabular-nums">{doneCount}/{tracker.length} · {pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5">
                  {tracker.map((s, i) => (
                    <div
                      key={s.label}
                      title={s.reason || (s.at ? fmt(s.at) : s.status)}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] border',
                        s.status === 'done' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
                        s.status === 'pending' && 'border-border bg-muted/40 text-muted-foreground',
                        s.status === 'failed' && 'border-red-500/30 bg-red-500/10 text-red-700',
                      )}
                    >
                      {s.status === 'done' ? <CheckCircle2 className="h-3 w-3" />
                        : s.status === 'failed' ? <XCircle className="h-3 w-3" />
                          : <Clock className="h-3 w-3" />}
                      <span className="truncate"><span className="opacity-60 mr-1">{i + 1}.</span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="px-6 pt-4">
              <TabsList className="rounded-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* ──────── Overview ──────── */}
              <TabsContent value="overview" className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Stat label="Created" value={fmt(u?.created_at)} />
                  <Stat label="Last login" value={fmt(u?.last_sign_in_at)} />
                  <Stat label="Email confirmed" value={fmt(u?.email_confirmed_at)} />
                  <Stat label="Timezone" value={p?.timezone || '—'} />
                  <Stat label="Industry" value={p?.industry || '—'} />
                  <Stat label="Team size" value={p?.team_size || '—'} />
                  <Stat label="Workspaces" value={String(workspaces.length)} />
                  <Stat label="WABA-connected" value={`${workspaces.filter((w:any) => phones.some((p:any)=>p.tenant_id===w.workspace_id && (p.status==='connected'||p.status==='verified'))).length} / ${workspaces.length}`} />
                  <Stat label="Paid workspaces" value={String(workspaces.filter((w:any) => {
                    const plan = (w.plan || '').toLowerCase();
                    const ss = (w.subscription_status || '').toLowerCase();
                    return plan && plan !== 'free' && plan !== 'trial' && !['expired','past_due','cancelled','canceled'].includes(ss);
                  }).length)} />
                  <Stat label="Free workspaces" value={String(workspaces.filter((w:any) => {
                    const plan = (w.plan || 'free').toLowerCase();
                    return plan === 'free' || plan === 'trial' || plan === '';
                  }).length)} />
                  <Stat label="Team members (sub)" value={String(teamMembers.length)} />
                  <Stat label="Campaigns" value={String(data?.campaigns_count || 0)} />
                </div>
              </TabsContent>

              {/* ──────── Workspaces / WABA / Team ──────── */}
              <TabsContent value="workspaces" className="space-y-3 pb-6">
                {workspaces.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center mt-3">No workspaces yet</div>
                ) : (
                  <Accordion type="multiple" className="space-y-2 mt-3">
                    {workspaces.map((w: any) => {
                      const wsPhones = phones.filter((ph: any) => ph.tenant_id === w.workspace_id);
                      const wsWabas = wabas.filter((wb: any) => wb.tenant_id === w.workspace_id);
                      const wsMembers = teamMembers.filter((m: any) => m.tenant_id === w.workspace_id);
                      return (
                        <AccordionItem key={w.workspace_id} value={w.workspace_id}
                          className="border rounded-xl bg-card overflow-hidden">
                          <AccordionTrigger className="px-3 py-2 hover:no-underline">
                            <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                              <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium text-sm truncate">{w.workspace_name}</span>
                                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{w.role}</Badge>
                                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                                    <CreditCard className="h-3 w-3 mr-1" />{w.plan_name || w.plan}
                                  </Badge>
                                  {w.is_suspended && <Badge variant="destructive" className="rounded-full text-[10px]">Suspended</Badge>}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                  {w.members_count} members · {w.contacts_count} contacts · {w.conversations_count} convos · {fmtShort(w.created_at)}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3 space-y-3">
                            <div className="text-[10px] text-muted-foreground font-mono break-all bg-muted/40 p-2 rounded">
                              ID: {w.workspace_id}
                            </div>

                            {/* WhatsApp / WABA section */}
                            <div className="space-y-2">
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                                <Phone className="h-3 w-3" /> Connected WhatsApp ({wsPhones.length})
                              </div>
                              {wsPhones.length === 0 && wsWabas.length === 0 ? (
                                <div className="text-xs text-muted-foreground italic p-2">No WhatsApp connected</div>
                              ) : wsPhones.map((ph: any) => {
                                const wb = wsWabas.find((x: any) => x.id === ph.waba_account_id);
                                const verified = ph.status === 'connected' || ph.status === 'verified';
                                const webhookOk = ph.webhook_health === 'healthy' || ph.webhook_health === 'ok';
                                const webhookFail = ph.webhook_health === 'failed' || ph.webhook_health === 'error';
                                return (
                                  <div key={ph.id} className="p-2.5 rounded-lg border bg-background space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm">{ph.display_number}</span>
                                      <Indicator
                                        ok={verified} warn={ph.status === 'pending'}
                                        labelOk="Connected" labelWarn="Pending" labelFail="Disconnected"
                                      />
                                      <Indicator
                                        ok={ph.quality_rating === 'GREEN'} warn={ph.quality_rating === 'YELLOW'}
                                        labelOk="Quality GREEN" labelWarn="Quality YELLOW" labelFail="Quality RED"
                                      />
                                      <Indicator
                                        ok={webhookOk} warn={!webhookOk && !webhookFail}
                                        labelOk="Webhook OK" labelWarn="Webhook unknown" labelFail="Webhook failed"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                      <div>Phone ID: <span className="font-mono">{ph.phone_number_id}</span></div>
                                      <div>WABA: <span className="font-mono">{wb?.waba_id || '—'}</span></div>
                                      <div>Business: {wb?.name || '—'}</div>
                                      <div>Limit: {ph.messaging_limit || '—'}</div>
                                      <div>Connected: {fmtShort(ph.created_at)}</div>
                                      <div>Last sync: {fmtShort(ph.last_webhook_at)}</div>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="pt-1">
                                <Button size="sm" variant="outline" className="rounded-lg text-[11px] h-7"
                                  disabled={pending === `disc-${w.workspace_id}` || wsPhones.length === 0}
                                  onClick={() => askConfirm({
                                    key: `disc-${w.workspace_id}`,
                                    title: 'Disconnect WhatsApp?',
                                    description: `This will disconnect all phone numbers from "${w.workspace_name}". This cannot be undone via UI.`,
                                    confirmLabel: 'Disconnect',
                                    destructive: true,
                                    run: () => post(`workspaces/${w.workspace_id}/disconnect-whatsapp`, {}),
                                    successMsg: 'WhatsApp disconnected',
                                  })}>
                                  <PowerOff className="h-3 w-3 mr-1" /> Disconnect WhatsApp
                                </Button>
                              </div>
                            </div>

                            {/* Team members */}
                            <div className="space-y-1.5">
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                                <Users className="h-3 w-3" /> Team members ({wsMembers.length})
                              </div>
                              {wsMembers.length === 0 ? (
                                <div className="text-xs text-muted-foreground italic p-2">No teammates</div>
                              ) : wsMembers.map((m: any) => (
                                <div key={m.user_id + m.tenant_id} className="flex items-center gap-2 p-2 rounded-lg border bg-background text-xs">
                                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                                    {(m.full_name || m.email || '?')[0]?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium">{m.full_name || m.email}</div>
                                    <div className="truncate text-[10px] text-muted-foreground">{m.email}</div>
                                  </div>
                                  <Badge variant="outline" className="rounded-full text-[9px] capitalize">{m.role}</Badge>
                                  <div className="flex gap-1">
                                    {m.role !== 'owner' && (
                                      <>
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]"
                                          disabled={pending === `role-${m.user_id}`}
                                          onClick={() => runAction(`role-${m.user_id}`,
                                            () => post(`workspaces/${w.workspace_id}/members/${m.user_id}/change-role`,
                                              { role: m.role === 'admin' ? 'agent' : 'admin' }),
                                            'Role updated')}>
                                          <Shield className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700"
                                          disabled={pending === `rm-${m.user_id}`}
                                          onClick={() => askConfirm({
                                            key: `rm-${m.user_id}`,
                                            title: `Remove ${m.full_name || m.email}?`,
                                            description: 'They will lose access to this workspace immediately.',
                                            confirmLabel: 'Remove',
                                            destructive: true,
                                            run: () => post(`workspaces/${w.workspace_id}/members/${m.user_id}/remove`, {}),
                                            successMsg: 'Member removed',
                                          })}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Workspace-level admin actions */}
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t pt-3">
                              <Button size="sm" variant="outline" className="rounded-lg text-[11px] h-7"
                                disabled={pending === `reset-${w.workspace_id}`}
                                onClick={() => askConfirm({
                                  key: `reset-${w.workspace_id}`,
                                  title: 'Reset workspace settings?',
                                  description: 'Plan entitlements will be reset to free defaults. Member data is preserved.',
                                  confirmLabel: 'Reset',
                                  destructive: true,
                                  run: () => post(`workspaces/${w.workspace_id}/reset-settings`, {}),
                                  successMsg: 'Workspace reset',
                                })}>
                                <RotateCcw className="h-3 w-3 mr-1" /> Reset workspace
                              </Button>
                              {wsMembers.length > 0 && (
                                <Button size="sm" variant="outline" className="rounded-lg text-[11px] h-7"
                                  disabled={pending === `transfer-${w.workspace_id}`}
                                  onClick={() => {
                                    const choices = wsMembers.map((m: any, i: number) => `${i + 1}. ${m.full_name || m.email}`).join('\n');
                                    const idx = parseInt(prompt(`Transfer ownership to:\n${choices}\n\nEnter number:`) || '0', 10);
                                    const target = wsMembers[idx - 1];
                                    if (!target) return;
                                    askConfirm({
                                      key: `transfer-${w.workspace_id}`,
                                      title: `Transfer to ${target.full_name || target.email}?`,
                                      description: 'This user will become workspace owner. The current owner becomes admin.',
                                      confirmLabel: 'Transfer',
                                      destructive: true,
                                      run: () => post(`workspaces/${w.workspace_id}/transfer-ownership`, { new_owner_user_id: target.user_id }),
                                      successMsg: 'Ownership transferred',
                                    });
                                  }}>
                                  <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer ownership
                                </Button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </TabsContent>

              {/* ──────── Quick Admin Actions ──────── */}
              <TabsContent value="actions" className="space-y-4 pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-3">Account actions</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <ActionBtn icon={KeyRound} label="Reset password" loading={pending === 'reset-pw'}
                    onClick={() => runAction('reset-pw',
                      () => post(`users/${userId}/reset-password`, {}),
                      'Password reset email sent')} />
                  <ActionBtn icon={Mail} label="Resend verification" loading={pending === 'resend'}
                    onClick={() => runAction('resend',
                      () => post(`users/${userId}/resend-verification`, {}),
                      'Verification resent')} />
                  <ActionBtn icon={LogOut} label="Force logout" loading={pending === 'logout'}
                    onClick={() => askConfirm({
                      key: 'logout',
                      title: 'Force logout?',
                      description: 'All active sessions will be invalidated.',
                      confirmLabel: 'Force logout',
                      run: () => post(`users/${userId}/force-logout`, {}),
                      successMsg: 'All sessions terminated',
                    })} />
                  {isSuspended ? (
                    <ActionBtn icon={PlayCircle} label="Activate account" loading={pending === 'activate'}
                      tone="emerald"
                      onClick={() => runAction('activate',
                        () => post(`users/${userId}/activate`, {}),
                        'Account activated')} />
                  ) : (
                    <ActionBtn icon={PauseCircle} label="Suspend account" loading={pending === 'suspend'}
                      tone="amber"
                      onClick={() => askConfirm({
                        key: 'suspend',
                        title: 'Suspend account?',
                        description: 'User will be unable to log in until reactivated.',
                        confirmLabel: 'Suspend',
                        destructive: true,
                        run: () => post(`users/${userId}/suspend`, { reason: 'Suspended by super admin' }),
                        successMsg: 'Account suspended',
                      })} />
                  )}
                  <ActionBtn icon={Trash2} label="Delete account" loading={pending === 'delete'}
                    tone="red"
                    onClick={() => askConfirm({
                      key: 'delete',
                      title: 'Delete account permanently?',
                      description: 'This deletes the auth user, profile, and any owned workspaces. This cannot be undone.',
                      confirmLabel: 'Delete forever',
                      destructive: true,
                      run: async () => {
                        try {
                          return await post(`users/${userId}/delete`, {});
                        } catch (e: any) {
                          const b = e?.body;
                          if (e?.status === 409 && b?.blocked) {
                            const wsList = (b.workspaces || []).map((w: any) => `• ${w.name || w.id}`).join('\n');
                            const phList = (b.phone_numbers || []).map((p: any) => `• ${p.number}`).join('\n');
                            const detail = [
                              b.message,
                              wsList && `\nWorkspaces:\n${wsList}`,
                              phList && `\nWhatsApp numbers:\n${phList}`,
                              '\n\nForce-delete EVERYTHING (workspaces, numbers, contacts, messages) for this account? This cannot be undone.',
                            ].filter(Boolean).join('');
                            if (!window.confirm(detail)) throw new Error('Cancelled');
                            return await post(`users/${userId}/delete`, { force: true, reason: 'Force-deleted by super admin' });
                          }
                          throw e;
                        }
                      },
                      successMsg: 'Account deleted',
                    })} />
                  <ActionBtn icon={UserCircle2} label="Edit profile"
                    onClick={() => setEditProfileOpen(true)} />
                  {workspaces[0] && (
                    <ActionBtn icon={CreditCard} label="Change plan" tone="emerald"
                      onClick={() => setPlanModalWs({ id: workspaces[0].workspace_id, name: workspaces[0].workspace_name })} />
                  )}
                </div>

                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold pt-2">Quick note</div>
                <div className="flex gap-2">
                  <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal admin note…"
                    className="rounded-xl text-sm min-h-[60px]" />
                  <Button onClick={addNote} disabled={!newNote.trim() || savingNote} className="rounded-xl self-end">
                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              {/* ──────── Activity / Audit Logs ──────── */}
              <TabsContent value="activity" className="space-y-3 pb-6">
                <div className="flex items-center gap-2 mt-3">
                  <div className="relative flex-1">
                    <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}
                      placeholder="Filter activity…" className="rounded-lg h-8 pl-7 text-xs" />
                  </div>
                  <div className="flex gap-1 text-[11px]">
                    {['all', 'admin', 'system'].map((t) => (
                      <button key={t}
                        className={cn('px-2 py-1 rounded-lg border capitalize',
                          activityType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted')}
                        onClick={() => setActivityType(t)}>
                        {t === 'all' ? <><Filter className="h-3 w-3 inline mr-1" />All</> : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {filteredActivity.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center">No activity</div>
                  ) : filteredActivity.slice(0, 80).map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border bg-card text-xs">
                      <div className={cn(
                        'h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0',
                        a._kind === 'admin' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-600'
                      )}>
                        {a._kind === 'admin' ? <Shield className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{(a.action || '').replace(/_/g, ' ').toLowerCase()}</div>
                        {a.note && <div className="text-[10px] text-muted-foreground truncate">{a.note}</div>}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{fmt(a.created_at)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ──────── Notes ──────── */}
              <TabsContent value="notes" className="space-y-3 pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-3 flex items-center gap-1.5">
                  <StickyNote className="h-3 w-3" /> Admin notes
                </div>
                <div className="flex gap-2">
                  <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note about this account…"
                    className="rounded-xl text-sm min-h-[70px]" />
                  <Button onClick={addNote} disabled={!newNote.trim() || savingNote} className="rounded-xl self-end">
                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {data.notes?.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center">No notes yet</div>
                ) : data.notes.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl border bg-card">
                    <div className="text-sm whitespace-pre-wrap">{n.note}</div>
                    <div className="text-[10px] text-muted-foreground mt-2">
                      {n.author_name} · {fmt(n.created_at)}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>

      {/* ──────── Confirmation modal ──────── */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirm?.destructive && <AlertTriangle className="h-4 w-4 text-red-600" />}
              {confirm?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(confirm?.destructive && 'bg-red-600 hover:bg-red-700 text-white')}
              onClick={async () => {
                const c = confirm; setConfirm(null);
                if (c) await runAction(c.key, c.run, c.successMsg);
              }}>
              {confirm?.confirmLabel || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PlanChangeModal
        workspaceId={planModalWs?.id || null}
        workspaceName={planModalWs?.name}
        onClose={() => setPlanModalWs(null)}
        onSaved={() => load(true)}
      />
      {p && (
        <ProfileEditModal
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          onSaved={() => load(true)}
          userId={userId}
          profile={p}
        />
      )}
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border bg-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Indicator({ ok, warn, labelOk, labelWarn, labelFail }: {
  ok: boolean; warn?: boolean; labelOk: string; labelWarn: string; labelFail: string;
}) {
  const tone = ok ? 'emerald' : warn ? 'amber' : 'red';
  const label = ok ? labelOk : warn ? labelWarn : labelFail;
  const cls =
    tone === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
      : tone === 'amber' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
        : 'border-red-500/30 bg-red-500/10 text-red-700';
  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px]', cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full',
        tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-red-500')} />
      {label}
    </span>
  );
}

function ActionBtn({ icon: Icon, label, onClick, loading, tone }: {
  icon: any; label: string; onClick: () => void; loading?: boolean;
  tone?: 'red' | 'amber' | 'emerald';
}) {
  const cls =
    tone === 'red' ? 'border-red-500/30 hover:bg-red-500/10 text-red-700'
      : tone === 'amber' ? 'border-amber-500/30 hover:bg-amber-500/10 text-amber-700'
        : tone === 'emerald' ? 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700'
          : '';
  return (
    <Button variant="outline" onClick={onClick} disabled={loading}
      className={cn('rounded-xl h-auto py-3 flex flex-col gap-1.5 items-center text-xs', cls)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </Button>
  );
}
