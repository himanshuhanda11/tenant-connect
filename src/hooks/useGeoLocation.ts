import { useState, useEffect } from 'react';

export type Region = 'IN' | 'AE' | 'US' | 'OTHER';

interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // conversion rate from USD
}

export const currencyConfigs: Record<Region, CurrencyConfig> = {
  IN: { code: 'INR', symbol: '₹', rate: 83 },
  AE: { code: 'AED', symbol: 'د.إ', rate: 3.67 },
  US: { code: 'USD', symbol: '$', rate: 1 },
  OTHER: { code: 'USD', symbol: '$', rate: 1 },
};

export function useGeoLocation() {
  const [region, setRegion] = useState<Region>('OTHER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Try to get timezone-based detection first (faster, no API call)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
          setRegion('IN');
        } else if (timezone.includes('Asia/Dubai') || timezone.includes('Asia/Abu_Dhabi')) {
          setRegion('AE');
        } else if (timezone.includes('America/')) {
          setRegion('US');
        } else {
          // Fallback: Try language/locale detection
          const lang = navigator.language || navigator.languages?.[0] || '';
          if (lang.includes('IN') || lang === 'hi') {
            setRegion('IN');
          } else if (lang.includes('AE') || lang === 'ar-AE') {
            setRegion('AE');
          }
        }
      } catch (error) {
        console.log('Region detection failed, using default');
      } finally {
        setLoading(false);
      }
    };

    detectRegion();
  }, []);

  const formatPrice = (usdPrice: number): string => {
    const config = currencyConfigs[region];
    const convertedPrice = Math.round(usdPrice * config.rate);
    
    if (region === 'IN') {
      // Indian number formatting (lakhs, crores)
      return `${config.symbol}${convertedPrice.toLocaleString('en-IN')}`;
    }
    
    return `${config.symbol}${convertedPrice.toLocaleString()}`;
  };

  const getCurrency = () => currencyConfigs[region];

  return { region, loading, formatPrice, getCurrency, setRegion };
}
