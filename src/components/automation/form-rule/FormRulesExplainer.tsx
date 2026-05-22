import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, Zap, Search, FileText, Shield, Check, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Zap,
    title: 'WHEN — the trigger',
    color: 'text-amber-600 bg-amber-500/10',
    body: 'Picks the event that starts the rule. First message, a keyword in chat, a Click-to-WhatsApp ad, a QR scan, a tag being added, a specific traffic source, a scheduled time, or AI detecting a user intent.',
  },
  {
    icon: Search,
    title: 'IF — the filter',
    color: 'text-purple-600 bg-purple-500/10',
    body: 'Optional checks the contact must pass before the form is sent. Examples: "only if they have the VIP tag", "only if they came from Meta Ads", "only if opted-in". Combine with AND / OR.',
  },
  {
    icon: FileText,
    title: 'THEN — the form',
    color: 'text-primary bg-primary/10',
    body: 'The WhatsApp template / form that gets delivered. You can pick an approved template or build a custom form with your own fields. Add an intro message and a small natural delay if you want.',
  },
  {
    icon: Shield,
    title: 'GUARD — safety limits',
    color: 'text-green-600 bg-green-500/10',
    body: 'Stops you from spamming contacts. Cooldown between sends, max sends per day, once-per-user, business-hours only, and an auto-stop when a human agent jumps in.',
  },
  {
    icon: Check,
    title: 'SAVE — review & go live',
    color: 'text-blue-600 bg-blue-500/10',
    body: 'Final summary, name your rule, flip Active on. The rule starts running immediately for every matching event.',
  },
];

export function FormRulesExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm">How Form Rules work</div>
            <div className="text-[11px] text-muted-foreground">5 steps — click to expand</div>
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-2.5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-3 rounded-xl border bg-background/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', s.color)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-sm font-semibold">{s.title}</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
