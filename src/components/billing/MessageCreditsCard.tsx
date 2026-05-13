import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Coins, Sparkles, History, AlertTriangle, ShieldCheck, Loader2,
  CheckCircle2, XCircle, ArrowUpRight, Wallet, TrendingUp, Crown, Star, Download,
} from 'lucide-react';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { useCreditPackages, type CreditTopupPackage } from '@/hooks/useCreditPackages';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CURRENCY_SYMBOL: Record<string, string> = { INR: '₹', AED: 'AED ', USD: '$' };
const LOW_BALANCE_THRESHOLD = 50;

function fmtPrice(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOL[currency] ?? '';
  return `${sym}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function MessageCreditsCard() {
  const { currentTenant } = useTenant();
  const { balance, totalPurchased, totalUsed, transactions, transactionsLoading, invalidate } = useMessageCredits();
  const { packages, isLoading: pkgLoading } = useCreditPackages();
  const [params, setParams] = useSearchParams();
  const [pending, setPending] = useState<CreditTopupPackage | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Handle Stripe redirect status
  useEffect(() => {
    const status = params.get('credits');
    if (!status) return;
    if (status === 'success') {
      toast.success('Credits added successfully', { description: 'Your wallet has been topped up.' });
      // Webhook is async — refetch a few times to catch it
      const tries = [800, 2500, 5000];
      tries.forEach((ms) => setTimeout(invalidate, ms));
    } else if (status === 'cancelled') {
      toast.message('Payment cancelled', { description: 'No credits were added.' });
    }
    params.delete('credits');
    params.delete('session_id');
    setParams(params, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const usedPct = totalPurchased > 0 ? Math.min(100, (totalUsed / totalPurchased) * 100) : 0;
  const lowBalance = balance > 0 && balance < LOW_BALANCE_THRESHOLD;
  const noBalance = balance === 0;

  const startCheckout = async (pkg: CreditTopupPackage) => {
    if (!currentTenant?.id) return;
    setConfirming(true);
    try {
      const { data, error } = await supabase.functions.invoke('credits-create-checkout', {
        body: { workspaceId: currentTenant.id, packageId: pkg.id },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('Checkout URL missing');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || 'Could not start checkout');
      setConfirming(false);
      setPending(null);
    }
  };

  const exportCsv = () => {
    if (!transactions || transactions.length === 0) {
      toast.message('No transactions to export');
      return;
    }
    const rows = [
      ['Date', 'Type', 'Credits', 'Balance After', 'Description'],
      ...transactions.map((t: any) => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.type,
        t.amount,
        t.balance_after,
        (t.description || '').replace(/"/g, '""'),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-credits-${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recentTx = useMemo(() => (transactions || []).slice(0, 5), [transactions]);

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-soft">
        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-6 border-b">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 grid place-items-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  Message Credits
                  <Badge variant="outline" className="text-[10px] font-medium gap-1">
                    <ShieldCheck className="h-3 w-3" /> Secure Stripe
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">Hybrid billing · inbox replies free · template messages use credits</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {balance.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">credits available</p>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <StatTile label="Available" value={balance} tone="emerald" icon={Wallet} />
            <StatTile label="Purchased" value={totalPurchased} tone="blue" icon={TrendingUp} />
            <StatTile label="Used" value={totalUsed} tone="rose" icon={ArrowUpRight} className="col-span-2 sm:col-span-1" />
          </div>

          {/* Usage progress */}
          {totalPurchased > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>Usage</span>
                <span>{totalUsed.toLocaleString()} / {totalPurchased.toLocaleString()} ({Math.round(usedPct)}%)</span>
              </div>
              <Progress value={usedPct} className="h-2" />
            </div>
          )}

          {/* Hybrid billing model explainer */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <BillingPill tone="emerald" title="Inbox replies" hint="Free · 24h window" />
            <BillingPill tone="amber" title="Marketing" hint="Full Meta rate" />
            <BillingPill tone="blue" title="Utility" hint="~40% lower" />
            <BillingPill tone="violet" title="Authentication" hint="Lower rate" />
          </div>

          {/* Alerts */}
          {noBalance && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-destructive">No credits available</p>
                <p className="text-muted-foreground">Top up to send broadcasts and template messages.</p>
              </div>
            </div>
          )}
          {lowBalance && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-700 dark:text-amber-400">Low balance</p>
                <p className="text-muted-foreground">You have {balance} credits left. Top up to keep broadcasts running.</p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Top-up packages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Buy Credits
                </h4>
                <p className="text-[11px] text-muted-foreground">Instant top-up via Stripe</p>
              </div>
            </div>
            {pkgLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} onSelect={() => setPending(p)} />
                ))}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-muted-foreground" /> Recent Transactions
              </h4>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setHistoryOpen(true)}>
                  View all
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={exportCsv}>
                  <Download className="h-3 w-3" /> CSV
                </Button>
              </div>
            </div>
            {transactionsLoading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentTx.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-1">
                {recentTx.map((tx: any) => (
                  <TxRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && !confirming && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Confirm Purchase
            </DialogTitle>
            <DialogDescription>You'll be redirected to Stripe to complete payment.</DialogDescription>
          </DialogHeader>
          {pending && (
            <div className="space-y-3 py-2">
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Workspace</span>
                  <span className="text-sm font-medium">{currentTenant?.name}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Package</span>
                  <span className="text-sm font-medium">{pending.package_name}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Credits</span>
                  <span className="text-sm font-semibold">{pending.credits.toLocaleString()}</span>
                </div>
                <div className="border-t mt-3 pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">{fmtPrice(pending.price, pending.currency)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secured by Stripe. Credits added after payment confirms.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={confirming} onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button disabled={confirming} onClick={() => pending && startCheckout(pending)}>
              {confirming ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Redirecting…</> : 'Continue to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full history dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>All credit purchases, usage, refunds and adjustments</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-3">
            <div className="space-y-1">
              {(transactions || []).map((tx: any) => (
                <TxRow key={tx.id} tx={tx} expanded />
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={exportCsv} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatTile({
  label, value, tone, icon: Icon, className,
}: { label: string; value: number; tone: 'emerald' | 'blue' | 'rose'; icon: any; className?: string }) {
  const toneCls = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  }[tone];
  return (
    <div className={cn('rounded-xl border bg-card p-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={cn('h-6 w-6 grid place-items-center rounded-md', toneCls)}>
          <Icon className="h-3 w-3" />
        </span>
      </div>
      <p className="text-lg font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function PackageCard({ pkg, onSelect }: { pkg: CreditTopupPackage; onSelect: () => void }) {
  const isHighlight = pkg.recommended || pkg.best_value;
  // Estimated messages assuming 1 credit per message
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative text-left rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5',
        isHighlight ? 'border-primary/40 bg-gradient-to-br from-primary/8 to-transparent' : 'bg-card hover:border-primary/30',
      )}
    >
      {pkg.recommended && (
        <Badge className="absolute -top-2 right-3 text-[10px] gap-0.5">
          <Star className="h-2.5 w-2.5" /> Recommended
        </Badge>
      )}
      {pkg.best_value && !pkg.recommended && (
        <Badge variant="secondary" className="absolute -top-2 right-3 text-[10px] gap-0.5 bg-amber-500 text-white hover:bg-amber-500">
          <Crown className="h-2.5 w-2.5" /> Best Value
        </Badge>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{pkg.credits.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">credits</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{pkg.package_name}</p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-base font-semibold text-primary">{fmtPrice(pkg.price, pkg.currency)}</span>
        <span className="text-[10px] text-muted-foreground">
          ~{pkg.credits.toLocaleString()} msgs
        </span>
      </div>
      <div className="mt-3 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        Buy now <ArrowUpRight className="h-3 w-3" />
      </div>
    </button>
  );
}

function TxRow({ tx, expanded }: { tx: any; expanded?: boolean }) {
  const positive = tx.amount > 0;
  const status = tx.status || 'completed';
  const statusIcon =
    status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> :
    status === 'failed' ? <XCircle className="h-3 w-3 text-destructive" /> :
    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
  return (
    <div className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium truncate">{tx.description || tx.type}</p>
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 capitalize">{tx.type}</Badge>
          {expanded && statusIcon}
        </div>
        <p className="text-[10px] text-muted-foreground">
          {format(new Date(tx.created_at), 'MMM d, yyyy · HH:mm')}
          {expanded && tx.balance_after != null && ` · Balance: ${tx.balance_after}`}
        </p>
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', positive ? 'text-emerald-600' : 'text-rose-600')}>
        {positive ? '+' : ''}{tx.amount}
      </span>
    </div>
  );
}

