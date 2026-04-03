import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { 
  MessageSquare, Clock, Bot, Zap, Plus, Trash2, 
  Sparkles, Shield, AlertTriangle, Settings2, Loader2,
  Brain, Target, Tag, UserPlus, ListChecks, SlidersHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { TestAiReplyModal } from './auto-reply/TestAiReplyModal';

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
  ai_language: string;
  ai_knowledge_base: string;
  ai_response_length: string;
  ai_require_approval: boolean;
  ai_fallback_template: boolean;
  // Advanced AI Bot fields
  qualification_mode: boolean;
  ask_missing_max: number;
  ai_confidence_threshold: number;
  auto_tag_contacts: boolean;
  auto_create_lead: boolean;
  lead_objective: string;
  required_fields_schema: string;
  fallback_template_message: string;
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
  ai_language: 'auto',
  ai_knowledge_base: '',
  ai_response_length: 'medium',
  ai_require_approval: true,
  ai_fallback_template: true,
  qualification_mode: false,
  ask_missing_max: 3,
  ai_confidence_threshold: 0.70,
  auto_tag_contacts: false,
  auto_create_lead: true,
  lead_objective: 'lead_qualification',
  required_fields_schema: '',
  fallback_template_message: 'Thank you for reaching out! One of our team members will get back to you shortly. 🙏',
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
          ai_language: (row as any).ai_language || 'auto',
          ai_knowledge_base: row.ai_knowledge_base || '',
          ai_response_length: row.ai_response_length,
          ai_require_approval: row.ai_require_approval,
          ai_fallback_template: row.ai_fallback_template,
          qualification_mode: row.qualification_mode ?? false,
          ask_missing_max: row.ask_missing_max ?? 3,
          ai_confidence_threshold: Number(row.ai_confidence_threshold ?? 0.70),
          auto_tag_contacts: row.auto_tag_contacts ?? false,
          auto_create_lead: row.auto_create_lead ?? true,
          lead_objective: row.lead_objective ?? 'lead_qualification',
          required_fields_schema: row.required_fields_schema || '',
          fallback_template_message: row.fallback_template_message || '',
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
    setDirty(true);
  };

  // Auto-save with debounce
  const [dirty, setDirty] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dirty || !currentTenant?.id) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
      setDirty(false);
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, data]);

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: currentTenant.id,
        ...data,
        keyword_rules: data.keyword_rules as any,
        ai_knowledge_base: data.ai_knowledge_base || null,
        required_fields_schema: data.required_fields_schema || null,
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
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="general" className="text-xs sm:text-sm py-2">General</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs sm:text-sm py-2">Keywords</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs sm:text-sm py-2">AI Reply</TabsTrigger>
        </TabsList>
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

        {/* AI Auto-Reply Pro */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          {/* Core AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered Auto-Reply
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </CardTitle>
              <CardDescription>
                Train a workspace-level AI bot that qualifies leads, extracts data, and responds contextually.
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

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>AI Tone</Label>
                  <Select value={data.ai_tone} onValueChange={v => update('ai_tone', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="sales">Sales-oriented</SelectItem>
                      <SelectItem value="support">Support-focused</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Response Language</Label>
                  <Select value={data.ai_language} onValueChange={v => update('ai_language', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect (match customer)</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="gujarati">Gujarati (ગુજરાતી)</SelectItem>
                      <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                      <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                      <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                      <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                      <SelectItem value="kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                      <SelectItem value="malayalam">Malayalam (മലയാളം)</SelectItem>
                      <SelectItem value="punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <Select value={data.ai_response_length} onValueChange={v => update('ai_response_length', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                      <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                      <SelectItem value="long">Detailed (4-7 sentences)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  AI Knowledge Base
                </Label>
                <Textarea 
                  value={data.ai_knowledge_base}
                  onChange={e => update('ai_knowledge_base', e.target.value)}
                  placeholder="Paste your FAQ, product info, pricing, or custom instructions for the AI to reference when generating replies..."
                  className="min-h-[140px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  The AI will use this context to generate accurate, brand-consistent replies. Include pricing, product details, and common Q&A.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced AI Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Advanced AI Controls
              </CardTitle>
              <CardDescription>Fine-tune AI behavior, lead qualification, and confidence thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Qualification Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-primary" />
                    Qualification Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">AI asks step-by-step questions to qualify the lead</p>
                </div>
                <Switch checked={data.qualification_mode} onCheckedChange={v => update('qualification_mode', v)} />
              </div>

              {/* Ask Missing up to N times */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ask Missing Question (max retries)</Label>
                  <p className="text-xs text-muted-foreground">Re-ask unanswered questions up to this many times</p>
                </div>
                <Select value={String(data.ask_missing_max)} onValueChange={v => update('ask_missing_max', Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                    <SelectItem value="5">5 times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Confidence Threshold</Label>
                    <p className="text-xs text-muted-foreground">Below this, AI falls back to template message</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {(data.ai_confidence_threshold * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Slider
                  value={[data.ai_confidence_threshold * 100]}
                  onValueChange={v => update('ai_confidence_threshold', v[0] / 100)}
                  min={55}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>55% (More replies)</span>
                  <span>90% (Safer)</span>
                </div>
              </div>

              <Separator />

              {/* Lead Objective */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Lead Objective
                </Label>
                <Select value={data.lead_objective} onValueChange={v => update('lead_objective', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_qualification">Lead Qualification</SelectItem>
                    <SelectItem value="sales_enquiry">Sales Enquiry</SelectItem>
                    <SelectItem value="support_ticket">Support Ticket</SelectItem>
                    <SelectItem value="booking">Booking / Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-Tag Contacts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    Auto-Tag Contacts
                  </Label>
                  <p className="text-xs text-muted-foreground">AI assigns tags based on detected intent</p>
                </div>
                <Switch checked={data.auto_tag_contacts} onCheckedChange={v => update('auto_tag_contacts', v)} />
              </div>

              {/* Auto-Create Lead */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    Auto-Create Qualified Lead
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically create a lead record when qualification is complete</p>
                </div>
                <Switch checked={data.auto_create_lead} onCheckedChange={v => update('auto_create_lead', v)} />
              </div>

              {/* Required Fields Schema */}
              <div className="space-y-2">
                <Label>Required Fields Schema</Label>
                <Textarea 
                  value={data.required_fields_schema}
                  onChange={e => update('required_fields_schema', e.target.value)}
                  placeholder={'{\n  "name": "string",\n  "email": "email",\n  "company": "string",\n  "team_size": "number",\n  "budget": "string"\n}'}
                  className="min-h-[100px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  JSON-style schema of fields the AI should collect during qualification.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety & Fallbacks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Safety & Fallbacks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
                  <p className="text-xs text-muted-foreground">Use template message if AI confidence is below threshold</p>
                </div>
                <Switch checked={data.ai_fallback_template} onCheckedChange={v => update('ai_fallback_template', v)} />
              </div>

              <div className="space-y-2">
                <Label>Fallback Template Message</Label>
                <Textarea 
                  value={data.fallback_template_message}
                  onChange={e => update('fallback_template_message', e.target.value)}
                  placeholder="Thank you for reaching out! One of our team members will get back to you shortly. 🙏"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Sent when AI confidence is too low. Variables: {'{{name}}'}, {'{{company}}'}
                </p>
              </div>

              <Card className="bg-accent/30 border-accent/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Safety Note</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        AI auto-replies are generated based on your knowledge base and conversation context. 
                        We recommend enabling "Require Agent Approval" and setting a high confidence threshold for regulated industries.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Test Modal */}
          {currentTenant?.id && (
            <div className="flex justify-start">
              <TestAiReplyModal tenantId={currentTenant.id} />
            </div>
          )}
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
