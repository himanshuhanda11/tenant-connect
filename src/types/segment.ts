export interface Segment {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  filters: SegmentFilters;
  contact_count: number;
  is_smart: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SegmentFilters {
  search?: string;
  leadStatus?: string[];
  priority?: string[];
  mauStatus?: string[];
  tags?: string[];
  excludeTags?: string[];
  segment?: string;
  optInStatus?: 'all' | 'opted_in' | 'opted_out';
  hasAgent?: 'all' | 'assigned' | 'unassigned';
  intervened?: 'all' | 'yes' | 'no';
  blocked?: 'all' | 'yes' | 'no';
  dataDeletionRequested?: 'all' | 'yes' | 'no';
  source?: string[];
  country?: string[];
  language?: string[];
  createdDateFrom?: string;
  createdDateTo?: string;
  lastMessageFrom?: string;
  lastMessageTo?: string;
  firstMessageFrom?: string;
  firstMessageTo?: string;
  // Lead CRM filters
  leadState?: string[];
  assignedTo?: string;
  claimedBy?: string;
  repliedBy?: string;
  isUnreplied?: 'all' | 'yes' | 'no';
  // Attribute filters
  attributes?: { key: string; value: string }[];
}

export interface SmartView {
  id: string;
  name: string;
  icon: string;
  filters: SegmentFilters;
  count?: number;
  isSystem: boolean;
}

export const DEFAULT_SMART_VIEWS: SmartView[] = [
  {
    id: 'all',
    name: 'All Contacts',
    icon: 'Users',
    filters: {},
    isSystem: true,
  },
  {
    id: 'new-today',
    name: 'New Today',
    icon: 'UserPlus',
    filters: { createdDateFrom: 'today' },
    isSystem: true,
  },
  {
    id: 'active',
    name: 'Active (MAU)',
    icon: 'Activity',
    filters: { mauStatus: ['active'] },
    isSystem: true,
  },
  {
    id: 'inactive-30',
    name: 'Inactive 30 Days',
    icon: 'Clock',
    filters: { mauStatus: ['inactive'] },
    isSystem: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    icon: 'Star',
    filters: { priority: ['high', 'urgent'] },
    isSystem: true,
  },
  {
    id: 'opted-out',
    name: 'Opted Out',
    icon: 'UserX',
    filters: { optInStatus: 'opted_out' },
    isSystem: true,
  },
  {
    id: 'blocked',
    name: 'Blocked',
    icon: 'Ban',
    filters: { blocked: 'yes' },
    isSystem: true,
  },
  {
    id: 'sla-risk',
    name: 'SLA Risk',
    icon: 'AlertTriangle',
    filters: { priority: ['urgent'] },
    isSystem: true,
  },
];
