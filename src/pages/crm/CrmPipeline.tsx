import { useState, useMemo } from 'react';
import { CrmLayout } from '@/components/crm/CrmLayout';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, RefreshCw, LayoutGrid, Table as TableIcon, Activity, BarChart3, Sparkles, ChevronDown, Wallet } from 'lucide-react';
import { CrmStatCards } from '@/components/crm/CrmStatCards';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { DealDrawer } from '@/components/crm/DealDrawer';
import { AddDealDialog } from '@/components/crm/AddDealDialog';
import { CrmFiltersBar } from '@/components/crm/CrmFiltersBar';
import { ActivityView } from '@/components/crm/ActivityView';
import { ChartView } from '@/components/crm/ChartView';
import { useDefaultPipeline, usePipelineStages, useDeals, useDealMetrics } from '@/hooks/useCrm';
import { applyFilters, EMPTY_FILTERS, type CrmFilters } from '@/lib/crmFilters';
import type { Deal } from '@/types/crm';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'table' | 'activity' | 'chart';

export default function CrmPipeline() {
  const { pipelineId, loading: pLoading, error } = useDefaultPipeline();
  const { stages, loading: sLoading } = usePipelineStages(pipelineId);
  const { deals, loading: dLoading, moveDeal, createDeal, updateDeal, deleteDeal, refetch } = useDeals(pipelineId);
  const metrics = useDealMetrics(deals);

  const [view, setView] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<CrmFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addStageId, setAddStageId] = useState<string | null>(null);

  const allTags = useMemo(() => Array.from(new Set(deals.flatMap(d => d.tags))).sort(), [deals]);
  const allSources = useMemo(
    () => Array.from(new Set(deals.map(d => d.lead_source).filter(Boolean) as string[])).sort(),
    [deals]
  );

  const filtered = useMemo(() => applyFilters(deals, filters), [deals, filters]);

  const loading = pLoading || sLoading;
  const currency = deals[0]?.currency || 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  return (
    <CrmLayout>
      <Helmet><title>Sales CRM · Pipeline · Aireatro</title></Helmet>

      {/* Sticky CRM header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="px-4 md:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button className="group flex items-center gap-1.5 min-w-0">
              <h1 className="text-base md:text-lg font-bold truncate">Sales Pipeline</h1>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition" />
            </button>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" /> Beta
            </span>
            <div className="hidden md:flex items-center gap-3 pl-3 ml-1 border-l border-border/60 text-xs">
              <span className="text-muted-foreground"><span className="font-semibold text-foreground tabular-nums">{metrics.open}</span> open</span>
              <span className="text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> <span className="font-semibold text-foreground tabular-nums">{fmt(metrics.value)}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search deals, contacts, tags..."
                className="pl-8 h-9 bg-background"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={refetch} aria-label="Refresh">
              <RefreshCw className={cn('h-4 w-4', (loading || dLoading) && 'animate-spin')} />
            </Button>
            <CrmFiltersBar filters={filters} onChange={setFilters} allTags={allTags} allSources={allSources} />
            <Button
              size="sm"
              className="h-9 gap-1.5 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:shadow-primary/30"
              onClick={() => { setAddStageId(null); setAddOpen(true); }}
              disabled={!pipelineId || stages.length === 0}
            >
              <Plus className="h-4 w-4" /> Add deal
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-3 sm:p-4 md:p-6">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-2xl" />)}
          </div>
        ) : (
          <CrmStatCards {...metrics} currency={currency} />
        )}

        {/* View switcher */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
            {([
              { id: 'kanban', icon: LayoutGrid, label: 'Kanban' },
              { id: 'table', icon: TableIcon, label: 'Table' },
              { id: 'activity', icon: Activity, label: 'Activity' },
              { id: 'chart', icon: BarChart3, label: 'Chart' },
            ] as const).map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  view === v.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <v.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {deals.length} deals</span>
        </div>

        {/* Body */}
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-[300px] rounded-2xl shrink-0" />)}
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            stages={stages}
            deals={filtered}
            onDealClick={(d) => { setSelected(d); setDrawerOpen(true); }}
            onMoveDeal={moveDeal}
            onAddDeal={(stageId) => { setAddStageId(stageId); setAddOpen(true); }}
          />
        ) : view === 'table' ? (
          <TableView deals={filtered} stages={stages} onClick={(d) => { setSelected(d); setDrawerOpen(true); }} />
        ) : view === 'activity' ? (
          <ActivityView deals={deals} onDealClick={(d) => { setSelected(d); setDrawerOpen(true); }} />
        ) : (
          <ChartView deals={filtered} stages={stages} currency={currency} />
        )}
      </div>

      <DealDrawer
        deal={selected} open={drawerOpen} onOpenChange={setDrawerOpen}
        stages={stages} onUpdate={updateDeal} onDelete={deleteDeal}
      />
      {pipelineId && (
        <AddDealDialog
          open={addOpen} onOpenChange={setAddOpen}
          stages={stages} defaultStageId={addStageId} pipelineId={pipelineId}
          onCreate={createDeal}
        />
      )}

      {/* Mobile floating add */}
      <button
        className="md:hidden fixed right-4 bottom-20 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition"
        onClick={() => { setAddStageId(null); setAddOpen(true); }}
        aria-label="Add deal"
      >
        <Plus className="h-6 w-6" />
      </button>
    </CrmLayout>
  );
}

function TableView({ deals, stages, onClick }: { deals: Deal[]; stages: any[]; onClick: (d: Deal) => void }) {
  const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Deal</th>
              <th className="text-left px-4 py-2.5 hidden md:table-cell">Stage</th>
              <th className="text-right px-4 py-2.5">Value</th>
              <th className="text-left px-4 py-2.5 hidden lg:table-cell">Priority</th>
              <th className="text-left px-4 py-2.5 hidden lg:table-cell">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No deals match your filters.</td></tr>
            ) : deals.map(d => {
              const st = stageMap[d.stage_id];
              return (
                <tr key={d.id} onClick={() => onClick(d)} className="border-t border-border/40 hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="font-medium">{d.title}</div>
                    {d.company_name && <div className="text-xs text-muted-foreground">{d.company_name}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {st && (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ background: st.color }} />
                        {st.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: d.currency, maximumFractionDigits: 0 }).format(Number(d.value))}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell capitalize">{d.priority}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(d.last_activity_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
