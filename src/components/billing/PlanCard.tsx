import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles } from 'lucide-react';
import type { Plan } from '@/types/billing';
import { cn } from '@/lib/utils';

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
  const isEnterprise = plan.name === 'Enterprise';
  const savings = isYearly && plan.price_yearly 
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)
    : 0;

  const limits = plan.limits_json;

  const formatLimit = (value: number, suffix = '') => {
    if (value === -1) return 'Unlimited';
    return value.toLocaleString() + suffix;
  };

  const features = [
    { label: 'Team members', value: formatLimit(limits.max_team_members) },
    { label: 'Phone numbers', value: formatLimit(limits.max_phone_numbers) },
    { label: 'Contacts', value: formatLimit(limits.max_contacts) },
    { label: 'Messages/month', value: formatLimit(limits.monthly_messages) },
    { label: 'Campaigns', value: formatLimit(limits.max_campaigns) },
    { label: 'Automations', value: formatLimit(limits.max_automations) },
    { label: 'API access', value: limits.api_access, isBool: true },
    { label: 'Audit log retention', value: `${limits.audit_logs_days} days` },
    { label: 'Support', value: limits.support_level.charAt(0).toUpperCase() + limits.support_level.slice(1) },
  ];

  return (
    <Card className={cn(
      "relative flex flex-col transition-all",
      isRecommended && "border-primary shadow-lg scale-[1.02]",
      isCurrentPlan && "border-green-500"
    )}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Sparkles className="h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="text-center mb-6">
          {isEnterprise ? (
            <div className="text-3xl font-bold">Custom</div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">${monthlyEquivalent}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              {isYearly && savings > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Save {savings}% yearly
                </Badge>
              )}
            </>
          )}
        </div>
        
        <div className="space-y-3 flex-1">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{feature.label}</span>
              {feature.isBool !== undefined ? (
                feature.value ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <span className="font-medium">{feature.value}</span>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full mt-6"
          variant={isCurrentPlan ? 'outline' : isRecommended ? 'default' : 'secondary'}
          disabled={isCurrentPlan}
          onClick={() => onSelect(plan)}
        >
          {isCurrentPlan ? 'Current Plan' : isEnterprise ? 'Contact Sales' : 'Upgrade'}
        </Button>
      </CardContent>
    </Card>
  );
}
