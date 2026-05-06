import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Loader2, Save, Settings2, ListChecks, Phone, FileText, Users,
  Tag as TagIcon, CheckCircle2, X, Sparkles, AlertTriangle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Connection {
  id: string;
  advertiser_id: string;
  advertiser_name: string | null;
  status: string;
}

interface PhoneNumber {
  id: string;
  phone_number_id: string;
  display_number: string | null;
  verified_name: string | null;
  status: string | null;
}

interface Template {
  id: string;
  name: string;
  language: string | null;
  status: string | null;
  category: string | null;
}

interface TeamMember {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface FormState {
  id?: string;
  tiktok_connection_id: string;
  advertiser_id: string;
  form_id: string;
  form_name: string;
  whatsapp_phone_number_id: string;
  whatsapp_template_id: string;
  pipeline_id: string;
  stage_id: string;
  assigned_user_id: string;
  tags: string[];
  auto_reply_enabled: boolean;
  sync_enabled: boolean;
  sync_frequency_minutes: number;
}

const EMPTY: FormState = {
  tiktok_connection_id: '',
  advertiser_id: '',
  form_id: '',
  form_name: '',
  whatsapp_phone_number_id: '',
  whatsapp_template_id: '',
  pipeline_id: '',
  stage_id: '',
  assigned_user_id: '',
  tags: [],
  auto_reply_enabled: true,
  sync_enabled: true,
  sync_frequency_minutes: 2,
};

interface Props {
  workspaceId: string;
  connections: Connection[];
  isAdmin: boolean;
}

export function TikTokSyncSettingsForm({ workspaceId, connections, isAdmin }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAnim, setSavedAnim] = useState(false);
  const [phones, setPhones] = useState<PhoneNumber[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [tagInput, setTagInput] = useState('');

  const selectedConnection = useMemo(
    () => connections.find(c => c.id === form.tiktok_connection_id),
    [connections, form.tiktok_connection_id]
  );

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === form.whatsapp_template_id),
    [templates, form.whatsapp_template_id]
  );

  // Load reference data
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);

      const [phonesRes, tmplRes, membersRes, settingsRes] = await Promise.all([
        supabase
          .from('phone_numbers')
          .select('id,phone_number_id,display_number,verified_name,status')
          .eq('tenant_id', workspaceId),
        supabase
          .from('wa_templates')
          .select('id,name,language,status,category,is_archived')
          .eq('workspace_id', workspaceId)
          .eq('is_archived', false),
        supabase
          .from('tenant_members')
          .select('user_id')
          .eq('tenant_id', workspaceId),
        supabase
          .from('tiktok_lead_sync_settings' as any)
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancel) return;

      setPhones((phonesRes.data as any) || []);
      setTemplates((tmplRes.data as any) || []);

      const mems: TeamMember[] = ((membersRes.data as any[]) || []).map((m: any) => ({
        user_id: m.user_id,
        full_name: m.profiles?.full_name ?? null,
        email: m.profiles?.email ?? null,
      }));
      setMembers(mems);

      if (settingsRes?.data) {
        const s: any = settingsRes.data;
        setForm({
          id: s.id,
          tiktok_connection_id: s.tiktok_connection_id || '',
          advertiser_id: s.advertiser_id || '',
          form_id: s.form_id || '',
          form_name: s.form_name || '',
          whatsapp_phone_number_id: s.whatsapp_phone_number_id || '',
          whatsapp_template_id: s.whatsapp_template_id || '',
          pipeline_id: s.pipeline_id || '',
          stage_id: s.stage_id || '',
          assigned_user_id: s.assigned_user_id || '',
          tags: s.tags || [],
          auto_reply_enabled: s.auto_reply_enabled ?? true,
          sync_enabled: s.sync_enabled ?? true,
          sync_frequency_minutes: s.sync_frequency_minutes ?? 2,
        });
      } else if (connections.length === 1) {
        setForm(f => ({
          ...f,
          tiktok_connection_id: connections[0].id,
          advertiser_id: connections[0].advertiser_id,
        }));
      }
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [workspaceId, connections]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) { setTagInput(''); return; }
    update('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => update('tags', form.tags.filter(x => x !== t));

  // Validation
  const approvedTemplate = selectedTemplate?.status?.toLowerCase() === 'approved';
  const phoneConnected = phones.length > 0;
  const tiktokConnected = connections.length > 0;

  const errors: string[] = [];
  if (!tiktokConnected) errors.push('TikTok account is not connected.');
  if (!phoneConnected) errors.push('No WhatsApp number connected to this workspace.');
  if (form.whatsapp_template_id && !approvedTemplate) errors.push('Selected WhatsApp template is not approved.');

  const canSave =
    isAdmin &&
    !!form.tiktok_connection_id &&
    !!form.form_id &&
    !!form.whatsapp_phone_number_id &&
    !!form.whatsapp_template_id &&
    approvedTemplate &&
    phoneConnected &&
    tiktokConnected;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: any = {
        workspace_id: workspaceId,
        tiktok_connection_id: form.tiktok_connection_id,
        advertiser_id: selectedConnection?.advertiser_id || form.advertiser_id,
        form_id: form.form_id.trim(),
        form_name: form.form_name.trim() || null,
        whatsapp_phone_number_id: form.whatsapp_phone_number_id,
        whatsapp_template_id: form.whatsapp_template_id || null,
        pipeline_id: form.pipeline_id || null,
        stage_id: form.stage_id || null,
        assigned_user_id: form.assigned_user_id || null,
        tags: form.tags,
        auto_reply_enabled: form.auto_reply_enabled,
        sync_enabled: form.sync_enabled,
        sync_frequency_minutes: form.sync_frequency_minutes,
      };

      const query = form.id
        ? supabase.from('tiktok_lead_sync_settings' as any).update(payload).eq('id', form.id)
        : supabase.from('tiktok_lead_sync_settings' as any).insert(payload).select().single();

      const { data, error } = await query;
      if (error) throw error;
      if (!form.id && data) setForm(f => ({ ...f, id: (data as any).id }));

      setSavedAnim(true);
      setTimeout(() => setSavedAnim(false), 2200);
      toast({
        title: '✨ TikTok leads connected',
        description: 'TikTok leads are now connected with Aireatro automation.',
      });
    } catch (e: any) {
      toast({
        title: 'Could not save settings',
        description: e?.message || 'Please retry.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!tiktokConnected) {
    return (
      <Card className="rounded-2xl border-dashed border-border/60">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Settings2 className="h-8 w-8 mx-auto mb-3 opacity-60" />
          Connect a TikTok account above to configure lead sync.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm relative overflow-hidden">
      {savedAnim && (
        <div className="absolute inset-0 z-10 bg-emerald-500/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95">
          <div className="bg-background border border-emerald-500/40 rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <div>
              <div className="font-semibold">Saved</div>
              <div className="text-xs text-muted-foreground">TikTok leads now flow into Aireatro.</div>
            </div>
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-primary" />
              Lead Sync & Automation
            </CardTitle>
            <CardDescription>Map a TikTok lead form to a WhatsApp number, template & team.</CardDescription>
          </div>
          {form.id && (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {errors.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* TikTok side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> TikTok Ad Account</Label>
            <Select
              value={form.tiktok_connection_id}
              onValueChange={(v) => {
                const conn = connections.find(c => c.id === v);
                setForm(f => ({ ...f, tiktok_connection_id: v, advertiser_id: conn?.advertiser_id || '' }));
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select advertiser" /></SelectTrigger>
              <SelectContent>
                {connections.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.advertiser_name || 'Advertiser'} · {c.advertiser_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>TikTok Lead Form ID</Label>
            <Input
              placeholder="e.g. 17234234234"
              value={form.form_id}
              onChange={(e) => update('form_id', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Find this in TikTok Ads Manager → Lead Forms.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Lead Form Name (optional)</Label>
            <Input
              placeholder="e.g. Spring Promo Signup"
              value={form.form_name}
              onChange={(e) => update('form_name', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* WhatsApp side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> WhatsApp Number</Label>
            <Select
              value={form.whatsapp_phone_number_id}
              onValueChange={(v) => update('whatsapp_phone_number_id', v)}
              disabled={!phoneConnected}
            >
              <SelectTrigger>
                <SelectValue placeholder={phoneConnected ? 'Select number' : 'No numbers connected'} />
              </SelectTrigger>
              <SelectContent>
                {phones.map(p => (
                  <SelectItem key={p.id} value={p.phone_number_id}>
                    {p.display_number || p.phone_number_id} {p.verified_name ? `· ${p.verified_name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> WhatsApp Template</Label>
            <Select
              value={form.whatsapp_template_id}
              onValueChange={(v) => update('whatsapp_template_id', v)}
            >
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      {t.name}
                      {t.status?.toLowerCase() === 'approved' ? (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">approved</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && !approvedTemplate && (
              <p className="text-xs text-amber-600">This template is not approved by Meta yet.</p>
            )}
          </div>
        </div>

        <Separator />

        {/* CRM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CRM Pipeline</Label>
            <Input
              placeholder="Pipeline name or ID (optional)"
              value={form.pipeline_id}
              onChange={(e) => update('pipeline_id', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Lead Stage</Label>
            <Input
              placeholder="e.g. New / Contacted (optional)"
              value={form.stage_id}
              onChange={(e) => update('stage_id', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Assign Team Member</Label>
            <Select
              value={form.assigned_user_id || 'unassigned'}
              onValueChange={(v) => update('assigned_user_id', v === 'unassigned' ? '' : v)}
            >
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.full_name || m.email || m.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><TagIcon className="h-3.5 w-3.5" /> Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div className="pr-3">
              <div className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Enable Auto Lead Sync
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Pull new leads from TikTok every {form.sync_frequency_minutes} min.</p>
            </div>
            <Switch checked={form.sync_enabled} onCheckedChange={(v) => update('sync_enabled', v)} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div className="pr-3">
              <div className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Enable Auto WhatsApp Reply
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Send the selected template to every new lead instantly.</p>
            </div>
            <Switch checked={form.auto_reply_enabled} onCheckedChange={(v) => update('auto_reply_enabled', v)} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'Changes apply immediately for new TikTok leads.' : 'Only workspace admins can change these settings.'}
          </p>
          <Button
            size="lg"
            disabled={!canSave || saving}
            onClick={handleSave}
            className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white hover:opacity-95 shadow-lg shadow-fuchsia-500/20 min-w-[180px]"
          >
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                    : <><Save className="h-4 w-4 mr-2" /> Save & Activate</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
