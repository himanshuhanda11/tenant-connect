import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Sparkles, Palette, MessageSquare, Settings2, Users, Wand2, Bell, Type, ShieldCheck } from 'lucide-react';
import type { Widget, WidgetAgent, WidgetConfig, WidgetType } from '@/types/widget';

interface Props {
  widget: Widget;
  agents: WidgetAgent[];
  onChange: (patch: Partial<Pick<Widget, 'name' | 'whatsapp_number'>> & { config?: WidgetConfig }) => void;
  onAgentSave: (a: Partial<WidgetAgent>) => void;
  onAgentDelete: (id: string) => void;
}

const TYPES: { value: WidgetType; label: string; desc: string }[] = [
  { value: 'floating-bubble', label: 'Floating Bubble', desc: 'Classic chat button' },
  { value: 'full-popup', label: 'Full Chat Popup', desc: 'Always-open card' },
  { value: 'agent-bubble', label: 'Agent Bubble', desc: 'Single agent personalization' },
  { value: 'multi-agent', label: 'Multi-Agent', desc: 'Pick from team list' },
  { value: 'minimal-icon', label: 'Minimal Icon', desc: 'Tiny floating icon only' },
  { value: 'sticky-bar', label: 'Sticky Bottom Bar', desc: 'Full-width bottom CTA' },
];

