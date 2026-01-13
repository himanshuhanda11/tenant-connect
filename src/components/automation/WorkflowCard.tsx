import { 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  MoreVertical, 
  Zap,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkflowWithRelations, TRIGGER_DEFINITIONS } from '@/types/automation';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowCardProps {
  workflow: WorkflowWithRelations;
  onEdit: (workflow: WorkflowWithRelations) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (workflow: WorkflowWithRelations) => void;
}

export function WorkflowCard({
  workflow,
  onEdit,
  onToggleStatus,
  onDuplicate,
  onDelete,
  onTest,
}: WorkflowCardProps) {
  const triggerDef = TRIGGER_DEFINITIONS[workflow.trigger_type];
  
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    paused: { label: 'Paused', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
  };

  const status = statusConfig[workflow.status];

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">{workflow.name}</h3>
                <Badge className={status.className}>{status.label}</Badge>
              </div>
              
              {workflow.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  {workflow.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {triggerDef?.label || workflow.trigger_type}
                </span>
                {workflow.updated_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {workflow.stats && (
              <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">{workflow.stats.runs_today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{workflow.stats.runs_7_days}</div>
                  <div className="text-xs text-muted-foreground">7 Days</div>
                </div>
                <div className="text-center flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <div className="font-medium text-foreground">{workflow.stats.success_rate}%</div>
                </div>
                {workflow.stats.error_count > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">{workflow.stats.error_count}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStatus(workflow.id)}
              className="h-8 w-8"
            >
              {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTest(workflow)}>
                  <Play className="h-4 w-4 mr-2" />Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(workflow)}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(workflow.id)}>
                  <Copy className="h-4 w-4 mr-2" />Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(workflow.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
