import React, { useState } from 'react';
import { 
  Brain,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Play,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const aiCapabilities = [
  {
    icon: MessageSquare,
    title: 'AI Reply Suggestions',
    description: 'Get contextual reply suggestions based on conversation history and customer intent.',
    demo: 'Watch how AI suggests the perfect response to customer queries in real-time.'
  },
  {
    icon: Target,
    title: 'Intent Detection',
    description: 'Automatically classify incoming messages by intent — support, sales, complaint, etc.',
    demo: 'See AI categorize 50+ message types with 95% accuracy.'
  },
  {
    icon: Sparkles,
    title: 'AI Flow Builder',
    description: 'Describe your automation in plain English. AI builds the flow for you.',
    demo: 'Type "Send reminders for unpaid invoices" and watch the magic happen.',
    badge: 'Pro'
  },
  {
    icon: TrendingUp,
    title: 'AI Insights Dashboard',
    description: 'Predictive analytics, anomaly detection, and actionable recommendations.',
    demo: 'Discover hidden patterns in your WhatsApp conversations.',
    badge: 'Pro'
  },
  {
    icon: Lightbulb,
    title: 'Smart Routing',
    description: 'AI assigns conversations to the right agent based on skills, language, and workload.',
    demo: 'See how AI reduces response time by 60%.'
  },
  {
    icon: Brain,
    title: 'Sentiment Analysis',
    description: 'Detect customer mood in real-time. Escalate frustrated customers automatically.',
    demo: 'Watch AI flag at-risk customers before they churn.'
  },
];

export default function AICapabilitiesSection() {
  const [selectedDemo, setSelectedDemo] = useState<typeof aiCapabilities[0] | null>(null);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-0">
            <Brain className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            AI That Actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Works
            </span>
          </h2>
          <p className="text-lg text-slate-600">
            Not just buzzwords — real AI features that save hours every day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {aiCapabilities.map((item, index) => (
            <Card 
              key={index}
              className="group bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  {item.badge && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0 h-auto"
                  onClick={() => setSelectedDemo(item)}
                >
                  <Play className="w-4 h-4 mr-1.5 fill-purple-600" />
                  See it in action
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/25"
            onClick={() => setSelectedDemo(aiCapabilities[0])}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            See AI in Action
          </Button>
        </div>

        {/* Demo Modal */}
        <Dialog open={!!selectedDemo} onOpenChange={() => setSelectedDemo(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedDemo && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <selectedDemo.icon className="w-5 h-5 text-white" />
                    </div>
                    {selectedDemo.title}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-8">
              <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-purple-600 fill-purple-600" />
                  </div>
                  <p className="text-slate-600">Demo video coming soon</p>
                </div>
              </div>
              
              <p className="text-slate-600 text-center">
                {selectedDemo?.demo}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setSelectedDemo(null)}>
                Close
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
