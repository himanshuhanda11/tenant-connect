import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  language: string;
  components_json: any;
  meta_template_id: string;
  waba_account_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
  // Extended fields for UI
  industry?: string;
  quality_rating?: 'GREEN' | 'YELLOW' | 'RED';
  is_recommended?: boolean;
}

export type IndustryType = 
  | 'e-commerce'
  | 'education'
  | 'healthcare'
  | 'travel'
  | 'real-estate'
  | 'finance'
  | 'recruitment'
  | 'support';

export interface IndustryTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  industry: IndustryType;
  description: string;
  body: string;
  header?: string;
  footer?: string;
  buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }>;
  variables: string[];
  language: string;
}

// Industry template examples (seeded data for demo)
export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  // E-commerce
  {
    id: 'ecom-order-confirm',
    name: 'Order Confirmation',
    category: 'UTILITY',
    industry: 'e-commerce',
    description: 'Confirm customer order with details',
    body: 'Hi {{1}}! 🎉\n\nYour order #{{2}} has been confirmed!\n\nItems: {{3}}\nTotal: {{4}}\n\nTrack your order anytime.',
    header: 'Order Confirmed ✓',
    variables: ['customer_name', 'order_id', 'items', 'total'],
    language: 'en',
    buttons: [{ type: 'URL', text: 'Track Order', url: 'https://example.com/track/{{1}}' }],
  },
  {
    id: 'ecom-delivery-update',
    name: 'Delivery Update',
    category: 'UTILITY',
    industry: 'e-commerce',
    description: 'Notify customer about delivery status',
    body: 'Hi {{1}},\n\nYour order #{{2}} is {{3}}!\n\nExpected delivery: {{4}}\n\nDriver: {{5}}',
    variables: ['customer_name', 'order_id', 'status', 'delivery_date', 'driver_name'],
    language: 'en',
  },
  {
    id: 'ecom-sale-promo',
    name: 'Sale Announcement',
    category: 'MARKETING',
    industry: 'e-commerce',
    description: 'Promote sales and discounts',
    body: '🔥 FLASH SALE!\n\nHi {{1}},\n\nGet up to {{2}}% OFF on {{3}}!\n\nUse code: {{4}}\n\nValid till {{5}}',
    header: '🛍️ Special Offer',
    variables: ['customer_name', 'discount', 'category', 'code', 'expiry'],
    language: 'en',
  },
  // Education
  {
    id: 'edu-class-reminder',
    name: 'Class Reminder',
    category: 'UTILITY',
    industry: 'education',
    description: 'Remind students about upcoming classes',
    body: 'Hi {{1}},\n\n📚 Reminder: Your {{2}} class starts in {{3}}.\n\nTopic: {{4}}\nInstructor: {{5}}\n\nJoin on time!',
    variables: ['student_name', 'subject', 'time', 'topic', 'instructor'],
    language: 'en',
  },
  {
    id: 'edu-fee-reminder',
    name: 'Fee Reminder',
    category: 'UTILITY',
    industry: 'education',
    description: 'Remind about pending fee payment',
    body: 'Dear {{1}},\n\nThis is a reminder that your fee of {{2}} for {{3}} is due on {{4}}.\n\nPlease ensure timely payment to avoid late fees.',
    variables: ['student_name', 'amount', 'term', 'due_date'],
    language: 'en',
    buttons: [{ type: 'URL', text: 'Pay Now', url: 'https://example.com/pay' }],
  },
  // Healthcare
  {
    id: 'health-appointment',
    name: 'Appointment Reminder',
    category: 'UTILITY',
    industry: 'healthcare',
    description: 'Remind patients about appointments',
    body: 'Hi {{1}},\n\n🏥 Appointment Reminder\n\nDoctor: Dr. {{2}}\nDate: {{3}}\nTime: {{4}}\nLocation: {{5}}\n\nPlease arrive 15 mins early.',
    variables: ['patient_name', 'doctor_name', 'date', 'time', 'location'],
    language: 'en',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Confirm' },
      { type: 'QUICK_REPLY', text: 'Reschedule' },
    ],
  },
  {
    id: 'health-report-ready',
    name: 'Report Ready',
    category: 'UTILITY',
    industry: 'healthcare',
    description: 'Notify when test reports are ready',
    body: 'Dear {{1}},\n\nYour {{2}} report is ready.\n\nReport ID: {{3}}\n\nYou can collect it from the lab or download online.',
    variables: ['patient_name', 'test_name', 'report_id'],
    language: 'en',
  },
  // Travel
  {
    id: 'travel-booking-confirm',
    name: 'Booking Confirmation',
    category: 'UTILITY',
    industry: 'travel',
    description: 'Confirm travel booking',
    body: 'Hi {{1}}! ✈️\n\nYour booking is confirmed!\n\nBooking ID: {{2}}\nDestination: {{3}}\nDate: {{4}}\nPassengers: {{5}}\n\nHave a great trip!',
    variables: ['customer_name', 'booking_id', 'destination', 'date', 'passengers'],
    language: 'en',
  },
  {
    id: 'travel-checkin-reminder',
    name: 'Check-in Reminder',
    category: 'UTILITY',
    industry: 'travel',
    description: 'Remind passengers to check in',
    body: 'Hi {{1}},\n\n⏰ Online check-in is now open for your flight {{2}} to {{3}} on {{4}}.\n\nCheck in now to select your seat!',
    variables: ['customer_name', 'flight_number', 'destination', 'date'],
    language: 'en',
    buttons: [{ type: 'URL', text: 'Check In', url: 'https://example.com/checkin' }],
  },
  // Real Estate
  {
    id: 'realestate-viewing',
    name: 'Property Viewing',
    category: 'UTILITY',
    industry: 'real-estate',
    description: 'Confirm property viewing appointment',
    body: 'Hi {{1}},\n\n🏠 Your property viewing is scheduled!\n\nProperty: {{2}}\nAddress: {{3}}\nDate: {{4}}\nTime: {{5}}\n\nOur agent will meet you there.',
    variables: ['customer_name', 'property_name', 'address', 'date', 'time'],
    language: 'en',
  },
  // Finance
  {
    id: 'finance-payment-confirm',
    name: 'Payment Confirmation',
    category: 'UTILITY',
    industry: 'finance',
    description: 'Confirm payment received',
    body: 'Hi {{1}},\n\n✅ Payment Received\n\nAmount: {{2}}\nTransaction ID: {{3}}\nDate: {{4}}\n\nThank you for your payment.',
    variables: ['customer_name', 'amount', 'transaction_id', 'date'],
    language: 'en',
  },
  {
    id: 'finance-otp',
    name: 'OTP Verification',
    category: 'AUTHENTICATION',
    industry: 'finance',
    description: 'Send OTP for verification',
    body: 'Your verification code is {{1}}. Valid for {{2}} minutes. Do not share this code.',
    variables: ['otp_code', 'validity'],
    language: 'en',
  },
  // Recruitment
  {
    id: 'recruit-interview',
    name: 'Interview Schedule',
    category: 'UTILITY',
    industry: 'recruitment',
    description: 'Schedule interview with candidate',
    body: 'Hi {{1}},\n\n🎯 Interview Scheduled!\n\nPosition: {{2}}\nDate: {{3}}\nTime: {{4}}\nLocation: {{5}}\n\nPlease confirm your attendance.',
    variables: ['candidate_name', 'position', 'date', 'time', 'location'],
    language: 'en',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Confirm' },
      { type: 'QUICK_REPLY', text: 'Reschedule' },
    ],
  },
  {
    id: 'recruit-document',
    name: 'Document Request',
    category: 'UTILITY',
    industry: 'recruitment',
    description: 'Request documents from candidate',
    body: 'Hi {{1}},\n\nCongratulations on your selection for {{2}}!\n\nPlease submit the following documents:\n{{3}}\n\nDeadline: {{4}}',
    variables: ['candidate_name', 'position', 'documents_list', 'deadline'],
    language: 'en',
  },
  // Support
  {
    id: 'support-ticket-created',
    name: 'Ticket Created',
    category: 'UTILITY',
    industry: 'support',
    description: 'Confirm support ticket creation',
    body: 'Hi {{1}},\n\nYour support ticket has been created.\n\nTicket ID: {{2}}\nSubject: {{3}}\n\nOur team will respond within {{4}} hours.',
    variables: ['customer_name', 'ticket_id', 'subject', 'sla_hours'],
    language: 'en',
  },
  {
    id: 'support-ticket-resolved',
    name: 'Ticket Resolved',
    category: 'UTILITY',
    industry: 'support',
    description: 'Notify ticket resolution',
    body: 'Hi {{1}},\n\n✅ Your ticket #{{2}} has been resolved.\n\nResolution: {{3}}\n\nPlease rate your experience!',
    variables: ['customer_name', 'ticket_id', 'resolution'],
    language: 'en',
    buttons: [
      { type: 'QUICK_REPLY', text: '👍 Great' },
      { type: 'QUICK_REPLY', text: '👎 Not Satisfied' },
    ],
  },
];

