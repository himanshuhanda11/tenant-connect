import {
  Type, Mail, Phone, Hash, AlignLeft, ListChecks, ToggleLeft, Calendar,
  Link, MapPin, Star, Upload, EyeOff, Calculator, Tag, TrendingUp,
  ShieldCheck, Clock,
} from 'lucide-react';
import type { FormFieldType } from './types';

export const FIELD_TYPES: {
  type: FormFieldType;
  label: string;
  icon: React.ElementType;
  category: 'Basic' | 'Choice' | 'Advanced' | 'Smart';
  description: string;
}[] = [
  // Basic
  { type: 'text', label: 'Text', icon: Type, category: 'Basic', description: 'Single line text input' },
  { type: 'email', label: 'Email', icon: Mail, category: 'Basic', description: 'Email address field' },
  { type: 'phone', label: 'Phone', icon: Phone, category: 'Basic', description: 'Phone number input' },
  { type: 'number', label: 'Number', icon: Hash, category: 'Basic', description: 'Numeric value input' },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft, category: 'Basic', description: 'Multi-line text area' },
  { type: 'url', label: 'URL', icon: Link, category: 'Basic', description: 'Website URL field' },
  // Choice
  { type: 'select', label: 'Dropdown', icon: ListChecks, category: 'Choice', description: 'Select from options' },
  { type: 'radio', label: 'Radio', icon: ToggleLeft, category: 'Choice', description: 'Single choice buttons' },
  { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, category: 'Choice', description: 'Multiple selections' },
  { type: 'rating', label: 'Rating', icon: Star, category: 'Choice', description: 'Star rating scale' },
  // Advanced
  { type: 'date', label: 'Date', icon: Calendar, category: 'Advanced', description: 'Date picker' },
  { type: 'datetime', label: 'Date & Time', icon: Calendar, category: 'Advanced', description: 'Date and time picker' },
  { type: 'year', label: 'Year', icon: Calendar, category: 'Advanced', description: 'Select a year' },
  { type: 'file_upload', label: 'File Upload', icon: Upload, category: 'Advanced', description: 'Upload documents, images, PDFs' },
  { type: 'location', label: 'Location', icon: MapPin, category: 'Advanced', description: 'Address or location input' },
  { type: 'time_slot', label: 'Time Slot', icon: Clock, category: 'Advanced', description: 'Appointment time picker' },
  // Smart
  { type: 'hidden', label: 'Hidden Field', icon: EyeOff, category: 'Smart', description: 'Auto-store campaign, source, etc.' },
  { type: 'calculated', label: 'Calculated', icon: Calculator, category: 'Smart', description: 'Auto-calculate from other fields' },
  { type: 'tag_assignment', label: 'Tag Assignment', icon: Tag, category: 'Smart', description: 'Auto-assign tags on answer' },
  { type: 'lead_score', label: 'Lead Scoring', icon: TrendingUp, category: 'Smart', description: 'Score leads based on answers' },
  { type: 'otp_verification', label: 'OTP Verify', icon: ShieldCheck, category: 'Smart', description: 'Verify phone or email' },
];

export const FIELD_ICON_MAP: Record<FormFieldType, React.ElementType> = Object.fromEntries(
  FIELD_TYPES.map(f => [f.type, f.icon])
) as Record<FormFieldType, React.ElementType>;

export const HIDDEN_FIELD_SOURCES = [
  { value: 'campaign', label: 'Campaign Name' },
  { value: 'source', label: 'Source (Facebook/Google)' },
  { value: 'wa_number', label: 'WhatsApp Number' },
  { value: 'agent_id', label: 'Agent ID' },
  { value: 'utm_source', label: 'UTM Source' },
  { value: 'utm_medium', label: 'UTM Medium' },
  { value: 'utm_campaign', label: 'UTM Campaign' },
  { value: 'custom', label: 'Custom Value' },
];

export const FILE_TYPE_OPTIONS = [
  { value: 'image', label: 'Images (JPG, PNG, WEBP)' },
  { value: 'pdf', label: 'PDF Documents' },
  { value: 'doc', label: 'Word Documents' },
  { value: 'voice', label: 'Voice Notes' },
  { value: 'any', label: 'Any File' },
];

