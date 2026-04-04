import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const metrics = [
  { icon: Clock, value: '↓ 60%', label: 'Avg. reply time', color: 'text-primary' },
  { icon: TrendingUp, value: '↑ 3.5x', label: 'Conversion rate', color: 'text-info' },
  { icon: TrendingDown, value: '↓ 45%', label: 'Cost per lead', color: 'text-accent-foreground' },
];

const companies = [
  { name: 'Tata Group', logo: 'https://cdn.brandfetch.io/tata.com/w/256/h/256/logo' },
  { name: 'Infosys', logo: 'https://cdn.brandfetch.io/infosys.com/w/256/h/256/logo' },
  { name: 'Wipro', logo: 'https://cdn.brandfetch.io/wipro.com/w/256/h/256/logo' },
  { name: 'HCL Tech', logo: 'https://cdn.brandfetch.io/hcltech.com/w/256/h/256/logo' },
  { name: 'Flipkart', logo: 'https://cdn.brandfetch.io/flipkart.com/w/256/h/256/logo' },
  { name: 'Zomato', logo: 'https://cdn.brandfetch.io/zomato.com/w/256/h/256/logo' },
  { name: 'Swiggy', logo: 'https://cdn.brandfetch.io/swiggy.com/w/256/h/256/logo' },
  { name: 'Razorpay', logo: 'https://cdn.brandfetch.io/razorpay.com/w/256/h/256/logo' },
  { name: 'Emirates', logo: 'https://cdn.brandfetch.io/emirates.com/w/256/h/256/logo' },
  { name: 'Emaar', logo: 'https://cdn.brandfetch.io/emaar.com/w/256/h/256/logo' },
  { name: 'Noon', logo: 'https://cdn.brandfetch.io/noon.com/w/256/h/256/logo' },
  { name: 'Careem', logo: 'https://cdn.brandfetch.io/careem.com/w/256/h/256/logo' },
];

export default function SocialProofBar() {
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-muted/30 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground tracking-widest mb-3 sm:mb-5">
          TRUSTED BY <span className="font-semibold text-foreground">2,000+</span> BUSINESSES
        </p>
        
        {/* Scrolling Logo Marquee */}
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-marquee">
            {duplicatedCompanies.map((company, index) => (
              <div 
                key={`${company.name}-${index}`}
                className="flex items-center justify-center mx-3 sm:mx-5 md:mx-8 shrink-0"
              >
                <img 
                  src={company.logo}
                  alt={company.name}
                  className="h-5 sm:h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-all duration-300 object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      target.nextElementSibling.classList.remove('hidden');
                    }
                  }}
                />
                <span className="hidden text-sm sm:text-lg font-bold text-muted-foreground/50">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-6 md:gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2 text-center">
              <metric.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${metric.color}`} />
              <span className={`text-sm sm:text-lg md:text-xl font-bold leading-tight ${metric.color}`}>{metric.value}</span>
              <span className="text-[9px] sm:text-sm text-muted-foreground leading-tight">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
