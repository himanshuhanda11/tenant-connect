import { useState } from 'react';
import { Play, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoPreviewProps {
  url: string;
  fileName?: string;
  caption?: string;
  isOutbound?: boolean;
}

export function VideoPreview({ url, fileName, caption, isOutbound }: VideoPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [modal, setModal] = useState(false);

  const isValid = url?.startsWith('http') || url?.startsWith('blob:');

  if (!isValid) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-xl mb-1",
        isOutbound ? "bg-primary-foreground/10" : "bg-background/80 border border-border/50"
      )}>
        <Play className="h-4 w-4" />
        <span className="text-sm">Video</span>
      </div>
    );
  }

  if (failed) {
    return (
      <button
        onClick={() => { setFailed(false); setLoaded(false); }}
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
        {/* Thumbnail with play button */}
        <div
          className="relative cursor-pointer group rounded-xl overflow-hidden"
          onClick={() => setModal(true)}
        >
          {!loaded && <Skeleton className="w-full aspect-video rounded-xl" />}
          <video
            src={url}
            preload="metadata"
            className={cn(
              "max-w-full max-h-[250px] rounded-xl object-cover transition-opacity",
              !loaded && "h-0 opacity-0",
              loaded && "opacity-100"
            )}
            onLoadedMetadata={() => setLoaded(true)}
            onError={() => setFailed(true)}
            muted
          />
          {loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 text-gray-800 ml-0.5" fill="currentColor" />
              </div>
            </div>
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

      {/* Video modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setModal(false)}
        >
          <button
            onClick={() => setModal(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
