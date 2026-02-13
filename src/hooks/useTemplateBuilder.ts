import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { 
  Template, 
  TemplateVersion, 
  TemplateApproval,
  TemplateSubmissionLog,
  HeaderType,
  TemplateButton,
  InternalStatus,
  TemplateCategory,
  LintValidationResult
} from '@/types/template';
import { lintTemplate, hasLintErrors, calculateTemplateScore } from '@/lib/templateLinter';

interface UseTemplateBuilderReturn {
  templates: Template[];
  loading: boolean;
  saving: boolean;
  currentTemplate: Template | null;
  currentVersion: TemplateVersion | null;
  lintResults: LintValidationResult[];
  
  // CRUD operations
  fetchTemplates: (filters?: TemplateFilters) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  createTemplate: (data: CreateTemplateData) => Promise<Template | null>;
  updateVersion: (templateId: string, data: UpdateVersionData) => Promise<TemplateVersion | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  duplicateTemplate: (id: string) => Promise<Template | null>;
  archiveTemplate: (id: string) => Promise<boolean>;
  
  // Workflow operations
  requestReview: (templateId: string) => Promise<boolean>;
  approveTemplate: (templateId: string, comments?: string) => Promise<boolean>;
  requestChanges: (templateId: string, comments: string) => Promise<boolean>;
  submitToMeta: (templateId: string) => Promise<boolean>;
  
  // Validation
  validateTemplate: (template: Partial<Template>, version: Partial<TemplateVersion>) => LintValidationResult[];
  
  // History
  fetchApprovalHistory: (templateId: string) => Promise<TemplateApproval[]>;
  fetchSubmissionLogs: (templateId: string) => Promise<TemplateSubmissionLog[]>;
}

interface TemplateFilters {
  search?: string;
  category?: TemplateCategory | '';
  internal_status?: InternalStatus | '';
  meta_status?: string;
  language?: string;
  created_by?: string;
}

interface CreateTemplateData {
  name: string;
  language: string;
  category: TemplateCategory;
  header_type: HeaderType;
  header_content?: string;
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
  variable_samples?: Record<string, string>;
}

interface UpdateVersionData {
  header_type: HeaderType;
  header_content?: string;
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
  variable_samples?: Record<string, string>;
}

