import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  RefreshCw,
  MessageSquare,
  Users,
  Inbox,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightsSummaryProps {
  metrics?: {
    leadVerify?: number;
    contacts?: number;
    openedMessages?: number;
  };
  loading?: boolean;
}

const summaryItems = [
  {
    id: 'lead-verify',
    label: 'Lead Verify',
    subtext: 'Message',
    icon: MessageSquare,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    count: 1,
  },
  {
    id: 'contacts',
    label: '1.Contacts',
    subtext: undefined,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    count: 6,
  },
  {
    id: 'outlook',
    label: 'Outlook',
    subtext: '○ Homics uge',
    icon: Inbox,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    count: undefined,
  },
  {
    id: 'opened-messages',
    label: 'Opeened messages',
    subtext: undefined,
    icon: Eye,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    count: undefined,
  },
];

export function AIInsightsSummary({ metrics, loading }: AIInsightsSummaryProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
              <p className="text-xs text-muted-foreground">
                9 message paid streamline ◯
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate('/inbox')}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.bgColor)}>
                  <Icon className={cn("w-4 h-4", item.color)} />
                </div>
                <div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.subtext && (
                    <p className="text-xs text-muted-foreground">{item.subtext}</p>
                  )}
                </div>
              </div>
              {item.count !== undefined && (
                <span className="text-sm font-medium text-muted-foreground">{item.count}</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
