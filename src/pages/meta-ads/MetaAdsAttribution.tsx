import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  GitBranch, Plus, GripVertical, Pencil, Trash2, ArrowRight, Clock, Tag,
  TrendingUp, Shield, Info, ChevronRight, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AttributionRule {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  priority: number;
  source_type: string;
  attribution_window: string;
  match_conditions: Record<string, unknown> | null;
  set_source: string | null;
  set_campaign_source: string | null;
  set_tags: string[] | null;
  set_priority: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  meta_ads: TrendingUp,
  qr: Tag,
  website: Shield,
  api: GitBranch,
};

const WINDOW_LABELS: Record<string, string> = {
  '1_day': '1 Day',
  '7_days': '7 Days',
  '28_days': '28 Days',
};

const EMPTY_FORM = {
  name: '',
  source_type: 'meta_ads',
  attribution_window: '7_days',
  set_source: '',
  set_tags_input: '',
  description: '',
};

export default function MetaAdsAttribution() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AttributionRule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Fetch rules
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['attribution-rules', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_attribution_rules')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data || []) as AttributionRule[];
    },
    enabled: !!currentTenant?.id,
  });

  // Open edit dialog
  const openEdit = (rule: AttributionRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      source_type: rule.source_type,
      attribution_window: rule.attribution_window,
      set_source: rule.set_source || '',
      set_tags_input: (rule.set_tags || []).join(', '),
      description: rule.description || '',
    });
    setShowDialog(true);
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error('No workspace');
      const tags = form.set_tags_input
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const attribution_window = form.attribution_window as '1_day' | '7_days' | '28_days';
      const payload = {
        workspace_id: currentTenant.id,
        name: form.name,
        source_type: form.source_type,
        attribution_window,
        set_source: form.set_source || null,
        set_tags: tags.length > 0 ? tags : null,
        description: form.description || null,
        priority: editingRule ? editingRule.priority : (rules.length + 1),
      };
      if (editingRule) {
        const { error } = await supabase
          .from('smeksh_meta_attribution_rules')
          .update(payload)
          .eq('id', editingRule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smeksh_meta_attribution_rules')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribution-rules'] });
      setShowDialog(false);
      toast.success(editingRule ? 'Rule updated' : 'Rule created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('smeksh_meta_attribution_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribution-rules'] });
      toast.success('Rule updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('smeksh_meta_attribution_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribution-rules'] });
      toast.success('Rule deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const activeRules = rules.filter(r => r.is_active).sort((a, b) => a.priority - b.priority);
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <QuickGuide {...quickGuides.metaAds} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <GitBranch className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Attribution Rules</h1>
              <p className="text-sm text-muted-foreground">Configure how leads are attributed to sources</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Explanation */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 border-0 shadow-md">
          <CardContent className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm sm:text-base text-blue-800 dark:text-blue-200">How Attribution Works</p>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                When a new contact messages you, AIREATRO checks attribution rules in priority order.
                The first matching rule determines the contact's source and applies tags automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Priority Order */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Attribution Priority
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Higher priority rules are checked first.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {activeRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active rules. Create one to get started.</p>
            ) : (
              <div className="flex items-center justify-start sm:justify-center gap-2 flex-wrap overflow-x-auto">
                {activeRules.map((rule, idx, arr) => {
                  const Icon = SOURCE_ICONS[rule.source_type] || GitBranch;
                  return (
                    <div key={rule.id} className="flex items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-muted border">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{rule.name}</span>
                      </div>
                      {idx < arr.length - 1 && <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">All Rules ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sortedRules.length === 0 ? (
              <div className="text-center py-12 px-4">
                <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No attribution rules yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first rule to start attributing leads automatically.</p>
                <Button onClick={openCreate} className="mt-4 gap-2" size="sm">
                  <Plus className="h-4 w-4" /> Create Rule
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Source Type</TableHead>
                        <TableHead>Attribution Window</TableHead>
                        <TableHead>Applied Tags</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRules.map((rule) => {
                        const Icon = SOURCE_ICONS[rule.source_type] || GitBranch;
                        return (
                          <TableRow key={rule.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                                <GripVertical className="h-4 w-4" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{rule.name}</p>
                                  <p className="text-xs text-muted-foreground">Priority #{rule.priority}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {rule.source_type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{WINDOW_LABELS[rule.attribution_window] || rule.attribution_window}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(rule.set_tags || []).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                                {(!rule.set_tags || rule.set_tags.length === 0) && (
                                  <span className="text-xs text-muted-foreground">None</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule.is_active}
                                onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked })}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-3">
                  {sortedRules.map((rule) => {
                    const Icon = SOURCE_ICONS[rule.source_type] || GitBranch;
                    return (
                      <div key={rule.id} className="p-3 border rounded-lg bg-card space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">Priority #{rule.priority}</p>
                            </div>
                          </div>
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked })}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline" className="capitalize">{rule.source_type.replace('_', ' ')}</Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {WINDOW_LABELS[rule.attribution_window] || rule.attribution_window}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(rule.set_tags || []).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(rule)}>
                            <Pencil className="h-3 w-3 mr-1.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attribution Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Attribution Preview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">See how a sample lead would be attributed based on your active rules</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {activeRules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active rules. Create a rule to see attribution preview.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 p-3 sm:p-4 rounded-xl bg-muted/50 border">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Incoming Lead</p>
                  <p className="font-medium text-sm sm:text-base">New Contact</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Source matches: <Badge variant="outline" className="text-[10px] capitalize">{activeRules[0].source_type.replace('_', ' ')}</Badge>
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-primary rotate-90 sm:rotate-0 mx-auto" />
                <div className="flex-1 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Attribution Result (Rule: {activeRules[0].name})</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Source:</span>
                      <Badge className="text-xs">{activeRules[0].set_source || activeRules[0].source_type.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Tags:</span>
                      {(activeRules[0].set_tags && activeRules[0].set_tags.length > 0) ? (
                        activeRules[0].set_tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No tags configured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Window:</span>
                      <span className="text-xs sm:text-sm font-medium">{WINDOW_LABELS[activeRules[0].attribution_window] || activeRules[0].attribution_window}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editingRule ? 'Edit' : 'Create'} Attribution Rule</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Define how leads from this source should be attributed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Rule Name *</Label>
              <Input
                placeholder="e.g., Meta Ads Attribution"
                className="h-10"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Input
                placeholder="Optional description"
                className="h-10"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Source Type</Label>
                <Select value={form.source_type} onValueChange={v => setForm({ ...form, source_type: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Attribution Window</Label>
                <Select value={form.attribution_window} onValueChange={v => setForm({ ...form, attribution_window: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day">1 Day</SelectItem>
                    <SelectItem value="7_days">7 Days</SelectItem>
                    <SelectItem value="28_days">28 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Set Source Label</Label>
              <Input
                placeholder="e.g., Meta Ads"
                className="h-10"
                value={form.set_source}
                onChange={e => setForm({ ...form, set_source: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Apply Tags (comma separated)</Label>
              <Input
                placeholder="e.g., Meta Lead, Paid"
                className="h-10"
                value={form.set_tags_input}
                onChange={e => setForm({ ...form, set_tags_input: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name.trim() || saveMutation.isPending}
              className="w-full sm:w-auto gap-2"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
