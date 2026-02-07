import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Users, Phone, Contact, MessageSquare, Bot, Workflow, Brain, ArrowRight, Crown, Rocket, Gift, Building2 } from 'lucide-react';
import type { Plan } from '@/types/billing';
import { cn } from '@/lib/utils';

const planIcons: Record<string, React.ReactNode> = {
  Free: <Gift className="w-5 h-5" />,
  Basic: <Rocket className="w-5 h-5" />,
  Pro: <Crown className="w-5 h-5" />,
  Business: <Building2 className="w-5 h-5" />,
};

const planAccent: Record<string, string> = {
  Free: 'bg-slate-100 text-slate-600',
  Basic: 'bg-blue-100 text-blue-600',
  Pro: 'bg-primary/10 text-primary',
  Business: 'bg-amber-100 text-amber-600',
};

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isYearly: boolean;
  isRecommended?: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrentPlan, isYearly, isRecommended, onSelect }: PlanCardProps) {
  const price = isYearly ? (plan.price_yearly || plan.price_monthly * 12) : plan.price_monthly;
  const monthlyEquivalent = isYearly ? Math.round(price / 12) : price;
  const isBusiness = plan.name === 'Business';
  const isCustomPrice = isBusiness && plan.price_monthly === 0;
  const savings = isYearly && plan.price_yearly 
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)
    : 0;

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const limits = plan.limits_json;
  const formatLimit = (value: number) => value === -1 ? 'Unlimited' : value.toLocaleString();

  const limitItems = [
    { icon: Users, label: 'Members', value: formatLimit(limits.max_team_members) },
    { icon: Contact, label: 'Contacts', value: formatLimit(limits.max_contacts) },
    { icon: MessageSquare, label: 'Messages', value: formatLimit(limits.monthly_messages) },
    { icon: Bot, label: 'Automations', value: formatLimit(limits.max_automations) },
  ];

  return (
    <Card className={cn(
      "relative flex flex-col transition-all duration-300",
      isRecommended && "border-primary shadow-xl shadow-primary/10 scale-[1.02] ring-1 ring-primary/20",
      isCurrentPlan && "border-primary/50 bg-primary/[0.02]"
    )}>
      {isRecommended && (
        <>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground gap-1 shadow-lg">
              <Sparkles className="h-3 w-3" />
              Recommended
            </Badge>
          </div>
        </>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2 px-3 sm:px-6">
        <div className={cn('w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center', planAccent[plan.name] || 'bg-muted')}>
          {planIcons[plan.name] || <Gift className="w-5 h-5" />}
        </div>
        <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-3 sm:px-6">
        <div className="text-center mb-4 sm:mb-5">
          {isCustomPrice ? (
            <div className="text-2xl sm:text-3xl font-bold">Custom</div>
          ) : price === 0 ? (
            <div className="text-3xl sm:text-4xl font-bold">Free</div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-bold">{formatINR(monthlyEquivalent)}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              {isYearly && savings > 0 && (
                <Badge variant="secondary" className="mt-2 text-xs bg-primary/10 text-primary">
                  Save {savings}% yearly
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-muted/40 border border-border/50">
          {limitItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-xs font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 flex-1">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">API access</span>
            {limits.api_access ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/40" />}
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Audit logs</span>
            <span className="font-medium">{limits.audit_logs_days > 0 ? `${limits.audit_logs_days}d` : '—'}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Support</span>
            <span className="font-medium capitalize">{limits.support_level}</span>
          </div>
        </div>
        
        <Button 
          className={cn(
            "w-full mt-4 sm:mt-6 text-sm gap-2 font-semibold",
            isRecommended && !isCurrentPlan && "bg-gradient-to-r from-primary to-emerald-500 shadow-lg"
          )}
          variant={isCurrentPlan ? 'outline' : isRecommended ? 'default' : 'secondary'}
          disabled={isCurrentPlan}
          onClick={() => onSelect(plan)}
        >
          {isCurrentPlan ? 'Current Plan' : isCustomPrice ? 'Talk to Sales' : 'Upgrade'}
          {!isCurrentPlan && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      </CardContent>
    </Card>
  );
}
