import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Plus, Pencil, Trash2, MessageSquareText, Save, Loader2, GripVertical, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface QuickReply {
  id: string;
  label: string;
  text: string;
  sort_order?: number;
}

const DEFAULT_REPLIES: Omit<QuickReply, 'id'>[] = [
  { label: 'Thanks', text: 'Thank you for reaching out!' },
  { label: 'Looking into it', text: "I'll look into this and get back to you shortly." },
  { label: 'Anything else?', text: 'Is there anything else I can help you with?' },
  { label: 'Follow up', text: 'Just following up on our previous conversation. Any updates?' },
  { label: 'Welcome', text: 'Welcome! How can I assist you today?' },
];

interface QuickReplyManagerProps {
  onSelectReply: (text: string) => void;
  isMobile?: boolean;
}

export function QuickReplyManager({ onSelectReply, isMobile = false }: QuickReplyManagerProps) {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const tenantId = currentTenant?.id;
  const userId = user?.id;

  // Load quick replies from database
  const loadReplies = useCallback(async () => {
    if (!tenantId || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_replies')
        .select('id, label, text, sort_order')
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Quick replies load error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setReplies(data.map(r => ({ id: r.id, label: r.label, text: r.text, sort_order: r.sort_order })));
      } else {
        await seedDefaultsForUser(tenantId, userId);
      }
    } catch (err) {
      console.error('Failed to load quick replies:', err);
      setReplies(DEFAULT_REPLIES.map((r, i) => ({ ...r, id: `local-${i}` })));
    } finally {
      setLoading(false);
    }
  }, [tenantId, userId]);

  const seedDefaultsForUser = async (tid: string, uid: string) => {
    try {
      const rows = DEFAULT_REPLIES.map((r, i) => ({
        tenant_id: tid,
        user_id: uid,
        label: r.label,
        text: r.text,
        sort_order: i,
      }));
      const { data, error } = await supabase
        .from('quick_replies')
        .insert(rows)
        .select('id, label, text, sort_order');

      if (error) {
        console.error('Seed quick replies error:', error);
        setReplies(DEFAULT_REPLIES.map((r, i) => ({ ...r, id: `local-${i}` })));
        return;
      }
      if (data) {
        setReplies(data.map(r => ({ id: r.id, label: r.label, text: r.text, sort_order: r.sort_order })));
      }
    } catch (err) {
      console.error('Failed to seed default replies:', err);
      setReplies(DEFAULT_REPLIES.map((r, i) => ({ ...r, id: `local-${i}` })));
    }
  };

  useEffect(() => {
    loadReplies();
  }, [loadReplies]);

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

  const saveEdit = async () => {
    if (!editLabel.trim() || !editText.trim() || !tenantId || !userId) return;
    setSaving(true);
    try {
      if (isAdding) {
        const { data, error } = await supabase
          .from('quick_replies')
          .insert({
            tenant_id: tenantId,
            user_id: userId,
            label: editLabel.trim(),
            text: editText.trim(),
            sort_order: replies.length,
          })
          .select('id, label, text, sort_order')
          .single();

        if (error) throw error;
        if (data) {
          setReplies(prev => [...prev, { id: data.id, label: data.label, text: data.text, sort_order: data.sort_order }]);
        }
        setIsAdding(false);
        toast.success('Quick reply added');
      } else if (editingId) {
        const { error } = await supabase
          .from('quick_replies')
          .update({ label: editLabel.trim(), text: editText.trim() })
          .eq('id', editingId);

        if (error) throw error;
        setReplies(prev => prev.map(r => r.id === editingId ? { ...r, label: editLabel.trim(), text: editText.trim() } : r));
        setEditingId(null);
        toast.success('Quick reply updated');
      }
    } catch (err) {
      console.error('Failed to save quick reply:', err);
      toast.error('Failed to save quick reply');
    } finally {
      setSaving(false);
      setEditLabel('');
      setEditText('');
    }
  };

  const deleteReply = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_replies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReplies(prev => prev.filter(r => r.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditLabel('');
        setEditText('');
      }
      toast.success('Quick reply deleted');
    } catch (err) {
      console.error('Failed to delete quick reply:', err);
      toast.error('Failed to delete quick reply');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditLabel('');
    setEditText('');
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIndex === null || fromIndex === dropIndex) return;

    const updated = [...replies];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(dropIndex, 0, moved);
    setReplies(updated);

    // Persist new sort_order to DB
    const updates = updated.map((r, i) => ({ id: r.id, sort_order: i }));
    try {
      await Promise.all(
        updates
          .filter(u => !u.id.startsWith('local-'))
          .map(u =>
            supabase
              .from('quick_replies')
              .update({ sort_order: u.sort_order })
              .eq('id', u.id)
          )
      );
    } catch (err) {
      console.error('Failed to save order:', err);
      toast.error('Failed to save order');
    }
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const visibleCount = isMobile ? 2 : 4;

  return (
    <>
      {/* Inline Quick Replies Bar */}
      <div className="flex items-center gap-1.5 mb-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1 shrink-0 font-medium uppercase tracking-wider">
          <Zap className="h-3 w-3" />
        </span>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <>
            {replies.slice(0, visibleCount).map((reply) => (
              <Button 
                key={reply.id}
                variant="outline" 
                size="sm" 
                className="h-7 text-xs rounded-lg border-border/40 bg-card hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 shrink-0 font-medium shadow-sm"
                onClick={() => onSelectReply(reply.text)}
              >
                {reply.label}
              </Button>
            ))}
            {replies.length > visibleCount && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-primary px-2 shrink-0"
                onClick={() => setShowManager(true)}
              >
                +{replies.length - visibleCount}
              </Button>
            )}
          </>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-[11px] text-muted-foreground/60 hover:text-primary gap-1 shrink-0 ml-auto"
          onClick={() => setShowManager(true)}
        >
          <Pencil className="h-3 w-3" />
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
              Drag to reorder — top {visibleCount} appear in the quick bar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[350px] pr-2">
            <div className="space-y-1">
              {replies.map((reply, index) => (
                <div
                  key={reply.id}
                  draggable={!editingId && !isAdding}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex items-start gap-2 p-3 rounded-xl border transition-all",
                    editingId === reply.id 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border/50 hover:border-border hover:bg-muted/30",
                    dragOverIndex === index && "border-primary/50 bg-primary/10 scale-[1.02]",
                    index < visibleCount && "relative",
                  )}
                >
                  {/* Drag handle */}
                  {!editingId && !isAdding && (
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 cursor-grab active:cursor-grabbing shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Visible badge */}
                  {index < visibleCount && !editingId && !isAdding && (
                    <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {index + 1}
                    </span>
                  )}

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
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit} disabled={saving}>
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 min-w-0 cursor-pointer rounded-lg p-1 -m-1 hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          onSelectReply(reply.text);
                          setShowManager(false);
                        }}
                      >
                        <p className="text-sm font-medium">{reply.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{reply.text}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit} disabled={saving}>
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
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
