import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Send, 
  Crown,
  Briefcase,
  HeadphonesIcon,
  AlertTriangle,
  HelpCircle,
  Flame,
  Ban,
} from 'lucide-react';
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
  sales: { icon: Briefcase, label: 'Sales', color: 'text-emerald-500' },
  support: { icon: HeadphonesIcon, label: 'Support', color: 'text-blue-500' },
  complaint: { icon: AlertTriangle, label: 'Complaint', color: 'text-red-500' },
  inquiry: { icon: HelpCircle, label: 'Inquiry', color: 'text-purple-500' },
  urgent: { icon: Flame, label: 'Urgent', color: 'text-orange-500' },
  spam: { icon: Ban, label: 'Spam', color: 'text-gray-500' },
};

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; color: string; bg: string }> = {
  positive: { label: '😊 Positive', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  neutral: { label: '😐 Neutral', color: 'text-blue-600', bg: 'bg-blue-100' },
  negative: { label: '😟 Negative', color: 'text-red-600', bg: 'bg-red-100' },
};

const HEALTH_CONFIG: Record<Health, { label: string; color: string; bg: string }> = {
  good: { label: 'Healthy', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  warning: { label: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-100' },
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' },
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

  // Fetch on mount and when messages change
  useEffect(() => {
    if (messages.length > 0) {
      fetchAnalysis();
    }
  }, [messages.length, tone]);

  if (!isPro) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI Reply Suggestions</span>
              <Badge variant="secondary" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IntentIcon = analysis?.intent ? INTENT_CONFIG[analysis.intent].icon : HelpCircle;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="py-3">
        {/* Header with Intent, Sentiment, Health */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Assist</span>
            </div>
            
            {analysis && !loading && (
              <>
                {/* Intent */}
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <IntentIcon className={`w-3 h-3 ${INTENT_CONFIG[analysis.intent].color}`} />
                      {INTENT_CONFIG[analysis.intent].label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Customer Intent</TooltipContent>
                </Tooltip>

                {/* Sentiment */}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${SENTIMENT_CONFIG[analysis.sentiment].color} ${SENTIMENT_CONFIG[analysis.sentiment].bg} border-0`}
                >
                  {SENTIMENT_CONFIG[analysis.sentiment].label}
                </Badge>

                {/* Health */}
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${HEALTH_CONFIG[analysis.health].color} ${HEALTH_CONFIG[analysis.health].bg} border-0`}
                    >
                      {HEALTH_CONFIG[analysis.health].label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{analysis.health_reason}</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tone Selector */}
            <div className="flex rounded-lg border overflow-hidden">
              {(['professional', 'friendly', 'sales'] as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2 py-1 text-xs capitalize transition-colors ${
                    tone === t 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={fetchAnalysis}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : analysis?.suggestions ? (
          <div className="space-y-1.5">
            {analysis.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 hover:border-primary/30 transition-colors text-left group"
              >
                <span className="text-sm flex-1 line-clamp-1">{suggestion}</span>
                <Send className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-2">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