export function WidgetBuilderControls({ widget, agents, onChange, onAgentSave, onAgentDelete }: Props) {
  const [draft, setDraft] = useState<WidgetConfig>(widget.config || {});
  const [name, setName] = useState(widget.name);
  const [whats, setWhats] = useState(widget.whatsapp_number ?? '');

  useEffect(() => { setDraft(widget.config || {}); setName(widget.name); setWhats(widget.whatsapp_number ?? ''); }, [widget.id]);

  function patch(p: Partial<WidgetConfig>) {
    const next = { ...draft, ...p };
    setDraft(next);
    onChange({ config: next });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-card/60 backdrop-blur border-border/50">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Widget identity</Label>
        <Input value={name} onChange={e => setName(e.target.value)} onBlur={() => onChange({ name })} placeholder="Widget name" />
        <Input value={whats} onChange={e => setWhats(e.target.value)} onBlur={() => onChange({ whatsapp_number: whats })} placeholder="WhatsApp number e.g. +14155551234" />
      </Card>

      <Tabs defaultValue="type" className="w-full">
        <TabsList className="grid grid-cols-5 h-auto bg-muted/40 p-1">
          <TabsTrigger value="type" className="text-[11px] gap-1"><Sparkles className="h-3 w-3" />Type</TabsTrigger>
          <TabsTrigger value="brand" className="text-[11px] gap-1"><Palette className="h-3 w-3" />Brand</TabsTrigger>
          <TabsTrigger value="msg" className="text-[11px] gap-1"><MessageSquare className="h-3 w-3" />Message</TabsTrigger>
          <TabsTrigger value="behavior" className="text-[11px] gap-1"><Wand2 className="h-3 w-3" />Behavior</TabsTrigger>
          <TabsTrigger value="advanced" className="text-[11px] gap-1"><Settings2 className="h-3 w-3" />More</TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="space-y-2 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => patch({ type: t.value })}
                className={`text-left p-3 rounded-xl border transition-all ${
                  draft.type === t.value
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border/50 hover:border-primary/50 bg-card/50'
                }`}
              >
                <div className="text-sm font-semibold">{t.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-3 pt-3">
          <Row label="Primary color">
            <input type="color" className="h-9 w-16 rounded border border-border" value={draft.primaryColor || '#10B981'} onChange={e => patch({ primaryColor: e.target.value })} />
            <Input className="flex-1" value={draft.primaryColor || ''} onChange={e => patch({ primaryColor: e.target.value })} />
          </Row>
          <Row label="Accent color">
            <input type="color" className="h-9 w-16 rounded border border-border" value={draft.accentColor || '#059669'} onChange={e => patch({ accentColor: e.target.value })} />
            <Input className="flex-1" value={draft.accentColor || ''} onChange={e => patch({ accentColor: e.target.value })} />
          </Row>
          <Row label="Background">
            <input type="color" className="h-9 w-16 rounded border border-border" value={draft.bgColor || '#ffffff'} onChange={e => patch({ bgColor: e.target.value })} />
            <Input className="flex-1" value={draft.bgColor || ''} onChange={e => patch({ bgColor: e.target.value })} />
          </Row>
          <Row label="Text">
            <input type="color" className="h-9 w-16 rounded border border-border" value={draft.textColor || '#0f172a'} onChange={e => patch({ textColor: e.target.value })} />
            <Input className="flex-1" value={draft.textColor || ''} onChange={e => patch({ textColor: e.target.value })} />
          </Row>
          <div>
            <Label className="text-xs">Border radius: {draft.radius ?? 20}px</Label>
            <Slider min={0} max={40} step={1} value={[draft.radius ?? 20]} onValueChange={([v]) => patch({ radius: v })} className="mt-2" />
          </div>
          <Row label="Logo URL">
            <Input className="flex-1" value={draft.logoUrl || ''} placeholder="https://..." onChange={e => patch({ logoUrl: e.target.value })} />
          </Row>
          <Toggle label="Dark mode widget" value={!!draft.darkMode} onChange={v => patch({ darkMode: v })} />
        </TabsContent>

        <TabsContent value="msg" className="space-y-3 pt-3">
          <div><Label className="text-xs">Brand name</Label><Input value={draft.brandName || ''} onChange={e => patch({ brandName: e.target.value })} /></div>
          <div><Label className="text-xs">Subtitle</Label><Input value={draft.subtitle || ''} onChange={e => patch({ subtitle: e.target.value })} /></div>
          <div><Label className="text-xs">Greeting message</Label><Textarea rows={3} value={draft.greeting || ''} onChange={e => patch({ greeting: e.target.value })} /></div>
          <div><Label className="text-xs">CTA button text</Label><Input value={draft.ctaText || ''} onChange={e => patch({ ctaText: e.target.value })} /></div>
          <div><Label className="text-xs">Pre-filled WhatsApp message</Label><Input value={draft.prefilledMessage || ''} onChange={e => patch({ prefilledMessage: e.target.value })} /></div>
          <Toggle label="Show typing indicator" value={!!draft.showTyping} onChange={v => patch({ showTyping: v })} />
          <Toggle label="Show as online" value={draft.online !== false} onChange={v => patch({ online: v })} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-3 pt-3">
          <Row label="Position">
            <Select value={draft.position || 'bottom-right'} onValueChange={(v: any) => patch({ position: v })}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Visible on">
            <Select value={draft.visibility || 'both'} onValueChange={(v: any) => patch({ visibility: v })}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Desktop & Mobile</SelectItem>
                <SelectItem value="desktop">Desktop only</SelectItem>
                <SelectItem value="mobile">Mobile only</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Animation">
            <Select value={draft.animation || 'pulse'} onValueChange={(v: any) => patch({ animation: v })}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pulse">Pulse</SelectItem>
                <SelectItem value="glow">Glow</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
                <SelectItem value="float">Float</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <div>
            <Label className="text-xs">Auto-open delay (seconds)</Label>
            <Slider min={0} max={30} step={1} value={[draft.openDelay ?? 0]} onValueChange={([v]) => patch({ openDelay: v })} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">{draft.openDelay ?? 0}s</div>
          </div>
          <Toggle label="Auto-open after delay" value={!!draft.autoOpen} onChange={v => patch({ autoOpen: v })} />
          <Toggle label="Open on exit intent" value={!!draft.exitIntent} onChange={v => patch({ exitIntent: v })} />
          <div>
            <Label className="text-xs">Open after scroll % (0 = off)</Label>
            <Slider min={0} max={100} step={5} value={[draft.scrollTrigger ?? 0]} onValueChange={([v]) => patch({ scrollTrigger: v })} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">{draft.scrollTrigger ?? 0}%</div>
          </div>
          <div><Label className="text-xs">Show only on these paths (comma separated, e.g. /pricing,/contact)</Label>
            <Input value={(draft.includePaths || []).join(',')} onChange={e => patch({ includePaths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="/" />
          </div>
          <div><Label className="text-xs">Hide on these paths</Label>
            <Input value={(draft.excludePaths || []).join(',')} onChange={e => patch({ excludePaths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="/admin" />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-3">
          <Card className="p-3 space-y-2 bg-card/60">
            <div className="flex items-center gap-2 text-sm font-semibold"><Type className="h-4 w-4" /> Lead capture form</div>
            <Toggle label="Collect lead before WhatsApp" value={!!draft.collectLead} onChange={v => patch({ collectLead: v })} />
            <Toggle label="Show name field" value={draft.fieldName !== false} onChange={v => patch({ fieldName: v })} />
            <Toggle label="Show phone field" value={draft.fieldPhone !== false} onChange={v => patch({ fieldPhone: v })} />
            <Toggle label="Show email field" value={!!draft.fieldEmail} onChange={v => patch({ fieldEmail: v })} />
          </Card>

          <Card className="p-3 space-y-2 bg-card/60">
            <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4" /> Agents (multi-agent widget)</div>
            <p className="text-xs text-muted-foreground">Configured agents appear when widget type is Multi-Agent.</p>
            {agents.map(a => (
              <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
                <Input className="col-span-4" defaultValue={a.name} placeholder="Name" onBlur={e => onAgentSave({ id: a.id, name: e.target.value })} />
                <Input className="col-span-3" defaultValue={a.role ?? ''} placeholder="Role" onBlur={e => onAgentSave({ id: a.id, role: e.target.value })} />
                <Input className="col-span-4" defaultValue={a.phone_e164} placeholder="+1…" onBlur={e => onAgentSave({ id: a.id, phone_e164: e.target.value })} />
                <Button variant="ghost" size="icon" className="col-span-1" onClick={() => onAgentDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onAgentSave({ name: 'New agent', phone_e164: '+10000000000', is_active: true, priority: 0 })}>
              <Plus className="h-4 w-4" /> Add agent
            </Button>
          </Card>

          <Card className="p-3 space-y-2 bg-card/60">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" /> Branding</div>
            <Toggle label="Hide “Powered by Aireatro”" value={!!draft.hideBranding} onChange={v => patch({ hideBranding: v })} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
