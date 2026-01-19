import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  FileText,
  Wand2,
  BookOpen,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  helpSlug: string;
  isNew?: boolean;
}

const newFeatures: Feature[] = [
  {
    id: 'auto-form-rules',
    title: 'Auto-Form Rules',
    description: 'Automatically send WhatsApp forms based on intent, keywords, or ad clicks',
    icon: FileText,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    helpSlug: 'auto-form-rules-guide',
    isNew: true,
  },
  {
    id: 'ai-template-validator',
    title: 'AI Template Validator',
    description: 'Get approval score, category detection, and fix suggestions before submitting',
    icon: Wand2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    helpSlug: 'template-management-advanced',
    isNew: true,
  },
  {
    id: 'template-status-timeline',
    title: 'Template Status Timeline',
    description: 'Track your template through the Meta approval process in real-time',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    helpSlug: 'templates-guide',
    isNew: true,
  },
];

interface WhatsNewPanelProps {
  className?: string;
  onDismiss?: () => void;
}

export function WhatsNewPanel({ className, onDismiss }: WhatsNewPanelProps) {
  return (
    <Card className={cn(
      "bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30",
      "border-violet-200/50 dark:border-violet-800/50",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            What's New
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-violet-600 hover:text-violet-700 hover:bg-violet-100">
              <Link to="/help">
                <BookOpen className="w-4 h-4 mr-1" />
                All Guides
              </Link>
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {newFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.id}
                to={`/help/${feature.helpSlug}`}
                className="group p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-transparent hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", feature.bgColor)}>
                    <Icon className={cn("w-5 h-5", feature.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{feature.title}</p>
                      {feature.isNew && (
                        <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] px-1.5 py-0 border-0">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-2 text-xs text-violet-600 group-hover:text-violet-700">
                  Learn more
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}