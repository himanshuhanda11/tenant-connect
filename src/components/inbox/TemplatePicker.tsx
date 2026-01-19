import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components_json: any;
}

type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED' | 'PAUSED';
type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';

interface TemplateVariable {
  componentType: 'header' | 'body' | 'button';
  index: number;
  placeholder: string;
}

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSend: (templateName: string, language: string, components: any[]) => Promise<void>;
  contactName?: string;
  contactWaId?: string;
}

export function TemplatePicker({
  open,
  onClose,
  onSend,
  contactName,
  contactWaId,
}: TemplatePickerProps) {
  const { currentTenant } = useTenant();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!currentTenant) return;

    setLoading(true);
    try {
      let query = supabase
        .from('templates')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as TemplateStatus);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as TemplateCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTemplates((data || []) as Template[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [currentTenant, statusFilter, categoryFilter]);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setSelectedTemplate(null);
      setVariableValues({});
    }
  }, [open, fetchTemplates]);

  // Extract variables from template components
  const extractVariables = (template: Template): TemplateVariable[] => {
    const variables: TemplateVariable[] = [];
    const components = template.components_json || [];

    components.forEach((component: any) => {
      const componentType = component.type?.toLowerCase() as 'header' | 'body' | 'button';
      let text = '';

      if (componentType === 'header' && component.format === 'TEXT') {
        text = component.text || '';
      } else if (componentType === 'body') {
        text = component.text || '';
      } else if (componentType === 'button' && component.buttons) {
        component.buttons.forEach((btn: any, btnIndex: number) => {
          if (btn.type === 'URL' && btn.url) {
            const urlMatches = btn.url.match(/\{\{(\d+)\}\}/g) || [];
            urlMatches.forEach((match: string, idx: number) => {
              variables.push({
                componentType: 'button',
                index: btnIndex,
                placeholder: `Button ${btnIndex + 1} URL Variable`,
              });
            });
          }
        });
        return;
      }

      // Find {{1}}, {{2}}, etc.
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      matches.forEach((match: string) => {
        const num = match.replace(/\{\{|\}\}/g, '');
        variables.push({
          componentType,
          index: parseInt(num) - 1,
          placeholder: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Variable ${num}`,
        });
      });
    });

    return variables;
  };

  // Get preview text with variables filled in
  const getPreviewText = (component: any, type: string): string => {
    let text = component.text || '';
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    
    matches.forEach((match: string) => {
      const num = match.replace(/\{\{|\}\}/g, '');
      const key = `${type}_${parseInt(num) - 1}`;
      const value = variableValues[key] || match;
      text = text.replace(match, value);
    });
    
    return text;
  };

  // Build Meta components payload
  const buildComponentsPayload = (template: Template): any[] => {
    const components = template.components_json || [];
    const payload: any[] = [];

    components.forEach((component: any) => {
      const type = component.type?.toLowerCase();
      
      if (type === 'header' && component.format === 'TEXT') {
        const matches = (component.text || '').match(/\{\{(\d+)\}\}/g) || [];
        if (matches.length > 0) {
          const parameters = matches.map((match: string) => {
            const num = match.replace(/\{\{|\}\}/g, '');
            const key = `header_${parseInt(num) - 1}`;
            return { type: 'text', text: variableValues[key] || '' };
          });
          payload.push({ type: 'header', parameters });
        }
      } else if (type === 'body') {
        const matches = (component.text || '').match(/\{\{(\d+)\}\}/g) || [];
        if (matches.length > 0) {
          const parameters = matches.map((match: string) => {
            const num = match.replace(/\{\{|\}\}/g, '');
            const key = `body_${parseInt(num) - 1}`;
            return { type: 'text', text: variableValues[key] || '' };
          });
          payload.push({ type: 'body', parameters });
        }
      } else if (type === 'button' && component.buttons) {
        component.buttons.forEach((btn: any, btnIndex: number) => {
          if (btn.type === 'URL' && btn.url) {
            const matches = (btn.url || '').match(/\{\{(\d+)\}\}/g) || [];
            if (matches.length > 0) {
              const parameters = matches.map((match: string) => {
                const num = match.replace(/\{\{|\}\}/g, '');
                const key = `button_${btnIndex}_${parseInt(num) - 1}`;
                return { type: 'text', text: variableValues[key] || '' };
              });
              payload.push({ type: 'button', sub_type: 'url', index: btnIndex.toString(), parameters });
            }
          }
        });
      }
    });

    return payload;
  };

  // Check if all variables are filled
  const allVariablesFilled = (template: Template): boolean => {
    const variables = extractVariables(template);
    return variables.every((v) => {
      const key = `${v.componentType}_${v.index}`;
      return variableValues[key]?.trim();
    });
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;

    setSending(true);
    try {
      const components = buildComponentsPayload(selectedTemplate);
      await onSend(selectedTemplate.name, selectedTemplate.language, components);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send template');
    } finally {
      setSending(false);
    }
  };

  const handleUseContactField = (variableKey: string, field: string) => {
    let value = '';
    if (field === 'name') value = contactName || '';
    else if (field === 'wa_id') value = contactWaId || '';
    
    setVariableValues((prev) => ({ ...prev, [variableKey]: value }));
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
          <DialogTitle className="text-base sm:text-lg">
            {selectedTemplate ? 'Configure Template' : 'Select Template'}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="flex flex-col flex-1 overflow-hidden p-4 sm:p-6 pt-3 sm:pt-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TemplateStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-28 touch-manipulation">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TemplateCategory | 'all')}>
                  <SelectTrigger className="w-full sm:w-28 touch-manipulation">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="AUTHENTICATION">Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template List */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No templates match your search' : 'No templates found'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => {
                    const bodyComponent = template.components_json?.find(
                      (c: any) => c.type?.toLowerCase() === 'body'
                    );
                    const preview = bodyComponent?.text?.substring(0, 100) || 'No preview';

                    return (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => {
                          if (template.status === 'APPROVED') {
                            setSelectedTemplate(template);
                            setVariableValues({});
                          } else {
                            toast.error('Only approved templates can be sent');
                          }
                        }}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{template.name}</span>
                              <Badge variant="outline" className={getStatusColor(template.status)}>
                                {template.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {template.language}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {preview}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden p-4 sm:p-6 pt-3 sm:pt-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -mt-2 mb-2"
              onClick={() => setSelectedTemplate(null)}
            >
              ← Back to templates
            </Button>

            <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Variable Form */}
              <ScrollArea className="pr-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Fill in Variables</h3>
                  
                  {extractVariables(selectedTemplate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This template has no variables to fill.
                    </p>
                  ) : (
                    extractVariables(selectedTemplate).map((variable, idx) => {
                      const key = `${variable.componentType}_${variable.index}`;
                      return (
                        <div key={idx} className="space-y-2">
                          <Label className="text-sm">{variable.placeholder}</Label>
                          <div className="flex gap-2">
                            <Input
                              value={variableValues[key] || ''}
                              onChange={(e) =>
                                setVariableValues((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder={`Enter ${variable.placeholder.toLowerCase()}`}
                            />
                            <Select
                              onValueChange={(field) => handleUseContactField(key, field)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Use..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Contact Name</SelectItem>
                                <SelectItem value="wa_id">Phone Number</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Live Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">Preview</h3>
                <div className="bg-background rounded-lg shadow-sm border p-4 space-y-2">
                  {selectedTemplate.components_json?.map((component: any, idx: number) => {
                    const type = component.type?.toLowerCase();
                    
                    if (type === 'header') {
                      if (component.format === 'TEXT') {
                        return (
                          <p key={idx} className="font-semibold text-sm">
                            {getPreviewText(component, 'header')}
                          </p>
                        );
                      } else if (component.format === 'IMAGE') {
                        return (
                          <div key={idx} className="bg-muted rounded h-32 flex items-center justify-center text-muted-foreground text-sm">
                            [Image Header]
                          </div>
                        );
                      }
                    } else if (type === 'body') {
                      return (
                        <p key={idx} className="text-sm whitespace-pre-wrap">
                          {getPreviewText(component, 'body')}
                        </p>
                      );
                    } else if (type === 'footer') {
                      return (
                        <p key={idx} className="text-xs text-muted-foreground">
                          {component.text}
                        </p>
                      );
                    } else if (type === 'buttons' && component.buttons) {
                      return (
                        <div key={idx} className="flex flex-col gap-1 pt-2 border-t">
                          {component.buttons.map((btn: any, btnIdx: number) => (
                            <Button
                              key={btnIdx}
                              variant="outline"
                              size="sm"
                              className="w-full text-primary"
                              disabled
                            >
                              {btn.text}
                            </Button>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={
                  sending ||
                  selectedTemplate.status !== 'APPROVED' ||
                  !allVariablesFilled(selectedTemplate)
                }
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Template'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
