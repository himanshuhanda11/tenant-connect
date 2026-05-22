import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string | null;
  templateName?: string | null;
  introMessage?: string;
  variables?: Record<string, any>;
  builderFields?: any[];
}

export function FormPreviewDialog({ open, onOpenChange, templateId, templateName, introMessage, variables, builderFields }: Props) {
  const { currentTenant } = useTenant();
  const [template, setTemplate] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sendStatus, setSendStatus] = React.useState<'idle' | 'ok' | 'fail'>('idle');
  const [sendDetail, setSendDetail] = React.useState<string>('');

  React.useEffect(() => {
    if (!open || !templateId) return;
    setLoading(true);
    (supabase as any)
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle()
      .then(({ data }: any) => { setTemplate(data); setLoading(false); });
  }, [open, templateId]);

  const sendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Enter a phone number first');
      return;
    }
    setSending(true);
    setSendStatus('idle');
    try {
      const { data, error } = await supabase.functions.invoke('send-template-message', {
        body: {
          tenant_id: currentTenant?.id,
          to: testPhone.trim(),
          template_name: template?.name || templateName,
          language: template?.language || 'en',
          variables: variables || {},
          intro_message: introMessage || undefined,
        },
      });
      if (error) throw error;
      setSendStatus('ok');
      setSendDetail(`Sent. Message ID: ${(data as any)?.message_id || 'queued'}`);
      toast.success('Test message sent');
    } catch (e: any) {
      setSendStatus('fail');
      setSendDetail(e?.message || 'Failed to send test message');
      toast.error('Failed to send test', { description: e?.message });
    } finally {
      setSending(false);
    }
  };

  const bodyText: string = template?.body_text || template?.components?.find?.((c: any) => c.type === 'BODY')?.text || '';
  const filledBody = bodyText.replace(/\{\{(\d+)\}\}/g, (_, n) => (variables?.[`${n}`] || variables?.[n] || `{{${n}}}`));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="w-4 h-4 text-primary" /> Form Preview & Live Test
          </DialogTitle>
          <DialogDescription className="text-xs">
            See exactly what the contact will receive, and send a real test to your own phone.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid grid-cols-2 mx-5 mt-3">
            <TabsTrigger value="preview"><Eye className="w-3.5 h-3.5 mr-1.5" /> Preview</TabsTrigger>
            <TabsTrigger value="test"><Send className="w-3.5 h-3.5 mr-1.5" /> Live Test</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading template…
              </div>
            ) : !template && !templateName && !(builderFields && builderFields.length) ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No template selected yet. Pick a template or add fields in the Form step.
              </div>
            ) : builderFields && builderFields.length > 0 && !template ? (
              <div className="rounded-2xl bg-[#0b1f1c]/5 dark:bg-[#0b1f1c] p-4">
                <div className="mx-auto max-w-[320px] space-y-2">
                  {introMessage && (
                    <div className="ml-auto max-w-[85%] bg-[hsl(152,42%,52%)] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm shadow-sm whitespace-pre-wrap">
                      {introMessage}
                    </div>
                  )}
                  <div className="ml-auto max-w-[90%] bg-background dark:bg-muted rounded-2xl rounded-tr-sm px-3 py-3 text-sm shadow-sm border border-border space-y-2">
                    <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      {templateName || 'Your Form'}
                    </div>
                    {builderFields.map((f: any, i: number) => (
                      <div key={f.id || i} className="space-y-0.5">
                        <div className="text-xs font-medium">
                          {f.label || `Field ${i + 1}`}
                          {f.required && <span className="text-destructive ml-0.5">*</span>}
                        </div>
                        <div className="h-7 rounded-md bg-muted/60 border border-border/60 px-2 text-[11px] text-muted-foreground flex items-center">
                          {f.placeholder || (f.type === 'select' ? 'Select an option…' : `Enter ${f.label?.toLowerCase() || 'value'}…`)}
                        </div>
                      </div>
                    ))}
                    <button className="w-full mt-1 bg-[hsl(152,42%,52%)] text-white rounded-md text-xs py-1.5 font-medium">
                      Submit
                    </button>
                  </div>
                </div>
                <div className="text-center mt-3 text-[10px] text-muted-foreground">
                  WhatsApp-style form preview ({builderFields.length} field{builderFields.length === 1 ? '' : 's'})
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0b1f1c]/5 dark:bg-[#0b1f1c] p-4">
                <div className="mx-auto max-w-[300px] space-y-2">
                  {introMessage && (
                    <div className="ml-auto max-w-[80%] bg-[hsl(152,42%,52%)]/15 dark:bg-[hsl(152,42%,32%)] text-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm">
                      {introMessage}
                    </div>
                  )}
                  <div className="ml-auto max-w-[85%] bg-[hsl(152,42%,52%)] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm shadow-sm whitespace-pre-wrap">
                    {filledBody || `Template "${templateName || template?.name}" body will appear here.`}
                  </div>
                  <div className="ml-auto max-w-[85%] flex flex-col gap-1.5">
                    <button className="bg-background dark:bg-muted rounded-xl text-xs py-2 px-3 text-primary font-medium shadow-sm border border-border">
                      Open Form ›
                    </button>
                  </div>
                </div>
                <div className="text-center mt-3 text-[10px] text-muted-foreground">
                  WhatsApp-style preview
                </div>
              </div>
            )}
            {template && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">{template.category || 'UTILITY'}</Badge>
                <Badge variant="outline" className="text-[10px]">{template.language || 'en'}</Badge>
                <Badge variant="outline" className="text-[10px]">{template.status || 'APPROVED'}</Badge>
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="px-5 py-4 space-y-3">
            <div>
              <Label className="text-sm font-semibold">Your test phone number</Label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 98xxxxxxxx (include country code)"
                className="mt-1.5 h-10"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                We'll send this template right now using your live WhatsApp number. Real credits / template charges apply.
              </p>
            </div>
            <Button onClick={sendTest} disabled={sending || !testPhone.trim()} className="w-full h-10">
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send test now</>}
            </Button>
            {sendStatus === 'ok' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-300 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>{sendDetail}</div>
              </div>
            )}
            {sendStatus === 'fail' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>{sendDetail}</div>
              </div>
            )}
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              Use a phone you own and that has chatted with this number before — required for non-marketing templates.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
