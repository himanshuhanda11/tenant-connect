import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Plus, Settings, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeLike {
  node_key: string;
  node_type: string;
  label?: string;
  config?: any;
  position_y: number;
}

interface MobileStepListProps {
  nodes: NodeLike[];
  selectedNodeKey: string | null;
  onSelect: (key: string) => void;
  onDelete: (key: string) => void;
  onAdd: () => void;
}

export const MobileStepList: React.FC<MobileStepListProps> = ({
  nodes, selectedNodeKey, onSelect, onDelete, onAdd,
}) => {
  const sorted = [...nodes].sort((a, b) => (a.position_y ?? 0) - (b.position_y ?? 0));
  return (
    <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-1">
        Flow Steps · {sorted.length}
      </div>
      <div className="space-y-2">
        {sorted.map((n, i) => (
          <React.Fragment key={n.node_key}>
            <button
              onClick={() => onSelect(n.node_key)}
              className={cn(
                'w-full text-left flex items-center gap-3 p-3 rounded-2xl border-2 bg-card transition-all',
                selectedNodeKey === n.node_key
                  ? 'border-primary shadow-md'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-[10px] shrink-0">
                {i + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm capitalize truncate">
                  {n.label || n.node_type.replace(/-/g, ' ')}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {n.config?.message || n.config?.keyword || 'Tap to configure'}
                </p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
              {n.node_type !== 'start' && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onDelete(n.node_key); }}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
            {i < sorted.length - 1 && (
              <div className="flex justify-center">
                <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <Button onClick={onAdd} variant="outline" className="w-full mt-4 gap-2 rounded-2xl h-12 border-dashed">
        <Plus className="w-4 h-4" /> Add step
      </Button>
    </div>
  );
};
