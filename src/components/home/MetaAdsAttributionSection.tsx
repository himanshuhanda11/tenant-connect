import React from 'react';
import { 
  MousePointerClick,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Target,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const journeySteps = [
  { 
    icon: MousePointerClick, 
    label: 'Ad Click', 
    detail: 'Facebook / Instagram',
    color: 'bg-blue-500'
  },
  { 
    icon: MessageSquare, 
    label: 'WhatsApp Chat', 
    detail: 'Automated Flow',
    color: 'bg-green-500'
  },
  { 
    icon: Users, 
    label: 'Agent Handoff', 
    detail: 'Sales Team',
    color: 'bg-purple-500'
  },
  { 
    icon: TrendingUp, 
    label: 'Conversion', 
    detail: 'Deal Closed',
    color: 'bg-emerald-500'
  },
];

const metrics = [
  { label: 'Cost per Lead', value: '₹45', change: '-32%', positive: true, icon: DollarSign },
  { label: 'Lead to Sale', value: '28%', change: '+15%', positive: true, icon: Target },
  { label: 'Avg. Response', value: '2 min', change: '-68%', positive: true, icon: Clock },
  { label: 'ROAS', value: '4.2x', change: '+89%', positive: true, icon: TrendingUp },
];

export default function MetaAdsAttributionSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">
            <MousePointerClick className="w-3.5 h-3.5 mr-1.5" />
            Meta Ads Integration
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            From Ad Click to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Closed Deal
            </span>
          </h2>
          <p className="text-lg text-slate-600">
            Full-funnel attribution for Click-to-WhatsApp ads with AI-powered lead scoring
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Journey Diagram */}
          <Card className="border-2 border-blue-200 bg-white mb-8 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-8 text-center">
                Customer Journey Tracking
              </h3>
              
              <div className="flex items-center justify-between relative">
                {/* Connection Line */}
                <div className="absolute top-8 left-12 right-12 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 to-emerald-500 rounded-full hidden md:block" />
                
                {journeySteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-lg mb-3`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">{step.label}</span>
                    <span className="text-xs text-slate-500">{step.detail}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Details */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <span className="text-slate-500">Time: </span>
                    <span className="font-medium text-slate-900">0 sec</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time: </span>
                    <span className="font-medium text-slate-900">5 sec</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time: </span>
                    <span className="font-medium text-slate-900">2 min</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time: </span>
                    <span className="font-medium text-slate-900">24 hrs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {metrics.map((metric, index) => (
              <Card key={index} className="border border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <metric.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge 
                      className={`${
                        metric.positive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      } border-0 text-xs`}
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
              <Link to="/features/integrations">
                Connect Meta Ads
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
