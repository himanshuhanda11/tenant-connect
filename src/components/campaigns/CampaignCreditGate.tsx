import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { cn } from '@/lib/utils';

interface CampaignCreditGateProps {
  requiredCredits: number;
  className?: string;
}

/**
 * Shows wallet balance vs required credits for a broadcast.
 * Renders green (OK) or red (insufficient) with a top-up CTA.
 */
export function CampaignCreditGate({ requiredCredits, className }: CampaignCreditGateProps) {
  const navigate = useNavigate();
  const { balance, isLoading } = useMessageCredits();

  const sufficient = balance >= requiredCredits;
  const remaining = sufficient ? balance - requiredCredits : 0;
  const shortfall = sufficient ? 0 : requiredCredits - balance;

  return (
    <Card
      className={cn(
        sufficient
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
          : 'bg-destructive/5 border-destructive/30',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            'text-sm flex items-center gap-2',
            sufficient ? 'text-emerald-800 dark:text-emerald-300' : 'text-destructive',
          )}
        >
          {sufficient ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          Message Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Available" value={balance} loading={isLoading} />
          <Stat label="Required" value={requiredCredits} />
          <Stat
            label={sufficient ? 'Remaining' : 'Short by'}
            value={sufficient ? remaining : shortfall}
            tone={sufficient ? 'ok' : 'bad'}
          />
        </div>

        {!sufficient && (
          <div className="flex items-start gap-2 pt-1">
            <p className="text-xs text-destructive flex-1">
              You need <strong>{requiredCredits.toLocaleString()}</strong> credits to send this campaign,
              but your workspace only has <strong>{balance.toLocaleString()}</strong>.
              Top up <strong>{shortfall.toLocaleString()}</strong>+ credits to continue.
            </p>
            <Button
              size="sm"
              className="gap-1 flex-shrink-0"
              onClick={() => navigate('/billing?tab=credits')}
            >
              <Coins className="h-3.5 w-3.5" />
              Buy Credits
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {sufficient && (
          <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-300/60">
            Wallet has enough credits to send
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, loading, tone }: { label: string; value: number; loading?: boolean; tone?: 'ok' | 'bad' }) {
  return (
    <div className="rounded-lg bg-background/60 p-2.5 border">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-base font-bold tabular-nums',
          tone === 'bad' && 'text-destructive',
          tone === 'ok' && 'text-emerald-600',
        )}
      >
        {loading ? '…' : value.toLocaleString()}
      </p>
    </div>
  );
}
