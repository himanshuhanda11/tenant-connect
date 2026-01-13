import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lightbulb, RefreshCw, Wand2 } from 'lucide-react';
import { getSuggestedFix } from '@/lib/templateLinter';

interface RejectionFixAssistantProps {
  rejectionReason: string;
  onCreateFixVersion: () => void;
}

export function RejectionFixAssistant({
  rejectionReason,
  onCreateFixVersion
}: RejectionFixAssistantProps) {
  const suggestedFix = getSuggestedFix(rejectionReason);

  // Parse common rejection codes
  const getRejectionCategory = (reason: string): { category: string; description: string } => {
    const reasonUpper = reason.toUpperCase();
    
    if (reasonUpper.includes('PARAM') || reasonUpper.includes('VARIABLE')) {
      return {
        category: 'Variable Error',
        description: 'Issues with template variables ({{1}}, {{2}}, etc.)'
      };
    }
    if (reasonUpper.includes('LENGTH') || reasonUpper.includes('CHARACTER')) {
      return {
        category: 'Length Limit',
        description: 'Text exceeds maximum character limits'
      };
    }
    if (reasonUpper.includes('FORMAT') || reasonUpper.includes('STRUCTURE')) {
      return {
        category: 'Format Error',
        description: 'Template structure doesn\'t match Meta requirements'
      };
    }
    if (reasonUpper.includes('CONTENT') || reasonUpper.includes('BODY')) {
      return {
        category: 'Content Policy',
        description: 'Message content violates WhatsApp policies'
      };
    }
    if (reasonUpper.includes('URL') || reasonUpper.includes('DOMAIN')) {
      return {
        category: 'URL Issue',
        description: 'Button URL or domain mismatch'
      };
    }
    if (reasonUpper.includes('LANGUAGE')) {
      return {
        category: 'Language Issue',
        description: 'Template language inconsistency detected'
      };
    }
    if (reasonUpper.includes('CATEGORY')) {
      return {
        category: 'Category Mismatch',
        description: 'Content doesn\'t match selected category'
      };
    }
    
    return {
      category: 'Rejection',
      description: 'Template was rejected by Meta'
    };
  };

  const { category, description } = getRejectionCategory(rejectionReason);

  return (
    <Card className="border-destructive/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Template Rejected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rejection Category */}
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{category}</Badge>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>

        {/* Rejection Reason */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Meta's Rejection Reason</AlertTitle>
          <AlertDescription className="mt-2">
            {rejectionReason}
          </AlertDescription>
        </Alert>

        {/* Suggested Fix */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Likely Cause & Suggested Fix</h4>
              <p className="text-sm text-amber-800 mt-1">
                {suggestedFix}
              </p>
            </div>
          </div>
        </div>

        {/* Common Fixes Checklist */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Quick Fix Checklist:</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Check all variables are sequential
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Verify body is under 1024 characters
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Ensure header text is under 60 characters
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Check button URLs use HTTPS
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Verify template matches selected category
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Remove promotional words from Utility templates
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={onCreateFixVersion} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Create Fix Version
          </Button>
          <Button variant="outline" className="flex-1">
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-Suggest Rewrite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
