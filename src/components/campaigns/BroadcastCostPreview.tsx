import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, AlertTriangle, CheckCircle2, ArrowUpRight, Loader2, Globe2 } from 'lucide-react';
import { useBroadcastCostEstimate, type BroadcastCostEstimate } from '@/hooks/useBroadcastCostEstimate';
import { cn } from '@/lib/utils';

interface Props {
  tenantId: string | null | undefined;
  contactIds: string[];
  templateCategory: string | null | undefined;
  className?: string;
  onEstimateChange?: (e: BroadcastCostEstimate | null) => void;
}

export function BroadcastCostPreview({ tenantId, contactIds, templateCategory, className, onEstimateChange }: Props) {
  const navigate = useNavigate();
  const { estimate, loading, error } = useBroadcastCostEstimate({ tenantId, contactIds, templateCategory });

  // Lift up
  if (onEstimateChange) onEstimateChange(estimate);

  const sufficient = !!estimate?.sufficient;
  const cat = (templateCategory || 'marketing').toLowerCase();

  return (
    <Card className={cn('border-2', sufficient ? 'border-emerald-300/50 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-destructive/40 bg-destructive/5', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          Estimated Campaign Cost
          <Badge variant="outline" className="text-[10px] capitalize">{cat}</Badge>
        </CardTitle>
        <CardDescription className="text-xs">Country-wise Meta WhatsApp pricing · final amount calculated server-side before send.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating cost…
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!loading && estimate && (
          <>
            {/* Summary tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Tile label="Recipients" value={estimate.total_recipients.toLocaleString()} />
              <Tile label="Required" value={`${estimate.total_credits.toLocaleString()} cr`} tone={sufficient ? 'ok' : 'bad'} />
              <Tile label="Available" value={estimate.available.toLocaleString()} />
              <Tile label={sufficient ? 'Remaining' : 'Short by'}
                value={(sufficient ? estimate.remaining_after : estimate.shortfall).toLocaleString()}
                tone={sufficient ? 'ok' : 'bad'} />
            </div>

            {/* Country breakdown */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Country</TableHead>
                    <TableHead className="text-xs text-right">Contacts</TableHead>
                    <TableHead className="text-xs text-right">Rate / msg</TableHead>
                    <TableHead className="text-xs text-right">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimate.breakdown.map((row) => (
                    <TableRow key={row.country_code}>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <Globe2 className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{row.country_name}</span>
                          <Badge variant="outline" className="text-[9px] px-1 h-4">{row.country_code}</Badge>
                          {row.unknown && <Badge variant="secondary" className="text-[9px] px-1 h-4">no rate</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{row.count.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums">{Number(row.rate).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-semibold">{row.total_credits.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={3} className="text-xs font-semibold text-right">Total</TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-bold text-primary">{estimate.total_credits.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Warning / OK status */}
            {sufficient ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Wallet has enough credits — campaign ready to launch.
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-destructive">Insufficient credits</p>
                  <p className="text-muted-foreground">
                    You need <strong>{estimate.total_credits}</strong> credits but have <strong>{estimate.available}</strong>.
                    Top up <strong>{estimate.shortfall}+</strong> credits to continue.
                  </p>
                </div>
                <Button size="sm" className="gap-1" onClick={() => navigate('/billing?tab=credits')}>
                  <Coins className="h-3.5 w-3.5" /> Top Up <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {estimate.unknown_count > 0 && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {estimate.unknown_count} contact(s) have unknown country — default rate applied.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Tile({ label, value, tone }: { label: string; value: string | number; tone?: 'ok' | 'bad' }) {
  return (
    <div className={cn('rounded-lg border bg-card p-2.5', tone === 'bad' && 'border-destructive/30', tone === 'ok' && 'border-emerald-300/40')}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('text-base font-bold mt-0.5 tabular-nums', tone === 'ok' && 'text-emerald-700 dark:text-emerald-400', tone === 'bad' && 'text-destructive')}>{value}</p>
    </div>
  );
}
