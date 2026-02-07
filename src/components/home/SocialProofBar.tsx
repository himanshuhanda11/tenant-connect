import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const metrics = [
  { icon: Clock, value: '↓ 60%', label: 'Avg. reply time', color: 'text-primary' },
  { icon: TrendingUp, value: '↑ 3.5x', label: 'Conversion rate', color: 'text-info' },
  { icon: TrendingDown, value: '↓ 45%', label: 'Cost per lead', color: 'text-accent-foreground' },
];

const companies = [
  { name: 'Tata Group', logo: 'https://logo.clearbit.com/tata.com' },
  { name: 'Reliance', logo: 'https://logo.clearbit.com/ril.com' },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com' },
  { name: 'Wipro', logo: 'https://logo.clearbit.com/wipro.com' },
  { name: 'HCL Tech', logo: 'https://logo.clearbit.com/hcltech.com' },
  { name: 'Tech Mahindra', logo: 'https://logo.clearbit.com/techmahindra.com' },
  { name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com' },
  { name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com' },
  { name: 'Swiggy', logo: 'https://logo.clearbit.com/swiggy.com' },
  { name: 'Paytm', logo: 'https://logo.clearbit.com/paytm.com' },
  { name: 'PhonePe', logo: 'https://logo.clearbit.com/phonepe.com' },
  { name: 'Razorpay', logo: 'https://logo.clearbit.com/razorpay.com' },
  { name: 'Ola', logo: 'https://logo.clearbit.com/olacabs.com' },
  { name: 'BigBasket', logo: 'https://logo.clearbit.com/bigbasket.com' },
  { name: 'Emirates', logo: 'https://logo.clearbit.com/emirates.com' },
  { name: 'Etisalat', logo: 'https://logo.clearbit.com/etisalat.ae' },
  { name: 'Du', logo: 'https://logo.clearbit.com/du.ae' },
  { name: 'Emaar', logo: 'https://logo.clearbit.com/emaar.com' },
  { name: 'Majid Al Futtaim', logo: 'https://logo.clearbit.com/majidalfuttaim.com' },
  { name: 'Noon', logo: 'https://logo.clearbit.com/noon.com' },
  { name: 'Talabat', logo: 'https://logo.clearbit.com/talabat.com' },
  { name: 'Careem', logo: 'https://logo.clearbit.com/careem.com' },
  { name: 'Mashreq', logo: 'https://logo.clearbit.com/mashreqbank.com' },
  { name: 'ADCB', logo: 'https://logo.clearbit.com/adcb.com' },
];

export default function SocialProofBar() {
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="py-5 sm:py-6 md:py-8 bg-muted/30 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          TRUSTED BY <span className="font-semibold text-foreground">2,000+</span> BUSINESSES
        </p>
        
        {/* Scrolling Logo Marquee */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-32 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 md:w-32 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-marquee">
            {duplicatedCompanies.map((company, index) => (
              <div 
                key={`${company.name}-${index}`}
                className="flex items-center justify-center mx-4 sm:mx-6 md:mx-10 shrink-0"
              >
                <img 
                  src={company.logo}
                  alt={company.name}
                  className="h-6 sm:h-8 md:h-10 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
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
        <div className="flex flex-col xs:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-2 text-center">
              <metric.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.color}`} />
              <span className={`text-base sm:text-lg md:text-xl font-bold ${metric.color}`}>{metric.value}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
