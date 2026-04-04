import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Users, Phone, Contact, MessageSquare, Bot, Workflow, ArrowRight, Crown, Rocket, Gift, Building2, Shield, Zap, Globe, HeadphonesIcon } from 'lucide-react';
import type { Plan } from '@/types/billing';
import { cn } from '@/lib/utils';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';

const planThemes: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  accentBorder: string;
  buttonGradient: string;
  glowColor: string;
}> = {
  Free: {
    icon: <Gift className="w-6 h-6" />,
    gradient: 'from-slate-500/10 via-slate-400/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300',
    accentBorder: 'border-slate-200 dark:border-slate-700',
    buttonGradient: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
    glowColor: 'shadow-slate-200/50',
  },
  Basic: {
    icon: <Rocket className="w-6 h-6" />,
    gradient: 'from-blue-500/10 via-cyan-400/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/60 dark:to-cyan-900/40 text-blue-600 dark:text-blue-300',
    accentBorder: 'border-blue-200 dark:border-blue-800',
    buttonGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/25',
    glowColor: 'shadow-blue-300/30',
  },
  Pro: {
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-violet-500/10 via-purple-400/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/60 dark:to-purple-900/40 text-violet-600 dark:text-violet-300',
    accentBorder: 'border-violet-200 dark:border-violet-800',
    buttonGradient: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-violet-500/25',
    glowColor: 'shadow-violet-300/30',
  },
  Business: {
    icon: <Building2 className="w-6 h-6" />,
    gradient: 'from-amber-500/10 via-orange-400/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/40 text-amber-600 dark:text-amber-300',
    accentBorder: 'border-amber-200 dark:border-amber-800',
    buttonGradient: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25',
    glowColor: 'shadow-amber-300/30',
  },
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
  const isFree = plan.name === 'Free';
  const isCustomPrice = false; // Business now has a real price
  const savings = isYearly && plan.price_yearly
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)
    : 0;

  const theme = planThemes[plan.name] || planThemes.Free;
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const limits = plan.limits_json;
  const formatLimit = (value: number) => value === -1 ? 'Unlimited' : value.toLocaleString();

  const features = [
    { icon: Users, label: 'Team Members', value: limits.max_team_members === 1 ? '1 (Admin only)' : formatLimit(limits.max_team_members) },
    { icon: Contact, label: 'Contacts', value: formatLimit(limits.max_contacts) },
    { icon: MessageSquare, label: 'Campaigns/mo', value: plan.name === 'Free' ? '2' : plan.name === 'Starter' ? '10' : plan.name === 'Growth' ? '30' : 'Unlimited' },
    { icon: Workflow, label: 'Automations', value: formatLimit(limits.max_automations) },
    { icon: Shield, label: 'Audit Logs', value: limits.audit_logs_days > 0 ? `${limits.audit_logs_days} days` : '—' },
    { icon: Zap, label: 'API Access', value: limits.api_access ? 'Yes' : '—' },
    { icon: HeadphonesIcon, label: 'Support', value: limits.support_level === 'priority' ? 'Priority' : limits.support_level === 'chat' ? 'Live Chat' : 'Email' },
  ];

  return (
    <Card className={cn(
      "relative flex flex-col overflow-hidden transition-all duration-300 group hover:shadow-xl",
      theme.accentBorder,
      isRecommended && "ring-2 ring-violet-500/50 shadow-xl scale-[1.02]",
      isCurrentPlan && "ring-2 ring-primary/40 shadow-lg",
      theme.glowColor,
    )}>
      {/* Top gradient accent */}
      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-60", theme.gradient)} />
      
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
      )}
      {isCurrentPlan && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
      )}

      <div className="relative p-4 sm:p-5 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-center justify-between mb-3 min-h-[24px]">
          {isRecommended && (
            <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 gap-1 text-[10px] px-2 py-0.5 shadow-lg">
              <Sparkles className="h-3 w-3" /> Most Popular
            </Badge>
          )}
          {isCurrentPlan && !isRecommended && (
            <Badge className="bg-gradient-to-r from-primary to-emerald-400 text-white border-0 text-[10px] px-2 py-0.5">
              ✓ Active
            </Badge>
          )}
          {!isRecommended && !isCurrentPlan && <div />}
        </div>

        {/* Icon + Name */}
        <div className="text-center mb-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
            theme.iconBg
          )}>
            {theme.icon}
          </div>
          <h3 className="text-lg font-bold">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-5 pb-4 border-b border-border/50">
          {isCustomPrice ? (
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Custom Pricing</div>
              <p className="text-xs text-muted-foreground mt-1">Tailored to your business needs</p>
            </div>
          ) : price === 0 ? (
            <div>
              <div className="text-3xl font-bold">Free</div>
              <p className="text-xs text-muted-foreground mt-1">Forever free • No credit card</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">{formatINR(monthlyEquivalent)}</span>
                <span className="text-muted-foreground text-xs">/mo</span>
              </div>
              {isYearly && savings > 0 && (
                <Badge variant="secondary" className="mt-2 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                  Save {savings}% yearly
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Template Message Charges */}
        <TemplateChargesBlock compact className="mb-4" />

        {/* Features list */}
        <div className="space-y-2.5 flex-1 mb-4">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                <feat.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground flex-1">{feat.label}</span>
              <span className="text-xs font-semibold">{feat.value}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full font-semibold text-sm gap-2 transition-all",
            isCurrentPlan
              ? "bg-muted text-muted-foreground cursor-default"
              : theme.buttonGradient
          )}
          variant={isCurrentPlan ? 'outline' : 'default'}
          disabled={isCurrentPlan}
          onClick={() => onSelect(plan)}
        >
          {isCurrentPlan ? '✓ Current Plan' : isCustomPrice ? 'Contact Sales' : 'Upgrade'}
          {!isCurrentPlan && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </Card>
  );
}