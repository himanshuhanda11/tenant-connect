import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MessageSquareText, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickReply {
  id: string;
  label: string;
  text: string;
}

const DEFAULT_REPLIES: QuickReply[] = [
  { id: '1', label: 'Thanks', text: 'Thank you for reaching out!' },
  { id: '2', label: 'Looking into it', text: "I'll look into this and get back to you shortly." },
  { id: '3', label: 'Anything else?', text: 'Is there anything else I can help you with?' },
  { id: '4', label: 'Follow up', text: 'Just following up on our previous conversation. Any updates?' },
  { id: '5', label: 'Welcome', text: 'Welcome! How can I assist you today?' },
];

interface QuickReplyManagerProps {
  onSelectReply: (text: string) => void;
  isMobile?: boolean;
}

export function QuickReplyManager({ onSelectReply, isMobile = false }: QuickReplyManagerProps) {
  const [replies, setReplies] = useState<QuickReply[]>(DEFAULT_REPLIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (reply: QuickReply) => {
    setEditingId(reply.id);
    setEditLabel(reply.label);
    setEditText(reply.text);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditLabel('');
    setEditText('');
  };

  const saveEdit = () => {
    if (!editLabel.trim() || !editText.trim()) return;
    if (isAdding) {
      setReplies(prev => [...prev, { id: Date.now().toString(), label: editLabel, text: editText }]);
      setIsAdding(false);
    } else if (editingId) {
      setReplies(prev => prev.map(r => r.id === editingId ? { ...r, label: editLabel, text: editText } : r));
      setEditingId(null);
    }
    setEditLabel('');
    setEditText('');
  };

  const deleteReply = (id: string) => {
    setReplies(prev => prev.filter(r => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditLabel('');
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditLabel('');
    setEditText('');
  };

  return (
    <>
      {/* Inline Quick Replies Bar */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquareText className="h-3 w-3" />
          Quick:
        </span>
        {replies.slice(0, isMobile ? 2 : 4).map((reply) => (
          <Button 
            key={reply.id}
            variant="outline" 
            size="sm" 
            className="h-6 text-xs rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            onClick={() => onSelectReply(reply.text)}
          >
            {reply.label}
          </Button>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-primary hover:bg-primary/5 gap-1"
          onClick={() => setShowManager(true)}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </div>

      {/* Manager Dialog */}
      <Dialog open={showManager} onOpenChange={setShowManager}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              Quick Replies
            </DialogTitle>
            <DialogDescription>
              Create and manage your quick reply shortcuts. These are personal to your account.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[350px] pr-2">
            <div className="space-y-2">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={cn(
                    "group flex items-start gap-2 p-3 rounded-xl border transition-colors",
                    editingId === reply.id 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border/50 hover:border-border hover:bg-muted/30"
                  )}
                >
                  {editingId === reply.id ? (
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={editLabel} 
                        onChange={e => setEditLabel(e.target.value)} 
                        placeholder="Label (e.g. Thanks)"
                        className="h-8 text-sm"
                      />
                      <Textarea 
                        value={editText} 
                        onChange={e => setEditText(e.target.value)} 
                        placeholder="Full reply text..."
                        className="min-h-[60px] text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit}>
                          <Save className="h-3 w-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{reply.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{reply.text}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => startEdit(reply)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteReply(reply.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {isAdding && (
                <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                  <Input 
                    value={editLabel} 
                    onChange={e => setEditLabel(e.target.value)} 
                    placeholder="Label (e.g. Greeting)"
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Textarea 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)} 
                    placeholder="Full reply text..."
                    className="min-h-[60px] text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit}>
                      <Save className="h-3 w-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {!isAdding && !editingId && (
            <Button variant="outline" className="w-full gap-2 mt-2" onClick={startAdd}>
              <Plus className="h-4 w-4" /> Add Quick Reply
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
