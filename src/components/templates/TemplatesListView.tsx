import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Send, 
  Copy, 
  Archive,
  Trash2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Template, InternalStatus, MetaStatus, TemplateCategory } from '@/types/template';
import { format } from 'date-fns';

interface TemplatesListViewProps {
  templates: Template[];
  loading: boolean;
  onView: (template: Template) => void;
  onEdit: (template: Template) => void;
  onSubmitToMeta: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onArchive: (template: Template) => void;
  onDelete: (template: Template) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  filters: {
    search: string;
    category: TemplateCategory | '';
    internal_status: InternalStatus | '';
    meta_status: string;
    language: string;
  };
  onFiltersChange: (filters: TemplatesListViewProps['filters']) => void;
}

export function TemplatesListView({
  templates,
  loading,
  onView,
  onEdit,
  onSubmitToMeta,
  onDuplicate,
  onArchive,
  onDelete,
  onRefresh,
  onCreateNew,
  filters,
  onFiltersChange
}: TemplatesListViewProps) {
  const navigate = useNavigate();

  const getInternalStatusBadge = (status: InternalStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">In Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'changes_requested':
        return <Badge variant="destructive">Changes Requested</Badge>;
    }
  };

  const getMetaStatusBadge = (status: MetaStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PAUSED':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Paused</Badge>;
      case 'DISABLED':
        return <Badge variant="outline">Disabled</Badge>;
    }
  };

  const getCategoryBadge = (category: TemplateCategory) => {
    switch (category) {
      case 'UTILITY':
        return <Badge variant="outline" className="border-green-500 text-green-600">Utility</Badge>;
      case 'MARKETING':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Marketing</Badge>;
      case 'AUTHENTICATION':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Auth</Badge>;
    }
  };

  const canSubmitToMeta = (template: Template) => {
    return template.status !== 'APPROVED';
  };

  const canEdit = (template: Template) => {
    return template.internal_status === 'draft' || template.internal_status === 'changes_requested';
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CardTitle className="text-lg">My Templates</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync from Meta
            </Button>
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-1" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          <Select 
            value={filters.internal_status || 'all'} 
            onValueChange={(v) => onFiltersChange({ ...filters, internal_status: v === 'all' ? '' : v as InternalStatus })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Internal Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Internal</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="changes_requested">Changes Requested</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.meta_status || 'all'} 
            onValueChange={(v) => onFiltersChange({ ...filters, meta_status: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Meta Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meta</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="DISABLED">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.category || 'all'} 
            onValueChange={(v) => onFiltersChange({ ...filters, category: v === 'all' ? '' : v as TemplateCategory })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.language || 'all'} 
            onValueChange={(v) => onFiltersChange({ ...filters, language: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Internal Status</TableHead>
                  <TableHead>Meta Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium" onClick={() => onView(template)}>
                      {template.name}
                    </TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{getInternalStatusBadge(template.internal_status)}</TableCell>
                    <TableCell>{getMetaStatusBadge(template.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              template.template_score >= 80 ? 'bg-green-500' :
                              template.template_score >= 60 ? 'bg-yellow-500' :
                              'bg-destructive'
                            }`}
                            style={{ width: `${template.template_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{template.template_score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(template.updated_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {canEdit(template) && (
                            <DropdownMenuItem onClick={() => onEdit(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Draft
                            </DropdownMenuItem>
                          )}
                          {canSubmitToMeta(template) && (
                            <DropdownMenuItem onClick={() => onSubmitToMeta(template)}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit to Meta
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDuplicate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onArchive(template)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(template)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
