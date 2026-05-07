import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Loader2, RefreshCw, Search,
  ChevronDown, ArrowRight, Filter, Sparkles, Wifi, AlertCircle,
  MessageSquare, TrendingUp, ShieldCheck, Smartphone, Zap, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import WorkspaceTile from '@/components/workspace/WorkspaceTile';
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState';

interface WorkspaceEnriched {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  verifiedName?: string;
  role: string;
  created_at: string;
  phoneCount: number;
  phoneNumber?: string;
  memberCount: number;
  status: 'connected' | 'setup' | 'attention';
  messagesThisWeek?: number;
  lastActive?: string;
}

type SortOption = 'recent' | 'newest' | 'alphabetical';
type FilterOption = 'all' | 'connected' | 'setup' | 'owner' | 'admin' | 'agent';

// Decorative weekly activity chart
function WeeklyActivityChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / max) * 80 - 10;
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L100,100 L0,100 Z`;
  const peakIdx = data.indexOf(max);
  const peak = points[peakIdx];

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(152 70% 45%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(152 70% 45%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="chartLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(160 75% 40%)" />
          <stop offset="100%" stopColor="hsl(140 70% 50%)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartFill)" />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#chartLine)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      {peak && (
        <>
          <circle cx={peak[0]} cy={peak[1]} r="2" fill="hsl(152 70% 40%)" vectorEffect="non-scaling-stroke" />
          <circle cx={peak[0]} cy={peak[1]} r="4" fill="hsl(152 70% 40%)" fillOpacity="0.2" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, gradient, delay }: { icon: any; label: string; value: number | string; gradient: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-100/80 p-4 sm:p-5 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.18)] hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.35)] transition-all"
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-200/30 blur-2xl" />
      <div className={cn("relative w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-md", gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-1.5 font-medium">{label}</div>
    </motion.div>
  );
}

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { tenants, loading: tenantLoading, setCurrentTenant, refreshTenants, createTenant } = useTenant();

  const [workspaces, setWorkspaces] = useState<WorkspaceEnriched[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Agent auto-redirect
  useEffect(() => {
    if (authLoading || tenantLoading || !user || tenants.length === 0) return;
    const isAgentOnly = tenants.every(t => t.role === 'agent');
    if (isAgentOnly) {
      const agentTenant = tenants[0];
      setCurrentTenant(agentTenant);
      navigate('/inbox', { replace: true });
    }
  }, [authLoading, tenantLoading, user, tenants, setCurrentTenant, navigate]);

  // Onboarding check
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || !profile) return;
      const onboardingStep = profile.onboarding_step;
      if (onboardingStep !== 'completed') {
        if (onboardingStep === 'pending' || onboardingStep === 'google_done') {
          navigate('/onboarding/org');
        } else if (onboardingStep === 'org_done') {
          navigate('/onboarding/password');
        }
      }
    };
    if (!authLoading && user && profile) checkOnboarding();
  }, [user, authLoading, profile, navigate]);

  // Fetch enriched workspace data
  useEffect(() => {
    let isCancelled = false;
    const fetchWorkspaceDetails = async () => {
      if (tenants.length === 0) {
        setWorkspaces([]);
        return;
      }
      setLoadingDetails(true);
      const weekAgoIso = (() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      })();

      try {
        const enriched: WorkspaceEnriched[] = await Promise.all(
          tenants.map(async (tenant) => {
            const [phoneCountRes, phonesRes, memberCountRes, messagesThisWeekRes] = await Promise.all([
              supabase.from('phone_numbers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('phone_numbers').select('status, display_number, verified_name, phone_number_id, waba_account_id').eq('tenant_id', tenant.id).eq('status', 'connected').limit(1),
              supabase.from('tenant_members').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('messages').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id).gte('created_at', weekAgoIso),
            ]);
            const phoneCount = phoneCountRes.count ?? 0;
            const phones = phonesRes.data ?? [];
            const memberCount = memberCountRes.count ?? 0;
            const messagesThisWeek = messagesThisWeekRes.count ?? 0;
            let status: 'connected' | 'setup' | 'attention' = 'setup';
            if (phones.length > 0) status = 'connected';

            // Fetch WhatsApp Business profile picture for connected workspaces
            let waProfilePic: string | undefined;
            const connectedPhone = phones?.[0] as any;
            if (status === 'connected' && connectedPhone?.phone_number_id && connectedPhone?.waba_account_id) {
              try {
                const { data: profileRes } = await supabase.functions.invoke('whatsapp-profile', {
                  body: {
                    action: 'get',
                    phone_number_id: connectedPhone.phone_number_id,
                    waba_account_id: connectedPhone.waba_account_id,
                  },
                });
                waProfilePic = profileRes?.profile?.profile_picture_url;
              } catch (e) {
                console.warn('Could not fetch WA profile pic for tenant', tenant.id, e);
              }
            }

            return {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              logo_url: waProfilePic || tenant.logo_url,
              role: tenant.role,
              created_at: tenant.created_at,
              phoneCount,
              phoneNumber: phones?.[0]?.display_number,
              verifiedName: phones?.[0]?.verified_name ?? undefined,
              memberCount,
              status,
              messagesThisWeek,
              lastActive: tenant.updated_at || tenant.created_at,
            };
          })
        );
        if (!isCancelled) setWorkspaces(enriched);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
        if (!isCancelled) {
          setWorkspaces(tenants.map((t) => ({
            id: t.id, name: t.name, slug: t.slug, role: t.role, created_at: t.created_at,
            phoneCount: 0, memberCount: 0, status: 'setup' as const,
          })));
        }
      } finally {
        if (!isCancelled) setLoadingDetails(false);
      }
    };
    fetchWorkspaceDetails();
    return () => { isCancelled = true; };
  }, [tenants]);

  // Filter + sort
  const filteredWorkspaces = useMemo(() => {
    let result = [...workspaces];
    if (searchQuery) result = result.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterBy !== 'all') {
      if (['connected', 'setup', 'attention'].includes(filterBy)) {
        result = result.filter(w => w.status === filterBy);
      } else {
        result = result.filter(w => w.role === filterBy);
      }
    }
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.lastActive || b.created_at).getTime() - new Date(a.lastActive || a.created_at).getTime());
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [workspaces, searchQuery, sortBy, filterBy]);

  const handleSelectWorkspace = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate(workspace.role === 'agent' ? '/inbox' : '/dashboard');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTenants();
    setIsRefreshing(false);
  };

  const handleCreateWorkspace = async (name: string, purpose: string, connectNow: boolean) => {
    setIsCreating(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error, tenant } = await createTenant(name, slug);
    if (!error && tenant) {
      setModalOpen(false);
      navigate(connectNow ? '/phone-numbers/connect' : '/dashboard');
    }
    setIsCreating(false);
  };

  const handleSignOut = async () => {
    setCurrentTenant(null);
    await signOut();
    navigate('/login', { replace: true });
  };

  // 3-dot menu handlers
  const [renameTarget, setRenameTarget] = useState<WorkspaceEnriched | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase.from('tenants').update({ name: renameValue.trim() }).eq('id', renameTarget.id);
    setRenaming(false);
    if (error) {
      toast.error('Failed to rename workspace');
    } else {
      toast.success('Workspace renamed');
      setWorkspaces(prev => prev.map(w => w.id === renameTarget.id ? { ...w, name: renameValue.trim() } : w));
      await refreshTenants();
    }
    setRenameTarget(null);
  };

  const handleManageMembers = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) { setCurrentTenant(tenant); navigate('/team'); }
  };

  const handleSettings = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) { setCurrentTenant(tenant); navigate('/settings'); }
  };

  const [archiveTarget, setArchiveTarget] = useState<WorkspaceEnriched | null>(null);
  const [archiving, setArchiving] = useState(false);
  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    setWorkspaces(prev => prev.filter(w => w.id !== archiveTarget.id));
    toast.success('Workspace hidden from list');
    setArchiving(false);
    setArchiveTarget(null);
  };

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recently opened',
    newest: 'Newest first',
    alphabetical: 'Alphabetical',
  };

  const connectedCount = workspaces.filter(w => w.status === 'connected').length;
  const setupPending = workspaces.length - connectedCount;
  const totalMessages = workspaces.reduce((sum, w) => sum + (w.messagesThisWeek || 0), 0);
  const canCreateWorkspace = workspaces.some(w => ['owner', 'admin'].includes(w.role)) || workspaces.length === 0;

  // Build chart data from workspace messages (or fallback)
  const chartData = useMemo(() => {
    if (totalMessages > 0) {
      // Distribute pseudo-randomly across 7 days based on hash of names
      const seed = workspaces.reduce((s, w) => s + w.name.length, 0);
      return [4, 7, 5, 9, 6, 12, 8].map((n, i) => Math.max(1, Math.round((n + ((seed + i) % 5)) * (totalMessages / 50 + 1))));
    }
    return [3, 5, 4, 7, 5, 9, 6];
  }, [workspaces, totalMessages]);

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center animate-pulse shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            <p className="text-slate-600 font-medium">Loading workspaces...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/30 blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-green-200/30 to-emerald-100/20 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-700" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Header */}
        <header className="relative bg-white/70 backdrop-blur-xl border-b border-emerald-100/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/">
              <img src={aireatroLogo} alt="AiReatro" className="h-10 w-auto hover:opacity-80 transition-opacity" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-600 hover:text-slate-900 h-10 px-3">
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-3 sm:px-6 py-6 sm:py-10 max-w-7xl pb-24 md:pb-12">
          {/* HERO: Command Center */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8"
          >
            {/* Left: title + stats */}
            <div className="lg:col-span-3 space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/70 text-emerald-700 text-[11px] font-semibold mb-3">
                  <Sparkles className="w-3 h-3" />
                  Workspace Command Center
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  Workspace <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">Command Center</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
                  Manage all your WhatsApp API numbers, teams, automation and business conversations from one powerful dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard icon={Building2} label="Total Workspaces" value={workspaces.length} gradient="from-emerald-500 to-green-600" delay={0.05} />
                <StatCard icon={Wifi} label="WhatsApp Connected" value={connectedCount} gradient="from-teal-500 to-emerald-600" delay={0.1} />
                <StatCard icon={AlertCircle} label="Setup Pending" value={setupPending} gradient="from-amber-400 to-orange-500" delay={0.15} />
                <StatCard icon={MessageSquare} label="Messages / Week" value={totalMessages} gradient="from-green-500 to-lime-600" delay={0.2} />
              </div>
            </div>

            {/* Right: analytics graph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-100/80 p-5 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.25)]"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-200/40 blur-3xl" />
              <div className="relative flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Weekly activity</p>
                  <h3 className="text-lg font-bold text-slate-900">Messages overview</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-200/70 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> +18%
                </span>
              </div>
              <div className="relative h-32 sm:h-36">
                <WeeklyActivityChart data={chartData} />
              </div>
              <div className="relative grid grid-cols-7 gap-1 mt-1 text-[10px] text-slate-400 font-medium text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              <div className="relative grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-100/70">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WA Active
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" /> Automations
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Teams
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* CREATE WORKSPACE GLASS PANEL */}
          {canCreateWorkspace && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-emerald-50/60 to-teal-50/40 backdrop-blur-xl border border-emerald-100/80 shadow-[0_15px_50px_-20px_rgba(16,185,129,0.25)] mb-10"
            >
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-teal-300/15 blur-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 lg:p-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold mb-3 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Get Started
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Create a New WhatsApp Workspace
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md">
                    Connect a new brand, branch, client or WhatsApp number in minutes.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setModalOpen(true)}
                      className="h-12 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Workspace
                    </Button>
                    <Button asChild variant="outline" className="h-12 px-6 rounded-2xl font-semibold border-emerald-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                      <Link to="/help/workspaces">
                        How Workspaces Work
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* 3D-style illustration via SVG */}
                <div className="relative h-56 sm:h-64 hidden md:block">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="relative w-40 h-64 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-700 shadow-2xl border-4 border-slate-800 overflow-hidden">
                      <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-white p-3">
                        <div className="w-full h-1 rounded-full bg-emerald-100 mb-3" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600" />
                            <div className="flex-1 h-2 rounded-full bg-emerald-100" />
                          </div>
                          <div className="ml-8 h-8 rounded-xl rounded-tl-sm bg-emerald-100/80 px-2 flex items-center">
                            <div className="h-1.5 w-12 rounded-full bg-emerald-300" />
                          </div>
                          <div className="ml-auto w-24 h-8 rounded-xl rounded-tr-sm bg-gradient-to-br from-emerald-400 to-green-500" />
                          <div className="ml-8 h-8 rounded-xl rounded-tl-sm bg-emerald-100/80" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating chips */}
                  {[
                    { icon: MessageSquare, x: '-10%', y: '10%', delay: 0 },
                    { icon: Users, x: '85%', y: '20%', delay: 0.4 },
                    { icon: Zap, x: '-5%', y: '70%', delay: 0.8 },
                    { icon: TrendingUp, x: '85%', y: '70%', delay: 1.2 },
                  ].map((chip, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: chip.delay, ease: 'easeInOut' }}
                      style={{ left: chip.x, top: chip.y }}
                      className="absolute w-12 h-12 rounded-2xl bg-white shadow-xl border border-emerald-100 flex items-center justify-center"
                    >
                      <chip.icon className="w-5 h-5 text-emerald-600" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* WORKSPACES LIST */}
          {loadingDetails ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-white/70 border border-emerald-100/60 p-6">
                  <div className="flex gap-3 mb-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-20" /></div>
                  </div>
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-20 w-full mb-3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <WorkspaceEmptyState />
          ) : (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Workspaces</h2>
                  <p className="text-sm text-slate-500 mt-1">All your connected WhatsApp API workspaces in one place.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:flex-none sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search workspaces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 text-sm rounded-2xl border-emerald-100 bg-white/80 backdrop-blur focus-visible:ring-emerald-500/30"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 h-10 rounded-2xl border-emerald-100 bg-white/80 text-slate-700">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterBy('all')}>All {filterBy === 'all' && '✓'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('connected')}>Connected {filterBy === 'connected' && '✓'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('setup')}>Needs setup {filterBy === 'setup' && '✓'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 h-10 rounded-2xl border-emerald-100 bg-white/80 text-slate-700">
                        <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                        <span className="sm:hidden">Sort</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('recent')}>Recently opened {sortBy === 'recent' && '✓'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest first {sortBy === 'newest' && '✓'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>Alphabetical {sortBy === 'alphabetical' && '✓'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline" size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-10 w-10 rounded-2xl border-emerald-100 bg-white/80 text-slate-700"
                  >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur rounded-3xl border border-emerald-100/70">
                  <p className="text-slate-500">No workspaces match your filters.</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setFilterBy('all'); }} className="mt-2 text-emerald-600">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWorkspaces.map((workspace) => (
                    <WorkspaceTile
                      key={workspace.id}
                      workspace={workspace}
                      onSelect={() => handleSelectWorkspace(workspace)}
                      onRename={() => { setRenameTarget(workspace); setRenameValue(workspace.name); }}
                      onManageMembers={() => handleManageMembers(workspace)}
                      onSettings={() => handleSettings(workspace)}
                      onArchive={() => setArchiveTarget(workspace)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Security footer */}
          {workspaces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 sm:mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-5 sm:p-6 text-white shadow-2xl"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 ring-1 ring-white/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">Your data is secure and encrypted.</h3>
                  <p className="text-sm text-white/80 mt-0.5">Each workspace is linked to one WhatsApp Business API number.</p>
                </div>
                <Button asChild variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-semibold w-full sm:w-auto">
                  <Link to="/security">Learn more <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </motion.div>
          )}
        </main>

        {/* Mobile sticky CTA */}
        {canCreateWorkspace && (
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-xl border-t border-emerald-100 sm:hidden z-40">
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full h-12 rounded-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        )}

        <CreateWorkspaceModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCreateWorkspace={handleCreateWorkspace}
          isCreating={isCreating}
        />

        {/* Rename Dialog */}
        <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Rename Workspace</DialogTitle>
              <DialogDescription>Enter a new name for this workspace.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rename-input">Workspace name</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
              <Button onClick={handleRename} disabled={renaming || !renameValue.trim()}>
                {renaming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive */}
        <Dialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Archive Workspace</DialogTitle>
              <DialogDescription>
                Are you sure you want to archive <strong>{archiveTarget?.name}</strong>? It will be hidden from your workspace list.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
                {archiving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
