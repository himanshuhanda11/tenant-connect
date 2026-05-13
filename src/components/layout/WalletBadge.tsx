import { useNavigate } from 'react-router-dom';
import { Wallet, AlertTriangle } from 'lucide-react';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { cn } from '@/lib/utils';

const LOW = 50;

/**
 * Compact wallet pill for the dashboard topbar.
 * Click → /billing?tab=credits.
 * Hides when balance is unknown (no tenant yet).
 */
export function WalletBadge({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { balance, isLoading } = useMessageCredits();

  if (isLoading) return null;

  const isLow = balance < LOW;
  const isZero = balance === 0;

  return (
    <button
      type="button"
      onClick={() => navigate('/billing?tab=credits')}
      title={`${balance.toLocaleString()} message credits available`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all hover:shadow-sm active:scale-95',
        isZero
          ? 'bg-destructive/10 border-destructive/30 text-destructive'
          : isLow
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
            : 'bg-primary/10 border-primary/20 text-primary',
        className,
      )}
    >
      {isZero ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <Wallet className="h-3.5 w-3.5" />
      )}
      <span className="tabular-nums">{balance.toLocaleString()}</span>
      <span className="hidden sm:inline text-[10px] opacity-80 uppercase tracking-wide">credits</span>
    </button>
  );
}
