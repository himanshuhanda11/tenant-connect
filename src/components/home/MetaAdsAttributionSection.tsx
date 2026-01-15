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
import { OptimizedImage } from '@/components/ui/optimized-media';
import whatsappCouple from '@/assets/whatsapp-couple-pink.jpg';

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
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto mb-8 sm:mb-14">
          <div className="text-center lg:text-left">
            <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-700 border-0 text-xs sm:text-sm">
              <MousePointerClick className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1 sm:mr-1.5" />
              Meta Ads Integration
            </Badge>
            <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              From Ad Click to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Closed Deal
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600">
              Full-funnel attribution for Click-to-WhatsApp ads with AI-powered lead scoring
            </p>
          </div>
          <div className="hidden lg:block">
            <OptimizedImage
              src={whatsappCouple}
              alt="Meta Ads Attribution"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Journey Diagram */}
          <Card className="border-2 border-blue-200 bg-white mb-6 sm:mb-8 overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-8 text-center">
                Customer Journey Tracking
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-between relative gap-4 sm:gap-0">
                {/* Connection Line */}
                <div className="absolute top-8 left-12 right-12 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 to-emerald-500 rounded-full hidden lg:block" />
                
                {journeySteps.map((step, index) => (
                  <div key={index} className="flex sm:flex-col items-center gap-3 sm:gap-0 relative z-10 w-full sm:w-auto">
                    <div className={`w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 rounded-xl sm:rounded-2xl ${step.color} flex items-center justify-center shadow-lg sm:mb-3`}>
                      <step.icon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white" />
                    </div>
                    <div className="sm:text-center">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm block">{step.label}</span>
                      <span className="text-[10px] sm:text-xs text-slate-500">{step.detail}</span>
                    </div>
                    {index < journeySteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 sm:hidden ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Timeline Details */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {metrics.map((metric, index) => (
              <Card key={index} className="border border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center">
                      <metric.icon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                    </div>
                    <Badge 
                      className={`${
                        metric.positive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      } border-0 text-[10px] sm:text-xs`}
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-slate-900 mb-0.5 sm:mb-1">{metric.value}</div>
                  <p className="text-[10px] sm:text-sm text-slate-500">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
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
