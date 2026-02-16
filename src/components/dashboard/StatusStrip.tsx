import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
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

  const qualityDots: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-destructive',
    unknown: 'bg-muted-foreground/40',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70">
            <CardContent className="p-5">
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-4 w-20 mb-1.5" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* WhatsApp API */}
      <Card className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-all duration-200 group">
        <CardContent className="p-5 flex items-start gap-3">
          <img src={statusWhatsapp} alt="WhatsApp" className="h-11 w-11 object-contain flex-shrink-0 mt-0.5" loading="lazy" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none">WhatsApp API</p>
            {phoneNumber && (
              <p className="text-xs text-foreground font-semibold mt-1 truncate">{phoneNumber}</p>
            )}
            <div className="mt-2">
              {isWABAConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 font-bold px-2.5 py-0.5 text-[10px] rounded-md border border-emerald-500/20">
                  ● LIVE
                </Badge>
              ) : (
                <Button size="sm" onClick={onConnect} className="h-6 text-[10px] px-3 rounded-md">
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Rating */}
      <Card className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-all duration-200">
        <CardContent className="p-5 flex items-start gap-3">
          <img src={statusQuality} alt="Quality" className="h-11 w-11 object-contain flex-shrink-0 mt-0.5" loading="lazy" />
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none">Quality</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", qualityDots[qualityRating])} />
              <p className="text-xl font-bold text-foreground leading-none">
                {qualityLabels[qualityRating]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card
        className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-all duration-200 cursor-pointer group"
        onClick={() => navigate('/billing')}
      >
        <CardContent className="p-5 flex items-start gap-3">
          <img src={statusCredits} alt="Credits" className="h-11 w-11 object-contain flex-shrink-0 mt-0.5" loading="lazy" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none">Credits</p>
            <p className="text-xl font-bold text-foreground mt-1.5 leading-none">
              {creditsCurrency}{creditsBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-primary font-semibold mt-1.5 group-hover:underline flex items-center gap-0.5">
              Buy Credits <ArrowUpRight className="h-2.5 w-2.5" />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-all duration-200">
        <CardContent className="p-5 flex items-start gap-3">
          <img src={statusBilling} alt="Billing" className="h-11 w-11 object-contain flex-shrink-0 mt-0.5" loading="lazy" />
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none">Billing</p>
            <p className="text-xl font-bold text-foreground mt-1.5 leading-none">
              {billingAmount || 'No dues'}
            </p>
            {billingDueDate && (
              <p className="text-[10px] text-muted-foreground mt-1">{billingDueDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="border border-border/20 rounded-2xl backdrop-blur-sm bg-card/70 hover:bg-card/90 transition-all duration-200">
        <CardContent className="p-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none">Plan</p>
            <p className="text-xl font-bold text-foreground mt-1.5 leading-none">{planName}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] px-3 rounded-lg border-primary/25 hover:bg-primary hover:text-primary-foreground transition-colors mt-0.5"
            onClick={() => navigate('/billing')}
          >
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
