import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaLibrary, MediaItem } from '@/hooks/useMediaLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Upload, Trash2, Copy, Search, Image as ImageIcon,
  Loader2, FileText, X,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { media, loading, uploadMedia, deleteMedia, fetchMedia } = useMediaLibrary();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) { setIsAuthorized(false); return; }
      const { data } = await supabase.from('platform_admins').select('id').eq('user_id', user.id).maybeSingle();
      setIsAuthorized(!!data);
    };
    if (!authLoading) checkAuth();
  }, [user, authLoading]);

  const filtered = media.filter(m =>
    (m.file_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadMedia(file);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copied!' });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (authLoading || isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/developer/blog-builder')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"><ImageIcon className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-semibold text-foreground">Media Library</span>
          </div>
          <Badge variant="outline" className="ml-2">{media.length} files</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Drag & drop images here</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">or click to browse</p>
          <label>
            <Button variant="outline" size="sm" disabled={uploading} asChild><span>{uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : 'Choose Files'}</span></Button>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </label>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-muted-foreground">
            <span>📸 Featured: 1200×630px</span>
            <span>🖼️ Content: 800×600px</span>
            <span>⚡ Max: 200KB</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No media files</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(item => (
              <Card key={item.id} className="group border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted/30 relative">
                  <img src={item.file_url} alt={item.alt_text || ''} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="h-8" onClick={() => copyUrl(item.file_url)}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                    <Button size="sm" variant="destructive" className="h-8" onClick={() => deleteMedia(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-[10px] font-medium truncate">{item.file_name || 'File'}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(item.file_size)}{item.width ? ` • ${item.width}×${item.height}` : ''}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
