import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight, Zap, MessageSquare, Users, Bot, FileText,
  ShieldCheck, Receipt, CreditCard, Phone,
} from 'lucide-react';

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

const qualityLabels: Record<string, string> = { green: 'Good', yellow: 'Medium', red: 'Low', unknown: 'N/A' };
const qualityColors: Record<string, string> = {
  green: 'text-emerald-500',
  yellow: 'text-amber-500',
  red: 'text-destructive',
  unknown: 'text-muted-foreground',
};
const qualityDots: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-destructive',
  unknown: 'bg-muted-foreground/40',
};

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={cn(
            "rounded-2xl border border-border/10 bg-card/40 p-5 h-[140px]",
            i < 2 && "md:col-span-2",
          )}>
            <Skeleton className="h-5 w-5 rounded-lg mb-4" />
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      {/* ── WhatsApp API Status ── */}
      <div className="col-span-2 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:bg-card/60 transition-colors duration-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">WhatsApp API</p>
              {phoneNumber && (
                <p className="text-lg font-bold text-foreground mt-0.5 tracking-tight">{phoneNumber}</p>
              )}
            </div>
          </div>
          {isWABAConnected ? (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold text-[11px] px-3 py-1 rounded-full">
              ● Live
            </Badge>
          ) : (
            <Button size="sm" onClick={onConnect} className="h-8 text-xs px-4 rounded-full">
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* ── Credits Balance ── */}
      <div
        className="col-span-1 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[140px] cursor-pointer hover:bg-card/60 transition-colors duration-200"
        onClick={() => navigate('/billing')}
      >
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <CreditCard className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2.5 rounded-full text-muted-foreground hover:text-foreground">
            Buy <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Credits</p>
          <p className="text-2xl font-bold text-foreground mt-0.5 leading-none tracking-tight">
            {creditsCurrency}{creditsBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Quality Rating ── */}
      <div className="col-span-1 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[140px] hover:bg-card/60 transition-colors duration-200">
        <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <ShieldCheck className="h-4.5 w-4.5 text-sky-500" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Quality</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("h-2 w-2 rounded-full", qualityDots[qualityRating])} />
            <p className={cn("text-xl font-bold leading-none tracking-tight", qualityColors[qualityRating])}>
              {qualityLabels[qualityRating]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Current Plan ── */}
      <div className="col-span-2 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5 flex items-center justify-between min-h-[100px] hover:bg-card/60 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
            <p className="text-2xl font-bold text-foreground leading-none tracking-tight mt-0.5">{planName}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-9 text-xs px-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate('/billing')}
        >
          Upgrade
        </Button>
      </div>

      {/* ── Billing Due ── */}
      <div className="col-span-1 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[100px] hover:bg-card/60 transition-colors duration-200">
        <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Receipt className="h-4.5 w-4.5 text-violet-500" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Billing Due</p>
          <p className="text-lg font-bold text-foreground mt-0.5 leading-none tracking-tight">{billingAmount || 'No dues'}</p>
          {billingDueDate && <p className="text-[10px] text-muted-foreground mt-1">{billingDueDate}</p>}
        </div>
      </div>

      {/* ── KPI: Open Chats ── */}
      <KpiCell
        icon={<MessageSquare className="h-4 w-4 text-teal-500" />}
        iconBg="bg-teal-500/10"
        label="Open Chats"
        value={openChats}
        onClick={() => navigate('/inbox?status=open')}
      />

      {/* ── KPI: New Contacts ── */}
      <KpiCell
        icon={<Users className="h-4 w-4 text-blue-500" />}
        iconBg="bg-blue-500/10"
        label="New (7 days)"
        value={newContacts7d}
        badge={newContacts7d > 0 ? `+${Math.round(newContacts7d * 0.12)}%` : undefined}
        badgeType="success"
        onClick={() => navigate('/contacts')}
      />

      {/* ── KPI: Automation Runs ── */}
      <KpiCell
        icon={<Bot className="h-4 w-4 text-orange-500" />}
        iconBg="bg-orange-500/10"
        label="Automation Runs"
        value={automationRuns7d}
        onClick={() => navigate('/automation')}
      />

      {/* ── KPI: Templates ── */}
      <KpiCell
        icon={<FileText className="h-4 w-4 text-indigo-500" />}
        iconBg="bg-indigo-500/10"
        label="Templates"
        value={totalTemplates}
        badge={templatesPending > 0 ? `${templatesPending} pending` : undefined}
        badgeType="warning"
        onClick={() => navigate('/templates')}
      />
    </div>
  );
}

/* ────────── Reusable KPI Cell ────────── */
function KpiCell({
  icon, iconBg, label, value, badge, badgeType, onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  badge?: string;
  badgeType?: 'success' | 'warning';
  onClick?: () => void;
}) {
  return (
    <div
      className="col-span-1 rounded-2xl border border-border/10 bg-card/40 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[120px] cursor-pointer hover:bg-card/60 transition-colors duration-200 group"
      onClick={onClick}
    >
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
          {badge && (
            <span className={cn(
              "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
              badgeType === 'success' && "text-emerald-500 bg-emerald-500/10",
              badgeType === 'warning' && "text-amber-500 bg-amber-500/10",
            )}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