export const INDUSTRIES: { id: IndustryType; name: string; icon: string; count: number }[] = [
  { id: 'e-commerce', name: 'E-commerce', icon: '🛒', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'e-commerce').length },
  { id: 'education', name: 'Education', icon: '📚', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'education').length },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'healthcare').length },
  { id: 'travel', name: 'Travel', icon: '✈️', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'travel').length },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'real-estate').length },
  { id: 'finance', name: 'Finance', icon: '💰', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'finance').length },
  { id: 'recruitment', name: 'Recruitment', icon: '👔', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'recruitment').length },
  { id: 'support', name: 'Support & Services', icon: '🎧', count: INDUSTRY_TEMPLATES.filter(t => t.industry === 'support').length },
];

interface TemplateFilters {
  search: string;
  industry: IndustryType | 'all';
  category: TemplateCategory | 'all';
  status: TemplateStatus | 'all';
  language: string;
}

export function useTemplates() {
  const { currentTenant } = useTenant();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    industry: 'all',
    category: 'all',
    status: 'all',
    language: '',
  });

  const fetchTemplates = useCallback(async () => {
    if (!currentTenant?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('templates')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, filters]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const syncFromMeta = async () => {
    if (!currentTenant?.id) return;

    setSyncing(true);
    try {
      // Call edge function to sync templates from Meta
      const { data, error } = await supabase.functions.invoke('sync-templates', {
        body: { tenant_id: currentTenant.id },
      });

      if (error) throw error;

      toast.success(`Synced ${data?.count || 0} templates from Meta`);
      fetchTemplates();
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast.error('Failed to sync templates from Meta');
    } finally {
      setSyncing(false);
    }
  };

  const createTemplate = async (templateData: Partial<Template>) => {
    if (!currentTenant?.id) return null;

    try {
      // Get WABA account
      const { data: wabaData } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .single();

      if (!wabaData) {
        toast.error('No active WhatsApp Business Account found');
        return null;
      }

      const { data, error } = await supabase
        .from('templates')
        .insert({
          tenant_id: currentTenant.id,
          waba_account_id: wabaData.id,
          name: templateData.name,
          category: templateData.category || 'UTILITY',
          status: 'PENDING',
          language: templateData.language || 'en',
          components_json: templateData.components_json || [],
          meta_template_id: `local_${Date.now()}`, // Will be updated after Meta approval
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template created! Submit to Meta for approval.');
      fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const getTemplatesByCategory = () => {
    const grouped: Record<string, Template[]> = {
      UTILITY: [],
      MARKETING: [],
      AUTHENTICATION: [],
    };
    templates.forEach(t => {
      if (grouped[t.category]) {
        grouped[t.category].push(t);
      }
    });
    return grouped;
  };

  const getApprovedTemplates = () => templates.filter(t => t.status === 'APPROVED');

  return {
    templates,
    loading,
    syncing,
    filters,
    setFilters,
    fetchTemplates,
    syncFromMeta,
    createTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    getApprovedTemplates,
  };
}
