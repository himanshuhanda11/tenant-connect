import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const metrics = [
  { icon: Clock, value: '↓ 60%', label: 'Avg. reply time', color: 'text-green-500' },
  { icon: TrendingUp, value: '↑ 3.5x', label: 'Conversion rate', color: 'text-blue-500' },
  { icon: TrendingDown, value: '↓ 45%', label: 'Cost per lead', color: 'text-purple-500' },
];

const logos = [
  'TechCorp', 'GrowthLabs', 'QuickServe', 'DataFlow', 'CloudBase', 'ScaleUp'
];

export default function SocialProofBar() {
  return (
    <section className="py-8 md:py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6">
          TRUSTED BY <span className="font-semibold text-foreground">2,000+</span> BUSINESSES WORLDWIDE
        </p>
        
        {/* Logo row */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-8">
          {logos.map((company) => (
            <div 
              key={company} 
              className="text-lg md:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              {company}
            </div>
          ))}
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-2 text-center">
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
              <span className={`text-lg md:text-xl font-bold ${metric.color}`}>{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
