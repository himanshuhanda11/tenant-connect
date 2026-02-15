import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import statusWhatsapp from '@/assets/status-whatsapp.png';
import statusQuality from '@/assets/status-quality.png';
import statusCredits from '@/assets/status-credits.png';
import statusBilling from '@/assets/status-billing.png';

interface StatusStripProps {
  isWABAConnected: boolean;
  phoneNumber?: string;
  qualityRating?: 'green' | 'yellow' | 'red' | 'unknown';
  creditsBalance: number;
  creditsCurrency?: string;
  planName?: string;
  billingAmount?: string;
  billingDueDate?: string;
  loading?: boolean;
  onConnect?: () => void;
}

export function StatusStrip({
  isWABAConnected,
  phoneNumber,
  qualityRating = 'unknown',
  creditsBalance,
  creditsCurrency = '₹',
  planName = 'Free',
  billingAmount,
  billingDueDate,
  loading,
  onConnect,
}: StatusStripProps) {
  const navigate = useNavigate();

  const qualityLabels: Record<string, string> = {
    green: 'Good',
    yellow: 'Yellow',
    red: 'Low',
    unknown: 'N/A',
  };

  const qualityColors: Record<string, string> = {
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-destructive',
    unknown: 'text-muted-foreground',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-border/50 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-xl mb-2" />
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* WhatsApp API Status */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <img src={statusWhatsapp} alt="WhatsApp" className="h-10 w-10 object-contain flex-shrink-0" loading="lazy" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">WhatsApp API</p>
            {phoneNumber && <p className="text-[10px] text-muted-foreground truncate">{phoneNumber}</p>}
            <div className="mt-0.5">
              {isWABAConnected ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-2 py-0 text-[10px] rounded-md">
                  LIVE
                </Badge>
              ) : (
                <Button size="sm" onClick={onConnect} className="h-5 text-[10px] px-2 rounded-md">
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <img src={statusQuality} alt="Quality" className="h-10 w-10 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Quality Rating</p>
            <p className={cn("text-lg font-bold", qualityColors[qualityRating])}>
              {qualityLabels[qualityRating]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credits Balance */}
      <Card
        className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow cursor-pointer"
        onClick={() => navigate('/billing')}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <img src={statusCredits} alt="Credits" className="h-10 w-10 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Credits Balance</p>
            <p className="text-lg font-bold text-foreground">
              {creditsCurrency}{creditsBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-primary font-medium cursor-pointer">Buy Credits</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Due */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <img src={statusBilling} alt="Billing" className="h-10 w-10 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Billing Due</p>
            <p className="text-lg font-bold text-foreground">
              {billingAmount || 'No dues'}
            </p>
            {billingDueDate && (
              <p className="text-[10px] text-muted-foreground">{billingDueDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan / Upgrade */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Current Plan</p>
            <p className="text-lg font-bold text-foreground">{planName}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs rounded-lg"
            onClick={() => navigate('/billing')}
          >
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
