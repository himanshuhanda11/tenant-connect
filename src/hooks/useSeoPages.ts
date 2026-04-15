import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface SeoPage {
  id: string;
  route_path: string;
  page_key: string;
  page_name: string;
  page_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeoMetaRecord {
  id: string;
  page_id: string;
  locale: string;
  title: string;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  robots: string;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  schema_jsonld: Json | null;
  is_published: boolean;
  version: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeoPageWithMeta extends SeoPage {
  seo_meta: SeoMetaRecord[];
}

export function useSeoPages() {
  const [pages, setPages] = useState<SeoPageWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select(`
          *,
          seo_meta(*)
        `)
        .order('page_name', { ascending: true });

      if (error) throw error;
      setPages((data as SeoPageWithMeta[]) || []);
    } catch (err: any) {
      toast({
        title: 'Failed to load SEO pages',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const createPage = async (page: Partial<SeoPage>) => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .insert({
          route_path: page.route_path!,
          page_key: page.page_key!,
          page_name: page.page_name!,
          page_type: page.page_type || 'page',
          is_public: page.is_public ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('seo_meta').insert({
        page_id: data.id,
        title: `${page.page_name} - AiReatro`,
        robots: page.is_public ? 'index,follow' : 'noindex,nofollow',
      });

      await fetchPages();
      toast({ title: 'Page created successfully' });
      return data;
    } catch (err: any) {
      toast({
        title: 'Failed to create page',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMeta = async (meta: Partial<SeoMetaRecord> & { id: string }) => {
    try {
      const { error } = await supabase
        .from('seo_meta')
        .update({
          ...meta,
          version: (meta.version || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meta.id);

      if (error) throw error;

      await fetchPages();
      toast({ title: 'SEO meta updated successfully' });
      return true;
    } catch (err: any) {
      toast({
        title: 'Failed to update SEO meta',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seo_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPages();
      toast({ title: 'Page deleted successfully' });
      return true;
    } catch (err: any) {
      toast({
        title: 'Failed to delete page',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const generateAiSeo = async (pageName: string, routePath: string, pageType: string, currentTitle?: string, currentDescription?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo', {
        body: { pageName, routePath, pageType, currentTitle, currentDescription },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as {
        title: string;
        description: string;
        keywords: string;
        og_title: string;
        og_description: string;
      };
    } catch (err: any) {
      toast({
        title: 'AI Generation Failed',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Sync all known routes into the seo_pages table.
   * Creates missing pages + seo_meta records without overwriting existing ones.
   */
  const syncAllPages = async (entries: Array<{
    route_path: string;
    page_key: string;
    page_name: string;
    page_type: string;
    is_public: boolean;
    fallbackTitle: string;
    fallbackDescription: string;
  }>) => {
    setSyncing(true);
    let created = 0;
    let skipped = 0;

    try {
      // Get existing route_paths
      const { data: existing } = await supabase
        .from('seo_pages')
        .select('route_path');
      
      const existingPaths = new Set((existing || []).map(p => p.route_path));

      for (const entry of entries) {
        if (existingPaths.has(entry.route_path)) {
          skipped++;
          continue;
        }

        const { data: pageData, error: pageError } = await supabase
          .from('seo_pages')
          .insert({
            route_path: entry.route_path,
            page_key: entry.page_key,
            page_name: entry.page_name,
            page_type: entry.page_type,
            is_public: entry.is_public,
          })
          .select()
          .single();

        if (pageError) {
          console.error(`Failed to create page ${entry.route_path}:`, pageError);
          continue;
        }

        await supabase.from('seo_meta').insert({
          page_id: pageData.id,
          title: entry.fallbackTitle,
          description: entry.fallbackDescription,
          og_title: entry.fallbackTitle,
          og_description: entry.fallbackDescription,
          robots: entry.is_public ? 'index,follow' : 'noindex,nofollow',
          is_published: true,
        });

        created++;
      }

      await fetchPages();
      toast({
        title: `Sync Complete`,
        description: `${created} pages added, ${skipped} already existed.`,
      });
    } catch (err: any) {
      toast({
        title: 'Sync Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return {
    pages,
    loading,
    syncing,
    fetchPages,
    createPage,
    updateMeta,
    deletePage,
    generateAiSeo,
    syncAllPages,
  };
}
