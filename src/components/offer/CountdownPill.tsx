import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCountdown } from '@/hooks/useLaunchOffer';

interface Props {
  secondsLeft: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean;
}

export function CountdownPill({ secondsLeft, size = 'md', className, light = false }: Props) {
  const sizeCls =
    size === 'lg'
      ? 'text-base px-4 py-2 gap-2'
      : size === 'sm'
        ? 'text-[11px] px-2 py-0.5 gap-1'
        : 'text-xs px-3 py-1 gap-1.5';

  const { h, m, s, isCritical } = formatCountdown(secondsLeft);
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-mono font-semibold tabular-nums',
        'border backdrop-blur-md transition-colors',
        isCritical
          ? light
            ? 'border-red-400/60 bg-red-50 text-red-600 animate-pulse'
            : 'border-red-500/60 bg-red-500/10 text-red-300 animate-pulse'
          : light
            ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
            : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
        sizeCls,
        className,
      )}
    >
      <Clock className={cn(size === 'lg' ? 'w-4 h-4' : 'w-3 h-3')} />
      <span>
        {String(h).padStart(2, '0')}
        <span className="opacity-60">h </span>
        {String(m).padStart(2, '0')}
        <span className="opacity-60">m </span>
        {String(s).padStart(2, '0')}
        <span className="opacity-60">s</span>
      </span>
    </div>
  );
}

