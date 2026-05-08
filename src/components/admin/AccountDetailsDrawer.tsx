import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, UserCircle2, Mail, Phone, Globe2, Building2, CreditCard,
  CheckCircle2, ShieldAlert, Activity, StickyNote, Users, Send,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props {
  userId: string | null;
  onClose: () => void;
}

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export function AccountDetailsDrawer({ userId, onClose }: Props) {
  const { get, post } = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!userId) { setData(null); return; }
    setLoading(true);
    get(`users/${userId}/details`)
      .then(setData)
      .catch((e) => toast({ title: 'Failed to load', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [userId]);

  const addNote = async () => {
    if (!newNote.trim() || !userId) return;
    setSavingNote(true);
    try {
      await post(`users/${userId}/notes`, { note: newNote.trim() });
      setNewNote('');
      const fresh = await get(`users/${userId}/details`);
      setData(fresh);
      toast({ title: 'Note added' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setSavingNote(false); }
  };

  if (!userId) return null;

  const u = data?.user;
  const p = data?.profile;
  const initials = (p?.full_name || u?.email || '?').split(/\s+|@/).filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('');

  // Compute signup completion progress
  const steps = [
    { key: 'signup', label: 'Sign up', done: !!u?.created_at },
    { key: 'confirmed', label: 'Email confirmed', done: !!u?.email_confirmed_at },
    { key: 'org', label: 'Organization', done: !!p?.step_org_done_at },
    { key: 'workspace', label: 'Workspace', done: !!p?.step_workspace_created_at || (data?.workspaces?.length > 0) },
    { key: 'completed', label: 'Onboarding completed', done: !!p?.step_completed_at },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = (doneCount / steps.length) * 100;

  return (
    <Sheet open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        {loading || !data ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="p-6 pb-4 bg-gradient-to-br from-primary/5 via-background to-background border-b">
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
                    {u?.banned_until && new Date(u.banned_until) > new Date() ? (
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
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5">
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {u?.email || '—'}</div>
                    {u?.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {u.phone}</div>}
                    {p?.country && <div className="flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> {p.country}</div>}
                  </div>
                </div>
              </div>

              {/* Onboarding progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium">Signup completion</span>
                  <span className="text-muted-foreground tabular-nums">{doneCount}/{steps.length} · {pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {steps.map((s) => (
                    <Badge
                      key={s.key}
                      variant="outline"
                      className={cn(
                        'rounded-full text-[10px]',
                        s.done ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-border text-muted-foreground'
                      )}
                    >
                      {s.done && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="px-6 pt-4">
              <TabsList className="rounded-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Stat label="Created" value={fmt(u?.created_at)} />
                  <Stat label="Last login" value={fmt(u?.last_sign_in_at)} />
                  <Stat label="Email confirmed" value={fmt(u?.email_confirmed_at)} />
                  <Stat label="Timezone" value={p?.timezone || '—'} />
                  <Stat label="Industry" value={p?.industry || '—'} />
                  <Stat label="Team size" value={p?.team_size || '—'} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Connected WhatsApp ({data.phones?.length || 0})</div>
                  {data.phones?.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">No WhatsApp number connected</div>
                  ) : (
                    data.phones.map((ph: any) => (
                      <div key={ph.display_number} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{ph.display_number}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{ph.verified_name || '—'} · added {fmt(ph.created_at)}</div>
                        </div>
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">{ph.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="workspaces" className="space-y-3 pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-3">
                  Workspaces ({data.workspaces?.length || 0})
                </div>
                {data.workspaces?.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center">No workspaces yet</div>
                ) : (
                  data.workspaces.map((w: any) => (
                    <div key={w.workspace_id} className="p-3 rounded-xl border bg-card">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{w.workspace_name}</span>
                            <Badge variant="outline" className="rounded-full text-[10px] capitalize">{w.role}</Badge>
                            <Badge variant="outline" className="rounded-full text-[10px] capitalize"><CreditCard className="h-3 w-3 mr-1" />{w.plan_name || w.plan}</Badge>
                            {w.is_suspended && <Badge variant="destructive" className="rounded-full text-[10px]">Suspended</Badge>}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {w.members_count} members · {w.contacts_count} contacts · {w.conversations_count} convos · created {fmt(w.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {data.team_members?.length > 0 && (
                  <>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-4 flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> Team members ({data.team_members.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.team_members.map((m: any) => (
                        <div key={m.user_id + m.tenant_id} className="flex items-center gap-2 p-2 rounded-lg border text-xs bg-card">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                            {(m.full_name || m.email || '?')[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{m.full_name || m.email}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{m.email}</div>
                          </div>
                          <Badge variant="outline" className="rounded-full text-[9px] capitalize">{m.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-2 pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-3 flex items-center gap-1.5">
                  <Activity className="h-3 w-3" /> Recent activity
                </div>
                {[...(data.activity || []), ...(data.onboarding_events || []).map((e: any) => ({
                  action: e.event_type, created_at: e.created_at, note: e.metadata ? JSON.stringify(e.metadata).slice(0, 80) : null,
                }))]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 30)
                  .map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border bg-card text-xs">
                      <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Activity className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{(a.action || '').replace(/_/g, ' ').toLowerCase()}</div>
                        {a.note && <div className="text-[10px] text-muted-foreground truncate">{a.note}</div>}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{fmt(a.created_at)}</span>
                    </div>
                  ))}
                {(data.activity?.length || 0) + (data.onboarding_events?.length || 0) === 0 && (
                  <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center">No activity recorded</div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-3 pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-3 flex items-center gap-1.5">
                  <StickyNote className="h-3 w-3" /> Admin notes
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note about this account…"
                    className="rounded-xl text-sm min-h-[70px]"
                  />
                  <Button onClick={addNote} disabled={!newNote.trim() || savingNote} className="rounded-xl self-end">
                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {data.notes?.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic p-4 border rounded-xl text-center">No notes yet</div>
                ) : (
                  data.notes.map((n: any) => (
                    <div key={n.id} className="p-3 rounded-xl border bg-card">
                      <div className="text-sm whitespace-pre-wrap">{n.note}</div>
                      <div className="text-[10px] text-muted-foreground mt-2">
                        {n.author_name} · {fmt(n.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
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
