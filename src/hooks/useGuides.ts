import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Guide, GuideCategory, GuideSection, GuideExample } from '@/types/guide';

interface UseGuidesReturn {
  guides: Guide[];
  categories: GuideCategory[];
  loading: boolean;
  fetchGuides: (categorySlug?: string) => Promise<void>;
  fetchGuide: (slug: string) => Promise<Guide | null>;
  fetchCategories: () => Promise<void>;
  searchGuides: (query: string) => Promise<Guide[]>;
  getGuidesBySidebarKey: (key: string) => Guide | undefined;
}

export function useGuides(): UseGuidesReturn {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('guide_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      
      // Get guide counts per category
      const { data: countData } = await supabase
        .from('guides')
        .select('category_id')
        .eq('is_published', true);

      const countsMap = new Map<string, number>();
      countData?.forEach(g => {
        if (g.category_id) {
          countsMap.set(g.category_id, (countsMap.get(g.category_id) || 0) + 1);
        }
      });

      const categoriesWithCount = (data || []).map(cat => ({
        ...cat,
        guides_count: countsMap.get(cat.id) || 0
      }));

      setCategories(categoriesWithCount as GuideCategory[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchGuides = useCallback(async (categorySlug?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('guides')
        .select(`
          *,
          category:guide_categories(*)
        `)
        .eq('is_published', true)
        .order('title');

      if (categorySlug) {
        const { data: category } = await supabase
          .from('guide_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setGuides((data || []) as any);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGuide = useCallback(async (slug: string): Promise<Guide | null> => {
    try {
      const { data: guide, error } = await supabase
        .from('guides')
        .select(`
          *,
          category:guide_categories(*),
          sections:guide_sections(*),
          examples:guide_examples(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Fetch related guides
      const { data: relations } = await supabase
        .from('guide_relations')
        .select('related_guide_id')
        .eq('guide_id', guide.id);

      if (relations && relations.length > 0) {
        const relatedIds = relations.map(r => r.related_guide_id);
        const { data: relatedGuides } = await supabase
          .from('guides')
          .select('id, title, slug, summary')
          .in('id', relatedIds)
          .eq('is_published', true);

        return {
          ...guide,
          sections: guide.sections?.sort((a: any, b: any) => a.sort_order - b.sort_order),
          examples: guide.examples?.sort((a: any, b: any) => a.sort_order - b.sort_order),
          related_guides: relatedGuides || []
        } as any;
      }

      return {
        ...guide,
        sections: guide.sections?.sort((a: any, b: any) => a.sort_order - b.sort_order),
        examples: guide.examples?.sort((a: any, b: any) => a.sort_order - b.sort_order),
        related_guides: []
      } as any;
    } catch (error) {
      console.error('Error fetching guide:', error);
      return null;
    }
  }, []);

  const searchGuides = useCallback(async (query: string): Promise<Guide[]> => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('id, title, slug, summary, sidebar_key')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return (data || []) as any;
    } catch (error) {
      console.error('Error searching guides:', error);
      return [];
    }
  }, []);

  const getGuidesBySidebarKey = useCallback((key: string): Guide | undefined => {
    return guides.find(g => g.sidebar_key === key);
  }, [guides]);

  return {
    guides,
    categories,
    loading,
    fetchGuides,
    fetchGuide,
    fetchCategories,
    searchGuides,
    getGuidesBySidebarKey
  };
}
