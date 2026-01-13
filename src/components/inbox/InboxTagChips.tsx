import { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, X, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tag } from '@/types/tag';
import { TAG_TYPE_OPTIONS } from '@/types/tag';
import { cn } from '@/lib/utils';

interface InboxTagChipsProps {
  tags: Tag[];
  onRemoveTag?: (tagId: string) => void;
  onAddClick?: () => void;
  maxVisible?: number;
  size?: 'sm' | 'md';
  showAddButton?: boolean;
}

export function InboxTagChips({
  tags,
  onRemoveTag,
  onAddClick,
  maxVisible = 3,
  size = 'sm',
  showAddButton = true,
}: InboxTagChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(maxVisible);

  const visibleTags = tags.slice(0, visibleCount);
  const overflowTags = tags.slice(visibleCount);

  const getTypeLabel = (type: string) => {
    return TAG_TYPE_OPTIONS.find(t => t.value === type)?.label || 'Custom';
  };

  const sizeClasses = size === 'sm' 
    ? 'h-5 text-xs px-1.5 gap-0.5'
    : 'h-6 text-sm px-2 gap-1';

  return (
    <div ref={containerRef} className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag) => (
        <TooltipProvider key={tag.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  'font-normal cursor-default group transition-colors',
                  sizeClasses
                )}
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.emoji && <span className="mr-0.5">{tag.emoji}</span>}
                <span className="truncate max-w-[80px]">{tag.name}</span>
                {onRemoveTag && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTag(tag.id);
                    }}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-1">
                  {tag.emoji && <span>{tag.emoji}</span>}
                  {tag.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Type: {getTypeLabel(tag.tag_type)}
                  {tag.tag_group && ` • Group: ${tag.tag_group}`}
                </div>
                {tag.description && (
                  <p className="text-xs">{tag.description}</p>
                )}
                {(tag.contacts_count !== undefined || tag.conversations_count !== undefined) && (
                  <div className="text-xs text-muted-foreground">
                    {tag.contacts_count ?? 0} contacts
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {overflowTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                'font-normal cursor-pointer hover:bg-accent',
                sizeClasses
              )}
            >
              +{overflowTags.length}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                More tags
              </p>
              <div className="flex flex-wrap gap-1">
                {overflowTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn('font-normal group', sizeClasses)}
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      borderColor: tag.color || undefined,
                      color: tag.color || undefined,
                    }}
                  >
                    {tag.emoji && <span className="mr-0.5">{tag.emoji}</span>}
                    {tag.name}
                    {onRemoveTag && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTag(tag.id);
                        }}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {showAddButton && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-full',
            size === 'sm' ? 'h-5 w-5 p-0' : 'h-6 w-6 p-0'
          )}
          onClick={onAddClick}
        >
          <TagIcon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </Button>
      )}
    </div>
  );
}