export function useTemplateBuilder(): UseTemplateBuilderReturn {
  const { currentTenant } = useTenant();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [currentVersion, setCurrentVersion] = useState<TemplateVersion | null>(null);
  const [lintResults, setLintResults] = useState<LintValidationResult[]>([]);

  const fetchTemplates = useCallback(async (filters?: TemplateFilters) => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('templates')
        .select(`
          *,
          current_version:template_versions!templates_current_version_id_fkey(*)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.internal_status) {
        query = query.eq('internal_status', filters.internal_status);
      }
      if (filters?.meta_status) {
        query = query.eq('status', filters.meta_status as any);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Use 'as any' to bypass TypeScript issues with Supabase Json types
      setTemplates((data || []) as any);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  const fetchTemplate = useCallback(async (id: string) => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data: template, error } = await supabase
        .from('templates')
        .select(`
          *,
          versions:template_versions(*),
          approvals:template_approvals(
            *,
            requested_by_profile:profiles!template_approvals_requested_by_fkey(full_name, email),
            reviewed_by_profile:profiles!template_approvals_reviewed_by_fkey(full_name, email)
          ),
          submission_logs:template_submission_logs(*)
        `)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .single();
      
      if (error) throw error;
      
      // Cast to any to bypass Json type issues
      setCurrentTemplate(template as any);
      
      // Get current version
      const versions = (template as any).versions as TemplateVersion[] | undefined;
      if (template.current_version_id && versions) {
        const currentVer = versions.find(
          (v: TemplateVersion) => v.id === template.current_version_id
        );
        setCurrentVersion(currentVer || null);
        
        if (currentVer) {
          const results = lintTemplate(template as any, currentVer as any);
          setLintResults(results);
        }
      } else if (versions && versions.length > 0) {
        const latestVersion = versions.sort(
          (a: TemplateVersion, b: TemplateVersion) => b.version_number - a.version_number
        )[0];
        setCurrentVersion(latestVersion);
        
        const results = lintTemplate(template as any, latestVersion as any);
        setLintResults(results);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to fetch template');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  const createTemplate = useCallback(async (data: CreateTemplateData): Promise<Template | null> => {
    if (!currentTenant?.id) return null;
    
    setSaving(true);
    try {
      // Get active WABA account
      const { data: wabaAccounts } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .limit(1);
      
      const wabaAccountId = wabaAccounts?.[0]?.id;
      if (!wabaAccountId) {
        toast.error('No active WABA account found. Please connect one first.');
        return null;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert({
          tenant_id: currentTenant.id,
          waba_account_id: wabaAccountId,
          name: data.name,
          language: data.language,
          category: data.category,
          meta_template_id: `local_${Date.now()}`,
          internal_status: 'draft',
          status: 'PENDING',
          created_by: user?.id,
          template_score: 100
        } as any)
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      // Create initial version
      const { data: version, error: versionError } = await supabase
        .from('template_versions')
        .insert({
          template_id: template.id,
          version_number: 1,
          header_type: data.header_type,
          header_content: data.header_content || null,
          body: data.body,
          footer: data.footer || null,
          buttons: data.buttons || [],
          variable_samples: data.variable_samples || {},
          created_by: user?.id
        } as any)
        .select()
        .single();
      
      if (versionError) throw versionError;
      
      // Update template with current version
      await supabase
        .from('templates')
        .update({ current_version_id: version.id })
        .eq('id', template.id);
      
      // Run lint and save results
      const lintResultsData = lintTemplate(
        { ...template, category: data.category } as any,
        version as any
      );
      
      if (lintResultsData.length > 0) {
        await supabase
          .from('template_lint_results')
          .insert(lintResultsData.map(r => ({
            template_id: template.id,
            version_id: version.id,
            severity: r.severity,
            rule_code: r.rule_code,
            message: r.message,
            field: r.field,
            suggestion: r.suggestion,
            tenant_id: currentTenant.id
          })) as any);
      }
      
      const score = calculateTemplateScore(lintResultsData, { approved: 0, rejected: 0 });
      await supabase
        .from('templates')
        .update({ template_score: score })
        .eq('id', template.id);
      
      toast.success('Template created successfully');
      return { ...template, current_version: version } as any;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    } finally {
      setSaving(false);
    }
  }, [currentTenant?.id]);

  const updateVersion = useCallback(async (
    templateId: string, 
    data: UpdateVersionData
  ): Promise<TemplateVersion | null> => {
    if (!currentTenant?.id) return null;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current version number
      const { data: versions } = await supabase
        .from('template_versions')
        .select('version_number')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersion = (versions?.[0]?.version_number || 0) + 1;
      
      // Create new version
      const { data: version, error } = await supabase
        .from('template_versions')
        .insert({
          template_id: templateId,
          version_number: nextVersion,
          header_type: data.header_type,
          header_content: data.header_content || null,
          body: data.body,
          footer: data.footer || null,
          buttons: data.buttons || [],
          variable_samples: data.variable_samples || {},
          created_by: user?.id
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update template
      await supabase
        .from('templates')
        .update({ 
          current_version_id: version.id,
          internal_status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);
      
      // Get template for linting
      const { data: template } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      // Clear old lint results for this template
      await supabase
        .from('template_lint_results')
        .delete()
        .eq('template_id', templateId);
      
      // Run new lint
      const lintResultsData = lintTemplate(template as any, version as any);
      setLintResults(lintResultsData);
      
      if (lintResultsData.length > 0) {
        await supabase
          .from('template_lint_results')
          .insert(lintResultsData.map(r => ({
            template_id: templateId,
            version_id: version.id,
            severity: r.severity,
            rule_code: r.rule_code,
            message: r.message,
            field: r.field,
            suggestion: r.suggestion,
            tenant_id: currentTenant.id
          })) as any);
      }
      
      setCurrentVersion(version as any);
      toast.success('Template updated');
      return version as any;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      return null;
    } finally {
      setSaving(false);
    }
  }, [currentTenant?.id]);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  }, []);

  const duplicateTemplate = useCallback(async (id: string): Promise<Template | null> => {
    if (!currentTenant?.id) return null;
    
    try {
      const { data: original } = await supabase
        .from('templates')
        .select('*, versions:template_versions(*)')
        .eq('id', id)
        .single();
      
      if (!original) throw new Error('Template not found');
      
      const versions = (original as any).versions as TemplateVersion[];
      const latestVersion = versions?.sort(
        (a, b) => b.version_number - a.version_number
      )[0];
      
      return await createTemplate({
        name: `${original.name} (Copy)`,
        language: original.language,
        category: original.category,
        header_type: (latestVersion?.header_type as HeaderType) || 'none',
        header_content: latestVersion?.header_content || undefined,
        body: latestVersion?.body || '',
        footer: latestVersion?.footer || undefined,
        buttons: latestVersion?.buttons as TemplateButton[] || [],
        variable_samples: latestVersion?.variable_samples as Record<string, string> || {}
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
      return null;
    }
  }, [currentTenant?.id, createTemplate]);

  const archiveTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ status: 'DISABLED' })
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, status: 'DISABLED' as const } : t
      ));
      toast.success('Template archived');
      return true;
    } catch (error) {
      console.error('Error archiving template:', error);
      toast.error('Failed to archive template');
      return false;
    }
  }, []);

  const requestReview = useCallback(async (templateId: string): Promise<boolean> => {
    if (!currentTenant?.id) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check for lint errors
      if (hasLintErrors(lintResults)) {
        toast.error('Cannot request review: template has validation errors');
        return false;
      }
      
      // Get current version
      const { data: template } = await supabase
        .from('templates')
        .select('current_version_id')
        .eq('id', templateId)
        .single();
      
      if (!template?.current_version_id) {
        toast.error('No version found');
        return false;
      }
      
      // Create approval request
      const { error: approvalError } = await supabase
        .from('template_approvals')
        .insert({
          template_id: templateId,
          version_id: template.current_version_id,
          requested_by: user?.id,
          status: 'in_review',
          tenant_id: currentTenant.id
        } as any);
      
      if (approvalError) throw approvalError;
      
      // Update template status
      const { error: updateError } = await supabase
        .from('templates')
        .update({ internal_status: 'in_review' })
        .eq('id', templateId);
      
      if (updateError) throw updateError;
      
      setCurrentTemplate(prev => prev ? { ...prev, internal_status: 'in_review' } : null);
      toast.success('Review requested');
      return true;
    } catch (error) {
      console.error('Error requesting review:', error);
      toast.error('Failed to request review');
      return false;
    }
  }, [currentTenant?.id, lintResults]);

  const approveTemplate = useCallback(async (templateId: string, comments?: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get pending approval
      const { data: approval } = await supabase
        .from('template_approvals')
        .select('id')
        .eq('template_id', templateId)
        .eq('status', 'in_review')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!approval) {
        toast.error('No pending approval found');
        return false;
      }
      
      // Update approval
      await supabase
        .from('template_approvals')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          comments,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approval.id);
      
      // Update template
      await supabase
        .from('templates')
        .update({ internal_status: 'approved' })
        .eq('id', templateId);
      
      setCurrentTemplate(prev => prev ? { ...prev, internal_status: 'approved' } : null);
      toast.success('Template approved');
      return true;
    } catch (error) {
      console.error('Error approving template:', error);
      toast.error('Failed to approve template');
      return false;
    }
  }, []);

  const requestChanges = useCallback(async (templateId: string, comments: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get pending approval
      const { data: approval } = await supabase
        .from('template_approvals')
        .select('id')
        .eq('template_id', templateId)
        .eq('status', 'in_review')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!approval) {
        toast.error('No pending approval found');
        return false;
      }
      
      // Update approval
      await supabase
        .from('template_approvals')
        .update({
          status: 'changes_requested',
          reviewed_by: user?.id,
          comments,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approval.id);
      
      // Update template
      await supabase
        .from('templates')
        .update({ internal_status: 'changes_requested' })
        .eq('id', templateId);
      
      setCurrentTemplate(prev => prev ? { ...prev, internal_status: 'changes_requested' } : null);
      toast.success('Changes requested');
      return true;
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
      return false;
    }
  }, []);

  const submitToMeta = useCallback(async (templateId: string): Promise<boolean> => {
    if (!currentTenant?.id) return false;
    
    try {
      // Get template info
      const { data: template } = await supabase
        .from('templates')
        .select('*, current_version:template_versions!templates_current_version_id_fkey(*)')
        .eq('id', templateId)
        .single();

      if (!template) {
        toast.error('Template not found');
        return false;
      }

      // Auto-approve internally if still in draft (skip internal review like AISensy)
      if (template.internal_status === 'draft' || template.internal_status === 'changes_requested') {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Auto-create approval record
        await supabase
          .from('template_approvals')
          .insert({
            template_id: templateId,
            version_id: template.current_version_id,
            requested_by: user?.id,
            reviewed_by: user?.id,
            status: 'approved',
            comments: 'Auto-approved for quick submission',
            tenant_id: currentTenant.id,
            reviewed_at: new Date().toISOString()
          } as any);
        
        await supabase
          .from('templates')
          .update({ internal_status: 'approved' })
          .eq('id', templateId);
      }
      
      // Run quick lint check but don't block submission for non-critical issues
      // Meta will validate and reject if there are real issues

      const { data, error } = await supabase.functions.invoke('submit-template-to-meta', {
        body: {
          template_id: templateId,
          version_id: template.current_version_id
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setCurrentTemplate(prev => prev ? { ...prev, status: 'PENDING', internal_status: 'approved' } : null);
        toast.success('Template submitted to Meta for review');
        return true;
      } else {
        toast.error(data.error || 'Failed to submit template');
        return false;
      }
    } catch (error) {
      console.error('Error submitting to Meta:', error);
      toast.error('Failed to submit template to Meta');
      return false;
    }
  }, [currentTenant?.id, lintResults]);

  const validateTemplate = useCallback((
    template: Partial<Template>,
    version: Partial<TemplateVersion>
  ): LintValidationResult[] => {
    const results = lintTemplate(template, version);
    setLintResults(results);
    return results;
  }, []);

  const fetchApprovalHistory = useCallback(async (templateId: string): Promise<TemplateApproval[]> => {
    const { data, error } = await supabase
      .from('template_approvals')
      .select(`
        *,
        requested_by_profile:profiles!template_approvals_requested_by_fkey(full_name, email),
        reviewed_by_profile:profiles!template_approvals_reviewed_by_fkey(full_name, email)
      `)
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching approval history:', error);
      return [];
    }
    
    return data as any;
  }, []);

  const fetchSubmissionLogs = useCallback(async (templateId: string): Promise<TemplateSubmissionLog[]> => {
    const { data, error } = await supabase
      .from('template_submission_logs')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching submission logs:', error);
      return [];
    }
    
    return data as any;
  }, []);

  return {
    templates,
    loading,
    saving,
    currentTemplate,
    currentVersion,
    lintResults,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateVersion,
    deleteTemplate,
    duplicateTemplate,
    archiveTemplate,
    requestReview,
    approveTemplate,
    requestChanges,
    submitToMeta,
    validateTemplate,
    fetchApprovalHistory,
    fetchSubmissionLogs
  };
}
