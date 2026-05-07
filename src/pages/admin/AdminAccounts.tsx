import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Search, UserCircle2, Building2, Phone, CreditCard,
  CheckCircle2, ChevronRight, RefreshCw, ArrowRight, Mail, Users,
  ChevronDown, ShieldAlert, Sparkles, Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubAccount {
  user_id: string;
  role: string;
  email: string | null;
  full_name: string | null;
  joined_at: string;
}
interface AccountWorkspace {
  workspace_id: string;
  workspace_name: string;
  role: string;
  plan: string;
  plan_name: string | null;
  is_suspended: boolean;
  members_count: number;
  contacts_count: number;
  conversations_count: number;
  created_at: string | null;
  sub_accounts: SubAccount[];
}
interface AccountRow {
  user_id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  timezone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  provider: string;
  has_profile: boolean;
  onboarding_step: string;
  workspaces: AccountWorkspace[];
  stage: number;
}

const STAGES = [
  { key: 'account', label: 'Account', icon: UserCircle2 },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'plan', label: 'Plan', icon: CreditCard },
] as const;

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminAccounts() {
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const stageCounts = useMemo(
    () => [0, 1, 2, 3].map(s => rows.filter(r => r.stage === s).length),
    [rows]
  );
  const filtered = stageFilter === null ? rows : rows.filter(r => r.stage === stageFilter);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-5">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl bg-primary/10" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="h-3 w-3" /> Customer Journey
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Signup Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every signup from <strong>auth.users</strong> · expand to see workspaces &amp; sub-accounts (team members).
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
            <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      {/* Funnel */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            {total.toLocaleString()} total signups · {rows.reduce((a, r) => a + r.workspaces.length, 0)} workspaces · {rows.reduce((a, r) => a + r.workspaces.reduce((b, w) => b + w.sub_accounts.length, 0), 0)} sub-accounts
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const active = stageFilter === i;
              return (
                <React.Fragment key={stage.key}>
                  <button
                    onClick={() => setStageFilter(active ? null : i)}
                    className={cn(
                      'flex-1 min-w-[140px] rounded-xl border p-4 text-left transition-all',
                      active
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center',
                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px]">Step {i + 1}</Badge>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{stageCounts[i]}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stage.label}</div>
                  </button>
                  {i < STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
          {stageFilter !== null && (
            <button onClick={() => setStageFilter(null)} className="text-xs text-primary mt-3 hover:underline">
              Clear stage filter
            </button>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, company, or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Account list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No accounts match this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(row => {
            const isOpen = !!expanded[row.user_id];
            const totalSubs = row.workspaces.reduce((a, w) => a + w.sub_accounts.length, 0);
            const initials = (row.full_name || row.email || '?')
              .split(/\s+|@/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('');
            return (
              <Card
                key={row.user_id}
                className="rounded-2xl border-border/50 overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* Main row */}
                <button
                  onClick={() => row.workspaces.length > 0 && toggle(row.user_id)}
                  disabled={row.workspaces.length === 0}
                  className={cn(
                    'w-full text-left p-4 flex items-center gap-4',
                    row.workspaces.length > 0 && 'cursor-pointer hover:bg-muted/30'
                  )}
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10 font-semibold text-primary text-sm">
                    {initials || <UserCircle2 className="h-5 w-5" />}
                  </div>

                  {/* Identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {row.full_name || row.company_name || row.email || 'Unknown'}
                      </span>
                      {!row.email_confirmed_at && (
                        <Badge variant="outline" className="rounded-full text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700">
                          <ShieldAlert className="h-3 w-3 mr-0.5" /> Unconfirmed
                        </Badge>
                      )}
                      {!row.has_profile && (
                        <Badge variant="outline" className="rounded-full text-[10px] border-orange-500/40 bg-orange-500/10 text-orange-700">
                          No profile
                        </Badge>
                      )}
                      {row.stage === 3 && (
                        <Badge className="rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Activated
                        </Badge>
                      )}
                      <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                        {row.provider}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{row.email || '—'}</span>
                      {row.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{row.phone}</span>}
                      {row.country && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />{row.country}</span>}
                      <span>· Signed up {fmtDate(row.created_at)}</span>
                    </div>
                  </div>

                  {/* Counts */}
                  <div className="hidden md:flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-bold tabular-nums">{row.workspaces.length}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Workspaces</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold tabular-nums">{totalSubs}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sub-accts</div>
                    </div>
                  </div>

                  {/* Stage chip */}
                  <Badge variant="outline" className="rounded-full text-[10px] hidden sm:inline-flex">
                    {STAGES[row.stage].label}
                  </Badge>

                  {row.workspaces.length > 0 ? (
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform flex-shrink-0', isOpen && 'rotate-180')} />
                  ) : (
                    <span className="w-4" />
                  )}
                </button>

                {/* Expanded: workspaces + sub-accounts */}
                {isOpen && row.workspaces.length > 0 && (
                  <div className="border-t border-border/50 bg-muted/20 px-4 py-3 space-y-2">
                    {row.workspaces.map(ws => (
                      <div key={ws.workspace_id} className="rounded-xl bg-background border border-border/60 overflow-hidden">
                        {/* Workspace header */}
                        <div
                          className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/30"
                          onClick={() => navigate(`/control/workspaces/${ws.workspace_id}`)}
                        >
                          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{ws.workspace_name}</span>
                              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{ws.role}</Badge>
                              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{ws.plan_name || ws.plan}</Badge>
                              {ws.is_suspended && (
                                <Badge variant="destructive" className="rounded-full text-[10px]">Suspended</Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {ws.members_count} members · {ws.contacts_count} contacts · {ws.conversations_count} convos · created {fmtDate(ws.created_at)}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Sub-accounts */}
                        {ws.sub_accounts.length > 0 && (
                          <div className="border-t border-border/50 bg-muted/10 px-3 py-2">
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <Users className="h-3 w-3" /> Team members ({ws.sub_accounts.length})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {ws.sub_accounts.map(sa => (
                                <div key={sa.user_id} className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-background">
                                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                                    {(sa.full_name || sa.email || '?')[0]?.toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium">{sa.full_name || sa.email || sa.user_id.slice(0, 8)}</div>
                                    <div className="truncate text-muted-foreground text-[10px]">{sa.email}</div>
                                  </div>
                                  <Badge variant="outline" className="rounded-full text-[9px] capitalize">{sa.role}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {Math.ceil(total / 50)} · {total} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
