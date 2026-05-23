import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search, User, X, Check } from 'lucide-react';
import { useContactSearch } from '@/hooks/useCrmExtras';
import { cn } from '@/lib/utils';

interface Props {
  value: { id: string; name: string | null; wa_id: string } | null;
  onChange: (c: { id: string; name: string | null; wa_id: string } | null) => void;
  placeholder?: string;
}

export function ContactPicker({ value, onChange, placeholder = 'Link a contact...' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results, loading } = useContactSearch(query);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('w-full h-9 justify-between font-normal', !value && 'text-muted-foreground')}
        >
          <span className="flex items-center gap-2 truncate">
            <User className="h-3.5 w-3.5 shrink-0" />
            {value ? (value.name || value.wa_id) : placeholder}
          </span>
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Unlink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search contacts..." />
          <CommandList>
            {loading && <div className="p-3 text-xs text-muted-foreground text-center">Searching...</div>}
            {!loading && results.length === 0 && <CommandEmpty>No contacts found.</CommandEmpty>}
            <CommandGroup>
              {results.map(c => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => { onChange(c); setOpen(false); }}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      <span className="font-medium">{c.name || 'Unnamed'}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{c.wa_id}</span>
                    </span>
                  </span>
                  {value?.id === c.id && <Check className="h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
