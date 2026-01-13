export type HeaderType = 'none' | 'text' | 'image' | 'video' | 'document';
export type InternalStatus = 'draft' | 'in_review' | 'approved' | 'changes_requested';
export type MetaStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED';
export type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'changes_requested';
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type LintSeverity = 'error' | 'warning' | 'info';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  header_type: HeaderType;
  header_content: string | null;
  body: string;
  footer: string | null;
  buttons: TemplateButton[];
  variable_samples: Record<string, string>;
  content_hash: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TemplateApproval {
  id: string;
  template_id: string;
  version_id: string;
  requested_by: string | null;
  reviewed_by: string | null;
  status: ApprovalStatus;
  comments: string | null;
  tenant_id: string;
  requested_at: string;
  reviewed_at: string | null;
  created_at: string;
  requested_by_profile?: { full_name: string | null; email: string };
  reviewed_by_profile?: { full_name: string | null; email: string };
}

export interface TemplateSubmissionLog {
  id: string;
  template_id: string;
  version_id: string;
  waba_account_id: string;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  meta_template_id: string | null;
  meta_status: string;
  rejection_reason: string | null;
  submitted_by: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateLintResult {
  id: string;
  template_id: string;
  version_id: string;
  severity: LintSeverity;
  rule_code: string;
  message: string;
  field: string | null;
  suggestion: string | null;
  tenant_id: string;
  created_at: string;
}

export interface Template {
  id: string;
  tenant_id: string;
  waba_account_id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  status: MetaStatus;
  internal_status: InternalStatus;
  current_version_id: string | null;
  meta_template_id: string;
  components_json: Record<string, unknown>;
  created_by: string | null;
  rejection_reason: string | null;
  template_score: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
  current_version?: TemplateVersion;
  versions?: TemplateVersion[];
  approvals?: TemplateApproval[];
  submission_logs?: TemplateSubmissionLog[];
  lint_results?: TemplateLintResult[];
}

export interface LintRule {
  code: string;
  name: string;
  severity: LintSeverity;
  validate: (template: Partial<Template>, version: Partial<TemplateVersion>) => LintValidationResult | null;
}

export interface LintValidationResult {
  rule_code: string;
  severity: LintSeverity;
  message: string;
  field?: string;
  suggestion?: string;
}

export interface IndustryPack {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: IndustryTemplate[];
}

export interface IndustryTemplate {
  name: string;
  category: TemplateCategory;
  language: string;
  header_type: HeaderType;
  header_content?: string;
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
  variables?: string[];
}
