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

const LEAD_STATES = [
  { value: 'new', label: 'New', color: 'bg-emerald-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-violet-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-amber-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'won', label: 'Won', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
];

const CRM_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up_required', label: 'Follow-up Required' },
  { value: 'converted', label: 'Converted' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'junk', label: 'Junk' },
];

const MAU_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-amber-500' },
  { value: 'churned', label: 'Churned', color: 'bg-red-500' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CONTACT_SOURCES = [
  { value: '', label: 'All Sources' },
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
  const [internalOpen, setInternalOpen] = useState(true);
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

      // For agents, get profile info
      if (agentRes.data) {
        const userIds = agentRes.data.map((a: any) => a.user_id);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
          setAgents(
            agentRes.data.map((a: any) => ({
              user_id: a.user_id,
              display_name: a.display_name || profileMap.get(a.user_id)?.full_name || null,
              email: profileMap.get(a.user_id)?.email || '',
            }))
          );
        }
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

    const hasAdvancedFilters =
      filters.include_segments.length > 0 ||
      filters.exclude_segments.length > 0 ||
      filters.include_tags.length > 0 ||
      filters.exclude_tags.length > 0 ||
      filters.assigned_agent !== '' ||
      filters.lead_states.length > 0 ||
      filters.crm_statuses.length > 0 ||
      filters.mau_statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.date_from !== '' ||
      filters.date_to !== '' ||
      filters.meta_campaign_source !== '' ||
      filters.flow_source !== '' ||
      filters.contact_source !== '' ||
      filters.attributes.some((a) => a.key && a.value) ||
      filters.is_unreplied !== 'all' ||
      filters.exclude_recent_days > 0;

    // Keep imported direct contacts only when no advanced filter is active
    if (filters.selected_contacts.length > 0 && !hasAdvancedFilters) {
      onEstimatedCountChange(filters.selected_contacts.length);
      return;
    }

    setIsEstimating(true);
    try {
      let query = supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id);

      if (filters.opt_in_only) {
        query = query.or('opt_in_status.eq.true,and(opt_in_status.is.null,opt_out.eq.false)');
      }
      if (filters.mau_statuses.length > 0) query = query.in('mau_status', filters.mau_statuses as any);
      if (filters.priorities.length > 0) query = query.in('priority_level', filters.priorities as any);
      if (filters.lead_states.length > 0) query = query.in('lead_status', filters.lead_states as any);
      if (filters.crm_statuses.length > 0) query = query.in('deal_stage', filters.crm_statuses as any);
      if (filters.assigned_agent) query = query.eq('assigned_agent_id', filters.assigned_agent);
      if (filters.contact_source) query = query.eq('source', filters.contact_source);
      if (filters.flow_source) query = query.eq('automation_flow', filters.flow_source);
      if (filters.meta_campaign_source) query = query.eq('campaign_source', filters.meta_campaign_source);

      const selectedSegments = segments.filter((segment) => filters.include_segments.includes(segment.id));
      const selectedSegmentNames = selectedSegments.map((segment) => segment.name).filter(Boolean);
      if (selectedSegmentNames.length > 0) {
        query = query.in('segment', selectedSegmentNames);
      }

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

      let segmentCount: number | null = null;
      if (filters.include_segments.length > 0) {
        segmentCount = selectedSegments.reduce((total, segment) => total + (segment.contact_count || 0), 0);
      }

      const { count, error } = await query;
      if (error) throw error;

      const filteredCount = count || 0;

      if (segmentCount !== null) {
        onEstimatedCountChange(filteredCount > 0 ? Math.min(segmentCount, filteredCount) : segmentCount);
      } else {
        onEstimatedCountChange(filteredCount);
      }
    } catch (err) {
      console.error('Audience estimation error:', err);
    } finally {
      setIsEstimating(false);
    }
  }, [currentTenant?.id, filters, segments, onEstimatedCountChange]);

  useEffect(() => {
    const timer = setTimeout(estimateAudience, 400);
    return () => clearTimeout(timer);
  }, [estimateAudience]);

  const updateFilter = <K extends keyof AudienceFilters>(key: K, value: AudienceFilters[K]) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleInArray = (key: 'include_segments' | 'exclude_segments' | 'include_tags' | 'exclude_tags' | 'lead_states' | 'crm_statuses' | 'mau_statuses' | 'priorities', value: string) => {
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
    if (filters.include_tags.length > 0) count++;
    if (filters.assigned_agent) count++;
    if (filters.lead_states.length > 0) count++;
    if (filters.crm_statuses.length > 0) count++;
    if (filters.mau_statuses.length > 0) count++;
    if (filters.priorities.length > 0) count++;
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Target Audience</h3>
          <p className="text-sm text-muted-foreground">
            Build your audience with advanced filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
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

              {/* Tags */}
              <FilterSection
                id="tags"
                icon={Tag}
                title="Tags"
                badge={filters.include_tags.length}
              >
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available</p>
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

              {/* Assigned Agent */}
              <FilterSection
                id="agent"
                icon={User}
                title="Assigned Agent"
                badge={filters.assigned_agent ? 1 : 0}
              >
                <Select
                  value={filters.assigned_agent || 'all'}
                  onValueChange={(v) => updateFilter('assigned_agent', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.user_id} value={agent.user_id}>
                        {agent.display_name || agent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterSection>

              {/* Lead Status */}
              <FilterSection
                id="lead"
                icon={Zap}
                title="Lead Status"
                badge={filters.lead_states.length}
              >
                <div className="flex flex-wrap gap-1.5">
                  {LEAD_STATES.map((state) => (
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

                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground font-medium mb-1.5">CRM Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {CRM_STATUSES.map((status) => (
                    <Badge
                      key={status.value}
                      variant={filters.crm_statuses.includes(status.value) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleInArray('crm_statuses', status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>

                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground font-medium mb-1.5">MAU Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {MAU_STATUSES.map((status) => (
                    <Badge
                      key={status.value}
                      variant={filters.mau_statuses.includes(status.value) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleInArray('mau_statuses', status.value)}
                    >
                      <div className={`w-2 h-2 rounded-full mr-1 ${status.color}`} />
                      {status.label}
                    </Badge>
                  ))}
                </div>

                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITIES.map((p) => (
                    <Badge
                      key={p.value}
                      variant={filters.priorities.includes(p.value) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleInArray('priorities', p.value)}
                    >
                      {p.label}
                    </Badge>
                  ))}
                </div>

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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => updateFilter('date_from', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => updateFilter('date_to', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Contact Source */}
              <FilterSection
                id="source"
                icon={Sparkles}
                title="Contact Source"
                badge={filters.contact_source ? 1 : 0}
              >
                <Select
                  value={filters.contact_source || 'all'}
                  onValueChange={(v) => updateFilter('contact_source', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_SOURCES.map((s) => (
                      <SelectItem key={s.value || 'all'} value={s.value || 'all'}>
                        {s.label}
                      </SelectItem>
                    ))}
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
