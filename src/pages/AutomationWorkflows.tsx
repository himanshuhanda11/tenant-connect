import { useState } from 'react';
import { 
  Zap, 
  Plus, 
  PauseCircle, 
  LayoutGrid,
  PlayCircle,
  Search,
  BarChart3,
  Settings,
  Loader2,
  Sparkles,
  Filter,
  MessageSquare,
  Tag,
  User,
  Clock,
  Webhook,
  Shield,
  TrendingUp,
  Activity,
  Target,
  RefreshCcw
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuideBanner } from '@/components/help/GuideBanner';
import { WorkflowCard } from '@/components/automation/WorkflowCard';
import { StarterAutomationCard } from '@/components/automation/StarterAutomationCard';
import { WorkflowBuilder } from '@/components/automation/WorkflowBuilder';
import { WorkflowTestModal } from '@/components/automation/WorkflowTestModal';
import { useAutomationWorkflows } from '@/hooks/useAutomationWorkflows';
import { Workflow, WorkflowWithRelations, StarterAutomation, TRIGGER_DEFINITIONS, CONDITION_DEFINITIONS, ACTION_DEFINITIONS } from '@/types/automation';
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

export default function AutomationWorkflows() {
  const {
    workflows,
    loading,
    starterAutomations,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    duplicateWorkflow,
    installStarterAutomation,
    pauseAllWorkflows,
  } = useAutomationWorkflows();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testWorkflow, setTestWorkflow] = useState<Workflow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [installingStarter, setInstallingStarter] = useState<string | null>(null);

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = workflows.filter(w => w.status === 'active').length;
  const pausedCount = workflows.filter(w => w.status === 'paused').length;
  const draftCount = workflows.filter(w => w.status === 'draft').length;

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setBuilderOpen(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setBuilderOpen(true);
  };

  const handleTestWorkflow = (workflow: Workflow) => {
    setTestWorkflow(workflow);
    setTestModalOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setWorkflowToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteWorkflow = async () => {
    if (workflowToDelete) {
      await deleteWorkflow(workflowToDelete);
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    }
  };

  const handleInstallStarter = async (starter: StarterAutomation) => {
    setInstallingStarter(starter.id);
    await installStarterAutomation(starter);
    setInstallingStarter(null);
  };

  const handleSaveWorkflow = async (workflowData: Partial<Workflow>): Promise<boolean> => {
    if (selectedWorkflow?.id) {
      return updateWorkflow(selectedWorkflow.id, workflowData);
    } else {
      const result = await createWorkflow(workflowData);
      return result !== null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Automation Workflows
            </h1>
            <p className="text-sm text-muted-foreground">
              Automate repetitive tasks with powerful When → If → Then workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={pauseAllWorkflows} className="text-xs sm:text-sm">
              <PauseCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              <span className="hidden xs:inline">Pause </span>All
            </Button>
            <Button size="sm" onClick={handleCreateWorkflow} className="text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              Create<span className="hidden xs:inline"> Workflow</span>
            </Button>
          </div>
        </div>

        {/* Guide Banner */}
        <GuideBanner
          title="Build Powerful Automations"
          description="Create workflows with triggers, conditions, and actions. Support for delays, round-robin assignment, webhooks, and more."
          guideUrl="/help/automation"
          dismissible
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <PlayCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <PauseCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pausedCount}</p>
                  <p className="text-sm text-muted-foreground">Paused</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(TRIGGER_DEFINITIONS).length}</p>
                  <p className="text-sm text-muted-foreground">Triggers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflows">
              <Zap className="h-4 w-4 mr-2" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="starters">
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="features">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'paused' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('paused')}
                >
                  Paused
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                >
                  Draft
                </Button>
              </div>
            </div>

            {/* Workflow List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No workflows yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first workflow or install a starter automation
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={handleCreateWorkflow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onEdit={handleEditWorkflow}
                    onToggleStatus={toggleWorkflowStatus}
                    onDuplicate={duplicateWorkflow}
                    onDelete={handleDeleteConfirm}
                    onTest={handleTestWorkflow}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="starters" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Starter Automations</h2>
              <p className="text-muted-foreground mb-4">
                One-click install these pre-built automations to get started quickly
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {starterAutomations.map(starter => (
                  <StarterAutomationCard
                    key={starter.id}
                    automation={starter}
                    onInstall={handleInstallStarter}
                    installing={installingStarter === starter.id}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Available Triggers (WHEN)
                </CardTitle>
                <CardDescription>Start your workflow based on these events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(TRIGGER_DEFINITIONS).map(([type, def]) => (
                    <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Zap className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{def.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-amber-500" />
                  Available Conditions (IF)
                </CardTitle>
                <CardDescription>Filter when actions should execute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(CONDITION_DEFINITIONS).map(([type, def]) => (
                    <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Filter className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm truncate">{def.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  Available Actions (THEN)
                </CardTitle>
                <CardDescription>What happens when conditions are met</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(ACTION_DEFINITIONS).map(([type, def]) => (
                    <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <MessageSquare className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm truncate">{def.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Safety & Guardrails
                </CardTitle>
                <CardDescription>Built-in protections to prevent spam and errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Rate Limiting</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Limit messages per hour/day per contact</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCcw className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Cooldowns</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Prevent duplicate runs for same contact</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Opt-in Enforcement</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Only message opted-in contacts</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Stop on Reply</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cancel pending actions when customer responds</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Round Robin</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Fair agent assignment across team</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Webhook className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Webhook Actions</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Integrate with external systems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Analytics</CardTitle>
                <CardDescription>
                  Track performance and outcomes of your automations
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">Analytics coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  View runs, success rates, and conversion metrics
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Workflow Builder */}
      <WorkflowBuilder
        workflow={selectedWorkflow}
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveWorkflow}
      />

      {/* Test Modal */}
      <WorkflowTestModal
        workflow={testWorkflow}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and stop all associated automations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkflow} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
