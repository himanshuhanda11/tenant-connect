import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CreditCard,
  ChevronRight,
  Users,
  Phone,
  Send,
  Bot,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import type { BillingUsage } from '@/types/dashboard';

interface BillingPanelProps {
  data: BillingUsage | null;
  loading?: boolean;
}

interface UsageBarProps {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
  unit?: string;
}

function UsageBar({ label, icon: Icon, used, limit, unit = '' }: UsageBarProps) {
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const isWarning = percent > 80;
  const isDanger = percent > 95;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span>{label}</span>
        </div>
        <span className={isDanger ? 'text-red-600 font-medium' : isWarning ? 'text-amber-600' : ''}>
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        className={`h-2 ${isDanger ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-amber-500' : ''}`}
      />
    </div>
  );
}

export function BillingPanel({ data, loading }: BillingPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Billing & Usage
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{data?.planName || 'Free'}</Badge>
            <Button variant="ghost" size="sm" onClick={() => navigate('/billing')}>
              Manage <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment issue alert */}
        {data?.hasPaymentIssue && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Issue</AlertTitle>
            <AlertDescription>
              {data.paymentIssueMessage || 'There is an issue with your payment method.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Usage bars */}
        <div className="space-y-3">
          <UsageBar
            label="Team Seats"
            icon={Users}
            used={data?.seatsUsed || 0}
            limit={data?.seatsLimit || 1}
          />
          <UsageBar
            label="Phone Numbers"
            icon={Phone}
            used={data?.numbersUsed || 0}
            limit={data?.numbersLimit || 1}
          />
          <UsageBar
            label="Campaign Sends"
            icon={Send}
            used={data?.campaignSends || 0}
            limit={data?.campaignLimit || 1000}
          />
          <UsageBar
            label="Automation Runs"
            icon={Bot}
            used={data?.automationRuns || 0}
            limit={data?.automationLimit || 1000}
          />
          <UsageBar
            label="Storage"
            icon={HardDrive}
            used={data?.storageUsedMB || 0}
            limit={data?.storageLimitMB || 1000}
            unit=" MB"
          />
        </div>
      </CardContent>
    </Card>
  );
}
