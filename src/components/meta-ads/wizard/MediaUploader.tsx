import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image, Video, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MediaUploaderProps {
  mediaUrl?: string;
  mediaType?: string;
  onMediaChange: (url: string, type: string) => void;
  onMediaRemove: () => void;
}

export function MediaUploader({ mediaUrl, mediaType, onMediaChange, onMediaRemove }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState(mediaUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Only images and videos are supported');
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      setUploadProgress(50);

      const { error: uploadError } = await supabase.storage
        .from('meta-ad-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from('meta-ad-media')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      const type = isImage ? 'IMAGE' : 'VIDEO';
      
      onMediaChange(publicUrl, type);
      setUrlInput(publicUrl);
      setUploadProgress(100);
      toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
    } catch {
      toast.error('Invalid URL');
      return;
    }
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(urlInput);
    onMediaChange(urlInput, isVideo ? 'VIDEO' : 'IMAGE');
  };

  const handleRemove = () => {
    setUrlInput('');
    onMediaRemove();
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Media *</Label>

      {/* Preview */}
      {mediaUrl && (
        <div className="relative rounded-lg border overflow-hidden bg-muted/30">
          {mediaType === 'VIDEO' ? (
            <video src={mediaUrl} className="w-full max-h-48 object-contain" controls />
          ) : (
            <img src={mediaUrl} alt="Ad preview" className="w-full max-h-48 object-contain" />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-destructive/20 border"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] bg-background/80 px-2 py-0.5 rounded-full border">
              {mediaType === 'VIDEO' ? '🎬 Video' : '🖼️ Image'}
            </span>
          </div>
        </div>
      )}

      {!mediaUrl && (
        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload" className="text-xs gap-1.5">
              <Upload className="h-3 w-3" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs gap-1.5">
              <LinkIcon className="h-3 w-3" /> Paste URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                'w-full flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed transition-colors',
                isUploading
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Image className="h-6 w-6 text-muted-foreground" />
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Click to upload image or video</span>
                  <span className="text-[10px] text-muted-foreground">
                    JPG, PNG, GIF, MP4, MOV • Max 25MB • 1080×1080 recommended
                  </span>
                </>
              )}
            </button>
          </TabsContent>

          <TabsContent value="url" className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-10"
              />
              <Button size="sm" onClick={handleUrlSubmit} className="h-10">
                Add
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Paste a public URL to your image or video
            </p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
