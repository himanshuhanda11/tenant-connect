import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Info, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WABAStatusCardProps {
  isConnected: boolean;
  qualityRating: 'green' | 'yellow' | 'red' | 'unknown';
  remainingQuota: number;
  phoneNumber?: string;
  businessName?: string;
  loading?: boolean;
  onConnect?: () => void;
}

export function WABAStatusCard({
  isConnected,
  qualityRating,
  remainingQuota,
  phoneNumber,
  businessName,
  loading,
  onConnect,
}: WABAStatusCardProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-soft bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualityConfig = {
    green: { label: 'High', color: 'bg-success text-success-foreground', textColor: 'text-success' },
    yellow: { label: 'Medium', color: 'bg-warning text-warning-foreground', textColor: 'text-warning' },
    red: { label: 'Low', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' },
    unknown: { label: 'Unknown', color: 'bg-muted text-muted-foreground', textColor: 'text-muted-foreground' },
  };

  return (
    <Card className="border-0 shadow-soft bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Connection Status */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground font-medium">WhatsApp Business API Status</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Connection status with Meta WhatsApp Business API</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {isConnected ? (
              <div>
                <Badge className="bg-success text-success-foreground hover:bg-success/90 font-semibold px-3 py-1 text-sm">
                  <Wifi className="h-3.5 w-3.5 mr-1.5" />
                  LIVE
                </Badge>
                {phoneNumber && (
                  <p className="text-sm font-mono font-medium mt-2">{phoneNumber}</p>
                )}
                {businessName && (
                  <p className="text-xs text-muted-foreground mt-1">{businessName}</p>
                )}
                <Button size="sm" variant="ghost" onClick={onConnect} className="text-xs mt-2 text-muted-foreground">
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-warning text-warning font-semibold px-3 py-1 text-sm">
                  <WifiOff className="h-3.5 w-3.5 mr-1.5" />
                  PENDING
                </Badge>
                <Button size="sm" variant="outline" onClick={onConnect} className="text-xs">
                  Connect Now
                </Button>
              </div>
            )}
          </div>

          {/* Quality Rating */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground font-medium">Quality Rating</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meta's quality assessment of your messaging</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge className={cn("font-semibold px-3 py-1 text-sm", qualityConfig[qualityRating].color)}>
              {qualityConfig[qualityRating].label}
            </Badge>
            {qualityRating === 'red' && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Review your messaging quality
              </p>
            )}
          </div>

          {/* Remaining Quota */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground font-medium">Remaining Quota</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Messages you can send in the current tier</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-primary">
              {remainingQuota.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
