import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Users,
  Phone,
  Workflow,
  Send,
  FileText,
  Database,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useSubscription, useUsage, useTeamUsage, usePhoneUsage, useContactsUsage } from '@/hooks/useBilling';

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  formatValue?: (val: number) => string;
  color?: string;
}

function UsageItem({ icon, label, used, limit, formatValue, color = '' }: UsageItemProps) {
  const isUnlimited = limit === -1;
  const percent = isUnlimited ? 0 : limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const isWarning = percent >= 80 && percent < 100;
  const isDanger = percent >= 100;

  const displayUsed = formatValue ? formatValue(used) : used.toLocaleString();
  const displayLimit = isUnlimited ? '∞' : (formatValue ? formatValue(limit) : limit.toLocaleString());

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color || 'bg-muted'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold">{displayUsed}</span>
            <span className="text-[10px] text-muted-foreground">/ {displayLimit}</span>
            {isWarning && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-amber-600 border-amber-300">80%+</Badge>}
            {isDanger && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Full</Badge>}
          </div>
        </div>
        {!isUnlimited && limit > 0 && (
          <Progress
            value={percent}
            className={`h-1.5 ${isDanger ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-amber-500' : ''}`}
          />
        )}
        {isUnlimited && (
          <p className="text-[10px] text-muted-foreground">Unlimited on your plan</p>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function UsageOverview() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: teamUsage, isLoading: teamLoading } = useTeamUsage();
  const { data: phoneUsage, isLoading: phoneLoading } = usePhoneUsage();
  const { data: contactsUsage, isLoading: contactsLoading } = useContactsUsage();

  const isLoading = subLoading || usageLoading || teamLoading || phoneLoading || contactsLoading;
  const limits = subscription?.plan?.limits_json;

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Usage — {currentMonth}
            </CardTitle>
            <CardDescription>Real-time resource consumption against plan limits</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 hidden sm:flex">
            <TrendingUp className="h-3 w-3" /> Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <UsageItem
          icon={<MessageSquare className="h-4 w-4 text-emerald-600" />}
          label="Messages Sent"
          used={usage?.messages_sent || 0}
          limit={limits?.monthly_messages || -1}
          color="bg-emerald-500/15"
        />
        <UsageItem
          icon={<Users className="h-4 w-4 text-blue-600" />}
          label="Team Members"
          used={teamUsage?.used || 0}
          limit={teamUsage?.limit || 0}
          color="bg-blue-500/15"
        />
        <UsageItem
          icon={<Phone className="h-4 w-4 text-violet-600" />}
          label="Phone Numbers"
          used={phoneUsage?.used || 0}
          limit={phoneUsage?.limit || 0}
          color="bg-violet-500/15"
        />
        <UsageItem
          icon={<Database className="h-4 w-4 text-cyan-600" />}
          label="Contacts"
          used={contactsUsage?.used || 0}
          limit={contactsUsage?.limit || 0}
          color="bg-cyan-500/15"
        />
        <UsageItem
          icon={<Workflow className="h-4 w-4 text-amber-600" />}
          label="Automation Runs"
          used={usage?.automation_runs || 0}
          limit={limits?.max_automations === -1 ? -1 : (limits?.max_automations || 0) * 100}
          color="bg-amber-500/15"
        />
        <UsageItem
          icon={<Send className="h-4 w-4 text-pink-600" />}
          label="Campaigns"
          used={usage?.campaigns_created || 0}
          limit={limits?.max_campaigns || -1}
          color="bg-pink-500/15"
        />
        <UsageItem
          icon={<Zap className="h-4 w-4 text-orange-600" />}
          label="API Calls"
          used={usage?.api_calls || 0}
          limit={limits?.api_access ? 100000 : 0}
          color="bg-orange-500/15"
        />
        <UsageItem
          icon={<FileText className="h-4 w-4 text-indigo-600" />}
          label="Storage"
          used={usage?.storage_bytes || 0}
          limit={5368709120}
          formatValue={formatBytes}
          color="bg-indigo-500/15"
        />
      </CardContent>
    </Card>
  );
}
