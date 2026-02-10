import { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImagePreviewProps {
  url: string;
  fileName?: string;
  caption?: string;
  isOutbound?: boolean;
}

export function ImagePreview({ url, fileName, caption, isOutbound }: ImagePreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const isValid = url?.startsWith('http') || url?.startsWith('blob:') || url?.startsWith('data:');

  // Handle image load error with one retry
  const handleError = () => {
    if (!retried) {
      setRetried(true);
      if (imgRef.current) {
        imgRef.current.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
      }
    } else {
      setFailed(true);
    }
  };

  if (!isValid) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-xl mb-1",
        isOutbound ? "bg-primary-foreground/10" : "bg-background/80 border border-border/50"
      )}>
        <span className="text-sm">📷 Image</span>
      </div>
    );
  }

  if (failed) {
    return (
      <button
        onClick={() => { setFailed(false); setRetried(false); setLoaded(false); }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-full rounded-xl p-6 mb-1 transition-colors",
          isOutbound ? "bg-primary-foreground/10 hover:bg-primary-foreground/15" : "bg-background/80 hover:bg-background border border-border/50"
        )}
      >
        <RefreshCw className={cn("h-6 w-6", isOutbound ? "text-primary-foreground/50" : "text-muted-foreground")} />
        <span className={cn("text-xs", isOutbound ? "text-primary-foreground/60" : "text-muted-foreground")}>
          Tap to reload
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="mb-1">
        <div className="relative cursor-pointer group" onClick={() => setLightbox(true)}>
          {!loaded && (
            <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          )}
          <img
            ref={imgRef}
            src={url}
            alt={fileName || 'Image'}
            className={cn(
              "rounded-xl max-w-full max-h-[300px] object-cover transition-opacity duration-200",
              !loaded && "h-0 opacity-0",
              loaded && "opacity-100"
            )}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
          {/* Hover overlay */}
          {loaded && (
            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors" />
          )}
        </div>
        {fileName && (
          <p className={cn("text-xs mt-1 px-1 truncate", isOutbound ? "text-primary-foreground/50" : "text-muted-foreground")}>
            {fileName}
          </p>
        )}
        {caption && (
          <p className={cn("text-sm whitespace-pre-wrap mt-1 px-1", isOutbound ? "text-primary-foreground" : "text-foreground")}>
            {caption}
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={url}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Download className="h-5 w-5 text-white" />
            </a>
            <button
              onClick={() => setLightbox(false)}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <img
            src={url}
            alt={fileName || 'Image'}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
