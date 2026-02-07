import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Rocket, Gift, Building2, ArrowRight, Users, Phone, Bot, Workflow, MessageSquare, Contact } from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useSubscription, useUsage, useTeamUsage, usePhoneUsage, useContactsUsage } from '@/hooks/useBilling';
import { UpgradePlanDialog } from './UpgradePlanDialog';
import { cn } from '@/lib/utils';

const planMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  free: { icon: <Gift className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Free' },
  basic: { icon: <Rocket className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: 'Basic' },
  pro: { icon: <Crown className="w-4 h-4" />, color: 'bg-primary/10 text-primary', label: 'Pro' },
  business: { icon: <Building2 className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Business' },
};

function UsageBar({ icon, label, used, limit }: { icon: React.ReactNode; label: string; used: number; limit: number | string }) {
  const isUnlimited = limit === 'unlimited' || limit === -1;
  const numLimit = typeof limit === 'number' ? limit : 0;
  const pct = isUnlimited ? 0 : Math.min(Math.round((used / numLimit) * 100), 100);
  const isWarning = pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">{icon} {label}</span>
        <span className="font-medium">
          {used.toLocaleString()} / {isUnlimited ? '∞' : numLimit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={pct}
          className={cn('h-1.5', isWarning && '[&>div]:bg-amber-500')}
        />
      )}
    </div>
  );
}

export function WorkspacePlanCard() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { data: entitlements } = useEntitlements();
  const { data: subscription } = useSubscription();
  const { data: usage } = useUsage();
  const { data: teamUsage } = useTeamUsage();
  const { data: phoneUsage } = usePhoneUsage();
  const { data: contactsUsage } = useContactsUsage();

  const planId = entitlements?.plan_id ?? (subscription?.plan_id?.replace('plan_', '') ?? 'free');
  const meta = planMeta[planId] ?? planMeta.free;
  const limits = entitlements?.limits ?? subscription?.plan?.limits_json;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Workspace Plan
                <Badge className={cn('gap-1', meta.color)}>
                  {meta.icon}
                  {meta.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                Each workspace has its own plan and 1 WhatsApp number.
              </CardDescription>
            </div>
            <Button onClick={() => setUpgradeOpen(true)} className="gap-2">
              Upgrade <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar
            icon={<Users className="w-3.5 h-3.5" />}
            label="Team Members"
            used={teamUsage?.used ?? 0}
            limit={(limits as any)?.max_team_members ?? (limits as any)?.team_members ?? 1}
          />
          <UsageBar
            icon={<Contact className="w-3.5 h-3.5" />}
            label="Contacts"
            used={contactsUsage?.used ?? 0}
            limit={(limits as any)?.max_contacts ?? (limits as any)?.contacts ?? 1000}
          />
          <UsageBar
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Messages Sent"
            used={usage?.messages_sent ?? 0}
            limit={(limits as any)?.monthly_messages ?? 500}
          />
          <UsageBar
            icon={<Workflow className="w-3.5 h-3.5" />}
            label="Automations"
            used={usage?.automation_runs ?? 0}
            limit={(limits as any)?.max_automations ?? (limits as any)?.automations ?? 0}
          />
          <UsageBar
            icon={<Phone className="w-3.5 h-3.5" />}
            label="Phone Numbers"
            used={phoneUsage?.used ?? 0}
            limit={(limits as any)?.max_phone_numbers ?? (limits as any)?.phone_numbers ?? 1}
          />
        </CardContent>
      </Card>

      <UpgradePlanDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanId={planId}
      />
    </>
  );
}
