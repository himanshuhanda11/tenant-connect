import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Tag, TagRule, TagType, TagStatus, TagHistory } from '@/types/tag';
import { toast } from 'sonner';

interface TagFilters {
  search: string;
  type: TagType | 'all';
  status: TagStatus | 'all';
  group: string;
}

export function useTags() {
  const { currentTenant } = useTenant();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TagFilters>({
    search: '',
    type: 'all',
    status: 'all',
    group: '',
  });

  const fetchTags = useCallback(async () => {
    if (!currentTenant?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('tags')
        .select(`
          *,
          creator:profiles!tags_created_by_fkey(id, full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.type !== 'all') {
        query = query.eq('tag_type', filters.type);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.group) {
        query = query.eq('tag_group', filters.group);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch usage counts
      if (data && data.length > 0) {
        const tagIds = data.map(t => t.id);
        
        const { data: contactTagCounts } = await supabase
          .from('contact_tags')
          .select('tag_id')
          .in('tag_id', tagIds);

        const contactCounts: Record<string, number> = {};
        contactTagCounts?.forEach(ct => {
          contactCounts[ct.tag_id] = (contactCounts[ct.tag_id] || 0) + 1;
        });

        // Fetch rules count
        const { data: rulesCounts } = await (supabase as any)
          .from('tag_rules')
          .select('tag_id')
          .in('tag_id', tagIds);

        const ruleCounts: Record<string, number> = {};
        rulesCounts?.forEach((r: { tag_id: string }) => {
          ruleCounts[r.tag_id] = (ruleCounts[r.tag_id] || 0) + 1;
        });

        const tagsWithCounts = data.map(tag => ({
          ...tag,
          contacts_count: contactCounts[tag.id] || 0,
          rules_count: ruleCounts[tag.id] || 0,
        }));

        setTags(tagsWithCounts as Tag[]);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, filters]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (tagData: Partial<Tag>) => {
    if (!currentTenant?.id) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('tags')
        .insert({
          tenant_id: currentTenant.id,
          name: tagData.name,
          color: tagData.color,
          tag_type: tagData.tag_type || 'custom',
          emoji: tagData.emoji,
          tag_group: tagData.tag_group,
          status: tagData.status || 'active',
          apply_to: tagData.apply_to || 'both',
          description: tagData.description,
          created_by: userData.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tag created successfully');
      fetchTags();
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      return null;
    }
  };

  const updateTag = async (tagId: string, updates: Partial<Tag>) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('tags')
        .update(updates as any)
        .eq('id', tagId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast.success('Tag updated');
      fetchTags();
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast.success('Tag deleted');
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const archiveTag = async (tagId: string) => {
    await updateTag(tagId, { status: 'archived' });
  };

  const getTagGroups = () => {
    const groups = new Set(tags.map(t => t.tag_group).filter(Boolean));
    return Array.from(groups) as string[];
  };

  const getTagsByType = () => {
    const grouped: Record<string, Tag[]> = {};
    tags.forEach(tag => {
      const type = tag.tag_type || 'custom';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(tag);
    });
    return grouped;
  };

  return {
    tags,
    loading,
    filters,
    setFilters,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    archiveTag,
    getTagGroups,
    getTagsByType,
  };
}

export function useTagRules(tagId?: string) {
  const { currentTenant } = useTenant();
  const [rules, setRules] = useState<TagRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!currentTenant?.id) return;

    setLoading(true);
    try {
      let query = (supabase as any)
        .from('tag_rules')
        .select(`
          *,
          tag:tags(id, name, color, emoji),
          creator:profiles(id, full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('priority', { ascending: true });

      if (tagId) {
        query = query.eq('tag_id', tagId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRules((data || []) as TagRule[]);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, tagId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (ruleData: Partial<TagRule>) => {
    if (!currentTenant?.id) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await (supabase as any)
        .from('tag_rules')
        .insert({
          tenant_id: currentTenant.id,
          name: ruleData.name,
          description: ruleData.description,
          tag_id: ruleData.tag_id,
          trigger_type: ruleData.trigger_type,
          trigger_config: ruleData.trigger_config || {},
          action_type: ruleData.action_type || 'apply_tag',
          action_config: ruleData.action_config || {},
          is_active: ruleData.is_active ?? true,
          priority: ruleData.priority || 0,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Rule created successfully');
      fetchRules();
      return data;
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
      return null;
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<TagRule>) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('tag_rules')
        .update(updates)
        .eq('id', ruleId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast.success('Rule updated');
      fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('tag_rules')
        .delete()
        .eq('id', ruleId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast.success('Rule deleted');
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    await updateRule(ruleId, { is_active: isActive });
  };

  return {
    rules,
    loading,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
}

export function useTagHistory(tagId?: string, contactId?: string, conversationId?: string) {
  const { currentTenant } = useTenant();
  const [history, setHistory] = useState<TagHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!currentTenant?.id) return;
    if (!tagId && !contactId && !conversationId) return;

    setLoading(true);
    try {
      let query = (supabase as any)
        .from('tag_history')
        .select(`
          *,
          tag:tags(id, name, color, emoji),
          user:profiles(id, full_name, email),
          rule:tag_rules(id, name)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (tagId) query = query.eq('tag_id', tagId);
      if (contactId) query = query.eq('contact_id', contactId);
      if (conversationId) query = query.eq('conversation_id', conversationId);

      const { data, error } = await query;

      if (error) throw error;
      setHistory((data || []) as TagHistory[]);
    } catch (error) {
      console.error('Error fetching tag history:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, tagId, contactId, conversationId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, fetchHistory };
}
