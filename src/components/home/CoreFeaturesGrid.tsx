import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Megaphone, 
  FileText, 
  Bot, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import whatsappFriends from '@/assets/whatsapp-friends.jpg';
import whatsappCouplePink from '@/assets/whatsapp-couple-pink.jpg';

const features = [
  {
    icon: Inbox,
    title: 'Shared Team Inbox',
    description: 'Manage all WhatsApp conversations with smart routing, agent assignment, notes, and labels.',
    gradient: 'from-blue-500 to-cyan-500',
    link: '/features/inbox',
    details: [
      'Real-time conversation routing',
      'Agent assignment & workload balancing',
      'Internal notes & collaboration',
      'Priority labels & tags',
      'SLA timers & alerts'
    ]
  },
  {
    icon: Megaphone,
    title: 'Broadcast Campaigns',
    description: 'Send bulk messages to thousands with audience segments, scheduling, and analytics.',
    gradient: 'from-orange-500 to-red-500',
    link: '/features/campaigns',
    details: [
      'Segment-based targeting',
      'Schedule campaigns in advance',
      'Throttling & rate control',
      'A/B testing support',
      'Delivery & read analytics'
    ]
  },
  {
    icon: FileText,
    title: 'Template Management',
    description: 'Create, submit, and track WhatsApp message templates with Meta approval workflow.',
    gradient: 'from-purple-500 to-pink-500',
    link: '/features/templates',
    details: [
      'Visual template builder',
      'Variable placeholders',
      'Media header support',
      'Approval status tracking',
      'Template quality score'
    ]
  },
  {
    icon: Bot,
    title: 'Smart Automations',
    description: 'Build no-code flows with triggers, conditions, and actions to automate conversations.',
    gradient: 'from-green-500 to-emerald-500',
    link: '/features/automation',
    details: [
      'Visual drag-and-drop flow builder',
      'Keyword & tag triggers',
      'Conditional branching',
      'Delay & scheduling',
      'Auto-assignment rules'
    ]
  },
  {
    icon: Users,
    title: 'Contacts & Segments',
    description: 'Manage contacts with tags, custom attributes, and dynamic segments for targeting.',
    gradient: 'from-pink-500 to-rose-500',
    link: '/features/contacts',
    details: [
      'Unlimited contact storage',
      'Custom attributes & tags',
      'CSV import/export',
      'Dynamic segmentation',
      'Opt-in/out management'
    ]
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    description: 'Track delivery, read rates, agent performance, and campaign ROI with detailed reports.',
    gradient: 'from-indigo-500 to-purple-500',
    link: '/features/analytics',
    details: [
      'Real-time dashboards',
      'Delivery & read metrics',
      'Agent performance reports',
      'Campaign ROI tracking',
      'Export to CSV/PDF'
    ]
  }
];

export default function CoreFeaturesGrid() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header with Image - Mobile optimized */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 text-green-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Core Platform
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              What You Can Do
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6">
              Everything you need to engage customers on WhatsApp at scale.
            </p>
            <div className="space-y-2 sm:space-y-3 hidden sm:block">
              {['Manage conversations with your team', 'Send targeted broadcast campaigns', 'Automate customer interactions'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <img 
              src={whatsappFriends} 
              alt="WhatsApp Business Communication" 
              className="rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl w-full h-auto object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-card backdrop-blur-xl p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-border hidden xs:block">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-foreground">Team Ready</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Collaborate in real-time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card overflow-hidden cursor-pointer"
              onClick={() => setSelectedFeature(feature)}
            >
              <div className={`h-1.5 bg-gradient-to-r ${feature.gradient}`} />
              <CardHeader className="p-5 md:p-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6 pt-0">
                <CardDescription className="text-sm md:text-base mb-4">{feature.description}</CardDescription>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/products">
              Explore All Features
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Feature Detail Sheet */}
        <Sheet open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedFeature && (
              <>
                <SheetHeader className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <selectedFeature.icon className="w-7 h-7 text-white" />
                  </div>
                  <SheetTitle className="text-2xl">{selectedFeature.title}</SheetTitle>
                  <SheetDescription className="text-base">
                    {selectedFeature.description}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-foreground">Key Capabilities</h4>
                  <ul className="space-y-3">
                    {selectedFeature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedFeature.gradient}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link to={selectedFeature.link}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
