import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  RefreshCw,
  Wand2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationIssue {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
}

interface ValidationResult {
  predictedCategory: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  issues: ValidationIssue[];
  suggestions: {
    suggestedRewrite?: string;
    suggestedExamples?: Record<string, string>;
    recommendedButtons?: Array<{ type: string; text: string }>;
    categoryAdvice?: string;
  };
}

interface AIValidationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateData: {
    workspaceId: string;
    templateId?: string;
    templateVersionId?: string;
    selectedCategory: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
    language: string;
    body: string;
    header?: { type?: string; text?: string };
    footer?: string;
    buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }>;
    exampleValues?: Record<string, string>;
  };
  onApplyFix?: (fix: 'examples' | 'rewrite' | 'category', data: any) => void;
}

const riskColors: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-destructive',
};

const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export function AIValidationDrawer({
  open,
  onOpenChange,
  templateData,
  onApplyFix,
}: AIValidationDrawerProps) {
  const [validating, setValidating] = useState(false);
  const [applyingFix, setApplyingFix] = useState<string | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);

  async function runValidation() {
    setValidating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('template-validate', {
        body: templateData,
      });

      if (error) throw error;

      if (data.ok) {
        setResult(data);
      } else {
        toast.error(data.error || 'Validation failed');
      }
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Failed to validate template');
    } finally {
      setValidating(false);
    }
  }

  async function handleApplyFix(fixType: 'examples' | 'rewrite' | 'category') {
    if (!result || !onApplyFix) return;

    setApplyingFix(fixType);

    try {
      if (fixType === 'examples' && result.suggestions.suggestedExamples) {
        onApplyFix('examples', result.suggestions.suggestedExamples);
        toast.success('Example values applied');
      } else if (fixType === 'rewrite' && result.suggestions.suggestedRewrite) {
        onApplyFix('rewrite', result.suggestions.suggestedRewrite);
        toast.success('Suggested rewrite applied');
      } else if (fixType === 'category') {
        onApplyFix('category', result.predictedCategory);
        toast.success(`Category changed to ${result.predictedCategory}`);
      }
    } finally {
      setApplyingFix(null);
    }
  }

  const errors = result?.issues.filter(i => i.severity === 'error') || [];
  const warnings = result?.issues.filter(i => i.severity === 'warning') || [];
  const infos = result?.issues.filter(i => i.severity === 'info') || [];

  const categoryMismatch = result && result.predictedCategory !== templateData.selectedCategory;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Template Validator
          </SheetTitle>
          <SheetDescription>
            Check your template for Meta approval readiness
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Validate Button */}
          {!result && (
            <div className="text-center py-8">
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                AI will analyze your template content, detect the best category, 
                and check for common rejection causes.
              </p>
              <Button onClick={runValidation} disabled={validating} size="lg">
                {validating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Validate with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results */}
          {result && (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-6 pr-4">
                {/* Score Card */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Approval Readiness</span>
                    <Badge variant="outline" className={`${riskColors[result.risk]} text-white border-0`}>
                      {result.risk} Risk
                    </Badge>
                  </div>
                  <Progress value={result.score} className="h-3" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Score: {result.score}/100</span>
                    <span>
                      {errors.length} errors, {warnings.length} warnings
                    </span>
                  </div>
                </div>

                {/* Category Detection */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Detected Category</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI analyzed your content
                      </p>
                    </div>
                    <Badge variant={categoryMismatch ? 'destructive' : 'default'}>
                      {result.predictedCategory}
                    </Badge>
                  </div>
                  
                  {categoryMismatch && (
                    <div className="mt-3 pt-3 border-t">
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Content looks like {result.predictedCategory} but you selected {templateData.selectedCategory}
                        </AlertDescription>
                      </Alert>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleApplyFix('category')}
                        disabled={applyingFix === 'category'}
                      >
                        {applyingFix === 'category' ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Switch to {result.predictedCategory}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Issues Accordion */}
                <Accordion type="multiple" defaultValue={['errors', 'warnings']}>
                  {errors.length > 0 && (
                    <AccordionItem value="errors">
                      <AccordionTrigger className="text-destructive">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Errors ({errors.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {errors.map((issue, idx) => (
                            <IssueCard key={idx} issue={issue} />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {warnings.length > 0 && (
                    <AccordionItem value="warnings">
                      <AccordionTrigger className="text-yellow-600">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Warnings ({warnings.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {warnings.map((issue, idx) => (
                            <IssueCard key={idx} issue={issue} />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {infos.length > 0 && (
                    <AccordionItem value="info">
                      <AccordionTrigger className="text-blue-500">
                        <span className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Tips ({infos.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {infos.map((issue, idx) => (
                            <IssueCard key={idx} issue={issue} />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                {/* Suggestions */}
                {(result.suggestions.suggestedExamples || result.suggestions.suggestedRewrite) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary" />
                        AI Suggestions
                      </h4>

                      {result.suggestions.suggestedExamples && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm font-medium mb-2">Suggested Example Values</p>
                          <div className="space-y-1 text-xs">
                            {Object.entries(result.suggestions.suggestedExamples).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{`{{${key}}}`}</span>
                                <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={() => handleApplyFix('examples')}
                            disabled={applyingFix === 'examples'}
                          >
                            {applyingFix === 'examples' ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Apply Examples
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* All Good State */}
                {errors.length === 0 && warnings.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="font-medium text-green-600">Looking Good!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your template is ready for submission
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <SheetFooter className="mt-4">
          {result && (
            <Button variant="outline" onClick={runValidation} disabled={validating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${validating ? 'animate-spin' : ''}`} />
              Re-validate
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function IssueCard({ issue }: { issue: ValidationIssue }) {
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg ${config.bg}`}>
      <div className="flex gap-2">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm">{issue.message}</p>
          {issue.fix && (
            <p className="text-xs text-muted-foreground mt-1">
              💡 {issue.fix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}