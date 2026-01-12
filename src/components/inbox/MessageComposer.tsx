import { useState } from 'react';
import { Send, Paperclip, Smile, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MessageComposerProps {
  onSend: (text: string) => Promise<void>;
  onTemplateClick: () => void;
  disabled?: boolean;
  isOutsideWindow?: boolean;
}

export function MessageComposer({
  onSend,
  onTemplateClick,
  disabled,
  isOutsideWindow,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background">
      {/* 24-hour window warning */}
      {isOutsideWindow && (
        <Alert variant="destructive" className="mx-4 mt-4 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            24-hour messaging window has expired. Use a template to re-engage this contact.
          </AlertDescription>
        </Alert>
      )}

      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  disabled={disabled}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Emoji button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  disabled={disabled}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add emoji</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Text input */}
          <Textarea
            placeholder={
              isOutsideWindow
                ? 'Use a template to re-engage this contact...'
                : 'Type a message...'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isOutsideWindow}
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />

          {/* Template button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={onTemplateClick}
                  disabled={disabled}
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send template</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending || disabled || isOutsideWindow}
            size="icon"
            className="h-9 w-9 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
