import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Search, UserCircle2, Building2, Phone, CreditCard,
  CheckCircle2, Circle, ChevronRight, RefreshCw, ArrowRight, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignupRow {
  workspace_id: string;
  workspace_name: string;
  is_suspended: boolean;
  plan: string;
  plan_name: string | null;
  members_count: number;
  contacts_count: number;
  conversations_count: number;
  owner_email: string | null;
  owner_full_name: string | null;
  owner_company_name: string | null;
  owner_country: string | null;
  owner_phone: string | null;
  owner_signup_at: string | null;
  onboarding_step?: string | null;
  onboarding_timeline?: {
    signup_at?: string | null;
    org_done_at?: string | null;
    password_done_at?: string | null;
    workspace_created_at?: string | null;
    completed_at?: string | null;
  };
  phone_number: string | null;
  phone_status: string | null;
  no_workspace?: boolean;
}

const STAGES = [
  { key: 'signup', label: 'Account', icon: UserCircle2 },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'plan', label: 'Plan', icon: CreditCard },
] as const;

function getStage(row: SignupRow): number {
  // 0 = account only, 1 = workspace, 2 = phone connected, 3 = paid plan
  const hasWorkspace = !row.no_workspace || !!row.onboarding_timeline?.workspace_created_at;
  const hasPhone = row.phone_status === 'connected' || (row.members_count > 0 && !!row.phone_number);
  const hasPaidPlan = row.plan && !['free', '—', 'trial'].includes(row.plan);
  if (hasPaidPlan) return 3;
  if (hasPhone) return 2;
  if (hasWorkspace) return 1;
  return 0;
}

function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminAccounts() {
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [rows, setRows] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ view: 'recent-signups', page: String(page) });
      if (search) qs.set('search', search);
      const data = await get(`workspaces?${qs.toString()}`);
      setRows(data.workspaces || []);
      setTotal(data.total || 0);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const stageCounts = [0, 1, 2, 3].map(s => rows.filter(r => getStage(r) === s).length);
  const filtered = stageFilter === null ? rows : rows.filter(r => getStage(r) === stageFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customer journey map — track every signup from account creation to active plan.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl">
          <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* Funnel/Journey overview */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Customer Journey · {total.toLocaleString()} total accounts
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STAGES.map((stage, i) => {
              const count = stageCounts[i];
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
                    <div className="text-2xl font-bold tabular-nums">{count}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stage.label}</div>
                  </button>
                  {i < STAGES.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {stageFilter !== null && (
            <button
              onClick={() => setStageFilter(null)}
              className="text-xs text-primary mt-3 hover:underline"
            >
              Clear stage filter
            </button>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, or company…"
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
        <div className="space-y-2">
          {filtered.map(row => {
            const stage = getStage(row);
            return (
              <Card
                key={row.workspace_id}
                className="rounded-2xl border-border/50 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/control/workspaces/${row.workspace_id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                    <UserCircle2 className="h-5 w-5 text-primary" />
                  </div>

                  {/* Identity */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {row.owner_full_name || row.owner_company_name || row.owner_email || 'Unknown'}
                      </span>
                      {row.is_suspended && (
                        <Badge variant="destructive" className="rounded-full text-[10px]">Suspended</Badge>
                      )}
                      {stage === 3 && (
                        <Badge className="rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Activated
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{row.owner_email || '—'}</span>
                      <span>·</span>
                      <span className="hidden sm:inline">Joined {fmtDate(row.owner_signup_at)}</span>
                    </div>
                  </div>

                  {/* Journey progress */}
                  <div className="hidden md:flex items-center gap-1">
                    {STAGES.map((s, i) => {
                      const done = i <= stage;
                      const Icon = s.icon;
                      return (
                        <React.Fragment key={s.key}>
                          <div
                            className={cn(
                              'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                              done
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                            title={s.label}
                          >
                            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                          </div>
                          {i < STAGES.length - 1 && (
                            <div
                              className={cn(
                                'h-0.5 w-4 rounded-full',
                                i < stage ? 'bg-primary' : 'bg-muted'
                              )}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Plan */}
                  <div className="hidden sm:flex flex-col items-end min-w-[80px]">
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                      {row.plan_name || row.plan || '—'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground mt-1">
                      {STAGES[stage].label}
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 25 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {Math.ceil(total / 25)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
