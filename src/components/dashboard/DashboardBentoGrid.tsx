import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Zap } from 'lucide-react';
import statusWhatsapp from '@/assets/status-whatsapp.png';
import statusQuality from '@/assets/status-quality.png';
import statusCredits from '@/assets/status-credits.png';
import statusBilling from '@/assets/status-billing.png';
import kpiOpenChats from '@/assets/kpi-open-chats.png';
import kpiNewContacts from '@/assets/kpi-new-contacts.png';
import kpiAutomation from '@/assets/kpi-automation.png';
import kpiTemplates from '@/assets/kpi-templates.png';

interface BentoGridProps {
  isWABAConnected: boolean;
  phoneNumber?: string;
  qualityRating?: 'green' | 'yellow' | 'red' | 'unknown';
  creditsBalance: number;
  creditsCurrency?: string;
  planName?: string;
  billingAmount?: string;
  billingDueDate?: string;
  openChats: number;
  newContacts7d: number;
  automationRuns7d: number;
  templatesPending: number;
  totalTemplates: number;
  loading?: boolean;
  onConnect?: () => void;
}

const qualityLabels: Record<string, string> = { green: 'Good', yellow: 'Yellow', red: 'Low', unknown: 'N/A' };
const qualityDots: Record<string, string> = { green: 'bg-emerald-500', yellow: 'bg-amber-500', red: 'bg-destructive', unknown: 'bg-muted-foreground/40' };

export function DashboardBentoGrid({
  isWABAConnected, phoneNumber, qualityRating = 'unknown',
  creditsBalance, creditsCurrency = '₹', planName = 'Free',
  billingAmount, billingDueDate,
  openChats, newContacts7d, automationRuns7d, templatesPending, totalTemplates,
  loading, onConnect,
}: BentoGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[140px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={cn(
            "rounded-2xl border border-border/15 bg-card/60 backdrop-blur-sm p-5",
            i === 0 && "col-span-2 row-span-2",
            i === 1 && "col-span-2",
            i >= 5 && "col-span-2 lg:col-span-1",
          )}>
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const cell = "rounded-2xl border border-border/15 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group overflow-hidden relative";

  return (
    <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[140px]">

      {/* 1. WhatsApp API — Large hero cell (2x2) */}
      <div className={cn(cell, "col-span-2 row-span-2 p-6 flex flex-col justify-between")}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div>
          <img src={statusWhatsapp} alt="WhatsApp" className="h-16 w-16 object-contain mb-3" loading="lazy" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WhatsApp API</p>
          {phoneNumber && (
            <p className="text-lg font-bold text-foreground mt-1">{phoneNumber}</p>
          )}
        </div>
        <div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 font-bold px-3 py-1 text-xs rounded-lg border border-emerald-500/20">
              ● LIVE
            </Badge>
          ) : (
            <Button size="sm" onClick={onConnect} className="h-8 text-xs px-4 rounded-lg">
              Connect Now
            </Button>
          )}
        </div>
      </div>

      {/* 2. Credits — Wide cell (2x1) */}
      <div
        className={cn(cell, "col-span-2 p-5 flex items-center gap-4 cursor-pointer")}
        onClick={() => navigate('/billing')}
      >
        <img src={statusCredits} alt="Credits" className="h-14 w-14 object-contain flex-shrink-0" loading="lazy" />
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Credits Balance</p>
          <p className="text-3xl font-bold text-foreground mt-0.5 leading-tight">
            {creditsCurrency}{creditsBalance.toLocaleString()}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3 rounded-lg shrink-0 border-primary/25 hover:bg-primary hover:text-primary-foreground">
          Buy <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* 3. Quality Rating — 1x1 */}
      <div className={cn(cell, "col-span-2 lg:col-span-1 p-5 flex flex-col justify-between")}>
        <img src={statusQuality} alt="Quality" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Quality</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn("h-3 w-3 rounded-full", qualityDots[qualityRating])} />
            <p className="text-2xl font-bold text-foreground leading-none">{qualityLabels[qualityRating]}</p>
          </div>
        </div>
      </div>

      {/* 4. Billing — 1x1 */}
      <div className={cn(cell, "col-span-2 lg:col-span-1 p-5 flex flex-col justify-between")}>
        <img src={statusBilling} alt="Billing" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Billing Due</p>
          <p className="text-xl font-bold text-foreground mt-1 leading-none">{billingAmount || 'No dues'}</p>
          {billingDueDate && <p className="text-[10px] text-muted-foreground mt-1">{billingDueDate}</p>}
        </div>
      </div>

      {/* 5. Plan — Wide cell (2x1) */}
      <div className={cn(cell, "col-span-2 p-5 flex items-center justify-between bg-gradient-to-r from-card/60 to-primary/5")}>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
          <p className="text-3xl font-bold text-foreground mt-0.5 leading-tight">{planName}</p>
        </div>
        <Button
          size="sm"
          className="h-9 text-xs px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          onClick={() => navigate('/billing')}
        >
          <Zap className="h-3.5 w-3.5 mr-1" /> Upgrade
        </Button>
      </div>

      {/* 6. Open Chats — 1x1 */}
      <div
        className={cn(cell, "col-span-2 sm:col-span-1 p-5 flex flex-col justify-between cursor-pointer")}
        onClick={() => navigate('/inbox?status=open')}
      >
        <img src={kpiOpenChats} alt="Chats" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <p className="text-3xl font-bold text-foreground leading-none">{openChats}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">Open Chats</p>
        </div>
      </div>

      {/* 7. New Contacts — 1x1 */}
      <div
        className={cn(cell, "col-span-2 sm:col-span-1 p-5 flex flex-col justify-between cursor-pointer")}
        onClick={() => navigate('/contacts')}
      >
        <img src={kpiNewContacts} alt="Contacts" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-foreground leading-none">{newContacts7d}</p>
            {newContacts7d > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{Math.round(newContacts7d * 0.12)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">New (7 days)</p>
        </div>
      </div>

      {/* 8. Automation Runs — 1x1 */}
      <div
        className={cn(cell, "col-span-2 sm:col-span-1 p-5 flex flex-col justify-between cursor-pointer")}
        onClick={() => navigate('/automation')}
      >
        <img src={kpiAutomation} alt="Automation" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <p className="text-3xl font-bold text-foreground leading-none">{automationRuns7d}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">Automation Runs</p>
        </div>
      </div>

      {/* 9. Templates — 1x1 */}
      <div
        className={cn(cell, "col-span-2 sm:col-span-1 p-5 flex flex-col justify-between cursor-pointer")}
        onClick={() => navigate('/templates')}
      >
        <img src={kpiTemplates} alt="Templates" className="h-10 w-10 object-contain" loading="lazy" />
        <div>
          <p className="text-3xl font-bold text-foreground leading-none">{totalTemplates}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-[11px] text-muted-foreground font-medium">Templates</p>
            {templatesPending > 0 && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {templatesPending} pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
