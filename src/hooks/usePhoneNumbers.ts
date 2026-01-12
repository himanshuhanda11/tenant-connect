import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface PhoneNumberOption {
  id: string;
  display_number: string;
  phone_number_id: string;
  verified_name?: string;
  status: string;
}

export function usePhoneNumbers() {
  const { currentTenant } = useTenant();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      fetchPhoneNumbers();
    }
  }, [currentTenant]);

  const fetchPhoneNumbers = async () => {
    if (!currentTenant) return;

    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('id, display_number, phone_number_id, verified_name, status')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'connected');

      if (error) throw error;

      setPhoneNumbers(data || []);
      
      // Auto-select first phone number if none selected
      if (data && data.length > 0 && !selectedPhoneId) {
        setSelectedPhoneId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    phoneNumbers,
    loading,
    selectedPhoneId,
    setSelectedPhoneId,
    refetch: fetchPhoneNumbers,
  };
}
