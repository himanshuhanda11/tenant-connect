import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, AlertTriangle, XCircle, Clock, CreditCard, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BillingStatusKind =
  | 'free' | 'trialing' | 'active' | 'past_due' | 'unpaid'
  | 'cancelled' | 'canceled' | 'incomplete' | 'incomplete_expired'
  | 'payment_failed' | 'upgrade_required';

export function BillingStatusBadge({
  status,
  planName,
  trialDaysLeft,
  className,
}: {
  status: BillingStatusKind;
  planName?: string;
  trialDaysLeft?: number;
  className?: string;
}) {
  const map: Record<string, { label: string; cls: string; icon: JSX.Element }> = {
    free: {
      label: 'Free Plan',
      cls: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
      icon: <Gift className="w-3 h-3" />,
    },
    trialing: {
      label: trialDaysLeft != null ? `Trial · ${trialDaysLeft}d left` : 'Trial Active',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      icon: <Sparkles className="w-3 h-3" />,
    },
    active: {
      label: planName ? `${planName} · Active` : 'Active',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    past_due: {
      label: 'Past Due',
      cls: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
      icon: <Clock className="w-3 h-3" />,
    },
    unpaid: {
      label: 'Unpaid',
      cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    payment_failed: {
      label: 'Payment Failed',
      cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
      icon: <CreditCard className="w-3 h-3" />,
    },
    cancelled: {
      label: 'Cancelled',
      cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <XCircle className="w-3 h-3" />,
    },
    canceled: {
      label: 'Cancelled',
      cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <XCircle className="w-3 h-3" />,
    },
    incomplete: {
      label: 'Incomplete',
      cls: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
      icon: <Clock className="w-3 h-3" />,
    },
    incomplete_expired: {
      label: 'Expired',
      cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
      icon: <XCircle className="w-3 h-3" />,
    },
    upgrade_required: {
      label: 'Upgrade Required',
      cls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
      icon: <Sparkles className="w-3 h-3" />,
    },
  };
  const meta = map[status] ?? map.active;
  return (
    <Badge className={cn('gap-1.5 border font-medium', meta.cls, className)}>
      {meta.icon}
      <span>{meta.label}</span>
    </Badge>
  );
}