export const FORM_PRESETS = [
  {
    name: 'Lead Capture',
    icon: '🎯',
    description: 'Basic lead information',
    fields: [
      { type: 'text' as FormFieldType, label: 'Full Name', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone Number', required: true },
      { type: 'email' as FormFieldType, label: 'Email Address', required: false },
      { type: 'select' as FormFieldType, label: 'Interested In', required: true, options: [{ label: 'Product A', value: 'a' }, { label: 'Product B', value: 'b' }, { label: 'Product C', value: 'c' }] },
      { type: 'hidden' as FormFieldType, label: 'Source', hiddenSource: 'source' as const },
    ],
  },
  {
    name: 'Appointment Booking',
    icon: '📅',
    description: 'Schedule meetings or appointments',
    fields: [
      { type: 'text' as FormFieldType, label: 'Full Name', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone', required: true },
      { type: 'date' as FormFieldType, label: 'Preferred Date', required: true },
      { type: 'time_slot' as FormFieldType, label: 'Time Slot', required: true },
      { type: 'textarea' as FormFieldType, label: 'Notes', required: false },
    ],
  },
  {
    name: 'Service Inquiry',
    icon: '💬',
    description: 'Service request with qualification',
    fields: [
      { type: 'text' as FormFieldType, label: 'Name', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone', required: true },
      { type: 'select' as FormFieldType, label: 'Service Type', required: true, options: [{ label: 'Consultation', value: 'consult' }, { label: 'Support', value: 'support' }, { label: 'Custom', value: 'custom' }] },
      { type: 'number' as FormFieldType, label: 'Budget', required: false },
      { type: 'lead_score' as FormFieldType, label: 'Lead Quality', required: false },
      { type: 'tag_assignment' as FormFieldType, label: 'Priority', required: false },
    ],
  },
  {
    name: 'E-commerce Order',
    icon: '🛒',
    description: 'Product order with calculation',
    fields: [
      { type: 'text' as FormFieldType, label: 'Customer Name', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone', required: true },
      { type: 'select' as FormFieldType, label: 'Product', required: true, options: [{ label: 'Plan Basic', value: 'basic' }, { label: 'Plan Pro', value: 'pro' }, { label: 'Plan Enterprise', value: 'enterprise' }] },
      { type: 'number' as FormFieldType, label: 'Quantity', required: true },
      { type: 'calculated' as FormFieldType, label: 'Total Amount', calculationOperator: 'multiply' as const },
      { type: 'location' as FormFieldType, label: 'Delivery Address', required: true },
    ],
  },
  {
    name: 'Consultation Form',
    icon: '🩺',
    description: 'Detailed intake with scoring',
    fields: [
      { type: 'text' as FormFieldType, label: 'Full Name', required: true },
      { type: 'email' as FormFieldType, label: 'Email', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone', required: true },
      { type: 'otp_verification' as FormFieldType, label: 'Verify Phone', otpType: 'phone' as const },
      { type: 'textarea' as FormFieldType, label: 'Describe Your Needs', required: true },
      { type: 'file_upload' as FormFieldType, label: 'Attachments', required: false },
      { type: 'lead_score' as FormFieldType, label: 'Qualification Score' },
    ],
  },
  {
    name: 'Survey',
    icon: '📊',
    description: 'Customer feedback survey',
    fields: [
      { type: 'text' as FormFieldType, label: 'Name', required: false },
      { type: 'rating' as FormFieldType, label: 'How satisfied are you?', required: true },
      { type: 'radio' as FormFieldType, label: 'Would you recommend us?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Maybe', value: 'maybe' }] },
      { type: 'textarea' as FormFieldType, label: 'Additional Feedback', required: false },
      { type: 'hidden' as FormFieldType, label: 'Campaign', hiddenSource: 'campaign' as const },
    ],
  },
  {
    name: 'Study Abroad',
    icon: '🎓',
    description: 'Qualify study abroad leads',
    fields: [
      { type: 'text' as FormFieldType, label: 'Full Name', required: true },
      { type: 'phone' as FormFieldType, label: 'Phone Number', required: true },
      { type: 'email' as FormFieldType, label: 'Email Address', required: false },
      { type: 'select' as FormFieldType, label: 'Country of Interest', required: true, options: [{ label: '🇬🇧 UK', value: 'uk' }, { label: '🇨🇦 Canada', value: 'canada' }, { label: '🇦🇺 Australia', value: 'australia' }, { label: '🇺🇸 USA', value: 'usa' }, { label: '🌍 Not Sure', value: 'not_sure' }] },
      { type: 'text' as FormFieldType, label: 'Last Qualification & %', required: true },
      { type: 'select' as FormFieldType, label: 'Target Intake', required: true, options: [{ label: 'Jan 2026', value: 'jan_2026' }, { label: 'May 2026', value: 'may_2026' }, { label: 'July 2026', value: 'july_2026' }, { label: 'Sept 2026', value: 'sept_2026' }] },
      { type: 'radio' as FormFieldType, label: 'IELTS/PTE Status', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Planning Soon', value: 'planning' }] },
      { type: 'select' as FormFieldType, label: 'Yearly Budget', required: true, options: [{ label: 'Under ₹10L', value: 'under_10l' }, { label: '₹10L – ₹20L', value: '10l_20l' }, { label: '₹20L+', value: 'above_20l' }] },
      { type: 'lead_score' as FormFieldType, label: 'Lead Quality' },
      { type: 'tag_assignment' as FormFieldType, label: 'Lead Tag' },
      { type: 'hidden' as FormFieldType, label: 'Source', hiddenSource: 'source' as const },
    ],
  },
];
