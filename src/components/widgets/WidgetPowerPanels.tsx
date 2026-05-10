import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FlaskConical, AlertTriangle } from 'lucide-react';
import type { Widget, WidgetVariant, WidgetConfig } from '@/types/widget';

interface Props {
  widget: Widget;
  onChange: (variants: WidgetVariant[]) => void;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

export function WidgetVariants({ widget, onChange }: Props) {
  const variants = widget.variants ?? [];
  const totalPct = variants.filter(v => v.is_active !== false).reduce((s, v) => s + (v.traffic_pct || 0), 0);

  function update(id: string, patch: Partial<WidgetVariant>) {
    onChange(variants.map(v => v.id === id ? { ...v, ...patch } : v));
  }
  function remove(id: string) { onChange(variants.filter(v => v.id !== id)); }
  function add() {
    onChange([...variants, { id: uid(), name: `Variant ${String.fromCharCode(65 + variants.length)}`, traffic_pct: 50, is_active: true, config_overrides: {} }]);
  }

  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-amber-500/5 via-card to-orange-500/5 border-amber-500/20">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 grid place-items-center shadow">
          <FlaskConical className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">A/B Testing</div>
          <div className="text-[11px] text-muted-foreground">Split visitors between configurations to find the winner</div>
        </div>
        <Badge variant={totalPct === 100 ? 'default' : 'secondary'} className={totalPct === 100 ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : ''}>
          {totalPct}% allocated
        </Badge>
      </div>

      {totalPct !== 100 && variants.length > 0 && (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/10 rounded-md px-2 py-1.5">
          <AlertTriangle className="h-3 w-3" /> Active traffic must total exactly 100%. Remaining visitors fall back to control.
        </div>
      )}

      {variants.map(v => (
        <div key={v.id} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input className="h-8" value={v.name} onChange={e => update(v.id, { name: e.target.value })} />
            <Switch checked={v.is_active !== false} onCheckedChange={c => update(v.id, { is_active: c })} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div>
            <Label className="text-[10px]">Traffic share: {v.traffic_pct}%</Label>
            <Slider min={0} max={100} step={5} value={[v.traffic_pct]} onValueChange={([n]) => update(v.id, { traffic_pct: n })} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <Input className="h-8 text-xs" placeholder="Override greeting (optional)" value={v.config_overrides?.greeting ?? ''} onChange={e => update(v.id, { config_overrides: { ...v.config_overrides, greeting: e.target.value || undefined } })} />
            <Input className="h-8 text-xs" placeholder="Override CTA text (optional)" value={v.config_overrides?.ctaText ?? ''} onChange={e => update(v.id, { config_overrides: { ...v.config_overrides, ctaText: e.target.value || undefined } })} />
            <div className="flex gap-2 items-center">
              <Label className="text-[10px] shrink-0">Color</Label>
              <input type="color" className="h-8 w-12 rounded border border-border" value={v.config_overrides?.primaryColor || '#10B981'} onChange={e => update(v.id, { config_overrides: { ...v.config_overrides, primaryColor: e.target.value } })} />
              <Input className="h-8 flex-1 text-xs" value={v.config_overrides?.primaryColor ?? ''} placeholder="Override primary color" onChange={e => update(v.id, { config_overrides: { ...v.config_overrides, primaryColor: e.target.value || undefined } })} />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="gap-2 w-full" onClick={add}>
        <Plus className="h-4 w-4" /> Add variant
      </Button>
    </Card>
  );
}

export function WidgetGeoRules({ config, onChange }: { config: WidgetConfig; onChange: (patch: Partial<WidgetConfig>) => void }) {
  const rules = config.geoRules ?? [];
  function patch(id: string, p: any) { onChange({ geoRules: rules.map(r => r.id === id ? { ...r, ...p } : r) }); }
  function add() { onChange({ geoRules: [...rules, { id: uid(), countries: [], greeting: '', ctaText: '', prefilledMessage: '' }] }); }
  function remove(id: string) { onChange({ geoRules: rules.filter(r => r.id !== id) }); }
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-sky-500/5 via-card to-cyan-500/5 border-sky-500/20">
      <div>
        <div className="font-semibold text-sm">🌍 Geo-targeted greetings</div>
        <div className="text-[11px] text-muted-foreground">Show different copy based on visitor country (resolved by IP)</div>
      </div>
      {rules.map(r => (
        <div key={r.id} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input className="h-8 flex-1" placeholder="Country codes (e.g. IN,US,GB)" value={r.countries.join(',')} onChange={e => patch(r.id, { countries: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) })} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Textarea rows={2} placeholder="Localized greeting" value={r.greeting ?? ''} onChange={e => patch(r.id, { greeting: e.target.value })} />
          <Input className="h-8" placeholder="Localized CTA" value={r.ctaText ?? ''} onChange={e => patch(r.id, { ctaText: e.target.value })} />
          <Input className="h-8" placeholder="Localized pre-filled WhatsApp message" value={r.prefilledMessage ?? ''} onChange={e => patch(r.id, { prefilledMessage: e.target.value })} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={add}><Plus className="h-4 w-4" /> Add geo rule</Button>
    </Card>
  );
}

export function WidgetUtmRules({ config, onChange }: { config: WidgetConfig; onChange: (patch: Partial<WidgetConfig>) => void }) {
  const rules = config.utmRules ?? [];
  function patch(id: string, p: any) { onChange({ utmRules: rules.map(r => r.id === id ? { ...r, ...p } : r) }); }
  function add() { onChange({ utmRules: [...rules, { id: uid(), key: 'utm_source', match: '', greeting: '', ctaText: '', prefilledMessage: '' }] }); }
  function remove(id: string) { onChange({ utmRules: rules.filter(r => r.id !== id) }); }
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-pink-500/5 via-card to-rose-500/5 border-pink-500/20">
      <div>
        <div className="font-semibold text-sm">🎯 Dynamic UTM-based copy</div>
        <div className="text-[11px] text-muted-foreground">Personalize the welcome message based on the visitor’s ad/source</div>
      </div>
      {rules.map(r => (
        <div key={r.id} className="rounded-xl border border-border/60 bg-card/80 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <select value={r.key} onChange={e => patch(r.id, { key: e.target.value })} className="h-8 rounded-md border border-border bg-background px-2 text-xs">
              <option value="utm_source">utm_source</option>
              <option value="utm_medium">utm_medium</option>
              <option value="utm_campaign">utm_campaign</option>
              <option value="utm_term">utm_term</option>
              <option value="utm_content">utm_content</option>
            </select>
            <Input className="h-8 flex-1" placeholder="Contains (e.g. facebook, summer-sale)" value={r.match} onChange={e => patch(r.id, { match: e.target.value })} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Textarea rows={2} placeholder="Custom greeting for this source" value={r.greeting ?? ''} onChange={e => patch(r.id, { greeting: e.target.value })} />
          <Input className="h-8" placeholder="Custom CTA" value={r.ctaText ?? ''} onChange={e => patch(r.id, { ctaText: e.target.value })} />
          <Input className="h-8" placeholder="Custom WhatsApp pre-filled message" value={r.prefilledMessage ?? ''} onChange={e => patch(r.id, { prefilledMessage: e.target.value })} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={add}><Plus className="h-4 w-4" /> Add UTM rule</Button>
    </Card>
  );
}

export function WidgetCustomCss({ config, onChange }: { config: WidgetConfig; onChange: (patch: Partial<WidgetConfig>) => void }) {
  return (
    <Card className="p-4 space-y-2 bg-card/60">
      <div className="font-semibold text-sm">🎨 Custom CSS</div>
      <div className="text-[11px] text-muted-foreground">
        Advanced. Use the <code className="px-1 py-0.5 bg-muted rounded text-[10px]">.aireatro-widget</code> root selector. Sanitized — no @import or url().
      </div>
      <Textarea
        rows={8}
        className="font-mono text-xs"
        placeholder={`.aireatro-widget__bubble { box-shadow: 0 20px 60px -10px rgba(0,0,0,.4) !important; }\n.aireatro-widget__cta { letter-spacing: .03em; }`}
        value={config.customCss ?? ''}
        onChange={e => onChange({ customCss: e.target.value.slice(0, 8000) })}
      />
    </Card>
  );
}
