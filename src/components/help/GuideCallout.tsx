import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Lightbulb, Info, CheckCircle, XCircle } from 'lucide-react';

interface GuideCalloutProps {
  type: 'tip' | 'warning' | 'info' | 'success' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
}

const calloutStyles = {
  tip: {
    bg: 'bg-primary/5 border-primary/20',
    icon: Lightbulb,
    iconColor: 'text-primary',
    titleColor: 'text-primary',
  },
  warning: {
    bg: 'bg-warning/5 border-warning/20',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    titleColor: 'text-warning',
  },
  info: {
    bg: 'bg-info/5 border-info/20',
    icon: Info,
    iconColor: 'text-info',
    titleColor: 'text-info',
  },
  success: {
    bg: 'bg-success/5 border-success/20',
    icon: CheckCircle,
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
  error: {
    bg: 'bg-destructive/5 border-destructive/20',
    icon: XCircle,
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
};

export function GuideCallout({ type, title, children, className }: GuideCalloutProps) {
  const style = calloutStyles[type];
  const Icon = style.icon;

  return (
    <div className={cn('rounded-lg border p-4', style.bg, className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', style.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('font-semibold mb-1', style.titleColor)}>{title}</p>
          )}
          <div className="text-sm text-foreground/80">{children}</div>
        </div>
      </div>
    </div>
  );
}
