import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, BookOpen, ChevronRight, X
} from 'lucide-react';
import { useState } from 'react';

interface TeamGuideCardProps {
  title: string;
  description: string;
  tips: string[];
  learnMoreUrl?: string;
  dismissKey?: string;
}

export function TeamGuideCard({ 
  title, 
  description, 
  tips, 
  learnMoreUrl,
  dismissKey 
}: TeamGuideCardProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (dismissKey) {
      return localStorage.getItem(`team-guide-${dismissKey}`) === 'dismissed';
    }
    return false;
  });

  const handleDismiss = () => {
    if (dismissKey) {
      localStorage.setItem(`team-guide-${dismissKey}`, 'dismissed');
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
              {dismissKey && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 shrink-0"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {tips.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            {learnMoreUrl && (
              <Button variant="link" className="px-0 h-auto mt-3 text-primary" asChild>
                <a href={learnMoreUrl} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  Learn more
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 dark:text-amber-200">{children}</p>
    </div>
  );
}
