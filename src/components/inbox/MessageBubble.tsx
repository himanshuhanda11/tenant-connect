import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle, Image, FileText, Play, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, MessageStatus } from '@/types/whatsapp';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getMediaIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Check if a media_url is a valid URL (not just a bare Meta media ID)
  const isValidMediaUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  const renderContent = () => {
    // For image messages, show actual image only if valid URL
    if (message.type === 'image' && message.media_url) {
      if (!isValidMediaUrl(message.media_url)) {
        // Bare Meta media ID — show placeholder
        return (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Image className="h-4 w-4" />
            <span className="text-sm">📷 Image</span>
            {message.text && <p className="text-sm whitespace-pre-wrap mt-1">{message.text}</p>}
          </div>
        );
      }
      return (
        <div>
          <img 
            src={message.media_url} 
            alt="Shared image" 
            className="rounded-lg max-w-full mb-1"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.retried) {
                img.dataset.retried = 'true';
                img.src = message.media_url + (message.media_url.includes('?') ? '&' : '?') + 't=' + Date.now();
              } else {
                img.style.display = 'none';
                img.parentElement?.insertAdjacentHTML('afterbegin', 
                  '<div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"><span class="text-sm">📷 Image</span></div>'
                );
              }
            }}
          />
          {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
        </div>
      );
    }

    // For other media messages, show a placeholder with icon
    if (message.type !== 'text' && message.media_url) {
      return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          {getMediaIcon()}
          <span className="text-sm capitalize">{message.type}</span>
          {message.text && (
            <span className="text-sm text-muted-foreground">
              - {message.text}
            </span>
          )}
        </div>
      );
    }

    // For template messages
    if (message.type === 'template') {
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Template message sent</span>
        </div>
      );
    }

    // Regular text message
    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.text || ''}
      </p>
    );
  };

  return (
    <div
      className={cn(
        'flex w-full mb-2',
        isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOutbound
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        {renderContent()}

        <div
          className={cn(
            'flex items-center justify-end gap-1 mt-1',
            isOutbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          <span className="text-xs">
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOutbound && getStatusIcon(message.status)}
        </div>

        {/* Error message for failed messages */}
        {message.status === 'failed' && message.error_message && (
          <div className="mt-1 text-xs text-destructive">
            {message.error_message}
          </div>
        )}
      </div>
    </div>
  );
}
