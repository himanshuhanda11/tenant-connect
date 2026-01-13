import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

interface SmartViewsSidebarProps {
  activeViewId: string;
  onViewChange: (view: SmartView) => void;
  segments: Segment[];
  viewCounts: Record<string, number>;
  onCreateSegment: () => void;
}

export function SmartViewsSidebar({
  activeViewId,
  onViewChange,
  segments,
  viewCounts,
  onCreateSegment,
}: SmartViewsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    smartViews: true,
    segments: true,
  });

  const toggleSection = (section: 'smartViews' | 'segments') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Views</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Smart Views */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('smartViews')}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>SMART VIEWS</span>
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform',
                  expandedSections.smartViews && 'rotate-90'
                )}
              />
            </button>

            {expandedSections.smartViews && (
              <div className="space-y-0.5">
                {DEFAULT_SMART_VIEWS.map((view) => {
                  const IconComponent = iconMap[view.icon] || Users;
                  const isActive = activeViewId === view.id;
                  const count = viewCounts[view.id];

                  return (
                    <button
                      key={view.id}
                      onClick={() => onViewChange(view)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{view.name}</span>
                      </div>
                      {count !== undefined && (
                        <Badge
                          variant={isActive ? 'secondary' : 'outline'}
                          className="text-xs h-5 px-1.5"
                        >
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Saved Segments */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('segments')}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>SAVED SEGMENTS</span>
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform',
                  expandedSections.segments && 'rotate-90'
                )}
              />
            </button>

            {expandedSections.segments && (
              <div className="space-y-0.5">
                {segments.length > 0 ? (
                  segments.map((segment) => {
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
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          <span className="truncate">{segment.name}</span>
                        </div>
                        <Badge
                          variant={isActive ? 'secondary' : 'outline'}
                          className="text-xs h-5 px-1.5"
                        >
                          {segment.contact_count}
                        </Badge>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No saved segments yet
                  </p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  onClick={onCreateSegment}
                >
                  <Plus className="h-4 w-4" />
                  Create Segment
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
