import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import PricingHero from '@/components/pricing/PricingHero';
import PricingCards from '@/components/pricing/PricingCards';
import PricingAddOns from '@/components/pricing/PricingAddOns';
import PricingComparison from '@/components/pricing/PricingComparison';
import PricingTrust from '@/components/pricing/PricingTrust';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import PricingCTA from '@/components/pricing/PricingCTA';
import PricingMetaNote from '@/components/pricing/PricingMetaNote';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        route="/pricing"
        fallbackTitle="Pricing — Simple WhatsApp API Plans | Aireatro"
        fallbackDescription="Team inbox, automation, campaigns, AI replies and CRM. Start free, scale when you grow. 30-day free trial on all paid plans."
      />
      <Navbar />
      <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      <PricingCards isAnnual={isAnnual} />
      <PricingTrust />
      <PricingComparison isAnnual={isAnnual} />
      <PricingAddOns />
      <PricingMetaNote />
      <PricingFAQ />
      <PricingCTA />
      <Footer />
    </div>
  );
}
