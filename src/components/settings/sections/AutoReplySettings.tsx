import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, Clock, Bot, Zap, Plus, Trash2, 
  Sparkles, Shield, AlertTriangle, Settings2, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface KeywordRule {
  id: string;
  keywords: string;
  response: string;
  matchType: 'exact' | 'contains' | 'regex';
}

interface AutoReplyData {
  business_hours_enabled: boolean;
  business_hours_message: string;
  after_hours_enabled: boolean;
  after_hours_message: string;
  business_hours_start: string;
  business_hours_end: string;
  timezone: string;
  first_message_only: boolean;
  cooldown_hours: number;
  delay_seconds: number;
  exclude_assigned: boolean;
  keywords_enabled: boolean;
  keyword_rules: KeywordRule[];
  ai_enabled: boolean;
  ai_tone: string;
  ai_knowledge_base: string;
  ai_response_length: string;
  ai_require_approval: boolean;
  ai_fallback_template: boolean;
}

const DEFAULTS: AutoReplyData = {
  business_hours_enabled: true,
  business_hours_message: "Thank you for contacting us! We've received your message and will respond shortly. ⏱️",
  after_hours_enabled: true,
  after_hours_message: "Thanks for reaching out! We're currently offline. Our business hours are Mon-Fri 9AM-6PM. We'll get back to you as soon as we're back! 🌙",
  business_hours_start: '09:00',
  business_hours_end: '18:00',
  timezone: 'UTC+5.5',
  first_message_only: true,
  cooldown_hours: 24,
  delay_seconds: 3,
  exclude_assigned: true,
  keywords_enabled: false,
  keyword_rules: [],
  ai_enabled: false,
  ai_tone: 'professional',
  ai_knowledge_base: '',
  ai_response_length: 'medium',
  ai_require_approval: true,
  ai_fallback_template: true,
};

