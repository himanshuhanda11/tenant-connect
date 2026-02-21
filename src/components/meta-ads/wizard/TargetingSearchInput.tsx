import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

interface SearchResult {
  id?: string;
  key?: string;
  name: string;
  type?: string;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  country_code?: string;
  country_name?: string;
  region?: string;
  path?: string[];
}

interface SelectedItem {
  id?: string;
  key?: string;
  name: string;
  type?: string;
  [key: string]: unknown;
}

interface TargetingSearchInputProps {
  searchType: 'interests' | 'geo' | 'locale';
  adAccountId: string;
  selectedItems: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
  placeholder?: string;
  className?: string;
}

export function TargetingSearchInput({
  searchType,
  adAccountId,
  selectedItems,
  onChange,
  placeholder = 'Search...',
  className,
}: TargetingSearchInputProps) {
  const { currentTenant } = useTenant();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2 || !currentTenant?.id || !adAccountId) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-targeting-search', {
        body: {
          tenantId: currentTenant.id,
          adAccountId,
          searchType,
          query: q.trim(),
        },
      });

      if (error) {
        console.error('Targeting search error:', error);
        setResults([]);
        return;
      }

      setResults(data?.results || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Targeting search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentTenant?.id, adAccountId, searchType]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => search(value), 400);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const selectItem = (item: SearchResult) => {
    const uniqueKey = item.id || item.key || item.name;
    const alreadySelected = selectedItems.some(
      s => (s.id || s.key || s.name) === uniqueKey
    );
    if (!alreadySelected) {
      onChange([...selectedItems, { ...item }]);
    }
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const removeItem = (index: number) => {
    onChange(selectedItems.filter((_, i) => i !== index));
  };

  const formatAudience = (lower?: number, upper?: number) => {
    if (!lower && !upper) return '';
    const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;
    if (lower && upper) return `${fmt(lower)} – ${fmt(upper)}`;
    if (lower) return `${fmt(lower)}+`;
    return '';
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map((item, i) => (
            <Badge
              key={item.id || item.key || item.name + i}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {item.name}
              {item.type && <span className="text-muted-foreground text-[9px]">({item.type})</span>}
              <button
                onClick={() => removeItem(i)}
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          className="h-10 pl-9 pr-8"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {results.map((item, i) => {
            const uniqueKey = item.id || item.key || item.name;
            const isSelected = selectedItems.some(
              s => (s.id || s.key || s.name) === uniqueKey
            );
            return (
              <button
                key={uniqueKey + i}
                onClick={() => !isSelected && selectItem(item)}
                disabled={isSelected}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                  isSelected && 'opacity-50 cursor-not-allowed bg-muted/50'
                )}
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.type && (
                    <span className="text-muted-foreground text-xs ml-1.5">({item.type})</span>
                  )}
                  {item.country_name && (
                    <span className="text-muted-foreground text-xs ml-1.5">— {item.country_name}</span>
                  )}
                  {item.region && (
                    <span className="text-muted-foreground text-xs ml-1">({item.region})</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {searchType === 'interests' && formatAudience(item.audience_size_lower_bound, item.audience_size_upper_bound)}
                  {isSelected && '✓'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {showDropdown && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg p-3 text-center text-sm text-muted-foreground">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
