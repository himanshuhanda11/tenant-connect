import React from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const metrics = [
  { icon: Clock, value: '↓ 60%', label: 'Avg. reply time', color: 'text-primary' },
  { icon: TrendingUp, value: '↑ 3.5x', label: 'Conversion rate', color: 'text-info' },
  { icon: TrendingDown, value: '↓ 45%', label: 'Cost per lead', color: 'text-accent-foreground' },
];

const companies = [
  { name: 'Tata Group', logo: 'https://img.logo.dev/tata.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Reliance', logo: 'https://img.logo.dev/ril.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Infosys', logo: 'https://img.logo.dev/infosys.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Wipro', logo: 'https://img.logo.dev/wipro.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'HCL Tech', logo: 'https://img.logo.dev/hcltech.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Tech Mahindra', logo: 'https://img.logo.dev/techmahindra.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Flipkart', logo: 'https://img.logo.dev/flipkart.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Zomato', logo: 'https://img.logo.dev/zomato.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Swiggy', logo: 'https://img.logo.dev/swiggy.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Paytm', logo: 'https://img.logo.dev/paytm.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'PhonePe', logo: 'https://img.logo.dev/phonepe.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Razorpay', logo: 'https://img.logo.dev/razorpay.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Ola', logo: 'https://img.logo.dev/olacabs.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Emirates', logo: 'https://img.logo.dev/emirates.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Etisalat', logo: 'https://img.logo.dev/etisalat.ae?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Emaar', logo: 'https://img.logo.dev/emaar.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Noon', logo: 'https://img.logo.dev/noon.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
  { name: 'Careem', logo: 'https://img.logo.dev/careem.com?token=pk_a8CO5mIhQNOkSM7oNEBbbw&size=80&format=png' },
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
                  className="h-7 sm:h-9 md:h-11 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain"
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
