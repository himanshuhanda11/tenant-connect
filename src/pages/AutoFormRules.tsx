import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { Button } from '@/components/ui/button';
import { ViewFormRuleDialog } from '@/components/automation/ViewFormRuleDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  FileText,
  Zap,
  MessageSquare,
  Facebook,
  QrCode,
  Globe,
  Tag,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useFormRules } from '@/hooks/useFormRules';
import { CreateFormRuleModal } from '@/components/automation/CreateFormRuleModal';
import { FORM_RULE_TRIGGER_OPTIONS } from '@/types/formRule';
import type { FormRule } from '@/types/formRule';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { usePlanGate } from '@/hooks/usePlanGate';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { UpgradePlanDialog } from '@/components/billing/UpgradePlanDialog';

const triggerIconMap: Record<string, React.ElementType> = {
  first_message: MessageSquare,
  keyword: Search,
  ad_click: Facebook,
  qr_scan: QrCode,
  source: Globe,
  tag_added: Tag,
  scheduled: Clock,
};

const triggerColorMap: Record<string, string> = {
  first_message: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  keyword: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ad_click: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  qr_scan: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  source: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  tag_added: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  scheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function AutoFormRules() {
  const { rules, loading, toggleRule, deleteRule, duplicateRule, createRule, updateRule, fetchRules } = useFormRules();
  const { hasFeature, currentPlan, requiredPlanFor } = usePlanGate();
  const autoformsLocked = !hasFeature('autoforms');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FormRule | null>(null);
  const [viewingRule, setViewingRule] = useState<FormRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<FormRule | null>(null);

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTrigger = !filterTrigger || rule.trigger_type === filterTrigger;
    return matchesSearch && matchesTrigger;
  });

  const activeRules = rules.filter(r => r.is_active).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.execution_count, 0);

  const handleDelete = async () => {
    if (ruleToDelete) {
      await deleteRule(ruleToDelete.id);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const getTriggerInfo = (triggerType: string) => {
    return FORM_RULE_TRIGGER_OPTIONS.find(t => t.value === triggerType);
  };

  return (
    <DashboardLayout>
      <QuickGuide {...quickGuides.formRules} className="mb-4" />
      {autoformsLocked && (
        <UpgradePrompt
          currentPlan={currentPlan}
          requiredPlan={requiredPlanFor('autoforms') || 'basic'}
          feature="AutoForms"
          description="Automate form responses and lead capture. Upgrade to unlock AutoForms."
          onUpgrade={() => setUpgradeOpen(true)}
          className="mb-6"
        />
      )}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 sm:px-6 py-4 sm:py-6 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Auto-Form Rules</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Workspace-level automation for form delivery
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="sm:size-default">
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden xs:inline">Create Rule</span>
              <span className="xs:hidden">New</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">{rules.length}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">{activeRules}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">{totalExecutions}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Executions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 sm:px-6 py-3 border-b bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 shrink-0">
                  <Filter className="h-4 w-4 mr-1.5" />
                  {filterTrigger ? getTriggerInfo(filterTrigger)?.label : 'All Triggers'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterTrigger(null)}>
                  All Triggers
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {FORM_RULE_TRIGGER_OPTIONS.map(option => {
                  const Icon = triggerIconMap[option.value];
                  return (
                    <DropdownMenuItem key={option.value} onClick={() => setFilterTrigger(option.value)}>
                      <Icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Rules List */}
        <ScrollArea className="flex-1">
          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredRules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No Form Rules Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    Create your first auto-form rule to automatically send WhatsApp forms based on triggers like keywords, ad clicks, or QR scans.
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRules.map(rule => {
                  const TriggerIcon = triggerIconMap[rule.trigger_type] || Zap;
                  const triggerInfo = getTriggerInfo(rule.trigger_type);
                  
                  return (
                    <Card key={rule.id} className={cn(
                      "transition-all hover:shadow-md",
                      !rule.is_active && "opacity-60"
                    )}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          {/* Trigger Icon */}
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
                            triggerColorMap[rule.trigger_type]
                          )}>
                            <TriggerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{rule.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {rule.description || triggerInfo?.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                <Switch
                                  checked={rule.is_active}
                                  onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                                />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewingRule(rule)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => duplicateRule(rule.id)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => { setRuleToDelete(rule); setDeleteDialogOpen(true); }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Badges & Stats */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                <TriggerIcon className="w-3 h-3 mr-1" />
                                {triggerInfo?.label}
                              </Badge>
                              
                              {rule.form && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {rule.form.name}
                                </Badge>
                              )}
                              
                              {rule.conditions && rule.conditions.length > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                  {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                                </Badge>
                              )}

                              <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {rule.execution_count} runs
                                </span>
                                {rule.last_executed_at && (
                                  <span className="hidden sm:flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true })}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Guardrails */}
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                              {rule.require_opt_in && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  Opt-in required
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {rule.cooldown_minutes}m cooldown
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Max {rule.max_sends_per_contact_per_day}/day
                              </span>
                            </div>
                          </div>
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

      {/* Create/Edit Modal */}
      <CreateFormRuleModal
        open={createModalOpen || !!editingRule}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false);
            setEditingRule(null);
          }
        }}
        editingRule={editingRule}
        createRule={createRule}
        updateRule={updateRule}
        onSaved={fetchRules}
      />

      {/* View Dialog */}
      <ViewFormRuleDialog
        open={!!viewingRule}
        onOpenChange={(open) => { if (!open) setViewingRule(null); }}
        rule={viewingRule}
        onEdit={(rule) => setEditingRule(rule)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ruleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlanId={currentPlan} />
    </DashboardLayout>
  );
}
