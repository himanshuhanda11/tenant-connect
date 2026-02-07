import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import PricingHero from '@/components/pricing/PricingHero';
import PricingCards from '@/components/pricing/PricingCards';
import PricingAddOns from '@/components/pricing/PricingAddOns';
import PricingComparison from '@/components/pricing/PricingComparison';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import PricingCTA from '@/components/pricing/PricingCTA';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        route="/pricing"
        fallbackTitle="Pricing Plans - Aireatro"
        fallbackDescription="Simple, transparent pricing per workspace. Each workspace includes 1 WhatsApp number."
      />
      <Navbar />
      <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      <PricingCards isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      <PricingAddOns />
      <PricingComparison isAnnual={isAnnual} />
      <PricingCTA />
      <PricingFAQ />
      <Footer />
    </div>
  );
}
