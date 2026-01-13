import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Plus, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';
import { useTemplates, INDUSTRY_TEMPLATES, IndustryType, Template, IndustryTemplate } from '@/hooks/useTemplates';
import { IndustrySelector } from '@/components/templates/IndustrySelector';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreviewDrawer } from '@/components/templates/TemplatePreviewDrawer';
import { CreateTemplateModal } from '@/components/templates/CreateTemplateModal';
import { TemplateFilters } from '@/components/templates/TemplateFilters';
import { EmptyTemplatesState } from '@/components/templates/EmptyTemplatesState';
import { toast } from 'sonner';

export default function Templates() {
  const { templates, loading, syncing, filters, setFilters, syncFromMeta, createTemplate } = useTemplates();
  
  const [activeTab, setActiveTab] = useState<'my-templates' | 'industry'>('my-templates');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | IndustryTemplate | null>(null);
  const [isIndustryPreview, setIsIndustryPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cloneData, setCloneData] = useState<any>(null);

  // Filter industry templates
  const filteredIndustryTemplates = INDUSTRY_TEMPLATES.filter((t) => {
    if (selectedIndustry !== 'all' && t.industry !== selectedIndustry) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handlePreview = (template: Template | IndustryTemplate, isIndustry: boolean) => {
    setPreviewTemplate(template);
    setIsIndustryPreview(isIndustry);
  };

  const handleUseTemplate = (template: Template | IndustryTemplate, isIndustry: boolean) => {
    if (isIndustry) {
      const t = template as IndustryTemplate;
      setCloneData({
        name: t.name.toLowerCase().replace(/\s+/g, '_'),
        category: t.category,
        industry: t.industry,
        body: t.body,
        language: t.language,
      });
      setShowCreateModal(true);
    } else {
      toast.success('Template ready to use in Inbox');
    }
    setPreviewTemplate(null);
  };

  const handleClone = () => {
    if (previewTemplate && isIndustryPreview) {
      const t = previewTemplate as IndustryTemplate;
      setCloneData({
        name: t.name.toLowerCase().replace(/\s+/g, '_'),
        category: t.category,
        industry: t.industry,
        body: t.body,
        language: t.language,
      });
      setShowCreateModal(true);
      setPreviewTemplate(null);
    }
  };

  const handleCreateSubmit = async (data: any) => {
    await createTemplate(data);
    setCloneData(null);
  };

  const resetFilters = () => {
    setFilters({ search: '', industry: 'all', category: 'all', status: 'all', language: '' });
    setSelectedIndustry('all');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">
              All outbound messages use WhatsApp-approved templates.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={syncFromMeta} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync from Meta
            </Button>
            <Button onClick={() => { setCloneData(null); setShowCreateModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </div>

        {/* Compliance Info */}
        <Alert className="border-primary/20 bg-primary/5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            SMEKSH only allows WhatsApp-approved templates for outbound messaging. All templates follow Meta and WhatsApp Business policies.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="my-templates">My Templates ({templates.length})</TabsTrigger>
            <TabsTrigger value="industry">
              <BookOpen className="h-4 w-4 mr-1" />
              Industry Library
            </TabsTrigger>
          </TabsList>

          {/* My Templates */}
          <TabsContent value="my-templates" className="space-y-4 mt-4">
            <TemplateFilters
              search={filters.search}
              onSearchChange={(v) => setFilters({ ...filters, search: v })}
              industry={filters.industry}
              onIndustryChange={(v) => setFilters({ ...filters, industry: v })}
              category={filters.category}
              onCategoryChange={(v) => setFilters({ ...filters, category: v })}
              status={filters.status}
              onStatusChange={(v) => setFilters({ ...filters, status: v })}
              language={filters.language}
              onLanguageChange={(v) => setFilters({ ...filters, language: v })}
              onReset={resetFilters}
            />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <EmptyTemplatesState
                onCreateNew={() => setShowCreateModal(true)}
                onBrowseIndustry={() => setActiveTab('industry')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={() => handlePreview(template, false)}
                    onUse={() => handleUseTemplate(template, false)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Industry Library */}
          <TabsContent value="industry" className="space-y-6 mt-4">
            <IndustrySelector selected={selectedIndustry} onSelect={setSelectedIndustry} />

            <TemplateFilters
              search={filters.search}
              onSearchChange={(v) => setFilters({ ...filters, search: v })}
              industry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
              category={filters.category}
              onCategoryChange={(v) => setFilters({ ...filters, category: v })}
              status="all"
              onStatusChange={() => {}}
              language={filters.language}
              onLanguageChange={(v) => setFilters({ ...filters, language: v })}
              onReset={resetFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIndustryTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isIndustryTemplate
                  onPreview={() => handlePreview(template, true)}
                  onUse={() => handleUseTemplate(template, true)}
                />
              ))}
            </div>

            {filteredIndustryTemplates.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No templates found matching your filters.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Drawer */}
      <TemplatePreviewDrawer
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        isIndustryTemplate={isIndustryPreview}
        onUse={() => previewTemplate && handleUseTemplate(previewTemplate, isIndustryPreview)}
        onClone={handleClone}
      />

      {/* Create Modal */}
      <CreateTemplateModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCloneData(null); }}
        onSubmit={handleCreateSubmit}
        initialData={cloneData}
      />
    </DashboardLayout>
  );
}
