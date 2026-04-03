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
  Info,
  ChevronRight,
  Zap,
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
  phoneNumber?: string;
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
  phoneNumber,
  loading,
  onConnect,
}: StatusRowProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const qualityConfig = {
    green: { label: 'Good', sublabel: 'Stable', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    yellow: { label: 'Medium', sublabel: 'Review needed', dotColor: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-500/10' },
    red: { label: 'Low', sublabel: 'Action required', dotColor: 'bg-destructive', textColor: 'text-destructive', bgColor: 'bg-destructive/10' },
    unknown: { label: 'N/A', sublabel: 'Not connected', dotColor: 'bg-muted-foreground', textColor: 'text-muted-foreground', bgColor: 'bg-muted' },
  };

  const qc = qualityConfig[qualityRating];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* WhatsApp API Status */}
      <Card className="border border-border/50 shadow-card hover:shadow-soft transition-all rounded-2xl overflow-hidden col-span-2 lg:col-span-1">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center",
              isWABAConnected ? "bg-emerald-500/10" : "bg-muted"
            )}>
              {isWABAConnected ? (
                <Wifi className="h-4 w-4 text-emerald-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">WhatsApp API</p>
              {phoneNumber && (
                <p className="text-[10px] text-muted-foreground/70 font-mono">{phoneNumber}</p>
              )}
            </div>
          </div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-4 py-1.5 text-sm rounded-lg shadow-sm">
              LIVE
            </Badge>
          ) : (
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 font-semibold w-fit text-xs">
                NOT CONNECTED
              </Badge>
              <Button size="sm" onClick={onConnect} className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-fit">
                <Zap className="h-3 w-3 mr-1" />
                Connect Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border border-border/50 shadow-card hover:shadow-soft transition-all rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", qc.bgColor)}>
              <Shield className={cn("h-4 w-4", qc.textColor)} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Quality Rating</p>
              <p className="text-[10px] text-muted-foreground/70">{qc.sublabel}</p>
            </div>
          </div>
          <p className={cn("text-2xl font-bold", qc.textColor)}>{qc.label}</p>
        </CardContent>
      </Card>

      {/* Credits Balance */}
      <Card className="border border-border/50 shadow-card hover:shadow-soft transition-all rounded-2xl cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Credits Balance</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {creditsCurrency}{creditsBalance.toLocaleString()}
          </p>
          <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary mt-1 font-semibold">
            Buy Credits
          </Button>
        </CardContent>
      </Card>

      {/* Billing Due */}
      <Card className="border border-border/50 shadow-card hover:shadow-soft transition-all rounded-2xl cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Billing Due</p>
          </div>
          {billingDueDate ? (
            <>
              <p className="text-2xl font-bold text-foreground">{billingAmount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due {billingDueDate}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">No dues</p>
              <Button size="sm" variant="link" className="h-auto p-0 text-xs text-primary mt-1 font-semibold">
                Pay Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan + Upgrade */}
      <Card className="border border-border/50 shadow-card hover:shadow-soft transition-all rounded-2xl cursor-pointer" onClick={() => navigate('/billing')}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Crown className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Current Plan</p>
            </div>
          </div>
          <p className="text-lg font-bold text-foreground">{planName}</p>
          {addOns.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">+{addOns.length} add-ons</p>
          )}
          {planName?.toLowerCase() !== 'business' && (
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs font-semibold rounded-lg">
              Upgrade <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
