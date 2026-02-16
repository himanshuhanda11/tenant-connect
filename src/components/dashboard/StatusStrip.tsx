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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-border/40 shadow-soft rounded-2xl bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-16 rounded-2xl mb-3" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
      {/* WhatsApp API Status */}
      <Card className="border border-border/30 shadow-soft rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/20 group">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src={statusWhatsapp} alt="WhatsApp" className="h-20 w-20 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">WhatsApp API</p>
            {phoneNumber && <p className="text-xs text-muted-foreground truncate mt-1">{phoneNumber}</p>}
            <div className="mt-2">
              {isWABAConnected ? (
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-4 py-1 text-xs rounded-full shadow-sm">
                  LIVE
                </Badge>
              ) : (
                <Button size="sm" onClick={onConnect} className="h-8 text-xs px-4 rounded-full shadow-sm">
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border border-border/30 shadow-soft rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/20 group">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src={statusQuality} alt="Quality" className="h-20 w-20 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quality Rating</p>
            <p className={cn("text-3xl font-bold mt-1", qualityColors[qualityRating])}>
              {qualityLabels[qualityRating]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credits Balance */}
      <Card
        className="border border-border/30 shadow-soft rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/20 cursor-pointer group"
        onClick={() => navigate('/billing')}
      >
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src={statusCredits} alt="Credits" className="h-20 w-20 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Credits Balance</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {creditsCurrency}{creditsBalance.toLocaleString()}
            </p>
            <p className="text-xs text-primary font-semibold cursor-pointer mt-1 hover:underline">Buy Credits</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Due */}
      <Card className="border border-border/30 shadow-soft rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/20 group">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src={statusBilling} alt="Billing" className="h-20 w-20 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Billing Due</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {billingAmount || 'No dues'}
            </p>
            {billingDueDate && (
              <p className="text-xs text-muted-foreground mt-1">{billingDueDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan / Upgrade */}
      <Card className="border border-border/30 shadow-soft rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 group">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3 justify-between h-full">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Plan</p>
            <p className="text-3xl font-bold text-foreground mt-1">{planName}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-sm px-5 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => navigate('/billing')}
          >
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
