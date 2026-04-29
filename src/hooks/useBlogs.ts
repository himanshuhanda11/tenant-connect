import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const BLOG_CACHE_EVENT = 'aireatro:blogs-cache-invalidated';

export function invalidateBlogCaches(slug?: string) {
  const payload = { slug, at: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent(BLOG_CACHE_EVENT, { detail: payload }));
  localStorage.setItem(BLOG_CACHE_EVENT, JSON.stringify(payload));
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(BLOG_CACHE_EVENT);
    channel.postMessage(payload);
    channel.close();
  }
}

export interface BlogBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'code' | 'list' | 'divider' | 'cta' | 'link';
  content: string;
  level?: number; // for headings: 1,2,3
  items?: string[]; // for lists
  ordered?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  buttonText?: string;
  buttonUrl?: string;
  language?: string; // for code blocks
}

export interface Blog {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: BlogBlock[];
  featured_image: string | null;
  image_alt: string | null;
  status: string;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  read_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  canonical_url: string | null;
  schema_jsonld: any;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBlogs((data as any[])?.map(b => ({ ...b, content: Array.isArray(b.content) ? b.content : [] })) || []);
    } catch (err: any) {
      toast({ title: 'Failed to load blogs', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  useEffect(() => {
    const refetch = () => fetchBlogs();
    const onStorage = (event: StorageEvent) => {
      if (event.key === BLOG_CACHE_EVENT) refetch();
    };
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(BLOG_CACHE_EVENT) : null;

    window.addEventListener(BLOG_CACHE_EVENT, refetch);
    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', refetch);

    return () => {
      window.removeEventListener(BLOG_CACHE_EVENT, refetch);
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', refetch);
      channel?.close();
    };
  }, [fetchBlogs]);

  const createBlog = async (blog: Partial<Blog>) => {
    try {
      const slug = generateSlug(blog.title || 'untitled');
      const { data, error } = await supabase
        .from('blogs')
        .insert([{
          title: blog.title || 'Untitled Post',
          slug,
          excerpt: blog.excerpt || '',
          content: (blog.content || []) as any,
          status: 'draft',
          author: blog.author || 'AiReatro Team',
          category: blog.category || 'General',
          tags: blog.tags || [],
          read_time: 0,
        }])
        .select()
        .single();
      if (error) throw error;
      await fetchBlogs();
      toast({ title: 'Blog created' });
      return data;
    } catch (err: any) {
      toast({ title: 'Failed to create blog', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateBlog = async (id: string, updates: Partial<Blog>) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id);
      if (error) throw error;
      await fetchBlogs();
      if (updates.status === 'published' || updates.status === 'draft') invalidateBlogCaches(updates.slug ?? undefined);
      return true;
    } catch (err: any) {
      toast({ title: 'Failed to update blog', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      await fetchBlogs();
      toast({ title: 'Blog deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Failed to delete blog', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const publishBlog = async (id: string) => {
    try {
      const { count: beforeCount, error: beforeError } = await supabase
        .from('blogs')
        .select('id', { count: 'exact', head: true });
      if (beforeError) throw beforeError;

      const { data: current, error: currentError } = await supabase
        .from('blogs')
        .select('slug, status')
        .eq('id', id)
        .single();
      if (currentError) throw currentError;

      const wasAlreadyPublished = current.status === 'published';
      const success = await updateBlog(id, { status: 'published', published_at: new Date().toISOString() } as any);
      if (!success) return false;

      const { data: verified, error: verifyError } = await supabase
        .from('blogs')
        .select('id, slug, status, published_at')
        .eq('slug', current.slug)
        .eq('status', 'published')
        .maybeSingle();
      if (verifyError) throw verifyError;
      if (!verified) throw new Error(`Published blog verification failed for slug: ${current.slug}`);

      const { count: afterCount, error: afterError } = await supabase
        .from('blogs')
        .select('id', { count: 'exact', head: true });
      if (afterError) throw afterError;
      if (!wasAlreadyPublished && (afterCount ?? 0) < (beforeCount ?? 0)) {
        throw new Error('Published blog verification failed: total blog count decreased unexpectedly.');
      }

      invalidateBlogCaches(current.slug ?? undefined);
      await fetchBlogs();
      return true;
    } catch (err: any) {
      toast({ title: 'Publish verification failed', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const unpublishBlog = async (id: string) => {
    return updateBlog(id, { status: 'draft', published_at: null } as any);
  };

  return { blogs, loading, fetchBlogs, createBlog, updateBlog, deleteBlog, publishBlog, unpublishBlog };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function calculateReadTime(blocks: BlogBlock[]): number {
  let wordCount = 0;
  blocks.forEach(b => {
    if (b.content) wordCount += b.content.split(/\s+/).length;
    if (b.items) b.items.forEach(i => { wordCount += i.split(/\s+/).length; });
  });
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function getSeoScore(blog: Blog): number {
  let score = 0;
  const checks = [
    !!blog.title && blog.title.length > 10,
    !!blog.excerpt && blog.excerpt.length > 50,
    !!blog.seo_title && blog.seo_title.length <= 60,
    !!blog.seo_description && blog.seo_description.length >= 120 && blog.seo_description.length <= 160,
    !!blog.seo_keywords,
    !!blog.og_title,
    !!blog.og_description,
    !!blog.og_image || !!blog.featured_image,
    !!blog.featured_image,
    !!blog.slug,
  ];
  checks.forEach(c => { if (c) score += 10; });
  return score;
}
