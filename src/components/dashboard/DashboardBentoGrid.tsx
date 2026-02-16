import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Zap } from 'lucide-react';
import bentoWhatsapp from '@/assets/bento-whatsapp.png';
import bentoQuality from '@/assets/bento-quality.png';
import bentoCredits from '@/assets/bento-credits.png';
import bentoBilling from '@/assets/bento-billing.png';
import bentoPlan from '@/assets/bento-plan.png';
import bentoChats from '@/assets/bento-chats.png';
import bentoContacts from '@/assets/bento-contacts.png';
import bentoAutomation from '@/assets/bento-automation.png';
import bentoTemplates from '@/assets/bento-templates.png';

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[150px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={cn(
            "rounded-3xl border border-border/10 bg-card/50 backdrop-blur-md p-5",
            i === 0 && "col-span-2 row-span-2",
            i === 1 && "col-span-2",
            i === 4 && "col-span-2",
          )}>
            <Skeleton className="h-12 w-12 rounded-2xl mb-3" />
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cell = "rounded-3xl border border-border/10 bg-card/50 backdrop-blur-md hover:bg-card/70 hover:border-border/20 transition-all duration-300 group overflow-hidden relative";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[150px]">

      {/* 1. WhatsApp API — Hero (2×2) */}
      <div className={cn(cell, "col-span-2 row-span-2 p-7 flex flex-col justify-between")}>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <img src={bentoWhatsapp} alt="WhatsApp" className="h-20 w-20 object-contain mb-4 drop-shadow-lg" loading="lazy" />
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">WhatsApp API</p>
          {phoneNumber && (
            <p className="text-xl font-bold text-foreground mt-1.5 tracking-tight">{phoneNumber}</p>
          )}
        </div>
        <div className="relative z-10">
          {isWABAConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 font-bold px-4 py-1.5 text-xs rounded-full border border-emerald-500/20 shadow-sm">
              ● LIVE
            </Badge>
          ) : (
            <Button size="sm" onClick={onConnect} className="h-9 text-xs px-5 rounded-full shadow-sm">
              Connect Now
            </Button>
          )}
        </div>
      </div>

      {/* 2. Credits — Wide (2×1) */}
      <div
        className={cn(cell, "col-span-2 p-5 flex items-center gap-5 cursor-pointer")}
        onClick={() => navigate('/billing')}
      >
        <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-amber-500/8 rounded-full blur-2xl" />
        <img src={bentoCredits} alt="Credits" className="h-16 w-16 object-contain flex-shrink-0 drop-shadow-md" loading="lazy" />
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">Credits Balance</p>
          <p className="text-3xl font-extrabold text-foreground mt-1 leading-none tracking-tight">
            {creditsCurrency}{creditsBalance.toLocaleString()}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-9 text-xs px-4 rounded-full shrink-0 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors">
          Buy <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* 3. Quality Rating — 1×1 */}
      <div className={cn(cell, "col-span-1 p-5 flex flex-col justify-between")}>
        <img src={bentoQuality} alt="Quality" className="h-12 w-12 object-contain drop-shadow-md" loading="lazy" />
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">Quality</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-background", qualityDots[qualityRating])} />
            <p className="text-2xl font-extrabold text-foreground leading-none tracking-tight">{qualityLabels[qualityRating]}</p>
          </div>
        </div>
      </div>

      {/* 4. Billing — 1×1 */}
      <div className={cn(cell, "col-span-1 p-5 flex flex-col justify-between")}>
        <img src={bentoBilling} alt="Billing" className="h-12 w-12 object-contain drop-shadow-md" loading="lazy" />
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">Billing Due</p>
          <p className="text-xl font-extrabold text-foreground mt-1.5 leading-none tracking-tight">{billingAmount || 'No dues'}</p>
          {billingDueDate && <p className="text-[10px] text-muted-foreground mt-1">{billingDueDate}</p>}
        </div>
      </div>

      {/* 5. Plan — Wide (2×1) */}
      <div className={cn(cell, "col-span-2 p-5 flex items-center justify-between")}>
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/8 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <img src={bentoPlan} alt="Plan" className="h-14 w-14 object-contain drop-shadow-md" loading="lazy" />
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">Current Plan</p>
            <p className="text-3xl font-extrabold text-foreground mt-0.5 leading-none tracking-tight">{planName}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-10 text-xs px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md relative z-10"
          onClick={() => navigate('/billing')}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Upgrade
        </Button>
      </div>

      {/* 6–9: KPI cells */}
      <BentoKpiCell
        image={bentoChats}
        value={openChats}
        label="Open Chats"
        onClick={() => navigate('/inbox?status=open')}
      />
      <BentoKpiCell
        image={bentoContacts}
        value={newContacts7d}
        label="New (7 days)"
        badge={newContacts7d > 0 ? `+${Math.round(newContacts7d * 0.12)}%` : undefined}
        badgeVariant="success"
        onClick={() => navigate('/contacts')}
      />
      <BentoKpiCell
        image={bentoAutomation}
        value={automationRuns7d}
        label="Automation Runs"
        onClick={() => navigate('/automation')}
      />
      <BentoKpiCell
        image={bentoTemplates}
        value={totalTemplates}
        label="Templates"
        badge={templatesPending > 0 ? `${templatesPending} pending` : undefined}
        badgeVariant="warning"
        onClick={() => navigate('/templates')}
      />
    </div>
  );
}

/* ---------- Small KPI Cell ---------- */
function BentoKpiCell({
  image, value, label, badge, badgeVariant, onClick,
}: {
  image: string;
  value: number;
  label: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning';
  onClick?: () => void;
}) {
  const cell = "rounded-3xl border border-border/10 bg-card/50 backdrop-blur-md hover:bg-card/70 hover:border-border/20 transition-all duration-300 group overflow-hidden relative";
  return (
    <div
      className={cn(cell, "col-span-1 p-5 flex flex-col justify-between cursor-pointer")}
      onClick={onClick}
    >
      <img src={image} alt={label} className="h-12 w-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      <div>
        <p className="text-3xl font-extrabold text-foreground leading-none tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <p className="text-[10px] text-muted-foreground font-semibold">{label}</p>
          {badge && (
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
              badgeVariant === 'success' && "text-emerald-600 bg-emerald-500/10",
              badgeVariant === 'warning' && "text-amber-600 bg-amber-500/10",
            )}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
