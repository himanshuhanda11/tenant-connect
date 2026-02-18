import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FlaskConical, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestAiReplyModalProps {
  tenantId: string;
}

export function TestAiReplyModal({ tenantId }: TestAiReplyModalProps) {
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reply: string; extractedLead: Record<string, any> | null; confidence: number } | null>(null);

  const handleTest = async () => {
    if (!userMessage.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-reply', {
        body: { tenant_id: tenantId, message: userMessage.trim() },
      });
      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error('Test AI reply error:', err);
      toast.error(err.message || 'Failed to run test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FlaskConical className="h-4 w-4" />
          Test AI Reply
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Test AI Auto-Reply
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Simulate Customer Message</Label>
            <Textarea
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              placeholder="e.g. Hi, I'm interested in your premium plan for my team of 20 people"
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={handleTest} disabled={loading || !userMessage.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            {loading ? 'Generating…' : 'Run Test'}
          </Button>

          {result && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              {/* AI Response */}
              <div className="rounded-xl border border-border/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">AI Response</Badge>
                  <Badge variant={result.confidence >= 0.7 ? 'default' : 'destructive'} className="text-xs">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.reply}</p>
              </div>

              {/* Extracted Lead */}
              {result.extractedLead && Object.keys(result.extractedLead).length > 0 && (
                <div className="rounded-xl border border-border/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">Extracted Lead Data</span>
                  </div>
                  <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(result.extractedLead, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
