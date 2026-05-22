import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, X, Clock, QrCode, Tag as TagIcon, Globe, Brain, Facebook, Search,
  CalendarClock, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQrCampaigns } from '@/hooks/useQrCampaigns';
import { useTags } from '@/hooks/useTags';
import type { FormRuleTriggerType, FormRuleTriggerConfig } from '@/types/formRule';

interface Props {
  triggerType: FormRuleTriggerType;
  config: FormRuleTriggerConfig;
  onChange: (next: FormRuleTriggerConfig) => void;
}

const PANEL = 'p-4 rounded-xl border bg-muted/30 mt-4 space-y-3';

export function TriggerConfigPanel({ triggerType, config, onChange }: Props) {
  const update = (patch: Partial<FormRuleTriggerConfig>) => onChange({ ...config, ...patch });

  if (triggerType === 'first_message') {
    return (
      <div className={cn(PANEL, 'flex items-start gap-3')}>
        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          No extra setup needed. The form is sent the first time a new contact messages your WhatsApp number.
        </div>
      </div>
    );
  }

  if (triggerType === 'keyword') return <KeywordConfig config={config} update={update} />;
  if (triggerType === 'qr_scan') return <QrScanConfig config={config} update={update} />;
  if (triggerType === 'tag_added') return <TagAddedConfig config={config} update={update} />;
  if (triggerType === 'source') return <SourceConfig config={config} update={update} />;
  if (triggerType === 'scheduled') return <ScheduledConfig config={config} update={update} />;
  if (triggerType === 'ai_intent') return <AiIntentConfig config={config} update={update} />;
  if (triggerType === 'ad_click') return <AdClickConfig config={config} update={update} />;
  return null;
}

