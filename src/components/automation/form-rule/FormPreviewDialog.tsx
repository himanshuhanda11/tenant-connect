import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, MessageSquare, Loader2, CheckCircle2, AlertCircle, CheckCheck, Image as ImageIcon, FileText, Video } from 'lucide-react';
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

function parseComponents(template: any) {
  const comps: any[] = template?.components_json || template?.components || [];
  const header = comps.find?.((c: any) => c.type === 'HEADER');
  const body = comps.find?.((c: any) => c.type === 'BODY');
  const footer = comps.find?.((c: any) => c.type === 'FOOTER');
  const buttonsComp = comps.find?.((c: any) => c.type === 'BUTTONS');
  return {
    header,
    bodyText: body?.text || template?.body_text || '',
    footerText: footer?.text || '',
    buttons: buttonsComp?.buttons || [],
  };
}

function fillVars(text: string, vars: Record<string, any> = {}) {
  if (!text) return '';
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => {
    const v = vars[`${n}`] ?? vars[n];
    return v !== undefined && v !== '' ? String(v) : `{{${n}}}`;
  });
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
    if (!open) return;
    if (!templateId) { setTemplate(null); return; }
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

  const { header, bodyText, footerText, buttons } = parseComponents(template);
  const filledBody = fillVars(bodyText, variables);
  const filledHeaderText = header?.format === 'TEXT' ? fillVars(header.text || '', variables) : '';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const hasTemplate = !!template;
  const hasBuilder = !!(builderFields && builderFields.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="w-4 h-4 text-primary" /> Form Preview & Live Test
          </DialogTitle>
          <DialogDescription className="text-xs">
            See exactly what the contact will receive, and send a real test to your own phone.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full flex-1 overflow-y-auto">
          <TabsList className="grid grid-cols-2 mx-5 mt-3">
            <TabsTrigger value="preview"><Eye className="w-3.5 h-3.5 mr-1.5" /> Preview</TabsTrigger>
            <TabsTrigger value="test"><Send className="w-3.5 h-3.5 mr-1.5" /> Live Test</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="px-5 py-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading template…
              </div>
            ) : !hasTemplate && !hasBuilder ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No template or form selected yet. Pick a template or add fields in the Form step.
              </div>
            ) : (
              <div className="rounded-2xl bg-[#e5ddd5] dark:bg-[#0b1f1c] p-4"
                   style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
                <div className="mx-auto max-w-[320px] space-y-2">
                  {introMessage && (
                    <div className="ml-auto max-w-[88%] bg-[#dcf8c6] dark:bg-[hsl(152,42%,32%)] text-foreground dark:text-white rounded-lg rounded-tr-sm px-2.5 py-1.5 text-[13px] shadow-sm whitespace-pre-wrap">
                      {introMessage}
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        <span>{time}</span><CheckCheck className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  {hasTemplate && (
                    <div className="ml-auto max-w-[92%] bg-[#dcf8c6] dark:bg-[hsl(152,42%,32%)] text-foreground dark:text-white rounded-lg rounded-tr-sm shadow-sm overflow-hidden">
                      {header && header.format !== 'TEXT' && (
                        <div className="bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center text-muted-foreground">
                          {header.format === 'IMAGE' && <ImageIcon className="w-8 h-8" />}
                          {header.format === 'VIDEO' && <Video className="w-8 h-8" />}
                          {header.format === 'DOCUMENT' && <FileText className="w-8 h-8" />}
                        </div>
                      )}
                      <div className="px-2.5 py-1.5 space-y-1">
                        {filledHeaderText && (
                          <div className="font-semibold text-[13px]">{filledHeaderText}</div>
                        )}
                        <div className="text-[13px] whitespace-pre-wrap leading-snug">
                          {filledBody || <span className="italic text-muted-foreground">No body text on this template.</span>}
                        </div>
                        {footerText && (
                          <div className="text-[11px] text-muted-foreground pt-0.5">{footerText}</div>
                        )}
                        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                          <span>{time}</span><CheckCheck className="w-3 h-3" />
                        </div>
                      </div>
                      {buttons.length > 0 && (
                        <div className="border-t border-black/10 dark:border-white/10 bg-background/60 dark:bg-black/20">
                          {buttons.map((b: any, i: number) => (
                            <button key={i} className="w-full py-2 text-[13px] text-[#1d9bd1] font-medium border-b last:border-b-0 border-black/5 dark:border-white/5">
                              {b.text || b.title || 'Button'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {hasBuilder && (
                    <div className="ml-auto max-w-[92%] bg-background dark:bg-muted rounded-lg rounded-tr-sm shadow-sm border border-border/60 overflow-hidden">
                      <div className="px-3 py-2 border-b border-border/60 bg-muted/40">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Form</div>
                        <div className="text-[13px] font-semibold">{templateName || 'Your Form'}</div>
                      </div>
                      <div className="p-3 space-y-2.5">
                        {builderFields!.map((f: any, i: number) => (
                          <div key={f.id || i} className="space-y-1">
                            <div className="text-[11px] font-medium">
                              {f.label || `Field ${i + 1}`}
                              {f.required && <span className="text-destructive ml-0.5">*</span>}
                            </div>
                            {f.type === 'textarea' ? (
                              <div className="h-12 rounded-md bg-muted/60 border border-border/60 px-2 py-1 text-[11px] text-muted-foreground">
                                {f.placeholder || `Enter ${f.label?.toLowerCase() || 'value'}…`}
                              </div>
                            ) : f.type === 'select' ? (
                              <div className="h-7 rounded-md bg-muted/60 border border-border/60 px-2 text-[11px] text-muted-foreground flex items-center justify-between">
                                <span>{f.placeholder || 'Select an option…'}</span>
                                <span>▾</span>
                              </div>
                            ) : (
                              <div className="h-7 rounded-md bg-muted/60 border border-border/60 px-2 text-[11px] text-muted-foreground flex items-center">
                                {f.placeholder || `Enter ${f.label?.toLowerCase() || 'value'}…`}
                              </div>
                            )}
                          </div>
                        ))}
                        <button className="w-full mt-1 bg-[hsl(152,42%,42%)] text-white rounded-md text-[12px] py-1.5 font-medium">
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-3 text-[10px] text-muted-foreground">
                  WhatsApp-style preview
                </div>
              </div>
            )}
            {template && (
              <div className="flex flex-wrap gap-1.5">
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
