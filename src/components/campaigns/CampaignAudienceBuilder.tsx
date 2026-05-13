import { useCallback, useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Globe2,
  Megaphone,
  Plus,
  Shield,
  Sparkles,
  Tag,
  Target,
  Trash2,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAttributeKeys } from '@/hooks/useContactAttributes';
import { CampaignWizardState } from '@/types/campaign';
import { INBOX_LEAD_STATUSES, SELECT_SENTINELS, INBOX_LEAD_STATUS_LABEL } from '@/lib/inboxLeadStatus';
import { cn } from '@/lib/utils';
import { useAudienceEstimate } from './audience/useAudienceEstimate';

// ── Types kept backward-compatible with previous AudienceFilters shape ──────────
interface SegmentOption { id: string; name: string; contact_count: number | null; }
interface TagOption { id: string; name: string; color: string | null; }
interface AgentOption { user_id: string; display_name: string | null; email: string; }
interface FlowOption { id: string; name: string; status: string; }
interface MetaCampaignOption { id: string; name: string; status: string | null; }
interface SelectedContactOption { id: string; name: string | null; wa_id: string | null; }

export interface AudienceFilters {
  source: 'all' | 'segments' | 'tags' | 'contacts' | 'filters';
  include_segments: string[];
  exclude_segments: string[];
  include_tags: string[];
  exclude_tags: string[];
  selected_contacts: string[];
  matched_contact_ids: string[];
  assigned_agent: string;
  lead_states: string[];
  crm_statuses: string[];
  mau_statuses: string[];
  priorities: string[];
  date_from: string;
  date_to: string;
  meta_campaign_source: string;
  flow_source: string;
  contact_source: string;
  attributes: { key: string; value: string }[];
  is_unreplied: 'all' | 'yes' | 'no';
  exclude_recent_days: number;
  opt_in_only: boolean;
}

export const DEFAULT_AUDIENCE_FILTERS: AudienceFilters = {
  source: 'all',
  include_segments: [],
  exclude_segments: [],
  include_tags: [],
  exclude_tags: [],
  selected_contacts: [],
  matched_contact_ids: [],
  assigned_agent: '',
  lead_states: [],
  crm_statuses: [],
  mau_statuses: [],
  priorities: [],
  date_from: '',
  date_to: '',
  meta_campaign_source: '',
  flow_source: '',
  contact_source: '',
  attributes: [],
  is_unreplied: 'all',
  exclude_recent_days: 0,
  opt_in_only: true,
};

// Friendly label, value matches contacts.source values used elsewhere
const CONTACT_SOURCES: { value: string; label: string }[] = [
  { value: 'ctwa', label: 'Facebook / Click-to-WhatsApp Ads' },
  { value: 'widget', label: 'Website Widget' },
  { value: 'organic', label: 'WhatsApp (Organic)' },
  { value: 'import', label: 'CSV Import' },
  { value: 'broadcast', label: 'Broadcast' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'api', label: 'API' },
  { value: 'qr', label: 'QR Code' },
  { value: 'referral', label: 'Referral' },
];

interface Props {
  wizard: CampaignWizardState;
  segments: SegmentOption[];
  tags: TagOption[];
  selectedContactsPreview: SelectedContactOption[];
  audienceFilters: AudienceFilters;
  onFiltersChange: (filters: AudienceFilters) => void;
  estimatedCount: number;
  onEstimatedCountChange: (count: number) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const niceDate = (s: string) => {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const timeAgo = (ts: number | null) => {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
};

// ─── Animated count-up ──────────────────────────────────────────────────────────
function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (value === display) return;
    const start = display;
    const diff = value - start;
    const duration = 450;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]); // eslint-disable-line
  return <>{display.toLocaleString()}</>;
}

