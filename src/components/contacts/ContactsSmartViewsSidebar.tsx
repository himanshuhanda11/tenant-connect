import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserPlus,
  Activity,
  Clock,
  Star,
  UserX,
  Ban,
  AlertTriangle,
  FolderOpen,
  Plus,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';
import { SmartView, DEFAULT_SMART_VIEWS, Segment } from '@/types/segment';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UserPlus,
  Activity,
  Clock,
  Star,
  UserX,
  Ban,
  AlertTriangle,
  FolderOpen,
};

const VIEW_COLORS: Record<string, string> = {
  all: 'text-foreground',
  'new-today': 'text-emerald-600',
  active: 'text-green-600',
  'inactive-30': 'text-amber-600',
  vip: 'text-yellow-500',
  'opted-out': 'text-rose-600',
  blocked: 'text-red-600',
  'sla-risk': 'text-orange-600',
};

interface ContactsSmartViewsSidebarProps {
  activeViewId: string;
  onViewChange: (view: SmartView) => void;
  segments: Segment[];
  viewCounts: Record<string, number>;
  onCreateSegment: () => void;
}

export function ContactsSmartViewsSidebar({
  activeViewId,
  onViewChange,
  segments,
  viewCounts,
  onCreateSegment,
}: ContactsSmartViewsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    smartViews: true,
    segments: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (section: 'smartViews' | 'segments') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredViews = DEFAULT_SMART_VIEWS.filter(view => 
    view.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full lg:w-72 border-r bg-gradient-to-b from-muted/30 to-muted/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Views & Segments</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search views..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 space-y-1">
          {/* Smart Views Section */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('smartViews')}
              className="w-full flex items-center justify-between px-2 py-1.5 sm:py-2 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span>Smart Views</span>
              </div>
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  expandedSections.smartViews && 'rotate-90'
                )}
              />
            </button>

            {expandedSections.smartViews && (
              <div className="space-y-0.5 pl-1">
                {filteredViews.map((view) => {
                  const IconComponent = iconMap[view.icon] || Users;
                  const isActive = activeViewId === view.id;
                  const count = viewCounts[view.id];
                  const colorClass = VIEW_COLORS[view.id] || 'text-foreground';

                  return (
                    <button
                      key={view.id}
                      onClick={() => onViewChange(view)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'hover:bg-muted/80 text-foreground group'
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                          "p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-colors",
                          isActive 
                            ? "bg-primary-foreground/20" 
                            : "bg-muted group-hover:bg-background"
                        )}>
                          <IconComponent className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4",
                            isActive ? "text-primary-foreground" : colorClass
                          )} />
                        </div>
                        <span className="font-medium text-xs sm:text-sm">{view.name}</span>
                      </div>
                      {count !== undefined && (
                        <Badge
                          variant={isActive ? 'secondary' : 'outline'}
                          className={cn(
                            "text-[10px] sm:text-xs font-medium min-w-[24px] sm:min-w-[28px] justify-center",
                            isActive && "bg-primary-foreground/20 text-primary-foreground border-0"
                          )}
                        >
                          {count > 999 ? '999+' : count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Saved Segments Section */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('segments')}
              className="w-full flex items-center justify-between px-2 py-1.5 sm:py-2 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span>Saved Segments</span>
              </div>
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  expandedSections.segments && 'rotate-90'
                )}
              />
            </button>

            {expandedSections.segments && (
              <div className="space-y-0.5 pl-1">
                {filteredSegments.length > 0 ? (
                  filteredSegments.map((segment) => {
                    const isActive = activeViewId === `segment-${segment.id}`;

                    return (
                      <button
                        key={segment.id}
                        onClick={() =>
                          onViewChange({
                            id: `segment-${segment.id}`,
                            name: segment.name,
                            icon: 'FolderOpen',
                            filters: segment.filters,
                            isSystem: false,
                          })
                        }
                        className={cn(
                          'w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'hover:bg-muted/80 text-foreground group'
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={cn(
                            "p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-colors",
                            isActive 
                              ? "bg-primary-foreground/20" 
                              : "bg-muted group-hover:bg-background"
                          )}>
                            <FolderOpen className={cn(
                              "h-3.5 w-3.5 sm:h-4 sm:w-4",
                              isActive ? "text-primary-foreground" : "text-violet-600"
                            )} />
                          </div>
                          <span className="truncate font-medium text-xs sm:text-sm">{segment.name}</span>
                        </div>
                        <Badge
                          variant={isActive ? 'secondary' : 'outline'}
                          className={cn(
                            "text-[10px] sm:text-xs font-medium min-w-[24px] sm:min-w-[28px] justify-center",
                            isActive && "bg-primary-foreground/20 text-primary-foreground border-0"
                          )}
                        >
                          {segment.contact_count}
                        </Badge>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 sm:py-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      No segments yet
                    </p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 sm:gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg sm:rounded-xl py-2 sm:py-2.5 mt-1 text-xs sm:text-sm"
                  onClick={onCreateSegment}
                >
                  <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-muted">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  Create New Segment
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Quick Stats */}
      <div className="p-3 sm:p-4 border-t bg-background/50">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
          <span>{DEFAULT_SMART_VIEWS.length} views</span>
          <span>•</span>
          <span>{segments.length} segments</span>
        </div>
      </div>
    </div>
  );
}