export function AutoReplySettings() {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AutoReplyData>(DEFAULTS);
  const [existingId, setExistingId] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    try {
      const { data: row, error } = await (supabase as any)
        .from('auto_reply_settings')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();

      if (error) throw error;

      if (row) {
        setExistingId(row.id);
        setData({
          business_hours_enabled: row.business_hours_enabled,
          business_hours_message: row.business_hours_message,
          after_hours_enabled: row.after_hours_enabled,
          after_hours_message: row.after_hours_message,
          business_hours_start: row.business_hours_start,
          business_hours_end: row.business_hours_end,
          timezone: row.timezone,
          first_message_only: row.first_message_only,
          cooldown_hours: row.cooldown_hours,
          delay_seconds: row.delay_seconds,
          exclude_assigned: row.exclude_assigned,
          keywords_enabled: row.keywords_enabled,
          keyword_rules: (row.keyword_rules as KeywordRule[]) || [],
          ai_enabled: row.ai_enabled,
          ai_tone: row.ai_tone,
          ai_knowledge_base: row.ai_knowledge_base || '',
          ai_response_length: row.ai_response_length,
          ai_require_approval: row.ai_require_approval,
          ai_fallback_template: row.ai_fallback_template,
        });
      }
    } catch (err: any) {
      console.error('Error fetching auto-reply settings:', err);
      toast.error('Failed to load auto-reply settings');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = <K extends keyof AutoReplyData>(key: K, value: AutoReplyData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: currentTenant.id,
        ...data,
        keyword_rules: data.keyword_rules as any,
        ai_knowledge_base: data.ai_knowledge_base || null,
      };

      let error: any;
      if (existingId) {
        const res = await (supabase as any)
          .from('auto_reply_settings')
          .update(payload)
          .eq('id', existingId);
        error = res.error;
      } else {
        const res = await (supabase as any)
          .from('auto_reply_settings')
          .insert(payload)
          .select('id')
          .single();
        error = res.error;
        if (!error && res.data) setExistingId(res.data.id);
      }

      if (error) throw error;
      toast.success('Auto-reply settings saved');
    } catch (err: any) {
      console.error('Error saving auto-reply settings:', err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Keyword helpers
  const addKeywordRule = () => {
    update('keyword_rules', [
      ...data.keyword_rules,
      { id: Date.now().toString(), keywords: '', response: '', matchType: 'contains' }
    ]);
  };

  const removeKeywordRule = (id: string) => {
    update('keyword_rules', data.keyword_rules.filter(r => r.id !== id));
  };

  const updateKeywordRule = (id: string, field: keyof KeywordRule, value: string) => {
    update('keyword_rules', data.keyword_rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          Auto-Reply
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automatic responses for incoming messages across different scenarios.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="ai">AI Auto-Reply</TabsTrigger>
        </TabsList>

        {/* General Auto-Reply */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Business Hours Auto-Reply
              </CardTitle>
              <CardDescription>Send automatic replies based on your business hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Business Hours Reply</Label>
                  <p className="text-xs text-muted-foreground">Auto-respond when you're available</p>
                </div>
                <Switch checked={data.business_hours_enabled} onCheckedChange={v => update('business_hours_enabled', v)} />
              </div>

              <div className="space-y-2">
                <Label>During Business Hours Message</Label>
                <Textarea 
                  value={data.business_hours_message}
                  onChange={e => update('business_hours_message', e.target.value)}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {'{{name}}'}, {'{{company}}'}, {'{{agent_name}}'}
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable After-Hours Reply</Label>
                  <p className="text-xs text-muted-foreground">Auto-respond outside business hours</p>
                </div>
                <Switch checked={data.after_hours_enabled} onCheckedChange={v => update('after_hours_enabled', v)} />
              </div>

              <div className="space-y-2">
                <Label>After-Hours Message</Label>
                <Textarea 
                  value={data.after_hours_message}
                  onChange={e => update('after_hours_message', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Hours Start</Label>
                  <Select value={data.business_hours_start} onValueChange={v => update('business_hours_start', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['07:00', '08:00', '09:00', '10:00', '11:00'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Hours End</Label>
                  <Select value={data.business_hours_end} onValueChange={v => update('business_hours_end', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={data.timezone} onValueChange={v => update('timezone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                    <SelectItem value="UTC+1">UTC+1 (Paris)</SelectItem>
                    <SelectItem value="UTC+3">UTC+3 (Dubai)</SelectItem>
                    <SelectItem value="UTC+5.5">UTC+5:30 (Mumbai)</SelectItem>
                    <SelectItem value="UTC+8">UTC+8 (Singapore)</SelectItem>
                    <SelectItem value="UTC-5">UTC-5 (New York)</SelectItem>
                    <SelectItem value="UTC-8">UTC-8 (Los Angeles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4 text-primary" />
                Advanced Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>First Message Only</Label>
                  <p className="text-xs text-muted-foreground">Only auto-reply to the first message in a conversation</p>
                </div>
                <Switch checked={data.first_message_only} onCheckedChange={v => update('first_message_only', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cooldown Period</Label>
                  <p className="text-xs text-muted-foreground">Don't re-send auto-reply within this window</p>
                </div>
                <Select value={String(data.cooldown_hours)} onValueChange={v => update('cooldown_hours', Number(v))}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Delay Before Sending</Label>
                  <p className="text-xs text-muted-foreground">Wait before sending auto-reply (feels more natural)</p>
                </div>
                <Select value={String(data.delay_seconds)} onValueChange={v => update('delay_seconds', Number(v))}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Instant</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exclude Assigned Conversations</Label>
                  <p className="text-xs text-muted-foreground">Don't auto-reply if an agent is already assigned</p>
                </div>
                <Switch checked={data.exclude_assigned} onCheckedChange={v => update('exclude_assigned', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyword Auto-Reply */}
        <TabsContent value="keywords" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Keyword-Based Auto-Reply
              </CardTitle>
              <CardDescription>
                Trigger specific replies based on keywords in customer messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Keyword Replies</Label>
                  <p className="text-xs text-muted-foreground">Automatically respond based on message content</p>
                </div>
                <Switch checked={data.keywords_enabled} onCheckedChange={v => update('keywords_enabled', v)} />
              </div>

              <Separator />

              <div className="space-y-3">
                {data.keyword_rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl border border-border/50 hover:border-border transition-colors space-y-3">
                    <div className="flex items-center gap-2">
                      <Select 
                        value={rule.matchType}
                        onValueChange={v => updateKeywordRule(rule.id, 'matchType', v)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exact">Exact match</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="regex">Regex</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1" />
                      <Button 
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => removeKeywordRule(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input 
                        value={rule.keywords}
                        onChange={e => updateKeywordRule(rule.id, 'keywords', e.target.value)}
                        placeholder="Keywords (comma-separated): hello, hi, hey"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea 
                        value={rule.response}
                        onChange={e => updateKeywordRule(rule.id, 'response', e.target.value)}
                        placeholder="Auto-reply message..."
                        className="min-h-[60px] text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2" onClick={addKeywordRule}>
                <Plus className="h-4 w-4" /> Add Keyword Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Auto-Reply */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered Auto-Reply
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </CardTitle>
              <CardDescription>
                Use AI to generate contextual automatic responses based on conversation history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Auto-Reply</Label>
                  <p className="text-xs text-muted-foreground">Let AI compose responses automatically</p>
                </div>
                <Switch checked={data.ai_enabled} onCheckedChange={v => update('ai_enabled', v)} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>AI Tone</Label>
                <Select value={data.ai_tone} onValueChange={v => update('ai_tone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly & Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="sales">Sales-oriented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AI Knowledge Base</Label>
                <Textarea 
                  value={data.ai_knowledge_base}
                  onChange={e => update('ai_knowledge_base', e.target.value)}
                  placeholder="Paste your FAQ, product info, or custom instructions for the AI to reference when generating replies..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  The AI will use this context to generate accurate, brand-consistent replies.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Response Length</Label>
                <Select value={data.ai_response_length} onValueChange={v => update('ai_response_length', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                    <SelectItem value="long">Detailed (4+ sentences)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Agent Approval</Label>
                  <p className="text-xs text-muted-foreground">AI drafts a reply but agent must approve before sending</p>
                </div>
                <Switch checked={data.ai_require_approval} onCheckedChange={v => update('ai_require_approval', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fallback to Template</Label>
                  <p className="text-xs text-muted-foreground">Use a template if AI confidence is low</p>
                </div>
                <Switch checked={data.ai_fallback_template} onCheckedChange={v => update('ai_fallback_template', v)} />
              </div>

              <Card className="bg-amber-50/50 border-amber-200/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Safety Note</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        AI auto-replies are generated based on your knowledge base and conversation context. 
                        We recommend enabling "Require Agent Approval" to review responses before they're sent.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Auto-Reply Settings'}
        </Button>
      </div>
    </div>
  );
}
