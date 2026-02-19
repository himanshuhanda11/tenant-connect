import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, MoreVertical, Edit, Copy, Trash2, FileText,
  BarChart3, Sparkles, Eye, Archive, CheckCircle2, Clock,
  Layers, Send,
} from 'lucide-react';
import { useForms } from '@/hooks/useForms';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { FormDefinition } from '@/types/formRule';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Edit },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Archive },
};

export default function AutoFormsList() {
  const navigate = useNavigate();
  const { forms, loading, createForm, deleteForm } = useForms();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormDefinition | null>(null);

  const filtered = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = forms.filter(f => f.status === 'active').length;
  const draftCount = forms.filter(f => f.status === 'draft').length;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const form = await createForm(newName.trim(), newDescription.trim() || undefined);
    setCreating(false);
    if (form) {
      setCreateOpen(false);
      setNewName('');
      setNewDescription('');
      navigate(`/auto-forms/${form.id}/builder`);
    }
  };

  const handleDuplicate = async (form: FormDefinition) => {
    await createForm(`${form.name} (Copy)`, form.description || undefined);
  };

  const handleDelete = async () => {
    if (formToDelete) {
      await deleteForm(formToDelete.id);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 sm:px-6 py-5 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Auto-Forms</h1>
                <p className="text-sm text-muted-foreground">Build & manage smart WhatsApp forms</p>
              </div>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-primary' },
              { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-emerald-600' },
              { label: 'Drafts', value: draftCount, icon: Edit, color: 'text-muted-foreground' },
            ].map(s => (
              <Card key={s.label} className="bg-card/50 border-border/50">
                <CardContent className="p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Forms List */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No Forms Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    Create your first smart form to capture leads via WhatsApp conversations.
                  </p>
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create First Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(form => {
                  const status = statusConfig[form.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <Card
                      key={form.id}
                      className="transition-all hover:shadow-md cursor-pointer group"
                      onClick={() => navigate(`/auto-forms/${form.id}/builder`)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{form.name}</h3>
                            <Badge className={cn("text-[10px] px-1.5 py-0 border-0", status.color)}>
                              <StatusIcon className="w-3 h-3 mr-0.5" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {form.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(form.created_at), { addSuffix: true })}
                            </span>
                            {form.active_version_id && (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                Published
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => navigate(`/auto-forms/${form.id}/builder`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/auto-forms/${form.id}/builder`)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/auto-forms/${form.id}/rules`)}>
                                <Sparkles className="h-4 w-4 mr-2" /> Rules
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/auto-forms/${form.id}/submissions`)}>
                                <BarChart3 className="h-4 w-4 mr-2" /> Submissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setFormToDelete(form); setDeleteDialogOpen(true); }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Give your form a name and optional description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Form Name *</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Lead Capture Form"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="What is this form for?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
              {creating ? 'Creating...' : 'Create & Build'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{formToDelete?.name}" and all its versions, fields, and submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
