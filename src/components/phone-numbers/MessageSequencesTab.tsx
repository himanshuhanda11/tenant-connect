import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageSequence {
  id: string;
  title: string;
  message: string;
  sort_order: number;
  is_synced: boolean;
  synced_at: string | null;
}

interface MessageSequencesTabProps {
  phoneNumberId: string; // internal DB UUID
  metaPhoneNumberId: string; // Meta's phone_number_id
  wabaUuid: string; // internal waba UUID
}

export function MessageSequencesTab({ phoneNumberId, metaPhoneNumberId, wabaUuid }: MessageSequencesTabProps) {
  const { currentTenant } = useTenant();
  const [sequences, setSequences] = useState<MessageSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const fetchSequences = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('message_sequences')
      .select('*')
      .eq('phone_number_id', phoneNumberId)
      .eq('tenant_id', currentTenant.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching sequences:', error);
    } else {
      setSequences((data || []) as MessageSequence[]);
    }
    setLoading(false);
  }, [phoneNumberId, currentTenant?.id]);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  const addSequence = async () => {
    if (!currentTenant?.id || !newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (sequences.length >= 4) {
      toast.error('Maximum 4 message sequences allowed by WhatsApp');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('message_sequences').insert({
      tenant_id: currentTenant.id,
      phone_number_id: phoneNumberId,
      title: newTitle.trim(),
      message: newMessage.trim() || newTitle.trim(),
      sort_order: sequences.length,
      is_synced: false,
    });

    if (error) {
      toast.error('Failed to add: ' + error.message);
    } else {
      setNewTitle('');
      setNewMessage('');
      await fetchSequences();
      toast.success('Sequence added');
    }
    setSaving(false);
  };

  const deleteSequence = async (id: string) => {
    const { error } = await supabase.from('message_sequences').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      await fetchSequences();
      toast.success('Sequence removed');
    }
  };

  const syncToMeta = async () => {
    if (!currentTenant?.id || sequences.length === 0) {
      toast.error('Add at least one sequence before syncing');
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-profile', {
        body: {
          action: 'set_ice_breakers',
          phone_number_id: metaPhoneNumberId,
          waba_account_id: wabaUuid,
          ice_breakers: sequences.map(s => ({ title: s.title, message: s.message })),
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || data?.details || 'Sync failed');

      // Mark all as synced
      const now = new Date().toISOString();
      await supabase
        .from('message_sequences')
        .update({ is_synced: true, synced_at: now })
        .eq('phone_number_id', phoneNumberId)
        .eq('tenant_id', currentTenant.id);

      await fetchSequences();
      toast.success('Message sequences synced to Meta successfully!');
    } catch (err: any) {
      console.error('Sync error:', err);
      toast.error('Failed to sync: ' + (err.message || 'Unknown error'));
    }
    setSyncing(false);
  };

  const allSynced = sequences.length > 0 && sequences.every(s => s.is_synced);

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <Info className="h-4 w-4" />
            What are Message Sequences?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-1">
          <p>Message sequences (Ice Breakers) are pre-set quick-reply buttons shown to users when they first open a chat from a Click-to-WhatsApp (CTWA) ad.</p>
          <p>• WhatsApp allows up to <strong>4 sequences</strong> per phone number.</p>
          <p>• After adding sequences here, click <strong>"Sync to Meta"</strong> to register them.</p>
          <p>• Once synced, they will appear in Meta Ads Manager when creating CTWA ads.</p>
        </CardContent>
      </Card>

      {/* Current Sequences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message Sequences ({sequences.length}/4)
              </CardTitle>
              <CardDescription>Ice breakers registered on this phone number</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSequences} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={syncToMeta} 
                disabled={syncing || sequences.length === 0}
                className={cn(allSynced && "bg-green-600 hover:bg-green-700")}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                {allSynced ? 'Re-sync to Meta' : 'Sync to Meta'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sequences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No message sequences yet</p>
              <p className="text-xs mt-1">Add your first one below</p>
            </div>
          ) : (
            sequences.map((seq, idx) => (
              <div
                key={seq.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs font-mono w-4">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{seq.title}</p>
                  {seq.message !== seq.title && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{seq.message}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {seq.is_synced ? (
                      <Badge variant="secondary" className="text-xs gap-1 bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" /> Synced
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1 bg-amber-100 text-amber-700">
                        <AlertCircle className="h-3 w-3" /> Not synced
                      </Badge>
                    )}
                    {seq.synced_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(seq.synced_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteSequence(seq.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add New */}
      {sequences.length < 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Sequence
            </CardTitle>
            <CardDescription>Create a new ice breaker for this phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Button Title *</Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. I want to place an order"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the text shown on the quick-reply button ({newTitle.length}/80)
              </p>
            </div>
            <div>
              <Label>Auto-reply Context (optional)</Label>
              <Textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Optional context for your automation to handle this intent"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used internally to route the intent. If empty, defaults to the title.
              </p>
            </div>
            <Button onClick={addSequence} disabled={saving || !newTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Add Sequence
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
