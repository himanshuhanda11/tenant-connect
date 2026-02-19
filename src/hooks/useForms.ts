import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { FormDefinition, FormVersion, FormFieldRecord } from '@/types/formRule';

export function useForms() {
  const { currentTenant } = useTenant();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('forms')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (err: any) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const createForm = async (name: string, description?: string): Promise<FormDefinition | null> => {
    if (!currentTenant?.id) return null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any)
        .from('forms')
        .insert({
          tenant_id: currentTenant.id,
          name,
          description: description || null,
          status: 'draft',
          created_by: userData?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      setForms(prev => [data, ...prev]);
      toast.success('Form created');
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create form');
      return null;
    }
  };

  const updateForm = async (formId: string, updates: Partial<FormDefinition>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('forms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', formId);

      if (error) throw error;
      setForms(prev => prev.map(f => f.id === formId ? { ...f, ...updates } : f));
      toast.success('Form updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update form');
      return false;
    }
  };

  const deleteForm = async (formId: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;
      setForms(prev => prev.filter(f => f.id !== formId));
      toast.success('Form deleted');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete form');
      return false;
    }
  };

  return { forms, loading, fetchForms, createForm, updateForm, deleteForm };
}

export function useFormVersion(formId?: string) {
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [fields, setFields] = useState<FormFieldRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('form_versions')
        .select('*')
        .eq('form_id', formId)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersions(data || []);

      // Load fields for latest version
      if (data && data.length > 0) {
        const latestVersion = data[0];
        const { data: fieldData, error: fieldError } = await (supabase as any)
          .from('form_fields')
          .select('*')
          .eq('form_version_id', latestVersion.id)
          .order('order_index', { ascending: true });

        if (fieldError) throw fieldError;
        setFields(fieldData || []);
      }
    } catch (err: any) {
      console.error('Error fetching form versions:', err);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return { versions, fields, loading, fetchVersions };
}
