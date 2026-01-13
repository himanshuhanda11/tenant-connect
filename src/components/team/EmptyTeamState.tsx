import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyTeamStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tips?: string[];
}

export function EmptyTeamState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tips
}: EmptyTeamStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {tips && tips.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md text-left">
          <p className="text-sm font-medium mb-2">💡 Quick tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
