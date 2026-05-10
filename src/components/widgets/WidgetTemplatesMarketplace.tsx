import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WIDGET_TEMPLATES } from '@/data/widgetTemplates';
import type { WidgetConfig } from '@/types/widget';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onApply: (patch: Partial<WidgetConfig>) => void;
}

const CATEGORIES = ['all', 'ecommerce', 'saas', 'realestate', 'education', 'healthcare', 'agency', 'restaurant', 'fitness'] as const;

export function WidgetTemplatesMarketplace({ onApply }: Props) {
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('all');
  const list = cat === 'all' ? WIDGET_TEMPLATES : WIDGET_TEMPLATES.filter(t => t.category === cat);

  return (
    <Card className="p-4 space-y-3 bg-card/60">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-500" />
        <div className="font-semibold text-sm">Templates Marketplace</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize border transition-colors ${
              cat === c ? 'bg-emerald-500 text-white border-emerald-500' : 'border-border/50 text-muted-foreground hover:border-emerald-500/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {list.map(t => (
          <div key={t.id} className="rounded-xl border border-border/50 bg-card p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
            <div
              className="h-12 w-12 rounded-lg shrink-0 grid place-items-center text-white text-lg shadow"
              style={{ background: `linear-gradient(135deg, ${t.preview.primary}, ${t.preview.primary}cc)` }}
            >
              💬
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{t.name}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-1">{t.tagline}</div>
              <Badge variant="secondary" className="mt-1 text-[9px] capitalize">{t.category}</Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApply(t.config)}
            >Use</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
