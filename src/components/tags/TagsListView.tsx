import { Tag, TagRule, TAG_TYPE_OPTIONS } from '@/types/tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  Zap,
  Users,
  MessageSquare,
  Copy,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TagsListViewProps {
  tags: Tag[];
  rules: TagRule[];
  loading: boolean;
  viewMode?: 'list' | 'grid';
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onArchiveTag: (tagId: string) => void;
  onRestoreTag: (tagId: string) => void;
  onCreateRule: (tagId: string) => void;
  onToggleRule: (ruleId: string, isActive: boolean) => void;
}

export function TagsListView({
  tags,
  rules,
  loading,
  viewMode = 'list',
  onEditTag,
  onDeleteTag,
  onArchiveTag,
  onRestoreTag,
  onCreateRule,
  onToggleRule,
}: TagsListViewProps) {
  const getTagRules = (tagId: string) => rules.filter(r => r.tag_id === tagId);

  if (loading) {
    return viewMode === 'grid' ? (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <Skeleton className="h-8 w-24 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-xl bg-card">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tags.map((tag) => {
          const tagRules = getTagRules(tag.id);
          const typeOption = TAG_TYPE_OPTIONS.find(t => t.value === tag.tag_type);
          
          return (
            <Card 
              key={tag.id} 
              className={cn(
                "group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30",
                tag.status === 'archived' && 'opacity-60'
              )}
            >
              <CardContent className="p-4">
                {/* Tag Badge */}
                <div className="mb-3">
                  <Badge
                    className="text-sm px-3 py-1.5 font-medium"
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  >
                    {tag.emoji && <span className="mr-1.5">{tag.emoji}</span>}
                    {tag.name}
                  </Badge>
                </div>

                {/* Type */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <span>{typeOption?.emoji}</span>
                  <span>{typeOption?.label}</span>
                  {tag.tag_group && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{tag.tag_group}</span>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{tag.contacts_count || 0}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Contacts with this tag</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{tag.conversations_count || 0}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Conversations with this tag</TooltipContent>
                  </Tooltip>
                  {tagRules.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Zap className="h-3.5 w-3.5" />
                          <span>{tagRules.length}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Active automation rules</TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      tag.status === 'active' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tag.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTag(tag)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tag
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateRule(tag.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Create Rule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {tag.status === 'active' ? (
                        <DropdownMenuItem onClick={() => onArchiveTag(tag.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onRestoreTag(tag.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // List View (Table)
  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[280px] font-semibold">Tag</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Group</TableHead>
            <TableHead className="text-center font-semibold">Usage</TableHead>
            <TableHead className="text-center font-semibold">Rules</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => {
            const tagRules = getTagRules(tag.id);
            const typeOption = TAG_TYPE_OPTIONS.find(t => t.value === tag.tag_type);
            
            return (
              <TableRow 
                key={tag.id} 
                className={cn(
                  "group transition-colors",
                  tag.status === 'archived' && 'bg-muted/20'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="text-sm px-3 py-1 font-medium shadow-sm"
                      style={{ backgroundColor: tag.color || '#6366f1' }}
                    >
                      {tag.emoji && <span className="mr-1.5">{tag.emoji}</span>}
                      {tag.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">{typeOption?.emoji}</span>
                    <span className="text-muted-foreground">{typeOption?.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {tag.tag_group ? (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tag.tag_group}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{tag.contacts_count || 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Contacts</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{tag.conversations_count || 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Conversations</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {tagRules.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10">
                          <Zap className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">{tagRules.length}</span>
                        </div>
                        <Switch
                          checked={tagRules.some(r => r.is_active)}
                          onCheckedChange={(checked) => {
                            tagRules.forEach(r => onToggleRule(r.id, checked));
                          }}
                          className="scale-90"
                        />
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                        onClick={() => onCreateRule(tag.id)}
                      >
                        <Zap className="h-3 w-3" />
                        Add Rule
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium',
                      tag.status === 'active' 
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tag.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {tag.status === 'active' ? 'Active' : 'Archived'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEditTag(tag)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tag
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateRule(tag.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Create Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {tag.status === 'active' ? (
                        <DropdownMenuItem onClick={() => onArchiveTag(tag.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onRestoreTag(tag.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}