import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { WidgetConfig } from '@/types/widget';

interface AiVariant {
  greeting: string;
  ctaText: string;
  prefilledMessage: string;
  angle: string;
}

interface Props {
  brandName?: string;
  onApply: (patch: Partial<WidgetConfig>) => void;
}

export function WidgetAiGreetings({ brandName, onApply }: Props) {
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState<'friendly' | 'professional' | 'playful' | 'urgent' | 'luxury'>('friendly');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<AiVariant[]>([]);
  const [appliedIdx, setAppliedIdx] = useState<number | null>(null);

  async function generate() {
    setLoading(true); setVariants([]); setAppliedIdx(null);
    try {
      const { data, error } = await supabase.functions.invoke('widget-ai-greeting', {
        body: { brandName, industry, audience, goal, tone, language, variants: 4 },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setVariants(((data as any)?.variants ?? []) as AiVariant[]);
    } catch (e: any) {
      toast({ title: 'AI greeting failed', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  }

  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-violet-500/5 via-card to-fuchsia-500/5 border-violet-500/20">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-500/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm">AI Greeting Generator</div>
          <div className="text-[11px] text-muted-foreground">High-converting variants tuned to your audience</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Industry</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="SaaS, real estate…" /></div>
        <div><Label className="text-xs">Audience</Label><Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Founders, students…" /></div>
        <div className="col-span-2"><Label className="text-xs">Goal</Label><Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Book a demo, capture lead…" /></div>
        <div>
          <Label className="text-xs">Tone</Label>
          <Select value={tone} onValueChange={(v: any) => setTone(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Language</Label><Input value={language} onChange={e => setLanguage(e.target.value)} /></div>
      </div>

      <Button
        onClick={generate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate variants with AI
      </Button>

      {variants.length > 0 && (
        <div className="space-y-2 pt-1">
          {variants.map((v, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/70 p-3 space-y-1.5 hover:border-violet-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">{v.angle}</span>
                <Button
                  size="sm"
                  variant={appliedIdx === i ? 'default' : 'outline'}
                  className={`h-7 text-xs gap-1 ${appliedIdx === i ? 'bg-emerald-500 text-white hover:bg-emerald-500' : ''}`}
                  onClick={() => {
                    onApply({ greeting: v.greeting, ctaText: v.ctaText, prefilledMessage: v.prefilledMessage });
                    setAppliedIdx(i);
                    toast({ title: 'Variant applied to widget' });
                  }}
                >
                  {appliedIdx === i ? <><Check className="h-3 w-3" /> Applied</> : 'Apply'}
                </Button>
              </div>
              <div className="text-sm leading-snug">{v.greeting}</div>
              <div className="text-[11px] text-muted-foreground"><b>CTA:</b> {v.ctaText}</div>
              <div className="text-[11px] text-muted-foreground"><b>Prefill:</b> {v.prefilledMessage}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
