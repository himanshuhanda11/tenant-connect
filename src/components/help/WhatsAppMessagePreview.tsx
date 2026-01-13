import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface WhatsAppMessagePreviewProps {
  message: string;
  sender?: 'business' | 'customer';
  time?: string;
  status?: 'sent' | 'delivered' | 'read';
  isTemplate?: boolean;
  header?: string;
  footer?: string;
  buttons?: string[];
  className?: string;
}

export function WhatsAppMessagePreview({
  message,
  sender = 'business',
  time = '10:30 AM',
  status = 'delivered',
  isTemplate = false,
  header,
  footer,
  buttons,
  className,
}: WhatsAppMessagePreviewProps) {
  const isBusiness = sender === 'business';

  return (
    <div
      className={cn(
        'max-w-[320px] rounded-lg shadow-sm',
        isBusiness
          ? 'bg-primary/10 ml-auto rounded-tr-none'
          : 'bg-muted rounded-tl-none',
        className
      )}
    >
      <div className="p-3">
        {header && (
          <p className="font-semibold text-sm mb-2">{header}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message}</p>
        {footer && (
          <p className="text-xs text-muted-foreground mt-2">{footer}</p>
        )}
      </div>
      
      {buttons && buttons.length > 0 && (
        <div className="border-t border-border/50">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className="w-full p-2 text-sm text-primary font-medium text-center hover:bg-primary/5 transition-colors border-b border-border/50 last:border-b-0"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 pb-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>{time}</span>
        {isBusiness && (
          status === 'read' ? (
            <CheckCheck className="h-3.5 w-3.5 text-info" />
          ) : status === 'delivered' ? (
            <CheckCheck className="h-3.5 w-3.5" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )
        )}
      </div>
    </div>
  );
}
