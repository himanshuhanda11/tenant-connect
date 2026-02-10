import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone,
  ChevronRight,
  Signal,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import type { PhoneNumberHealth } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface PhoneHealthPanelProps {
  phones: PhoneNumberHealth[];
  loading?: boolean;
}

const qualityConfig: Record<string, { color: string; label: string }> = {
  green: { color: 'text-green-600 bg-green-500/10', label: 'High' },
  yellow: { color: 'text-amber-600 bg-amber-500/10', label: 'Medium' },
  red: { color: 'text-red-600 bg-red-500/10', label: 'Low' },
  unknown: { color: 'text-muted-foreground bg-muted', label: 'Unknown' },
};

const webhookConfig: Record<string, { icon: React.ElementType; color: string }> = {
  healthy: { icon: Wifi, color: 'text-green-600' },
  degraded: { icon: Wifi, color: 'text-amber-600' },
  down: { icon: WifiOff, color: 'text-red-600' },
  unknown: { icon: Wifi, color: 'text-muted-foreground' },
};

export function PhoneHealthPanel({ phones, loading }: PhoneHealthPanelProps) {
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

  const needsAction = phones.filter(p => p.needsAction);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Phone Numbers Health
            {needsAction.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {needsAction.length} needs action
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/phone-numbers')}>
            Manage <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {phones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No phone numbers connected</p>
            <Button variant="link" size="sm" onClick={() => navigate('/phone-numbers')}>
              Connect a number
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {phones.map((phone) => {
              const quality = qualityConfig[phone.qualityRating] || qualityConfig.unknown;
              const webhook = webhookConfig[phone.webhookHealth] || webhookConfig.unknown;
              const WebhookIcon = webhook.icon;

              return (
                <div
                  key={phone.id}
                  onClick={() => navigate(`/phone-numbers/${phone.id}`)}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer",
                    phone.needsAction
                      ? "border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                      : "hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate font-mono">{phone.phoneNumber || phone.displayName}</p>
                      {phone.phoneNumber && phone.displayName && phone.displayName !== phone.phoneNumber && (
                        <p className="text-xs text-muted-foreground">{phone.displayName}</p>
                      )}
                    </div>
                    {phone.needsAction && (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={quality.color}>
                      <Signal className="w-3 h-3 mr-1" />
                      {quality.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {phone.messagingLimit}
                    </Badge>
                    <WebhookIcon className={cn("w-4 h-4", webhook.color)} />
                  </div>

                  {phone.actionReason && (
                    <p className="text-xs text-red-600 mt-2">{phone.actionReason}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
