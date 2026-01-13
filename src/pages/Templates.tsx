import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Plus, BookOpen, ShieldCheck, Loader2, Settings2 } from 'lucide-react';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { TemplatesListView } from '@/components/templates/TemplatesListView';
import { TemplateBuilder, TemplateBuilderData } from '@/components/templates/TemplateBuilder';
import { IndustryPacks } from '@/components/templates/IndustryPacks';
import { InternalReviewModal } from '@/components/templates/InternalReviewModal';
import { GuideBanner } from '@/components/help/GuideBanner';
import { Template as TemplateType, TemplateVersion, InternalStatus, MetaStatus, TemplateCategory, HeaderType } from '@/types/template';
import { toast } from 'sonner';
import { lintTemplate } from '@/lib/templateLinter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TemplateFilters {
  search: string;
  category: TemplateCategory | '';
  internal_status: InternalStatus | '';
  meta_status: string;
  language: string;
}

export default function Templates() {
  const {
    templates,
    loading,
    lintResults,
    fetchTemplates,
    createTemplate,
    updateVersion,
    duplicateTemplate,
    archiveTemplate,
    deleteTemplate,
    requestReview,
    approveTemplate,
    requestChanges,
    submitToMeta,
    validateTemplate,
  } = useTemplateBuilder();

  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'industry'>('list');
  const [editingTemplate, setEditingTemplate] = useState<TemplateType | null>(null);
  const [editingVersion, setEditingVersion] = useState<TemplateVersion | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);
  const [reviewModalTemplate, setReviewModalTemplate] = useState<TemplateType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentLintResults, setCurrentLintResults] = useState<any[]>([]);
  
  // Local filters state
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    category: '',
    internal_status: '',
    meta_status: '',
    language: '',
  });

  // Fetch templates on mount and when filters change
  useEffect(() => {
    fetchTemplates(filters);
  }, [fetchTemplates, filters]);

  // Template list handlers
  const handleView = (template: TemplateType) => {
    setPreviewTemplate(template);
  };

  const handleEdit = (template: TemplateType) => {
    setEditingTemplate(template);
    setEditingVersion(template.current_version || null);
    setIsCreating(false);
    setActiveTab('builder');
  };

  const handleSubmitToMeta = async (template: TemplateType) => {
    if (!template.current_version_id) {
      toast.error('No version to submit');
      return;
    }
    await submitToMeta(template.id);
  };

  const handleDuplicate = async (template: TemplateType) => {
    await duplicateTemplate(template.id);
  };

  const handleArchive = async (template: TemplateType) => {
    await archiveTemplate(template.id);
  };

  const handleDelete = async (template: TemplateType) => {
    await deleteTemplate(template.id);
  };

  const handleRequestReview = (template: TemplateType) => {
    setReviewModalTemplate(template);
  };

  const handleApprove = (template: TemplateType) => {
    setReviewModalTemplate(template);
  };

  // Builder handlers
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setEditingVersion(null);
    setIsCreating(true);
    setActiveTab('builder');
  };

  const handleBuilderValidate = (version: Partial<TemplateVersion>) => {
    const results = validateTemplate({}, version);
    setCurrentLintResults(results);
  };

  const handleBuilderSave = async (data: TemplateBuilderData) => {
    if (editingTemplate) {
      // Update existing template version
      await updateVersion(editingTemplate.id, {
        header_type: data.header_type,
        header_content: data.header_content,
        body: data.body,
        footer: data.footer,
        buttons: data.buttons,
        variable_samples: data.variable_samples,
      });
    } else {
      // Create new template
      await createTemplate({
        name: data.name,
        category: data.category,
        language: data.language,
        header_type: data.header_type,
        header_content: data.header_content,
        body: data.body,
        footer: data.footer,
        buttons: data.buttons,
        variable_samples: data.variable_samples,
      });
    }
    setEditingTemplate(null);
    setEditingVersion(null);
    setIsCreating(false);
    setActiveTab('list');
    fetchTemplates(filters);
  };

  const handleBuilderCancel = () => {
    setEditingTemplate(null);
    setEditingVersion(null);
    setIsCreating(false);
    setActiveTab('list');
  };

  // Industry pack handler
  const handleUseIndustryTemplate = async (templateData: {
    name: string;
    category: TemplateCategory;
    language: string;
    header_type: string;
    header_content?: string;
    body: string;
    footer?: string;
    buttons?: any[];
  }) => {
    await createTemplate({
      name: templateData.name.toLowerCase().replace(/\s+/g, '_'),
      category: templateData.category,
      language: templateData.language,
      header_type: templateData.header_type as HeaderType,
      header_content: templateData.header_content,
      body: templateData.body,
      footer: templateData.footer,
      buttons: templateData.buttons,
      variable_samples: {},
    });
    fetchTemplates(filters);
    setActiveTab('list');
  };

  // Review modal handlers
  const handleReviewSubmit = async (action: 'request' | 'approve' | 'changes', comments?: string) => {
    if (!reviewModalTemplate || !reviewModalTemplate.current_version_id) return;

    if (action === 'request') {
      await requestReview(reviewModalTemplate.id);
    } else if (action === 'approve') {
      await approveTemplate(reviewModalTemplate.id, comments);
    } else if (action === 'changes') {
      await requestChanges(reviewModalTemplate.id, comments || '');
    }
    setReviewModalTemplate(null);
    fetchTemplates(filters);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">
              Create, manage, and submit WhatsApp templates for approval.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchTemplates(filters)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Compliance Info */}
        <Alert className="border-primary/20 bg-primary/5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Templates require internal approval before submission to Meta. Only Meta-approved templates can be used for outbound messaging.
          </AlertDescription>
        </Alert>

        {/* Guide Banner */}
        {templates.length === 0 && !loading && (
          <GuideBanner
            title="New to WhatsApp Templates?"
            description="Learn how to create, submit, and get your templates approved by Meta for outbound messaging."
            guideUrl="/help/templates"
            dismissible
          />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="list">
              <Settings2 className="h-4 w-4 mr-1" />
              My Templates ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="builder" disabled={!isCreating && !editingTemplate}>
              <Plus className="h-4 w-4 mr-1" />
              {editingTemplate ? 'Edit Template' : 'Template Builder'}
            </TabsTrigger>
            <TabsTrigger value="industry">
              <BookOpen className="h-4 w-4 mr-1" />
              Industry Packs
            </TabsTrigger>
          </TabsList>

          {/* Templates List */}
          <TabsContent value="list" className="mt-4">
            <TemplatesListView
              templates={templates}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onSubmitToMeta={handleSubmitToMeta}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              filters={filters}
              onFiltersChange={setFilters}
              onCreateNew={handleCreateNew}
              onRefresh={() => fetchTemplates(filters)}
            />
          </TabsContent>

          {/* Template Builder */}
          <TabsContent value="builder" className="mt-4">
            <TemplateBuilder
              initialData={editingTemplate ? {
                name: editingTemplate.name,
                category: editingTemplate.category,
                language: editingTemplate.language,
                ...editingVersion
              } : undefined}
              lintResults={currentLintResults}
              onValidate={handleBuilderValidate}
              onSave={handleBuilderSave}
              mode={editingTemplate ? 'edit' : 'create'}
            />
            <div className="flex justify-start mt-4">
              <Button variant="outline" onClick={handleBuilderCancel}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          {/* Industry Packs */}
          <TabsContent value="industry" className="mt-4">
            <IndustryPacks onUseTemplate={handleUseIndustryTemplate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>{' '}
                  <span className="font-medium">{previewTemplate.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Language:</span>{' '}
                  <span className="font-medium">{previewTemplate.language}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Internal Status:</span>{' '}
                  <span className="font-medium">{previewTemplate.internal_status}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Meta Status:</span>{' '}
                  <span className="font-medium">{previewTemplate.status}</span>
                </div>
              </div>

              {previewTemplate.current_version && (
                <div className="space-y-2">
                  <h4 className="font-medium">Content</h4>
                  {previewTemplate.current_version.header_content && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Header:</span>
                      <p>{previewTemplate.current_version.header_content}</p>
                    </div>
                  )}
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-xs text-muted-foreground">Body:</span>
                    <p className="whitespace-pre-wrap">{previewTemplate.current_version.body}</p>
                  </div>
                  {previewTemplate.current_version.footer && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Footer:</span>
                      <p className="text-sm text-muted-foreground">{previewTemplate.current_version.footer}</p>
                    </div>
                  )}
                </div>
              )}

              {previewTemplate.rejection_reason && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Rejection Reason:</strong> {previewTemplate.rejection_reason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setPreviewTemplate(null);
                  handleEdit(previewTemplate);
                }}>
                  Edit Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Internal Review Modal */}
      {reviewModalTemplate && (
        <InternalReviewModal
          open={!!reviewModalTemplate}
          onOpenChange={(open) => !open && setReviewModalTemplate(null)}
          mode={reviewModalTemplate.internal_status === 'draft' || reviewModalTemplate.internal_status === 'changes_requested' ? 'request' : 'review'}
          templateName={reviewModalTemplate.name}
          internalStatus={reviewModalTemplate.internal_status}
          lintResults={currentLintResults}
          approvalHistory={reviewModalTemplate.approvals || []}
          onRequestReview={async () => { await handleReviewSubmit('request'); return true; }}
          onApprove={async (comments) => { await handleReviewSubmit('approve', comments); return true; }}
          onRequestChanges={async (comments) => { await handleReviewSubmit('changes', comments); return true; }}
        />
      )}
    </DashboardLayout>
  );
}
