import { Phone } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhoneNumberOption } from '@/hooks/usePhoneNumbers';

interface PhoneSelectorProps {
  phoneNumbers: PhoneNumberOption[];
  selectedPhoneId: string | null;
  onSelect: (phoneId: string | null) => void;
  loading?: boolean;
}

export function PhoneSelector({
  phoneNumbers,
  selectedPhoneId,
  onSelect,
  loading,
}: PhoneSelectorProps) {
  if (loading) {
    return (
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
    );
  }

  if (phoneNumbers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-4 w-4" />
        <span>No phone numbers connected</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedPhoneId || 'all'}
      onValueChange={(value) => onSelect(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-[220px]">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select phone number" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Numbers</SelectItem>
        {phoneNumbers.map((phone) => (
          <SelectItem key={phone.id} value={phone.id}>
            <div className="flex flex-col">
              <span>{phone.display_number}</span>
              {phone.verified_name && (
                <span className="text-xs text-muted-foreground">
                  {phone.verified_name}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
