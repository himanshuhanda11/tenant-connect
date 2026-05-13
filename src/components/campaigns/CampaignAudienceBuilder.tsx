import { useCallback, useEffect, useState, type ElementType, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Megaphone,
  Plus,
  Shield,
  Sparkles,
  Tag,
  Target,
  Trash2,
  User,
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

interface SegmentOption {
  id: string;
  name: string;
  contact_count: number | null;
}

interface TagOption {
  id: string;
  name: string;
  color: string | null;
}

interface AgentOption {
  user_id: string;
  display_name: string | null;
  email: string;
}

interface FlowOption {
  id: string;
  name: string;
  status: string;
}

interface MetaCampaignOption {
  id: string;
  name: string;
  status: string | null;
}

interface SelectedContactOption {
  id: string;
  name: string | null;
  wa_id: string | null;
}

export interface AudienceFilters {
  // Sources
  source: 'all' | 'segments' | 'tags' | 'contacts' | 'filters';
  include_segments: string[];
  exclude_segments: string[];
  include_tags: string[];
  exclude_tags: string[];
  selected_contacts: string[];
  matched_contact_ids: string[];
  // Advanced filters
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

const CONTACT_SOURCES = [
  { value: 'ctwa', label: 'Click-to-WhatsApp Ads' },
  { value: 'organic', label: 'Organic' },
  { value: 'api', label: 'API' },
  { value: 'import', label: 'CSV Import' },
  { value: 'manual', label: 'Manual Entry' },
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

const PAGE_SIZE = 1000;

const areStringArraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const parseLocalDate = (dateValue: string): Date | null => {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDayStartUtc = (dateValue: string): string | null => {
  const date = parseLocalDate(dateValue);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
};

const getLocalDayEndExclusiveUtc = (dateValue: string): string | null => {
  const date = parseLocalDate(dateValue);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0).toISOString();
};

const formatVisibleDate = (dateValue: string) => {
  const date = parseLocalDate(dateValue);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

function VisibleDateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 min-w-0 cursor-pointer bg-card pr-9 text-transparent caret-transparent [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-date-and-time-value]:text-transparent [&::-webkit-datetime-edit]:text-transparent"
        />
        <span className="pointer-events-none absolute inset-y-0 left-3 right-9 flex items-center truncate text-sm font-semibold text-foreground">
          {formatVisibleDate(value) || 'Select date'}
        </span>
      </div>
    </div>
  );
}

interface AudienceFilterSectionProps {
  id: string;
  icon: ElementType;
  title: string;
  badge?: number | string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: ReactNode;
}

function AudienceFilterSection({
  id,
  icon: Icon,
  title,
  badge,
  isOpen,
  onOpenChange,
  children,
}: AudienceFilterSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof isOpen === 'boolean';
  const resolvedOpen = isControlled ? Boolean(isOpen) : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <Collapsible open={resolvedOpen} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium">{title}</span>
            {badge !== undefined && badge !== 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {badge}
              </Badge>
            )}
          </div>
          {resolvedOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent id={`${id}-content`}>
        <div className="px-3 pb-3 pt-1 ml-11 space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CampaignAudienceBuilder({
  wizard,
  segments,
  tags,
  selectedContactsPreview,
  audienceFilters: filters,
  onFiltersChange: setFilters,
  estimatedCount,
  onEstimatedCountChange,
}: Props) {
  const { currentTenant } = useTenant();
  const attributeKeys = useAttributeKeys();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [flows, setFlows] = useState<FlowOption[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<MetaCampaignOption[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);

  // Fetch agents, flows, meta campaigns
  useEffect(() => {
    if (!currentTenant?.id) return;

    const fetchExtras = async () => {
      const [agentRes, flowRes, metaRes] = await Promise.all([
        supabase
          .from('agents')
          .select('user_id, display_name, is_active')
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true),
        supabase
          .from('automation_workflows')
          .select('id, name, status')
          .eq('tenant_id', currentTenant.id)
          .eq('is_deleted', false)
          .order('name'),
        (supabase as any)
          .from('smeksh_meta_ad_campaigns')
          .select('id, campaign_name, status')
          .eq('workspace_id', currentTenant.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      // For agents, get profile info — keep all active agents even when profile lookup is empty
      if (agentRes.data) {
        const userIds = agentRes.data.map((a: any) => a.user_id).filter(Boolean);
        let profileMap = new Map<string, any>();
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        }
        setAgents(
          agentRes.data.map((a: any) => ({
            user_id: a.user_id,
            display_name: a.display_name || profileMap.get(a.user_id)?.full_name || null,
            email: profileMap.get(a.user_id)?.email || '',
          }))
        );
      }

      setFlows((flowRes.data || []) as FlowOption[]);
      setMetaCampaigns(
        ((metaRes.data || []) as Array<{ id: string; campaign_name: string; status: string | null }>).map((item) => ({
          id: item.id,
          name: item.campaign_name,
          status: item.status,
        }))
      );
    };

    fetchExtras();
  }, [currentTenant?.id]);

  const estimateAudience = useCallback(async () => {
    if (!currentTenant?.id) return;

    // Uploaded/direct contacts are already an explicit recipient list.
    if (filters.selected_contacts.length > 0) {
      onEstimatedCountChange(filters.selected_contacts.length);
      if (filters.matched_contact_ids.length > 0) {
        setFilters({ ...filters, matched_contact_ids: [] });
      }
      return;
    }

    setIsEstimating(true);
    try {
      let allowedIds: Set<string> | null = null;
      let excludedIds = new Set<string>();
      let assignedSummaryIds: Set<string> | null = null;

      if (filters.include_tags.length > 0) {
        const { data, error } = await supabase
          .from('contact_tags')
          .select('contact_id')
          .in('tag_id', filters.include_tags);
        if (error) throw error;
        allowedIds = new Set((data || []).map((row) => row.contact_id).filter(Boolean));
      }

      if (filters.exclude_tags.length > 0) {
        const { data, error } = await supabase
          .from('contact_tags')
          .select('contact_id')
          .in('tag_id', filters.exclude_tags);
        if (error) throw error;
        excludedIds = new Set((data || []).map((row) => row.contact_id).filter(Boolean));
      }

      const validAttributes = filters.attributes.filter((attribute) => attribute.key && attribute.value);
      for (const attribute of validAttributes) {
        const { data, error } = await supabase
          .from('contact_attributes')
          .select('contact_id')
          .eq('tenant_id', currentTenant.id)
          .eq('key', attribute.key)
          .ilike('value', `%${attribute.value}%`);
        if (error) throw error;
        const attributeIds = new Set((data || []).map((row) => row.contact_id).filter(Boolean));
        allowedIds = allowedIds
          ? new Set([...allowedIds].filter((id) => attributeIds.has(id)))
          : attributeIds;
      }

      if (allowedIds && allowedIds.size === 0) {
        onEstimatedCountChange(0);
        if (filters.matched_contact_ids.length > 0) {
          setFilters({ ...filters, matched_contact_ids: [] });
        }
        return;
      }

      // Specific agent selected → restrict via inbox summary (covers conversation-level assignment).
      // Unassigned uses contacts.assigned_agent_id IS NULL on the main query below.
      if (filters.assigned_agent && filters.assigned_agent !== SELECT_SENTINELS.unassigned) {
        const { data, error } = await supabase
          .from('contact_inbox_summary')
          .select('contact_id')
          .eq('tenant_id', currentTenant.id)
          .eq('assigned_to', filters.assigned_agent);
        if (error) throw error;
        assignedSummaryIds = new Set((data || []).map((row) => row.contact_id).filter(Boolean));
      }

      // Lead Status (Inbox CRM) — filter via conversations.crm_status to stay in sync with Inbox
      if (filters.lead_states.length > 0) {
        const { data, error } = await supabase
          .from('conversations')
          .select('contact_id')
          .eq('tenant_id', currentTenant.id)
          .in('crm_status', filters.lead_states as any);
        if (error) throw error;
        const leadIds = new Set((data || []).map((row: any) => row.contact_id).filter(Boolean));
        if (leadIds.size === 0) {
          onEstimatedCountChange(0);
          if (filters.matched_contact_ids.length > 0) setFilters({ ...filters, matched_contact_ids: [] });
          return;
        }
        allowedIds = allowedIds
          ? new Set([...allowedIds].filter((id) => leadIds.has(id)))
          : leadIds;
      }

      if (filters.is_unreplied !== 'all' || filters.exclude_recent_days > 0) {
        let summaryQuery = supabase
          .from('contact_inbox_summary')
          .select('contact_id')
          .eq('tenant_id', currentTenant.id);

        if (filters.is_unreplied !== 'all') summaryQuery = summaryQuery.eq('is_unreplied', filters.is_unreplied === 'yes');
        if (filters.exclude_recent_days > 0) {
          const cutoff = new Date(Date.now() - filters.exclude_recent_days * 24 * 60 * 60 * 1000).toISOString();
          summaryQuery = summaryQuery.or(`last_message_at.is.null,last_message_at.lt.${cutoff}`);
        }

        const { data, error } = await summaryQuery;
        if (error) throw error;
        const summaryIds = new Set((data || []).map((row) => row.contact_id).filter(Boolean));
        allowedIds = allowedIds
          ? new Set([...allowedIds].filter((id) => summaryIds.has(id)))
          : summaryIds;
      }

      if (allowedIds && allowedIds.size === 0) {
        onEstimatedCountChange(0);
        if (filters.matched_contact_ids.length > 0) {
          setFilters({ ...filters, matched_contact_ids: [] });
        }
        return;
      }

      const buildQuery = () => {
        let query = supabase
          .from('contacts')
          .select('id, segment, assigned_agent_id')
          .eq('tenant_id', currentTenant.id);

        if (filters.opt_in_only) query = query.eq('opt_out', false);
        if (filters.contact_source) query = query.eq('source', filters.contact_source);
        if (filters.flow_source) query = query.eq('automation_flow', filters.flow_source);
        if (filters.meta_campaign_source) query = query.eq('campaign_source', filters.meta_campaign_source);
        if (filters.assigned_agent === SELECT_SENTINELS.unassigned) {
          query = query.is('assigned_agent_id', null);
        }

        const selectedSegments = segments.filter((segment) => filters.include_segments.includes(segment.id));
        const excludedSegments = segments.filter((segment) => filters.exclude_segments.includes(segment.id));
        const selectedSegmentNames = selectedSegments.map((segment) => segment.name).filter(Boolean);
        const excludedSegmentNames = excludedSegments.map((segment) => segment.name).filter(Boolean);
        if (selectedSegmentNames.length > 0) query = query.in('segment', selectedSegmentNames);

      let normalizedDateFrom = filters.date_from;
      let normalizedDateTo = filters.date_to;
      const fromDate = parseLocalDate(filters.date_from);
      const toDate = parseLocalDate(filters.date_to);

      if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
        normalizedDateFrom = formatDateInputValue(toDate);
        normalizedDateTo = formatDateInputValue(fromDate);
      }

      const fromBoundaryUtc = getLocalDayStartUtc(normalizedDateFrom);
      const toBoundaryUtc = getLocalDayEndExclusiveUtc(normalizedDateTo);

        if (fromBoundaryUtc) query = query.gte('created_at', fromBoundaryUtc);
        if (toBoundaryUtc) query = query.lt('created_at', toBoundaryUtc);

        return query.order('created_at', { ascending: false });
      };

      const contactIds: string[] = [];
      const excludedSegmentNames = segments
        .filter((segment) => filters.exclude_segments.includes(segment.id))
        .map((segment) => segment.name)
        .filter(Boolean);
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        const ids = (data || [])
          .filter((row) => !row.segment || !excludedSegmentNames.includes(row.segment))
          .filter((row) => {
            const a = filters.assigned_agent;
            if (!a || a === SELECT_SENTINELS.all) return true;
            if (a === SELECT_SENTINELS.unassigned) return !row.assigned_agent_id;
            return row.assigned_agent_id === a || assignedSummaryIds?.has(row.id);
          })
          .map((row) => row.id)
          .filter((id) => Boolean(id) && (!allowedIds || allowedIds.has(id)) && !excludedIds.has(id));
        contactIds.push(...ids);
        if (!data || data.length < PAGE_SIZE) break;
      }

      const filteredCount = contactIds.length;
      onEstimatedCountChange(filteredCount);

      if (!areStringArraysEqual(filters.matched_contact_ids, contactIds)) {
        setFilters({ ...filters, matched_contact_ids: contactIds });
      }
    } catch (err) {
      console.error('Audience estimation error:', err);
      onEstimatedCountChange(0);
    } finally {
      setIsEstimating(false);
    }
  }, [currentTenant?.id, filters, segments, onEstimatedCountChange, setFilters]);

  useEffect(() => {
    const timer = setTimeout(estimateAudience, 400);
    return () => clearTimeout(timer);
  }, [estimateAudience]);

  const updateFilter = <K extends keyof AudienceFilters>(key: K, value: AudienceFilters[K]) => {
    setFilters({
      ...filters,
      [key]: value,
      matched_contact_ids: key === 'matched_contact_ids' ? (value as string[]) : [],
    });
  };

  const toggleInArray = (key: 'include_segments' | 'exclude_segments' | 'include_tags' | 'exclude_tags' | 'lead_states', value: string) => {
    const current = filters[key];
    if (current.includes(value)) {
      updateFilter(key, current.filter((v) => v !== value));
    } else {
      updateFilter(key, [...current, value]);
    }
  };

  const addAttribute = () => {
    updateFilter('attributes', [...filters.attributes, { key: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...filters.attributes];
    updated[index] = { ...updated[index], [field]: val };
    updateFilter('attributes', updated);
  };

  const removeAttribute = (index: number) => {
    updateFilter('attributes', filters.attributes.filter((_, i) => i !== index));
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.include_segments.length > 0) count++;
    if (filters.exclude_segments.length > 0) count++;
    if (filters.include_tags.length > 0) count++;
    if (filters.exclude_tags.length > 0) count++;
    if (filters.assigned_agent && filters.assigned_agent !== SELECT_SENTINELS.all) count++;
    if (filters.lead_states.length > 0) count++;
    if (filters.date_from || filters.date_to) count++;
    if (filters.contact_source) count++;
    if (filters.meta_campaign_source) count++;
    if (filters.flow_source) count++;
    if (filters.attributes.length > 0) count++;
    if (filters.is_unreplied !== 'all') count++;
    if (filters.selected_contacts.length > 0) count++;
    return count;
  };


  const FilterSection = AudienceFilterSection;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold leading-tight">Build your target audience</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pick from <strong>Segments</strong>, <strong>Tags</strong>, or apply <strong>filters</strong> like agent, lead status, date and source. The estimate updates live on the right.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 self-start sm:self-auto">
            <Filter className="h-3 w-3" />
            {activeFilterCount()} active
          </Badge>
        </div>
      </div>

      {/* Direct Contacts Banner */}
      {filters.selected_contacts.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {filters.selected_contacts.length} contacts selected directly
                  </p>
                  {selectedContactsPreview.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate max-w-sm">
                      {selectedContactsPreview
                        .slice(0, 4)
                        .map((c) => c.name || c.wa_id || c.id)
                        .join(', ')}
                      {selectedContactsPreview.length > 4
                        ? ` +${selectedContactsPreview.length - 4} more`
                        : ''}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('selected_contacts', [])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Sections */}
      <div className="grid lg:grid-cols-[1fr,320px] gap-5">
        {/* Left: Filters */}
        <Card className="overflow-hidden">
          <div
            className="overflow-y-auto pr-1"
            style={{
              maxHeight: 'min(68vh, var(--radix-popover-content-available-height, 68vh))',
              scrollbarGutter: 'stable',
            }}
          >
            <div className="divide-y divide-border">
              {/* Segments */}
              <FilterSection
                id="segments"
                icon={Target}
                title="Segments"
                badge={filters.include_segments.length}
              >
                {segments.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    No saved segments found for this workspace yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {segments.map((seg) => (
                      <button
                        key={seg.id}
                        type="button"
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-sm text-left
                          ${filters.include_segments.includes(seg.id)
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'hover:border-muted-foreground/30'
                          }`}
                        onClick={() => toggleInArray('include_segments', seg.id)}
                      >
                        <span>{seg.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {(seg.contact_count || 0).toLocaleString()}
                          </Badge>
                          {filters.include_segments.includes(seg.id) && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </FilterSection>



              {/* Assigned Agent */}
              <FilterSection
                id="agent"
                icon={User}
                title="Assigned Agent"
                badge={filters.assigned_agent && filters.assigned_agent !== SELECT_SENTINELS.all ? 1 : 0}
              >
                <Select
                  value={filters.assigned_agent || SELECT_SENTINELS.none}
                  onValueChange={(v) =>
                    updateFilter(
                      'assigned_agent',
                      v === SELECT_SENTINELS.none || v === SELECT_SENTINELS.all ? '' : v
                    )
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_SENTINELS.none}>Select Agent</SelectItem>
                    {agents.length === 0 ? (
                      <SelectItem value="__no_agents__" disabled>
                        No agents in this workspace
                      </SelectItem>
                    ) : (
                      agents.map((agent) => (
                        <SelectItem key={agent.user_id} value={agent.user_id}>
                          {agent.display_name || agent.email || agent.user_id}
                        </SelectItem>
                      ))
                    )}
                    <SelectItem value={SELECT_SENTINELS.unassigned}>Unassigned</SelectItem>
                    <SelectItem value={SELECT_SENTINELS.all}>All Agents</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Lead Status — synced with Inbox CRM stages */}
              <FilterSection
                id="lead"
                icon={Zap}
                title="Lead Status"
                badge={filters.lead_states.length}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Same statuses as Inbox. Selecting nothing means no lead-status filter.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {INBOX_LEAD_STATUSES.map((state) => (
                    <Badge
                      key={state.value}
                      variant={filters.lead_states.includes(state.value) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleInArray('lead_states', state.value)}
                    >
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${state.color}`} />
                      {state.label}
                    </Badge>
                  ))}
                </div>
                {filters.lead_states.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs mt-2"
                    onClick={() => updateFilter('lead_states', [])}
                  >
                    Clear (All Statuses)
                  </Button>
                )}

                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Reply Status</p>
                <Select
                  value={filters.is_unreplied}
                  onValueChange={(v) => updateFilter('is_unreplied', v as 'all' | 'yes' | 'no')}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Unreplied Only</SelectItem>
                    <SelectItem value="no">Replied Only</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Date Range */}
              <FilterSection
                id="date"
                icon={Calendar}
                title="Date Range"
                badge={filters.date_from || filters.date_to ? 1 : 0}
              >
                <div className="grid grid-cols-2 gap-2">
                  <VisibleDateInput
                    label="From"
                    value={filters.date_from}
                    onChange={(value) => updateFilter('date_from', value)}
                  />
                  <VisibleDateInput
                    label="To"
                    value={filters.date_to}
                    onChange={(value) => updateFilter('date_to', value)}
                  />
                </div>
                {filters.assigned_agent && !(filters.date_from || filters.date_to) && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Tip: combining an agent with a date range will only count contacts <strong>created</strong> in that window and assigned to that agent.
                  </p>
                )}
              </FilterSection>

              {/* Contact Source */}
              <FilterSection
                id="source"
                icon={Sparkles}
                title="Contact Source"
                badge={filters.contact_source ? 1 : 0}
              >
                <Select
                  value={filters.contact_source || SELECT_SENTINELS.none}
                  onValueChange={(v) =>
                    updateFilter(
                      'contact_source',
                      v === SELECT_SENTINELS.none || v === SELECT_SENTINELS.all ? '' : v
                    )
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_SENTINELS.none}>Select Source</SelectItem>
                    {CONTACT_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                    <SelectItem value={SELECT_SENTINELS.all}>All Sources</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Meta Ads Campaign */}
              <FilterSection
                id="meta"
                icon={Megaphone}
                title="From Meta Ads"
                badge={filters.meta_campaign_source ? 1 : 0}
              >
                {metaCampaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No Meta Ads campaigns found</p>
                ) : (
                  <Select
                    value={filters.meta_campaign_source || 'all'}
                    onValueChange={(v) =>
                      updateFilter('meta_campaign_source', v === 'all' ? '' : v)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Meta Campaigns</SelectItem>
                      {metaCampaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FilterSection>

              {/* Automation / Flow */}
              <FilterSection
                id="flow"
                icon={Workflow}
                title="From Flow / Automation"
                badge={filters.flow_source ? 1 : 0}
              >
                {flows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No flows found</p>
                ) : (
                  <Select
                    value={filters.flow_source || 'all'}
                    onValueChange={(v) => updateFilter('flow_source', v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select flow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Flows</SelectItem>
                      {flows.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FilterSection>

              {/* Custom Attributes */}
              <FilterSection
                id="attributes"
                icon={Filter}
                title="Custom Attributes"
                badge={filters.attributes.filter((a) => a.key).length}
              >
                <div className="space-y-2">
                  {filters.attributes.map((attr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Select
                        value={attr.key || 'select'}
                        onValueChange={(v) => updateAttribute(i, 'key', v === 'select' ? '' : v)}
                      >
                        <SelectTrigger className="h-9 flex-1">
                          <SelectValue placeholder="Key" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select" disabled>
                            Select key
                          </SelectItem>
                          {attributeKeys.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="h-9 flex-1"
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => removeAttribute(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={addAttribute}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Attribute Filter
                  </Button>
                </div>
              </FilterSection>

              {/* Tags */}
              <FilterSection
                id="tags"
                icon={Tag}
                title="Tags"
                badge={filters.include_tags.length}
              >
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available yet. Upload a CSV or tag contacts first.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={filters.include_tags.includes(tag.id) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleInArray('include_tags', tag.id)}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{
                            backgroundColor: tag.color || 'hsl(var(--muted-foreground))',
                          }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </FilterSection>

              {/* Exclusions */}
              <FilterSection id="exclusions" icon={Shield} title="Safety & Exclusions">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border bg-red-50/50 border-red-200/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Opted-out contacts</span>
                    </div>
                    <Badge className="bg-red-100 text-red-700 text-xs">Auto-excluded</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Opt-in contacts only</span>
                    </div>
                    <Switch
                      checked={filters.opt_in_only}
                      onCheckedChange={(v) => updateFilter('opt_in_only', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Exclude messaged in last 24h</span>
                    </div>
                    <Switch
                      checked={filters.exclude_recent_days > 0}
                      onCheckedChange={(v) => updateFilter('exclude_recent_days', v ? 1 : 0)}
                    />
                  </div>

                  {/* Exclude Tags */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium">Exclude Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      ) : (
                        tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={
                              filters.exclude_tags.includes(tag.id)
                                ? 'destructive'
                                : 'outline'
                            }
                            className="cursor-pointer text-xs"
                            onClick={() => toggleInArray('exclude_tags', tag.id)}
                          >
                            {tag.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Exclude Segments */}
                  {segments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium">Exclude Segments</p>
                      <div className="space-y-1">
                        {segments.map((seg) => (
                          <div
                            key={seg.id}
                            className={`flex items-center justify-between p-2 rounded-md border cursor-pointer text-xs transition-all
                              ${filters.exclude_segments.includes(seg.id)
                                ? 'border-destructive bg-destructive/5'
                                : 'hover:border-muted-foreground/30'
                              }`}
                            onClick={() => toggleInArray('exclude_segments', seg.id)}
                          >
                            <span>{seg.name}</span>
                            {filters.exclude_segments.includes(seg.id) && (
                              <X className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FilterSection>
            </div>
          </div>
        </Card>

        {/* Right: Audience Summary */}
        <div className="space-y-4">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 sticky top-4">
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Estimated Audience
                </p>
                <p className="text-4xl font-bold text-primary mt-1">
                  {isEstimating ? '...' : estimatedCount.toLocaleString()}
                </p>
              </div>

              <Separator />

              {/* Active Filters Summary */}
              <div className="space-y-2 text-xs">
                {filters.include_segments.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Segments</span>
                    <span className="font-medium">{filters.include_segments.length} included</span>
                  </div>
                )}
                {filters.include_tags.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tags</span>
                    <span className="font-medium">{filters.include_tags.length} included</span>
                  </div>
                )}
                {filters.assigned_agent && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Agent</span>
                    <span className="font-medium">
                      {agents.find((a) => a.user_id === filters.assigned_agent)?.display_name || 'Selected'}
                    </span>
                  </div>
                )}
                {filters.lead_states.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lead Status</span>
                    <span className="font-medium">{filters.lead_states.join(', ')}</span>
                  </div>
                )}
                {filters.mau_statuses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MAU Status</span>
                    <span className="font-medium">{filters.mau_statuses.join(', ')}</span>
                  </div>
                )}
                {filters.priorities.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="font-medium">{filters.priorities.join(', ')}</span>
                  </div>
                )}
                {(filters.date_from || filters.date_to) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date Range</span>
                    <span className="font-medium">
                      {filters.date_from || '...'} → {filters.date_to || '...'}
                    </span>
                  </div>
                )}
                {filters.contact_source && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium capitalize">{filters.contact_source}</span>
                  </div>
                )}
                {filters.meta_campaign_source && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Meta Ads</span>
                    <span className="font-medium truncate max-w-[140px]">
                      {metaCampaigns.find((c) => c.id === filters.meta_campaign_source)?.name || 'Selected'}
                    </span>
                  </div>
                )}
                {filters.flow_source && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Flow</span>
                    <span className="font-medium truncate max-w-[140px]">
                      {flows.find((f) => f.id === filters.flow_source)?.name || 'Selected'}
                    </span>
                  </div>
                )}
                {filters.selected_contacts.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direct</span>
                    <span className="font-medium">{filters.selected_contacts.length} contacts</span>
                  </div>
                )}
                {filters.exclude_tags.length > 0 && (
                  <div className="flex items-center justify-between text-destructive">
                    <span>Excluded Tags</span>
                    <span className="font-medium">{filters.exclude_tags.length}</span>
                  </div>
                )}
                {filters.exclude_segments.length > 0 && (
                  <div className="flex items-center justify-between text-destructive">
                    <span>Excluded Segments</span>
                    <span className="font-medium">{filters.exclude_segments.length}</span>
                  </div>
                )}

                {activeFilterCount() === 0 && (
                  <p className="text-center text-muted-foreground py-2">
                    No filters applied — targeting all opted-in contacts
                  </p>
                )}
              </div>

              {activeFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => setFilters(DEFAULT_AUDIENCE_FILTERS)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
