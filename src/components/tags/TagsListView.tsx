import { Tag, TagRule, TAG_TYPE_OPTIONS } from '@/types/tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TagsListViewProps {
  tags: Tag[];
  rules: TagRule[];
  loading: boolean;
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
  onEditTag,
  onDeleteTag,
  onArchiveTag,
  onRestoreTag,
  onCreateRule,
  onToggleRule,
}: TagsListViewProps) {
  const getTagRules = (tagId: string) => rules.filter(r => r.tag_id === tagId);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return null; // Parent handles empty state
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Tag</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Group</TableHead>
            <TableHead className="text-center">Usage</TableHead>
            <TableHead className="text-center">Rules</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => {
            const tagRules = getTagRules(tag.id);
            const typeOption = TAG_TYPE_OPTIONS.find(t => t.value === tag.tag_type);
            
            return (
              <TableRow key={tag.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="text-sm px-3 py-1"
                      style={{ backgroundColor: tag.color || '#6366f1' }}
                    >
                      {tag.emoji && <span className="mr-1.5">{tag.emoji}</span>}
                      {tag.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>{typeOption?.emoji}</span>
                    <span>{typeOption?.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {tag.tag_group ? (
                    <Badge variant="outline" className="text-xs">
                      {tag.tag_group}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="Contacts">
                      <Users className="h-3.5 w-3.5" />
                      <span>{tag.contacts_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Conversations">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{tag.conversations_count || 0}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {tagRules.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{tagRules.length}</span>
                        <Switch
                          checked={tagRules.some(r => r.is_active)}
                          onCheckedChange={(checked) => {
                            tagRules.forEach(r => onToggleRule(r.id, checked));
                          }}
                          className="ml-2 scale-75"
                        />
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => onCreateRule(tag.id)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Add Rule
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={tag.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                    }
                  >
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
                    <DropdownMenuContent align="end">
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
