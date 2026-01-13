import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Tag as TagIcon,
  Search,
  Plus,
  Check,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Tag, TagType, TAG_TYPE_OPTIONS } from '@/types/tag';
import { cn } from '@/lib/utils';

interface InboxTagPickerProps {
  allTags: Tag[];
  appliedTags: Tag[];
  recentTags: Tag[];
  onApplyTag: (tagId: string) => Promise<boolean>;
  onRemoveTag: (tagId: string) => Promise<boolean>;
  onCreateTag?: () => void;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function InboxTagPicker({
  allTags,
  appliedTags,
  recentTags,
  onApplyTag,
  onRemoveTag,
  onCreateTag,
  trigger,
  align = 'start',
}: InboxTagPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TagType | 'all'>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const appliedIds = useMemo(
    () => new Set(appliedTags.map((t) => t.id)),
    [appliedTags]
  );

  const filteredTags = useMemo(() => {
    let tags = allTags;

    if (search) {
      const q = search.toLowerCase();
      tags = tags.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tag_group?.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      tags = tags.filter((t) => t.tag_type === typeFilter);
    }

    return tags;
  }, [allTags, search, typeFilter]);

  const recentFiltered = useMemo(() => {
    if (search) return [];
    return recentTags.filter((t) => !appliedIds.has(t.id)).slice(0, 5);
  }, [recentTags, appliedIds, search]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredTags.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredTags[highlightedIndex]) {
        e.preventDefault();
        handleToggleTag(filteredTags[highlightedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredTags, highlightedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
      setTypeFilter('all');
      setHighlightedIndex(0);
    }
  }, [open]);

  const handleToggleTag = async (tag: Tag) => {
    const isApplied = appliedIds.has(tag.id);
    if (isApplied) {
      await onRemoveTag(tag.id);
    } else {
      await onApplyTag(tag.id);
    }
  };

  const getTypeColor = (type: string) => {
    const opt = TAG_TYPE_OPTIONS.find((t) => t.value === type);
    return opt?.emoji || '🏷️';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <TagIcon className="h-4 w-4" />
            Add Tag
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align={align}>
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
        </div>

        {/* Type filter chips */}
        <div className="px-3 py-2 border-b overflow-x-auto">
          <div className="flex gap-1">
            <Badge
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setTypeFilter('all')}
            >
              All
            </Badge>
            {TAG_TYPE_OPTIONS.slice(0, 4).map((type) => (
              <Badge
                key={type.value}
                variant={typeFilter === type.value ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setTypeFilter(type.value as TagType)}
              >
                {type.emoji} {type.label}
              </Badge>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-[300px]">
          {/* Applied tags */}
          {appliedTags.length > 0 && !search && (
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                Applied ({appliedTags.length})
              </p>
              <div className="space-y-0.5">
                {appliedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-sm text-left"
                  >
                    <span className="flex items-center gap-2">
                      {tag.emoji ? (
                        <span>{tag.emoji}</span>
                      ) : (
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#6366f1' }}
                        />
                      )}
                      <span>{tag.name}</span>
                    </span>
                    <Check className="h-4 w-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent tags */}
          {recentFiltered.length > 0 && (
            <>
              {appliedTags.length > 0 && <Separator />}
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent
                </p>
                <div className="space-y-0.5">
                  {recentFiltered.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-sm text-left"
                    >
                      <span className="flex items-center gap-2">
                        {tag.emoji ? (
                          <span>{tag.emoji}</span>
                        ) : (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#6366f1' }}
                          />
                        )}
                        <span>{tag.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* All tags */}
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
              {search ? `Results (${filteredTags.length})` : 'All Tags'}
            </p>
            {filteredTags.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <TagIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {search ? 'No tags found' : 'No tags yet'}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredTags.map((tag, index) => {
                  const isApplied = appliedIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent text-sm text-left transition-colors',
                        index === highlightedIndex && 'bg-accent',
                        isApplied && 'bg-primary/5'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {tag.emoji ? (
                          <span>{tag.emoji}</span>
                        ) : (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#6366f1' }}
                          />
                        )}
                        <span className="truncate">{tag.name}</span>
                        {tag.tag_group && (
                          <span className="text-xs text-muted-foreground">
                            • {tag.tag_group}
                          </span>
                        )}
                      </span>
                      {isApplied && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Create new tag */}
        {onCreateTag && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false);
                onCreateTag();
              }}
            >
              <Plus className="h-4 w-4" />
              Create new tag
            </Button>
          </div>
        )}

        {/* Keyboard hint */}
        <div className="px-3 py-2 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-background rounded text-[10px] border">T</kbd> to open tag picker
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
