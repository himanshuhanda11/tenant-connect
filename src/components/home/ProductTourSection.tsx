import React, { useState, useEffect, useRef } from 'react';
import { 
  Inbox, 
  Megaphone, 
  Bot, 
  Phone, 
  BarChart3,
  CheckCircle2,
  Play,
  Pause
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import dashboardPreview from '@/assets/dashboard-preview.png';

const tourTabs = [
  {
    id: 'inbox',
    icon: Inbox,
    label: 'Inbox',
    title: 'Unified Team Inbox',
    benefits: [
      'Real-time conversation sync across devices',
      'Smart assignment with round-robin & skills',
      'Internal notes & team collaboration',
      'Priority queues & SLA timers',
      'Quick replies & template shortcuts'
    ],
    image: dashboardPreview
  },
  {
    id: 'campaigns',
    icon: Megaphone,
    label: 'Campaigns',
    title: 'Broadcast Campaigns',
    benefits: [
      'Send to thousands with one click',
      'Segment audiences by tags & attributes',
      'Schedule for optimal delivery times',
      'A/B test message variants',
      'Track delivery, read & reply rates'
    ],
    image: dashboardPreview
  },
  {
    id: 'automation',
    icon: Bot,
    label: 'Automation',
    title: 'Smart Automations',
    benefits: [
      'Visual drag-and-drop flow builder',
      'Trigger on keywords, tags, or events',
      'Conditional branching logic',
      'Delay & scheduling nodes',
      'Auto-assign & escalation rules'
    ],
    image: dashboardPreview
  },
  {
    id: 'phone-numbers',
    icon: Phone,
    label: 'Phone Numbers',
    title: 'Multi-Number Management',
    benefits: [
      'Connect multiple WhatsApp numbers',
      'Manage WABAs from one dashboard',
      'Quality rating & health monitoring',
      'One-click Meta embedded signup',
      'Number-specific routing rules'
    ],
    image: dashboardPreview
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    title: 'Rich Analytics',
    benefits: [
      'Real-time delivery dashboards',
      'Agent performance metrics',
      'Campaign ROI tracking',
      'Conversation heatmaps',
      'Export reports to CSV/PDF'
    ],
    image: dashboardPreview
  }
];

export default function ProductTourSection() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const AUTOPLAY_DURATION = 6000; // 6 seconds per tab
  const PROGRESS_INTERVAL = 50;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next tab
            const currentIndex = tourTabs.findIndex(t => t.id === activeTab);
            const nextIndex = (currentIndex + 1) % tourTabs.length;
            setActiveTab(tourTabs[nextIndex].id);
            return 0;
          }
          return prev + (100 / (AUTOPLAY_DURATION / PROGRESS_INTERVAL));
        });
      }, PROGRESS_INTERVAL);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setProgress(0);
  };

  const currentTab = tourTabs.find(t => t.id === activeTab) || tourTabs[0];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Take a Product Tour
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore how each feature helps you engage customers better
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-background border border-border h-auto p-1 flex-wrap">
                {tourTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="ml-4"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>

            {/* Progress indicator */}
            <Progress value={progress} className="h-1 mb-6" />

            {/* Tab Content */}
            {tourTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Benefits */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                      {tab.title}
                    </h3>
                    <ul className="space-y-4">
                      {tab.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Screenshot */}
                  <div className="relative">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                      <img 
                        src={tab.image} 
                        alt={tab.title}
                        className="w-full h-auto"
                      />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl -z-10" />
                    <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl -z-10" />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
