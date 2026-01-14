import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Building2, 
  GraduationCap, 
  Stethoscope, 
  Plane, 
  Users,
  ArrowRight,
  X,
  FileText,
  Bot,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const industries = [
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    title: 'E-commerce',
    description: 'Order updates, cart recovery, and promotions',
    color: 'from-orange-500 to-amber-500',
    templates: ['Order Confirmation', 'Shipping Update', 'Cart Abandonment', 'Flash Sale Alert'],
    automations: ['Abandoned Cart Recovery', 'Post-Purchase Follow-up', 'Review Request'],
    kpis: ['Cart recovery rate', 'Repeat purchase rate', 'CSAT score']
  },
  {
    id: 'realestate',
    icon: Building2,
    title: 'Real Estate',
    description: 'Property alerts, scheduling, and follow-ups',
    color: 'from-blue-500 to-indigo-500',
    templates: ['Property Listing Alert', 'Viewing Confirmation', 'Price Drop Notification', 'Document Request'],
    automations: ['Lead Qualification', 'Viewing Reminders', 'Post-Viewing Follow-up'],
    kpis: ['Lead response time', 'Viewing conversion rate', 'Deal closure rate']
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Education',
    description: 'Enrollment, reminders, and student engagement',
    color: 'from-purple-500 to-violet-500',
    templates: ['Class Reminder', 'Assignment Due', 'Fee Payment Reminder', 'Course Update'],
    automations: ['Enrollment Flow', 'Attendance Follow-up', 'Feedback Collection'],
    kpis: ['Enrollment rate', 'Attendance rate', 'Course completion rate']
  },
  {
    id: 'healthcare',
    icon: Stethoscope,
    title: 'Healthcare',
    description: 'Appointments, reminders, and patient communication',
    color: 'from-green-500 to-emerald-500',
    templates: ['Appointment Confirmation', 'Prescription Ready', 'Test Results Available', 'Follow-up Reminder'],
    automations: ['Appointment Booking', 'Pre-Visit Instructions', 'Post-Visit Follow-up'],
    kpis: ['No-show rate reduction', 'Patient satisfaction', 'Response time']
  },
  {
    id: 'travel',
    icon: Plane,
    title: 'Travel & Hospitality',
    description: 'Bookings, itineraries, and travel updates',
    color: 'from-cyan-500 to-teal-500',
    templates: ['Booking Confirmation', 'Check-in Reminder', 'Flight Update', 'Travel Tips'],
    automations: ['Booking Flow', 'Pre-Trip Communication', 'Review Request'],
    kpis: ['Booking conversion', 'Guest satisfaction', 'Upsell rate']
  },
  {
    id: 'recruitment',
    icon: Users,
    title: 'Recruitment',
    description: 'Candidate engagement and hiring workflows',
    color: 'from-pink-500 to-rose-500',
    templates: ['Application Received', 'Interview Invite', 'Status Update', 'Offer Letter'],
    automations: ['Application Screening', 'Interview Scheduling', 'Onboarding Flow'],
    kpis: ['Time to hire', 'Candidate response rate', 'Offer acceptance rate']
  }
];

export default function IndustrySolutions() {
  const [selectedIndustry, setSelectedIndustry] = useState<typeof industries[0] | null>(null);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Solutions by Industry
          </h2>
          <p className="text-lg text-muted-foreground">
            Tailored WhatsApp strategies for your specific business needs
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {industries.map((industry) => (
            <Card 
              key={industry.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50"
              onClick={() => setSelectedIndustry(industry)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <industry.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{industry.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{industry.description}</p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  View solutions <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Detail Modal */}
        <Dialog open={!!selectedIndustry} onOpenChange={() => setSelectedIndustry(null)}>
          <DialogContent className="max-w-lg">
            {selectedIndustry && (
              <>
                <DialogHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedIndustry.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <selectedIndustry.icon className="w-7 h-7 text-white" />
                  </div>
                  <DialogTitle className="text-2xl">{selectedIndustry.title}</DialogTitle>
                  <DialogDescription>{selectedIndustry.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Templates */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">Suggested Templates</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustry.templates.map((template, idx) => (
                        <span key={idx} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                          {template}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Automations */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">Sample Automations</h4>
                    </div>
                    <ul className="space-y-2">
                      {selectedIndustry.automations.map((automation, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${selectedIndustry.color}`} />
                          {automation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* KPIs */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">Key Metrics to Track</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustry.kpis.map((kpi, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button className="flex-1" asChild>
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/case-studies">Case Studies</Link>
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
