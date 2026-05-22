import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Run = {
  id: string; status: string; trigger_type: string; started_at: string; ended_at: string | null;
  duration_ms: number | null; current_node_key: string | null; error: string | null;
  contact_id: string | null;
};
type Step = {
  id: string; node_key: string; node_type: string; status: string;
  started_at: string; ended_at: string | null; duration_ms: number | null;
  input: any; output: any; error: string | null;
};

const statusColor = (s: string) => ({
  running: 'bg-blue-500/10 text-blue-700 border-blue-300',
  waiting: 'bg-amber-500/10 text-amber-700 border-amber-300',
  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
  failed: 'bg-red-500/10 text-red-700 border-red-300',
  stopped: 'bg-muted text-muted-foreground border-border',
} as Record<string, string>)[s] ?? 'bg-muted';

const statusIcon = (s: string) => {
  if (s === 'completed' || s === 'done') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (s === 'waiting' || s === 'running' || s === 'scheduled') return <Clock className="h-4 w-4 text-amber-600" />;
  if (s === 'failed') return <XCircle className="h-4 w-4 text-red-600" />;
  return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
};

export default function FlowRuns() {
  const { flowId } = useParams();
  const nav = useNavigate();
  const [flow, setFlow] = useState<any>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!flowId) return;
    setLoading(true);
    const { data: f } = await supabase.from('flows').select('*').eq('id', flowId).maybeSingle();
    setFlow(f);
    const { data: r } = await supabase.from('flow_runs').select('*')
      .eq('flow_id', flowId).order('started_at', { ascending: false }).limit(100);
    setRuns((r ?? []) as Run[]);
    if (r?.[0] && !selectedRun) setSelectedRun(r[0] as Run);
    setLoading(false);
  };

  useEffect(() => { load(); }, [flowId]);

  useEffect(() => {
    if (!selectedRun) return;
    supabase.from('flow_run_steps').select('*').eq('run_id', selectedRun.id)
      .order('started_at', { ascending: true })
      .then(({ data }) => setSteps((data ?? []) as Step[]));
  }, [selectedRun]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{flow?.name ?? 'Flow'} — Runs</h1>
              <p className="text-sm text-muted-foreground">Live execution history & per-step logs</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3"><CardTitle className="text-sm">Recent runs ({runs.length})</CardTitle></CardHeader>
            <ScrollArea className="h-[70vh]">
              <div className="space-y-1 p-2">
                {loading && <p className="text-sm text-muted-foreground p-3">Loading…</p>}
                {!loading && runs.length === 0 && (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No runs yet.</p>
                    <p className="text-xs text-muted-foreground">Publish the flow and trigger it (e.g. WhatsApp keyword) to see runs here.</p>
                  </div>
                )}
                {runs.map(r => (
                  <button key={r.id}
                    onClick={() => setSelectedRun(r)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedRun?.id === r.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.started_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{r.trigger_type} · {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : '—'}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card>
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                {selectedRun ? <>Run {selectedRun.id.slice(0, 8)} <Badge variant="outline" className={statusColor(selectedRun.status)}>{selectedRun.status}</Badge></> : 'Select a run'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                {!selectedRun && <p className="text-sm text-muted-foreground p-6">Pick a run from the list to inspect each step.</p>}
                {selectedRun && (
                  <div className="p-4 space-y-3">
                    {selectedRun.error && (
                      <div className="p-3 rounded-md bg-red-500/10 border border-red-300 text-sm text-red-800">{selectedRun.error}</div>
                    )}
                    {steps.length === 0 && <p className="text-sm text-muted-foreground">No steps logged yet.</p>}
                    {steps.map((s, i) => (
                      <div key={s.id} className="relative pl-8">
                        <div className="absolute left-2 top-2">{statusIcon(s.status)}</div>
                        {i < steps.length - 1 && <div className="absolute left-[15px] top-7 bottom-[-12px] w-px bg-border" />}
                        <div className="rounded-lg border p-3 bg-card">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-sm font-medium">{s.node_type}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{s.node_key}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{s.duration_ms ? `${s.duration_ms}ms` : '—'}</span>
                          </div>
                          {s.error && <p className="text-xs text-red-600 mt-1">{s.error}</p>}
                          {(s.output && Object.keys(s.output).length > 0) && (
                            <pre className="mt-2 text-[11px] bg-muted/50 rounded p-2 overflow-x-auto">{JSON.stringify(s.output, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
