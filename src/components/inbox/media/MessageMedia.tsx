import { DocumentPreview } from './DocumentPreview';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { Music, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useMediaUrl } from '@/hooks/useMediaUrl';
import type { InboxMessage } from '@/types/inbox';

interface MessageMediaProps {
  message: InboxMessage;
  isOutbound: boolean;
}

export function MessageMedia({ message, isOutbound }: MessageMediaProps) {
  const { message_type, media_url, media_mime_type, media_bucket, media_path, body_text, payload } = message;
  const fileName = (message as any).media_filename || (payload as any)?.filename || (payload as any)?.file_name || undefined;
  const fileSize = (message as any).media_size_bytes || (payload as any)?.file_size || undefined;

  if (!media_url && !media_path) return null;

  const commonProps = {
    mediaBucket: media_bucket || undefined,
    mediaPath: media_path || undefined,
  };

  switch (message_type) {
    case 'image':
      return (
        <ImagePreview
          url={media_url || ''}
          fileName={fileName}
          caption={body_text || undefined}
          isOutbound={isOutbound}
          {...commonProps}
        />
      );

    case 'video':
      return (
        <VideoPreview
          url={media_url || ''}
          fileName={fileName}
          caption={body_text || undefined}
          isOutbound={isOutbound}
          {...commonProps}
        />
      );

    case 'document':
      return (
        <DocumentPreview
          url={media_url || ''}
          fileName={fileName}
          fileSize={fileSize}
          mimeType={media_mime_type || undefined}
          isOutbound={isOutbound}
          caption={body_text || undefined}
          {...commonProps}
        />
      );

    case 'audio':
      return <AudioPreview url={media_url || ''} isOutbound={isOutbound} mediaBucket={media_bucket || undefined} mediaPath={media_path || undefined} />;

    case 'sticker':
      return <StickerPreview url={media_url || ''} />;

    default:
      return (
        <DocumentPreview
          url={media_url || ''}
          fileName={fileName || message_type}
          fileSize={fileSize}
          mimeType={media_mime_type || undefined}
          isOutbound={isOutbound}
          caption={body_text || undefined}
          {...commonProps}
        />
      );
  }
}

function AudioPreview({ url, isOutbound, mediaBucket, mediaPath }: { url: string; isOutbound: boolean; mediaBucket?: string; mediaPath?: string }) {
  const { url: mediaUrl, refresh, loading, hasStoragePath } = useMediaUrl(url, mediaBucket, mediaPath);
  const [failed, setFailed] = useState(false);
  const isValid = mediaUrl?.startsWith('http') || mediaUrl?.startsWith('blob:');

  if (!isValid || failed) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-xl mb-1",
        isOutbound ? "bg-primary-foreground/10" : "bg-background/80 border border-border/50"
      )}>
        <Music className="h-4 w-4" />
        <span className="text-sm">Audio message</span>
        {(failed && hasStoragePath) && (
          <button onClick={async () => { const u = await refresh(); if (u) setFailed(false); }}>
            <RefreshCw className={cn("h-3 w-3 text-muted-foreground", loading && "animate-spin")} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <audio
        src={mediaUrl}
        controls
        preload="metadata"
        className="max-w-full w-full"
        onError={async () => {
          if (hasStoragePath) {
            const u = await refresh();
            if (!u) setFailed(true);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}

function StickerPreview({ url }: { url: string }) {
  const isValid = url?.startsWith('http');
  if (!isValid) {
    return (
      <div className="flex items-center gap-2 p-2 rounded">
        <span className="text-sm">🏷️ Sticker</span>
      </div>
    );
  }
  return <img src={url} alt="Sticker" className="max-w-[150px] mb-1" loading="lazy" />;
}
