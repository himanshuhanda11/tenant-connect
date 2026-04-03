import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlanLabel } from '@/hooks/usePlanGate';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  currentPlan: string;
  requiredPlan: string;
  feature: string;
  description?: string;
  onUpgrade: () => void;
  className?: string;
}

/**
 * A prominent upgrade prompt card shown when a feature requires a higher plan.
 */
export function UpgradePrompt({
  currentPlan,
  requiredPlan,
  feature,
  description,
  onUpgrade,
  className,
}: UpgradePromptProps) {
  const requiredLabel = getPlanLabel(requiredPlan);
  const currentLabel = getPlanLabel(currentPlan);

  // If already on the highest plan (business), don't show upgrade prompt
  if (currentPlan === 'business') return null;

  return (
    <Card className={cn(
      'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]',
      className,
    )}>
      <CardContent className="flex flex-col items-center text-center py-8 px-6 gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {feature} requires {requiredLabel} plan
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {description || `Your current ${currentLabel} plan doesn't include ${feature.toLowerCase()}. Upgrade to ${requiredLabel} or higher to unlock this feature.`}
          </p>
        </div>
        <Button onClick={onUpgrade} className="gap-2 mt-2">
          <Sparkles className="w-4 h-4" />
          Upgrade to {requiredLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
