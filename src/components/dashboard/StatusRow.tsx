import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Wifi,
  WifiOff,
  Shield,
  Coins,
  CreditCard,
  Crown,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusRowProps {
  isWABAConnected: boolean;
  qualityRating: 'green' | 'yellow' | 'red' | 'unknown';
  creditsBalance?: number;
  creditsCurrency?: string;
  billingDueDate?: string;
  billingAmount?: string;
  planName?: string;
  addOns?: string[];
  loading?: boolean;
  onConnect?: () => void;
}

export function StatusRow({
  isWABAConnected,
  qualityRating,
  creditsBalance = 0,
  creditsCurrency = '₹',
  billingDueDate,
  billingAmount,
  planName = 'Free',
  addOns = [],
  loading,
  onConnect,
}: StatusRowProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const qualityConfig = {
    green: { label: 'Green', color: 'text-emerald-600', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    yellow: { label: 'Yellow', color: 'text-amber-600', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
    red: { label: 'Red', color: 'text-destructive', bg: 'bg-destructive/10', dot: 'bg-destructive' },
    unknown: { label: 'N/A', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
  };

  const qc = qualityConfig[qualityRating];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* WhatsApp API Status */}
      <Card className="border-0 shadow-card hover:shadow-soft transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {isWABAConnected ? (
              <Wifi className="h-4 w-4 text-emerald-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground font-medium">WhatsApp API</span>
          </div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 hover:bg-emerald-500/15 font-semibold">
              LIVE
            </Badge>
          ) : (
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 font-semibold w-fit">
                DISCONNECTED
              </Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onConnect}>
                Connect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border-0 shadow-card hover:shadow-soft transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Quality</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground/50" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p className="text-xs">Meta's quality assessment. Low rating limits your messaging capabilities.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", qc.dot)} />
            <span className={cn("text-sm font-semibold", qc.color)}>{qc.label}</span>
          </div>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card className="border-0 shadow-card hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Credits</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {creditsCurrency}{creditsBalance.toLocaleString()}
          </p>
          <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary mt-1">
            Buy Credits
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="border-0 shadow-card hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Billing</span>
          </div>
          {billingDueDate ? (
            <>
              <p className="text-sm font-semibold text-foreground">{billingAmount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due {billingDueDate}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No dues</p>
          )}
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="border-0 shadow-card hover:shadow-soft transition-shadow cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Plan</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{planName}</p>
          {addOns.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">+{addOns.length} add-ons</p>
          )}
          <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary mt-1">
            Upgrade <ChevronRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
