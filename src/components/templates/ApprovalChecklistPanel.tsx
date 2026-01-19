import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Tag,
  Variable,
  Link2,
  Languages,
  Shield,
  RefreshCw,
  Loader2,
  ChevronRight,
  Lightbulb,
  Zap,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  status: 'pass' | 'warn' | 'fail';
  items: string[];
}

export interface ValidationResult {
  score: number;
  predictedCategory: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  categoryConfidence: number;
  categoryMismatch: boolean;
  risk: 'low' | 'medium' | 'high';
  issues: Array<{
    category: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
    suggestion?: string;
  }>;
  suggestedRewrite?: string;
  suggestedExamples?: Record<string, string>;
  recommendedButtons?: Array<{ type: string; text: string }>;
  checklist: {
    categoryIntent: ChecklistItem;
    variablesExamples: ChecklistItem;
    linksButtons: ChecklistItem;
    languageFormatting: ChecklistItem;
    complianceRisk: ChecklistItem;
  };
}

interface ApprovalChecklistPanelProps {
  validation: ValidationResult | null;
  isValidating: boolean;
  onValidate: () => void;
  onFixWithAI: () => void;
  onApplySuggestion?: (suggestion: string) => void;
  onSwitchCategory?: (category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION') => void;
  currentCategory: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  className?: string;
  isMobile?: boolean;
}

const checklistConfig = [
  { key: 'categoryIntent', label: 'Category & Intent', icon: Tag },
  { key: 'variablesExamples', label: 'Variables & Examples', icon: Variable },
  { key: 'linksButtons', label: 'Links & Buttons', icon: Link2 },
  { key: 'languageFormatting', label: 'Language & Formatting', icon: Languages },
  { key: 'complianceRisk', label: 'Compliance & Risk', icon: Shield },
] as const;

const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusColor = (status: 'pass' | 'warn' | 'fail') => {
  switch (status) {
    case 'pass':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warn':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'fail':
      return 'text-red-600 bg-red-50 border-red-200';
  }
};

const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
  switch (risk) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-amber-500';
    case 'high':
      return 'bg-red-500';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

function ChecklistContent({
  validation,
  isValidating,
  onValidate,
  onFixWithAI,
  onApplySuggestion,
  onSwitchCategory,
  currentCategory,
}: ApprovalChecklistPanelProps) {
  if (!validation && !isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Brain className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-semibold text-base mb-1">AI Template Validator</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Get AI-powered feedback to improve your template's Meta approval chances
        </p>
        <Button onClick={onValidate} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Validate with AI
        </Button>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Analyzing template...</p>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Approval Readiness</span>
          </div>
          <span className={cn("text-2xl font-bold", getScoreColor(validation.score))}>
            {validation.score}%
          </span>
        </div>
        <Progress value={validation.score} className="h-2" />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Risk Level</span>
          <Badge variant="outline" className={cn("text-xs", getRiskColor(validation.risk), "text-white border-0")}>
            {validation.risk.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Category Detection Alert */}
      {validation.categoryMismatch && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex flex-col gap-2">
              <span className="text-sm">
                AI detected this looks like a <strong>{validation.predictedCategory}</strong> template
                (confidence: {Math.round(validation.categoryConfidence * 100)}%)
              </span>
              {onSwitchCategory && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-fit text-amber-700 border-amber-300 hover:bg-amber-100"
                  onClick={() => onSwitchCategory(validation.predictedCategory)}
                >
                  Switch to {validation.predictedCategory}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist Accordion */}
      <Accordion type="multiple" defaultValue={['categoryIntent']} className="space-y-2">
        {checklistConfig.map(({ key, label, icon: Icon }) => {
          const item = validation.checklist[key];
          return (
            <AccordionItem key={key} value={key} className="border rounded-lg px-3">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                    getStatusColor(item.status)
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {getStatusIcon(item.status)}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                {item.items.length > 0 ? (
                  <ul className="space-y-2 pl-11">
                    {item.items.map((message, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-1 shrink-0" />
                        {message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 pl-11">✓ All checks passed</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Suggested Rewrite */}
      {validation.suggestedRewrite && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <Zap className="h-4 w-4" />
              Suggested Rewrite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{validation.suggestedRewrite}</p>
            {onApplySuggestion && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300"
                onClick={() => onApplySuggestion(validation.suggestedRewrite!)}
              >
                Apply Suggestion
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={onFixWithAI} variant="default" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Fix with AI
        </Button>
        <Button onClick={onValidate} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Re-validate
        </Button>
      </div>
    </div>
  );
}

export function ApprovalChecklistPanel(props: ApprovalChecklistPanelProps) {
  const { isMobile = false, className } = props;

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            Approval Checklist
            {props.validation && (
              <Badge variant={props.validation.score >= 80 ? 'default' : 'destructive'} className="ml-1">
                {props.validation.score}%
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Approval Checklist</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-80px)]">
            <ChecklistContent {...props} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Approval Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[calc(100vh-300px)]">
          <ChecklistContent {...props} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
