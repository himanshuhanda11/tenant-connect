import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  Crown,
  Briefcase,
  HeadphonesIcon,
  AlertTriangle,
  HelpCircle,
  Flame,
  Ban,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InboxMessage } from '@/types/inbox';

type Intent = 'sales' | 'support' | 'complaint' | 'inquiry' | 'urgent' | 'spam';
type Sentiment = 'positive' | 'neutral' | 'negative';
type Health = 'good' | 'warning' | 'critical';
type Tone = 'professional' | 'friendly' | 'sales';

interface AIAnalysis {
  intent: Intent;
  sentiment: Sentiment;
  suggestions: string[];
  health: Health;
  health_reason: string;
}

interface AIReplySuggestionsProps {
  messages: InboxMessage[];
  onSelectSuggestion: (text: string) => void;
  isPro?: boolean;
}

const INTENT_CONFIG: Record<Intent, { icon: React.ElementType; label: string; color: string }> = {
  sales: { icon: Briefcase, label: 'Sales', color: 'text-emerald-600' },
  support: { icon: HeadphonesIcon, label: 'Support', color: 'text-blue-600' },
  complaint: { icon: AlertTriangle, label: 'Complaint', color: 'text-red-600' },
  inquiry: { icon: HelpCircle, label: 'Inquiry', color: 'text-violet-600' },
  urgent: { icon: Flame, label: 'Urgent', color: 'text-orange-600' },
  spam: { icon: Ban, label: 'Spam', color: 'text-muted-foreground' },
};

const SENTIMENT_CONFIG: Record<Sentiment, { emoji: string; label: string; color: string }> = {
  positive: { emoji: '😊', label: 'Positive', color: 'text-emerald-600' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-blue-600' },
  negative: { emoji: '😟', label: 'Negative', color: 'text-red-600' },
};

const HEALTH_CONFIG: Record<Health, { label: string; dotColor: string }> = {
  good: { label: 'Healthy', dotColor: 'bg-emerald-500' },
  warning: { label: 'At Risk', dotColor: 'bg-amber-500' },
  critical: { label: 'Critical', dotColor: 'bg-red-500' },
};

export function AIReplySuggestions({ 
  messages, 
  onSelectSuggestion, 
  isPro = true 
}: AIReplySuggestionsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>('professional');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!isPro || messages.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inbox-ai-assist', {
        body: { messages, tone },
      });

      if (fnError) throw fnError;
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      fetchAnalysis();
    }
  }, [messages.length, tone]);

  if (!isPro) {
    return (
      <div className="px-4 py-3 flex items-center gap-2 text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">AI Suggestions</span>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Crown className="w-3 h-3" />
          Pro
        </Badge>
      </div>
    );
  }

  const IntentIcon = analysis?.intent ? INTENT_CONFIG[analysis.intent].icon : HelpCircle;

  return (
    <div className="px-3 py-2.5 space-y-2">
      {/* Compact header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Analysis badges */}
          {analysis && !loading && (
            <>
              {/* Intent */}
              <Badge variant="outline" className="gap-1 text-[11px] shrink-0 rounded-md h-6 font-medium border-border/50">
                <IntentIcon className={cn("w-3 h-3", INTENT_CONFIG[analysis.intent].color)} />
                {INTENT_CONFIG[analysis.intent].label}
              </Badge>

              {/* Sentiment */}
              <Badge variant="outline" className="text-[11px] shrink-0 rounded-md h-6 font-medium border-border/50">
                <span className="mr-1">{SENTIMENT_CONFIG[analysis.sentiment].emoji}</span>
                {SENTIMENT_CONFIG[analysis.sentiment].label}
              </Badge>

              {/* Health */}
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1.5 text-[11px] shrink-0 rounded-md h-6 font-medium border-border/50">
                    <span className={cn("w-1.5 h-1.5 rounded-full", HEALTH_CONFIG[analysis.health].dotColor)} />
                    {HEALTH_CONFIG[analysis.health].label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{analysis.health_reason}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Tone pills */}
          <div className="flex rounded-full bg-muted/50 p-0.5">
            {(['professional', 'friendly', 'sales'] as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-medium rounded-full capitalize transition-all duration-200",
                  tone === t 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'professional' ? 'Pro' : t === 'friendly' ? 'Friendly' : 'Sales'}
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full"
            onClick={fetchAnalysis}
            disabled={loading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Suggestion cards */}
      {loading ? (
        <div className="space-y-1.5">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-4/5 rounded-xl" />
          <Skeleton className="h-10 w-11/12 rounded-xl" />
        </div>
      ) : analysis?.suggestions ? (
        <div className="space-y-1">
          {analysis.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
                "bg-card/80 border border-border/30 hover:border-primary/30 hover:bg-primary/5",
                "active:scale-[0.98]"
              )}
            >
              <span className="text-sm flex-1 line-clamp-1 text-foreground/90">{suggestion}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-muted-foreground text-center py-3">{error}</p>
      ) : null}
    </div>
  );
}
