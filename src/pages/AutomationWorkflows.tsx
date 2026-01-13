import { useState } from 'react';
import { 
  Zap, 
  Plus, 
  PauseCircle, 
  LayoutGrid,
  PlayCircle,
  Search,
  Filter,
  BarChart3,
  Settings,
  Loader2,
  Sparkles
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
import { Workflow, StarterAutomation } from '@/types/automation';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Automation Workflows
            </h1>
            <p className="text-muted-foreground">
              Automate repetitive tasks and create smart messaging workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={pauseAllWorkflows}>
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause All
            </Button>
            <Button variant="outline">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Templates Gallery
            </Button>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Guide Banner */}
        <GuideBanner
          title="Getting Started with Automation"
          description="Learn how to create triggers and actions that automatically respond to customers, apply tags, and assign conversations."
          guideUrl="/help/automation"
          dismissible
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
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
        </div>

        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflows">
              <Zap className="h-4 w-4 mr-2" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="starters">
              <Sparkles className="h-4 w-4 mr-2" />
              Starter Automations
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
