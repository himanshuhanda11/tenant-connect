import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building2, 
  GraduationCap, 
  Heart, 
  Plane, 
  Home, 
  Briefcase, 
  Truck, 
  Headphones,
  ShoppingCart,
  Stethoscope,
  Scale,
  Utensils,
  Car,
  Sparkles,
  ChevronRight,
  Copy
} from 'lucide-react';
import { IndustryPack, IndustryTemplate, TemplateCategory } from '@/types/template';

interface IndustryPacksProps {
  onUseTemplate: (template: IndustryTemplate) => void;
}

const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: 'Home',
    description: 'Property listings, viewings, and client communication',
    templates: [
      {
        name: 'property_viewing_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: 'Viewing Confirmed ✅',
        body: 'Hi {{1}}, your property viewing is confirmed:\n\n🏠 Property: {{2}}\n📍 Address: {{3}}\n📅 Date: {{4}}\n⏰ Time: {{5}}\n\nOur agent {{6}} will meet you there. Reply if you need to reschedule.',
        footer: 'Real Estate Co.',
        variables: ['customer_name', 'property_name', 'address', 'date', 'time', 'agent_name'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Reschedule' }
        ]
      },
      {
        name: 'new_listing_alert',
        category: 'MARKETING',
        language: 'en',
        header_type: 'image',
        body: '🏡 New Property Alert!\n\n{{1}} in {{2}} is now available.\n\n💰 Price: {{3}}\n🛏️ Bedrooms: {{4}}\n📐 Size: {{5}} sq ft\n\nInterested? Schedule a viewing today!',
        footer: 'Reply STOP to unsubscribe',
        variables: ['property_type', 'location', 'price', 'bedrooms', 'size'],
        buttons: [
          { type: 'URL', text: 'View Property', url: 'https://example.com' },
          { type: 'QUICK_REPLY', text: 'Schedule Viewing' }
        ]
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinics',
    icon: 'Stethoscope',
    description: 'Appointment reminders and patient communication',
    templates: [
      {
        name: 'appointment_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: 'Appointment Reminder',
        body: 'Hi {{1}}, this is a reminder of your upcoming appointment:\n\n👨‍⚕️ Doctor: Dr. {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: {{5}}\n\nPlease arrive 15 minutes early. Bring your ID and insurance card.',
        footer: 'HealthCare Clinic',
        variables: ['patient_name', 'doctor_name', 'date', 'time', 'location'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Reschedule' },
          { type: 'PHONE_NUMBER', text: 'Call Clinic', phone_number: '+1234567890' }
        ]
      },
      {
        name: 'prescription_ready',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hello {{1}}, your prescription is ready for pickup at {{2}}.\n\nPrescription #: {{3}}\nMedication: {{4}}\n\nPharmacy hours: {{5}}\n\nPlease bring a valid ID for pickup.',
        footer: 'HealthCare Pharmacy',
        variables: ['patient_name', 'pharmacy_name', 'prescription_number', 'medication', 'hours']
      }
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    icon: 'Truck',
    description: 'Shipping updates and delivery notifications',
    templates: [
      {
        name: 'order_shipped',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📦 Order Shipped!',
        body: 'Hi {{1}}, great news! Your order #{{2}} has been shipped.\n\n🚚 Carrier: {{3}}\n📍 Tracking: {{4}}\n📅 Est. Delivery: {{5}}\n\nTrack your package for real-time updates.',
        variables: ['customer_name', 'order_number', 'carrier', 'tracking_number', 'delivery_date'],
        buttons: [
          { type: 'URL', text: 'Track Package', url: 'https://example.com/track' }
        ]
      },
      {
        name: 'out_for_delivery',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: '🚛 Out for Delivery!\n\nHi {{1}}, your package is out for delivery today.\n\nOrder #: {{2}}\nEst. Time: {{3}}\n\nPlease ensure someone is available to receive the package.',
        variables: ['customer_name', 'order_number', 'estimated_time'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'I\'m Home' },
          { type: 'QUICK_REPLY', text: 'Leave at Door' }
        ]
      }
    ]
  },
  {
    id: 'recruitment',
    name: 'Recruitment & HR',
    icon: 'Briefcase',
    description: 'Interview scheduling and candidate communication',
    templates: [
      {
        name: 'interview_invitation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🎉 Interview Invitation',
        body: 'Hi {{1}}, congratulations! You\'ve been selected for an interview.\n\n💼 Position: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: {{5}}\n👤 Interviewer: {{6}}\n\nPlease confirm your attendance.',
        footer: 'HR Department',
        variables: ['candidate_name', 'position', 'date', 'time', 'location', 'interviewer'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Request Reschedule' }
        ]
      },
      {
        name: 'application_status',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, we have an update on your application for {{2}}.\n\nStatus: {{3}}\n\n{{4}}\n\nThank you for your interest in joining our team.',
        footer: 'Talent Acquisition',
        variables: ['candidate_name', 'position', 'status', 'message']
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: 'ShoppingCart',
    description: 'Order updates and promotional campaigns',
    templates: [
      {
        name: 'order_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Order Confirmed',
        body: 'Thank you {{1}}! Your order has been confirmed.\n\n🛍️ Order #: {{2}}\n💰 Total: {{3}}\n📦 Items: {{4}}\n\nYou\'ll receive tracking info once shipped.',
        footer: 'Shop with us again!',
        variables: ['customer_name', 'order_number', 'total', 'items'],
        buttons: [
          { type: 'URL', text: 'View Order', url: 'https://example.com/orders' }
        ]
      },
      {
        name: 'flash_sale',
        category: 'MARKETING',
        language: 'en',
        header_type: 'image',
        body: '⚡ FLASH SALE ⚡\n\nHi {{1}}! Don\'t miss our biggest sale of the season.\n\n🏷️ Up to {{2}}% OFF\n⏰ Ends: {{3}}\n\nUse code: {{4}} at checkout.',
        footer: 'Reply STOP to unsubscribe',
        variables: ['customer_name', 'discount', 'end_date', 'promo_code'],
        buttons: [
          { type: 'URL', text: 'Shop Now', url: 'https://example.com/sale' }
        ]
      }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'Class reminders and student communication',
    templates: [
      {
        name: 'class_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📚 Class Reminder',
        body: 'Hi {{1}}, your next class starts soon:\n\n📖 Subject: {{2}}\n👨‍🏫 Instructor: {{3}}\n📅 Date: {{4}}\n⏰ Time: {{5}}\n🔗 Meeting Link: {{6}}',
        variables: ['student_name', 'subject', 'instructor', 'date', 'time', 'meeting_link'],
        buttons: [
          { type: 'URL', text: 'Join Class', url: 'https://example.com/class' }
        ]
      },
      {
        name: 'fee_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, this is a reminder that your tuition fee payment is due.\n\n💰 Amount: {{2}}\n📅 Due Date: {{3}}\n📝 Invoice #: {{4}}\n\nPay online or visit our office.',
        footer: 'Thank you',
        variables: ['student_name', 'amount', 'due_date', 'invoice_number'],
        buttons: [
          { type: 'URL', text: 'Pay Now', url: 'https://example.com/pay' }
        ]
      }
    ]
  }
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2, GraduationCap, Heart, Plane, Home, Briefcase, Truck, Headphones,
  ShoppingCart, Stethoscope, Scale, Utensils, Car, Sparkles
};

export function IndustryPacks({ onUseTemplate }: IndustryPacksProps) {
  const [selectedPack, setSelectedPack] = useState<IndustryPack | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);

  const getCategoryBadge = (category: TemplateCategory) => {
    switch (category) {
      case 'UTILITY':
        return <Badge className="bg-green-500">🟢 Utility</Badge>;
      case 'MARKETING':
        return <Badge className="bg-blue-500">🔵 Marketing</Badge>;
      case 'AUTHENTICATION':
        return <Badge className="bg-purple-500">🟣 Authentication</Badge>;
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Industry Template Packs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pre-built templates designed for high approval rates. Clone and customize for your business.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INDUSTRY_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getIcon(pack.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pack.templates.length} templates
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pack Details Dialog */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPack && getIcon(selectedPack.icon)}
              {selectedPack?.name} Templates
            </DialogTitle>
            <DialogDescription>
              {selectedPack?.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedPack?.templates.map((template, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryBadge(template.category)}
                        <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        Preview
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          onUseTemplate(template);
                          setSelectedPack(null);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded p-3 text-sm">
                    <p className="whitespace-pre-wrap line-clamp-3">{template.body}</p>
                  </div>

                  {template.variables && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {`{{${i + 1}}}`} = {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryBadge(previewTemplate.category)}
                <Badge variant="outline">{previewTemplate.language.toUpperCase()}</Badge>
              </div>

              {previewTemplate.header_content && (
                <div className="font-semibold">{previewTemplate.header_content}</div>
              )}

              <div className="bg-muted rounded-lg p-4">
                <p className="whitespace-pre-wrap text-sm">{previewTemplate.body}</p>
              </div>

              {previewTemplate.footer && (
                <p className="text-xs text-muted-foreground">{previewTemplate.footer}</p>
              )}

              {previewTemplate.buttons && previewTemplate.buttons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Buttons:</p>
                  {previewTemplate.buttons.map((btn, i) => (
                    <Badge key={i} variant="outline" className="mr-2">
                      {btn.text}
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                className="w-full"
                onClick={() => {
                  onUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                  setSelectedPack(null);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
