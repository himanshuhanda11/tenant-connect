import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Rocket, Building2, ArrowRight, Sparkles, Users, Workflow, Bot, Phone, CreditCard, Loader2, Globe, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePlatformPlans, type PlatformPlan } from '@/hooks/useEntitlements';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { currentTenant } = useTenant();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [provider, setProvider] = useState<'razorpay' | 'stripe'>('razorpay');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const upgradePlans = (plans ?? []).filter(p => p.id !== 'free');
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleCheckout = async (plan: PlatformPlan) => {
    if (plan.is_custom) {
      toast.info('Contact sales for Business pricing');
      return;
    }

    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const res = await supabase.functions.invoke('billing-create-checkout', {
        body: {
          workspaceId: currentTenant.id,
          planId: plan.id,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          provider,
        },
      });

      if (res.error) {
        throw new Error(res.error.message || 'Failed to create checkout');
      }

      const data = res.data;

      if (provider === 'stripe' && data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else if (provider === 'razorpay' && data.razorpay_order_id) {
        // Open Razorpay modal
        openRazorpayCheckout(data, plan);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const openRazorpayCheckout = (data: any, plan: PlatformPlan) => {
    // Check if Razorpay script is loaded
    if (!(window as any).Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh and try again.');
      return;
    }

    const options = {
      key: data.razorpay_key,
      amount: data.amount * 100,
      currency: data.currency,
      name: 'Aireatro',
      description: `${plan.name} Plan - ${isYearly ? 'Yearly' : 'Monthly'}`,
      order_id: data.razorpay_order_id,
      handler: function (response: any) {
        toast.success('Payment successful! Your plan is being activated...');
        // Webhook will handle the rest
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 2000);
      },
      prefill: {
        email: '', // Will be filled from session
      },
      theme: {
        color: '#25D366',
      },
      modal: {
        ondismiss: function () {
          toast.info('Payment cancelled');
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
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

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-3">
            <span className={cn('text-sm', !isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-sm', isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>Yearly</span>
            {isYearly && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Save 20%</Badge>}
          </div>
        </div>

        {/* Provider selector */}
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Payment method</p>
          <RadioGroup value={provider} onValueChange={(v) => setProvider(v as any)} className="flex gap-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="razorpay" id="rp" />
              <Label htmlFor="rp" className="flex items-center gap-1.5 text-sm cursor-pointer">
                <IndianRupee className="w-3.5 h-3.5" />
                Razorpay (India)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="stripe" id="st" />
              <Label htmlFor="st" className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Globe className="w-3.5 h-3.5" />
                Stripe (International)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 sm:grid-cols-3 mt-2">
          {upgradePlans.map((plan) => {
            const isCurrent = currentPlanId === plan.id || currentPlanId === `plan_${plan.id}`;
            const price = isYearly ? Math.round(plan.price_monthly * 0.8) : plan.price_monthly;
            const isLoading = loading && selectedPlan === plan.id;

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
                  {plan.is_custom ? 'Custom' : formatINR(price)}
                  {!plan.is_custom && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                  {isYearly && !plan.is_custom && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      Billed {formatINR(price * 12)}/year
                    </p>
                  )}
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
                  disabled={isCurrent || isLoading}
                  onClick={() => handleCheckout(plan)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : plan.is_custom ? (
                    <>Talk to Sales</>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Upgrade via {provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
                    </>
                  )}
                  {!isCurrent && !isLoading && <ArrowRight className="w-3.5 h-3.5" />}
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
