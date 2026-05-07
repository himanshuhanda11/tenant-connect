import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowRight, Users, MessageCircle, Clock, TrendingUp, CheckCircle2, AlertCircle, Settings, UserPlus, Pencil, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface WorkspaceTileProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
    logo_url?: string | null;
    phoneNumber?: string;
    verifiedName?: string;
    memberCount: number;
    messagesThisWeek?: number;
    lastActive?: string;
    status: 'connected' | 'setup' | 'attention';
  };
  onSelect: () => void;
  onRename: () => void;
  onManageMembers: () => void;
  onSettings: () => void;
  onArchive: () => void;
}

const gradientPalette = [
  'from-emerald-400 to-green-600',
  'from-teal-400 to-emerald-600',
  'from-green-400 to-teal-600',
  'from-lime-400 to-green-600',
  'from-emerald-500 to-cyan-600',
];

function pickGradient(name: string) {
  const idx = name.charCodeAt(0) % gradientPalette.length;
  return gradientPalette[idx];
}

function MiniGraph({ connected }: { connected: boolean }) {
  // Static SVG mini sparkline; randomized-looking but deterministic
  const path = "M0,18 L8,14 L16,16 L24,10 L32,12 L40,6 L48,8 L56,3";
  return (
    <svg viewBox="0 0 56 24" className="w-full h-7" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(152 60% 45%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(152 60% 45%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L56,24 L0,24 Z`} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke={connected ? 'hsl(152 65% 40%)' : 'hsl(var(--muted-foreground))'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WorkspaceTile({ workspace: w, onSelect, onRename, onManageMembers, onSettings, onArchive }: WorkspaceTileProps) {
  const initial = w.name.trim().charAt(0).toUpperCase() || 'W';
  const gradient = pickGradient(w.name);
  const isConnected = w.status === 'connected';
  const lastActiveLabel = w.lastActive
    ? new Date(w.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-white/80 backdrop-blur-xl",
        "border-emerald-100/80 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.18)]",
        "hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.35)] hover:border-emerald-300/80 transition-all"
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-300/20 blur-3xl group-hover:bg-emerald-400/30 transition-all" />
      {isConnected && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-emerald-400/0 group-hover:ring-emerald-400/40 transition-all" />
      )}

      <div className="relative p-5 sm:p-6">
        {/* Top row: Avatar + name + menu */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className={cn(
              "w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white",
              !w.logo_url && `bg-gradient-to-br ${gradient}`
            )}>
              {w.logo_url ? (
                <img src={w.logo_url} alt={w.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            {/* WhatsApp badge */}
            <span className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-white",
              isConnected ? "bg-[#25D366]" : "bg-slate-300"
            )}>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
              </svg>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-base sm:text-lg leading-tight">{w.verifiedName || w.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{w.role === 'owner' ? 'Owner' : w.role}</p>
            <div className="mt-2">
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live · WhatsApp Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Setup Required
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onRename}><Pencil className="w-3.5 h-3.5 mr-2" /> Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={onManageMembers}><UserPlus className="w-3.5 h-3.5 mr-2" /> Manage members</DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}><Settings className="w-3.5 h-3.5 mr-2" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive} className="text-destructive"><Archive className="w-3.5 h-3.5 mr-2" /> Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Phone */}
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 font-medium">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">WA</span>
          <span className="truncate">{w.phoneNumber || 'No number connected'}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-3">
            <Users className="w-3.5 h-3.5 text-emerald-600 mb-1" />
            <div className="text-base font-bold text-slate-900 leading-none">{w.memberCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Team</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-3">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 mb-1" />
            <div className="text-base font-bold text-slate-900 leading-none">{w.messagesThisWeek ?? 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Msgs/wk</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-3">
            <Clock className="w-3.5 h-3.5 text-emerald-600 mb-1" />
            <div className="text-base font-bold text-slate-900 leading-none">{lastActiveLabel}</div>
            <div className="text-[10px] text-slate-500 mt-1">Active</div>
          </div>
        </div>

        {/* Mini graph */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1"><MiniGraph connected={isConnected} /></div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +12%
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onSelect}
          className={cn(
            "w-full mt-4 h-11 rounded-2xl font-semibold text-white shadow-lg",
            "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
            "shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          )}
        >
          {isConnected ? 'Enter Workspace' : 'Continue Setup'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
