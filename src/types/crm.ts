export type DealPriority = 'low' | 'normal' | 'high' | 'urgent';
export type DealStatus = 'open' | 'won' | 'lost';
export type DealActivityType =
  | 'stage_change' | 'note' | 'call' | 'email' | 'whatsapp'
  | 'assignment' | 'task' | 'created' | 'status_change';
export type DealTaskStatus = 'pending' | 'done' | 'cancelled';

export interface Pipeline {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  tenant_id: string;
  pipeline_id: string;
  name: string;
  color: string;
  stage_order: number;
  is_won: boolean;
  is_lost: boolean;
  probability: number;
}

export interface Deal {
  id: string;
  tenant_id: string;
  pipeline_id: string;
  stage_id: string;
  contact_id: string | null;
  title: string;
  company_name: string | null;
  value: number;
  currency: string;
  priority: DealPriority;
  status: DealStatus;
  lead_source: string | null;
  tags: string[];
  owner_id: string | null;
  expected_close_date: string | null;
  last_activity_at: string;
  position: number;
  notes_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DealActivity {
  id: string;
  tenant_id: string;
  deal_id: string;
  actor_id: string | null;
  activity_type: DealActivityType;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DealNote {
  id: string;
  tenant_id: string;
  deal_id: string;
  author_id: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealTask {
  id: string;
  tenant_id: string;
  deal_id: string | null;
  contact_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_at: string | null;
  status: DealTaskStatus;
  created_at: string;
  completed_at: string | null;
}

export const PRIORITY_META: Record<DealPriority, { label: string; color: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-slate-700 bg-slate-100',   dot: 'bg-slate-400' },
  normal: { label: 'Normal', color: 'text-blue-700 bg-blue-50',      dot: 'bg-blue-500' },
  high:   { label: 'High',   color: 'text-orange-700 bg-orange-50',  dot: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-700 bg-red-50',        dot: 'bg-red-500' },
};
