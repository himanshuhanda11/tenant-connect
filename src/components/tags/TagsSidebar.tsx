import { Tag, TAG_TYPE_OPTIONS, TagType } from '@/types/tag';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tags, FolderOpen, Archive, Layers } from 'lucide-react';

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

  const isAllSelected = selectedType === 'all' && selectedStatus === 'all' && !selectedGroup;

  return (
    <div className="w-full lg:w-64 border-r bg-card/30 flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filter Tags</h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 space-y-1">
          {/* All Tags */}
          <button
            className={cn(
              'w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all',
              isAllSelected 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-muted/50 text-foreground'
            )}
            onClick={() => { onSelectType('all'); onSelectStatus('all'); onSelectGroup(''); }}
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Tags className="h-4 w-4" />
              <span className="text-xs sm:text-sm">All Tags</span>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                'text-[10px] sm:text-xs font-medium',
                isAllSelected && 'bg-primary-foreground/20 text-primary-foreground'
              )}
            >
              {getTypeCount('all')}
            </Badge>
          </button>

          {/* By Type Section */}
          <div className="pt-3 sm:pt-4 pb-2">
            <p className="px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              By Type
            </p>
            <div className="space-y-0.5">
              {TAG_TYPE_OPTIONS.map((type) => {
                const isSelected = selectedType === type.value && !selectedGroup;
                return (
                  <button
                    key={type.value}
                    className={cn(
                      'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all',
                      isSelected 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => { onSelectType(type.value); onSelectGroup(''); }}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <span className="text-sm sm:text-base">{type.emoji}</span>
                      <span>{type.label}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5',
                        isSelected && 'bg-primary/20 text-primary'
                      )}
                    >
                      {getTypeCount(type.value)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Groups Section */}
          {groups.length > 0 && (
            <div className="pt-3 sm:pt-4 pb-2">
              <p className="px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Custom Groups
              </p>
              <div className="space-y-0.5">
                {groups.map((group) => {
                  const isSelected = selectedGroup === group;
                  return (
                    <button
                      key={group}
                      className={cn(
                        'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all',
                        isSelected 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => { onSelectGroup(group); onSelectType('all'); }}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="truncate max-w-[100px] sm:max-w-[120px]">{group}</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5',
                          isSelected && 'bg-primary/20 text-primary'
                        )}
                      >
                        {getGroupCount(group)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="pt-3 sm:pt-4 pb-2">
            <p className="px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="space-y-0.5">
              <button
                className={cn(
                  'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all',
                  selectedStatus === 'active' && selectedType === 'all' && !selectedGroup
                    ? 'bg-green-500/10 text-green-600 font-medium' 
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                )}
                onClick={() => { onSelectStatus('active'); onSelectType('all'); onSelectGroup(''); }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                  <span>Active</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5',
                    selectedStatus === 'active' && selectedType === 'all' && !selectedGroup && 'bg-green-500/20 text-green-600'
                  )}
                >
                  {getStatusCount('active')}
                </Badge>
              </button>
              <button
                className={cn(
                  'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all',
                  selectedStatus === 'archived' && selectedType === 'all' && !selectedGroup
                    ? 'bg-muted text-muted-foreground font-medium' 
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                )}
                onClick={() => { onSelectStatus('archived'); onSelectType('all'); onSelectGroup(''); }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Archived</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5"
                >
                  {getStatusCount('archived')}
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}