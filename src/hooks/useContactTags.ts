import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Tag } from '@/types/tag';
import { toast } from 'sonner';

interface ContactTag {
  id: string;
  tag_id: string;
  contact_id: string;
  created_at: string;
  tag?: Tag;
}

export function useContactTags(contactId?: string) {
  const { currentTenant } = useTenant();
  const [contactTags, setContactTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [recentTags, setRecentTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllTags = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setAllTags((data || []) as Tag[]);
    } catch (error) {
      console.error('Error fetching all tags:', error);
    }
  }, [currentTenant?.id]);

  const fetchContactTags = useCallback(async () => {
    if (!currentTenant?.id || !contactId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select(`
          *,
          tag:tags(*)
        `)
        .eq('contact_id', contactId);

      if (error) throw error;

      const tags = (data || [])
        .map(ct => ct.tag)
        .filter(Boolean) as Tag[];
      
      setContactTags(tags);
    } catch (error) {
      console.error('Error fetching contact tags:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, contactId]);

  const fetchRecentTags = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) return;

      // Get recently used tags by this user
      const { data, error } = await (supabase as any)
        .from('tag_history')
        .select(`
          tag_id,
          tag:tags(*)
        `)
        .eq('tenant_id', currentTenant.id)
        .eq('applied_by', userData.user.id)
        .eq('action', 'applied')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Deduplicate and take first 10
      const seen = new Set<string>();
      const recent: Tag[] = [];
      (data || []).forEach((item: any) => {
        if (item.tag && !seen.has(item.tag_id)) {
          seen.add(item.tag_id);
          recent.push(item.tag);
        }
      });

      setRecentTags(recent.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent tags:', error);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchAllTags();
    fetchRecentTags();
  }, [fetchAllTags, fetchRecentTags]);

  useEffect(() => {
    if (contactId) {
      fetchContactTags();
    }
  }, [contactId, fetchContactTags]);

  const applyTag = async (tagId: string, showToast = true) => {
    if (!currentTenant?.id || !contactId) return false;

    // Check if already applied
    if (contactTags.some(t => t.id === tagId)) {
      return false;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      // Insert contact_tag
      const { error } = await supabase
        .from('contact_tags')
        .insert({
          contact_id: contactId,
          tag_id: tagId,
        });

      if (error) throw error;

      // Log to tag_history
      await (supabase as any)
        .from('tag_history')
        .insert({
          tenant_id: currentTenant.id,
          tag_id: tagId,
          contact_id: contactId,
          action: 'applied',
          source: 'manual',
          applied_by: userData.user?.id,
        });

      if (showToast) toast.success('Tag applied');
      await fetchContactTags();
      fetchRecentTags();
      return true;
    } catch (error) {
      console.error('Error applying tag:', error);
      toast.error('Failed to apply tag');
      return false;
    }
  };

  const removeTag = async (tagId: string, showToast = true) => {
    if (!currentTenant?.id || !contactId) return false;

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('contact_tags')
        .delete()
        .eq('contact_id', contactId)
        .eq('tag_id', tagId);

      if (error) throw error;

      // Log to tag_history
      await (supabase as any)
        .from('tag_history')
        .insert({
          tenant_id: currentTenant.id,
          tag_id: tagId,
          contact_id: contactId,
          action: 'removed',
          source: 'manual',
          applied_by: userData.user?.id,
        });

      if (showToast) toast.success('Tag removed');
      await fetchContactTags();
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
      return false;
    }
  };

  const toggleTag = async (tagId: string) => {
    const isApplied = contactTags.some(t => t.id === tagId);
    if (isApplied) {
      return await removeTag(tagId);
    } else {
      return await applyTag(tagId);
    }
  };

  const getAvailableTags = () => {
    const appliedIds = new Set(contactTags.map(t => t.id));
    return allTags.filter(t => !appliedIds.has(t.id));
  };

  return {
    contactTags,
    allTags,
    recentTags,
    loading,
    applyTag,
    removeTag,
    toggleTag,
    getAvailableTags,
    refetch: fetchContactTags,
  };
}

// Bulk operations hook
export function useBulkTagOperations() {
  const { currentTenant } = useTenant();
  const [processing, setProcessing] = useState(false);

  const bulkApplyTags = async (contactIds: string[], tagIds: string[]) => {
    if (!currentTenant?.id || contactIds.length === 0 || tagIds.length === 0) return false;

    setProcessing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      // Create all contact_tag entries
      const inserts = contactIds.flatMap(contactId =>
        tagIds.map(tagId => ({
          contact_id: contactId,
          tag_id: tagId,
        }))
      );

      const { error } = await supabase
        .from('contact_tags')
        .upsert(inserts, { onConflict: 'contact_id,tag_id', ignoreDuplicates: true });

      if (error) throw error;

      // Log history entries
      const historyInserts = contactIds.flatMap(contactId =>
        tagIds.map(tagId => ({
          tenant_id: currentTenant.id,
          tag_id: tagId,
          contact_id: contactId,
          action: 'applied',
          source: 'manual',
          applied_by: userData.user?.id,
        }))
      );

      await (supabase as any)
        .from('tag_history')
        .insert(historyInserts);

      toast.success(`Tags applied to ${contactIds.length} contacts`);
      return true;
    } catch (error) {
      console.error('Error bulk applying tags:', error);
      toast.error('Failed to apply tags');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const bulkRemoveTags = async (contactIds: string[], tagIds: string[]) => {
    if (!currentTenant?.id || contactIds.length === 0 || tagIds.length === 0) return false;

    setProcessing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      for (const tagId of tagIds) {
        const { error } = await supabase
          .from('contact_tags')
          .delete()
          .in('contact_id', contactIds)
          .eq('tag_id', tagId);

        if (error) throw error;
      }

      // Log history entries
      const historyInserts = contactIds.flatMap(contactId =>
        tagIds.map(tagId => ({
          tenant_id: currentTenant.id,
          tag_id: tagId,
          contact_id: contactId,
          action: 'removed',
          source: 'manual',
          applied_by: userData.user?.id,
        }))
      );

      await (supabase as any)
        .from('tag_history')
        .insert(historyInserts);

      toast.success(`Tags removed from ${contactIds.length} contacts`);
      return true;
    } catch (error) {
      console.error('Error bulk removing tags:', error);
      toast.error('Failed to remove tags');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    bulkApplyTags,
    bulkRemoveTags,
  };
}
