import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface GuideBannerProps {
  title: string;
  description: string;
  guideUrl: string;
  className?: string;
  dismissible?: boolean;
  variant?: 'default' | 'compact';
}

export function GuideBanner({
  title,
  description,
  guideUrl,
  className,
  dismissible = true,
  variant = 'default',
}: GuideBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg', className)}>
        <BookOpen className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm flex-1">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground"> – {description}</span>
        </p>
        <Link 
          to={guideUrl}
          className="text-sm text-primary font-medium hover:underline shrink-0"
        >
          Learn more
        </Link>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl', className)}>
      {dismissible && (
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button variant="default" size="sm" asChild>
            <Link to={guideUrl} className="gap-2">
              View Guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