/* ------------------------- KEYWORD ------------------------- */
function KeywordConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  const [input, setInput] = React.useState('');
  const keywords = config.keywords || [];
  const add = () => {
    const v = input.trim().toLowerCase();
    if (v && !keywords.includes(v)) update({ keywords: [...keywords, v] });
    setInput('');
  };
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-purple-600" />
        <Label className="text-sm font-semibold">Keywords</Label>
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Type keyword and press Enter (e.g. price, demo)"
          className="h-9"
        />
        <Button type="button" size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map(k => (
            <Badge key={k} variant="secondary" className="gap-1.5">
              {k}
              <button onClick={() => update({ keywords: keywords.filter(x => x !== k) })} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Match type</Label>
        <Select value={config.match_type || 'contains'} onValueChange={(v) => update({ match_type: v as any })}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="exact">Exact match</SelectItem>
            <SelectItem value="starts_with">Starts with</SelectItem>
            <SelectItem value="regex">Regex (advanced)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ------------------------- QR SCAN ------------------------- */
function QrScanConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  const { list } = useQrCampaigns();
  const campaigns = list.data || [];
  const selected = campaigns.find(c => c.id === config.qr_campaign_id);
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-green-600" />
        <Label className="text-sm font-semibold">QR Campaign</Label>
      </div>
      {list.isLoading ? (
        <div className="text-xs text-muted-foreground">Loading QR campaigns…</div>
      ) : campaigns.length === 0 ? (
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-background border border-dashed">
          No QR campaigns yet. Create one in <a className="underline text-primary" href="/qr-campaigns" target="_blank">QR Campaigns</a>, then come back here.
        </div>
      ) : (
        <>
          <Select value={config.qr_campaign_id || ''} onValueChange={(v) => update({ qr_campaign_id: v })}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Pick a QR campaign…" /></SelectTrigger>
            <SelectContent>
              {campaigns.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.campaign_name} <span className="text-muted-foreground ml-1 text-xs">/{c.slug}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <div className="text-xs text-muted-foreground">
              Triggers when a contact scans <strong>{selected.campaign_name}</strong> ({selected.scan_count} scans so far).
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------- TAG ADDED ------------------------- */
function TagAddedConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  const { tags, loading } = useTags();
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <TagIcon className="w-4 h-4 text-pink-600" />
        <Label className="text-sm font-semibold">Tag</Label>
      </div>
      {loading ? (
        <div className="text-xs text-muted-foreground">Loading tags…</div>
      ) : tags.length === 0 ? (
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-background border border-dashed">
          No tags yet. Create one in <a className="underline text-primary" href="/tags" target="_blank">Tags</a>.
        </div>
      ) : (
        <Select
          value={config.tag_id || ''}
          onValueChange={(v) => {
            const t = tags.find(x => x.id === v);
            update({ tag_id: v, tag_name: t?.name });
          }}
        >
          <SelectTrigger className="h-10"><SelectValue placeholder="Pick a tag…" /></SelectTrigger>
          <SelectContent>
            {tags.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/* ------------------------- SOURCE ------------------------- */
const SOURCE_OPTIONS = [
  { value: 'meta_ads', label: 'Meta Ads (CTWA)' },
  { value: 'qr_code', label: 'QR Code' },
  { value: 'website', label: 'Website Widget' },
  { value: 'organic', label: 'Organic / Direct' },
  { value: 'referral', label: 'Referral' },
  { value: 'api', label: 'API / External' },
  { value: 'import', label: 'Imported Contact' },
];
function SourceConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  const selected = new Set(config.sources || []);
  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    update({ sources: Array.from(next) });
  };
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-amber-600" />
        <Label className="text-sm font-semibold">Pick one or more sources</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SOURCE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              'p-2.5 rounded-lg border text-sm text-left transition-all',
              selected.has(opt.value) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- SCHEDULED ------------------------- */
function ScheduledConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  const mode = config.schedule_mode || 'delay';
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-orange-600" />
        <Label className="text-sm font-semibold">When to send</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => update({ schedule_mode: 'delay' })}
          className={cn(
            'p-3 rounded-lg border text-left text-sm transition-all',
            mode === 'delay' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300' : 'border-border hover:border-orange-300',
          )}
        >
          <div className="font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> After delay</div>
          <div className="text-[11px] text-muted-foreground mt-1">Send X minutes/hours/days after the contact was created</div>
        </button>
        <button
          type="button"
          onClick={() => update({ schedule_mode: 'recurring' })}
          className={cn(
            'p-3 rounded-lg border text-left text-sm transition-all',
            mode === 'recurring' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300' : 'border-border hover:border-orange-300',
          )}
        >
          <div className="font-semibold flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Recurring</div>
          <div className="text-[11px] text-muted-foreground mt-1">Run on a recurring schedule (cron-style)</div>
        </button>
      </div>

      {mode === 'delay' ? (
        <div className="grid grid-cols-[1fr_1.2fr] gap-2 items-end">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Value</Label>
            <Input
              type="number"
              min={1}
              value={config.delay_value ?? 15}
              onChange={(e) => update({ delay_value: Math.max(1, Number(e.target.value) || 1) })}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Unit</Label>
            <Select value={config.delay_unit || 'minutes'} onValueChange={(v) => update({ delay_unit: v as any })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 text-[11px] text-muted-foreground">
            Form will be sent {config.delay_value ?? 15} {config.delay_unit || 'minutes'} after the contact lands in your CRM.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Cron expression</Label>
          <Input
            value={config.schedule_cron || ''}
            onChange={(e) => update({ schedule_cron: e.target.value })}
            placeholder="0 10 * * 1   (every Monday at 10:00)"
            className="h-10 font-mono text-sm"
          />
          <p className="text-[11px] text-muted-foreground">Uses your workspace timezone.</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------- AI INTENT ------------------------- */
function AiIntentConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-violet-600" />
        <Label className="text-sm font-semibold">AI Intent</Label>
      </div>
      <Select value={config.intent || ''} onValueChange={(v) => update({ intent: v })}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Select intent to detect" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="purchase_intent">Purchase Intent</SelectItem>
          <SelectItem value="support_request">Support Request</SelectItem>
          <SelectItem value="pricing_inquiry">Pricing Inquiry</SelectItem>
          <SelectItem value="product_info">Product Information</SelectItem>
          <SelectItem value="complaint">Complaint</SelectItem>
          <SelectItem value="feedback">Feedback</SelectItem>
          <SelectItem value="custom">Custom (define below)</SelectItem>
        </SelectContent>
      </Select>
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Sample messages (one per line)</Label>
        <Textarea
          value={(config.sample_utterances || []).join('\n')}
          onChange={(e) => update({ sample_utterances: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
          placeholder={'how much does it cost?\nis there a discount?\npricing please'}
          className="h-20 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          Confidence threshold: {((config.confidence_threshold ?? 0.7) * 100).toFixed(0)}%
        </Label>
        <input
          type="range"
          min={0.3}
          max={1}
          step={0.05}
          value={config.confidence_threshold ?? 0.7}
          onChange={(e) => update({ confidence_threshold: Number(e.target.value) })}
          className="w-full accent-violet-600"
        />
      </div>
    </div>
  );
}

/* ------------------------- AD CLICK ------------------------- */
function AdClickConfig({ config, update }: { config: FormRuleTriggerConfig; update: (p: Partial<FormRuleTriggerConfig>) => void }) {
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-2">
        <Facebook className="w-4 h-4 text-indigo-600" />
        <Label className="text-sm font-semibold">Meta Ads filter (optional)</Label>
      </div>
      <Input
        value={config.ad_account_id || ''}
        onChange={(e) => update({ ad_account_id: e.target.value })}
        placeholder="Ad account ID (leave empty for all)"
        className="h-10"
      />
      <Input
        value={(config.campaign_ids || []).join(',')}
        onChange={(e) => update({ campaign_ids: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        placeholder="Campaign IDs (comma-separated, optional)"
        className="h-10"
      />
      <p className="text-[11px] text-muted-foreground">
        Leave blank to trigger on any Click-to-WhatsApp ad click.
      </p>
    </div>
  );
}

export function isTriggerConfigValid(triggerType: FormRuleTriggerType, config: FormRuleTriggerConfig): boolean {
  switch (triggerType) {
    case 'first_message': return true;
    case 'keyword': return (config.keywords?.length || 0) > 0;
    case 'qr_scan': return !!config.qr_campaign_id;
    case 'tag_added': return !!config.tag_id;
    case 'source': return (config.sources?.length || 0) > 0;
    case 'scheduled':
      if ((config.schedule_mode || 'delay') === 'delay') return (config.delay_value || 0) > 0;
      return !!config.schedule_cron;
    case 'ai_intent': return !!config.intent;
    case 'ad_click': return true;
    default: return true;
  }
}
