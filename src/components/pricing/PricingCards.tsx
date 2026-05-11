import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanCardsGrid } from '@/components/billing/PlanCardsGrid';
import { regionFromCountry, type Region, type PlanId } from '@/data/plans.config';

interface PricingCardsProps {
  isAnnual: boolean;
}

const GULF_TZ = new Set([
  'Asia/Dubai', 'Asia/Abu_Dhabi', 'Asia/Riyadh', 'Asia/Kuwait',
  'Asia/Qatar', 'Asia/Bahrain', 'Asia/Muscat',
]);

function detectRegion(): Region {
  try {
    const override = localStorage.getItem('region_override') as Region | null;
    if (override === 'IN' || override === 'GULF' || override === 'OTHER') return override;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'IN';
    if (GULF_TZ.has(tz)) return 'GULF';
    const lang = (navigator.language || '').toLowerCase();
    const country = (lang.split('-')[1] || '').toUpperCase();
    return regionFromCountry(country);
  } catch {
    return 'OTHER';
  }
}

export default function PricingCards({ isAnnual }: PricingCardsProps) {
  const navigate = useNavigate();
  const region = useMemo(detectRegion, []);

  const handleSelect = (_id: PlanId) => {
    navigate('/signup');
  };

  return (
    <section id="pricing-cards" className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <PlanCardsGrid
          region={region}
          cycle={isAnnual ? 'yearly' : 'monthly'}
          onSelect={handleSelect}
          variant="light"
          showTrialBadge
          showFree
        />
      </div>
    </section>
  );
}
