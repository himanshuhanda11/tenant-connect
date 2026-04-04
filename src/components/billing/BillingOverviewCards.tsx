import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Calendar,
  Users,
  Phone,
  TrendingUp,
  AlertTriangle,
  Building2,
  Crown,
  Rocket,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { useSubscription, useTeamUsage, usePhoneUsage, useUsage } from '@/hooks/useBilling';
import { useEntitlements } from '@/hooks/useEntitlements';
import { cn } from '@/lib/utils';

const planIcons: Record<string, React.ReactNode> = {
  Free: <Gift className="h-5 w-5" />,
  Basic: <Rocket className="h-5 w-5" />,
  Pro: <Crown className="h-5 w-5" />,
  Business: <Building2 className="h-5 w-5" />,
};

const planColors: Record<string, string> = {
  Free: 'from-slate-500/10 to-slate-400/5',
  Basic: 'from-blue-500/10 to-cyan-400/5',
  Pro: 'from-violet-500/10 to-purple-400/5',
  Business: 'from-amber-500/10 to-orange-400/5',
};

const planBadgeColors: Record<string, string> = {
  Free: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  Pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
};

export function BillingOverviewCards() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: teamUsage, isLoading: teamLoading } = useTeamUsage();
  const { data: phoneUsage, isLoading: phoneLoading } = usePhoneUsage();
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: entitlements } = useEntitlements();

  const isLoading = subLoading || teamLoading || phoneLoading || usageLoading;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const plan = subscription?.plan;
  const planName = plan?.name || 'Free';
  const isTopPlan = (entitlements?.plan_id ?? 'free') === 'business';
  const teamLimit = teamUsage?.limit === -1 ? '∞' : teamUsage?.limit || 0;
  const teamPercent = teamUsage && teamUsage.limit > 0 ? Math.round((teamUsage.used / teamUsage.limit) * 100) : 0;
  const phonePercent = phoneUsage && phoneUsage.limit > 0 ? Math.round((phoneUsage.used / phoneUsage.limit) * 100) : 0;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      {/* Current Plan */}
      <Card className="relative overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", planColors[planName])} />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Current Plan</CardTitle>
          <div className={cn("p-1.5 rounded-lg", planBadgeColors[planName])}>
            {planIcons[planName]}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{planName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" /> Active
            </Badge>
            {isTopPlan && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0">
                Top Tier
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Messages This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(usage?.messages_sent || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sent • {(usage?.messages_received || 0).toLocaleString()} received
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-muted-foreground">Pay-per-use via Meta</span>
          </div>
        </CardContent>
      </Card>

      {/* Team Seats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Team Seats</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{teamUsage?.used || 0}</span>
            <span className="text-sm text-muted-foreground">/ {teamLimit}</span>
          </div>
          {teamUsage && teamUsage.limit > 0 && (
            <Progress value={teamPercent} className="mt-2 h-1.5" />
          )}
          {teamPercent >= 80 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" /> Near limit
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Phone Numbers</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{phoneUsage?.used || 0}</span>
            <span className="text-sm text-muted-foreground">/ {phoneUsage?.limit || 0}</span>
          </div>
          {phoneUsage && phoneUsage.limit > 0 && (
            <Progress value={phonePercent} className="mt-2 h-1.5" />
          )}
          {phonePercent >= 100 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" /> Limit reached
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
