import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import {
  Loader2, Search, UserCircle2, Building2, Phone, CreditCard,
  CheckCircle2, RefreshCw, Mail, Sparkles, MoreVertical, KeyRound,
  AtSign, PhoneCall, Trash2, Copy, ShieldAlert, ShieldOff, ShieldCheck,
  LogOut, MailCheck, Eye, Download, ArrowUpDown, ArrowUp, ArrowDown,
  Lock, BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountDetailsDrawer } from '@/components/admin/AccountDetailsDrawer';

interface AccountWorkspace {
  workspace_id: string; workspace_name: string; role: string; plan: string;
  plan_name: string | null; is_suspended: boolean; members_count: number;
  contacts_count: number; conversations_count: number; created_at: string | null;
  phone_number?: string | null; phone_status?: string | null;
  sub_accounts: { user_id: string; role: string; email: string | null; full_name: string | null; joined_at: string }[];
}
interface AccountRow {
  user_id: string; email: string | null; phone: string | null;
  full_name: string | null; company_name: string | null; country: string | null;
  timezone: string | null; created_at: string; last_sign_in_at: string | null;
  email_confirmed_at: string | null; provider: string; has_profile: boolean;
  onboarding_step: string; workspaces: AccountWorkspace[]; stage: number;
  reached?: { account: boolean; workspace: boolean; phone: boolean; plan: boolean };
}

