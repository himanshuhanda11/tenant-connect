import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Lightbulb,
  Rocket,
  Tag,
  Pencil,
  Hash,
  Sparkles,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserAttribute {
  id: string;
  tenant_id: string;
  name: string;
  action_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_ATTRIBUTES = ['$Name', '$MobileNumber', '$LastName', '$FirstName'];
const MAX_ATTRIBUTES = 5;

const SUGGESTIONS = [
  { name: 'Company', action: 'set_company' },
  { name: 'Email', action: 'set_email' },
  { name: 'City', action: 'set_city' },
  { name: 'Source', action: 'set_source' },
  { name: 'Budget', action: 'set_budget' },
];

function normalizeName(raw: string) {
  // Keep alphanumerics + underscores; CamelCase friendly.
  return raw.replace(/[^a-zA-Z0-9_ ]/g, '').slice(0, 40);
}

function toActionName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function UserAttributes() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserAttribute | null>(null);
  const [form, setForm] = useState({ name: '', action_name: '', is_active: true });
  const [actionTouched, setActionTouched] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserAttribute | null>(null);

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['user-attributes', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('user_attributes')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as UserAttribute[];
    },
    enabled: !!currentTenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (attr: { name: string; action_name: string; is_active: boolean }) => {
      if (!currentTenant?.id) throw new Error('No workspace selected');
      const { data, error } = await supabase
        .from('user_attributes')
        .insert({
          tenant_id: currentTenant.id,
          name: attr.name.trim(),
          action_name: attr.action_name.trim() || null,
          is_active: attr.is_active,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
      toast.success('Attribute created');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to create attribute'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserAttribute> }) => {
      const { error } = await supabase.from('user_attributes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update attribute'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_attributes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attributes'] });
      toast.success('Attribute deleted');
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete attribute'),
  });

  const filteredAttributes = useMemo(
    () =>
      attributes.filter((attr) => {
        const q = searchQuery.toLowerCase();
        const matches =
          attr.name.toLowerCase().includes(q) ||
          attr.action_name?.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && attr.is_active) ||
          (statusFilter === 'inactive' && !attr.is_active);
        return matches && matchesStatus;
      }),
    [attributes, searchQuery, statusFilter]
  );

  const used = attributes.length;
  const canAddMore = used < MAX_ATTRIBUTES;
  const usagePct = Math.min(100, (used / MAX_ATTRIBUTES) * 100);

  const openAddDialog = (prefill?: { name: string; action: string }) => {
    setEditing(null);
    setForm({
      name: prefill?.name ?? '',
      action_name: prefill?.action ?? '',
      is_active: true,
    });
    setActionTouched(!!prefill?.action);
    setDialogOpen(true);
  };

  const openEditDialog = (attr: UserAttribute) => {
    setEditing(attr);
    setForm({
      name: attr.name,
      action_name: attr.action_name ?? '',
      is_active: attr.is_active,
    });
    setActionTouched(true);
    setDialogOpen(true);
  };

  const handleNameChange = (raw: string) => {
    const name = normalizeName(raw);
    setForm((f) => ({
      ...f,
      name,
      action_name: actionTouched ? f.action_name : toActionName(name),
    }));
  };

  const nameError = useMemo(() => {
    const name = form.name.trim();
    if (!name) return '';
    if (name.length < 2) return 'Name is too short';
    const exists = attributes.some(
      (a) => a.name.toLowerCase() === name.toLowerCase() && a.id !== editing?.id
    );
    if (exists) return 'Attribute with this name already exists';
    if (DEFAULT_ATTRIBUTES.map((d) => d.toLowerCase()).includes(`$${name.toLowerCase()}`))
      return 'This is a reserved default attribute';
    return '';
  }, [form.name, attributes, editing]);

  const canSubmit = !!form.name.trim() && !nameError && (editing || canAddMore);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        updates: {
          name: form.name.trim(),
          action_name: form.action_name.trim() || null,
          is_active: form.is_active,
        },
      });
      toast.success('Attribute updated');
    } else {
      await createMutation.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const toggleActive = (attr: UserAttribute, value: boolean) => {
    updateMutation.mutate({ id: attr.id, updates: { is_active: value } });
  };

  const copyVariable = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    toast.success(`Copied {{${name}}}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 p-3 sm:p-0 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Tag className="w-6 h-6 text-primary" />
              User Attributes
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Capture custom data points from your contacts. Use them inside flows, AI prompts and templates as{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">{'{{Name}}'}</code>.
            </p>
          </div>
          <Button
            onClick={() => openAddDialog()}
            disabled={!canAddMore}
            className="gap-2 shadow-sm"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </Button>
        </div>

        {/* Usage / Upgrade */}
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    {used} of {MAX_ATTRIBUTES} attributes used
                  </span>
                  {!canAddMore && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Limit reached
                    </Badge>
                  )}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      usagePct >= 100 ? 'bg-amber-500' : 'bg-primary'
                    )}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 sm:border-l sm:pl-4">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-medium text-foreground">Need more?</p>
                  <p className="text-muted-foreground">Unlock 20 attributes with Pro</p>
                </div>
                <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Rocket className="w-3.5 h-3.5" />
                  Upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search attributes…"
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attribute List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filteredAttributes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No matching attributes'
                    : 'No custom attributes yet'}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter.'
                    : 'Create attributes like Company, Email or City to enrich your contacts.'}
                </p>
              </div>
              {!searchQuery && statusFilter === 'all' && (
                <>
                  <Button onClick={() => openAddDialog()} className="gap-1.5 mt-1">
                    <Plus className="w-4 h-4" /> Add your first attribute
                  </Button>
                  <div className="flex flex-wrap gap-2 justify-center pt-3">
                    {SUGGESTIONS.slice(0, 4).map((s) => (
                      <button
                        key={s.name}
                        onClick={() => openAddDialog(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary hover:text-primary transition-colors"
                      >
                        + {s.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2 sm:gap-3">
            {filteredAttributes.map((attr) => (
              <Card
                key={attr.id}
                className={cn(
                  'group transition-all hover:shadow-md hover:border-primary/40',
                  !attr.is_active && 'opacity-70'
                )}
              >
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm',
                      attr.is_active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {attr.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">{attr.name}</span>
                      <button
                        onClick={() => copyVariable(attr.name)}
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1"
                        title="Copy variable"
                      >
                        {`{{${attr.name}}}`}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    {attr.action_name && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Action: <span className="font-mono">{attr.action_name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                      <Switch
                        checked={attr.is_active}
                        onCheckedChange={(v) => toggleActive(attr, v)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(attr)}
                      className="h-9 w-9"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(attr)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
                <div className="sm:hidden border-t px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {attr.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={attr.is_active}
                    onCheckedChange={(v) => toggleActive(attr, v)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Default attributes pill list */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              System Defaults
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_ATTRIBUTES.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${d.replace('$', '')}}}`);
                    toast.success(`Copied {{${d.replace('$', '')}}}`);
                  }}
                  className="text-xs font-mono px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing ? (
                <>
                  <Pencil className="w-4 h-4 text-primary" /> Edit attribute
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-primary" /> New attribute
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the name, action or status of this attribute.'
                : 'Define a custom field to capture extra data from your contacts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="attr-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attr-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Company"
                autoFocus
                className={cn(nameError && 'border-destructive')}
              />
              {nameError ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" /> {nameError}
                </p>
              ) : form.name ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Use as{' '}
                  <code className="font-mono">{`{{${form.name}}}`}</code>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Letters, numbers and spaces only.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attr-action">Action name (optional)</Label>
              <Input
                id="attr-action"
                value={form.action_name}
                onChange={(e) => {
                  setActionTouched(true);
                  setForm((f) => ({ ...f, action_name: e.target.value }));
                }}
                placeholder="e.g. set_company"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Used by Dialogflow / automations to set this value.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive attributes are hidden from contacts and flows.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>

            {!editing && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setForm({ name: s.name, action_name: s.action, is_active: true });
                        setActionTouched(true);
                      }}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}
              className="gap-1.5"
            >
              {editing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editing ? 'Save changes' : 'Create attribute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> and its
              values from all contacts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
