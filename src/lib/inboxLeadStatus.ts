// Centralized Inbox lead status definitions.
// Single source of truth for Inbox, Contacts, Audience targeting,
// Campaign filters and Broadcast filters. Mirrors `conversations.crm_status`.

export type InboxLeadStatus =
  | 'new'
  | 'assigned'
  | 'contacted'
  | 'follow_up_required'
  | 'call_scheduled'
  | 'documents_pending'
  | 'qualified'
  | 'converted'
  | 'not_interested'
  | 'junk';

export interface InboxLeadStatusOption {
  value: InboxLeadStatus;
  label: string;
  color: string;       // dot color (tailwind bg-*)
  badgeClass: string;  // badge bg + text color classes
}

export const INBOX_LEAD_STATUSES: InboxLeadStatusOption[] = [
  { value: 'new',                label: 'New',                color: 'bg-blue-500',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'assigned',           label: 'Assigned',           color: 'bg-indigo-500',  badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'contacted',          label: 'Contacted',          color: 'bg-cyan-500',    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'follow_up_required', label: 'Follow-up Required', color: 'bg-amber-500',   badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'call_scheduled',     label: 'Call Scheduled',     color: 'bg-purple-500',  badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'documents_pending',  label: 'Documents Pending',  color: 'bg-orange-500',  badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'qualified',          label: 'Qualified',          color: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'converted',          label: 'Converted',          color: 'bg-green-500',   badgeClass: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'not_interested',     label: 'Not Interested',     color: 'bg-slate-400',   badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' },
  { value: 'junk',               label: 'Junk',               color: 'bg-gray-400',    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300' },
];

export const INBOX_LEAD_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  INBOX_LEAD_STATUSES.map((s) => [s.value, s.label])
);

// Sentinels for Select dropdowns. Radix Select forbids empty string values,
// so we use sentinels and translate them back to the storage value.
export const SELECT_SENTINELS = {
  none: '__none__',
  all: '__all__',
  unassigned: '__unassigned__',
} as const;
