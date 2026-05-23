export interface CrmFilters {
  search: string;
  priority: string[];   // 'low' | 'normal' | 'high' | 'urgent'
  status: string[];     // 'open' | 'won' | 'lost'
  ownerIds: string[];
  tags: string[];
  sources: string[];
  closeFrom: string | null;
  closeTo: string | null;
}

export const EMPTY_FILTERS: CrmFilters = {
  search: '',
  priority: [],
  status: [],
  ownerIds: [],
  tags: [],
  sources: [],
  closeFrom: null,
  closeTo: null,
};

export function countActiveFilters(f: CrmFilters): number {
  return (
    (f.priority.length ? 1 : 0) +
    (f.status.length ? 1 : 0) +
    (f.ownerIds.length ? 1 : 0) +
    (f.tags.length ? 1 : 0) +
    (f.sources.length ? 1 : 0) +
    (f.closeFrom || f.closeTo ? 1 : 0)
  );
}

export function applyFilters<T extends {
  title: string; company_name: string | null; tags: string[];
  priority: string; status: string; owner_id: string | null;
  lead_source: string | null; expected_close_date: string | null;
}>(deals: T[], f: CrmFilters): T[] {
  return deals.filter(d => {
    if (f.search.trim()) {
      const q = f.search.toLowerCase();
      const match = d.title.toLowerCase().includes(q)
        || (d.company_name || '').toLowerCase().includes(q)
        || d.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (f.priority.length && !f.priority.includes(d.priority)) return false;
    if (f.status.length && !f.status.includes(d.status)) return false;
    if (f.ownerIds.length && (!d.owner_id || !f.ownerIds.includes(d.owner_id))) return false;
    if (f.tags.length && !f.tags.some(t => d.tags.includes(t))) return false;
    if (f.sources.length && (!d.lead_source || !f.sources.includes(d.lead_source))) return false;
    if (f.closeFrom && (!d.expected_close_date || d.expected_close_date < f.closeFrom)) return false;
    if (f.closeTo && (!d.expected_close_date || d.expected_close_date > f.closeTo)) return false;
    return true;
  });
}
