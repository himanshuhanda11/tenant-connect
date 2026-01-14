import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Briefcase, 
  HeadphonesIcon, 
  AlertTriangle, 
  HelpCircle, 
  Flame, 
  Ban,
  ThumbsUp,
  Meh,
  ThumbsDown,
} from 'lucide-react';

export type Intent = 'sales' | 'support' | 'complaint' | 'inquiry' | 'urgent' | 'spam';
export type Sentiment = 'positive' | 'neutral' | 'negative';

interface IntentBadgeProps {
  intent: Intent;
  className?: string;
}

interface SentimentBadgeProps {
  sentiment: Sentiment;
  className?: string;
}

const INTENT_CONFIG: Record<Intent, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  sales: { icon: Briefcase, label: 'Sales', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  support: { icon: HeadphonesIcon, label: 'Support', color: 'text-blue-600', bg: 'bg-blue-100' },
  complaint: { icon: AlertTriangle, label: 'Complaint', color: 'text-red-600', bg: 'bg-red-100' },
  inquiry: { icon: HelpCircle, label: 'Inquiry', color: 'text-purple-600', bg: 'bg-purple-100' },
  urgent: { icon: Flame, label: 'Urgent', color: 'text-orange-600', bg: 'bg-orange-100' },
  spam: { icon: Ban, label: 'Spam', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const SENTIMENT_CONFIG: Record<Sentiment, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  positive: { icon: ThumbsUp, label: 'Positive', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  neutral: { icon: Meh, label: 'Neutral', color: 'text-blue-600', bg: 'bg-blue-100' },
  negative: { icon: ThumbsDown, label: 'Negative', color: 'text-red-600', bg: 'bg-red-100' },
};

export function IntentBadge({ intent, className }: IntentBadgeProps) {
  const config = INTENT_CONFIG[intent];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`text-xs gap-1 ${config.color} ${config.bg} border-0 ${className}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>AI-detected intent: {config.label}</TooltipContent>
    </Tooltip>
  );
}

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentiment];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`text-xs gap-1 ${config.color} ${config.bg} border-0 ${className}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Customer sentiment: {config.label}</TooltipContent>
    </Tooltip>
  );
}
