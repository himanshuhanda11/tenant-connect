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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* WhatsApp API Status */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-5 flex items-center gap-4">
          <img src={statusWhatsapp} alt="WhatsApp" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">WhatsApp API</p>
            {phoneNumber && <p className="text-xs text-muted-foreground truncate mt-0.5">{phoneNumber}</p>}
            <div className="mt-1.5">
              {isWABAConnected ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-3 py-0.5 text-xs rounded-md">
                  LIVE
                </Badge>
              ) : (
                <Button size="sm" onClick={onConnect} className="h-7 text-xs px-3 rounded-md">
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-5 flex items-center gap-4">
          <img src={statusQuality} alt="Quality" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quality Rating</p>
            <p className={cn("text-2xl font-bold mt-0.5", qualityColors[qualityRating])}>
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
        <CardContent className="p-5 flex items-center gap-4">
          <img src={statusCredits} alt="Credits" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Credits Balance</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">
              {creditsCurrency}{creditsBalance.toLocaleString()}
            </p>
            <p className="text-xs text-primary font-medium cursor-pointer mt-0.5">Buy Credits</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Due */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-5 flex items-center gap-4">
          <img src={statusBilling} alt="Billing" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Billing Due</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">
              {billingAmount || 'No dues'}
            </p>
            {billingDueDate && (
              <p className="text-xs text-muted-foreground mt-0.5">{billingDueDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan / Upgrade */}
      <Card className="border border-border/50 shadow-card rounded-2xl hover:shadow-soft transition-shadow">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Plan</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{planName}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-sm rounded-lg"
            onClick={() => navigate('/billing')}
          >
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
