import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Coins, CreditCard, ChevronRight, Crown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardCredits from '@/assets/dashboard-credits.png';

interface CreditsBillingCardProps {
  creditsBalance: number;
  creditsCurrency?: string;
  planName?: string;
  billingDueDate?: string;
  billingAmount?: string;
  billingStatus?: 'paid' | 'due' | 'failed';
  loading?: boolean;
}

export function CreditsBillingCard({
  creditsBalance,
  creditsCurrency = '₹',
  planName = 'Free',
  billingDueDate,
  billingAmount,
  billingStatus = 'paid',
  loading,
}: CreditsBillingCardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    paid: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    due: { label: 'Due', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    failed: { label: 'Failed', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const sc = statusConfig[billingStatus];

  return (
    <Card className="border-0 shadow-soft bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Coins className="h-4 w-4 text-muted-foreground" />
          Credits & Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Credits Balance */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/10 flex items-center gap-4">
          <img 
            src={dashboardCredits} 
            alt="Credits" 
            className="h-16 w-16 object-contain flex-shrink-0"
            loading="lazy"
          />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Message Credits</p>
            <p className="text-3xl font-bold text-foreground">
              {creditsCurrency}{creditsBalance.toLocaleString()}
            </p>
            <Button
              size="sm"
              className="mt-2 h-8 text-xs font-semibold"
              onClick={() => navigate('/billing')}
            >
              Buy Credits
            </Button>
          </div>
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-violet-600" />
            <div>
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="text-sm font-bold text-foreground">{planName}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs font-semibold rounded-lg"
            onClick={() => navigate('/billing')}
          >
            Upgrade <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>

        {/* Billing Due */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-xs text-muted-foreground">Billing</p>
              {billingDueDate ? (
                <p className="text-sm font-semibold text-foreground">
                  {billingAmount} — Due {billingDueDate}
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">No dues</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] font-semibold", sc.color)}>
            {sc.label}
          </Badge>
        </div>

        {/* Pay Now link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => navigate('/billing')}
        >
          <span>View Billing</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
