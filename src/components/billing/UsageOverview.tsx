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
  Zap
} from 'lucide-react';
import { useSubscription, useUsage, useTeamUsage, usePhoneUsage, useContactsUsage } from '@/hooks/useBilling';

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  formatValue?: (val: number) => string;
}

function UsageItem({ icon, label, used, limit, formatValue }: UsageItemProps) {
  const isUnlimited = limit === -1;
  const percent = isUnlimited ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const isWarning = percent >= 80 && percent < 100;
  const isDanger = percent >= 100;

  const displayUsed = formatValue ? formatValue(used) : used.toLocaleString();
  const displayLimit = isUnlimited ? '∞' : (formatValue ? formatValue(limit) : limit.toLocaleString());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">{icon}</div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {displayUsed} / {displayLimit}
          </span>
          {isWarning && <Badge variant="outline" className="text-amber-600 border-amber-300">80%+</Badge>}
          {isDanger && <Badge variant="destructive">Limit</Badge>}
        </div>
      </div>
      {!isUnlimited && (
        <Progress 
          value={percent} 
          className={`h-2 ${isDanger ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-amber-500' : ''}`}
        />
      )}
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
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage This Month</CardTitle>
        <CardDescription>
          Your current usage against plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageItem
          icon={<MessageSquare className="h-4 w-4" />}
          label="Messages Sent"
          used={usage?.messages_sent || 0}
          limit={limits?.monthly_messages || 0}
        />
        
        <UsageItem
          icon={<Users className="h-4 w-4" />}
          label="Team Members"
          used={teamUsage?.used || 0}
          limit={teamUsage?.limit || 0}
        />
        
        <UsageItem
          icon={<Phone className="h-4 w-4" />}
          label="Phone Numbers"
          used={phoneUsage?.used || 0}
          limit={phoneUsage?.limit || 0}
        />
        
        <UsageItem
          icon={<Database className="h-4 w-4" />}
          label="Contacts"
          used={contactsUsage?.used || 0}
          limit={contactsUsage?.limit || 0}
        />
        
        <UsageItem
          icon={<Workflow className="h-4 w-4" />}
          label="Automation Runs"
          used={usage?.automation_runs || 0}
          limit={limits?.max_automations === -1 ? -1 : (limits?.max_automations || 0) * 100}
        />
        
        <UsageItem
          icon={<Send className="h-4 w-4" />}
          label="Campaigns Created"
          used={usage?.campaigns_created || 0}
          limit={limits?.max_campaigns || 0}
        />
        
        <UsageItem
          icon={<Zap className="h-4 w-4" />}
          label="API Calls"
          used={usage?.api_calls || 0}
          limit={limits?.api_access ? 100000 : 0}
        />
        
        <UsageItem
          icon={<FileText className="h-4 w-4" />}
          label="Storage Used"
          used={usage?.storage_bytes || 0}
          limit={5368709120}
          formatValue={formatBytes}
        />
      </CardContent>
    </Card>
  );
}
