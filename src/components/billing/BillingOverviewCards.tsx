import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Phone, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useSubscription, useTeamUsage, usePhoneUsage, useUsage } from '@/hooks/useBilling';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';

export function BillingOverviewCards() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: teamUsage, isLoading: teamLoading } = useTeamUsage();
  const { data: phoneUsage, isLoading: phoneLoading } = usePhoneUsage();
  const { data: usage, isLoading: usageLoading } = useUsage();

  const isLoading = subLoading || teamLoading || phoneLoading || usageLoading;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const plan = subscription?.plan;
  const daysUntilRenewal = subscription?.current_period_end 
    ? differenceInDays(new Date(subscription.current_period_end), new Date())
    : 0;

  const messageLimit = plan?.limits_json.monthly_messages || 0;
  const messageUsed = usage?.messages_sent || 0;
  const messagePercent = messageLimit > 0 ? Math.round((messageUsed / messageLimit) * 100) : 0;

  const teamPercent = teamUsage ? Math.round((teamUsage.used / teamUsage.limit) * 100) : 0;
  const phonePercent = phoneUsage ? Math.round((phoneUsage.used / phoneUsage.limit) * 100) : 0;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      {/* Current Plan */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Plan
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{plan?.name || 'Free'}</span>
            <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
              {subscription?.status || 'Active'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₹{(plan?.price_monthly || 0).toLocaleString('en-IN')}/month • {subscription?.billing_cycle || 'monthly'}
          </p>
          <Button variant="link" className="px-0 mt-2 h-auto" asChild>
            <Link to="/billing/plans">
              Upgrade Plan <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Next Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Next Invoice
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{(plan?.price_monthly || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {subscription?.current_period_end 
              ? format(new Date(subscription.current_period_end), 'MMM d, yyyy')
              : 'N/A'
            }
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">{daysUntilRenewal} days until renewal</span>
          </div>
        </CardContent>
      </Card>

      {/* Team Seats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Team Seats
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{teamUsage?.used || 0}</span>
            <span className="text-muted-foreground">/ {teamUsage?.limit || 0}</span>
          </div>
          <Progress 
            value={teamPercent} 
            className="mt-2 h-2" 
          />
          {teamPercent >= 80 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Approaching limit</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Phone Numbers
          </CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{phoneUsage?.used || 0}</span>
            <span className="text-muted-foreground">/ {phoneUsage?.limit || 0}</span>
          </div>
          <Progress 
            value={phonePercent} 
            className="mt-2 h-2" 
          />
          {phonePercent >= 100 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Limit reached</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
