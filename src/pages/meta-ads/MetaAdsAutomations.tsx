import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Facebook, Loader2, MessageCircle, Plus, RefreshCw, Route, Search, TrendingUp, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import { useTeamMembers, useTeams } from '@/hooks/useTeam';
import { useWhatsAppAdSources, adSourceLabel, type WhatsAppAdSource } from '@/hooks/useWhatsAppAdSources';
import { useMetaAdAutomations, type MetaAdAutomation } from '@/hooks/useMetaAdAutomations';
import { describeAssignment } from '@/lib/metaAdRouting';
import { findWinningRoutingRule, getTargetAdIds, routingSpecificity, sortAutomationsByPriority } from '@/lib/metaAdTargeting';
import { AdRoutingRow } from '@/components/meta-ads/routing/AdRoutingRow';
import { RoutingRuleCard } from '@/components/meta-ads/routing/RoutingRuleCard';
import { RoutingRuleDialog } from '@/components/meta-ads/routing/RoutingRuleDialog';
import { cn } from '@/lib/utils';

type TabKey = 'ads' | 'rules' | 'campaigns';
type AdFilter = 'all' | 'routed' | 'unrouted';

const DAY = 24 * 60 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

interface CampaignAdRow { id: string; name: string; status: string; campaignId: string; campaignName: string; leads: number }

