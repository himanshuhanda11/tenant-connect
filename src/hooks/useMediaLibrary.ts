import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MediaItem {
  id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMedia((data as MediaItem[]) || []);
    } catch (err: any) {
      toast({ title: 'Failed to load media', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const uploadMedia = async (file: File): Promise<MediaItem | null> => {
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('blog-media').getPublicUrl(path);

      const { data, error } = await supabase
        .from('media_library')
        .insert({
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type.startsWith('image') ? 'image' : 'file',
          file_size: file.size,
          alt_text: file.name.replace(/\.[^.]+$/, ''),
        })
        .select()
        .single();
      if (error) throw error;
      
      await fetchMedia();
      toast({ title: 'File uploaded' });
      return data as MediaItem;
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const { error } = await supabase.from('media_library').delete().eq('id', id);
      if (error) throw error;
      await fetchMedia();
      toast({ title: 'File deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  return { media, loading, fetchMedia, uploadMedia, deleteMedia };
}