type FilterKey = 'all' | 'completed' | 'incomplete' | 'wa_connected' | 'wa_missing' | 'free' | 'paid' | 'active' | 'suspended';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Signup completed' },
  { key: 'incomplete', label: 'Signup incomplete' },
  { key: 'wa_connected', label: 'WhatsApp connected' },
  { key: 'wa_missing', label: 'WhatsApp not connected' },
  { key: 'paid', label: 'Paid users' },
  { key: 'free', label: 'Free users' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

const PLAN_OPTIONS = ['free', 'basic', 'pro', 'business'];

type SortKey = 'created_at' | 'last_sign_in_at' | 'email' | 'full_name';
type SortDir = 'asc' | 'desc';

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminAccounts() {
  const { get, post } = useAdminApi();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'delete' | 'suspend' | 'reset'; row: AccountRow } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page) });
      if (search) qs.set('search', search);
      const data = await get(`accounts?${qs.toString()}`);
      setRows(data.accounts || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('[AdminAccounts] load failed', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Status helpers
  const hasWA = (r: AccountRow) => r.workspaces.some((w) => !!w.phone_number);
  const hasPaid = (r: AccountRow) =>
    r.workspaces.some((w) => w.plan && !['free', '—', 'trial', null].includes(String(w.plan).toLowerCase()));
  const isSuspended = (r: AccountRow) =>
    r.workspaces.length > 0 && r.workspaces.every((w) => w.is_suspended);
  const accountStatus = (r: AccountRow) => {
    if (isSuspended(r)) return 'suspended';
    if (!r.email_confirmed_at) return 'incomplete';
    return 'active';
  };

  const planLabel = (r: AccountRow) => {
    const w = r.workspaces[0];
    return w ? (w.plan_name || w.plan || '—') : '—';
  };

  // Filter
  const filtered = useMemo(() => {
    let list = rows;
    switch (filter) {
      case 'completed':   list = list.filter((r) => !!r.email_confirmed_at && r.workspaces.length > 0); break;
      case 'incomplete':  list = list.filter((r) => !r.email_confirmed_at || r.workspaces.length === 0); break;
      case 'wa_connected':list = list.filter(hasWA); break;
      case 'wa_missing':  list = list.filter((r) => !hasWA(r)); break;
      case 'paid':        list = list.filter(hasPaid); break;
      case 'free':        list = list.filter((r) => !hasPaid(r)); break;
      case 'active':      list = list.filter((r) => accountStatus(r) === 'active'); break;
      case 'suspended':   list = list.filter((r) => accountStatus(r) === 'suspended'); break;
    }
    const sorted = [...list].sort((a, b) => {
      const av: any = (a as any)[sortKey] ?? '';
      const bv: any = (b as any)[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rows, filter, sortKey, sortDir]);

  const counts: Record<FilterKey, number> = {
    all: rows.length,
    completed: rows.filter((r) => !!r.email_confirmed_at && r.workspaces.length > 0).length,
    incomplete: rows.filter((r) => !r.email_confirmed_at || r.workspaces.length === 0).length,
    wa_connected: rows.filter(hasWA).length,
    wa_missing: rows.filter((r) => !hasWA(r)).length,
    paid: rows.filter(hasPaid).length,
    free: rows.filter((r) => !hasPaid(r)).length,
    active: rows.filter((r) => accountStatus(r) === 'active').length,
    suspended: rows.filter((r) => accountStatus(r) === 'suspended').length,
  };

  // Actions
  const callAction = async (
    r: AccountRow, path: string, body: any,
    successMsg: string, opts?: { copyKey?: string }
  ) => {
    setBusyId(r.user_id);
    try {
      const res = await post(`users/${r.user_id}/${path}`, body);
      if (opts?.copyKey && res?.[opts.copyKey]) {
        try { await navigator.clipboard.writeText(res[opts.copyKey]); } catch { /* */ }
        toast({ title: successMsg, description: 'Link copied to clipboard.' });
      } else {
        toast({ title: successMsg });
      }
      load();
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setBusyId(null); setConfirm(null); }
  };

  const doChangeEmail = (r: AccountRow) => {
    const next = window.prompt(`New email for ${r.email || r.user_id}:`, r.email || '');
    if (!next || next === r.email) return;
    callAction(r, 'update-email', { email: next }, `Email updated to ${next}`);
  };
  const doChangePhone = (r: AccountRow) => {
    const next = window.prompt(`New phone (E.164, e.g. +14155551234):`, r.phone || '');
    if (!next || next === r.phone) return;
    callAction(r, 'update-phone', { phone: next }, `Phone updated`);
  };
  const doChangePassword = (r: AccountRow) => {
    const pw = window.prompt(`Set new password for ${r.email} (min 8 chars):`);
    if (!pw || pw.length < 8) { toast({ title: 'Password too short' }); return; }
    callAction(r, 'set-password', { password: pw }, 'Password set');
  };
  const doChangePlan = (r: AccountRow, plan: string) => {
    callAction(r, 'change-plan', { plan }, `Plan changed to ${plan}`);
  };

  const exportCSV = () => {
    const header = ['Name','Email','Phone','Country','Status','Workspaces','WA Connected','Plan','Created','Last Login'];
    const escape = (v: any) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(',')];
    filtered.forEach((r) => {
      lines.push([
        r.full_name || r.company_name || '', r.email || '', r.phone || '',
        r.country || '', accountStatus(r), r.workspaces.length, hasWA(r) ? 'Yes' : 'No',
        planLabel(r), r.created_at, r.last_sign_in_at || '',
      ].map(escape).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => {
        if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortKey(k); setSortDir('desc'); }
      }}
      className="inline-flex items-center gap-1 hover:text-foreground transition"
    >
      {label}
      {sortKey === k ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-5">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl bg-primary/10" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="h-3 w-3" /> Account Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total.toLocaleString()} signups · {counts.completed} completed · {counts.suspended} suspended · {counts.paid} paid
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-xl">
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
              <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium border transition whitespace-nowrap',
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {f.label}
            <span className={cn('ml-1.5 tabular-nums', filter === f.key ? 'opacity-90' : 'opacity-60')}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No accounts match this filter.
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold"><SortHeader k="full_name" label="User" /></th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell"><SortHeader k="email" label="Contact" /></th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Workspace</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell"><SortHeader k="created_at" label="Created" /></th>
                  <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell"><SortHeader k="last_sign_in_at" label="Last login" /></th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const initials = (r.full_name || r.email || '?')
                    .split(/\s+|@/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
                  const status = accountStatus(r);
                  const wa = hasWA(r);
                  const ws = r.workspaces[0];
                  return (
                    <tr
                      key={r.user_id}
                      className="border-b border-border/40 hover:bg-muted/30 transition cursor-pointer"
                      onClick={() => setDrawerUserId(r.user_id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center font-semibold text-primary text-xs flex-shrink-0 border border-primary/10">
                            {initials || <UserCircle2 className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate flex items-center gap-1.5">
                              {r.full_name || r.company_name || 'Unknown'}
                              {hasPaid(r) && <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate lg:hidden">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{r.email || '—'}</div>
                          {r.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{r.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {status === 'active' && (
                          <Badge className="rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Active
                          </Badge>
                        )}
                        {status === 'incomplete' && (
                          <Badge variant="outline" className="rounded-full text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700">
                            <ShieldAlert className="h-3 w-3 mr-0.5" /> Incomplete
                          </Badge>
                        )}
                        {status === 'suspended' && (
                          <Badge variant="destructive" className="rounded-full text-[10px]">
                            <ShieldOff className="h-3 w-3 mr-0.5" /> Suspended
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {r.workspaces.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">none</span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Building2 className="h-3.5 w-3.5 text-purple-600" />
                            <span className="truncate max-w-[160px]">{ws?.workspace_name}</span>
                            {r.workspaces.length > 1 && (
                              <Badge variant="outline" className="rounded-full text-[9px]">+{r.workspaces.length - 1}</Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {wa ? (
                          <Badge className="rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">
                            <Phone className="h-3 w-3 mr-0.5" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full text-[10px] text-muted-foreground">
                            Not connected
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                          <CreditCard className="h-3 w-3 mr-0.5" /> {planLabel(r)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{fmtDate(r.created_at)}</td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{fmtDateTime(r.last_sign_in_at)}</td>
                      <td className="px-2 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={busyId === r.user_id}>
                              {busyId === r.user_id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <MoreVertical className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-60" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuLabel className="text-xs truncate">{r.email || r.user_id.slice(0, 8)}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDrawerUserId(r.user_id)}>
                              <Eye className="h-4 w-4 mr-2" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirm({ kind: 'reset', row: r })}>
                              <KeyRound className="h-4 w-4 mr-2" /> Send password reset
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doChangePassword(r)}>
                              <Lock className="h-4 w-4 mr-2" /> Change password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doChangeEmail(r)}>
                              <AtSign className="h-4 w-4 mr-2" /> Change email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doChangePhone(r)}>
                              <PhoneCall className="h-4 w-4 mr-2" /> Change phone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => callAction(r, 'resend-verification', {}, 'Verification link generated', { copyKey: 'link' })}>
                              <MailCheck className="h-4 w-4 mr-2" /> Resend verification
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => callAction(r, 'force-logout', {}, 'All sessions revoked')}>
                              <LogOut className="h-4 w-4 mr-2" /> Force logout
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <CreditCard className="h-4 w-4 mr-2" /> Change plan
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {PLAN_OPTIONS.map((p) => (
                                  <DropdownMenuItem key={p} onClick={() => doChangePlan(r, p)} className="capitalize">
                                    {p}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            {status === 'suspended' ? (
                              <DropdownMenuItem onClick={() => callAction(r, 'activate', {}, 'Account reactivated')}>
                                <ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" /> Activate account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setConfirm({ kind: 'suspend', row: r })}>
                                <ShieldOff className="h-4 w-4 mr-2 text-amber-600" /> Suspend account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(r.user_id); toast({ title: 'User ID copied' }); }}>
                              <Copy className="h-4 w-4 mr-2" /> Copy user ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setConfirm({ kind: 'delete', row: r })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {Math.ceil(total / 50)} · {total} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <AccountDetailsDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />

      {/* Confirm dialog */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === 'delete' && 'Permanently delete this account?'}
              {confirm?.kind === 'suspend' && 'Suspend this account?'}
              {confirm?.kind === 'reset' && 'Send password reset?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === 'delete' && (
                <>This will hard-delete <strong>{confirm.row.email || confirm.row.user_id}</strong>: the auth user, profile, and all <strong>{confirm.row.workspaces.length}</strong> owned workspace(s) with all their data. This cannot be undone.</>
              )}
              {confirm?.kind === 'suspend' && (
                <>This will block <strong>{confirm.row.email}</strong> from signing in and suspend all owned workspaces. You can reactivate later.</>
              )}
              {confirm?.kind === 'reset' && (
                <>A recovery link will be generated for <strong>{confirm.row.email}</strong> and copied to your clipboard.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(confirm?.kind === 'delete' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
              onClick={(e) => {
                e.preventDefault();
                if (!confirm) return;
                if (confirm.kind === 'delete') callAction(confirm.row, 'delete', { reason: 'Admin hard delete' }, 'Account permanently deleted');
                if (confirm.kind === 'suspend') callAction(confirm.row, 'suspend', { reason: 'Suspended by admin' }, 'Account suspended');
                if (confirm.kind === 'reset')   callAction(confirm.row, 'reset-password', {}, 'Reset link copied', { copyKey: 'reset_link' });
              }}
            >
              {busyId === confirm?.row.user_id && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
