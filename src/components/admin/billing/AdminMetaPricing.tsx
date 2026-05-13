import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle, Globe2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Rate {
  country_code: string; country_name: string; template_category: string;
  rate_per_message: number; currency: string; source: string;
  synced_at: string | null; sample_size: number | null; updated_at: string;
}
interface Run {
  id: string; started_at: string; finished_at: string | null; status: string;
  wabas_processed: number; rates_upserted: number; error: string | null;
}

export function AdminMetaPricing() {
  const { toast } = useToast();
  const [rates, setRates] = useState<Rate[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: h }] = await Promise.all([
      supabase.from('whatsapp_meta_pricing_rates').select('*').eq('active', true).order('country_code').order('template_category'),
      supabase.from('meta_pricing_sync_runs').select('*').order('started_at', { ascending: false }).limit(10),
    ]);
    setRates((r as any) || []);
    setRuns((h as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-pricing-sync', { method: 'POST' });
      if (error) throw error;
      const upserted = data?.rates_upserted ?? 0;
      const total = data?.total_wabas ?? 0;
      if (upserted === 0 && data?.note) {
        toast({
          title: 'Meta did not return pricing data',
          description: data.note,
          duration: 12000,
        });
      } else {
        toast({ title: 'Sync complete', description: `${upserted} rates updated from ${total} WABA(s).` });
      }
      await load();
    } catch (e: any) {
      toast({ title: 'Sync failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const lastSuccess = runs.find(r => r.status === 'success');
  const seedCount = rates.filter(r => r.source === 'seed').length;
  const liveCount = rates.filter(r => r.source === 'meta_api').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" />Meta WhatsApp Pricing</CardTitle>
            <CardDescription>
              Live country rates synced from Meta Graph API conversation analytics. Falls back to seed rates where Meta has no data yet.
            </CardDescription>
          </div>
          <Button onClick={sync} disabled={syncing} className="rounded-xl">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh from Meta
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Live (synced)" value={liveCount} icon={Sparkles} tone="ok" />
            <Stat label="Seed (fallback)" value={seedCount} />
            <Stat label="Last sync" value={lastSuccess ? formatDistanceToNow(new Date(lastSuccess.started_at), { addSuffix: true }) : 'Never'} />
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Rate (credits/msg)</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Sample</TableHead>
                    <TableHead>Synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((r) => (
                    <TableRow key={`${r.country_code}-${r.template_category}`}>
                      <TableCell className="font-medium">{r.country_code}</TableCell>
                      <TableCell className="capitalize text-xs">{r.template_category}</TableCell>
                      <TableCell className="text-right tabular-nums">{Number(r.rate_per_message).toFixed(3)}</TableCell>
                      <TableCell>
                        {r.source === 'meta_api' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">Live</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Seed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums text-muted-foreground">{r.sample_size ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.synced_at ? formatDistanceToNow(new Date(r.synced_at), { addSuffix: true }) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Sync Runs</CardTitle></CardHeader>
        <CardContent>
          {runs.length === 0 ? <p className="text-xs text-muted-foreground">No sync runs yet.</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">WABAs</TableHead>
                  <TableHead className="text-right">Rates Updated</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{new Date(r.started_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {r.status === 'success' ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3" />Success</Badge>
                      ) : r.status === 'error' ? (
                        <Badge variant="destructive" className="gap-1 text-[10px]"><AlertTriangle className="h-3 w-3" />Error</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.wabas_processed}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.rates_upserted}</TableCell>
                    <TableCell className="text-xs text-destructive truncate max-w-[200px]">{r.error || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon?: any; tone?: 'ok' }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === 'ok' ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-card'}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </p>
      <p className="text-lg font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
