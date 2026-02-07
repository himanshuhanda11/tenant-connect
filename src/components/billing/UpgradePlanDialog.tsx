import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Rocket, Building2, ArrowRight, Sparkles, Users, Workflow, Bot, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePlatformPlans, type PlatformPlan } from '@/hooks/useEntitlements';

const planIcons: Record<string, React.ReactNode> = {
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

const planColors: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-600',
  pro: 'bg-primary/10 text-primary',
  business: 'bg-amber-100 text-amber-600',
};

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPlanId?: string;
}

export function UpgradePlanDialog({ open, onOpenChange, currentPlanId }: UpgradePlanDialogProps) {
  const { data: plans } = usePlatformPlans();
  const upgradePlans = (plans ?? []).filter(p => p.id !== 'free');

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleSelect = (plan: PlatformPlan) => {
    if (plan.is_custom) {
      toast.info('Contact sales for Business pricing');
    } else {
      toast.info('Payment integration pending — upgrade will be available soon');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Upgrade Workspace Plan
          </DialogTitle>
          <DialogDescription>
            Plan applies to this workspace only. Includes 1 WhatsApp phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          {upgradePlans.map((plan) => {
            const isCurrent = currentPlanId === plan.id || currentPlanId === `plan_${plan.id}`;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-xl border p-4 flex flex-col gap-3 transition-all',
                  plan.highlight ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' : 'border-border',
                  isCurrent && 'border-primary/50 bg-primary/[0.02]'
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-[10px] gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {plan.badge}
                  </Badge>
                )}

                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', planColors[plan.id] || 'bg-muted')}>
                  {planIcons[plan.id]}
                </div>

                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="text-2xl font-bold">
                  {plan.is_custom ? 'Custom' : formatINR(plan.price_monthly)}
                  {!plan.is_custom && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {plan.limits.team_members} members</span>
                  <span className="flex items-center gap-1"><Workflow className="w-3 h-3" /> {plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows} flows</span>
                  <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations} automations</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 1 number</span>
                </div>

                <Button
                  className={cn(
                    'w-full mt-auto gap-2 text-sm',
                    plan.highlight && !isCurrent && 'bg-gradient-to-r from-primary to-emerald-500 shadow-lg'
                  )}
                  variant={isCurrent ? 'outline' : plan.highlight ? 'default' : 'secondary'}
                  disabled={isCurrent}
                  onClick={() => handleSelect(plan)}
                >
                  {isCurrent ? 'Current Plan' : plan.is_custom ? 'Talk to Sales' : 'Upgrade'}
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Add-ons (extra team seats, flows, AI credits) can be added after upgrading.
        </p>
      </DialogContent>
    </Dialog>
  );
}