export default function MetaAdsAutomations() {
  const { currentTenant } = useTenant();
  const { campaigns, connectedAccounts, refetch: refetchMeta } = useMetaAdAccounts();
  const { members } = useTeamMembers();
  const { teams } = useTeams();
  const { adSources, isLoading: adsLoading, dataUpdatedAt: adsUpdatedAt, refetch: refetchAds, rename } = useWhatsAppAdSources();
  const { automations, isLoading: rulesLoading, dataUpdatedAt: rulesUpdatedAt, refetch: refetchRules, toggle, remove } = useMetaAdAutomations();

  const [params, setParams] = useSearchParams();
  const tab = (['ads', 'rules', 'campaigns'].includes(params.get('tab') || '') ? params.get('tab') : 'ads') as TabKey;
  const setTab = (next: string) => setParams(p => { p.set('tab', next); return p; }, { replace: true });

  const [adFilter, setAdFilter] = useState<AdFilter>('all');
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'live' | 'off'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MetaAdAutomation | null>(null);
  const [presetAdIds, setPresetAdIds] = useState<string[] | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<MetaAdAutomation | null>(null);
  const [, setTick] = useState(0);

  // Keep "Updated … ago" fresh.
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  // ---------- Derived data ----------
  const campaignAdRows = useMemo<CampaignAdRow[]>(() => campaigns.flatMap(c => {
    const raw = c.raw_meta_data as { ads?: Array<{ id?: string; name?: string; status?: string; effective_status?: string }> } | null;
    const ads = raw?.ads?.length ? raw.ads : [{ id: c.meta_ad_id || c.id, name: c.ad_name || c.campaign_name, status: c.status }];
    return ads.map((ad, i) => ({
      id: ad.id || `${c.id}-${i}`,
      name: ad.name || c.campaign_name,
      status: (ad.effective_status || ad.status || c.status || '').toLowerCase(),
      campaignId: c.id,
      campaignName: c.campaign_name,
      leads: Number(c.leads_count || 0),
    }));
  }), [campaigns]);

  const campaignIdsByAdId = useMemo(() => {
    const map = new Map<string, string[]>();
    campaignAdRows.forEach(r => map.set(r.id, [...(map.get(r.id) || []), r.campaignId]));
    return map;
  }, [campaignAdRows]);
  const metaStatusByAdId = useMemo(() => new Map(campaignAdRows.map(r => [r.id, r.status])), [campaignAdRows]);

  const ruleForAd = useCallback((adId: string, extraCampaignIds: string[] = []) => findWinningRoutingRule(automations, {
    referralSourceId: adId,
    matchedInternalCampaignIds: [...(campaignIdsByAdId.get(adId) || []), ...extraCampaignIds],
  }), [automations, campaignIdsByAdId]);

  const currentRuleByAdId = useMemo(() => {
    const map = new Map<string, MetaAdAutomation>();
    adSources.forEach(ad => { const r = ruleForAd(ad.ad_id); if (r) map.set(ad.ad_id, r); });
    return map;
  }, [adSources, ruleForAd]);

  const adLabelById = useMemo(() => new Map(adSources.map(a => [a.ad_id, adSourceLabel(a)])), [adSources]);
  const orderedRules = useMemo(() => sortAutomationsByPriority(automations), [automations]);

  const routedCount = adSources.filter(a => currentRuleByAdId.has(a.ad_id)).length;
  const unroutedCount = adSources.length - routedCount;
  const totalLeads = adSources.reduce((sum, a) => sum + (a.leads_count || 0), 0);
  const activeRules = automations.filter(a => a.is_active).length;
  const liveCampaignAds = campaignAdRows.filter(r => r.status === 'active').length;

  const query = search.trim().toLowerCase();
  const visibleAds = adSources
    .filter(ad => adFilter === 'all' || (adFilter === 'routed') === currentRuleByAdId.has(ad.ad_id))
    .filter(ad => !query || adSourceLabel(ad).toLowerCase().includes(query) || ad.ad_id.includes(query) || (ad.headline || '').toLowerCase().includes(query))
    .sort((a, b) => Number(currentRuleByAdId.has(a.ad_id)) - Number(currentRuleByAdId.has(b.ad_id)) || Date.parse(b.last_seen_at) - Date.parse(a.last_seen_at));

  const visibleCampaignAds = campaignAdRows
    .filter(r => campaignFilter === 'all' || (campaignFilter === 'live') === (r.status === 'active'))
    .filter(r => !query || r.name.toLowerCase().includes(query) || r.campaignName.toLowerCase().includes(query))
    .sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active') || a.name.localeCompare(b.name));

  const latestMetaSync = campaigns.reduce<string | null>((latest, c) =>
    c.last_synced_at && (!latest || c.last_synced_at > latest) ? c.last_synced_at : latest, null);
  const updatedAt = Math.max(adsUpdatedAt || 0, rulesUpdatedAt || 0);

  // ---------- Actions ----------
  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await withTimeout(Promise.all([refetchAds(), refetchRules(), refetchMeta()]), 15_000, 'Refresh is taking too long. Check your internet and try again.');
      toast.success('Up to date');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const syncingRef = useRef(false);
  const syncFromMeta = useCallback(async (silent = false) => {
    if (!currentTenant?.id || syncingRef.current) return;
    syncingRef.current = true;
    if (!silent) setSyncing(true);
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke('meta-ads-sync', { body: { tenantId: currentTenant.id } }),
        60_000, 'Meta is slow to answer. Your routing still works — try again in a minute.',
      );
      if (error) throw error;
      if (data?.error && !data?.success) throw new Error(data.error);
      await refetchMeta();
      if (!silent) toast.success(`Updated ${data?.synced || 0} campaigns from Meta`);
    } catch (err) {
      if (!silent) toast.error(err instanceof Error ? err.message : 'Could not update from Meta');
    } finally {
      syncingRef.current = false;
      if (!silent) setSyncing(false);
    }
  }, [currentTenant?.id, refetchMeta]);

  // Quietly refresh campaign status from Meta when it is older than 5 minutes.
  const latestSyncRef = useRef(latestMetaSync);
  latestSyncRef.current = latestMetaSync;
  useEffect(() => {
    if (connectedAccounts.length === 0) return;
    const maybeSync = () => {
      const last = latestSyncRef.current ? Date.parse(latestSyncRef.current) : 0;
      if (Date.now() - last > 5 * 60_000) void syncFromMeta(true);
    };
    maybeSync();
    const id = window.setInterval(maybeSync, 60_000);
    return () => window.clearInterval(id);
  }, [connectedAccounts.length, syncFromMeta]);

  const openNew = (adIds?: string[]) => { setEditing(null); setPresetAdIds(adIds); setDialogOpen(true); };
  const openEdit = (rule: MetaAdAutomation) => { setEditing(rule); setPresetAdIds(undefined); setDialogOpen(true); };

  const routeAd = (adId: string, rule: MetaAdAutomation | null) => {
    if (rule && routingSpecificity(rule) === 0) openEdit(rule);
    else openNew([adId]);
  };

  const handleToggle = async (rule: MetaAdAutomation) => {
    try {
      await toggle(rule.id, !rule.is_active);
      toast.success(rule.is_active ? 'Rule paused' : 'Rule turned on');
    } catch { toast.error('Could not update the rule'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await remove(deleteTarget.id); toast.success('Rule deleted'); }
    catch { toast.error('Could not delete the rule'); }
    finally { setDeleteTarget(null); }
  };

  const handleRename = async (ad: WhatsAppAdSource, name: string) => {
    try { await rename(ad.id, name); toast.success('Ad name saved'); }
    catch { toast.error('Only workspace admins can rename ads'); throw new Error('rename failed'); }
  };

  const adStatus = (ad: WhatsAppAdSource): { status: 'live' | 'paused' | 'recent' | 'quiet'; label: string } => {
    const meta = metaStatusByAdId.get(ad.ad_id);
    if (meta) return meta === 'active' ? { status: 'live', label: 'Live on Meta' } : { status: 'paused', label: 'Paused on Meta' };
    const age = Date.now() - Date.parse(ad.last_seen_at);
    if (age < DAY) return { status: 'recent', label: 'Chats today' };
    if (age < 7 * DAY) return { status: 'recent', label: 'Chats this week' };
    return { status: 'quiet', label: 'No recent chats' };
  };

  const ruleSources = (rule: MetaAdAutomation) => {
    const ads = getTargetAdIds(rule.trigger_conditions).map(id => adLabelById.get(id) || `Ad …${id.slice(-6)}`);
    const camps = (rule.trigger_campaign_ids || []).map(id => campaigns.find(c => c.id === id)?.campaign_name || 'Campaign');
    const all = [...ads, ...camps];
    return all.length ? all : ['Every ad'];
  };

  const loading = adsLoading || rulesLoading;

  // ---------- UI ----------
  const stats = [
    { key: 'all', label: 'Ads bringing chats', value: adSources.length, icon: MessageCircle, tone: 'bg-primary/10 text-primary', onClick: () => { setTab('ads'); setAdFilter('all'); } },
    { key: 'routed', label: 'Ads with agents', value: routedCount, icon: CheckCircle2, tone: 'bg-success/10 text-success', onClick: () => { setTab('ads'); setAdFilter('routed'); } },
    { key: 'unrouted', label: 'Ads needing agents', value: unroutedCount, icon: AlertTriangle, tone: unroutedCount ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground', onClick: () => { setTab('ads'); setAdFilter('unrouted'); } },
    { key: 'leads', label: 'Leads from ads', value: totalLeads.toLocaleString(), icon: TrendingUp, tone: 'bg-info/10 text-info', onClick: () => setTab('ads') },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Route className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Ad lead routing</h1>
              <p className="text-sm text-muted-foreground">See which agents get the WhatsApp leads from each ad.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">
              {updatedAt ? `Updated ${formatDistanceToNow(updatedAt, { addSuffix: true })}` : 'Loading…'}
            </span>
            <Button variant="outline" onClick={refreshAll} disabled={refreshing} className="flex-1 gap-2 sm:flex-none">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />Refresh
            </Button>
            <Button onClick={() => openNew()} className="flex-1 gap-2 sm:flex-none">
              <Plus className="h-4 w-4" />New routing
            </Button>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {stats.map(s => (
            <button key={s.key} type="button" onClick={s.onClick}
              className={cn('flex items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4',
                tab === 'ads' && adFilter === s.key && 'ring-2 ring-primary/40')}>
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.tone)}><s.icon className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block text-xl font-bold leading-6">{loading ? '–' : s.value}</span>
                <span className="block text-[11px] leading-4 text-muted-foreground sm:text-xs">{s.label}</span>
              </span>
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl p-1 md:w-auto">
              <TabsTrigger value="ads" className="gap-1.5 rounded-lg px-3 py-1.5">Ads → Agents<CountPill n={adSources.length} /></TabsTrigger>
              <TabsTrigger value="rules" className="gap-1.5 rounded-lg px-3 py-1.5">Routing rules<CountPill n={activeRules} /></TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-1.5 rounded-lg px-3 py-1.5">Facebook campaigns{campaigns.length > 0 && <CountPill n={liveCampaignAds} />}</TabsTrigger>
            </TabsList>
            {tab !== 'rules' && (
              <div className="relative md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === 'ads' ? 'Search ads' : 'Search ads or campaigns'} className="h-9 rounded-xl pl-9" />
              </div>
            )}
          </div>

          {/* Ads → Agents */}
          <TabsContent value="ads" className="mt-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Segmented value={adFilter} onChange={v => setAdFilter(v as AdFilter)} options={[
                { value: 'all', label: `All (${adSources.length})` },
                { value: 'unrouted', label: `Needs agents (${unroutedCount})` },
                { value: 'routed', label: `Has agents (${routedCount})` },
              ]} />
              <p className="text-[11px] text-muted-foreground">Ads appear here automatically when someone messages you from them.</p>
            </div>
            {loading ? <RowSkeletons /> : visibleAds.length === 0 ? (
              <Empty icon={MessageCircle} title={adSources.length === 0 ? 'No ad chats yet' : 'No ads match'}
                text={adSources.length === 0 ? 'When someone taps a Click-to-WhatsApp ad and messages you, the ad shows up here so you can pick its agents.' : 'Try another filter or search.'} />
            ) : visibleAds.map(ad => {
              const rule = currentRuleByAdId.get(ad.ad_id) || null;
              const st = adStatus(ad);
              return (
                <AdRoutingRow key={ad.id}
                  title={adSourceLabel(ad)}
                  subtitle={`Ad ID …${ad.ad_id.slice(-6)}${ad.display_name && ad.headline ? ` · ${ad.headline}` : ''}`}
                  leads={ad.leads_count}
                  lastChatAt={ad.last_seen_at}
                  status={st.status} statusLabel={st.label}
                  ruleName={rule?.name}
                  ruleIsGeneral={!!rule && routingSpecificity(rule) === 2}
                  summary={rule ? describeAssignment(rule.actions, members, teams) : null}
                  onRoute={() => routeAd(ad.ad_id, rule)}
                  onRename={name => handleRename(ad, name)}
                  renameValue={ad.display_name || adSourceLabel(ad)}
                />
              );
            })}
          </TabsContent>

          {/* Rules */}
          <TabsContent value="rules" className="mt-0 space-y-3">
            <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              Each new ad lead goes to the <span className="font-semibold text-foreground">first rule that matches</span>, in the order shown: rules for specific ads come first, “every ad” rules last.
            </div>
            {loading ? <RowSkeletons /> : orderedRules.length === 0 ? (
              <Empty icon={Zap} title="No routing rules yet" text="Pick agents for an ad and a rule is saved here." action={<Button onClick={() => openNew()} className="gap-2"><Plus className="h-4 w-4" />New routing</Button>} />
            ) : orderedRules.map((rule, i) => (
              <RoutingRuleCard key={rule.id}
                order={i + 1}
                name={rule.name}
                isActive={rule.is_active}
                sources={ruleSources(rule)}
                summary={describeAssignment(rule.actions, members, teams)}
                extras={(rule.actions || []).filter(a => ['send_template', 'add_tag', 'start_workflow'].includes(String(a.type))).map(a => ({ type: String(a.type), label: String(a.label || a.type) }))}
                leadsHandled={rule.executions_count || 0}
                lastRunAt={rule.last_executed_at}
                onEdit={() => openEdit(rule)}
                onToggle={() => void handleToggle(rule)}
                onDelete={() => setDeleteTarget(rule)}
              />
            ))}
          </TabsContent>

          {/* Campaigns */}
          <TabsContent value="campaigns" className="mt-0 space-y-3">
            {connectedAccounts.length === 0 ? (
              <Empty icon={Facebook} title="Facebook isn’t connected"
                text="Connect Facebook to see which campaigns are live or paused. Routing by ad already works without it."
                action={<Button asChild variant="outline"><Link to="/meta-ads/setup">Connect Facebook</Link></Button>} />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Segmented value={campaignFilter} onChange={v => setCampaignFilter(v as 'all' | 'live' | 'off')} options={[
                    { value: 'all', label: 'All' }, { value: 'live', label: 'Live' }, { value: 'off', label: 'Paused / off' },
                  ]} />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{latestMetaSync ? `From Meta ${formatDistanceToNow(new Date(latestMetaSync), { addSuffix: true })}` : 'Not synced yet'}</span>
                    <Button size="sm" variant="outline" onClick={() => void syncFromMeta()} disabled={syncing} className="gap-1.5">
                      {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Update from Meta
                    </Button>
                  </div>
                </div>
                {visibleCampaignAds.length === 0 ? (
                  <Empty icon={Facebook} title="No campaigns to show" text={campaigns.length === 0 ? 'Use “Update from Meta” to load your campaigns.' : 'Try another filter or search.'} />
                ) : visibleCampaignAds.slice(0, 60).map(row => {
                  const rule = ruleForAd(row.id, [row.campaignId]);
                  return (
                    <AdRoutingRow key={`${row.campaignId}-${row.id}`}
                      title={row.name}
                      subtitle={`Campaign: ${row.campaignName}`}
                      leads={row.leads}
                      status={row.status === 'active' ? 'live' : 'paused'}
                      statusLabel={row.status === 'active' ? 'Live' : (row.status.replace(/_/g, ' ') || 'Off')}
                      ruleName={rule?.name}
                      ruleIsGeneral={!!rule && routingSpecificity(rule) === 2}
                      summary={rule ? describeAssignment(rule.actions, members, teams) : null}
                      onRoute={() => routeAd(row.id, rule)}
                    />
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <RoutingRuleDialog
        open={dialogOpen}
        onOpenChange={open => { setDialogOpen(open); if (!open) setEditing(null); }}
        editing={editing}
        presetAdIds={presetAdIds}
        adSources={adSources}
        campaigns={campaigns}
        connectedAccountId={connectedAccounts[0]?.id || null}
        members={members}
        teams={teams}
        currentRuleByAdId={currentRuleByAdId}
        onSaved={() => void refetchRules()}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this routing rule?</AlertDialogTitle>
            <AlertDialogDescription>
              New leads from {deleteTarget ? ruleSources(deleteTarget).join(', ') : 'these ads'} will go to your general auto-assign instead. Existing chats keep their agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function CountPill({ n }: { n: number }) {
  return <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[10px] font-semibold leading-4">{n}</span>;
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', value === o.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon className="h-6 w-6" /></span>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function RowSkeletons() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-[1.25fr_24px_1fr_auto] lg:items-center">
          <div className="space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
          <span />
          <div className="flex items-center gap-2"><Skeleton className="h-8 w-20 rounded-full" /><Skeleton className="h-4 w-24" /></div>
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </>
  );
}
