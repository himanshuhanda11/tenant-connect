import { Tag, TAG_TYPE_OPTIONS, TagType } from '@/types/tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tags, FolderOpen, Archive } from 'lucide-react';

interface TagsSidebarProps {
  tags: Tag[];
  selectedType: TagType | 'all';
  selectedStatus: 'active' | 'archived' | 'all';
  onSelectType: (type: TagType | 'all') => void;
  onSelectStatus: (status: 'active' | 'archived' | 'all') => void;
  groups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export function TagsSidebar({
  tags,
  selectedType,
  selectedStatus,
  onSelectType,
  onSelectStatus,
  groups,
  selectedGroup,
  onSelectGroup,
}: TagsSidebarProps) {
  const getTypeCount = (type: TagType | 'all') => {
    if (type === 'all') return tags.length;
    return tags.filter(t => t.tag_type === type).length;
  };

  const getStatusCount = (status: 'active' | 'archived') => {
    return tags.filter(t => t.status === status).length;
  };

  const getGroupCount = (group: string) => {
    return tags.filter(t => t.tag_group === group).length;
  };

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Tag Groups
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* All Tags */}
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between h-9',
              selectedType === 'all' && selectedStatus === 'all' && !selectedGroup && 'bg-primary/10 text-primary'
            )}
            onClick={() => { onSelectType('all'); onSelectStatus('all'); onSelectGroup(''); }}
          >
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span>All Tags</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {getTypeCount('all')}
            </Badge>
          </Button>

          {/* By Type */}
          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              By Type
            </p>
            {TAG_TYPE_OPTIONS.map((type) => (
              <Button
                key={type.value}
                variant="ghost"
                className={cn(
                  'w-full justify-between h-9',
                  selectedType === type.value && 'bg-primary/10 text-primary'
                )}
                onClick={() => { onSelectType(type.value); onSelectGroup(''); }}
              >
                <div className="flex items-center gap-2">
                  <span>{type.emoji}</span>
                  <span className="text-sm">{type.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getTypeCount(type.value)}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Custom Groups */}
          {groups.length > 0 && (
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Custom Groups
              </p>
              {groups.map((group) => (
                <Button
                  key={group}
                  variant="ghost"
                  className={cn(
                    'w-full justify-between h-9',
                    selectedGroup === group && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => { onSelectGroup(group); onSelectType('all'); }}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm truncate">{group}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getGroupCount(group)}
                  </Badge>
                </Button>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Status
            </p>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between h-9',
                selectedStatus === 'active' && 'bg-primary/10 text-primary'
              )}
              onClick={() => { onSelectStatus('active'); onSelectType('all'); onSelectGroup(''); }}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Active</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getStatusCount('active')}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between h-9',
                selectedStatus === 'archived' && 'bg-primary/10 text-primary'
              )}
              onClick={() => { onSelectStatus('archived'); onSelectType('all'); onSelectGroup(''); }}
            >
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Archived</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getStatusCount('archived')}
              </Badge>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
