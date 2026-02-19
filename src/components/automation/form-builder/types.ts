export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'url'
  | 'location'
  | 'rating'
  | 'file_upload'
  | 'hidden'
  | 'calculated'
  | 'tag_assignment'
  | 'lead_score'
  | 'otp_verification'
  | 'time_slot'
  | 'year';

export interface FormFieldOption {
  label: string;
  value: string;
  score?: number; // For lead scoring
  tag?: string;   // For tag assignment
}

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  action: 'show' | 'hide' | 'skip_to' | 'set_value' | 'assign_tag' | 'trigger_webhook';
  targetFieldId?: string;
  targetValue?: string;
  webhookUrl?: string;
  tagName?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  validation?: Record<string, any>;
  width?: 'full' | 'half';
  step?: number; // Multi-step support
  // Advanced configs
  hiddenValue?: string; // For hidden fields
  hiddenSource?: 'campaign' | 'source' | 'wa_number' | 'agent_id' | 'custom' | 'utm_source' | 'utm_medium' | 'utm_campaign';
  calculationFormula?: string; // For calculated fields
  calculationFields?: string[]; // Field IDs used in calculation
  calculationOperator?: 'multiply' | 'add' | 'subtract' | 'divide' | 'custom';
  fileTypes?: string[]; // For file upload: 'image', 'pdf', 'doc', 'voice'
  maxFileSize?: number; // MB
  otpType?: 'phone' | 'email'; // For OTP
  timeSlotConfig?: {
    startHour: number;
    endHour: number;
    intervalMinutes: number;
    daysOfWeek: number[];
    excludeDates?: string[];
  };
  leadScoreRules?: Array<{ answer: string; points: number }>;
  tagRules?: Array<{ answer: string; tag: string }>;
  conditionalRules?: ConditionalRule[];
  description?: string;
}

export interface FormRuleAction {
  id: string;
  type: 'assign_team' | 'send_template' | 'add_tag' | 'trigger_webhook' | 'set_attribute' | 'notify_agent';
  config: Record<string, any>;
}

export interface IFThenRule {
  id: string;
  conditions: Array<{
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
    connector: 'AND' | 'OR';
  }>;
  actions: FormRuleAction[];
  name?: string;
}

export interface FormBuilderState {
  fields: FormField[];
  formName: string;
  description?: string;
  steps: number;
  ifThenRules: IFThenRule[];
  webhookUrl?: string;
  leadScoreThresholds?: {
    hot: number;
    warm: number;
    cold: number;
  };
  settings: {
    multiStep: boolean;
    showProgressBar: boolean;
    submitButtonText: string;
    successMessage: string;
    whatsappStylePreview: boolean;
  };
}

export const DEFAULT_FORM_STATE: FormBuilderState = {
  fields: [],
  formName: '',
  steps: 1,
  ifThenRules: [],
  leadScoreThresholds: { hot: 80, warm: 50, cold: 0 },
  settings: {
    multiStep: false,
    showProgressBar: true,
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your response!',
    whatsappStylePreview: false,
  },
};
