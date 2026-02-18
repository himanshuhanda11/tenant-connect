import { useState } from 'react';
import { Bot, Send, Pencil, X, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AiDraft {
  id: string;
  message_text: string;
  lead_update: {
    confidence?: number;
    intent?: string;
    lead_stage?: string;
    tags?: string[];
  } | null;
  status: string;
  used_fallback?: boolean;
}

interface AiDraftBannerProps {
  draft: AiDraft;
  onApprove: (draftId: string, text: string) => Promise<void>;
  onReject: (draftId: string) => Promise<void>;
  isMobile?: boolean;
}

export function AiDraftBanner({ draft, onApprove, onReject, isMobile }: AiDraftBannerProps) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(draft.message_text);
  const [loading, setLoading] = useState(false);

  const confidence = (draft.lead_update as any)?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);
  const usedFallback = (draft as any).used_fallback;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(draft.id, editing ? editedText : draft.message_text);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(draft.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "border rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent",
      isMobile ? "mx-2 mb-2 p-3" : "mx-4 mb-3 p-4"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">AI Draft Ready</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {usedFallback && (
            <Badge variant="outline" className="text-[10px] h-5 border-amber-300 text-amber-600 bg-amber-50">
              <AlertTriangle className="h-3 w-3 mr-0.5" />
              Fallback
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5",
              confidencePct >= 80 && "border-green-300 text-green-700 bg-green-50",
              confidencePct >= 50 && confidencePct < 80 && "border-amber-300 text-amber-700 bg-amber-50",
              confidencePct < 50 && "border-red-300 text-red-700 bg-red-50"
            )}
          >
            <Sparkles className="h-3 w-3 mr-0.5" />
            {confidencePct}%
          </Badge>
        </div>
      </div>

      {/* Draft text */}
      {editing ? (
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="min-h-[60px] mb-2 text-sm"
          rows={3}
        />
      ) : (
        <p className="text-sm text-foreground/90 bg-background/60 rounded-md p-2.5 mb-2 border border-border/40 leading-relaxed">
          {draft.message_text}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleApprove}
          disabled={loading}
        >
          <Send className="h-3 w-3" />
          {editing ? 'Send Edited' : 'Approve & Send'}
        </Button>
        {!editing ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setEditing(true)}
            disabled={loading}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => { setEditing(false); setEditedText(draft.message_text); }}
          >
            Cancel Edit
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
          onClick={handleReject}
          disabled={loading}
        >
          <X className="h-3 w-3" />
          Reject
        </Button>
      </div>
    </div>
  );
}