// ─── Section wrapper (premium accordion card) ───────────────────────────────────
function Section({
  icon: Icon,
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: ElementType;
  title: string;
  description?: string;
  badge?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn('overflow-hidden transition-all', open ? 'ring-1 ring-primary/20 shadow-sm' : 'hover:bg-muted/30')}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-center gap-4 p-4">
            <div className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
              open ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{title}</span>
                {badge ? (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{badge}</Badge>
                ) : null}
              </div>
              {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
            </div>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-4 space-y-4 border-t bg-muted/20">
            <div className="pt-4 space-y-4">{children}</div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function CampaignAudienceBuilder({
  segments,
  tags,
  selectedContactsPreview,
  audienceFilters: filters,
  onFiltersChange: setFilters,
  onEstimatedCountChange,
}: Props) {
  const { currentTenant } = useTenant();
  const attributeKeys = useAttributeKeys();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [flows, setFlows] = useState<FlowOption[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaignOption[]>([]);

  // Fetch supporting data
  useEffect(() => {
    if (!currentTenant?.id) return;
    let cancelled = false;
    (async () => {
      const [agentRes, flowRes, metaRes] = await Promise.all([
        supabase.from('agents').select('user_id, display_name, is_active').eq('tenant_id', currentTenant.id).eq('is_active', true),
        supabase.from('automation_workflows').select('id, name, status').eq('tenant_id', currentTenant.id).eq('is_deleted', false).order('name'),
        (supabase as any).from('smeksh_meta_ad_campaigns').select('id, campaign_name, status').eq('workspace_id', currentTenant.id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (cancelled) return;

      if (agentRes.data) {
        const userIds = agentRes.data.map((a: any) => a.user_id).filter(Boolean);
        let pmap = new Map<string, any>();
        if (userIds.length) {
          const { data } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
          pmap = new Map((data || []).map((p: any) => [p.id, p]));
        }
        setAgents(agentRes.data.map((a: any) => ({
          user_id: a.user_id,
          display_name: a.display_name || pmap.get(a.user_id)?.full_name || null,
          email: pmap.get(a.user_id)?.email || '',
        })));
      }
      setFlows((flowRes.data || []) as FlowOption[]);
      setMetaCampaigns(((metaRes.data || []) as any[]).map((i) => ({ id: i.id, name: i.campaign_name, status: i.status })));
    })();
    return () => { cancelled = true; };
  }, [currentTenant?.id]);

  const segmentNameById = useMemo(() => new Map(segments.map((s) => [s.id, s.name])), [segments]);

  const usingDirectContacts = filters.selected_contacts.length > 0;
  const estimate = useAudienceEstimate(currentTenant?.id, filters, segmentNameById, !usingDirectContacts);

  // Surface estimate errors as toasts (deduplicated by message, throttled)
  const lastErrorRef = useRef<{ msg: string; at: number } | null>(null);
  useEffect(() => {
    if (!estimate.error) return;
    const msg = estimate.error;
    const now = Date.now();
    const last = lastErrorRef.current;
    if (last && last.msg === msg && now - last.at < 8000) return;
    lastErrorRef.current = { msg, at: now };
    toast.error('Could not update audience estimate', {
      description: msg,
      duration: 5000,
    });
  }, [estimate.error]);

  // Push results back up to wizard
  useEffect(() => {
    if (usingDirectContacts) {
      onEstimatedCountChange(filters.selected_contacts.length);
      if (filters.matched_contact_ids.length) setFilters({ ...filters, matched_contact_ids: [] });
      return;
    }
    onEstimatedCountChange(estimate.total);
    const next = estimate.contactIds;
    const prev = filters.matched_contact_ids;
    if (prev.length !== next.length || prev.some((id, i) => id !== next[i])) {
      setFilters({ ...filters, matched_contact_ids: next });
    }
  }, [estimate.total, estimate.contactIds, usingDirectContacts]); // eslint-disable-line

  const update = <K extends keyof AudienceFilters>(key: K, value: AudienceFilters[K]) =>
    setFilters({ ...filters, [key]: value });

  const toggleArray = (key: keyof AudienceFilters, value: string) => {
    const arr = (filters[key] as string[]) || [];
    update(key, (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]) as any);
  };

  const clearAll = () => setFilters({ ...DEFAULT_AUDIENCE_FILTERS, selected_contacts: filters.selected_contacts });

  // Active filter chips
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.assigned_agent === SELECT_SENTINELS.unassigned) {
    chips.push({ key: 'agent', label: 'Unassigned', onRemove: () => update('assigned_agent', '') });
  } else if (filters.assigned_agent) {
    const a = agents.find((x) => x.user_id === filters.assigned_agent);
    chips.push({ key: 'agent', label: `Agent: ${a?.display_name || a?.email || 'Selected'}`, onRemove: () => update('assigned_agent', '') });
  }
  filters.lead_states.forEach((s) =>
    chips.push({ key: `ls-${s}`, label: INBOX_LEAD_STATUS_LABEL[s] || s, onRemove: () => update('lead_states', filters.lead_states.filter((x) => x !== s)) }),
  );
  if (filters.contact_source) {
    const src = CONTACT_SOURCES.find((s) => s.value === filters.contact_source);
    chips.push({ key: 'src', label: `Source: ${src?.label || filters.contact_source}`, onRemove: () => update('contact_source', '') });
  }
  if (filters.date_from || filters.date_to) {
    chips.push({
      key: 'date',
      label: `Created: ${niceDate(filters.date_from) || '…'} → ${niceDate(filters.date_to) || '…'}`,
      onRemove: () => setFilters({ ...filters, date_from: '', date_to: '' }),
    });
  }
  filters.include_tags.forEach((id) => {
    const t = tags.find((x) => x.id === id);
    chips.push({ key: `tag-${id}`, label: `Tag: ${t?.name || id}`, onRemove: () => update('include_tags', filters.include_tags.filter((x) => x !== id)) });
  });
  filters.exclude_tags.forEach((id) => {
    const t = tags.find((x) => x.id === id);
    chips.push({ key: `xtag-${id}`, label: `Exclude tag: ${t?.name || id}`, onRemove: () => update('exclude_tags', filters.exclude_tags.filter((x) => x !== id)) });
  });
  if (filters.flow_source) {
    const f = flows.find((x) => x.id === filters.flow_source);
    chips.push({ key: 'flow', label: `Flow: ${f?.name || 'Selected'}`, onRemove: () => update('flow_source', '') });
  }
  if (filters.meta_campaign_source) {
    const m = metaCampaigns.find((x) => x.id === filters.meta_campaign_source);
    chips.push({ key: 'meta', label: `Meta: ${m?.name || 'Selected'}`, onRemove: () => update('meta_campaign_source', '') });
  }
  filters.attributes.filter((a) => a.key && a.value).forEach((a, i) =>
    chips.push({ key: `attr-${i}`, label: `${a.key}: ${a.value}`, onRemove: () => update('attributes', filters.attributes.filter((_, idx) => idx !== i)) }),
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  if (usingDirectContacts) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Direct recipient list</p>
            <p className="text-2xl font-bold">{filters.selected_contacts.length.toLocaleString()} contacts</p>
            <p className="text-xs text-muted-foreground mt-1">
              Audience filters are disabled while a direct list is selected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Premium audience summary — sticky so users see live changes while filtering */}
      <div className="sticky top-2 z-30 -mx-1 px-1">
        <Card className={cn(
          'overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background/95 to-background/95 backdrop-blur-md shadow-lg transition-all',
          estimate.loading && 'ring-2 ring-primary/40',
        )}>
          {/* live update progress bar */}
          <div className={cn('h-0.5 w-full bg-primary/20 overflow-hidden', !estimate.loading && 'opacity-0 transition-opacity')}>
            <div className="h-full w-1/3 bg-primary animate-[slide-in-right_1.2s_ease-in-out_infinite]" />
          </div>
          <CardContent className="p-4 sm:p-5" aria-busy={estimate.loading} aria-live="polite">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Estimated Audience
                  {estimate.loading && (
                    <span className="inline-flex items-center gap-1 text-primary normal-case tracking-normal font-medium animate-pulse">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      Updating…
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  {estimate.loading && estimate.updatedAt === null ? (
                    <>
                      <Skeleton className="h-9 w-20 sm:h-10 sm:w-28" />
                      <Skeleton className="h-3 w-14 hidden sm:block" />
                    </>
                  ) : (
                    <>
                      <span className={cn('text-3xl sm:text-4xl font-bold tracking-tight transition-opacity', estimate.loading && 'opacity-60')}>
                        <AnimatedCount value={estimate.total} />
                      </span>
                      <span className="text-sm text-muted-foreground">contacts</span>
                    </>
                  )}
                </div>
                {estimate.loading && estimate.updatedAt === null ? (
                  <Skeleton className="h-3 w-40 sm:w-64 mt-2" />
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                    {estimate.error
                      ? 'Last estimate failed — showing previous result.'
                      : estimate.loading
                      ? 'Recalculating with your latest filters…'
                      : `Matches ${estimate.total.toLocaleString()} ${estimate.total === 1 ? 'contact' : 'contacts'} in this workspace.`}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" /> {chips.length} filter{chips.length === 1 ? '' : 's'}
                </Badge>
                {estimate.loading && estimate.updatedAt === null ? (
                  <Skeleton className="h-5 w-20" />
                ) : estimate.updatedAt && !estimate.loading ? (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> {timeAgo(estimate.updatedAt)}
                  </Badge>
                ) : null}
                {estimate.error && (
                  <Badge variant="destructive" className="text-[10px]">Error</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active chips bar */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <Badge key={c.key} variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 group">
              <span className="text-xs">{c.label}</span>
              <button
                onClick={c.onRemove}
                className="h-4 w-4 rounded-full hover:bg-muted-foreground/20 inline-flex items-center justify-center transition"
                aria-label={`Remove ${c.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearAll}>
            <Trash2 className="h-3 w-3 mr-1" /> Clear all
          </Button>
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-3">
        {/* Segments */}
        <Section icon={Target} title="Segments" description="Use saved audience segments" badge={filters.include_segments.length || filters.exclude_segments.length} defaultOpen={false}>
          {segments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No segments yet. Create one from the Contacts page.</p>
          ) : (
            <div className="space-y-2">
              {segments.map((s) => {
                const included = filters.include_segments.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleArray('include_segments', s.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition',
                      included ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={cn('h-4 w-4', included ? 'text-primary' : 'text-muted-foreground/40')} />
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.contact_count ?? 0}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Tags */}
        <Section icon={Tag} title="Tags" description="Include or exclude tagged contacts" badge={filters.include_tags.length} defaultOpen={false}>
          <div>
            <Label className="text-xs">Include tags</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet.</span>}
              {tags.map((t) => {
                const on = filters.include_tags.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleArray('include_tags', t.id)}
                    className={cn(
                      'text-xs rounded-full px-3 py-1 border transition',
                      on ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
                    )}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Team & Ownership */}
        <Section icon={Users} title="Team & Ownership" description="Assigned agent or unassigned contacts" badge={filters.assigned_agent ? 1 : 0} defaultOpen={true}>
          <div className="space-y-2">
            <Label className="text-xs">Assigned Agent</Label>
            <Select
              value={filters.assigned_agent || SELECT_SENTINELS.none}
              onValueChange={(v) => update('assigned_agent', v === SELECT_SENTINELS.none || v === SELECT_SENTINELS.all ? '' : v)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_SENTINELS.none}>Select agent…</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    {a.display_name || a.email || a.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
                <SelectItem value={SELECT_SENTINELS.unassigned}>Unassigned contacts</SelectItem>
                <SelectItem value={SELECT_SENTINELS.all}>All agents (no filter)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Specific agent matches both contact-level and conversation-level assignments.
            </p>
          </div>
        </Section>

        {/* Lead Journey */}
        <Section icon={Workflow} title="Lead Journey" description="Match Inbox lead status (multi-select)" badge={filters.lead_states.length} defaultOpen={true}>
          <div className="flex flex-wrap gap-1.5">
            {INBOX_LEAD_STATUSES.map((s) => {
              const on = filters.lead_states.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleArray('lead_states', s.value)}
                  className={cn(
                    'text-xs rounded-full px-3 py-1.5 border transition flex items-center gap-1.5',
                    on ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', s.color)} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Date & Activity */}
        <DateSection filters={filters} setFilters={setFilters} />

        {/* Contact Source */}
        <Section icon={Globe2} title="Contact Source" description="Where the contact originated" badge={filters.contact_source ? 1 : 0} defaultOpen={true}>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => update('contact_source', '')}
              className={cn(
                'text-xs rounded-full px-3 py-1.5 border transition',
                filters.contact_source === '' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
              )}
            >
              All Sources
            </button>
            {CONTACT_SOURCES.map((s) => {
              const on = filters.contact_source === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('contact_source', on ? '' : s.value)}
                  className={cn(
                    'text-xs rounded-full px-3 py-1.5 border transition',
                    on ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Campaigns & Automation */}
        <Section icon={Megaphone} title="Campaigns & Automation" description="From a flow or Meta ad campaign" badge={(filters.flow_source ? 1 : 0) + (filters.meta_campaign_source ? 1 : 0)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Automation Flow</Label>
              <Select value={filters.flow_source || SELECT_SENTINELS.all} onValueChange={(v) => update('flow_source', v === SELECT_SENTINELS.all ? '' : v)}>
                <SelectTrigger className="h-10 mt-1.5"><SelectValue placeholder="Any flow" /></SelectTrigger>
                <SelectContent>
                  {flows.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  <SelectItem value={SELECT_SENTINELS.all}>Any flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Meta Ad Campaign</Label>
              <Select value={filters.meta_campaign_source || SELECT_SENTINELS.all} onValueChange={(v) => update('meta_campaign_source', v === SELECT_SENTINELS.all ? '' : v)}>
                <SelectTrigger className="h-10 mt-1.5"><SelectValue placeholder="Any campaign" /></SelectTrigger>
                <SelectContent>
                  {metaCampaigns.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  <SelectItem value={SELECT_SENTINELS.all}>Any campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        {/* Advanced Attributes */}
        <Section icon={Zap} title="Advanced Attributes" description="Custom attribute key + value matches" badge={filters.attributes.filter((a) => a.key && a.value).length}>
          <div className="space-y-2">
            {filters.attributes.length === 0 && (
              <p className="text-xs text-muted-foreground">No attribute filters yet.</p>
            )}
            {filters.attributes.map((attr, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-[11px]">Key</Label>
                  <Select value={attr.key || SELECT_SENTINELS.none} onValueChange={(v) => {
                    const next = [...filters.attributes]; next[i] = { ...attr, key: v === SELECT_SENTINELS.none ? '' : v }; update('attributes', next);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select key" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SELECT_SENTINELS.none}>Select key…</SelectItem>
                      {(attributeKeys || []).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-[11px]">Value contains</Label>
                  <Input className="h-9" value={attr.value} onChange={(e) => { const next = [...filters.attributes]; next[i] = { ...attr, value: e.target.value }; update('attributes', next); }} />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => update('attributes', filters.attributes.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update('attributes', [...filters.attributes, { key: '', value: '' }])}>
              <Plus className="h-3 w-3 mr-1" /> Add attribute
            </Button>
          </div>
        </Section>

        {/* Safety & Exclusions */}
        <Section icon={Shield} title="Safety & Exclusions" description="Opt-in, blocked, recently contacted, exclude tags" badge={(filters.exclude_tags.length || 0) + (filters.exclude_recent_days ? 1 : 0)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Opt-in only</p>
                <p className="text-xs text-muted-foreground">Skip contacts who have opted out</p>
              </div>
              <Switch checked={filters.opt_in_only} onCheckedChange={(v) => update('opt_in_only', v)} />
            </div>

            <div>
              <Label className="text-xs">Skip contacts messaged in last (days)</Label>
              <Input
                type="number"
                min={0}
                value={filters.exclude_recent_days || 0}
                onChange={(e) => update('exclude_recent_days', Math.max(0, parseInt(e.target.value || '0', 10)))}
                className="h-9 mt-1.5 w-32"
              />
            </div>

            <div>
              <Label className="text-xs">Exclude tags</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet.</span>}
                {tags.map((t) => {
                  const on = filters.exclude_tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleArray('exclude_tags', t.id)}
                      className={cn(
                        'text-xs rounded-full px-3 py-1 border transition',
                        on ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background hover:bg-muted',
                      )}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ─── Date section with presets + popover calendar ───────────────────────────────
function DateSection({
  filters,
  setFilters,
}: {
  filters: AudienceFilters;
  setFilters: (f: AudienceFilters) => void;
}) {
  const [pendingFrom, setPendingFrom] = useState<Date | undefined>(filters.date_from ? new Date(filters.date_from) : undefined);
  const [pendingTo, setPendingTo] = useState<Date | undefined>(filters.date_to ? new Date(filters.date_to) : undefined);
  const [open, setOpen] = useState(false);

  const applyPreset = (preset: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from: Date;
    let to: Date = new Date(today);
    if (preset === 'today') from = today;
    else if (preset === 'yesterday') {
      from = new Date(today); from.setDate(from.getDate() - 1);
      to = new Date(from);
    } else if (preset === 'last7') { from = new Date(today); from.setDate(from.getDate() - 6); }
    else if (preset === 'last30') { from = new Date(today); from.setDate(from.getDate() - 29); }
    else { from = new Date(today.getFullYear(), today.getMonth(), 1); }
    setFilters({ ...filters, date_from: formatDate(from), date_to: formatDate(to) });
  };

  const apply = () => {
    setFilters({
      ...filters,
      date_from: pendingFrom ? formatDate(pendingFrom) : '',
      date_to: pendingTo ? formatDate(pendingTo) : '',
    });
    setOpen(false);
  };

  const clear = () => {
    setPendingFrom(undefined); setPendingTo(undefined);
    setFilters({ ...filters, date_from: '', date_to: '' });
  };

  const hasRange = !!(filters.date_from || filters.date_to);

  return (
    <Section icon={Calendar} title="Date & Activity" description="When contacts were created" badge={hasRange ? 1 : 0}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            ['today', 'Today'],
            ['yesterday', 'Yesterday'],
            ['last7', 'Last 7 days'],
            ['last30', 'Last 30 days'],
            ['thisMonth', 'This month'],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPreset(k as any)}
              className="text-xs rounded-full px-3 py-1.5 border bg-background hover:bg-muted transition"
            >
              {label}
            </button>
          ))}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="text-xs rounded-full px-3 py-1.5 border bg-background hover:bg-muted transition inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Custom range
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="range"
                selected={{ from: pendingFrom, to: pendingTo }}
                onSelect={(range: any) => { setPendingFrom(range?.from); setPendingTo(range?.to); }}
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
              <div className="flex items-center justify-between gap-2 p-3 border-t">
                <Button variant="ghost" size="sm" onClick={() => { setPendingFrom(undefined); setPendingTo(undefined); }}>Reset</Button>
                <Button size="sm" onClick={apply}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
          {hasRange && (
            <button onClick={clear} className="text-xs rounded-full px-3 py-1.5 border bg-background hover:bg-muted transition inline-flex items-center gap-1">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        {hasRange && (
          <p className="text-xs text-muted-foreground">
            From <span className="font-medium text-foreground">{niceDate(filters.date_from) || '—'}</span> to <span className="font-medium text-foreground">{niceDate(filters.date_to) || '—'}</span>
          </p>
        )}
      </div>
    </Section>
  );
}
